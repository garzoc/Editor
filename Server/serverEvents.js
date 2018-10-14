var pass="pass"
var Git = require("git");

/*
 * http://stackoverflow.com/questions/5955891/has-anyone-implemented-a-git-clone-or-interface-library-using-nodejs
 * */

module.exports=new function(){
	
	
	/*Git("data");
	Git.init("garzoc");
	Git.pull("https://github.com/garzoc/test.git","master");
	Git.commit("test");
	/*http://stackoverflow.com/questions/5343068/is-there-a-way-to-skip-password-typing-when-using-https-on-github*/
	
	//Git.push("https://garzoc:"+pass+"@github.com/garzoc/test.git");

	
	var TEXT=["Hello World"];
	
	
	
	
	String.prototype.insert = function (string,index) {
		if (index > 0)
			return this.substring(0, index) + string + this.substring(index, this.length);
		else
			return string + this;
	}
	
	String.prototype.remove = function (pos,count) {
		return this.substring(0, pos) + this.substring(pos+count, this.length);	
	}
	
	
	this.passToEvents=function(messageContext,CB){
				
		if(messageContext.Action!=undefined && this[messageContext.Action]!=undefined){
			this[messageContext.Action](messageContext,CB,CB.Cursor);
		}else{
			CB.forward(messageContext);
		}
		
		/*for(var i=0;i<TEXT.length;i++){
			console.log(TEXT[i]);
		}*/
		
	
	}
	
	
	
	
	
	this.OnTab=function(e,API,Cursor){
		for(var i=0;TEXT.length<=e.Row;i++){
			TEXT.push("");
		}
		TEXT[e.Row]=TEXT[e.Row].insert("\t",e.Col);
		
		var CursorSet=Cursor.getCursorSet();
		for(c in CursorSet){
			if(Cursor.getRow()==CursorSet[c].getRow() && Cursor.getIndex() <= CursorSet[c].getIndex()){
				
				CursorSet[c].setIndex(CursorSet[c].getIndex()+1);
			}
		}
		//Cursor.setIndex(Cursor.getIndex()+1);
		
		API.forward(e);
		
	}
	
	
	this.OnSpace=function(e,API,Cursor){
		for(var i=0;TEXT.length<=e.Row;i++){
			TEXT.push("");
		}
		TEXT[e.Row]=TEXT[e.Row].insert(" ",e.Col);
		
		var CursorSet=Cursor.getCursorSet();
		for(c in CursorSet){
			if(Cursor.getRow()==CursorSet[c].getRow() && Cursor.getIndex() <= CursorSet[c].getIndex()){
				
				CursorSet[c].setIndex(CursorSet[c].getIndex()+1);
			}
		}
		//Cursor.setIndex(Cursor.getIndex()+1);
		
		
		API.forward(e);
	}
	
	this.OnEnter=function(e,API,Cursor){
		for(var i=0;TEXT.length<=e.Row;i++){
			TEXT.push("");
		}
		TEXT.splice(e.Row+1,0,"");
		var string=TEXT[e.Row].substring(e.Col,TEXT[e.Row].length);
		TEXT[e.Row]=TEXT[e.Row].substring(0,e.Col);
		TEXT[e.Row+1]=string;
		
		var CursorSet=Cursor.getCursorSet();
		for(c in CursorSet){
			if(Cursor.getRow()==CursorSet[c].getRow() && Cursor.getIndex() <= CursorSet[c].getIndex()){
				CursorSet[c].setIndex(CursorSet[c].getIndex()-e.Col);
				CursorSet[c].setRow(CursorSet[c].getRow()+1);
			}
		}
		
		
		API.forward(e);
		//Cursor.setPos(Cursor.getRow(),Cursor.getPos()+1);
	}
	
	this.OnBackSpace=function(e,API,Cursor){
		if(e.Row!=0)var length=TEXT[e.Row-1];
		for(var i=0;TEXT.length<=e.Row;i++){
			TEXT.push("");
		}
		if(e.Col!=0){
			TEXT[e.Row]=TEXT[e.Row].remove(e.Col-1,1);
			var CursorSet=Cursor.getCursorSet();
			for(c in CursorSet){
				if(Cursor.getRow()==CursorSet[c].getRow() && Cursor.getIndex() <= CursorSet[c].getIndex()){
					CursorSet[c].setIndex(CursorSet[c].getIndex()-1);
				}
			}
			//Cursor.setIndex(Cursor.getIndex()-1);
		}else if(e.Row!=0){
			var prevRowLength=TEXT[e.Row-1].length;
			TEXT[e.Row-1]+=TEXT[e.Row];
			TEXT.splice(e.Row,1);
			var CursorSet=Cursor.getCursorSet();
			for(c in CursorSet){
				if(Cursor.getRow()==CursorSet[c].getRow() && Cursor.getIndex() <= CursorSet[c].getIndex()){
					CursorSet[c].setIndex(CursorSet[c].getIndex()+prevRowLength);
					CursorSet[c].setRow(CursorSet[c].getRow()-1);
				}
			}
			//Cursor.setIndex(Cursor.getIndex()+e.absPos.Col);
			//Cursor.setRow(Cursor.getRow()-1);
		
		}
		
		
		
		
		
		API.forward(e);
	}
	

	this.OnAddChar=function(e,API,Cursor){
		for(var i=0;TEXT.length<=e.Row;i++){
			TEXT.push("");
		}
		//console.log(e.Char);
		TEXT[e.Row]=TEXT[e.Row].insert(e.Char,e.Col);
		//var cursors=[Cursor];
		var CursorSet=Cursor.getCursorSet();
		for(c in CursorSet){
			//console.log(c);
			
			if(Cursor.getRow()==CursorSet[c].getRow() && Cursor.getIndex() <= CursorSet[c].getIndex()){
				
				CursorSet[c].setIndex(CursorSet[c].getIndex()+1);
			}
		}
		//Cursor.setIndex(Cursor.getIndex()+1);
		
	
		API.forward(e);
	}
	
	this.OnPaste=function(e,API,Cursor){//ubsupported
		for(var i=0;TEXT.length<=e.Row;i++){
			TEXT.push("");
		}
		var x={};
		x.Row=e.Row;
		x.absPos=e.absPos;
		x.fun={};
		x.fun.forward=function(m){};
		for(var i=0;i<e.Char.length;i++){
			x.Char=e.Char.charAt(i);
			if(e.Char.charCodeAt(i)!=10){
				this.OnAddChar(x,API,Cursor);
				x.absPos.Col++;
			}else{
				this.OnEnter(x,API,Cursor);
				x.absPos.Col=0;
				x.absPos.Row++;
				x.Row++;
			}
		}
		//TEXT[e.Row]=TEXT[e.Row].insert(e.Char,e.absPos.Col);
		
		e.fun.forward(e);
	}
	
	this.OnFullSync=function(e,API){
		var messageContext={};
		messageContext.Action="OnFullSync";
		messageContext.Text=TEXT;
		//console.log(messageContext);
		API.respond(messageContext);
	}
	
	
	
	this.OnRowSync=function(e,api){
		var messageContext={};
		messageContext.Action="OnRowSync";
		messageContext.Row=e.Row;
		messageContext.Text=TEXT[e.Row];
		e.fun.sendToAll(messageContext);
		
	}
	
	this.OnSave=function(e,api){
		var fileContent=TEXT[0];
		for(var i=1;i<TEXT.length;i++){
			fileContent+="\n"+TEXT[i];
		
		}

		var fs = require('fs');
		fs.writeFile("store/test.txt", fileContent, function(err) {
			if(err) {
				return console.log(err);
			}
	
		});
		console.log("File Saved");
	}
	
	this.OnLoad=function(e,api){
		
		var fs = require('fs');
		fs.readFile("store/test.txt", function (err, data) {
			if (err) {
				throw err; 
			}
		});
		
		TEXT=[""];
		var string=fs.toString();
		var currentRow=0;
		for(var i=0;i<string.length;i++){
			if(string.charCodeAt(i)==10){
				TEXT.push("");
				currentRow++;
			}else{
				TEXT[currentRow]+=string.charAt(i);
			}
		}
		
		if(e!=undefined)OnFullSync(e);
	}
	

}