
var Session_buffer = [];

module.exports = new function Session_Manager(){
	

	this.new = function(Name){
		var index = Session_buffer.length;
		var session = new Session(index, Name);
		Session_buffer.push(session);
		return session;	
	}
	
	this.removeSessionAt = function(index){//detach session from Session Manager
		for(var i = index + 1; Session_buffer.length; i++){
			Session_buffer[i].updateSessionIndex(i-1);
		}
		Session_buffer.splice(index,i);
		
	}
	
	this.getSessionBuffer = function(){
		return Session_buffer;
	}
	
	this.anySession = function(){
		return Session_buffer.length > 0;
	}
	

	
	var Session = function(Index,Name){
		
		
		var Users = [];
		var cleaner = undefined;
		
		
	
		this.addUser = function(user, name){
			if(user.user_info == undefined || user.user_info == null){
				user.Session_info = {
					session_index : Index,
					session_name : Name
				};
				
				user.user_info = {
					user_index : Users.length,
					user_name : name
				};
				if(validUser(user)){
					Users.push(user);
					addUserCallBacks(user);
					console.log("User by name " + user.user_info.user_name + "["+user.user_info.user_index+"]" + " was added to Session " + Name + "["+Index+"]");
				}
			}else{
				console.log("Can't add a user twice");
			}
		}
		
		
		var updateUserSessionInfo = function(){
			for(user in Users){
				user.Session_info = {
					session_index : Index,
					session_name : Name
				};
			}
		}
		
		
		this.updateSessionIndex = function(index){
			Index = index;
			updateUserSessionInfo();
		}
		
		
				

		function validUser(user,error){
		
			if(user.send == undefined){
				console.log("User has no send method");
			}
		
			if(user == undefined){
				console.log("object is undefined");
				return false;
			}
		
			if(user.user_info == undefined || user.user_info == null){
				console.log("Missing user and session info");
				return false;
			}
			
			if(user.Session_info.session_index != false){
				console.log("User belongs to another session");
				return false;
			}
			
			return true;
		}
		
		this.removeUser = function(user){
			if(validUser(user)){
				var user_info = user.user_info;
				this.removeUserAt(user.user_info.user_index);
				console.log("User by name " + user_info.user_name + "["+user_info.user_index+"]" +  " was removed from Session " + Name + "["+Index+"]");
				console.log("Number of users in Session " + Users.length);
			}
		}
		
		this.removeUserAt = function(index){
			for(var i = index + 1; i < Users.length; i++){
				Users[i].user_info.user_index--;
			}
			Users[index].user_info = undefined;
			Users[index].Session_info = undefined;
			Users.splice(index,1);		
		}
		
		
		this.getID = function(){
			return ID;
		}
		
		
	
		function addUserCallBacks(user){
			user.$CB = {};
			user.$CB.sendToAll=function(m){
				var message=JSON.stringify(m);
				for(var i=0;i<Users.length;i++) Users[i].send(m);
			}
			user.respond = user.$CB.respond = function(m){
				var message=JSON.stringify(m);
				user.send(message);
			}
			user.$CB.forward=function(m){
					var message=JSON.stringify(m);
					for(var i=0;i<Users.length;i++){
						if(i != user.user_info.user_index)Users[i].send(message);
				}
			}
		}
		
		
		this.AutoClean = function(cmd,timer){//automatically remove users with incorrect data
			if(cmd == "enable"){
				if(cleaner == undefined){
					cleaner=setInterval(function(){
						var index = 0;
						for(user in Users){
							if(user.Session_info == undefined || user.Session_info == null){
								this.removeUserAt(index);
							
							}
							index++;						
						}
					}, (timer != undefined ? timer : 10000));
					console.log("Cleaner enabled");
				}else{
					console.log("Cleaner has already been enabled");
				}
			}else if(cmd == "disable"){
				if(cleaner != undefined){
					clearInterval(cleaner);
					console.log("Cleaner disabled");
				}
			}else{
				console.log("Uknown command!");
			}
		}
		
		
		
	
	
	
	}


}
