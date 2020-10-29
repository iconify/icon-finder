import 'mocha';
import { expect } from 'chai';
import type { EventCallbackData } from '../../lib/events';
import { Events } from '../../lib/events';

describe('Testing events', () => {
	it('Basic event', (done) => {
		const e = new Events();
		const payload = {
			foo: 1,
		};

		// Subscribe to event
		e.subscribe('foo', (data: EventCallbackData) => {
			expect(data).to.be.equal(payload);
			done();
		});

		// Execute event
		e.fire('foo', payload);
	});

	it('Multiple events', (done) => {
		const e = new Events();
		const payload = {
			foo: 1,
		};

		// Subscribe to foo1
		e.subscribe('foo1', () => {
			done('Foo1 event listener should not be called!');
		});

		// Subscribe to foo2
		e.subscribe('foo2', (data: EventCallbackData) => {
			expect(data).to.be.equal(payload);
			done();
		});

		// This should do nothing - no listeners
		e.fire('foo', payload);

		// This should execute foo2 listener
		e.fire('foo2', payload);
	});

	it('Multiple listeners', (done) => {
		const e = new Events();
		const payload = {
			foo: 1,
		};
		const tracker = {
			bar: 0,
		};

		// Subscribe to event
		e.subscribe('foo', () => {
			done('Foo event listener should not be called!');
		});

		e.subscribe('bar', (data: EventCallbackData) => {
			expect(data).to.be.equal(payload);
			// This should be called first - check and increase "bar" counter
			expect(tracker).to.be.eql({
				bar: 0,
			});
			tracker.bar++;
		});

		e.subscribe('bar', (data: EventCallbackData) => {
			expect(data).to.be.equal(payload);
			// This should be called after previous listener - check "bar" counter
			expect(tracker).to.be.eql({
				bar: 1,
			});
			done();
		});

		// Send payload
		e.fire('bar', payload);
	});

	it('Fire event with delay', (done) => {
		const e = new Events();
		const payload = {
			foo: 1,
		};
		const tracker = {
			foo: 0,
			bar: 0,
		};

		// Subscribe to event
		e.subscribe('foo', (data: EventCallbackData) => {
			expect(data).to.be.equal(payload);

			// This should be called after "bar" listener because "foo" call is delayed
			expect(tracker).to.be.eql({
				foo: 0,
				bar: 1,
			});
			tracker.foo++;

			done();
		});

		e.subscribe('bar', (data: EventCallbackData) => {
			expect(data).to.be.equal(payload);

			// This should have been called synchronously
			expect(tracker).to.be.eql({
				foo: 0,
				bar: 0,
			});
			tracker.bar++;
		});

		// Send payload with delay
		e.fire('foo', payload, true);

		// Send payload immediately
		e.fire('bar', payload);

		// "bar" listener should have been called immediately and should have changed tracker.bar value
		expect(tracker).to.be.eql({
			foo: 0,
			bar: 1,
		});
	});

	it('Unsubscribe with callback', (done) => {
		const e = new Events();
		const payload = {
			foo: 1,
		};
		const tracker = {
			callback2: false,
		};

		// Create event listeners and subscribe to event
		const callback = (data: EventCallbackData): void => {
			expect(data).to.be.equal(payload);
			done('callback should have never been called!');
		};
		e.subscribe('foo', callback);

		const callback2 = (data: EventCallbackData): void => {
			expect(data).to.be.equal(payload);
			tracker.callback2 = true;
		};
		e.subscribe('foo', callback2);

		// Unsubscribe
		e.unsubscribe('foo', callback);
		e.unsubscribe('bar', callback2); // Wrong event name

		// Fire event listener
		e.fire('foo', payload);

		expect(tracker).to.be.eql({
			callback2: true,
		});
		done();
	});

	it('Unsubscribe with key', (done) => {
		const e = new Events();
		const payload = {
			foo: 1,
		};
		const tracker = {
			foo: false,
			bar: false,
		};

		// Create event listeners and subscribe to event
		e.subscribe(
			'foo',
			(data: EventCallbackData) => {
				expect(data).to.be.equal(payload);
				done('callback for foo should have never been called!');
			},
			'test'
		);

		// Same key, different event (making sure its not overwritten)
		e.subscribe(
			'bar',
			(data: EventCallbackData) => {
				expect(data).to.be.equal(payload);
				expect(tracker).to.be.eql({
					foo: true,
					bar: false,
				});
				tracker.bar = true;
			},
			'test'
		);

		// Overwrite previous listener for "foo", but not for "bar"
		e.subscribe(
			'foo',
			(data: EventCallbackData) => {
				expect(data).to.be.equal(payload);
				expect(tracker).to.be.eql({
					foo: false,
					bar: false,
				});
				tracker.foo = true;
			},
			'test'
		);

		e.subscribe(
			'bar',
			(data: EventCallbackData) => {
				expect(data).to.be.equal(payload);
				done('callback for bar should have never been called!');
			},
			'test2'
		);

		// Unsubscribe
		e.unsubscribe('foo', 'test3'); // No such key
		e.unsubscribe('bar', 'test2');

		// Fire event listeners
		e.fire('foo', payload);
		e.fire('bar', payload);

		expect(tracker).to.be.eql({
			foo: true,
			bar: true,
		});
		done();
	});
});
