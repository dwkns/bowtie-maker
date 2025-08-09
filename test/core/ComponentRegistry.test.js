import { describe, it, expect, vi, beforeEach } from 'vitest';
import Component from '../../src/js/core/Component.js';
import registry from '../../src/js/core/ComponentRegistry.js';

class TestComponent extends Component {
  initialize() {
    this.initialized = true;
  }
}

describe('ComponentRegistry', () => {
  beforeEach(() => {
    registry.destroy();
  });

  it('should register component types', () => {
    registry.register('test', TestComponent);
    const element = createElement('div');
    const component = registry.create('test', element);

    expect(component).toBeInstanceOf(TestComponent);
    expect(component.initialized).toBe(true);
  });

  it('should get component instances by element', () => {
    registry.register('test', TestComponent);
    const element = createElement('div');
    const component = registry.create('test', element);

    expect(registry.get(element)).toBe(component);
  });

  it('should remove component instances', () => {
    registry.register('test', TestComponent);
    const element = createElement('div');
    const component = registry.create('test', element);

    registry.remove(element);
    expect(registry.get(element)).toBeUndefined();
  });

  it('should initialize components from DOM', () => {
    registry.register('test', TestComponent);
    const element = createElement('div', {
      dataset: { component: 'test' }
    });
    document.body.appendChild(element);

    registry.initializeComponents();
    const component = registry.get(element);

    expect(component).toBeInstanceOf(TestComponent);
    expect(component.initialized).toBe(true);
  });

  it('should throw error for unregistered component types', () => {
    const element = createElement('div');
    expect(() => registry.create('unknown', element)).toThrow();
  });

  it('should clean up all components on destroy', () => {
    registry.register('test', TestComponent);
    const element1 = createElement('div');
    const element2 = createElement('div');
    const component1 = registry.create('test', element1);
    const component2 = registry.create('test', element2);

    registry.destroy();

    expect(registry.get(element1)).toBeUndefined();
    expect(registry.get(element2)).toBeUndefined();
    expect(component1.element).toBeNull();
    expect(component2.element).toBeNull();
  });
});
