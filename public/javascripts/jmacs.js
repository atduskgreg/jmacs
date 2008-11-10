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
	};
	
	this.destroy = function(callback){
		$.delete_("http://localhost:9999/documents/"+ encodeURIComponent(this.path).replace(".", "\\056")+"?callback=?", {content : thisDoc.content}, function(data){
			callback(data);
		}, "json");	
	};
	
};

var Directory = function(path, pwd) {
	this.path = path;
	this.pwd = pwd;
	
	var thisDir = this;
	this.get = function(callback){
		$.getJSON("http://localhost:9999/directories/"+ encodeURIComponent(this.path).replace(".", "\\056") +".json?pwd="+pwd+"&callback=?", function(data){
			thisDir.path = data.path;
			thisDir.content = data.content;
			if( callback )
				callback(thisDir);
		})
	};
}

var Command = function(name, hotkey, callback, arity){
	this.name = name;
	this.hotkey = hotkey;
	this.callback = callback;
	this.arity = arity;
	
	var thisCommand = this;
	
	this.parseArgsString = function(argsString){
		if (typeof(argsString) == 'undefined'){
			return [];
		}
		else {
			var args = [];
 			var terms = argsString.split(' ');
    	
			for (i = 0; i < terms.length; i ++){
 				args.push(terms[i]);
 			}
			return args;
		}
	
	};
	
	this.invoke = function(argsString){
		var args = thisCommand.parseArgsString(argsString);
		new CommandRecord(thisCommand, args);
		thisCommand.callback(args);
		// $("#control").unbind('keydown', 'return');
		return false;
	};
	CommandManager.registerCommand(this);
}

var CommandRecord = function(command, args){
	this.command = command;
	this.args = args;
	CommandManager.history.push(this)
	CommandManager.historyPointer = null;
	
	var thisCommandRecord = this;
	this.show = function(){
		var result = thisCommandRecord.command.name
		if (thisCommandRecord.args)
		 result += ' ' + thisCommandRecord.args.join(' ');
		return result
	}
}

CommandManager = {
	history : [],
	catalog : {},
	historyPointer : null,

	// TODO: this should also do something so that the control line works directly
	// instead of just through hotkeys (use jMacs.parsePrompt on current content of #control)
	registerCommand : function(command){
		CommandManager.catalog[command.name] = command;
		$(document).bind('keydown', command.hotkey, function(e){
			
    	if(command.arity){
				jMacs.promptFor( command ); 				
			} else {
				// jMacs.flash(command.name);
				command.invoke();
			};
      return false; 
    });
	},
	traverseHistory : function(moveIsForward){
		if (CommandManager.history.length == 0){
			return false;
		} else {
			if (CommandManager.historyPointer == null)
				var currentHistoryIndex = CommandManager.history.length - 1;
			else
			 var currentHistoryIndex = CommandManager.historyPointer;
			

			if (moveIsForward){
				if (currentHistoryIndex == CommandManager.history.length - 1)
					CommandManager.historyPointer = 0
				else
					CommandManager.historyPointer = currentHistoryIndex + 1			
			} else { // move backwards
				if (currentHistoryIndex == 0)
					// cycling through history as a ring
					CommandManager.historyPointer = CommandManager.history.length - 1 
				else
					CommandManager.historyPointer = currentHistoryIndex - 1			
			}
			return CommandManager.history[ CommandManager.historyPointer ];
		}
	}
}

var Area = function(textarea){
	this.textarea = textarea;
	var thisArea = this;
	
	this.loadDirectory = function(dir){
		dir.get(function(){
			thisArea.directory = dir;
			var res = [];
			for (entry in dir.content){
				res.push(dir.content[entry].path);
			};
			thisArea.textarea.attr('value', res.join('\n'));
			AreaManager.recentDocsAndDirs.push(dir);
		})
	}
		
	this.loadDocument = function(doc){
		doc.get(function(){
			thisArea.document = doc;
			thisArea.textarea.attr('value', doc.content);
			AreaManager.recentDocsAndDirs.push(doc);

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
	};
}

AreaManager = {
	openAreas : [],
	recentDocsAndDirs : [],
	currentArea : null,
	splitArea : function(area, isVertical, dontMoveFocus){
		var newArea = new Area($('<textarea class="edit"></textarea>'));
		
		// Linked list of Areas:
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
		setTimeout("$('#control').attr('value', '')", 1500);
	},
	
	ringBell : function(){
		$('#control').css('background-color', '#0f0');
		setTimeout("$('#control').css('background-color', '#000')", 100);

	},
	
	getResponseFromPrompt : function(prompt){
		var cleanPromptText = prompt.replace(/\?/, '\\?')
																		.replace(/\(/, '\\(')
																		.replace(/\)/, '\\)')
  

		var promptRegexp = '^' + cleanPromptText + ' ';
		var r = new RegExp(promptRegexp);
  
		return $("#control").attr('value').replace(r, '');
	},
	
	parsePrompt : function (){
		if (jMacs.promptQuery){ // hotkey/query
			var prompt = jMacs.promptQuery;
			var response = jMacs.getResponseFromPrompt(prompt);
		}
		else{ // straight user entry
			var prompt = $("#control").attr('value').split(' ')[0];
			var response = jMacs.getResponseFromPrompt(prompt);
			console.log(CommandManager.catalog[prompt]);

			jMacs.promptCallback = CommandManager.catalog[prompt].invoke;
		}
		console.log(jMacs.promptCallback.name)
		jMacs.promptCallback(response);

		// reset #control and prompt stuff
		$("#control").attr('value', '');
		jMacs.promptCallback =  null;
		jMacs.promptQuery = null;
		// $("#control").unbind('keydown', 'return', jMacs.parsePrompt);

 		return false; 
 	},

	// prompter can be a Command
	// or a string with a callback given as the second arg(i.e for new-file dialog)
	promptFor : function(prompter, callback){
		jMacs.promptCallback = prompter.invoke || callback;		
		jMacs.promptQuery = prompter.name || prompter;

		$("#control").attr('value', jMacs.promptQuery + ' ');
		$("#control").focus();
		return false;
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
		$("#control").bind('keydown', 'return', jMacs.parsePrompt);

 	 	$("#control").ajaxError(function(event, request, settings){
			jMacs.flash('error ('+request.status+'): '+ request.responseText);
			return false;
 		});
		$("#control").bind('keydown', 'Ctrl+up', function(e){
			var cycledCommand = CommandManager.traverseHistory(false);
			if (cycledCommand)
				$('#control').attr('value', cycledCommand.show());
			else
				jMacs.ringBell();
			return false;
		});
		$("#control").bind('keydown', 'Ctrl+down', function(e){
			var cycledCommand = CommandManager.traverseHistory(true);
			if (cycledCommand)
				$('#control').attr('value', cycledCommand.show());
			else
				jMacs.ringBell();
			return false;
		});
		
	}
}


// ******* COMMANDS*************

new Command('focus-control', 'Ctrl+x', function(){
	$("#control").focus();
	return false;
})

new Command('switch-area', 'Ctrl+tab', function(){
	AreaManager.cycleCurrentArea();
	jMacs.flash(AreaManager.currentArea.document ? AreaManager.currentArea.document.path : 'unattached area');
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
	AreaManager.currentArea.loadDocument( new Document(args[0]) ); 
	AreaManager.currentArea.textarea.focus();	
	return false;
}, 1);	

new Command ("save-file", 'Ctrl+s', function(){
	if (AreaManager.currentArea.document){
		AreaManager.currentArea.saveDocument();
	} else {
		jMacs.promptFor("path:", function(response){
			AreaManager.currentArea.document = new Document(response);
			AreaManager.currentArea.createDocument();
			AreaManager.currentArea.textarea.focus();
			return false;
		});
	}
	
	return false;
});

new Command ("new-file", 'Ctrl+n', function(args){
	if (AreaManager.currentArea.document)
			AreaManager.splitArea(AreaManager.currentArea, true);
	
	AreaManager.currentArea.document = new Document(args[0]); 
	AreaManager.currentArea.textarea.focus();
	// This doesn't seem to work right now:
	// jMacs.flash("editing: " + AreaManager.currentArea.document.path);	
	return false;
}, 1);

new Command("delete-file", 'Ctrl+d', function(){
		if (AreaManager.currentArea.document){
			AreaManager.currentArea.document.destroy(function(){
				var p = AreaManager.currentArea.document.path;
				AreaManager.closeArea(AreaManager.currentArea);
				jMacs.flash('deleted ' + p);
				return false;
			});
	} else {
		jMacs.promptFor("delete-file", function(response){
			var d = new Document(response);
			d.destroy(function(){	
				jMacs.flash('deleted ' + d.path);
				AreaManager.currentArea.textarea.focus();
				return false;
			});
		});
	}
	
	return false;
});

new Command('list-dir', 'Ctrl+l', function(args){
	AreaManager.currentArea.loadDirectory(new Directory(args[0]));
	AreaManager.currentArea.textarea.focus();
}, 1);

new Command('list-highlighted-dir', 'Ctrl+return', function(){
	var path = Help.getLine(AreaManager.currentArea.textarea.attr('value'),
		AreaManager.currentArea.textarea.getSelection().start
	);

	if (AreaManager.currentArea.directory){
		var selectedPathIsFile = false;
		for(entry in AreaManager.currentArea.directory.content){
			if(AreaManager.currentArea.directory.content[entry].path == path){
				selectedPathIsFile = AreaManager.currentArea.directory.content[entry].isFile;
				break;
			}
		};
		if(selectedPathIsFile){
			AreaManager.currentArea.loadDocument(new Document(path));
		}
		else{
			AreaManager.currentArea.loadDirectory(new Directory(path));
		}
	} else {
		AreaManager.currentArea.loadDirectory(new Directory(path));
	}
	AreaManager.currentArea.textarea.focus();	
});

new Command('list-commands', 'Ctrl+c', function(){
	var result = "";
	for(command in CommandManager.catalog){
    result += '[' + CommandManager.catalog[command].hotkey + ']\t\t' +command + '\n'
	}
	
	AreaManager.currentArea.textarea.attr('value', result);
	jMacs.flash('list-commands');

})

new Command('list-recent', 'Ctrl+r', function(){
	var result = [];
	for(entry in AreaManager.recentDocsAndDirs){
		result.push(AreaManager.recentDocsAndDirs[entry].path)
	}
	AreaManager.currentArea.textarea.attr('value', result.join('\n'));
	jMacs.flash('list-recent');
})
