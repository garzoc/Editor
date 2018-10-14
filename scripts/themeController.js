var ThemeManager=function(){
	var ThemeContext=null;

	this.loadTheme=function(name){
	
		var File = new XMLHttpRequest();
		File.responseType='text';
		File.open("GET", "Themes/"+name.trim()+".rdb", true);
		File.onreadystatechange = function() {
			if (File.readyState === 4) {
				if(File.status === 200 || File.status == 0){
					var fileContent = File.responseText;
					ThemeContext=JSON.parse(fileContent) 
					
					constructWordTree();
				}
			}
		}
		File.send();
	
	};
	
	
	function constructWordTree(){
		if(ThemeContext == null) return;
		var ingoreStringsList ={};
		var strings = {};
		for(word in ThemeContext.ignore){
			if(word.length > 1){
				//console.log(word);
				list = word.split("");
				var n = 0;
				var currentDepth = strings;
				while(++n < list.length){
					currentDepth[list[n-1]]={}
					currentDepth = currentDepth[list[n-1]];
				}
				currentDepth[list[n-1]]=ThemeContext.ignore[word];
			}
		}
		ThemeContext.ignore.strings = strings;
		/*var words = "-f-".getWords();
		for(word in words){
			console.log(words[word].string);
		}*/
		//console.log(strings);
	}
	
	
	this.isKeyword=function(keyword){
		
		return ThemeContext.keywords[keyword.trim()]!=undefined;
	}
	
	this.ignoreSpace = function(string){//Can be a bit difficult with whitespaces so trim when necessary
		if(string == undefined) return 0;
		var currentDepth = ThemeContext.ignore.strings;
		var i = 0;

		while(currentDepth[string.charAt(i)] != undefined && i < string.length){
			//console.log("input "+string)
			//console.log(currentDepth[string.charAt(i)]);
			currentDepth = currentDepth[string.charAt(i++)];
		}
		
		if(ThemeContext.ignore[string.substring(0,i)] == true){
				//console.log("njet "+string)
				return  i;
		}
		
		
		//console.log("Stringed "+ string);
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
