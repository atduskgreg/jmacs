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
	
	this.save = function(callback){
		console.log("saving");
		$.put("http://localhost:9999/documents/"+ encodeURIComponent(this.path).replace(".", "\\056")+"?callback=?", {content : thisDoc.content}, function(data){
			callback(data);
		}, "json");
		
	};
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
	
	// HERE: thisArea.document is not defined. we're calling new Area() too much!
	// TODO: teach jMacs to manage areas as a stack of pointers between dom elements and Areas
	this.saveDocument = function(){
		thisArea.document.content = thisArea.textarea.attr('value');
		thisArea.document.save(function(){
			jMacs.flash('saved ' + thisArea.document.path);
		});
	};
}

var Command = function(name, hotkey, callback, arity){
	this.name = name;
	this.hotkey = hotkey;
	this.callback = callback;
	this.arity = arity;
	
	
	var thisComand = this;
	this.invoke = function(args){
		thisComand.callback(args);
		$("#control").attr('value', '');
		$("#control").unbind('keydown', 'return')
		return false;
	};
	jMacs.registerCommand(this);
}

AreaManager = {
	openAreas : [],
	currentArea : null,
	splitArea : function(area, isVertical, dontMoveFocus){
		var newArea = new Area($('<textarea class="edit"></textarea>'));
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
	},
	// assuming there's only one...
	findArea : function(textarea){
		var match = null;
		for (i = 0; i < AreaManager.openAreas.length; i++){
			if (AreaManager.openAreas[i][0] == textarea[0])
				match = AreaManager.openAreas[i];
		}
		
		return match;
	
	}
}


jMacs = {
	flash : function(message){
		$('#control').attr('value', message);
		setTimeout("$('#control').attr('value', '')", 1000);
	},
	// TODO: this should also do something so that the control line works directly
	// instead of just through hotkeys
	registerCommand : function(command){
		$(document).bind('keydown', command.hotkey, function(e){
			$("#control").attr('value', command.name);
			
    	if(command.arity){
				$("#control").attr('value', $("#control").attr('value') + ' ');
				$("#control").focus();
        $("#control").bind('keydown', 'return', function (){
	
 					var args = [];
 					var terms = $("#control").attr('value').split(' ');
 					for (i = 1; i < terms.length; i ++){
 						args.push(terms[i]);
 					}
					command.invoke(args);
 					return false; 
 				});
				
			} else {
				command.invoke();
 				return false; 
			};
      return false; 
    });
	},
	executeCommand : function(command){
	  $("#control").attr('value', command);
	  if (command == 'split-vertical')
	    jMacs.splitArea(jMacs.currentArea, true);
	  if (command == 'split-horizontal')
	    jMacs.splitArea(jMacs.currentArea, false);
	  jMacs.bindEvents();
	},
	bindEvents : function(){
	  $('textarea').focus(function(e){
			if($(this).attr('id') != "control")
	    	jMacs.currentArea = AreaManager.findArea( $(this) ) ;
	  });
	}
}

// ******** SETUP DEFAULT AREA*********
$(function() {
	a = new Area($("<textarea class='edit'></textarea"));
	$("#control").after(a.textarea);
	AreaManager.openAreas.push(a);
	AreaManager.currentArea = a;
	a.textarea.focus();
});

// ******* COMMANDS*************

new Command('split-horizontal', 'Ctrl+h', function(){
	AreaManager.splitArea(AreaManager.currentArea);
	return false;
});

new Command('split-vertical', 'Ctrl+v', function(){
	AreaManager.splitArea(AreaManager.currentArea, true);
	return false;
});

new Command("open-file", 'Ctrl+f', function(args){
	AreaManager.currentArea.loadDocument( new Document(args[0]) ); 
	AreaManager.currentArea.textarea.focus();	
	return false;
}, 1);	

new Command ("save-file", 'Ctrl+s', function(){
	AreaManager.currentArea.saveDocument();
	return false;
});
