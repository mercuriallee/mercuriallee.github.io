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

MahjongClient.prototype.enter = function({name, sessionId}={}) {
	if(name == null) {
		name = 'gameMsg';
	}
	this.room   = this.client.join(name, {sessionId: sessionId});

	this.room.onMessage.add(msg => {
		if(msg.type == 'adapt-id') {
			let oldId = this.room.sessionId;
			this.room.sessionId = msg.sessionId;
			console.log(`Adopt new sessionId from ${oldId} to ${this.room.sessionId}.`);
		}
	});
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
	this.send({type: 'sm-aciton-phase-to', phase: phase});
}

MahjongClient.prototype.smReadRecord = function(phase, turn) {
	this.send({type: 'sm-action-read-record', turn: turn});
}

MahjongClient.prototype.smWriteRecord = function(data, phase, turn) {
	this.send({type: 'sm-action-write-record', phase: phase, turn: turn});
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

const MahjongTester = (function(){

	let clients = [];

	for(let i=0; i<4; i++) {
		clients[i] = new MahjongClient();
		clients[i].enter({sessionId: i});
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

r1.listen('stock/:props', change=> {
	console.log('Stock changed.');
	console.log(change);
});

r1.listen('decks/:sid/:type/:index', change=> {
	console.log('Decks changed.');
	console.log(change);
});

r1.listen('history/:id', change => {
	console.log("History changed.");
	console.log(change);
});

// init hand decks.
setTimeout(function() {
	c1.requestShuffleStock();

	c1.draw(13, 0);
	c2.draw(13, 0);
	c3.draw(13, 0);
	c4.draw(13, 0);

	c1.draw(1, 0);
}, 2000);
