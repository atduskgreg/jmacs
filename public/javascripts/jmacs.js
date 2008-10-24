var Document = function(path, pwd) {
	this.path = path;
	this.pwd = pwd;
	var thisDoc = this;
	this.get = function(callback){
		$.getJSON("http://localhost:9999/documents/"+ encodeURIComponent(this.path).replace(".", "\\056") +".json?pwd="+pwd+"&callback=?", function(data){
			thisDoc.path = data.path;
			thisDoc.content = data.content;
			thisDoc.modified = data.modified;
			callback(thisDoc);
		})
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
		$("#control").attr('value', '');
		$("#control").unbind('keydown', 'return')
		return false;
	};
	jMacs.registerCommand(this);
}




jMacs = {
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
				
			};
      return false; 
    });
	},
	splitArea : function(area, vertical){
	  var newArea = $('<textarea class="edit"></textarea>');
	  area.after(newArea);
	  if(vertical){
	
	    var widthPercentage = Help.percentWidth(area);
	
	    var newWidth = widthPercentage / 2;
	    area.css('width', newWidth + '%');
	    newArea.css('width', (newWidth - 1) + '%');
	    newArea.css('height', Help.percentHeight(area) + '%');
	  } else {
	    var newHeight = Help.percentHeight(area) / 2;
	    console.log(newHeight);
	    area.css('height', newHeight + '%');
	    newArea.css('height', newHeight + '%');
	    console.log(Help.percentWidth(area))
	    newArea.css('width', Help.percentWidth(area) + '%');
	
	  }
	  
	  newArea.focus();
	  jMacs.currentArea = newArea;
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
	    return $('.edit')[0];
	  } else {
	    var ordinal;
	    for (var i = 0, l = $('.edit').length; i < l; i++) {
	      if ($('.edit')[i] == jMacs.currentArea[0] ){
	        ordinal = i;
	      };
	    };
	    // move to next or first
	    var textAreaCount = $('.edit').length;
	    if( ordinal + 1 >= textAreaCount )
	      jMacs.currentArea = $($('.edit')[0]);
	    else
	      jMacs.currentArea = $($('.edit')[ordinal + 1]);
	  }
	},
	bindEvents : function(){
	  $('textarea').focus(function(e){
			if($(this).attr('id') != "control")
	    	jMacs.currentArea = $(this);
	  });
	}
}


new Command("open-file", 'Ctrl+f', function(args){
	a = new Area( jMacs.currentArea );
	a.loadDocument( new Document(args[0]) ); 
	a.textarea.focus();	
	return false;
}, 1)
