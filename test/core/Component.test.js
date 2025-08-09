import { describe, it, expect, vi, beforeEach } from 'vitest';
import Component from '../../src/js/core/Component.js';

describe('Component', () => {
  let element;
  let component;

  beforeEach(() => {
    element = document.createElement('div');
    component = new Component(element);
  });

  it('should initialize with an element', () => {
    expect(component.element).toBe(element);
    expect(component.state).toEqual({});
  });

  it('should update state and emit stateChange event', () => {
    const callback = vi.fn();
    component.on('stateChange', callback);

    component.setState({ test: 'value' });

    expect(component.state).toEqual({ test: 'value' });
    expect(callback).toHaveBeenCalledWith(
      { test: 'value' },
      {}
    );
  });

  it('should add and remove event listeners', () => {
    const handler = vi.fn();
    component.addListener('click', handler);

    element.click();
    expect(handler).toHaveBeenCalled();

    component.removeListener('click', handler);
    element.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should support event delegation', () => {
    const handler = vi.fn();
    const child = document.createElement('span');
    child.classList.add('test');
    element.appendChild(child);

    component.addListener('click', '.test', handler);

    child.click();
    expect(handler).toHaveBeenCalled();

    const nonMatch = document.createElement('span');
    element.appendChild(nonMatch);
    nonMatch.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should clean up on destroy', () => {
    const handler = vi.fn();
    const stateCallback = vi.fn();

    component.addListener('click', handler);
    component.on('stateChange', stateCallback);

    component.destroy();

    element.click();
    expect(handler).not.toHaveBeenCalled();

    component.emit('stateChange');
    expect(stateCallback).not.toHaveBeenCalled();

    expect(component.element).toBeNull();
    expect(component.state).toBeNull();
  });
});
