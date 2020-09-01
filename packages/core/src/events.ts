// Callback payload
export type EventCallbackData = unknown;

// Callback format for event listener
export interface EventCallback {
	(data: EventCallbackData, event: string): void;
}

// Event subscriber
interface EventSubscriber {
	callback: EventCallback;
	key?: string;
}

// List of subscribers for all events
interface EventSubscribers {
	[key: string]: EventSubscriber[];
}

/**
 * Events class
 */
export class Events {
	protected readonly _subscribers = Object.create(null) as EventSubscribers;

	/**
	 * Subscribe to event
	 *
	 * @param event Event name
	 * @param callback Callback function
	 * @param key Optional unique key for unsubscribe. If key is set, any other event listener with same key will be removed
	 */
	subscribe(event: string, callback: EventCallback, key?: string): void {
		if (this._subscribers[event] === void 0) {
			// Create new array
			this._subscribers[event] = [];
		} else if (typeof key === 'string') {
			// Remove previous subscribers with same key
			this._subscribers[event] = this._subscribers[event].filter(
				(item) => item.key !== key
			);
		}

		// Add new subscriber
		this._subscribers[event].push({
			callback,
			key,
		} as EventSubscriber);
	}

	/**
	 * Unsubscribe from event
	 *
	 * @param event Event name
	 * @param value Callback or key
	 */
	unsubscribe(event: string, value: EventCallback | string): void {
		if (this._subscribers[event] === void 0) {
			return;
		}

		let key: keyof EventSubscriber;
		switch (typeof value) {
			case 'function':
				key = 'callback';
				break;

			case 'string':
				key = 'key';
				break;

			default:
				return;
		}

		this._subscribers[event] = this._subscribers[event].filter(
			(item) => item[key] !== value
		);
	}

	/**
	 * Check if event has listeners
	 *
	 * @param event Event name
	 */
	hasListeners(event: string): boolean {
		return (
			this._subscribers[event] !== void 0 &&
			this._subscribers[event].length > 0
		);
	}

	/**
	 * Fire event
	 *
	 * @param event Event name
	 * @param data Payload
	 * @param delay True if event should fire on next tick
	 */
	fire(event: string, data: EventCallbackData, delay = false): void {
		if (!this.hasListeners(event)) {
			return;
		}

		if (delay) {
			setTimeout(() => {
				this._fire(event, data);
			});
		} else {
			this._fire(event, data);
		}
	}

	/**
	 * Fire event
	 *
	 * @param event
	 * @param data
	 */
	_fire(event: string, data: EventCallbackData): void {
		this._subscribers[event].forEach((item) => {
			item.callback(data, event);
		});
	}
}
