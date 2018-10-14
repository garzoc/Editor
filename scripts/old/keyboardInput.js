
function bindEvents(){
	
	/*
	 * MOUSE EVENTS
	 * 
	 * */
	textRow.bindEventListener("click",function(e){
		//for(k in e.target) console.log("--> "+k);
		//console.log(e.target.firstChild.innerHTML);
		//editBlock.focus();
		e.stopPropagation();
		//console.log("bla");
		addNewTextBlock(e.target);
	});

	textBlock.bindEventListener("click",function(e){
		//for(k in e.target) console.log("--> "+k);
		//console.log(e.target.firstChild.innerHTML);
		//console.log("boop");
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
		
		
		//caret.style.left=(node.offsetLeft+strLengthTest.scrollWidth)+"px";
		
		
    //console.log("x: " + x + " y: " + y);
		//editTextBlock(e.target);
		
		//editTextBlock(e.target,0);
	});
	
	
	/*editBlock.bindEventListener("click",function(e){
		e.stopPropagation();
	});*/
	
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
		//console.log("hello it's me")
		//closeEditBlock(e.target);
	});
	
	
	
	/*
	 * ==================================
	 * 
	 * */
	
	/*
	 * Key inputs
	 * */
	 
	 /*
	  * http://www.quirksmode.org/js/keys.html
	  * http://stackoverflow.com/questions/11173863/event-charcode-always-returning-0
	  * */
	 textBlock.bindEventListener("keypress",function(e){//this gets triggerd after keyDown event
		//console.log("blabla");
		//console.log(e.target.innerHTML.length);
		e.stopPropagation();
		e.preventDefault();
		

		var oldstr=e.target.innerHTML;
		var caretPos=e.target.getAttribute("caretPosition");
		
		e.target.innerHTML=e.target.innerHTML.insert(String.fromCharCode(e.charCode),caretPos);
		
		if(oldstr.length<e.target.innerHTML.length){
			caretPos++;
			e.target.setAttribute("caretPosition",caretPos);
			setCaret(e.target,caretPos);
		}
		
		
		//console.log(caretPos);
		
	});
	 
	 
	textBlock.bindEventListener("keyup",function(e){e.stopPropagation();});
	
	
	textBlock.bindEventListener("keydown",function(e){
		//e.preventDefault();//this would prevent keyPress from being triggered
		
		//console.log(e.keyCode);
		
		var caretPos=e.target.getAttribute("caretPosition");//beware this is not an Integer
		
		if(e.keyCode===9){//tab
			e.preventDefault();
			e.target.innerHTML=e.target.innerHTML.insert("\t",caretPos);
			e.target.setAttribute("caretPosition",++caretPos);
			setCaret(e.target,caretPos);
			return 0;
		}
		
		if(e.keyCode==32){//space doesn't trigger keyPress event
			e.preventDefault();
			e.target.innerHTML=e.target.innerHTML.insert(" ",caretPos);
			e.target.setAttribute("caretPosition",++caretPos);
			setCaret(e.target,caretPos);
			
			return 0;
		}
		
		
		if(e.keyCode===39){//right arrow key
			if(caretPos < e.target.innerHTML.length) {
				e.target.setAttribute("caretPosition",(++caretPos));
				setCaret(e.target,caretPos);
			} else if(e.target.nextSibling!==null){
				setCaret(e.target.nextSibling,1);
				editTextBlock(e.target.nextSibling);
			}
				
				
			return 0;
		} 
		
		//subtract 2 from carret
		
		
		
		if(e.keyCode==8){//backspace	
			if (caretPos > 0){
				e.target.setAttribute("caretPosition",(--caretPos));
				e.target.innerHTML=e.target.innerHTML.remove(caretPos,1);
				setCaret(e.target,caretPos);
			}else if(e.target.previousSibling.getAttribute("class")!=="row_number"){		
				e.target.previousSibling.innerHTML=e.target.previousSibling.innerHTML.remove(e.target.previousSibling.innerHTML.length-1,1);
				setCaret(e.target.previousSibling,e.target.previousSibling.innerHTML.length);
				editTextBlock(e.target.previousSibling);
				setCaret(e.target,caretPos);
				
			}else if(e.target.parentElement.previousSibling.getAttribute("class")==="text_row"){
				
				//var length=e.target.parentElement.children.length;
				var parent=e.target.parentElement;
			
				if(!(parent.previousSibling.children.length>1)) 
					addNewTextBlock(parent.previousSibling);
			
				setCaret(parent.previousSibling.lastChild,-1);
				parent.previousSibling.lastChild.focus();
				
				while(1<parent.children.length){
					//console.log("hel "+parent.children[1]+" length is "+parent.children.length);
					parent.previousSibling.appendChildTwice(parent.children[1]);
					parent.removeChild(parent.children[1]);
				}
				
				parent.parentElement.removeChild(parent);
				
			}
			
			
			return 0;
		} 
		
		if(e.keyCode===37){//left arrow key
			if (caretPos > 0) {
				e.target.setAttribute("caretPosition",(--caretPos));
				setCaret(e.target,caretPos);
			}else if(e.target.previousSibling.getAttribute("class")!=="row_number"){
				setCaret(e.target.previousSibling,e.target.previousSibling.innerHTML.length-1);
				editTextBlock(e.target.previousSibling);
			}
			return 0;
		}
		
		if(e.keyCode===13){//ENTER
			
			e.target.parentElement.parentElement.insertBeforeTwice(textRow,e.target.parentElement.nextSibling);
			var nextNode=splitEditBlock(e.target);
			//console.log(nextNode.nextSibling);
			while((nextNode.nextSibling)!=null){
				nextNode=nextNode.nextSibling;
				//console.log(nextNode.previousSibling);
				nextNode.parentElement.nextSibling.appendChildTwice(nextNode.previousSibling);
				nextNode.parentElement.removeChild(nextNode.previousSibling);
			}
			//console.log(nextNode);
			nextNode.parentElement.nextSibling.appendChildTwice(nextNode.parentElement.lastChild);
			setCaret(nextNode.parentElement.nextSibling.children[1],0);
			nextNode.parentElement.nextSibling.children[1].focus();
			//console.log(nextNode+" hello");
			if(nextNode.parentElement!==null)nextNode.parentElement.removeChild(nextNode.parentElement.lastChild);
			
			
			return 0;
			
		}
		
		//set carret position to zero
		if(e.keyCode===40&& e.target.parentElement.nextSibling!==null){//down arrow key
			
			if(e.target.parentElement.nextSibling.children[1]===undefined){
				addNewTextBlock(e.target.parentElement.nextSibling);
				return 0;
			}

			var caretRect=caret.getBoundingClientRect();
			var x2 = caretRect.left;
			var rect=e.target.parentElement.nextSibling.lastChild.getBoundingClientRect();
			var x=rect.left;
			//console.log(x2+"       "+(x+e.target.parentElement.nextSibling.lastChild.scrollWidth));
			if(x2 > x+e.target.parentElement.nextSibling.lastChild.scrollWidth){
				setCaret(e.target.parentElement.nextSibling.lastChild,-1);
				e.target.parentElement.nextSibling.lastChild.focus();
				return 0
			}
			
			
			for(var i=1;i<e.target.parentElement.nextSibling.children.length;i++){	
				rect = e.target.parentElement.nextSibling.children[i].getBoundingClientRect();
				x = rect.left;
					
				if((x2-x) <= (x+e.target.scrollWidth)){
					setCaret(e.target.parentElement.nextSibling.children[i],e.target.getAttribute("caretPosition"));
					e.target.parentElement.nextSibling.children[i].focus();
					break;
				}
			}
			return 0;
			
		}
		
		if(e.keyCode===38&& e.target.parentElement.previousSibling.isElem){//up arrow key
			
			if(e.target.parentElement.previousSibling.children[1]===undefined){
				addNewTextBlock(e.target.parentElement.previousSibling);
				return 0;
			}
			
			var caretRect=caret.getBoundingClientRect();
			var x2 = caretRect.left;
			var rect=e.target.parentElement.previousSibling.lastChild.getBoundingClientRect();
			var x=rect.left;
			if(x2 > x+e.target.parentElement.previousSibling.lastChild.scrollWidth){
				//e.target.parentElement.previousSibling.lastChild
				setCaret(e.target.parentElement.previousSibling.lastChild,-1);
				e.target.parentElement.previousSibling.lastChild.focus();
				return 0
			}
			
			
			for(var i=1;i<e.target.parentElement.previousSibling.children.length;i++){	
				rect = e.target.parentElement.previousSibling.children[i].getBoundingClientRect();
				x = rect.left;
					
				if((x2-x) <= (x+e.target.scrollWidth)){
					setCaret(e.target.parentElement.previousSibling.children[i],e.target.getAttribute("caretPosition"));
					e.target.parentElement.previousSibling.children[i].focus();
					break;
				}
				//console.log(x+"    "+x2);	
			}
			return 0;
			
		}
		//set caret back to its original position
		//e.target.setAttribute("caretPosition",++caretPos);
		
	});

	
	/*
	 * =============================00
	 * */

}




