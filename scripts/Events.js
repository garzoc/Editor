
var Event = function bindEvents(){
	
	var $ = this;
	
	//MOUSE EVENTS
	
	$.textRow.bindEventListener("click",function(e){

		e.stopPropagation();
		$.localCursor.setCursor($.addNewTextBlock(e.target,$.localCursor),0);
		$.editTextBlock();
		if(useServer)$.send("addNewTextBlock",e.target.children[0],null);
		
	});

	$.textBlock.bindEventListener("click",function(e){
	
		e.stopPropagation();
		//e.target.focus();
		
		var rect = e.target.getBoundingClientRect();
		var x = e.clientX - rect.left;		
		var newValue="";
		var oldValue="";
		//console.log("blub");
		for(var i=0;i<e.target.innerHTML.length;i++){
			var text =e.target.innerHTML.substring(0,i);
			oldValue=newValue;
			newValue=Math.abs(text.width() - x);
			if(Math.round(text.width()) > x){
					$.localCursor.setCursor(e.target,i-((oldValue<newValue)?1:0))
					
					$.editTextBlock(e.target);
				break;
			}
		}
		
		if($.useServer)$.send("OnClick",e.target,null);
		
	});
	
	$.rowNumber.bindEventListener("click",function(e){
		e.stopPropagation();
	});

	/*
	 * ===================================00
	 * */
	
	/*
	 * TRIGGERS
	 * */
	$.textBlock.bindEventListener("focus",function(e){
		
	});

	$.textBlock.bindEventListener("blur",function(e){
	
	});
	
	
	
	/*
	 * ==================================
	 * 
	 * */
	
	/*
	 * Key inputs
	 * */
	 

	 $.textBlock.bindEventListener("keypress",function(e){//this gets triggerd after keyDown event

		e.stopPropagation();
		e.preventDefault();
		
		var character=String.fromCharCode(e.charCode);
		if(character!=""){
			if($.useServer)$.send("OnAddChar",e.target,character);
			$.OnAddChar($.localCursor.getNode(),character, $.localCursor);
			
		}
		$.editTextBlock($.localCursor.getNode());
		
	});
	 
	 
	$.textBlock.bindEventListener("keyup",function(e){e.stopPropagation();});
	
	$.textPasteField.bindEventListener('paste', function (e) {
		var text = e.clipboardData.getData('text/plain');
		$.localCursor.getNode().focus();
		$.OnPaste($.localCursor.getNode(),text,$.localCursor);

	});
	
	$.textBlock.bindEventListener("keydown",function(e){
		//e.preventDefault();//this would prevent keyPress from being triggered
		
		//console.log(e.keyCode);
		var node=$.localCursor.getNode();
		 if (e.ctrlKey || e.metaKey) {
        
			switch (String.fromCharCode(e.which).toLowerCase()) {
				case 's':
					e.preventDefault();
					if($.useServer)$.send("OnSave");
					console.log('ctrl-s');
					returnhhhdsj;
					
				case 'c':
					
					return;
				case 'v':
					//console.log(ClipboardEvent.clipboardData.getData('Text'));
					$.textPasteField.style.visibility="visible";
					$.textPasteField.focus();
					$.textPasteField.style.visibility="hidden";
					
					return;	
			}
			
			return 0;
		}
		
		
		if(e.keyCode===9){//tab
			e.preventDefault();
			if($.useServer)$.send("OnTab",node,'\t');
			$.OnTab(node, $.localCursor);
			$.editTextBlock($.localCursor.getNode());
			return 0;
		}
		
		if(e.keyCode==32){//space doesn't trigger keyPress event
			e.preventDefault();
			if($.useServer)$.send("OnSpace",node,'\s');
			$.OnSpace(node,$.localCursor)
			$.editTextBlock($.localCursor.getNode());
			return 0;
		}
		
		
		if(e.keyCode===39){//right arrow key
			e.preventDefault();
			if($.useServer)$.send("OnArrowRight",node,null);
			$.OnArrowRight(node, $.localCursor);
			$.editTextBlock($.localCursor.getNode());
			if($.useServer)$.send("OnServerCursorSync",node,null);//when using arrow keys send a second message to the serer in order to sync
			
			return 0;
		} 	
		
		if(e.keyCode==8){//backspace
			e.preventDefault();
			if($.useServer)$.send("OnBackSpace",node,null);	
			$.OnBackSpace(node, $.localCursor);
			$.editTextBlock($.localCursor.getNode());		
			return 0;
		} 
		
		if(e.keyCode===37){//left arrow key
			e.preventDefault();
			if($.useServer)$.send("OnArrowLeft",node,null);
			$.OnArrowLeft(node, $.localCursor);
			$.editTextBlock($.localCursor.getNode());
			if($.useServer)$.send("OnServerCursorSync",node,null);
			return 0;
		}
		
		if(e.keyCode===13){//ENTER
			e.preventDefault();
			if($.useServer)$.send("OnEnter",node,null);
			$.OnEnter(e.target, $.localCursor);
			$.editTextBlock($.localCursor.getNode());
			return 0;
			
		}
		
		if(e.keyCode===40 && e.target.parentElement.nextSibling!==null){//down arrow key
			e.preventDefault();
			if($.useServer)$.send("OnArrowDown",node,null);
			$.OnArrowDown(e.target, $.localCursor);
			$.editTextBlock($.localCursor.getNode());
			if($.useServer)$.send("OnServerCursorSync", node,null);
			return 0;
			
		}
		
		if(e.keyCode===38 && e.target.parentElement.previousSibling!=undefined){//up arrow key
			e.preventDefault();
			if($.useServer)$.send("OnArrowUp",node,null);
			$.OnArrowUp(e.target, $.localCursor);
			$.editTextBlock($.localCursor.getNode());
			if($.useServer)$.send("OnServerCursorSync", node,null);
			return 0;
		}
		
	});

	
	/*
	 * =============================00
	 * */

}




