import EventEmitter from './EventEmitter.js';

/**
 * Base Component class that all components should extend
 */
class Component extends EventEmitter {
  constructor(element) {
    super();
    this.element = element;
    this.state = {};
    this.boundHandlers = new Map();
    this.initialize();
  }

  /**
   * Initialize the component
   * Override this in child classes
   */
  initialize() {}

  /**
   * Update the component's state
   * @param {Object} newState - New state to merge with current state
   */
  setState(newState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.emit('stateChange', this.state, oldState);
    this.render();
  }

  /**
   * Render the component
   * Override this in child classes
   */
  render() {}

  /**
   * Add an event listener with automatic cleanup
   * @param {string} event - The event name
   * @param {string} selector - CSS selector for delegation (optional)
   * @param {Function} handler - The event handler
   */
  addListener(event, selector, handler) {
    // If no selector is provided, handler is the second argument
    if (typeof selector === 'function') {
      handler = selector;
      selector = null;
    }

    const boundHandler = selector
      ? (e) => {
          if (e.target.matches(selector)) {
            handler.call(this, e);
          }
        }
      : handler.bind(this);

    this.boundHandlers.set(handler, boundHandler);
    this.element.addEventListener(event, boundHandler);
  }

  /**
   * Remove an event listener
   * @param {string} event - The event name
   * @param {Function} handler - The original handler function
   */
  removeListener(event, handler) {
    const boundHandler = this.boundHandlers.get(handler);
    if (boundHandler) {
      this.element.removeEventListener(event, boundHandler);
      this.boundHandlers.delete(handler);
    }
  }

  /**
   * Clean up the component
   */
  destroy() {
    // Remove all event listeners
    for (const [handler, boundHandler] of this.boundHandlers) {
      this.element.removeEventListener(boundHandler);
    }
    this.boundHandlers.clear();

    // Remove all event emitter listeners
    this.removeAllListeners();

    // Clear references
    this.element = null;
    this.state = null;
  }
}

export default Component;
