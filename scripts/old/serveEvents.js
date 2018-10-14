
function bindEvents(){
	
	/*
	 * MOUSE EVENTS
	 * 
	 * */
	textRow.bindEventListener("click",function(e){
		
		e.stopPropagation();
		if(useServer)send("addNewTextBlock",e.target);
		addNewTextBlock(e.target);
		
	});

	textBlock.bindEventListener("click",function(e){
	
		e.stopPropagation();
		e.target.focus();
		//setCaret(e.target,0);
		
		var rect = e.target.getBoundingClientRect();
		var x = e.clientX - rect.left;		
		var newValue="";
		var oldValue="";
		//console.log("blub");
		for(var i=0;i<e.target.innerHTML.length;i++){
			strLengthTest.innerHTML=e.target.innerHTML.substring(0,i);
			oldValue=newValue;
			newValue=Math.abs(strLengthTest.scrollWidth-x);
			if(Math.round(strLengthTest.scrollWidth) > x){
					setCaret(e.target,i-((oldValue<newValue)?1:0))
				
				break;
			}
		}
		
	});
	
	rowNumber.bindEventListener("click",function(e){
		e.stopPropagation();
	});

	/*
	 * ===================================00
	 * */
	
	/*
	 * TRIGGERS
	 * */
	textBlock.bindEventListener("focus",function(e){
		caret.style.visibility="visible";
		e.stopPropagation();
	});

	textBlock.bindEventListener("blur",function(e){
		e.stopPropagation();
		caret.style.visibility="hidden"
		if(e.target.innerHTML==="") e.target.parentElement.removeChild(e.target);
		
	});
	
	
	
	/*
	 * ==================================
	 * 
	 * */
	
	/*
	 * Key inputs
	 * */
	 

	 textBlock.bindEventListener("keypress",function(e){//this gets triggerd after keyDown event

		e.stopPropagation();
		e.preventDefault();
		
		strLengthTest.innerHTML=String.fromCharCode(e.charCode);
		if(strLengthTest.innerHTML!=""){
			if(useServer)sendString(e.target,strLengthTest.innerHTML);
			addChar(e.target,strLengthTest.innerHTML);
			
		}
		
		
	});
	 
	 
	textBlock.bindEventListener("keyup",function(e){e.stopPropagation();});
	
	
	textBlock.bindEventListener("keydown",function(e){
		//e.preventDefault();//this would prevent keyPress from being triggered
		
		//console.log(e.keyCode);
		
		
		if(e.keyCode===9){//tab
			if(useServer)send("OnTab",e.target);
			OnTab(e.target);
			return 0;
		}
		
		if(e.keyCode==32){//space doesn't trigger keyPress event
			e.preventDefault();
			if(useServer)send("OnSpace",e.target);
			onSpace(e.target);
			return 0;
		}
		
		
		if(e.keyCode===39){//right arrow key
			if(useServer)send("OnArrowRight",e.target);
			OnArrowRight(e.target);
			
			return 0;
		} 	
		
		if(e.keyCode==8){//backspace
			if(useServer)send("OnBackSpace",e.target);	
			OnBackSpace(e.target);				
			return 0;
		} 
		
		if(e.keyCode===37){//left arrow key
			if(useServer)send("OnArrowLeft",e.target);
			OnArrowLeft(e.target);
			
			return 0;
		}
		
		if(e.keyCode===13){//ENTER
			if(useServer)send("OnEnter",e.target);
			OnEnter(e.target);
			
			return 0;
			
		}
		
		if(e.keyCode===40&& e.target.parentElement.nextSibling!==null){//down arrow key
			if(useServer)send("OnArrowDown",e.target);
			OnArrowDown(e.target);
			return 0;
			
		}
		
		if(e.keyCode===38&& e.target.parentElement.previousSibling.getAttribute("class")!=="caret"){//up arrow key
			if(useServer) send("OnArrowUp",e.target);
			OnArrowUp(e.target);	
			return 0;
			
		}
		
	});

	
	/*
	 * =============================00
	 * */

}




