import Component from '../../core/Component.js';

/**
 * Base class for SVG components
 */
class SVGComponent extends Component {
  constructor(element) {
    super(element);
    this.svgNamespace = 'http://www.w3.org/2000/svg';
  }

  /**
   * Create an SVG element
   * @param {string} tagName - The SVG element tag name
   * @param {Object} attributes - Attributes to set on the element
   * @returns {SVGElement} The created element
   */
  createSVGElement(tagName, attributes = {}) {
    const element = document.createElementNS(this.svgNamespace, tagName);
    this.setAttributes(element, attributes);
    return element;
  }

  /**
   * Set attributes on an SVG element
   * @param {SVGElement} element - The element to set attributes on
   * @param {Object} attributes - The attributes to set
   */
  setAttributes(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        element.setAttribute(key, value);
      }
    });
  }

  /**
   * Get the bounding box of the element
   * @returns {DOMRect} The bounding box
   */
  getBBox() {
    return this.element.getBBox();
  }

  /**
   * Get the center point of the element
   * @returns {Object} The center point {x, y}
   */
  getCenter() {
    const bbox = this.getBBox();
    return {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2
    };
  }

  /**
   * Check if a point is inside the element
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @returns {boolean} Whether the point is inside
   */
  containsPoint(x, y) {
    const bbox = this.getBBox();
    return (
      x >= bbox.x &&
      x <= bbox.x + bbox.width &&
      y >= bbox.y &&
      y <= bbox.y + bbox.height
    );
  }

  /**
   * Convert screen coordinates to SVG coordinates
   * @param {number} screenX - Screen X coordinate
   * @param {number} screenY - Screen Y coordinate
   * @returns {Object} SVG coordinates {x, y}
   */
  screenToSVGPoint(screenX, screenY) {
    const svg = this.element.ownerSVGElement;
    const point = svg.createSVGPoint();
    point.x = screenX;
    point.y = screenY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  /**
   * Convert SVG coordinates to screen coordinates
   * @param {number} svgX - SVG X coordinate
   * @param {number} svgY - SVG Y coordinate
   * @returns {Object} Screen coordinates {x, y}
   */
  SVGToScreenPoint(svgX, svgY) {
    const svg = this.element.ownerSVGElement;
    const point = svg.createSVGPoint();
    point.x = svgX;
    point.y = svgY;
    return point.matrixTransform(svg.getScreenCTM());
  }

  /**
   * Get the transformation matrix relative to the SVG root
   * @returns {SVGMatrix} The transformation matrix
   */
  getTransformToElement(element = this.element.ownerSVGElement) {
    return this.element.getScreenCTM().multiply(element.getScreenCTM().inverse());
  }
}

export default SVGComponent;
