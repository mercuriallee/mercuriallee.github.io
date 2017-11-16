const nil = null;
const BTreeNodeColor = {Black: 0, Red: 1};
const IterateType = {Prefix: 0, Postfix: 1, Infix: 2};
let TreeNodeWithTag = function(treeNode, wrapped) {
	this.treeNode = treeNode;
	this.wrapped = wrapped | 0;
	Object.defineProperty(this, "unwrapped", {get: ()=>{return !this.wrapped;}, enumerable: true});
};
const ComparableTypes = ['string', 'number'];

class TreeDelegate {

	constructor(subject) {
		this.subject = subject;
	}

	functionExist(name) {
		return this.subject != null && this.subject[name] !== undefined && typeof(this.subject[name]) == "function";
	}

	updateLen(node, recursively) {
		let name = 'updateLen';
		if (this.functionExist(name)) {
			return this.subject[name](node, recursively);
		}
	}
  
  appendRepeated(existence) {
  	let name = 'appendRepeated';
		if (this.functionExist(name)) {
			return this.subject[name](existence);
		}
  }
}

class Tree {
	constructor(delegate) {
		this.root = nil;
		Object.defineProperty(this, "count", {get: ()=>{
			if (this.root == nil) {return 0}
			let nodes = [this.root];
			let count = 0;
			while (nodes.length !== 0) {
				count++;
				const last = nodes.splice(-1, 1)[0];
				if (last.right != nil) {nodes = nodes.concat(last.right)}
				if (last.left != nil) {nodes = nodes.concat(last.left)}
			}
			return count;
		}});

		this.delegate = new TreeDelegate(delegate);
	}

	rotate(parent, clockwise) {
		RLP: do {
			if (clockwise) {
				if (parent.left == nil) {
					console.log("fatalError, left in null!");
					return;
				}
				const left = parent.left;
				this.changeCurrentNode(parent, left);

				parent.left = left.right;
				if(left.right != nil) {
					left.right.parent = parent;
				}
				left.right = parent;
				const oldGrandpa = parent.parent;
				parent.parent = left;
				break RLP;
			}else {
				if(parent.right == nil) {
					console.log("fatalError, right in null!");
					return;
				}
				let right = parent.right;
				this.changeCurrentNode(parent, right);
				parent.right = right.left;
				if(right.left != nil) { 
					right.left.parent = parent;
				}
				const oldGrandpa = parent.parent;
				right.left = parent;
				parent.parent = right;
				break RLP;
			}
		} while(0)

		this.delegate.updateLen(parent);
		if(parent.parent != null) {
			this.delegate.updateLen(parent.parent);
		}
		return;
	}

	changeCurrentNode(node, toNode) {
		do {
			if (node.parent != nil) {
				const parent = node.parent;
				if(parent.left != nil && parent.left === node) {
					parent.left = toNode;
				} else {
					parent.right = toNode;
				}
				node.parent = nil;
				toNode.parent = parent;
				break;
			}
			this.root = toNode;
			toNode.parent = nil;
		}while(0)
		return;
	}

	iterate(type, mapper = e=>e) {
		if (this.root == nil) { return []}

		let result = [];
		let stack = [this.root];

		if (type == IterateType.Prefix) {
			while (stack.length) {
				const current = stack.splice(0, 1)[0];
				result.push(mapper(current));
				if (current.right != nil) {
					stack.splice(0, 0, current.right);
				}
				if (current.left != nil) {
					stack.splice(0, 0, current.left);
				}
			}
			return result;
		}

		let stackWithTag = [new TreeNodeWithTag(this.root, true)];

		while (stackWithTag.length) {
			const current = stackWithTag.splice(0, 1)[0];
			if (current.wrapped) {
				const node = current.treeNode;
				if (type === IterateType.Infix) {
					if(node.right != nil) {
						stackWithTag.splice(0, 0, new TreeNodeWithTag(node.right, true));
					}
					stackWithTag.splice(0, 0, new TreeNodeWithTag(node, false));
					if(node.left != nil) {
						stackWithTag.splice(0, 0, new TreeNodeWithTag(node.left, true));
					}
				} else if (type === IterateType.Postfix){
					stackWithTag.splice(0, 0, new TreeNodeWithTag(node, false));
					if (node.right != nil) {
						stackWithTag.splice(0, 0, new TreeNodeWithTag(node, true));
					}
					if (node.left != nil) {
						stackWithTag.splice(0, 0, new TreeNodeWithTag(node, true));
					}
				}
			}
			else if(current.unwrapped){
				result.push(mapper(current.treeNode));
			}
		}
		return result
	}
}

class BTreeNode {
	constructor(data) {
		this.parent = nil;
		this.left = nil;
		this.right = nil;

		this.data = data;
		this.color = BTreeNodeColor.Red;

		Object.defineProperty(this, 'brother', {get: 
			() => {
				if (this.parent != nil) {
					if (this.parent.left === this) {
						return this.parent.right;
					}
					else if (this.parent.right === this){
						return this.parent.left;
					}
				}
				return nil;
			}
		});
	}
}

class BTree extends Tree {

	rotate(parent, clockwise) {
		if (clockwise) {
			if (parent.left == nil) {
				console.log("fatalError: rotate without left child");
				return;
			}
			const left = parent.left;
			if (left.left == nil && left.right != nil) {
				this.rotate(left, false);
				this.rotate(parent, true);
				return;
			}
		}else {
			if (parent.right == nil) {
				console.log("fatalError: rotate without right child");
				return;
			}
			const right = parent.right;
			if (right.right == nil && right.left != nil) {
				this.rotate(right, true);
				this.rotate(parent, false);
				return;
			}
		}
		super.rotate(parent, clockwise);
	}

	updateColor(node) {
		if (node == null) { return;}
		if (node.color !== BTreeNodeColor.Red) {
			return;
		}
		if (node.parent == nil) {
			node.color = BTreeNodeColor.Black;
			return;
		}
		let parent = node.parent;
		if (parent.color == BTreeNodeColor.Black) {
			return;
		}
		//parent red [=>grandparent black]
		if (parent.color == BTreeNodeColor.Red) {
			// uncle exists, [parent red, =>grandparent black]
			if (parent.brother != nil) {
				const uncle = parent.brother;
				// uncle red, [parent red, grandparent black]
				if (uncle.color === BTreeNodeColor.Red) {
					parent.parent.color = BTreeNodeColor.Red;
					parent.color = BTreeNodeColor.Black;
					uncle.color = BTreeNodeColor.Black;
					this.updateColor(parent.parent);
				}
				// uncle black, [parent red, grandparent black]
				else {
					if(node == (parent == parent.parent.right ? parent.left : parent.right)) {
						this.rotate(parent, parent == parent.parent.right);
						this.updateColor(parent);
					} else {
						parent.color = BTreeNodeColor.Black;
						parent.parent.color = BTreeNodeColor.Red;
						this.rotate(parent.parent, parent == parent.parent.left);
						this.updateColor(parent);
					}
				}
				// uncle not exists, [parent red, =>grandparent black]
			}else{
				const grandParent = parent.parent;
				this.rotate(parent.parent, parent.parent.left === parent);
				grandParent.parent.color = BTreeNodeColor.Black;
				grandParent.color = BTreeNodeColor.Red;
				if(grandParent.brother) grandParent.brother.color = BTreeNodeColor.Red;
			}
			return;
		}

	}

	search(data) {
		let current = this.root;
		while(current != nil) {
			if (current.data.equalTo(data)) { return current }
			if (data.lessThan(current.data)) {
				current = current.left;
				continue;
			}
			current = current.right;
		}
		return nil;
	}

	append(node) {
		if(this.root == nil) {
			this.root = node;
			node.color = BTreeNodeColor.Black;
			return node;
		}

		let current = this.root;
		let parent;
		locateLoop: while(1) {
			if(node.data.equalTo(current.data)) {
      	this.delegate.appendRepeated(current);
				return current;
			}
			if (node.data.lessThan(current.data)) {
				if (current.left != nil) {
					current = current.left;
					continue locateLoop;
				}
				else {
					parent = current;
					break locateLoop;
				}
			}else {
				if(current.right != nil) {
					current = current.right;
					continue locateLoop;
				}
				else {
					parent = current;
					break locateLoop;
				}
			}
		}
		if (node.data.lessThan(parent.data)) {
			parent.left = node;
		}else {
			parent.right = node;
		}
		node.parent = parent;
		this.delegate.updateLen(parent, true);
		this.updateColor(node);
		return node;
	}

	appendData(data) {
		if(ComparableTypes.includes(typeof data)) {
			this.append({data: new ComparableClass(data), color: BTreeNodeColor.Red});
		} else {
			throw "Can only append comparable data.";
		}
	}

	remove(data) {
		if(ComparableTypes.includes(typeof data)) {
			data = new ComparableClass(data);
		}
		let node = this.search(data);
		if (node == nil) {
			return false;
		}
		this.removeNode(node);
	}
	
	removeNode(node) {
		let rootNeedABlack;
		let parentBeforeRemove;
		removeLoop: while(true) {
			//remove node with two children.
			//change to remove rightest node of left tree.
			if (node.left != nil && node.right != nil) {
				let righestOfLeftTree = node.left;
				while (righestOfLeftTree.right != nil) {
					righestOfLeftTree = righestOfLeftTree.right;
				}
				node.data = righestOfLeftTree.data;
				node = righestOfLeftTree;
				continue removeLoop;
			}
			parentBeforeRemove = node.parent;
			let nodeNeedUpdate = null;
			//remove leaf
			if (node.left == nil && node.right == nil) {
			  const parent = node.parent;
				// if the leaf is root node.
			  if (parent == null) {
			    this.root = null;
			    break removeLoop;
			  }
				//if the leaf is black. we should require a black on parent.
			  if (node.color == BTreeNodeColor.Black) {
			    this.requireABlack(node);
			  }
				if(parent.left == node) {
					parent.left = nil;
				} else {
					parent.right = nil;
				}
				break removeLoop;
			}
			//remove node with a child
			if (node.color = BTreeNodeColor.Black) {
			  rootNeedABlack = node.left;
			  if (rootNeedABlack == null ) {
			    rootNeedABlack = node.right;
			  }
			}
			if (node.left != nil) {
				this.changeCurrentNode(node, node.left);
			}
			else {
				this.changeCurrentNode(node, node.right);
			}
			break removeLoop;
		}
		this.delegate.updateLen(parentBeforeRemove, true);
		if(rootNeedABlack != nil) {
		  this.requireABlack(rootNeedABlack);
		}
		return true;
	}
	
	requireABlack(node) {
	  if(node.color == BTreeNodeColor.Red) {
	    node.color = BTreeNodeColor.Black;
	    return;
	  }

		if (node == this.root) {
			return;
		}
    // dead loop to control multiple exit;
    EPL: do {
      const parent = node.parent;
      if (parent == null) {
        console.log("I'm sure I have not rquested a root to raise a Black.");
        return;
      }
      const brother = node.brother;
      if (brother == null) {
        console.log("Brother must not be nil");
        return;
      }
      // parent is red
      if (parent.color == BTreeNodeColor.Red) {
        
          // parent red, brother no child
          if(brother.left == null && brother.right == null || brother.left != nil && brother.right != nil && brother.left.color == BTreeNodeColor.Black && brother.right.color == BTreeNodeColor.Black ) {
              parent.color = BTreeNodeColor.Black;
              brother.color = BTreeNodeColor.Red;
              break EPL;
          }
          // parent red, brother has only a red child
          if(brother.left != null && brother.right == null || brother.left == null && brother.right != null) {
              const sameSideChild = (brother == parent.left ? brother.left : brother.right);
              if (sameSideChild == null) {
                  brother.color = BTreeNodeColor.Red;
                  let notNilChild = brother.left;
                  if (notNilChild == null) {
                    notNilChild = brother.right;
                  }
                  notNilChild.color = BTreeNodeColor.Black;
                  this.rotate(brother, brother.left != null);
				  this.requireABlack(node);
                  break EPL;
              }
                
              parent.color = BTreeNodeColor.Black;
              brother.color = BTreeNodeColor.Red;
              sameSideChild.color = BTreeNodeColor.Black;
              this.rotate(parent, brother == parent.left);
              break EPL;
          }
          
          // parent red, brother's children red and black or two red
          this.rotate(parent, brother == parent.left);
          this.updateColor(node == parent.left ? parent.right : parent.left);
          break EPL;
      // parent is black
      } else {
          // parent black, brother red
          if (brother.color == BTreeNodeColor.Red) {
              brother.color = BTreeNodeColor.Black;
              parent.color = BTreeNodeColor.Red;
              this.rotate(parent, brother == parent.left);
              break EPL;
          }
          // parent black, brother black
          // brother has no red child, [parent black, brother black]
		  if ((brother.left == nil || brother.left.color != BTreeNodeColor.Red) && (brother.right == nil || brother.right.color != BTreeNodeColor.Red)) {
			  brother.color = BTreeNodeColor.Red;
			  this.requireABlack(parent);
			  break EPL;
		  }
		  /* left-brother has a right-red-child, or right-brother has a left-red-child
		   * the other child is nil or black
		   * [parent black, brother black]
		   */
		  const sameSideChild = brother == parent.left ? brother.left : brother.right;
		  const diffSideChild = brother == parent.left ? brother.right : brother.left;
		  /*
		   * PHASE 1:
		   * 1. change Diff-Side child to BLACK.
		   * 2. change brother(Diff-Side's parent) to RED.
		   * 3. ROTATE to make Diff-Side to be brother's parent.
		   * PHASE 2:
		   * 1. change brother(Diff-Side's red child) to Black.
		   * 2. ROTATE to make Diff-Side to be node(which require a black)'s parent.
		   */
		  if (diffSideChild != nil && diffSideChild.color == BTreeNodeColor.Red) {
			  diffSideChild.color = BTreeNodeColor.Black;
			  this.rotate(brother, diffSideChild == brother.left);
			  this.rotate(parent, parent.right == node);
			  break EPL;
		  }
		  /* brother on right and has a red right child, or brother on left and has red left child.
		   * [parent black, brother black]
		   */
		  if (sameSideChild != null) sameSideChild.color = BTreeNodeColor.Black;
		  this.rotate(parent, brother == parent.left);
		  break EPL;
      }
            
    } while (false)
  }
}

class ComparableClass {
	constructor(data) {
		this.data = data;
	}

	lessThan(other) {
		return this.data < other.data;
	}

	equalTo(other) {
		return this.data == other.data;
	}
}

//====================================================================================
//For an example and an extension.

class CustomInt {
	constructor(i) {
		this.value = i;
    this.weight = 1;
		this.llen = 0;
		this.rlen = 0;
	}
	
	lessThan(other) {
		return this.value < other.value;
	}
	equalTo(other) {
		return this.value == other.value;
	}
}

const TreeIndexDelegate = {
	updateLen: function updateLen(node, recursively) {
		if (node == null) {return;}
		if(node.left != null) {
			node.data.llen = node.left.data.llen + node.left.data.weight + node.left.data.rlen; 
		} else {
			node.data.llen = 0;
		}
		if(node.right != null) {
			node.data.rlen = node.right.data.llen + node.right.data.weight + node.right.data.rlen; 
		} else {
			node.data.rlen = 0;
		}
		if (recursively) {
			updateLen(node.parent, true);
		}
	},
  
  appendRepeated: function(existence) {
  	existence.data.weight++;
    this.updateLen(existence.parent, true);
  }
}

if(!this.window) {
	module.exports = {
		BTree: BTree,
		BTreeNodeColor: BTreeNodeColor,
		IterateType: IterateType
	}
}
