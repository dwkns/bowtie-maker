import { describe, it, expect, vi } from 'vitest';
import EventEmitter from '../../src/js/core/EventEmitter.js';

describe('EventEmitter', () => {
  it('should subscribe to events with on()', () => {
    const emitter = new EventEmitter();
    const callback = vi.fn();

    emitter.on('test', callback);
    emitter.emit('test', 'data');

    expect(callback).toHaveBeenCalledWith('data');
  });

  it('should unsubscribe from events using returned function', () => {
    const emitter = new EventEmitter();
    const callback = vi.fn();

    const unsubscribe = emitter.on('test', callback);
    unsubscribe();
    emitter.emit('test', 'data');

    expect(callback).not.toHaveBeenCalled();
  });

  it('should subscribe once with once()', () => {
    const emitter = new EventEmitter();
    const callback = vi.fn();

    emitter.once('test', callback);
    emitter.emit('test', 'data1');
    emitter.emit('test', 'data2');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('data1');
  });

  it('should remove all listeners for an event', () => {
    const emitter = new EventEmitter();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    emitter.on('test', callback1);
    emitter.on('test', callback2);
    emitter.removeAllListeners('test');
    emitter.emit('test', 'data');

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  it('should remove all listeners for all events', () => {
    const emitter = new EventEmitter();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    emitter.on('test1', callback1);
    emitter.on('test2', callback2);
    emitter.removeAllListeners();
    emitter.emit('test1', 'data');
    emitter.emit('test2', 'data');

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});
