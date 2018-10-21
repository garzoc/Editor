const ws = require('ws').Server;
const events = require("./serverEvents");
const Cursor = require("./Cursor");
const Sessions_Manager = require("./Session_Manager");
var socketServer;
const portfinder=require('portfinder');//https://github.com/indexzero/node-portfinder
portfinder.basePort=8000;

//console.log(Sessions_Manager.anySession());//check if there are any session 
const session = Sessions_Manager.new("test");//Just use one session for now will add support for joining different sessions, one session per file



/*
 * sync improvment 
 * make the server keep track of the position of the client cursors and if a client sends the incorrect postion of its cursor
 * then the server will resync that client in order to makes sure that the cursor postion is the same among all clients
 * 
 * */
 
 
function addCBtoUser(client){
	client.sync_cursor=function(cursor){
		var message={};
		message.Action="OnSyncCursor";
		message.absPos={Row:cursor.getRow(), Col:cursor.getIndex()};
		message.Row=cursor.getRow();
		message.Col=cursor.getIndex();
		message.ID="LOCAL";
		client.send(JSON.stringify(message));
	};
			
	client.reject=function(reason){
		var message={};
		message.Action="OnConnectionRejected";
		message.Reason=reason;
		client.send(JSON.stringify(message));
		setTimeout(function(){
			client.close();
		},1000);
	};

} 


portfinder.getPort(function (err, freePort) {
	socketServer=new ws({port:freePort});
	console.log("Initiating server at port "+freePort+"");
	
	//var a=Cursor.create("test");
	//var b=Cursor.create("test");
	//Cursor.create("0");
	var ID_COUNTER=0;
	
	socketServer.on('connection',function(client){
		
		
		
		session.addUser(client,"NO_NAME");//Users should have a name
		addCBtoUser(client);
		
	
		client.on('message', function (message) {
		
			var messageContext=JSON.parse(message.toString());
			
						
			if(client.Cursor==undefined){
				if((client.Cursor = Cursor.create((messageContext.ID)+""))==null){
					client.reject("invalid ID");//if(null==client.Cursor=Cursor.create(messageContext.ID))client.fun.
					return 0;
				}
			}
			
			if(this.Cursor.getID() != messageContext.ID){
				client.reject("ID mismatch");
			}
			
			
			if(messageContext.Row != undefined && messageContext.Col != undefined){
				if(!client.Cursor.isset() || events[messageContext.Action]==undefined){
					//if position of the cursor has not yet been set then set the position or when the current actions is unknown				
					client.Cursor.setPos(messageContext.Row,messageContext.Col);
				}else if(messageContext.Col != client.Cursor.getIndex() || messageContext.Row != client.Cursor.getRow()){//Sync contoller
					console.log("Users out of sync");
					events.OnFullSync(messageContext,client.$CB);//Do a complete reload of the users text to match every one else's
					
					messageContext.Row=client.Cursor.getRow();
					messageContext.Col=client.Cursor.getIndex();
					
					let ID = messageContext.ID;
					messageContext.ID = "LOCAL";//Client won't recognize it own ID, and will only think it someone else, unique online IDs are not enforced yet
					
					client.respond(messageContext);//Transmit new instruciton back to user
					messageContext.ID = ID;
					
				}
			}
			
			this.$CB.Cursor=this.Cursor;//??
			events.passToEvents(messageContext,this.$CB);	
			
		});

		client.on('close',function close(){
			if(this.Cursor!=undefined)this.Cursor.unregister();
			session.removeUser(this);
	
		});
	
	});

});






