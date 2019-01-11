const Constants = {
	MessageType: {
		RequestHostMessageType: 'request-host-message-type'
	}
};
const Message = function(type, opts) {
	this.type = type;
	this.opts = opts;
};
Message.Type = Constants.MessageType;

const MahjongClient  = function(){
	this.client = new Colyseus.Client('ws://localhost:6644');
	this.room = null;
}

MahjongClient.prototype.enter = function({name, sessionIdPre}={}) {
	if(name == null) {
		name = 'gameMsg';
	}
	this.room   = this.client.join(name, {sessionIdPre: sessionIdPre});

	let idChangeListener = msg => {
		if(msg.type == 'adapt-id') {
			let oldId = this.room.sessionId;
			this.room.sessionId = msg.sessionId;
			console.log(`Adopt new sessionId from ${oldId} to ${this.room.sessionId}.`);
			this.room.onMessage.remove(idChangeListener);
		}
	}
	this.room.onMessage.add(idChangeListener);
}

MahjongClient.prototype.send = function(msg) {
	this.room.send(msg);
}

MahjongClient.prototype.requestHost = function() {
	this.room.send(new Message(Message.Type.RequestHostMessageType));
}

MahjongClient.prototype.requestShuffleStock = function() {
	this.room.send({type: 'player-action-shuffle-stock'});
}

MahjongClient.prototype.draw = function(num, pos) {
	this.send({type: 'player-action-draw', num: num, pos: pos});
}

MahjongClient.prototype.drop = function(num) {
	this.send({type: 'player-action-drop', num: num});
}

MahjongClient.prototype.rejoin = function() {
	this.room = this.client.rejoin(this.room.id, this.room.sessionId);
}

MahjongClient.prototype.gameBegin = function() {
	this.send({type: 'game-action-begin'});
}

MahjongClient.prototype.smForward = function() {
	this.send({type: 'sm-action-forward'});
}

MahjongClient.prototype.smTurnTo = function(master, phase){
	this.send({type: 'sm-action-turn-to', master: master, phase: phase});
}

MahjongClient.prototype.smPhaseTo = function(phase) {
	this.send({type: 'sm-action-phase-to', phase: phase});
}

MahjongClient.prototype.smReadRecord = function(cb, phase, turn) {
	let uid = uuidv1();
	this.send({type: 'sm-action-read-record', turn: turn, uid:uid});
	let recordListener = msg => {
		if(msg.rev.uid == uid) {
			if(cb == null) {
				console.log(msg.record);
			} else {
				cb(msg.record);
			}
			this.room.onMessage.remove(recordListener);
		}
	}
	this.room.onMessage.add(recordListener);
}

MahjongClient.prototype.smWriteRecord = function(data, phase, turn) {
	this.send({type: 'sm-action-write-record', phase: phase, turn: turn, data:data});
}
 
MahjongClient.prototype.deckWithType = function(type) {
	let sessionId = this.room.sessionId;
	let typeIndex = ({'hand': 0, 'sent': 1, 'faceup': 2, 'facedown': 3, 'dropping': 4})[type.toLowerCase()];
	return this.room.state.decks[sessionId][typeIndex];
};
MahjongClient.prototype.dwt = MahjongClient.prototype.deckWithType;

MahjongClient.prototype.deckHandle = function(operation) {
	this.send({type: 'player-action-deck-handle', operation: operation});

}

MahjongClient.prototype.chi = function() {
	this.send({type: 'vote-action-chi'});
}

MahjongClient.prototype.pass = function({uuid}={}) {
	this.send({type: 'vote-action-nil', uuid:uuid});
}

const MahjongTester = (function(){

	let clients = [];

	for(let i=0; i<4; i++) {
		clients[i] = new MahjongClient();
		clients[i].enter({sessionIdPre: i});
	}

	return {
		clients: clients
	}
})();


const c1 = MahjongTester.clients[0];
const c2 = MahjongTester.clients[1];
const c3 = MahjongTester.clients[2];
const c4 = MahjongTester.clients[3];

const r1 = c1.room;
const r2 = c2.room;
const r3 = c3.room;
const r4 = c4.room;

function setupListener(room) {
	room.listen('stock/:props', change=> {
		console.log('Stock changed.');
		console.log(change);
	});

	room.listen('decks/:sid/:type/:index', change=> {
		console.log('Decks changed.');
		console.log(change);
	});

	room.listen('history/:id', change => {
		console.log("History changed.");
		console.log(change);
	});
}

setupListener(r1);

// init hand decks.
setTimeout(function() {
	c1.gameBegin();

	c1.draw(13, 0);
	c2.draw(13, 0);
	c3.draw(13, 0);
	c4.draw(13, 0);

	c1.draw(1, 0);
}, 2000);

const UnitTest = function(){}
UnitTest.prototype.testChi = function() {
	c1.smPhaseTo('send');
	let num = c1.dwt('hand').slice(-1)[0];
	c1.drop(num);
	console.log('c1 dropped '+num);
	c1.smWriteRecord({sent: num});
	let testuuid1 = uuidv1();
	c1.pass({uuid:testuuid1});
	c3.pass();
	c4.pass();
	c2.chi();
	console.log('Test uuid1 = '+testuuid1);
	c1.room.onMessage.add(msg=> {
		console.log(msg);
	});
}

let ut = new UnitTest();
setTimeout(ut.testChi, 5000);
