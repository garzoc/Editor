

/*
 * http://perfectionkills.com/whats-wrong-with-extending-the-dom/
 *
 * */

function loadDOMExtension(){



	Element.prototype.appendChildren=function(node,count){//append multiple clones of a single node
		for(var i=0;i<count;i++){
			this.appendChildTwice(node);
		}
	}

	Element.prototype.appendChildTwice=function(node){//clone and append new element

		var newNode=node.cloneNode();
		newNode.innerHTML=node.innerHTML;

		node.copyEvents(newNode);

		this.appendChild(newNode);
		/*if(newNode.useFocus){
			this.lastChild.focus();
		}*/
	}
	/*
	 *
	 * http://stackoverflow.com/questions/36635392/how-to-appendchildelement-many-times-the-same-element#36635432
	 * */
	Element.prototype.insertBeforeTwice=function(node,nextSibling){//clone node and insert it before another element
		var newNode=node.cloneNode();
		newNode.innerHTML=node.innerHTML;
		node.copyEvents(newNode);

		this.insertBefore(newNode,nextSibling);
	}

	Element.prototype.copyEvents=function (node){
		if(this.eventListeners!==undefined){
			for(events in this.eventListeners){
				node.bindEventListener(events,this.eventListeners[events]);
			}
		}
		for(var i=0;i<this.children.length;i++){
			this.children[i].copyEvents(node.children[i]);
		}
	}

	Element.prototype.bindEventListener=function(event,func){
		this.addEventListener(event,func);
		if(this.eventListeners==undefined)this.eventListeners={};
		this.eventListeners[event]=func;

	}

	Element.prototype.getIndex=function(){
		var i=0;
		var node=this;
		while((node=node.previousElementSibling)!==null)i++;
		return i;
	}



	String.prototype.insert = function (string,index) {
		if (index > 0)
			return this.substring(0, index) + string + this.substring(index, this.length);
		else
			return string + this;
	}

	String.prototype.remove = function (pos,count) {
		return this.substring(0, pos) + this.substring(pos+count, this.length);

	}

	String.prototype.scanForWord = function (pos) {//from the char position of a string grab the whole word
		var start=1, end=1;
		if(this.charAt(pos).isWhiteSpace()){
			if((pos-start)>=0&& !this.charAt(pos-start).isWhiteSpace()){
				end=0;
			}else if( (pos+end) <this.length&& !this.charAt(pos+1).isWhiteSpace()){
				start=0;
			}
		}
		for(var i=1;i<this.length;i++){
				if(!this.charAt(pos+end).isWhiteSpace() && (pos+end) <this.length)end++;
				if(this.charAt(pos+end).isWhiteSpace() && (pos+end)>pos)end--;
				if(!this.charAt(pos-start).isWhiteSpace() && (pos-start)>=0)start++;
				if(this.charAt(pos-start).isWhiteSpace() && (pos-start)<pos)start--;
		}

		return {
			string :this.substring(pos-start,pos+end),
			start : pos-start,
			end:pos+end
		};

	}

	//Move this function to the themecontroller as it uses methods which relies on the theme object
	String.prototype.getWords = function () {//retrieve each sepearate work of a string and return as
		var word_list=[];

		for(let start = 0; start < this.length; start++){
			//console.log(i + " "+ this.length);
			if(!this.charAt(start).isWhiteSpace()){
				let end = 0;
				let x = 0;

				for(end = start; end < this.length && !this.charAt(end).isWhiteSpace(); end++){
						let c,bool;

						bool = (c=theme.keyWordSpace(this.substring(end, this.length).trim())) >
							   (theme.ignoreSpace(this.substring(end, this.length).trim())? c : 0);
						if(bool){
							end += c - 1;//plus one will be added by the for loop argument;
							continue;//skip the ingore space check
						}

						x = theme.ignoreSpace(this.substring(end, this.length));
						if(x > 0) break;
						//else x=n
				}
				var str =this.substring(start, end);
				if(str!=""){
					word_list.push(
						{
							string:str,
							start: start,
							end: end
						}
					);//push new struct that contains the string as well as its position in the entire string
				}
				if(x!=0){
					word_list.push(
						{
						string: this.substring(end, end+x),
						start: end,
						end: end+x
						}
					);
					end += x -1;
				}
				start=end;
			}

		}
		return word_list;
	}



	String.prototype.isWhiteSpace = function(){//if the string only contains whitespaces or ignored characters
		//if(theme.ifIgnoreChar(this))return true;
		if(this.length>0 && this.trim().length===0) return true;
			return false;
	}

	var strLengthTest;

	String.prototype.width =function(){
		if(!strLengthTest){
			strLengthTest = strLengthTest = document.createElement("span");
			strLengthTest.setAttribute("id","testStringLength");
			document.body.appendChild(strLengthTest);
		}
		strLengthTest.innerHTML=this;
		return strLengthTest.scrollWidth;
	}




}

