import type { EventCallback, EventCallbackData } from './types';

// Event subscriber
interface EventSubscriber {
	callback: EventCallback;
	key?: string;
}

// List of subscribers for all events
const subscribers = Object.create(null) as Record<string, EventSubscriber[]>;

/**
 * Subscribe to event
 *
 * @param event Event name
 * @param callback Callback function
 * @param key Optional unique key for unsubscribe. If key is set, any other event listener with same key will be removed
 */
export function subscribeIconFinderEvent(
	event: string,
	callback: EventCallback,
	key?: string
): void {
	if (typeof key === 'string') {
		unsubscribeIconFinderEvent(event, key);
	}

	// Add new subscriber
	(subscribers[event] = subscribers[event] || []).push({
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
export function unsubscribeIconFinderEvent(
	event: string,
	value: EventCallback | string
): void {
	const listeners = subscribers[event];
	if (listeners) {
		const key: keyof EventSubscriber =
			typeof value === 'function' ? 'callback' : 'key';
		subscribers[event] = listeners.filter((item) => item[key] !== value);
	}
}

/**
 * Fire event
 *
 * @param event
 * @param data
 */
function _fire(event: string, data: EventCallbackData): void {
	subscribers[event]?.forEach((item) => {
		item.callback(data, event, item.key);
	});
}

/**
 * Fire event
 *
 * @param event Event name
 * @param data Payload
 * @param delay True if event should fire on next tick
 */
export function fireIconFinderEvent(
	event: string,
	data: EventCallbackData,
	delay = false
): void {
	if (delay) {
		setTimeout(() => {
			_fire(event, data);
		});
	} else {
		_fire(event, data);
	}
}
