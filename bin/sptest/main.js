window.COMMANDS['sptest'] = function() {
	const size = 5450146; // in bytes.
	let image = new Image();
	let startTime = Date.now();
	image.onload = function() {
		let endTime = Date.now();
		if(window.terminal) {
			let echo = window.terminal.echo;
			let speed = size/(endTime-startTime)*1000;
			let sptitle = speed > 1024 ? (speed > 1024*1024 ? (speed/1024/1024).toFixed(2)+' MB/s' : (speed/1024).toFixed(2)+' KB/s') : speed.toFixed(2) + ' B/s'
			echo('Your connection speed is: \n'+'             '+sptitle);
		}
	}
	image.src = location.pathname.replace(/\/index\.html[^\/]*$/, '/../bin/sptest/architecture-bay-beach.jpg');
};
