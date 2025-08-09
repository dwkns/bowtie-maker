import { describe, it, expect, vi, beforeEach } from 'vitest';
import Store from '../../src/js/core/Store.js';

describe('Store', () => {
  let store;

  beforeEach(() => {
    store = new Store({ test: 'initial' });
    vi.clearAllMocks();
  });

  it('should initialize with initial state', () => {
    expect(store.getState()).toEqual({ test: 'initial' });
  });

  it('should update state and emit stateChange event', () => {
    const callback = vi.fn();
    store.on('stateChange', callback);

    store.setState({ newKey: 'value' });

    expect(store.getState()).toEqual({
      test: 'initial',
      newKey: 'value'
    });
    expect(callback).toHaveBeenCalledWith(
      { test: 'initial', newKey: 'value' },
      { test: 'initial' }
    );
  });

  it('should support undo/redo operations', () => {
    store.setState({ value: 1 });
    store.setState({ value: 2 });
    store.setState({ value: 3 });

    expect(store.getState().value).toBe(3);

    store.undo();
    expect(store.getState().value).toBe(2);

    store.undo();
    expect(store.getState().value).toBe(1);

    store.redo();
    expect(store.getState().value).toBe(2);

    store.redo();
    expect(store.getState().value).toBe(3);
  });

  it('should limit history size', () => {
    store.maxHistory = 3;

    store.setState({ value: 1 });
    store.setState({ value: 2 });
    store.setState({ value: 3 });
    store.setState({ value: 4 });

    // Can only undo 3 times
    store.undo();
    store.undo();
    store.undo();
    const result = store.undo();

    expect(result).toBe(false);
    expect(store.getState().value).toBe(1);
  });

  it('should save and load state from localStorage', () => {
    store.setState({ saved: 'value' });
    store.save('testKey');

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'testKey',
      JSON.stringify({ test: 'initial', saved: 'value' })
    );

    localStorage.getItem.mockReturnValue(JSON.stringify({ loaded: 'state' }));
    store.load('testKey');

    expect(localStorage.getItem).toHaveBeenCalledWith('testKey');
    expect(store.getState()).toEqual({ loaded: 'state' });
  });

  it('should handle load errors gracefully', () => {
    localStorage.getItem.mockReturnValue('invalid json');
    const result = store.load('testKey');

    expect(result).toBe(false);
    expect(store.getState()).toEqual({ test: 'initial' });
  });

  it('should clear saved state', () => {
    store.clearSaved('testKey');
    expect(localStorage.removeItem).toHaveBeenCalledWith('testKey');
  });
});
