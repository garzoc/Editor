const standardServerPort=8000;
const startingRows=4;
const useServer=false;
const EditorTheme="Test";
const MaxRecursiveCalls=3;//the maximum recursive calls that can be done one the tryCut function



var cursorCounter=0;
var Cursor=function(){
	var cursorID=cursorCounter++;
	var cursor=document.createElement('div');
	cursor.setAttribute("class","cursor");
	var currentNode;
	
	var cursorGroup; //group of cursor used for for each
	
	var positionInTextBlock=0;
	
	this.setCursor=function setCursor(node,textPosition, no_delete){
		cursor.style.top=node.offsetTop+"px";
		if(currentNode!=undefined && currentNode.parentElement!=null && currentNode.getIndex()!=node.getIndex() && currentNode.innerHTML=="" && !no_delete)currentNode.parentElement.removeChild(currentNode);
		currentNode=node;
		
		if(textPosition===-1){
			cursor.style.left=(node.offsetLeft+node.scrollWidth)+"px"
			positionInTextBlock=node.innerHTML.length;
		}else{
			var text = node.innerHTML.substring(0,textPosition);
			cursor.style.left=(node.offsetLeft+text.width())+"px";
			positionInTextBlock=textPosition;
		}
	};
	this.getNode=function(){//return the current block of text which is being edited
		return currentNode;
	}
	this.getID=function(){
		return cursorID;
	}
	this.getCursorPos=function(){return positionInTextBlock;};
	
	this.getRow=function(){//add method for getting the prev & next row
		return this.getNode().parentElement.getIndex();
	}
	
	this.getRowElem = function(){
		return this.getNode().parentElement;
	}
	
	this.getNext = function(){
		return this.getNode().nextSibling;
	}
	
	this.getPrev = function(){
			return this.getNode().previousSibling;
	}
	
	this.getLastFromPrevRow = function (){
		return this.getRowElem().previousSibling.lastChild;
	}
	
	this.getLastFromNextRow = function (){
		return this.getRowElem().nextSibling.lastChild;
	}
	
	this.setState=function(visibility){cursor.style.visibility=visibility;}
	
	this.getElement=function(){return cursor;};
	
	
	this.setGroup = function(group){
		cursorGroup = group;
	}
	
	this.forEachOnRow = function(CB){
		this.forEach(function(cursor,$this){
			if($this.getRowElem() != null && cursor.getRowElem() != null && $this.getID()!= cursor.getID() && $this.getRow() == cursor.getRow()){
				CB(cursorGroup[c],$this);
			}
		});
	}
	this.forEach = function(CB){
		if(cursorGroup!=undefined){
			for(c in cursorGroup){
				CB(cursorGroup[c],this);
			}
		}else{
			console.log("Missing cursor group");
		}
	
	}
	
	this.forEachOnNode = function(CB){
		var node = this.getNode();
		this.forEachOnRow(function(cursor,$this){
			if(node == cursor.getNode()){
				CB(cursor, $this);
			}
		});
	
	}
	
	
}



/*
 * LOADING/CREATING DOM ELEMENTS
 */
var textField=document.getElementsByClassName("Editor_Instance")[0];
var textField1=document.getElementsByClassName("Editor_Instance")[1];



/*
 * 
 * 
 * Set of DOM elements that will acts as templates
 * 
 * 
 * */ 

	


//http://stackoverflow.com/questions/3656467/is-it-possible-to-focus-on-a-div-using-javascript-focus-function#3656524



var theme=new ThemeManager();

/*
 *======================================
 */



var Editor=function(){//Instance should be a div
	
	var Instance = null;
	
	
	var textPasteField = document.createElement("textarea");//document.getElementById("pasteField");
	textPasteField.id="pasteField";
	
	var rowNumberContainer = //defininf local variabesl like this prevents global declarations
	this.rowNumberContainer =document.createElement("div");
	rowNumberContainer.setAttribute("id","Editor_Row-Number_Frame");
	
	var rowNumber =
	this.rowNumber = document.createElement("span");
		rowNumber.setAttribute("class","Editor_Row-Number");

	var textRow =
	this.textRow = document.createElement('div');
		textRow.setAttribute("class","Editor_Text-Row");


	
	//textRow.appendChild(rowNumber);
	var textBlock =
	this.textBlock = document.createElement('span');
	textBlock.setAttribute("class","text_block");
	textBlock.setAttribute("tabindex","-1");//allow the div to focused
	
	var textContainer =
	this.textContainer = document.createElement("div");
	textContainer.setAttribute("id","Editor_Text-Frame");
	
	
	this.useServer = useServer;	

	var rowCount=0;
	var localCursor = this.localCursor = new Cursor();
	
	//console.log("this "+localCursor);
	var remoteCursor = this.remoteCursor = {};//setup a que of remote cursors
	remoteCursor["LOCAL"]=localCursor;//when running with server, each input will be routed through the server before being displayed
	
	localCursor.setGroup(remoteCursor);
	
	

	
	var addRow =
	this.addRow = function (){
		textContainer.appendChildTwice(textRow);
		rowNumberContainer.appendChildTwice(rowNumber);
	}

	var insertRow =
	this.insertRow =function insertRow(node){
		if(node.nextSibling!=null){
			node.parentElement.insertBeforeTwice(textRow,node.nextSibling);
			rowNumberContainer.appendChildTwice(rowNumber);
		}else
			addRow();
	}


	var removeRow =
	this.removeRow = function removeRow(node){	
		node.parentElement.removeChild(node);
		rowNumberContainer.removeChild(rowNumberContainer.firstChild);
	}
	var removeAllRows =
	this.removeAllRows = function(){	
		while(textContainer.firstChild){
			removeRow(textContainer.firstChild);
		}
	}
	
	var addNewTextBlock =
	this.addNewTextBlock = function(Row){
		textBlock.innerHTML="";
		Row.appendChildTwice(textBlock);
		return Row.lastChild;
		

	}
	
	var editTextBlock =
	this.editTextBlock = function editTextBlock(node){//call this from the event layer to prevent another editor instance from being focused
		if(localCursor.getNode()!=undefined)localCursor.getNode().focus();
	}
	
	var mergeTextBlock =
	this.mergeTextBlock = function(Head,Tail){
		if(Head!=null && Tail!=null){
			Head.innerHTML=Head.innerHTML+Tail.innerHTML;
			if(Tail.parentElement!=null)Tail.parentElement.removeChild(Tail);
			setHighlight(Head);
			return Head;
		}
		return null;
	}
	
	console.log("tesintg")
		
	var ifCanMerge =
	this.ifCanMerge = function (Head,Tail){
		/*if(Head.innerHTML == "-f"){
			console.log(Head.innerHTML.trim() +" "+((n = theme.ignoreSpace("-")) == 0 || (n > 0 && n != "-".length)));
		}*/
		
		var nextNode = Tail.nextSibling;
		var prevNode = Head.prevSibling;
		
		Head = Head.innerHTML;
		Tail = Tail.innerHTML;
		
		
		
		if(theme.ignoreSpace(Head) < theme.ignoreSpace(Head + Tail)){
			//console.log("merge check 1: "+theme.ignoreSpace(Head.trim()) + " "+theme.ignoreSpace(Head.trim() + Tail.trim()));
			console.log(Head.trim() + " & "+Tail.trim());
			//console.log(Head.trim() + Tail.trim());
			return true;
		}
		
		var n = 0;
		
		//console.log(Head+" "+Tail);
		//if(!theme.isIgnored(Head+Tail) || prevNode.innerHTML.slice(-1).isWhiteSpace() &&( nextNode != null ? nextNode.innerHTML.charAt(0).isWhiteSpace():true))
		
	
		
		if(theme.ignoreSpace(Head.trim()) ==  Head.trim().length && theme.ignoreSpace(Tail.trim()) ==  Tail.trim().length  && theme.isKeyword(Head+Tail)){
			console.log("merge check 2:");
				return true;
		}
		
		
		if(Tail!=null && ((!Head.charAt(Head.length-1).isWhiteSpace() && !Tail.charAt(0).isWhiteSpace() && ((n = theme.ignoreSpace(Head.trim())) == 0 || (n > 0 && n != Head.trim().length)) && theme.ignoreSpace(Tail.trim()) == 0) || (!theme.isKeyword(Tail) && !theme.isKeyword(Head)))){
			console.log("merge check 3:");
			console.log(Head.trim() + " & "+Tail.trim());
			return true;
		}
		return false;
		
		
	}

	
	
	var closeEditBlock =
	this.closeEditBlock = function (node){
		if(node.value!=""){
			textBlock.innerHTML=node.innerHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;");;
			node.parentElement.insertBeforeTwice(textBlock,node.nextSibling);
			node.parentElement.removeChild(node);
		}else{
			node.parentElement.removeChild(node);
		}
	}
	
	
	

	var splitEditBlock =
	this.splitEditBlock = function (node,position){
		var newstr=node.innerHTML.substring(position,node.innerHTML.length);//changes when implementing collaboration
		
		node.innerHTML=node.innerHTML.substring(0,position);
		textBlock.innerHTML=newstr;
		var nextNode;
		
		if(node.nextSibling!==undefined&&node.nextSibling!==null){
			
			node.parentElement.insertBeforeTwice(textBlock,node.nextSibling);
			nextNode=node.nextSibling;
		}else{
			node.parentElement.appendChildTwice(textBlock);
			nextNode=node.parentElement.lastChild;
			
			
		}
		setHighlight(node);
		setHighlight(nextNode);
		return nextNode;

	}
	
	
	



	var acquireRemoteCursor =
	this.acquireRemoteCursor = function (ID){
		if(remoteCursor[ID]==undefined){
			remoteCursor[ID]=new Cursor();
			Instance.appendChild(remoteCursor[ID].getElement());
			remoteCursor[ID].setGroup(remoteCursor);
		}
			
		return remoteCursor[ID];
	}

	var getAbsCursorPos =
	this.getAbsCursorPos =function (Cursor){
		var index=Cursor.getNode().getIndex();
		var sum=0;
		for(var i=0;i<index;i++){
			sum+=Cursor.getNode().parentElement.children[i].innerHTML.length;
		}
		sum+=Cursor.getCursorPos();
		return{
			Row:Cursor.getNode().parentElement.getIndex(),
			Col:sum
		
		};
	}
	
	var setAbsCursorPos =
	this.setAbsCursorPos = function (Row,Col,C){
		var textBlock=textContainer.children[Row].children;
		var sum=0;
		for(var i=0;i<textBlock.length;i++){
			//console.log(Col+" vs "+(sum+textBlock[i].innerHTML.length));
			if(Col <= sum+textBlock[i].innerHTML.length){
				C.setCursor(textBlock[i],Col-sum);
				return true;
			}else{
				sum+=textBlock[i].innerHTML.length;
			}
		}
		console.log("failed to set pos");
		return false;
	}
	
	
	

	var getDefaultEditorTextColor =
	this.getDefaultEditorTextColor = function (){
		var color =theme.getDefaultTextColor();
		if(color==undefined) return "#FFFFFF";
		return color;

	}

	

	var setHighlight =
	this.setHighlight = function (node){
		var syntaxcolor=theme.getColorHighlight(node.innerHTML.trim());
		if(syntaxcolor!=undefined){
			node.style.color=syntaxcolor;
		}else{
			node.style.color = getDefaultEditorTextColor();
		}

	}


	var RGBtoHex =
	this.RGBtoHex = function (RGB) {
		if (/^#[0-9A-F]{6}$/i.test(RGB)) return RGB;
		RGB = RGB.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		function Hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
		}
		return "#" + (Hex(RGB[1]) + Hex(RGB[2]) + Hex(RGB[3])).toUpperCase();
	}



	var tryCutBlock =
	this.tryCutBlock = function (node,Cursor,recursionLevel){
		
		var allPos=[];
		var absPos = getAbsCursorPos(Cursor);//Keep this
		
		/*Cursor.forEachOnRow(function(cursor){//Quick fix attempt to fix problems with the themecontroller
			allPos.push(getAbsCursorPos(cursor));
		});
		if(Cursor.getNext() != null) mergeTextBlock(node,Cursor.getNext());
		if(Cursor.getPrev() != null)mergeTextBlock(Cursor.getPrev(),node);
		
		var counter =0;
		Cursor.forEachOnRow(function(cursor){
			setAbsCursorPos(allPos[counter].Row,allPos[counter++].Col,cursor);
		});
		setAbsCursorPos(absPos.Row,absPos.Col,Cursor);
		*/
		var words=node.innerHTML.getWords();
		
		var offset = 0;
		words.forEach(function(word){
			//console.log(word.string + " "+ theme.isKeyword(word.string) + " "+ !theme.isKeyword(node.innerHTML));
			if(theme.isKeyword(word.string) && !theme.isKeyword(node.innerHTML)){
				//console.log(word.string)
				if(word.start!=0){
					node=splitEditBlock(node, word.start - offset);
					offset += word.start - offset;
				}
				setAbsCursorPos(absPos.Row,absPos.Col,Cursor);
				
				if(theme.isKeyword(word.string) && !theme.isKeyword(Cursor.getNode().innerHTML)){
					node=splitEditBlock(node,word.end -offset);
					offset +=word.end -offset ;
				}
				
				Cursor.forEachOnNode(function(cursor){
					if(cursor.getCursorPos >= word.end){
						cursor.setCursorPos(node,cursor.getNode.innerHTML.length);
					}
				});
				
				setAbsCursorPos(absPos.Row,absPos.Col,Cursor);
				
				if(recursionLevel!=0)tryCutBlock (node,Cursor,0);

			}
		
		});
		
		cursorPos=Cursor.getCursorPos();
		if(Cursor.getNode().nextSibling!=null && ifCanMerge(Cursor.getNode(),Cursor.getNode().nextSibling)){//merge
			//console.log("merge1")
			Cursor.forEachOnRow(function(cursor){
				if(cursor.getNode().getIndex() - 1 == Cursor.getNode().getIndex()){
					cursor.setCursor(cursor.getPrev(),cursor.getPrev().innerHTML.length + cursor.getCursorPos());
				}
			});			
			node=mergeTextBlock(Cursor.getNode(),Cursor.getNext());
			
			Cursor.forEachOnRow(function(cursor){
					cursor.setCursor(cursor.getNode(), cursor.getCursorPos());
			});
			
			Cursor.setCursor(Cursor.getNode(),Cursor.getCursorPos());
		}
		
		if(Cursor.getNode().previousSibling!=null && ifCanMerge(Cursor.getNode().previousSibling,Cursor.getNode())){//merge
			//console.log("merge2");
			
			Cursor.forEachOnNode(function(cursor){
					cursor.setCursor(cursor.getPrev(), cursor.getPrev().innerHTML.length + cursor.getCursorPos());
			});
			Cursor.setCursor(Cursor.getPrev(), Cursor.getPrev().innerHTML.length + Cursor.getCursorPos());
			
			node=mergeTextBlock(Cursor.getNode(),Cursor.getNext());
			
			Cursor.forEachOnRow(function(cursor){
					cursor.setCursor(cursor.getNode(), cursor.getCursorPos());
			});
			
			Cursor.setCursor(Cursor.getNode(),Cursor.getCursorPos());
			if(recursionLevel!=0 && node!=null)tryCutBlock(node,Cursor,0);
		}

	}
	
	
	this.setup=function(Editor_Instance,EditorStack){
		Instance = Editor_Instance;
		Editor_Instance.appendChild(this.rowNumberContainer);
		Editor_Instance.appendChild(textContainer);
		Editor_Instance.appendChild(this.localCursor.getElement());
		for(var i=0;i<10;i++){
			addRow();
		}
	
		localCursor.setCursor(this.addNewTextBlock(textContainer.children[0],localCursor),0);
	
	
		if(useServer)EditorStack.initSocket();//only time where a higher level has to call a lower level call
	
		
	}
	
	
	

}









/*
 * http://stackoverflow.com/questions/7444451/how-to-get-the-actual-rendered-font-when-its-not-defined-in-css
 * http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
 * http://www.w3schools.com/tags/canvas_measuretext.asp
 * */

/*function getStringWidth(node,string) {
	console.log("nnooooooo");
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = getComputedStyle(node)['font-size']+" "+getComputedStyle(node)['font-family'];
    //console.log("hello"+);
    var metrics = context.measureText(string);
    return metrics.width;
}

function getTextWidth(node) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = getComputedStyle(node)['font-size']+" "+getComputedStyle(node)['font-family'];
    var metrics = context.measureText(node.innerHTML);
    return metrics.width;
}*/


function newEditor() {
	

	Controller.prototype = new Editor();
	Controller.prototype.constructor = Controller;
	if(useServer){
		Network.prototype = new Controller();
		Network.prototype.constructor = Network;
		Event.prototype = new Network();
	}else{
		Event.prototype = new Controller();
	}
	Event.prototype.constructor = Event;

	return new Event();
}





window.onload=function(){
	loadDOMExtension();
	theme.loadTheme(EditorTheme);
	
	
	
	
	
	
	var editor = new newEditor();
	editor.setup(textField,editor);
	
	//console.log("asa".test());
	
	var editor1 = new newEditor();
	editor1.setup(textField1,editor1);
	
	
	
}
