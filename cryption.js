function VigenereCipher(key, abc) {
  this.encode = function (str, reverse=false) {
  	//console.log(str, key, abc);
  	let key_pos = 0, cur_key_index = 0, cur_key=key, encoded_str='';
  	for(let i=0; i<str.length; i++) {
    	let char = str[i];
      if(key_pos===cur_key.length) {
      	let model = (reverse?encoded_str:str).split('').filter(e=>abc.includes(e)).join('');
      	cur_key = model.substr((cur_key_index++)*cur_key.length,cur_key.length);
        key_pos = 0;
      }
      if(abc.includes(char) && abc.includes(cur_key[key_pos])) {
        let shift = abc.indexOf(cur_key[key_pos]);
        if(reverse) shift = abc.length - shift;
        let dchar = abc[(abc.indexOf(char)+shift)%abc.length];
        key_pos++;
        encoded_str = encoded_str+dchar;
      } else {
      	encoded_str = encoded_str+char;
      }
    }
    return encoded_str;
  };
  this.decode = function(str){ return this.encode(str,true) };
}

let chinese_words = [...Array(0x9F00-0x4E00)].map((_,i)=>String.fromCharCode(i+0x4E00));
let key_len = (0|Math.random()*10)+5;
let default_key = [...Array(key_len)].map((_,i)=>chinese_words[Math.random()*chinese_words.length|0]).join('');

let CHE = function(str, key=default_key) {
	let cp = new VigenereCipher(key, chinese_words);
	console.log(key);
	return cp.encode(str);
}
let CHD = function(str, key=default_key) {
	if(key==null) key = "";
	let cp = new VigenereCipher(key, chinese_words);
	return cp.decode(str);
}
