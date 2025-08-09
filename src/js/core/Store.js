import EventEmitter from './EventEmitter.js';

/**
 * Simple state management store
 */
class Store extends EventEmitter {
  constructor(initialState = {}) {
    super();
    this.state = initialState;
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;
  }

  /**
   * Get current state
   * @returns {Object} The current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state
   * @param {Object} update - State update object
   * @param {boolean} recordHistory - Whether to record this change in history
   */
  setState(update, recordHistory = true) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...update };

    if (recordHistory) {
      // Remove any future history if we're not at the end
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      // Add new state to history
      this.history.push(oldState);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
      this.historyIndex = this.history.length - 1;
    }

    this.emit('stateChange', this.state, oldState);
  }

  /**
   * Undo last change
   * @returns {boolean} Whether undo was successful
   */
  undo() {
    if (this.historyIndex >= 0) {
      const previousState = this.history[this.historyIndex];
      this.historyIndex--;
      this.setState(previousState, false);
      return true;
    }
    return false;
  }

  /**
   * Redo last undone change
   * @returns {boolean} Whether redo was successful
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const nextState = this.history[this.historyIndex];
      this.setState(nextState, false);
      return true;
    }
    return false;
  }

  /**
   * Save state to localStorage
   * @param {string} key - The key to save under
   */
  save(key) {
    localStorage.setItem(key, JSON.stringify(this.state));
  }

  /**
   * Load state from localStorage
   * @param {string} key - The key to load from
   * @returns {boolean} Whether load was successful
   */
  load(key) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const state = JSON.parse(saved);
        this.setState(state);
        return true;
      }
    } catch (e) {
      console.error('Error loading state:', e);
    }
    return false;
  }

  /**
   * Clear saved state
   * @param {string} key - The key to clear
   */
  clearSaved(key) {
    localStorage.removeItem(key);
  }
}

export default Store;
