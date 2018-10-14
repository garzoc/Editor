var ws = require('ws').Server;
var events = require("./serverEvents");
var Cursor = require("./Cursor");
var Sessions_Manager = require("./Session_Manager");
var socketServer;
var portfinder=require('portfinder');//https://github.com/indexzero/node-portfinder
portfinder.basePort=8000;

console.log(Sessions_Manager.anySession());
var session = Sessions_Manager.new("muu");



/*
 * sync improvment 
 * make the server keep track of the position of the client cursors and if a client sends the incorrect postion of its cursor
 * then the server will resync that client in order to makes sure that the cursor postion is the same among all clients
 * 
 * */
 
 
function addCBtoUser(client){
	client.$CB.sync_cursor=function(cursor){
		var message={};
		message.Action="OnSyncCursor";
		message.absPos={Row:cursor.getRow(), Col:cursor.getIndex()};
		message.Row=cursor.getRow();
		message.Col=cursor.getIndex();
		message.ID="LOCAL";
		client.send(JSON.stringify(message));
	};
			
	client.$CB.reject=function(reason){
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
	console.log("initiating server at "+freePort+"");
	
	//var a=Cursor.create("test");
	//var b=Cursor.create("test");
	//Cursor.create("0");
	var ID_COUNTER=0;
	
	socketServer.on('connection',function(client){
		
		//console.log("welcome");
		
		session.addUser(client,"NO_NAME");
		addCBtoUser(client);
		
	
		client.on('message', function (message) {
		
			var messageContext=JSON.parse(message.toString());
			
			
			
			
			
			if(client.Cursor==undefined){
				if((client.Cursor = Cursor.create((ID_COUNTER++)+""))==null){
					messageContext.fun.reject("invalid ID");//if(null==client.Cursor=Cursor.create(messageContext.ID))client.fun.
					return 0;
				}
			}
			
			var doSyncCursor=false;
			if(messageContext.absPos!=undefined){
				if(!client.Cursor.isset()|| events[messageContext.Action]==undefined){
					//if position of the cursor has not yet been set then set the position
					client.Cursor.setPos(messageContext.absPos.Row,messageContext.absPos.Col);
				}else if(((messageContext.absPos.Col!=client.Cursor.getIndex() || messageContext.absPos.Row!=client.Cursor.getRow()))){
					//console.log(messageContext.Action);
					doSyncCursor=true;
					console.log("this "+messageContext.Col+" vs "+client.Cursor.getIndex());
					messageContext.absPos.Row=client.Cursor.getRow();
					messageContext.absPos.Col=client.Cursor.getIndex();
					messageContext.Row=client.Cursor.getRow();
					messageContext.Col=client.Cursor.getIndex();
					
				}
			}
			
			this.$CB.Cursor=client.Cursor;
			
			events.passToEvents(messageContext,this.$CB);	
			
			
			if(doSyncCursor){
				events.OnFullSync(null,messageContext.fun);
				messageContext.fun.sync_cursor(client.Cursor);
				
			}	
		});

		client.on('close',function close(){
			if(this.Cursor!=undefined)this.Cursor.unregister();
			session.removeUser(client);
	
		});
	
	});

});






