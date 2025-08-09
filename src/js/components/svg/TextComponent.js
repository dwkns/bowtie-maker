import SVGComponent from './SVGComponent.js';
import store from '../../store.js';

/**
 * Component for managing SVG text elements
 */
class TextComponent extends SVGComponent {
  initialize() {
    // Initialize state
    this.state = {
      color: this.element.getAttribute('fill') || '#333333',
      isSelected: false,
      text: this.getTextContent()
    };

    // Set up event handlers
    this.addListener('click', this.handleClick.bind(this));
    this.addListener('mouseenter', this.handleMouseEnter.bind(this));
    this.addListener('mouseleave', this.handleMouseLeave.bind(this));

    // Subscribe to store changes
    store.on('stateChange', this.handleStoreChange.bind(this));

    // Create underline element if needed
    this.underline = null;
  }

  /**
   * Get the text content from the element
   * @returns {string} The text content
   */
  getTextContent() {
    const tspan = this.element.querySelector('tspan');
    return tspan ? tspan.textContent : this.element.textContent;
  }

  /**
   * Handle click events
   * @param {MouseEvent} event - The click event
   */
  handleClick(event) {
    event.stopPropagation();
    store.setState({
      selectedElement: this.element.id,
      selectedType: 'text'
    });
  }

  /**
   * Handle mouse enter events
   */
  handleMouseEnter() {
    if (!this.state.isSelected) {
      this.element.style.opacity = '0.8';
    }
  }

  /**
   * Handle mouse leave events
   */
  handleMouseLeave() {
    if (!this.state.isSelected) {
      this.element.style.opacity = '1';
    }
  }

  /**
   * Handle store state changes
   * @param {Object} newState - The new store state
   */
  handleStoreChange(newState) {
    const isSelected = newState.selectedElement === this.element.id;
    if (isSelected !== this.state.isSelected) {
      this.setState({ isSelected });
      this.updateSelection();
    }

    // Update color if changed
    const colors = newState.colors || {};
    const newColor = colors[this.element.id];
    if (newColor && newColor !== this.state.color) {
      this.setState({ color: newColor });
      this.updateColor();
    }

    // Update text if changed
    const texts = newState.texts || {};
    const newText = texts[this.element.id];
    if (newText && newText !== this.state.text) {
      this.setState({ text: newText });
      this.updateText();
    }
  }

  /**
   * Update the text's selection state
   */
  updateSelection() {
    if (this.state.isSelected) {
      this.createUnderline();
    } else {
      this.removeUnderline();
    }
    this.element.style.opacity = '1';
  }

  /**
   * Create the selection underline
   */
  createUnderline() {
    if (!this.underline) {
      this.underline = this.createSVGElement('line', {
        stroke: '#FF6600',
        'stroke-width': '4',
        'stroke-linecap': 'round'
      });
      this.element.parentNode.appendChild(this.underline);
    }

    const bbox = this.getBBox();
    const underlineY = bbox.y + bbox.height + 4;

    this.setAttributes(this.underline, {
      x1: bbox.x,
      y1: underlineY,
      x2: bbox.x + bbox.width,
      y2: underlineY
    });
  }

  /**
   * Remove the selection underline
   */
  removeUnderline() {
    if (this.underline) {
      this.underline.remove();
      this.underline = null;
    }
  }

  /**
   * Update the text's color
   */
  updateColor() {
    this.element.setAttribute('fill', this.state.color);
  }

  /**
   * Update the text content
   */
  updateText() {
    const tspan = this.element.querySelector('tspan');
    if (tspan) {
      tspan.textContent = this.state.text;
    } else {
      this.element.textContent = this.state.text;
    }
  }

  /**
   * Clean up the component
   */
  destroy() {
    this.removeUnderline();
    store.removeAllListeners();
    super.destroy();
  }
}

// Register the component
import registry from '../../core/ComponentRegistry.js';
registry.register('text', TextComponent);

export default TextComponent;
