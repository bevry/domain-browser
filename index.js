/*global define:false require:false */
module.exports = (function(){
	// Import Events
	var events = require('events');

	// it's possible to enter one domain while already inside
	// another one.  the stack is each entered domain.
	var stack = [];
	exports._stack = stack;
	// the active domain is always the one that we're currently in.
	exports.active = null;

	function uncaughtException(error){
		var domain = stack[stack.length - 1];
		if(domain)
			return domain.emit('error', error);

		throw error;
	}

	if(typeof window !== 'undefined')
		window.addEventListener('error', uncaughtException);
	else
		process.on('uncaughtException', uncaughtException);

	// Export Domain
	var domain = {};
	domain.createDomain = domain.create = function(){
		var d = new events.EventEmitter();

		d.members = []

		function emitError(e) {
			d.emit('error', e)
		}

		d.add = function(emitter){
			// If the domain is disposed or already added, then nothing left to do.
			if (this._disposed || emitter.domain === this)
				return;

			// has a domain already - remove it first.
			if (emitter.domain)
				emitter.domain.remove(emitter);

			emitter.domain = this;
			this.members.push(emitter);

			emitter.on('error', emitError);
		};
		d.remove = function(emitter){
			emitter.domain = null;
			var index = this.members.indexOf(emitter);
			if (index !== -1)
				this.members.splice(index, 1);

			emitter.removeListener('error', emitError);
		};
		d.run = function(fn){
			try {
				fn();
			}
			catch (err) {
				this.emit('error', err);
			}
			return this;
		};
		d.bind = function(callback){
			throw new Error('Not implemented')
		};
		d.intercept = function(callback){
			throw new Error('Not implemented')
		};
		d.enter = function(){
			if (this._disposed) return;

			// note that this might be a no-op, but we still need
			// to push it onto the stack so that we can pop it later.
			exports.active = process.domain = this;
			stack.push(this);
		};
		d.exit = function(){
			// skip disposed domains, as usual, but also don't do anything if this
			// domain is not on the stack.
			var index = stack.lastIndexOf(this);
			if (this._disposed || index === -1) return;

			// exit all domains until this one.
			stack.splice(index);

			exports.active = stack[stack.length - 1];
			process.domain = exports.active;
		};
		d.dispose = function(){
			this.removeAllListeners();
			return this;
		};
		return d;
	};
	return domain;
}).call(this);
