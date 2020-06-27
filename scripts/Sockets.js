

function Network(){
	let socket=null;
	let $ = this;


	this.initSocket = function(){
		socket=new WebSocket("ws://192.168.1.3:4445/IDE");

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
	this.send = function(Action, Node, Character, row){

		var messageContext=new Object;

		messageContext.ID=$.getID();//"TESTER";



		messageContext.Action=Action;
		//console.log(Action+" - "+Node);
		if(Node != null){
			var position=$.getAbsCursorPos($.localCursor);
			messageContext.Row=position.Row;
			messageContext.Col=position.Col;
			messageContext.Char=Character;
		} else if(row != null) {
			messageContext.Row = row;
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

				var row    = $.getRowByIndex(messageContext.Row);
				var cursor = $.acquireRemoteCursor(messageContext.ID);//Acquire a cursor for user either get current or create a new one
				if ($.rowIsVisible(messageContext.Row) && row != undefined && cursor != undefined && messageContext.Text == undefined) {
					$.setAbsCursorPos(messageContext.Row, messageContext.Col, cursor);

					//return;
				}

				cursor.setState("visible")
				switch(messageContext.Action){
					case "OnAddChar" :
						if($.rowIsVisible(messageContext.Row))
							$[messageContext.Action](cursor.getNode(), messageContext.Char, cursor);
						return;
					case "OnPaste" ://Not functional right now may be a server problem
						$[messageContext.Action](cursor.getNode(), messageContext.Char, cursor);
						return;
					case "addNewTextBlock" :
						if($.rowIsVisible(messageContext.Row))
							$[messageContext.Action](row, cursor);
						return;
					case "OnClick":
						return;
					case "OnBackSpace":
					case "OnEnter":
						$[messageContext.Action](cursor.getNode(), cursor, messageContext.Row);
						return;
					case "OnRowSync":
						$[messageContext.Action](messageContext.Text, messageContext.Row, messageContext.Col);
						return;
					default:
						if($.rowIsVisible(messageContext.Row))
							$[messageContext.Action](cursor.getNode(), cursor);
						return;
				}
			}

			switch(messageContext.Action){
				case "OnFullSync":
					console.log("Syncing with server " + messageContext.Action);
					$[messageContext.Action](messageContext.Text);
					return;
				case "OnConnectionRejected":
					console.log(`User was rejected Reason[${messageContext.Reason}]`);
					return;
				default :
					$[messageContext.Action](messageContext);
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
	this.OnConnectionRejected = function(reason){
		//console.log("User was kicked due to "+reason);
	};

}
