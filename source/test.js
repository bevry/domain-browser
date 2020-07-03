/* eslint handle-callback-err:0, no-magic-numbers:0, no-unused-vars:0 */
"use strict";

// Import
var events = require("events");
var equal = require("assert-helpers").equal;
var kava = require("kava");
var domain = require("./index.js");

// =====================================
// Tests

kava.suite("domain-browser", function(suite, test) {
	test("should work on throws", function(done) {
		var d = domain.create();
		d.on("error", function(err) {
			equal(err && err.message, "a thrown error", "error message");
			done();
		});
		d.run(function() {
			throw new Error("a thrown error");
		});
	});

	test("should be able to add emitters", function(done) {
		var d = domain.create();
		var emitter = new events.EventEmitter();

		d.add(emitter);
		d.on("error", function(err) {
			equal(err && err.message, "an emitted error", "error message");
			done();
		});

		emitter.emit("error", new Error("an emitted error"));
	});

	test("should be able to remove emitters", function(done) {
		var emitter = new events.EventEmitter();
		var d = domain.create();
		var domainGotError = false;

		d.add(emitter);
		d.on("error", function(err) {
			domainGotError = true;
		});

		emitter.on("error", function(err) {
			equal(
				err && err.message,
				"This error should not go to the domain",
				"error message"
			);

			// Make sure nothing race condition-y is happening
			setTimeout(function() {
				equal(domainGotError, false, "no domain error");
				done();
			}, 0);
		});

		d.remove(emitter);
		emitter.emit("error", new Error("This error should not go to the domain"));
	});

	test("bind should work", function(done) {
		var d = domain.create();
		d.on("error", function(err) {
			equal(err && err.message, "a thrown error", "error message");
			done();
		});
		d.bind(function(err, a, b) {
			equal(err && err.message, "a passed error", "error message");
			equal(a, 2, "value of a");
			equal(b, 3, "value of b");
			throw new Error("a thrown error");
		})(new Error("a passed error"), 2, 3);
	});

	test("intercept should work", function(done) {
		var d = domain.create();
		var count = 0;
		d.on("error", function(err) {
			if (count === 0) {
				equal(err && err.message, "a thrown error", "error message");
			} else if (count === 1) {
				equal(err && err.message, "a passed error", "error message");
				done();
			}
			count++;
		});

		d.intercept(function(a, b) {
			equal(a, 2, "value of a");
			equal(b, 3, "value of b");
			throw new Error("a thrown error");
		})(null, 2, 3);

		d.intercept(function(a, b) {
			throw new Error("should never reach here");
		})(new Error("a passed error"), 2, 3);
	});
});
