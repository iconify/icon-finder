import {
	subscribeIconFinderEvent,
	fireIconFinderEvent,
	unsubscribeIconFinderEvent,
} from '../../lib/events/events';
import type { EventCallbackData } from '../../lib/events/types';

describe('Testing events', () => {
	let counter = 0;
	function eventName(): string {
		return 'test-event-' + (counter++).toString();
	}

	it('Basic event', () => {
		return new Promise((fulfill, reject) => {
			const foo = eventName();
			const payload = {
				foo: 1,
			};

			// Subscribe to event
			subscribeIconFinderEvent(foo, (data: EventCallbackData) => {
				expect(data).toBe(payload);
				fulfill(true);
			});

			// Execute event
			fireIconFinderEvent(foo, payload);
		});
	});

	it('Multiple events', () => {
		return new Promise((fulfill, reject) => {
			const foo = eventName();
			const foo1 = eventName();
			const foo2 = eventName();
			const payload = {
				foo: 1,
			};

			// Subscribe to first event
			subscribeIconFinderEvent(foo1, () => {
				reject('First event listener should not be called!');
			});

			// Subscribe to second event
			subscribeIconFinderEvent(foo2, (data: EventCallbackData) => {
				expect(data).toBe(payload);
				fulfill(true);
			});

			// This should do nothing - no listeners
			fireIconFinderEvent(foo, payload);

			// This should execute second event listener
			fireIconFinderEvent(foo2, payload);
		});
	});

	it('Multiple listeners', () => {
		return new Promise((fulfill, reject) => {
			const foo = eventName();
			const bar = eventName();
			const payload = {
				foo: 1,
			};
			const tracker = {
				bar: 0,
			};

			// Subscribe to event
			subscribeIconFinderEvent(foo, () => {
				reject('Event listener should not be called!');
			});

			subscribeIconFinderEvent(bar, (data: EventCallbackData) => {
				expect(data).toBe(payload);
				// This should be called first - check and increase "bar" counter
				expect(tracker).toEqual({
					bar: 0,
				});
				tracker.bar++;
			});

			subscribeIconFinderEvent(bar, (data: EventCallbackData) => {
				expect(data).toBe(payload);
				// This should be called after previous listener - check "bar" counter
				expect(tracker).toEqual({
					bar: 1,
				});
				fulfill(true);
			});

			// Send payload
			fireIconFinderEvent(bar, payload);
		});
	});

	it('Fire event with delay', () => {
		return new Promise((fulfill, reject) => {
			const foo = eventName();
			const bar = eventName();
			const payload = {
				foo: 1,
			};
			const tracker = {
				foo: 0,
				bar: 0,
			};

			// Subscribe to event
			subscribeIconFinderEvent(foo, (data: EventCallbackData) => {
				expect(data).toBe(payload);

				// This should be called after "bar" listener because "foo" call is delayed
				expect(tracker).toEqual({
					foo: 0,
					bar: 1,
				});
				tracker.foo++;

				fulfill(true);
			});

			subscribeIconFinderEvent(bar, (data: EventCallbackData) => {
				expect(data).toBe(payload);

				// This should have been called synchronously
				expect(tracker).toEqual({
					foo: 0,
					bar: 0,
				});
				tracker.bar++;
			});

			// Send payload with delay
			fireIconFinderEvent(foo, payload, true);

			// Send payload immediately
			fireIconFinderEvent(bar, payload);

			// "bar" listener should have been called immediately and should have changed tracker.bar value
			expect(tracker).toEqual({
				foo: 0,
				bar: 1,
			});
		});
	});

	it('Unsubscribe with callback', () => {
		const foo = eventName();
		const bar = eventName();
		const payload = {
			foo: 1,
		};
		const tracker = {
			callback2: false,
		};

		// Create event listeners and subscribe to event
		const callback = (data: EventCallbackData): void => {
			expect(data).toBe(payload);
			throw new Error('callback should have never been called!');
		};
		subscribeIconFinderEvent(foo, callback);

		const callback2 = (data: EventCallbackData): void => {
			expect(data).toBe(payload);
			tracker.callback2 = true;
		};
		subscribeIconFinderEvent(foo, callback2);

		// Unsubscribe
		unsubscribeIconFinderEvent(foo, callback);
		unsubscribeIconFinderEvent(bar, callback2); // Wrong event name

		// Fire event listener
		fireIconFinderEvent(foo, payload);

		expect(tracker).toEqual({
			callback2: true,
		});
	});

	it('Unsubscribe with key', () => {
		const foo = eventName();
		const bar = eventName();

		const payload = {
			foo: 1,
		};
		const tracker = {
			foo: false,
			bar: false,
		};

		// Create event listeners and subscribe to event
		subscribeIconFinderEvent(
			foo,
			(data: EventCallbackData) => {
				expect(data).toBe(payload);
				throw new Error(
					'callback for foo should have never been called!'
				);
			},
			'test'
		);

		// Same key, different event (making sure its not overwritten)
		subscribeIconFinderEvent(
			bar,
			(data: EventCallbackData) => {
				expect(data).toBe(payload);
				expect(tracker).toEqual({
					foo: true,
					bar: false,
				});
				tracker.bar = true;
			},
			'test'
		);

		// Overwrite previous listener for "foo", but not for "bar"
		subscribeIconFinderEvent(
			foo,
			(data: EventCallbackData) => {
				expect(data).toBe(payload);
				expect(tracker).toEqual({
					foo: false,
					bar: false,
				});
				tracker.foo = true;
			},
			'test'
		);

		subscribeIconFinderEvent(
			bar,
			(data: EventCallbackData) => {
				expect(data).toBe(payload);
				throw new Error(
					'callback for bar should have never been called!'
				);
			},
			'test2'
		);

		// Unsubscribe
		unsubscribeIconFinderEvent(foo, 'test3'); // No such key
		unsubscribeIconFinderEvent(bar, 'test2');

		// Fire event listeners
		fireIconFinderEvent(foo, payload);
		fireIconFinderEvent(bar, payload);

		expect(tracker).toEqual({
			foo: true,
			bar: true,
		});
	});
});
