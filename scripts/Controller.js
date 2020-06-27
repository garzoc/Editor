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

	this.OnRowSync = function(TEXT, rowNb, Col){
		let setFocus = false;
		if(document.activeElement == $.localCursor.getNode()){
			setFocus =true;
		}

		let row = $.getRowByIndex(rowNb);
		$.removeAllText(row);
		let node = $.addNewTextBlock(row);
		node.innerHTML = TEXT;

		if($.localCursor.getRowElem()) {
			$.setAbsCursorPos($.getAbsCursorPos($.localCursor).Row, Col, $.localCursor);
		} else {//When back trace is pressed while on the first row
			$.setAbsCursorPos(rowNb, Col, $.localCursor);
		}

		if(setFocus){//To make sure the the editor didn't loose focus
			$.localCursor.getNode().focus()
		}

	}

	this.OnFullSync = function (DATA){

		let setFocus = false;
		if(document.activeElement == $.localCursor.getNode()){
			setFocus =true;
		}


		let row = $.textContainer.firstChild;
		$.removeAllText(row);
		var cursor = $.acquireRemoteCursor("SERVER");//the server has is usinge its own cursors to rewrite data to the editor
		cursor.setState("hidden");
		cursor.setCursor($.addNewTextBlock(row, cursor),-1);
		for(var i = 0; i < DATA.length; i++){
			if(!$.rowIsVisible(i)) {
				continue;
			}
			let row = $.getRowByIndex(i);
			$.removeAllText(row);
			let node = $.addNewTextBlock(row);
			node.innerHTML = DATA[i];
		}
		if(setFocus){//To make sure the the editor didn't loose focus
			cursor.getNode().focus()
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
		$.setAbsCursorPos(pos.Row, pos.Col + i -1 -start, Cursor);

		//console.log("Total time "+(Date.now()-date));

	}




	this.OnClick = function(node,Cursor,cursorPos){
		Cursor.setCursor(node,cursorPos);
	}


	this.OnSpace = function(node,Cursor){
		var cursorPos=Cursor.getCursorPos();
		node.innerHTML=node.innerHTML.insert(" ",cursorPos);


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

	this.OnEnter = function(node, Cursor, row){

		if (!$.rowIsVisible(row) && $.rowIsAbove(row)) {
			$.updateRowNumber(1);
			return;
		}else if (!$.rowIsVisible(row)){
			return;
		}

		if(!$.insertRow(node.parentElement) && Cursor == $.localCursor) {
			//Only update visible rows if event was triggered by local users
			$.updateRowNumber(1);
			$.removeRow($.textContainer.firstChild);
		}else {
			$.removeRow($.textContainer.lastChild);
		}

		let nextNode;
		if(Cursor.getCursorPos() == node.innerHTML.length){//
			if(node.nextSibling != null){
				Cursor.setCursor(nextNode=node.nextSibling,0);
			}else{
				Cursor.setCursor(nextNode=$.addNewTextBlock(node.parentElement,Cursor),0);
			}
		}else if(Cursor.getCursorPos==0){
			nextNode = node;
		}else{
			nextNode=$.splitEditBlock(node,Cursor.getCursorPos());

			Cursor.forEachOnNode(function(cursor){//for each cursor on the same textblock

				cursor.setCursor(nextNode, cursor.getCursorPos() - Cursor.getCursorPos());
			});
			Cursor.setCursor(nextNode,0);
		}

		node = Cursor.getNode();

		while((nextNode)!=null){
			let row = nextNode.parentElement;
			let n = nextNode.nextSibling;
			if(row.nextSibling != null) { // Row may not exist
				row.nextSibling.appendChild(row.removeChild(nextNode));
				$.tryCutBlock(nextNode,Cursor);
			} else {
				row.removeChild(nextNode);
				Cursor.setCursor(node, -1); //TODO if the cursor moved outside visible screen remove/hide it
				row.appendChild(node);
			}

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
			if(cursor.getNode()) {
				cursor.setCursor(cursor.getNode(),cursor.getCursorPos());
			}
		});
	}


	this.OnBackSpace = function(node, Cursor, rowNb){

		if (rowNb != 0 && !$.rowIsVisible(rowNb) && $.rowIsAbove(rowNb)) {
			$.updateRowNumber(-1);
			return;
		}else if (!$.rowIsVisible(rowNb)){
			return;
		}

		var cursorPos=Cursor.getCursorPos();

		if(cursorPos != 0){
			Cursor.forEachOnNode(function(cursor){
				if(cursor.getCursorPos()>0){
					cursor.setCursor(cursor.getNode(), cursor.getCursorPos()-1);
				}
			});
		}

		let row = node.parentElement;

		if (cursorPos > 0){ //step 1 Cursor is not at the first position in textblock

			node.innerHTML=node.innerHTML.remove(--cursorPos,1);
			Cursor.setCursor(node,cursorPos);
			$.tryCutBlock(Cursor.getNode(),Cursor);
		}else if(node.previousSibling!=null){ //step2  Cursor is not on the first textblock

			cursorPos=node.previousSibling.innerHTML.length;
			var prevNode=node.previousSibling;
			if (cursorPos > 0) {
				Cursor.setCursor(prevNode,--cursorPos);
			} else {
				Cursor.setCursor(prevNode,0);
			}
			prevNode.innerHTML = prevNode.innerHTML.remove(cursorPos, 1);
			$.tryCutBlock(Cursor.getNode(),Cursor);
		}else if(row.previousSibling != undefined && node.previousSibling==undefined){//step 3
			//Cursor is on the first textblock and not on the first row

			if(row.previousSibling.children.length>0) {
				node = row.previousSibling.children[row.previousSibling.children.length-1];
			} else {
				$.addNewTextBlock(row.previousSibling);
			}

			Cursor.setCursor(row.previousSibling.lastChild, -1);
			while(0 < row.children.length){//move current row up, deleting the current row
				row.previousSibling.appendChild(row.removeChild(row.children[0]));
				$.tryCutBlock(Cursor.getNode(), Cursor);
			}

			$.removeRow(row);
			$.addRow(); //TODO possibly move this logic somewhere else
		} else if(row.getIndex() == 0 && $.getRowNumber(row) != 0 && $.localCursor == Cursor) { //Step 4
			$.updateRowNumber(-1);
			if ($.useServer) {
				// Return the row elemnt that needs to be synced
				return $.textContainer.firstChild;
			}
		}

		Cursor.forEach(function(cursor){
			if(cursor.getNode()) {
				cursor.setCursor(cursor.getNode(),cursor.getCursorPos());
			}
		});


		$.tryCutBlock(Cursor.getNode(), Cursor);

		$.setHighlight(node);
		if ($.useServer) {
			// Always sync the last row
			return $.textContainer.lastChild;
		}
	}


	this.OnArrowUpDown = function(node, direction, Cursor){

		let position = $.getAbsCursorPos(Cursor);
		let firstRowNumber = $.getRowNumber($.textContainer.firstChild);
		//console.log(position. + "haha " + firstRowNumber);
		if(Cursor == $.localCursor && direction < 0 && position.Row == firstRowNumber) {
			if(firstRowNumber == 0 ) return;
			$.removeRow($.textContainer.lastChild);
			$.insertBeforeRow($.textContainer.firstChild);
			$.updateRowNumber(-1);
			return $.textContainer.firstChild;
		}else if (Cursor == $.localCursor && direction > 0 && Cursor.getRowElem() == $.textContainer.lastChild) {
			$.removeRow($.textContainer.firstChild);
			$.insertRow($.textContainer.lastChild);
			$.updateRowNumber(1);
			return $.textContainer.lastChild;
		}else{
			let targetRow;
			if(direction > 0) {
				targetRow = Cursor.getRowElem().nextSibling;
			} else {
				targetRow = Cursor.getRowElem().previousSibling;
			}
			if (targetRow === null) {
				return;
			}

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

	}

	this.OnArrowUp = function(node,Cursor){
		return $.OnArrowUpDown(node, -1 ,Cursor);

	}

	this.OnArrowDown = function(node,Cursor){
		return $.OnArrowUpDown(node,+1,Cursor);
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
