

function Network(){
	var socket=null;
	var $ = this;
	this.initSocket = function(){
		socket=new WebSocket("ws://127.0.0.1:8000/IDE");
		
		//socket=new WebSocket("ws://192.168.1.20:8000/IDE");
		socket.onopen=function(e){
			console.log("Established contact with server");
			console.log("Sending data request");
			send("OnFullSync");
			
		};

		socket.onmessage=function(e){
			//console.log(e.data.length);
			var messageContext=JSON.parse(e.data);
			

			
			if(messageContext.Action!=undefined)
				processMessage(messageContext);
		};

		socket.onclose=function(){
			/*var test=setTimeout(function(){
				initSocket();
				//socket=new WebSocket("ws://192.168.1.4:8000/IDE");
			},1000)*/
			console.log("quit");
		};
		
		socket.onerror = function(){
			console.log("Error");
		}
	}


	var send =
	this.send = function(Action,Node,Character){
		var messageContext=new Object;
		messageContext.ID="TESTER";
		messageContext.Action=Action;
		//console.log(Action+" - "+Node);
		if(Node!=null){ 
			var position=$.getAbsCursorPos($.localCursor);
			messageContext.Row=position.Row;
			messageContext.Col=position.Col;
			//messageContext.textBlockIndex=Node.getIndex();
			//messageContext.CursorPosition=$.localCursor.getCursorPos();
			messageContext.Char=Character;
			//console.log("ME: "+messageContext.absPos.Col);
		}
		
		socket.send(JSON.stringify(messageContext));
	}

	var processMessage =
	this.processMessage =function(messageContext){
		//for(x in $)console.log(x);
		if($[messageContext.Action]!=undefined){

			if(messageContext.Row!=undefined && messageContext.Row!=null){
			//	console.log("hello "+messageContext.Row+" - "+messageContext.textBlockIndex);
				//console.log(messageContext.test);
				var row=$.textContainer.children[messageContext.Row];
				var textBlock=row.children[messageContext.textBlockIndex];
				//console.log(remoteCursor["LOCAL"]);
				var cursor=$.acquireRemoteCursor(messageContext.ID);
				//console.log("OTHER: "+messageContext.absPos.Col);
				$.setAbsCursorPos(messageContext.Row,messageContext.Col,cursor);//new code to set cursor position
				//console.log("NOW: "+getAbsoluteCursorPos(cursor).Col);
				textBlock=cursor.getNode();//new code to set cursor position
				
				//console.log("Row "+textBlock.parentElement.getIndex()+ " index " + textBlock.getIndex())
				//console.log(messageContext.ID);
				cursor.setState("visible");
				if(messageContext.Action=="OnAddChar")
					$[messageContext.Action](textBlock,messageContext.Char,cursor);
				else if(messageContext.Action=="OnPaste")
					$[messageContext.Action](textBlock,messageContext.Char,cursor);
				else if(messageContext.Action=="addNewTextBlock")
					$[messageContext.Action](row,cursor);
				else if(messageContext.Action=="OnClick")
					var x;//window[messageContext.Action](textBlock,cursor,messageContext.CursorPosition);//old cursor positionning code use for debugging
				else
					$[messageContext.Action](textBlock,cursor);
					
			}
			if(messageContext.Action=="OnFullSync"){
				console.log("Syncing with server " + messageContext.Action);
				$[messageContext.Action](messageContext.Text);
			}

		}else{
				console.log("ERROR: Event "+messageContext.Action+" not found");
		}
	}

}
