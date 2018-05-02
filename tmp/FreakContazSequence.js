/*
let root = {num:3}, stack = [root];
const Top = Math.pow(10, 8);

while(stack.length != 0) {
	let node = stack.pop();
	let num = node.num;
	if(num > Top) continue;
	console.log(num);

	if(node.D == null) {
		let newNodeD = {num: num*3};
		node.D = newNodeD;
		stack.push(newNodeD);
	}
	switch(num % 4) {
		case 1:
		case 3:
			if(node.d != null) break;
			let newNoded = {num: (num*3+1)/2};
			node.d = newNoded;
			stack.push(newNoded);
			break;
		case 2:
			if(node.U != null) break;
			let newNodeU = {num: (num*3-2)/4};
			node.U = newNodeU;
			stack.push(newNodeU);
			break;
	}
}
debugger;
*/

function freakContazSequence(s) {
	let num = {U:4, D:3, d:2}[s[s.length-1]];
	let addition = 3;
	for(let i=s.length-2; i>=0; i--) {
		debugger;
		let num1 = s[i] == 'D' ? num*3 : s[i] == 'U' ? (num*3-2)/4 : (num*3+1)/2;
		if((num1|0) != num1) {
			num+=addition;
			i++;
		} else {
			addition*=3;
			num=num1;
		}
	}
	return num;
}

console.log(freakContazSequence('UDdDDUd'));
