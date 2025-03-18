//eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventEmitter<TEvents extends Record<string, any>> {
	private listeners: {
		[K in keyof TEvents]?: Array<(data: TEvents[K]) => void>;
	} = {};

	/**
	 * Subscribe to an event.
	 * @param event - The event name.
	 * @param callback - The callback function to execute when the event is triggered.
	 */
	on<K extends keyof TEvents>(
		event: K,
		callback: (data: TEvents[K]) => void,
	): void {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event]?.push(callback);
	}

	/**
	 * Unsubscribe from an event.
	 * @param event - The event name.
	 * @param callback - The callback function to remove.
	 */
	off<K extends keyof TEvents>(
		event: K,
		callback: (data: TEvents[K]) => void,
	): void {
		if (!this.listeners[event]) return;
		this.listeners[event] = this.listeners[event]?.filter(
			(listener) => listener !== callback,
		);
	}

	/**
	 * Emit an event, triggering all associated listeners.
	 * @param event - The event name.
	 * @param data - The data to pass to the event listeners.
	 */
	emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
		this.listeners[event]?.forEach((listener) => listener(data));
	}

	/**
	 * Remove all listeners for a given event (or all events if none specified).
	 * @param event - The event name (optional). If omitted, all events are cleared.
	 */
	clear<K extends keyof TEvents>(event?: K): void {
		if (event) {
			delete this.listeners[event];
		} else {
			this.listeners = {};
		}
	}
}
