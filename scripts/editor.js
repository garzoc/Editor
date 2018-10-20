const standardServerPort=8000;
const startingRows=4;
const useServer=true;
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
		const node = this.getNode();
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
const Field=document.getElementsByClassName("Editor_Instance")[0];
const Field1=document.getElementsByClassName("Editor_Instance")[1];

	


//http://stackoverflow.com/questions/3656467/is-it-possible-to-focus-on-a-div-using-javascript-focus-function#3656524



var theme=new ThemeManager();

/*
 *======================================
 */



var Interface=function(){//Instance should be a div
	
	let Instance = null;
	
	
	const textPasteField = this.textPasteField = document.createElement("textarea");//document.getElementById("pasteField");
	textPasteField.id="pasteField";
	
	const rowNumberContainer = //defininf local variabesl like this prevents global declarations
	this.rowNumberContainer =document.createElement("div");
	rowNumberContainer.setAttribute("id","Editor_Row-Number_Frame");
	
	const rowNumber =
	this.rowNumber = document.createElement("span");
		rowNumber.setAttribute("class","Editor_Row-Number");

	const textRow =
	this.textRow = document.createElement('div');
		textRow.setAttribute("class","Editor_Text-Row");


	
	//textRow.appendChild(rowNumber);
	const textBlock =
	this.textBlock = document.createElement('span');
	textBlock.setAttribute("class","text_block");
	textBlock.setAttribute("tabindex","-1");//allow the div to focused
	
	const textContainer =
	this.textContainer = document.createElement("div");
	textContainer.setAttribute("id","Editor_Text-Frame");
	
	
	this.useServer = useServer;	

	var rowCount=0;
	const localCursor = this.localCursor = new Cursor();
	
	//console.log("this "+localCursor);
	const remoteCursor = this.remoteCursor = {};//setup a que of remote cursors
	remoteCursor["LOCAL"]=localCursor;//when running with server, each input will be routed through the server before being displayed
	
	localCursor.setGroup(remoteCursor);
	
	

	
	const addRow =
	this.addRow = function (){
		textContainer.appendChildTwice(textRow);
		rowNumberContainer.appendChildTwice(rowNumber);
	}

	const insertRow =
	this.insertRow =function insertRow(node){
		if(node.nextSibling!=null){
			node.parentElement.insertBeforeTwice(textRow,node.nextSibling);
			rowNumberContainer.appendChildTwice(rowNumber);
		}else
			addRow();
	}


	const removeRow =
	this.removeRow = function removeRow(node){	
		node.parentElement.removeChild(node);
		rowNumberContainer.removeChild(rowNumberContainer.firstChild);
	}
	
	const removeAllRows =
	this.removeAllRows = function(){	
		while(textContainer.firstChild){
			removeRow(textContainer.firstChild);
		}
	}
	
	const addNewTextBlock =
	this.addNewTextBlock = function(Row){
		textBlock.innerHTML="";
		Row.appendChildTwice(textBlock);
		return Row.lastChild;
		

	}
	
	const editTextBlock =
	this.editTextBlock = function editTextBlock(node){//call this from the event layer to prevent another editor instance from being focused
		if(localCursor.getNode()!=undefined)localCursor.getNode().focus();
	}
	
	const mergeTextBlock =
	this.mergeTextBlock = function(Head,Tail){
		if(Head!=null && Tail!=null){
			Head.innerHTML=Head.innerHTML+Tail.innerHTML;
			if(Tail.parentElement!=null)Tail.parentElement.removeChild(Tail);
			setHighlight(Head);
			return Head;
		}
		return null;
	}
	
	//console.log("tesintg")
		
	const ifCanMerge =
	this.ifCanMerge = function (Head,Tail){
		/*if(Head.innerHTML == "-f"){
			console.log(Head.innerHTML.trim() +" "+((n = theme.ignoreSpace("-")) == 0 || (n > 0 && n != "-".length)));
		}*/
		
		
		var nextNode = Tail.nextSibling;
		var prevNode = Head.prevSibling;
		
		Head = Head.innerHTML;
		Tail = Tail.innerHTML;
		
		
		if(Head.trim() == "" || Tail.trim()==""){
			return true;
		}
		
		
		if(theme.ignoreSpace(Head) < theme.ignoreSpace(Head + Tail)){
			//console.log("merge check 1:");
			return true;
		}
		
		var n = 0;
		
		//console.log(Head+" "+Tail);
		//if(!theme.isIgnored(Head+Tail) || prevNode.innerHTML.slice(-1).isWhiteSpace() &&( nextNode != null ? nextNode.innerHTML.charAt(0).isWhiteSpace():true))
		
	
		
		if(theme.ignoreSpace(Head.trim()) ==  Head.trim().length && theme.ignoreSpace(Tail.trim()) ==  Tail.trim().length  && theme.isKeyword(Head+Tail)){
			//console.log("merge check 2:");
				return true;
		}
		
		
		if(Tail!=null && ((!Head.charAt(Head.length-1).isWhiteSpace() && !Tail.charAt(0).isWhiteSpace() && ((n = theme.ignoreSpace(Head.trim())) == 0 || (n > 0 && n != Head.trim().length)) && ((n = theme.ignoreSpace(Tail.trim())) == 0 || n!= Tail.trim().length)) || (!theme.isKeyword(Tail) && !theme.isKeyword(Head)))){
			//console.log("merge check 3:");
			//console.log(Head.trim() + " & "+Tail.trim());
			return true;
		}
		return false;
		
		
	}

	
	
	const closeEditBlock =
	this.closeEditBlock = function (node){
		if(node.value!=""){
			textBlock.innerHTML=node.innerHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;");;
			node.parentElement.insertBeforeTwice(textBlock,node.nextSibling);
			node.parentElement.removeChild(node);
		}else{
			node.parentElement.removeChild(node);
		}
	}
	
	
	

	const splitEditBlock =
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
	
	
	



	const acquireRemoteCursor =
	this.acquireRemoteCursor = function (ID){
		if(remoteCursor[ID]==undefined){
			remoteCursor[ID]=new Cursor();
			Instance.appendChild(remoteCursor[ID].getElement());
			remoteCursor[ID].setGroup(remoteCursor);
		}
			
		return remoteCursor[ID];
	}

	const getAbsCursorPos =
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
	
	const setAbsCursorPos =
	this.setAbsCursorPos = function (Row,Col,C){
		var textBlock=textContainer.children[Row].children;
		var sum=0;
		for(let i=0;i<textBlock.length;i++){
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
	
	
	

	const getDefaultEditorTextColor =
	this.getDefaultEditorTextColor = function (){
		var color =theme.getDefaultTextColor();
		if(color==undefined) return "#FFFFFF";
		return color;

	}

	

	const setHighlight =
	this.setHighlight = function (node){
		var syntaxcolor=theme.getColorHighlight(node.innerHTML.trim());
		if(syntaxcolor!=undefined){
			node.style.color=syntaxcolor;
		}else{
			node.style.color = getDefaultEditorTextColor();
		}

	}


	const RGBtoHex =
	this.RGBtoHex = function (RGB) {
		if (/^#[0-9A-F]{6}$/i.test(RGB)) return RGB;
		RGB = RGB.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		function Hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
		}
		return "#" + (Hex(RGB[1]) + Hex(RGB[2]) + Hex(RGB[3])).toUpperCase();
	}



	const tryCutBlock =
	this.tryCutBlock = function (node,Cursor,recursionLevel){
		var absPos = getAbsCursorPos(Cursor);//Keep this
	
		var words=node.innerHTML.getWords();
		//console.log(words);
		var offset = 0;
		words.forEach(function(word){
			//console.log(word.string + " "+ theme.isKeyword(word.string) + " "+ !theme.isKeyword(node.innerHTML));
			//console.log(word.string);
			if(theme.isKeyword(word.string) && !theme.isKeyword(node.innerHTML)){
				//console.log(word.string)
				if(word.start!=0){
					node=splitEditBlock(node, word.start - offset);
					offset += word.start - offset;
				}
				setAbsCursorPos(absPos.Row,absPos.Col,Cursor);
				
				if(theme.isKeyword(word.string) && !theme.isKeyword(Cursor.getNode().innerHTML) && (word.end - offset) != node.innerHTML.length){
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
		var merged = false;
		var once;
		once = false;
		do{
			merged = false;
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
				merged = true;
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
				
				if(recursionLevel!=0 && node!=null && !once){
					//once = true;
					tryCutBlock(node,Cursor,0);
				}
				merged = true;
			}
			
			
			
		
		}while(merged);
		//console.log(Cursor.getNode().parentElement);
		//if(Cursor.getNext()!=null)setHighlight(Cursor.getNext());
		//if(Cursor.getPrev()!=null)setHighlight(Cursor.getPrev());

	}
	
	
	this.setup=function(Editor_Instance,EditorStack){
		Instance = Editor_Instance;
		Editor_Instance.appendChild(this.rowNumberContainer);
		Editor_Instance.appendChild(textContainer);
		Editor_Instance.appendChild(this.localCursor.getElement());
		Editor_Instance.appendChild(textPasteField);
		for(let i=0;i<10;i++){
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


function Editor() {
	

	Controller.prototype = new Interface();
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
	
	
	var editor = new Editor();
	editor.setup(Field,editor);
	
	
	var editor1 = new Editor();
	editor1.setup(Field1,editor1);
	
	
	
}
