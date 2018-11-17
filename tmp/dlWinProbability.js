#!/usr/bin/env node

const ReadLine = require("readline");

function generateRandomHandDeck(arr, size=4) {
	let handDeck = [], rest=arr.length;
	if(arr.length < size) {
		throw new Error('Cannot draw so much handDeck!');
	}
	for(let i=0; i<size; i++) {
		let index = parseInt(Math.random() * rest);
		handDeck.push(arr.splice(index, 1)[0]);
		rest--;
	}
	return handDeck;
}

function deckArrFromStr(str) {
	let deckArr = str.split(',').reduce((a,e)=>{
		let [name, numStr] = e.match(/([^\s*]+)\s*\*?\s*(\d*)/).slice(1,3);
		let num = isNaN(+numStr) ? 1 : +numStr;
		console.log(name, num);
		a.push(...Array(num).fill(name));
		return a;
	}, []);
	return deckArr;
}

const rl = ReadLine.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question('Input your main deck (like: a * 3, b * 2, c...) :\n', (deckStr) => {
	let deckArr = deckArrFromStr(deckStr);
	console.log(deckArr);

	rl.question('Input your opposite\'s main deck (like: a * 3, b * 2, c...) :\n', (deckStr) => {
		let deckArr = deckArrFromStr(deckStr);
		console.log(deckArr);
		rl.close;
	});
});

