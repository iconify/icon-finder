// Callback payload
export type EventCallbackData = unknown;

// Callback format for event listener
export type EventCallback = (
	data: EventCallbackData,
	event: string,
	key?: string | undefined
) => void;
