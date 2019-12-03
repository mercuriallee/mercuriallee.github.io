const FibonacciHeap = function() {
	this.min = null;
	this.maxDegree = 0;
	this.length = 0;
}

const FibonacciHeapNode = function(value, degree, left, right, parent, child) {
	this.value = value;
	this.degree = degree || 0;
	this.left = left || this;
	this.right = right || this; 
	this.parent = parent;
	this.child = child;
}

FibonacciHeap.prototype.insert = function(value) {
	if(value instanceof FibonacciHeapNode) {
		if(this.min == null) {
			this.min = value;
		} else {
			let [left, right] = [this.min.left, this.min];
			left.right = right.left = value;
			value.left = left, value.right = right;
		}
		this.min.value > value.value && (this.min = value);
		this.length++;
		this.maxDegree < value.degree && (this.maxDegree = value.degree);
	} else {
		let newNode = new FibonacciHeapNode(value);
		this.insert(newNode);
	}
}

FibonacciHeap.prototype.extractMin = function() {
	let min = removeMin(this);
	if(min.degree != 0) {
		let cur = min.child, next;
		for(let i=0; i<min.degree; i++) {
			next = cur.left;
			this.insert(cur);
			cur = next;
		}
	}
	this.consolidate();
	return min.value;
}

FibonacciHeap.prototype.consolidate = function() {
	if(this.min == null) return;
	let cons = [], d = this.min.degree;
	while(this.min != null) {
		let p = removeMin(this);
		d = p.degree;
		while(cons[d] != null) {
			let c = cons[d];
			p.value > c.value && ([p, c] = [c, p]);
			c.linkTo(p);
			cons[d] = null;
			d++;
		}
		cons[d] = p;
	}
	let head = null, pre = null;
	for(let node of cons) {
		if(node == null) continue;
		if(head == null) head = node;
		if(this.min == null || this.min.value > node.value) {
			this.min = node;
		}
		if(pre == null) {
			node.left = node.right = node;
		} else {
			pre.right = node, node.left = pre;
		}
		pre = node;
		this.maxDegree < node.degree && (this.maxDegree = node.degree);
		this.length++;
	}
	head.left = pre, pre.right = head;
}

function removeMin(heap) {
	if(heap.length == 0) return null;
	let min = heap.min;
	if(heap.length != 1) {
		let [left, right] = [min.left, min.right];
		left.right = right, right.left = left;
	}
	heap.length--;
	heap.min = heap.length == 0 ? null : min.left;
	return min.left = min.right = min;
}

FibonacciHeap.prototype.listNodes = function() {
	let list = [], head = this.min;
	for(let i=0; i<this.length; i++) {
		list.push(head);
		head = head.right;
	}
	return list;
}

FibonacciHeap.prototype.print = function() {
	this.child = this.min, this.degree = this.length, this.value = 'ROOT';
	function _print(node) {
		if(node.value == 10) debugger;
		let valueWidth = (''+(node.value==null?' ':node.value)).length;
		if(node.degree == 0) return {strs: [''+node.value], mid: (valueWidth-1)/2|0};
		let children = [node.child];
		for(let i=1; i<node.degree; i++) {
			children.splice(0,0,children[0].left);
		}
		let cos = children.map(e=>_print(e));
		/*
		 * SAMPLE: 
         *			  23
	     * 			  |
	     *     +------+----+
	     *	   |      |    |       
         *	283498  2342  234
		 */
		let output = [], height = 0;
		for(let i=0; i<cos.length; i++) {
			let {strs,mid} = cos[i];
			let width = strs[0].length;
			height < strs.length && (height = strs.length);
			let arrowLine = ' '.repeat(mid)+'|'+' '.repeat(width-mid-1);
			strs.splice(0,0,arrowLine);

			let cornerLine = (i==0?' ':'-').repeat(mid)+'+'+(i==cos.length-1?' ':'-').repeat(width-mid-1);
			strs.splice(0,0,cornerLine);
		}
		height+=2;
		for(let {strs} of cos) {
			strs.push(...Array(height-strs.length).fill(' '.repeat(strs[0].length)));
		}
		let seprator = ' '.repeat(2);
		let width = Math.max(cos.reduce((a,e)=>a+e.strs[0].length, 0)+(cos.length-1)*seprator.length, valueWidth);
		let mid = (width-1)/2|0;
		output[0] = ' '.repeat((width-valueWidth)/2|0)+''+(node.value==null?' ':node.value);
		output[0] += ' '.repeat(width-output[0].length);
		output[1] = ' '.repeat(mid)+'|'+' '.repeat(width-mid-1);
		for(let r=0; r<cos[0].strs.length;r++) {
			let str = cos[0].strs[r];
			for(let c=1; c<cos.length; c++) {
				str += (r==0?'--':seprator)+cos[c].strs[r];
			}
			output[r+2] = str;
		}
		return {strs:output, mid};
	}
	let output = _print(this);
	delete this.child, delete this.degree, this.value;
	return output.strs.join('\n');
}

FibonacciHeapNode.prototype.linkTo = function(node) {
	// break the links of brothers.
	let [left, right, parent] = [this.left, this.right, this.parent];
	if(parent != null) {
		parent.child == this && (parent.degree==1 && (parent.child=null) || (parent.child=left));
		parent.degree--;
	}
	left.right = right.left = null;
	this.left = this.right = null;

	// link to new node.
	/*              node
	 *    left this right(child)
	 */
	if(node.child == null) {
		this.left = this.right = this;
	} else {
		let [left, right] = [node.child.left, node.child];
		left.right = right.left = this; 
		this.left = left, this.right = right;
	}
	this.parent = node;
	node.child = this;
	node.degree++;
}

function test() {
	let h = new FibonacciHeap();
	[...Array(20)].map((_,i)=>(i+1)*(i+1)*10).forEach(e=>h.insert(e));
	h.consolidate();
	h.extractMin();
	h.extractMin();
	h.extractMin();
	console.log(h.print());

}
test();

module.exports = FibonacciHeap;
