/**
 * =============================================================================
 * Event Bus (Pub/Sub System)
 * =============================================================================
 * Type-safe event system for component communication
 * Functional architecture with no classes
 * =============================================================================
 */

import { EventName } from '../types/events.types.js';
import type { EventMap, EventHandler } from '../types/events.types.js';

/**
 * Event listener storage
 */
type Listener = {
  handler: EventHandler<unknown>;
  once: boolean;
};

/**
 * Event bus state (private)
 */
const listeners = new Map<EventName, Listener[]>();

/**
 * Subscribe to an event
 *
 * @param event - Event name (type-safe)
 * @param handler - Event handler function
 * @returns Unsubscribe function
 *
 * @example
 * const unsubscribe = on(EventName.CONFIG_CHANGE, (payload) => {
 *   console.log('Config changed:', payload.key, payload.value);
 * });
 *
 * // Later: unsubscribe()
 */
export function on<K extends keyof EventMap>(
  event: K,
  handler: EventHandler<EventMap[K]>
): () => void {
  let eventListeners = listeners.get(event);
  if (!eventListeners) {
    eventListeners = [];
    listeners.set(event, eventListeners);
  }

  const listener: Listener = { handler: handler as EventHandler<unknown>, once: false };
  eventListeners.push(listener);

  // Return unsubscribe function
  return () => off(event, handler as EventHandler<unknown>);
}

/**
 * Subscribe to an event (one time only)
 *
 * @param event - Event name (type-safe)
 * @param handler - Event handler function
 * @returns Unsubscribe function
 *
 * @example
 * once(EventName.CONFIG_LOADED, (payload) => {
 *   console.log('Config loaded:', payload.theme);
 * });
 */
export function once<K extends keyof EventMap>(
  event: K,
  handler: EventHandler<EventMap[K]>
): () => void {
  let eventListeners = listeners.get(event);
  if (!eventListeners) {
    eventListeners = [];
    listeners.set(event, eventListeners);
  }

  const listener: Listener = { handler: handler as EventHandler<unknown>, once: true };
  eventListeners.push(listener);

  return () => off(event, handler as EventHandler<unknown>);
}

/**
 * Unsubscribe from an event
 *
 * @param event - Event name
 * @param handler - Event handler to remove
 *
 * @example
 * const handleChange = (payload) => console.log(payload);
 * on(EventName.CONFIG_CHANGE, handleChange);
 * off(EventName.CONFIG_CHANGE, handleChange);
 */
export function off(
  event: EventName,
  handler: EventHandler<unknown>
): void {
  const eventListeners = listeners.get(event);
  if (!eventListeners) return;

  const filtered = eventListeners.filter(
    listener => listener.handler !== handler
  );

  if (filtered.length === 0) {
    listeners.delete(event);
  } else {
    listeners.set(event, filtered);
  }
}

/**
 * Emit an event to all subscribers
 *
 * @param event - Event name (type-safe)
 * @param payload - Event payload (type-safe based on event)
 *
 * @example
 * emit(EventName.CONFIG_CHANGE, {
 *   key: 'brand_primary',
 *   value: { l: 60, c: 0.18, h: 262 },
 *   previousValue: { l: 50, c: 0.15, h: 220 },
 *   theme: updatedTheme
 * });
 */
export function emit<K extends keyof EventMap>(
  event: K,
  payload: EventMap[K]
): void {
  const eventListeners = listeners.get(event);
  if (!eventListeners) return;

  // Copy array to avoid issues if handlers modify listeners
  const listenersCopy = [...eventListeners];

  for (const listener of listenersCopy) {
    try {
      listener.handler(payload);
    } catch (error) {
      console.error(`Error in event handler for ${event}:`, error);
    }

    // Remove one-time listeners after execution
    if (listener.once) {
      off(event, listener.handler);
    }
  }
}

/**
 * Remove all listeners for a specific event
 *
 * @param event - Event name
 *
 * @example
 * clear(EventName.CONFIG_CHANGE);
 */
export function clear(event: EventName): void {
  listeners.delete(event);
}

/**
 * Remove all listeners for all events
 *
 * @example
 * clearAll(); // Clean slate
 */
export function clearAll(): void {
  listeners.clear();
}

/**
 * Get listener count for an event
 *
 * @param event - Event name
 * @returns Number of listeners
 *
 * @example
 * listenerCount(EventName.CONFIG_CHANGE) // 3
 */
export function listenerCount(event: EventName): number {
  return listeners.get(event)?.length ?? 0;
}

/**
 * Get all registered event names
 *
 * @returns Array of event names with active listeners
 *
 * @example
 * getEvents() // [EventName.CONFIG_CHANGE, EventName.COLOR_CHANGE]
 */
export function getEvents(): EventName[] {
  return Array.from(listeners.keys());
}

/**
 * Debug helper: log all events
 *
 * @param enable - Enable/disable event logging
 *
 * @example
 * debugEvents(true);  // Log all events
 * debugEvents(false); // Stop logging
 */
export function debugEvents(enable: boolean): void {
  if (enable) {
    for (const eventName of Object.values(EventName)) {
      on(eventName, (payload: unknown) => {
        console.info(`[EventBus] ${eventName}`, payload);
      });
    }
  } else {
    clearAll();
  }
}
