
/**
 * @param {string} name
 * @param {Any} [entity]
 * @class
 */
function State(name, entity) {
	this.name = name;
	this.entity = entity;
}

/**
 * @param {State} nextState
 * Define it as you need.
 */
State.prototype.beforeEnter = function(nextState) {};

/**
 * @param {State} nextState
 * Define it as you need.
 */
State.prototype.afterEnter = function(nextState) {};

/**
 * @param {State} lastState
 * Define it as you need.
 */
State.prototype.present = function(lastState) {};

/**
 * @param {number} time
 * Define it as you need.
 */
State.prototype.update = function(time) {};

/** @type {?State[]} */
State.prototype.arrivables = null;

/**
 * @param {State} next
 * @returns bool
 */
State.prototype.arrivable = function(next) {
	if(this.arrivables) {
		return this.arrivables.includes(next);
	}
};

/**
 * @param {State[]} [states]
 * @class
 */
function StateMachine(states) {
	this.states = states;
	/** @type {?State} */
	this.current = null;
}

/**
 * @param {State} newState
 * @returns {State[]};
 */
StateMachine.prototype.addState = function(newState){
	this.states.push(newState);
	return this.states;
}

/**
 * @param {string} name - state's name
 * @returns {State}
 */
StateMachine.prototype.getState = function(name) {
	return this.states.find(state=>state.name === name);
}

/** 
 * @param {string|State} state
 * @param {?function} customRule
 * returns {bool}
 */
StateMachine.prototype.enterable = function(state, customRule) {
	if(typeof(state) === 'string') {
		state = this.getState(stateName);
	}
	if(typeof(customRule) == 'function') {
		return !!customRule(state);
	}
	return this.current.arrivable(state);
}

/**
 * @param {string|State} state
 */
StateMachine.prototype.enter = function(state) {
	let current = this.current;
	let next = state;
	if(typeof(state) === 'string') {
		next = this.getState(state);
	}
	if(next == null || toString.apply(next) !== '[object Object]' || next.constructor !== State) {
		return;
	}
	if(current) {
		current.beforeEnter(next);
	}
	this.current = next;
	if(current) {
		current.afterEnter(next);
	}
	next.present(current);
	return next;
}

/**
 * @param {number} time
 */
StateMachine.prototype.update = function(time){
	this.current.update(time);
}

module.exports = {
	State: State,
	StateMachine: StateMachine
};
