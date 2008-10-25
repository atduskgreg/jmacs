function _ajax_request(url, data, callback, type, method) {
	if (jQuery.isFunction(data)) {
	    callback = data;
	    data = {};
	}
	return jQuery.ajax({
		type: method,
		url: url,
		data: data,
		success: callback,
		dataType: type
	});
}

jQuery.extend({
	put: function(url, data, callback, type) {
		return _ajax_request(url, data, callback, type, 'PUT');
	},
	delete_: function(url, data, callback, type) {
		return _ajax_request(url, data, callback, type, 'DELETE');
	}
});

var Document = function(path, pwd) {
	this.path = path;
	this.pwd = pwd;
	
	var thisDoc = this;
	
	this.get = function(callback){
		$.getJSON("http://localhost:9999/documents/"+ encodeURIComponent(this.path).replace(".", "\\056") +".json?pwd="+pwd+"&callback=?", function(data){
			thisDoc.path = data.path;
			thisDoc.content = data.content;
			thisDoc.modified = data.modified;
			if( callback )
				callback(thisDoc);
		})
	};
	
	this.update = function(callback){
		$.put("http://localhost:9999/documents/"+ encodeURIComponent(this.path).replace(".", "\\056")+"?callback=?", {content : thisDoc.content}, function(data){
			callback(data);
		}, "json");
	};
	
	this.create = function(callback){
		$.post("http://localhost:9999/documents?id="+ encodeURIComponent(this.path).replace(".", "\\056")+"&callback=?", {content : thisDoc.content}, function(data){
			callback(data);
		}, "json");	
	}
	
};

var Area = function(textarea){
	this.textarea = textarea;
	var thisArea = this;
	
	this.loadDocument = function(doc){
		doc.get(function(){
			thisArea.document = doc;
			thisArea.textarea.attr('value', doc.content);
		});
	};
	
	this.saveDocument = function(){
		thisArea.document.content = thisArea.textarea.attr('value');
		thisArea.document.update(function(){
			jMacs.flash('saved ' + thisArea.document.path);
		});
	};
	
	this.createDocument = function(){
		thisArea.document.content = thisArea.textarea.attr('value');
		thisArea.document.create(function(){
			jMacs.flash('created ' + thisArea.document.path);
		})
	}
}

var Command = function(name, hotkey, callback, arity){
	this.name = name;
	this.hotkey = hotkey;
	this.callback = callback;
	this.arity = arity;
	
	var thisComand = this;
	this.invoke = function(args){
		thisComand.callback(args);
		$("#control").unbind('keydown', 'return');
		return false;
	};
	jMacs.registerCommand(this);
}

AreaManager = {
	openAreas : [],
	currentArea : null,
	splitArea : function(area, isVertical, dontMoveFocus){
		var newArea = new Area($('<textarea class="edit"></textarea>'));
		
		
		newArea.splitFrom = area;
		newArea.splitFromPreviousDimensions = { 
			width : Help.percentWidth(area.textarea), 
			height : Help.percentHeight(area.textarea)
		}
				
		AreaManager.openAreas.push(newArea);
		area.textarea.after(newArea.textarea);
		
		// resize areas
		if(isVertical){
	    var widthPercentage = Help.percentWidth(area.textarea);
	    var newWidth = widthPercentage / 2;
	    area.textarea.css('width', newWidth + '%');
	    newArea.textarea.css('width', (newWidth - 1) + '%');
	    newArea.textarea.css('height', Help.percentHeight(area.textarea) + '%');
	  } else {
	    var newHeight = Help.percentHeight(area.textarea) / 2;
	    area.textarea.css('height', newHeight + '%');
	    newArea.textarea.css('height', newHeight + '%');
	    newArea.textarea.css('width', Help.percentWidth(area.textarea) + '%');
	  }
	
		if (!dontMoveFocus){
			AreaManager.currentArea = newArea;
			AreaManager.currentArea.textarea.focus();
		}
	},
	cycleCurrentArea : function(){
		var currentAreaIndex = AreaManager.openAreas.indexOf(AreaManager.currentArea);
		if (currentAreaIndex == (AreaManager.openAreas.length - 1))
			AreaManager.currentArea = AreaManager.openAreas[0];
		else
			AreaManager.currentArea = AreaManager.openAreas[currentAreaIndex + 1];
			
		AreaManager.currentArea.textarea.focus();
	},
	// assuming there's only one...
	findArea : function(textarea){
		var match = null;
		for (i = 0; i < AreaManager.openAreas.length; i++){
			if (AreaManager.openAreas[i].textarea[0] == textarea[0])
				match = AreaManager.openAreas[i];
		}
		
		return match;	
	},
	
	// TODO: move Area (Document?) to a recently-closed stack
	closeArea : function(area){
	// what if the currentArea is the only one open?
		if (AreaManager.openAreas.length == 1){
			AreaManager.newFirstArea(); 
		} else {
			if (area.textarea[0] == AreaManager.currentArea.textarea[0])
				AreaManager.cycleCurrentArea();
    	
			area.splitFrom.textarea.css('height', area.splitFromPreviousDimensions.height + '%');
			area.splitFrom.textarea.css('width', area.splitFromPreviousDimensions.width + '%');
		}
		
		AreaManager.openAreas.pop(area);
		area.textarea.remove();
		
	
	},
	newFirstArea : function(){
		 a = new Area($("<textarea class='edit'></textarea"));
	   $("#control").after(a.textarea);
	   AreaManager.openAreas.push(a);
	   AreaManager.currentArea = a;
	   a.textarea.focus();
	}
}


jMacs = {
	flash : function(message){
		$('#control').attr('value', message);
		setTimeout("$('#control').attr('value', '')", 1000);
	},
	
	promptFor : function(promptText, callback){
		$("#control").attr('value', promptText + ' ');
		$("#control").focus();
		$("#control").bind('keydown', 'return', function (){

			prompt = $("#control").attr('value').split(' ')[0];
			var cleanPromptText = prompt.replace(/\?/, '\\?')
																			.replace(/\(/, '\\(')
																			.replace(/\)/, '\\)')


	  	var promptRegexp = '^' + cleanPromptText + ' ';
			var r = new RegExp(promptRegexp);
			
			console.log("begin promptFor:");
			console.log($("#control").attr('value'));
			console.log(prompt);
			console.log(r);

			var response = $("#control").attr('value').replace(r, '');
			
			
			console.log("response:");
			console.log(response);

			// callback gets stuck as whichever one we call first
			callback(response);
			$("#control").attr('value', '');
 			return false; 
 		});
	},
	// TODO: this should also do something so that the control line works directly
	// instead of just through hotkeys
	registerCommand : function(command){
		$(document).bind('keydown', command.hotkey, function(e){

    	if(command.arity){
				jMacs.promptFor( command.name, function(response){
					var args = [];
 					var terms = response.split(' ');

					for (i = 0; i < terms.length; i ++){
 						args.push(terms[i]);
 					}					
					command.invoke(args);
				}); 				
			} else {
				// jMacs.flash(command.name);
				command.invoke();
			};
      return false; 
    });
	},
	// executeCommand : function(command){
	// 	  $("#control").attr('value', command);
	// 	  if (command == 'split-vertical')
	// 	    jMacs.splitArea(jMacs.currentArea, true);
	// 	  if (command == 'split-horizontal')
	// 	    jMacs.splitArea(jMacs.currentArea, false);
	// 	  jMacs.bindEvents();
	// 	},
	bindEvents : function(){
	  $('textarea').focus(function(e){
			if($(this).attr('id') != "control"){
	    	console.log(AreaManager.findArea( $(this) ))
				AreaManager.currentArea = AreaManager.findArea( $(this) ) ;
			}
	  });
	}
}


// ******* COMMANDS*************

new Command('switch-area', 'Ctrl+tab', function(){
	AreaManager.cycleCurrentArea();
	if (AreaManager.currentArea.document)
		jMacs.flash(AreaManager.currentArea.document.path);
	return false; 
})

new Command('split-horizontal', 'Ctrl+h', function(){
	AreaManager.splitArea(AreaManager.currentArea);
	return false;
});

new Command('split-vertical', 'Ctrl+v', function(){
	AreaManager.splitArea(AreaManager.currentArea, true);
	return false;
});

new Command('close-area', 'Ctrl+w', function(){
	AreaManager.closeArea(AreaManager.currentArea);
	return false
})

new Command("open-file", 'Ctrl+o', function(args){
	console.log("open-file callback")
	AreaManager.currentArea.loadDocument( new Document(args[0]) ); 
	AreaManager.currentArea.textarea.focus();	
	return false;
}, 1);	

new Command ("save-file", 'Ctrl+s', function(){
	if (AreaManager.currentArea.document){
		AreaManager.currentArea.saveDocument();
	} else {
		jMacs.promptFor("save file at (path):", function(response){
			AreaManager.currentArea.document = new Document(response);
			AreaManager.currentArea.createDocument();
		})
	}
	return false;
});

new Command ("new-file", 'Ctrl+n', function(args){
	console.log("entering new-file callback")
	if (AreaManager.currentArea.document)
			AreaManager.splitArea(AreaManager.currentArea, true);
	
	AreaManager.currentArea.document = new Document(args[0]); 
	AreaManager.currentArea.textarea.focus();
	jMacs.flash("editing: " + AreaManager.currentArea.document.path);	
	return false;
}, 1);
