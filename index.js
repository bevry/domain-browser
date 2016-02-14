// This file should be ES5 compatible
/* eslint prefer-spread:0, no-var:0, prefer-reflect:0, no-magic-numbers:0 */
'use strict'
module.exports = (function () {
	// Import Events
	var events = require('events')

	// Export Domain
	var domain = {}
	domain.createDomain = domain.create = function () {
		var d = new events.EventEmitter()

		function emitError (e) {
			d.emit('error', e)
		}
		
		function wrapFns() {
			var fns
			var oldSetImmediate
			var oldSetTimeout = setTimeout
			var oldSetInterval = setInterval
			
			setTimeout = function setTimeoutDomain(fn, time) {
				return oldSetTimeout(wrapFn(fn), time)
			};
			setInterval = function setIntervalDomain(fn, time) {
				return oldSetInterval(wrapFn(fn), time)
			};
			
			fns = {
				setTimeout: oldSetTimeout,
				setInterval: oldSetInterval
			}
			if (typeof setImmediate === 'function') {
				oldSetImmediate = setImmediate
				setImmediate = function setImmedate(fn) {
					return oldSetImmediate(wrapFn(fn))
				}
				fns.setImmedate = oldSetImmediate
			}
			
			return fns;
		}

		function unwrapFns(fns) {
			setTimeout = fns.setTimeout
			setInterval = fns.setInterval
			if (fns.setImmedate) {
				setImmediate = fns.setImmedate
			}
		}
		
		function wrapFn(fn, args) {
			return function() {
				var fns = wrapFns()
				try {
					fn.apply(null, args)
				} catch(err) {
					emitError(err)
				}
				unwrapFns(fns)
			}
		}

		d.add = function (emitter) {
			emitter.on('error', emitError)
		}
		d.remove = function (emitter) {
			emitter.removeListener('error', emitError)
		}
		d.bind = function (fn) {
			return function () {
				var args = Array.prototype.slice.call(arguments)
				wrapFn(fn, args)()
			}
		}
		d.intercept = function (fn) {
			return function (err) {
				if ( err ) {
					emitError(err)
				}
				else {
					var args = Array.prototype.slice.call(arguments, 1)
					wrapFn(fn, args)();
				}
			}
		}
		d.run = function (fn) {
			wrapFn(fn)();
			return this
		}
		d.dispose = function () {
			this.removeAllListeners()
			return this
		}
		d.enter = d.exit = function () {
			return this
		}
		return d
	}
	
	function catchFn(fn) {
		tr
	}
	return domain;
}).call(this)
