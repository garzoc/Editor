
module.exports = new function Cursor (ID){
	
	
	if(Cursor.CursorSet==undefined){
		Cursor.CursorSet={};
	}
	
	function isRegistered(ID){
		return Cursor.CursorSet[ID]!=undefined;
	}
	
	
	
	function validID(ID){
		return ID!=null && ID!=undefined && ID!="SERVER" && ID!="LOCAL";
	}
	
	function UNREGISTER(ID){
		if(validID(ID) && isRegistered(ID)){
			delete Cursor.CursorSet[ID];//=undefined;
		}
	}
	
	
	
	function REGISTER(ID,C){
		Cursor.CursorSet[ID]=C;
	}
	
	
	this.create=function(ID){
		if(!isRegistered(ID)) {
			var Cur=new Cursor(ID);
			
			REGISTER(ID,Cur);
			return Cur;
			
		};
		return null;
	}
	
	if(validID(ID) && !isRegistered(ID)){
		
		var row=-1;
		var index=-1;
		
		this.setPos=function(ROW,POS){
			index=POS;
			row=ROW;
		}
		
		this.getIndex=function(){
			return index;
		}
		
		this.setIndex=function(INDEX){
			index=INDEX;
		}
		
		this.getRow=function(){
			return row;
		}
		
		this.setRow=function(Row){
			row=Row;
		}
		
		this.match=function(ROW,POS){
			return POS==index && ROW==row;
		}
		
		this.isset=function(){
			return row!=-1 && index!=-1;
		}
		
		this.getID=function(){
			return ID;
		}
		
		this.unregister=function(){
			UNREGISTER(ID);
		}
		
		this.getCursorSet=function (){
			return Cursor.CursorSet;
		}
	}else{
		return null;
	}
	
	

}
