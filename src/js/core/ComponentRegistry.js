/**
 * Registry for managing component instances
 */
class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.componentTypes = new Map();
  }

  /**
   * Register a component type
   * @param {string} name - The component name
   * @param {class} ComponentClass - The component class
   */
  register(name, ComponentClass) {
    this.componentTypes.set(name, ComponentClass);
  }

  /**
   * Create a component instance
   * @param {string} name - The component name
   * @param {HTMLElement} element - The element to attach to
   * @returns {Component} The component instance
   */
  create(name, element) {
    const ComponentClass = this.componentTypes.get(name);
    if (!ComponentClass) {
      throw new Error(`Component type "${name}" not registered`);
    }

    const component = new ComponentClass(element);
    this.components.set(element, component);
    return component;
  }

  /**
   * Get a component instance by element
   * @param {HTMLElement} element - The element
   * @returns {Component} The component instance
   */
  get(element) {
    return this.components.get(element);
  }

  /**
   * Remove a component instance
   * @param {HTMLElement} element - The element
   */
  remove(element) {
    const component = this.components.get(element);
    if (component) {
      component.destroy();
      this.components.delete(element);
    }
  }

  /**
   * Initialize components from DOM
   * @param {HTMLElement} root - The root element to search from
   */
  initializeComponents(root = document) {
    // Find all elements with data-component attribute
    const elements = root.querySelectorAll('[data-component]');
    elements.forEach(element => {
      const name = element.dataset.component;
      if (!this.get(element)) {
        this.create(name, element);
      }
    });
  }

  /**
   * Clean up all components
   */
  destroy() {
    for (const [element, component] of this.components) {
      component.destroy();
    }
    this.components.clear();
    this.componentTypes.clear();
  }
}

// Create singleton instance
const registry = new ComponentRegistry();
export default registry;
