importScripts('./skyscrapers.js');
onmessage = function(e) {
	Skyscrapers.test();
	postMessage('success.');
}
