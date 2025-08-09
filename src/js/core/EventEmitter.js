/**
 * A simple pub/sub implementation for event handling
 */
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - The event name
   * @param {Function} callback - The callback function
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      this.events.get(event)?.delete(callback);
      if (this.events.get(event)?.size === 0) {
        this.events.delete(event);
      }
    };
  }

  /**
   * Subscribe to an event once
   * @param {string} event - The event name
   * @param {Function} callback - The callback function
   * @returns {Function} - Unsubscribe function
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (...args) => {
      unsubscribe();
      callback(...args);
    });
    return unsubscribe;
  }

  /**
   * Emit an event
   * @param {string} event - The event name
   * @param {...any} args - Arguments to pass to callbacks
   */
  emit(event, ...args) {
    if (!this.events.has(event)) return;
    for (const callback of this.events.get(event)) {
      callback(...args);
    }
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - The event name
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export default EventEmitter;
