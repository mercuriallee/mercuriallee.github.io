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
	this.client = null;
	this.room = null;
}

MahjongClient.prototype.enter = function({name, sessionId}={}) {
	if(name == null) {
		name = 'gameMsg';
	}
	this.client = new Colyseus.Client('ws://localhost:6644');
	this.room   = this.client.join(name);
}

MahjongClient.prototype.send = function(msg) {
	this.room.send(msg);
}

MahjongClient.prototype.requestHost = function() {
	this.room.send(new Message(Message.Type.RequestHostMessageType));
}

const MahjongTester = (function(){

	let clients = [];

	for(let i=0; i<4; i++) {
		clients[i] = new MahjongClient();
		clients[i].enter();
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
