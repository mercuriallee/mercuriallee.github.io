const sh = require('shelljs');
let app1 = "网易MuMu";
let app2 = "终端"

function osacmd(repeat, delay, key) {
	let str = `
		repeat ${repeat} times
			delay ${delay}
			tell application "${app1}" 
				activate
			end tell

			tell application "System Events" 
				keystroke "${key}"
				tell process "NemuPlayer"
					keystroke "${key}"
				end tell
			end tell

		end repeat
	`;
	return str;
}

function rand(e, d) {
	let res;
	do {
		let a = Math.random();
		let b = Math.random();
		res = (-2*Math.log(a)) ** 0.5 * Math.sin(2*Math.PI*b);
	} while(res < -1 || res > 1)
	return e+res*d;
}

function randDelay() {
	let e = rand(0.7, 0.15);
	let d = 0.3;
	return rand(e, d);
}

function loop() {
	setTimeout(function(){
		sh.exec(`osascript -e '${osacmd(1,randDelay(), "space")}'`, {async:false});
		//loop();
	}, 1);
}

loop();
