import SVGComponent from './SVGComponent.js';
import store from '../../store.js';

/**
 * Component for managing SVG segments
 */
class SegmentComponent extends SVGComponent {
  initialize() {
    // Initialize state
    this.state = {
      color: this.element.getAttribute('fill') || '#000000',
      isSelected: false,
      label: ''
    };

    // Set up event handlers
    this.addListener('click', this.handleClick.bind(this));
    this.addListener('mouseenter', this.handleMouseEnter.bind(this));
    this.addListener('mouseleave', this.handleMouseLeave.bind(this));

    // Subscribe to store changes
    store.on('stateChange', this.handleStoreChange.bind(this));

    // Find associated label element
    this.labelElement = document.getElementById(`label-${this.element.id}`);
  }

  /**
   * Handle click events
   * @param {MouseEvent} event - The click event
   */
  handleClick(event) {
    event.stopPropagation();
    store.setState({
      selectedElement: this.element.id,
      selectedType: 'segment'
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

    // Update label if changed
    const labels = newState.labels || {};
    const newLabel = labels[this.element.id];
    if (newLabel && newLabel !== this.state.label) {
      this.setState({ label: newLabel });
      this.updateLabel();
    }
  }

  /**
   * Update the segment's selection state
   */
  updateSelection() {
    if (this.state.isSelected) {
      this.element.style.strokeWidth = '2';
      this.element.style.stroke = '#FF6600';
      this.element.style.opacity = '1';
    } else {
      this.element.style.strokeWidth = '';
      this.element.style.stroke = '';
      this.element.style.opacity = '1';
    }
  }

  /**
   * Update the segment's color
   */
  updateColor() {
    this.element.setAttribute('fill', this.state.color);
  }

  /**
   * Update the segment's label
   */
  updateLabel() {
    if (this.labelElement) {
      const tspan = this.labelElement.querySelector('tspan');
      if (tspan) {
        tspan.textContent = this.state.label;
      } else {
        this.labelElement.textContent = this.state.label;
      }
    }
  }

  /**
   * Clean up the component
   */
  destroy() {
    store.removeAllListeners();
    super.destroy();
  }
}

// Register the component
import registry from '../../core/ComponentRegistry.js';
registry.register('segment', SegmentComponent);

export default SegmentComponent;
