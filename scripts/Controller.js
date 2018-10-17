/*function OnFocus(node,Caret){
	//Caret.setState("visible");
}

function OnBlur(node,Caret){
	//Caret.setState("hidden");
	//if(node!=null && node.innerHTML==="") node.parentElement.removeChild(node);
}*/



function Controller(){
	
	var remoteCursor = this.remoteCursor;
	var $ = this;

	 this.OnFullSync = function (DATA){

		$.removeAllRows();
		$.addRow();
		
		var node = $.textContainer.firstChild;
		var cursor = $.acquireRemoteCursor("SERVER");//the server has is usinge its own cursors to rewrite data to the editor
		cursor.setState("hidden");
		
		cursor.setCursor($.addNewTextBlock(node,cursor),-1);
		for(var i=0;i<DATA.length;i++){
			node = cursor.getNode();
			for(var n=0;n<DATA[i].length;n++){
				if(DATA[i].charAt(n) == " ")
					$.OnSpace(node,cursor);
				else if(DATA[i].charAt(n)=="\t")
					$.OnTab(node,cursor);
				else
					$.OnAddChar(node,DATA[i].charAt(n),cursor);
				
				node = cursor.getNode();
			}
			$.OnEnter(node,cursor);
		
		}
	}


	this.OnSyncCursor=function(node,Cursor){
		console.log("Syncing local cursor");
	}


	this.OnPaste = function(node,DATA,Cursor){
		var rowCounter=1;
		var date = Date.now();
		var time = Date.now();
		var start = 0;
		var pos = $.getAbsCursorPos(Cursor);
		var i = 0;
		
		for(i=0;i<DATA.length;i++){
			
			if(DATA.charCodeAt(i)!=10){
				//$.OnAddChar(node,DATA.charAt(i),Cursor);
				//node = Cursor.getNode();
			}else{
				node.innerHTML=node.innerHTML.insert(DATA.substring(start,i-1),Cursor.cursorPos);
				$.tryCutBlock(node,Cursor);
				
				$.setAbsCursorPos(pos.Row,pos.Col + i-1 -start, Cursor);
				start = i+1;
				//console.log("Rows done " + (rowCounter++) + " Processing time " + (Date.now()-time));
				time=Date.now();
				$.OnEnter(Cursor.getNode(),Cursor);
				pos = $.getAbsCursorPos(Cursor);
				node=Cursor.getNode();
			}
		}
		
		node.innerHTML=node.innerHTML.insert(DATA.substring(start,i-1),Cursor.cursorPos);
		$.tryCutBlock(node,Cursor);
		$.setAbsCursorPos(pos.Row,pos.Col + i -1 -start, Cursor);

		//console.log("Total time "+(Date.now()-date));

	}
	



	this.OnClick = function(node,Cursor,cursorPos){
		Cursor.setCursor(node,cursorPos);
	}


	this.OnSpace = function(node,Cursor){
		var cursorPos=Cursor.getCursorPos();
		node.innerHTML=node.innerHTML.insert(" ",cursorPos);
		
		
		/*for(cursor in remoteCursor){//cursor loop
			if(Cursor.getID()!= remoteCursor[cursor].getID() && Cursor.getRow() == remoteCursor[cursor].getRow() && $.getAbsCursorPos(remoteCursor[cursor]).Col >= $.getAbsCursorPos(Cursor).Col){
				if(Cursor.getNode().getIndex()==remoteCursor[cursor].getNode().getIndex())
					$.OnArrowRight(remoteCursor[cursor].getNode(),remoteCursor[cursor]);
				else
					remoteCursor[cursor].setCursor(remoteCursor[cursor].getNode(),remoteCursor[cursor].getCursorPos());
			}
		}*/
		
		Cursor.forEachOnRow(function(cursor){
			cursor.setCursor(cursor.getNode(), cursor.getCursorPos());	
		});
		
		Cursor.forEachOnNode(function(cursor){
			if(cursor.getCursorPos() > Cursor.getCursorPos()){
				cursor.setCursor(cursor.getNode(), cursor.getCursorPos()+1);
			}
		});
		
		Cursor.setCursor(node,++cursorPos);
		$.tryCutBlock(node,Cursor);
		$.setHighlight(node);
	}


	this.OnTab=function(node,Cursor){
		var cursorPos=Cursor.getCursorPos();	
		node.innerHTML=node.innerHTML.insert("\t",cursorPos);
		
		
		Cursor.forEachOnRow(function(cursor){
			
			cursor.setCursor(cursor.getNode(), cursor.getCursorPos());	
			
		});
		
		Cursor.forEachOnNode(function(cursor){
			if(cursor.getCursorPos() > Cursor.getCursorPos()){
				cursor.setCursor(cursor.getNode(), cursor.getCursorPos()+1);
			}
		});
		
		Cursor.setCursor(node,++cursorPos);
		$.tryCutBlock(node,Cursor);
		$.setHighlight(node);
		
	}

	this.OnEnter = function(node,Cursor){
		
		
		$.insertRow(node.parentElement);
		var nextNode;
		if(Cursor.getCursorPos()==node.innerHTML.length){//
			if(node.nextSibling!=null){
				Cursor.setCursor(nextNode=node.nextSibling,0);
			}else{
				Cursor.setCursor(nextNode=$.addNewTextBlock(node.parentElement,Cursor),0);
			}
		}else if(Cursor.getCursorPos==0){
			nextNode=node;
		}else{
			nextNode=$.splitEditBlock(node,Cursor.getCursorPos());
			
			Cursor.forEachOnNode(function(cursor){//for each cursor on the same textblock
				
				cursor.setCursor(nextNode, cursor.getCursorPos() - Cursor.getCursorPos());
			});
			Cursor.setCursor(nextNode,0);
			
			
		}
				
		node = Cursor.getNode();

		while((nextNode)!=null){			
			var row = nextNode.parentElement;
			var n = nextNode.nextSibling;
				nextNode.parentElement.nextSibling.appendChild(row.removeChild(nextNode));
				$.tryCutBlock(nextNode,Cursor);
				nextNode = n;
		}
	
		Cursor.setCursor(node,0);
				
		node = Cursor.getNode();
		if(Cursor.getLastFromPrevRow() != null){
			Cursor.setCursor(Cursor.getLastFromPrevRow(),0,true);
			$.tryCutBlock(Cursor.getNode(), Cursor);
			Cursor.setCursor(node,0);
		
		}
		Cursor.forEach(function(cursor){
			cursor.setCursor(cursor.getNode(),cursor.getCursorPos());
		});
	}








	this.OnBackSpace = function(node,Cursor){
	
		
		var cursorPos=Cursor.getCursorPos();
		
		if(cursorPos != 0){
			Cursor.forEachOnNode(function(cursor){
				if(cursor.getCursorPos()>0){
					cursor.setCursor(cursor.getNode(),cursor.getCursorPos()-1);
				}
			});
		}

		
		if (cursorPos > 0){//step 1
		
			node.innerHTML=node.innerHTML.remove(--cursorPos,1);
			Cursor.setCursor(node,cursorPos);
			$.tryCutBlock(Cursor.getNode(),Cursor);
		}else if(node.previousSibling!=null){//step2
			
			cursorPos=node.previousSibling.innerHTML.length;	
			var prevNode=node.previousSibling;
			if(cursorPos>0)
				Cursor.setCursor(prevNode,--cursorPos);
			else
				Cursor.setCursor(prevNode,0);
			prevNode.innerHTML=prevNode.innerHTML.remove(cursorPos,1);
			$.tryCutBlock(Cursor.getNode(),Cursor);
		}else if(node.parentElement.previousSibling!=undefined && node.previousSibling==undefined){//step 3
			
			var parent=node.parentElement;
			
			if(parent.previousSibling.children.length>0)
				node=parent.previousSibling.children[parent.previousSibling.children.length-1];	
			else
				$.addNewTextBlock(parent.previousSibling);
				
			Cursor.setCursor(parent.previousSibling.lastChild,-1);
			while(0<parent.children.length){//move current row up, deleting the current row
				parent.previousSibling.appendChild(parent.removeChild(parent.children[0]));
				$.tryCutBlock(Cursor.getNode(),Cursor);
			}
			
		
			
			$.removeRow(parent);
			
			
		}
		
		//console.log(Cursor.getNode().innerHTML);
		
		Cursor.forEach(function(cursor){
			cursor.setCursor(cursor.getNode(),cursor.getCursorPos());
		});
		
		
		
	
		
		//$.tryCutBlock(Cursor.getNode(),Cursor);
		
		
		
		$.setHighlight(node);
	}





	this.OnArrowUpDown = function(node,targetRow,Cursor){
		if(targetRow.children[0]===undefined){
			$.addNewTextBlock(targetRow,Cursor);
			Cursor.setCursor(targetRow.lastChild,-1);
			return 0;
		}
				
		var cursorRect=Cursor.getElement().getBoundingClientRect();
		var x2 = cursorRect.left;
		var rect=targetRow.lastChild.getBoundingClientRect();
		var x=rect.left;
		if(x2 > x+targetRow.lastChild.scrollWidth){
			Cursor.setCursor(targetRow.lastChild,-1);
			return 0
		}
						
		for(var i=0;i<targetRow.children.length;i++){	
			rect = targetRow.children[i].getBoundingClientRect();
			x = rect.left;
						
			if((x2-x) <= (x+node.scrollWidth)){
				Cursor.setCursor(targetRow.children[i],Cursor.getCursorPos());
				break;
			}
		}
		
	}

	this.OnArrowUp = function(node,Cursor){
		$.OnArrowUpDown(node,node.parentElement.previousSibling,Cursor);
		
	}

	this.OnArrowDown = function(node,Cursor){
		$.OnArrowUpDown(node,node.parentElement.nextSibling,Cursor);
	}

	this.OnArrowLeft=function(node,Cursor){
		var cursorPos=Cursor.getCursorPos();
		if (cursorPos > 0) {
			Cursor.setCursor(node,--cursorPos);
		}else if(node.previousSibling!=undefined){
			Cursor.setCursor(node.previousSibling,node.previousSibling.innerHTML.length-1);
		}
	}


	this.OnArrowRight=function(node,Cursor){
		var cursorPos=Cursor.getCursorPos();
		if(cursorPos < node.innerHTML.length) {
			Cursor.setCursor(node,++cursorPos);
		} else if(node.nextSibling!==null){
			Cursor.setCursor(node.nextSibling,1);
		}
	}
	this.OnAddChar = function(node,char,Cursor){
		
		
		var cursorPos=Cursor.getCursorPos();
		node.innerHTML=node.innerHTML.insert(char,cursorPos);
		
		Cursor.forEachOnRow(function(cursor){//for each cursor on the same row excluding the current cursor 
			if($.getAbsCursorPos(cursor).Col>= $.getAbsCursorPos(Cursor).Col){
				if(cursor.getNode().getIndex() != Cursor.getNode().getIndex()){
					cursor.setCursor(cursor.getNode(), cursor.getCursorPos());
				}else{
					cursor.setCursor(cursor.getNode(), cursor.getCursorPos()+1);
				}
			}
		});
		
		
		Cursor.setCursor(node,++cursorPos);
		
		$.tryCutBlock(node,Cursor);
		$.setHighlight(node);
		
	}
}	
