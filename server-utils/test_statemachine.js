const SMModule = require('./state-machine.js');
const State = SMModule.State, StateMachine = SMModule.StateMachine;

let start = new State('start');
let terminated = new State('terminated');
let paused = new State('paused');
let stopped = new State('stopped');
let resume = new State('resume');
let success = new State('success');
let failed = new State('failed');

let sm = new StateMachine([start, terminated, paused, stopped, success, failed]);
sm.addState(resume);

start.arrivables = [terminated, paused, stopped, success, failed];
terminated.arrivables = [start];
paused.arrivables = [resume, terminated, stopped];
stopped.arrivables = [terminated, success, failed];
success.arrivables = [];
failed.arrivables = [];

resume.arrivable = state=>state.name.endsWith('ss')?false:true;

for(let first of sm.states) {
	sm.enter(first.name);
	for(let second of sm.states) {
		if(sm.enterable(second)) {
			console.log(`${first.name} --> ${second.name}`);
		} else {
			console.log(`${first.name} *** ${second.name}`);
		}
	}
}
