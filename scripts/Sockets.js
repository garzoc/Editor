

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
		/*
		 * Unique IDs are not enforced by server and because everyone currently 
		 * uses the same id the system only supports two simultaneous users
		 * */
		messageContext.ID="TESTER";
		messageContext.Action=Action;
		//console.log(Action+" - "+Node);
		if(Node!=null){ 
			var position=$.getAbsCursorPos($.localCursor);
			messageContext.Row=position.Row;
			messageContext.Col=position.Col;
			messageContext.Char=Character;
		}
		
		socket.send(JSON.stringify(messageContext));
	}

	/*
	 * Client are never told to remove old cursors that are no longer availble
	 * 
	 * */

	var processMessage =
	this.processMessage =function(messageContext){
		if($[messageContext.Action]!=undefined){

			if(messageContext.Row!=undefined && messageContext.Row!=null){
				var row=$.textContainer.children[messageContext.Row];
				
				
				var cursor=$.acquireRemoteCursor(messageContext.ID);//Acquire a cursor for user either get current or create a new one
				
				$.setAbsCursorPos(messageContext.Row,messageContext.Col,cursor);//new code to set cursor position
				
				textBlock=cursor.getNode();//new code to set cursor position
				
				cursor.setState("visible")
				switch(messageContext.Action){
					case "OnAddChar" :
						$[messageContext.Action](cursor.getNode(), messageContext.Char, cursor);
						return;
					case "OnPaste" ://Not functional right now may be a server problem
						$[messageContext.Action](cursor.getNode(), messageContext.Char, cursor);
						return;
					case "addNewTextBlock" :
						$[messageContext.Action](row, cursor);
						return;
					default:
						$[messageContext.Action](cursor.getNode(), cursor);
				}
								
			}
			if(messageContext.Action=="OnFullSync"){
				console.log("Syncing with server " + messageContext.Action);
				$[messageContext.Action](messageContext.Text);
			}

		}else{
				console.log("ERROR: Event "+messageContext.Action+" not found");
		}
	}
	
	/*
	 * Do nothing here, this is just to correct the position 
	 * of the cursor when moving around with the arrow keys
	 * */
	this.OnServerCursorSync = function(){};

}
