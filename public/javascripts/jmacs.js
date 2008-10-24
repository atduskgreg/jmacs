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
			jMacs.flash('saved ' + document.name);
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




jMacs = {
	areas : [],
	flash : function(message){
		$('#control').attr('value', message);
		setTimeout("$('#control').attr('value', '')", 1000);
	},
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
	splitArea : function(area, vertical){
	  var newArea = $('<textarea class="edit"></textarea>');
	  area.textarea.after(newArea);
	  if(vertical){
	
	    var widthPercentage = Help.percentWidth(area.textarea);
	
	    var newWidth = widthPercentage / 2;
	    area.textarea.css('width', newWidth + '%');
	    newArea.css('width', (newWidth - 1) + '%');
	    newArea.css('height', Help.percentHeight(area.textarea) + '%');
	  } else {
	    var newHeight = Help.percentHeight(area.textarea) / 2;
	    console.log(newHeight);
	    area.textarea.css('height', newHeight + '%');
	    newArea.css('height', newHeight + '%');
	    console.log(Help.percentWidth(area.textarea))
	    newArea.css('width', Help.percentWidth(area.textarea) + '%');
	
	  }
	  
	  newArea.focus();
	  jMacs.currentArea = new Area(newArea);
	  return false;
	},
	executeCommand : function(command){
	  $("#control").attr('value', command);
	  if (command == 'split-vertical')
	    jMacs.splitArea(jMacs.currentArea, true);
	  if (command == 'split-horizontal')
	    jMacs.splitArea(jMacs.currentArea, false);
	  jMacs.bindEvents();
	},
	currentArea : null,
	cycleCurrentArea : function(){
	
	  if(!jMacs.currentArea){
	    return new Area($('.edit')[0] );
	  } else {
	    var ordinal;
	    for (var i = 0, l = $('.edit').length; i < l; i++) {
	      if ($('.edit')[i] == jMacs.currentArea.textarea[0] ){
	        ordinal = i;
	      };
	    };
	    // move to next or first
	    var textAreaCount = $('.edit').length;
	    if( ordinal + 1 >= textAreaCount )
	      jMacs.currentArea = new Area( $($('.edit')[0]) );
	    else
	      jMacs.currentArea = new Area( $($('.edit')[ordinal + 1]) );
	  }
	},
	bindEvents : function(){
	  $('textarea').focus(function(e){
			if($(this).attr('id') != "control")
	    	jMacs.currentArea = new Area( $(this) ) ;
	  });
	}
}


new Command("open-file", 'Ctrl+f', function(args){
	jMacs.currentArea.loadDocument( new Document(args[0]) ); 
	console.log("open")
	console.log(jMacs.currentArea)
	jMacs.currentArea.textarea.focus();	
	return false;
}, 1);	

new Command ("save-file", 'Ctrl+s', function(){
	jMacs.currentArea.saveDocument();
	return false;
});
