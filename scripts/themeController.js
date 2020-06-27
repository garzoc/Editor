var ThemeManager=function(){
	var ThemeContext=null;

	this.loadTheme=function(name){
		var m = this;
		var File = new XMLHttpRequest();
		File.responseType='text';
		File.open("GET", "Themes/"+name.trim()+".rdb", true);
		File.onreadystatechange = function() {
			if (File.readyState === 4) {
				if(File.status === 200 || File.status == 0){
					var fileContent = File.responseText;
					ThemeContext=JSON.parse(fileContent)
					ThemeContext.ignoreTree={};
					ThemeContext.keywordTree={}
					constructWordTree(ThemeContext.ignore,ThemeContext.ignoreTree);
					constructWordTree(ThemeContext.keywords,ThemeContext.keywordTree);
					//console.log(m.keyWordSpace("--"));


				}
			}
		}
		File.send();


	};


	function constructWordTree(context,tree){
		if(context == null) return;
		var stringsList ={};
		var root = {};
		for(word in context){
			if(word.length > 1){
				//console.log(word);
				list = word.split("");
				var n = 0;
				var currentDepth = root;
				while(++n < list.length){
					if(currentDepth[list[n-1]] == undefined)currentDepth[list[n-1]]={}; // Just added the if statement
					currentDepth = currentDepth[list[n-1]];

				}
				currentDepth[list[n-1]] = context[word] != false ? true : false;
			}
		}
		tree.root = root;

	}


	this.isKeyword=function(keyword){

		return ThemeContext.keywords[keyword.trim()]!=undefined;
	}

	this.isIgnored=function(keyword){

		return ThemeContext.ignore[keyword.trim()]!=undefined;
	}

	this.keyWordSpace = function(string){//strings object should not be present in the keywords list
		if(string == undefined) return 0;

		var currentDepth = ThemeContext.keywordTree.root;
		var i = 0;

		var keyWordFound = 0;
		while(currentDepth[string.charAt(i)] != undefined && i < string.length){
			if(this.isKeyword(string.substring(0,i))) keyWordFound = i;


			currentDepth = currentDepth[string.charAt(i++)];

		}


		if(this.isKeyword(string.substring(0,i)) != undefined){
				return  i;
		}

		if(keyWordFound){
			return keyWordFound;
		}

		return 0;

	}

	this.ignoreSpace = function(string){//Can be a bit difficult with whitespaces so trim when necessary
		if(string == undefined) return 0;
		var currentDepth = ThemeContext.ignoreTree.root;
		var i = 0;

		while(currentDepth[string.charAt(i)] != undefined && i < string.length){


			currentDepth = currentDepth[string.charAt(i++)];
		}

		if(ThemeContext.ignore[string.substring(0,i)] == true){
				return  i;
		}

		return this.ifIgnoreChar(string.charAt(0)) ? 1 :0;
	}

	this.ifIgnoreChar=function(char){
		return ThemeContext.ignore[char.trim()]==true;
	}

	this.getColorHighlight=function(keyword){
		return ThemeContext.keywords[keyword.trim()];

	};

	this.getDefaultTextColor=function(){
		return ThemeContext["DefaultTextColor"];
	};



}
