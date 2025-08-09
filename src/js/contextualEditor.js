// Contextual Editor Module
import { getOptimalTextColor } from './colorUtils.js';

class ContextualEditor {
  constructor(colorManager, labelManager) {
    this.colorManager = colorManager;
    this.labelManager = labelManager;
    this.currentSegmentId = null;
    this.isTextElement = false;
    this.isLineElement = false;
    this.initialize();
  }

  initialize() {
    this.setupSVGClickHandlers();
    this.setupDocumentClickHandler();
    this.setupEventListeners();
    this.disableControls(); // Start with disabled controls
  }

  setupSVGClickHandlers() {
    const svgContainer = document.getElementById('svg-container');
    if (svgContainer) {
      // Add click handlers to all segments and text elements
      const segments = svgContainer.querySelectorAll('[id^="segment-"]');
      const textElements = svgContainer.querySelectorAll('[id^="label-segment-"], [id^="title-"]');
      const lines = svgContainer.querySelectorAll('[id^="line-"]');
      
      segments.forEach(segment => {
        segment.style.cursor = 'pointer';
        segment.addEventListener('click', (event) => {
          event.stopPropagation();
          this.selectSegment(segment.id);
        });
      });
      
      textElements.forEach(textElement => {
        textElement.style.cursor = 'pointer';
        textElement.addEventListener('click', (event) => {
          event.stopPropagation();
          // Check if this text element is associated with a segment
          const associatedSegmentId = this.findAssociatedSegment(textElement.id);
          if (associatedSegmentId) {
            // If it's associated with a segment, select the segment instead
            this.selectSegment(associatedSegmentId);
          } else {
            // If it's not associated with a segment (like title elements), select the text element
            this.selectTextElement(textElement.id);
          }
        });
      });
      
      lines.forEach(line => {
        line.addEventListener('click', (event) => {
          event.stopPropagation();
          this.selectLine(line.id);
        });
      });
    }
  }

  setupDocumentClickHandler() {
    // Clear selection when clicking outside
    document.addEventListener('click', (event) => {
      const contextualBox = document.getElementById('contextual-edit-box');
      if (contextualBox && !contextualBox.contains(event.target)) {
        this.clearSelection();
      }
    });
  }

  setupEventListeners() {
    // Color picker change
    document.addEventListener('change', (event) => {
      if (event.target.classList.contains('contextual-color-input')) {
        this.handleColorChange(event);
      }
    });

    // Hex input change
    document.addEventListener('input', (event) => {
      if (event.target.classList.contains('contextual-hex-input')) {
        this.handleHexInputChange(event);
      }
    });

    // Hex input blur
    document.addEventListener('blur', (event) => {
      if (event.target.classList.contains('contextual-hex-input')) {
        this.handleHexInputBlur(event);
      }
    });

    // Label input change
    document.addEventListener('input', (event) => {
      if (event.target.classList.contains('contextual-label-input')) {
        this.handleLabelInputChange(event);
      }
    });


  }

  selectSegment(segmentId) {
    // Clear previous selection
    this.clearSegmentHighlight();
    
    this.currentSegmentId = segmentId;
    this.isTextElement = false;
    this.isLineElement = false;
    this.populateEditBox(segmentId);
    this.highlightSegment(segmentId);
    this.enableControls();
    this.focusLabelInput();
  }

  selectTextElement(textElementId) {
    // Clear previous selection
    this.clearSegmentHighlight();
    
    this.currentSegmentId = textElementId;
    this.isTextElement = true;
    this.isLineElement = false;
    this.populateEditBox(textElementId);
    this.highlightTextElement(textElementId);
    this.enableControls();
    this.focusLabelInput();
  }

  selectLine(lineId) {
    // Clear previous selection
    this.clearSegmentHighlight();
    
    this.currentSegmentId = lineId;
    this.isTextElement = false;
    this.isLineElement = true;
    this.populateEditBox(lineId);
    this.highlightLine(lineId);
    this.enableControls();
    this.focusLabelInput();
  }

  clearSelection() {
    this.clearSegmentHighlight();
    this.currentSegmentId = null;
    this.isTextElement = false;
    this.clearEditBox();
    this.disableControls();
  }

  highlightSegment(segmentId) {
    const segment = document.getElementById(segmentId);
    if (segment) {
      segment.style.stroke = '#FF6600';
      segment.style.strokeWidth = '5';
    }
  }

  highlightTextElement(textElementId) {
    const textElement = document.getElementById(textElementId);
    if (textElement) {
      // Get the bounding box of the text
      const bbox = textElement.getBBox();
      
      // Create or update the underline
      let underline = document.getElementById('text-highlight-underline');
      if (!underline) {
        underline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        underline.id = 'text-highlight-underline';
        underline.setAttribute('stroke', '#FF6600');
        underline.setAttribute('stroke-width', '4');
        underline.setAttribute('stroke-linecap', 'round');
        textElement.parentNode.appendChild(underline);
      }
      
      // Position the underline below the text, ensuring it's within the SVG bounds
      const underlineY = Math.min(bbox.y + bbox.height + 4, 525); // 4px below the text, but not beyond SVG bounds
      
      underline.setAttribute('x1', bbox.x);
      underline.setAttribute('y1', underlineY);
      underline.setAttribute('x2', bbox.x + bbox.width);
      underline.setAttribute('y2', underlineY);
    }
  }

  highlightLine(lineId) {
    const lineElement = document.getElementById(lineId);
    if (lineElement) {
      // Add a glow effect and increase stroke width to show selection
      // without changing the line color
      lineElement.style.strokeWidth = '3';
      lineElement.style.filter = 'drop-shadow(0 0 4px #FF6600)';
    }
  }

  clearSegmentHighlight() {
    const allSegments = document.querySelectorAll('[id^="segment-"]');
    const allTextElements = document.querySelectorAll('[id^="label-segment-"], [id^="title-"]');
    const allLines = document.querySelectorAll('[id^="line-"]');
    
    allSegments.forEach(segment => {
      segment.style.stroke = '';
      segment.style.strokeWidth = '';
    });
    
    allTextElements.forEach(textElement => {
      textElement.style.stroke = '';
      textElement.style.strokeWidth = '';
    });
    
    allLines.forEach(line => {
      line.style.strokeWidth = '';
      line.style.filter = '';
    });
    
    // Remove the underline
    const underline = document.getElementById('text-highlight-underline');
    if (underline) {
      underline.remove();
    }
  }

  enableControls() {
    const colorInput = document.querySelector('.contextual-color-input');
    const hexInput = document.querySelector('.contextual-hex-input');
    const labelInput = document.querySelector('.contextual-label-input');

    if (colorInput) colorInput.disabled = false;
    if (hexInput) hexInput.disabled = false;
    if (labelInput) labelInput.disabled = false;
  }

  disableControls() {
    const colorInput = document.querySelector('.contextual-color-input');
    const hexInput = document.querySelector('.contextual-hex-input');
    const labelInput = document.querySelector('.contextual-label-input');

    if (colorInput) colorInput.disabled = true;
    if (hexInput) hexInput.disabled = true;
    if (labelInput) labelInput.disabled = true;
  }

  populateEditBox(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let currentColor, currentLabel;

    if (this.isTextElement) {
      // Handle text elements
      currentColor = element.getAttribute('fill') || '#333333';
      // Get text content from tspan if it exists, otherwise from element
      const tspan = element.querySelector('tspan');
      currentLabel = (tspan ? tspan.textContent : element.textContent || '').trim();
    } else if (this.isLineElement) {
      // Handle line elements
      currentColor = element.getAttribute('stroke') || '#858484';
      currentLabel = ''; // Lines don't have labels
    } else {
      // Handle segment elements - look for corresponding label element
      currentColor = element.getAttribute('fill');
      const labelElement = document.getElementById(`label-${elementId}`);
      if (labelElement) {
        const tspan = labelElement.querySelector('tspan');
        currentLabel = (tspan ? tspan.textContent : labelElement.textContent || '').trim();
      } else {
        currentLabel = this.labelManager.getLabel(elementId);
      }
    }

    // Update color picker
    const colorInput = document.querySelector('.contextual-color-input');
    if (colorInput) {
      colorInput.value = currentColor;
      colorInput.style.backgroundColor = currentColor;
    }

    // Update hex input
    const hexInput = document.querySelector('.contextual-hex-input');
    if (hexInput) {
      const hexValue = currentColor.toUpperCase().replace('#', '');
      hexInput.value = hexValue;
      hexInput.dataset.lastValidValue = hexValue;
    }

    // Update label input
    const labelInput = document.querySelector('.contextual-label-input');
    if (labelInput) {
      labelInput.value = currentLabel;
    }
  }

  clearEditBox() {
    const colorInput = document.querySelector('.contextual-color-input');
    const hexInput = document.querySelector('.contextual-hex-input');
    const labelInput = document.querySelector('.contextual-label-input');

    if (colorInput) {
      colorInput.value = '#d1d5db';
      colorInput.style.backgroundColor = '#d1d5db';
    }

    if (hexInput) {
      hexInput.value = '';
      hexInput.placeholder = '';
    }

    if (labelInput) {
      labelInput.value = '';
      labelInput.placeholder = 'Enter label text';
    }
  }



  handleColorChange(event) {
    if (!this.currentSegmentId) return;

    const newColor = event.target.value;
    
    if (this.isTextElement) {
      // Update text color
      const textElement = document.getElementById(this.currentSegmentId);
      if (textElement) {
        textElement.setAttribute('fill', newColor);
      }
      // Notify change tracker
      if (window.changeTracker) {
        window.changeTracker.updateColor(this.currentSegmentId, newColor);
      }
    } else if (this.isLineElement) {
      // Update line color
      const lineElement = document.getElementById(this.currentSegmentId);
      if (lineElement) {
        lineElement.setAttribute('stroke', newColor);
      }
    } else {
      // Update segment color
      this.colorManager.updateSegmentColor(this.currentSegmentId, newColor);
    }
    
    // Update color picker background
    const colorInput = document.querySelector('.contextual-color-input');
    if (colorInput) {
      colorInput.style.backgroundColor = newColor;
    }
    
    // Update hex input
    const hexInput = document.querySelector('.contextual-hex-input');
    if (hexInput) {
      const hexValue = newColor.toUpperCase().replace('#', '');
      hexInput.value = hexValue;
      hexInput.dataset.lastValidValue = hexValue;
    }
  }

  handleHexInputChange(event) {
    if (!this.currentSegmentId) return;

    const hexValue = event.target.value.trim();
    if (this.colorManager.isValidHexColor(hexValue)) {
      const fullHexValue = '#' + hexValue.toUpperCase();
      
      if (this.isTextElement) {
        // Update text color
        const textElement = document.getElementById(this.currentSegmentId);
        if (textElement) {
          textElement.setAttribute('fill', fullHexValue);
        }
        // Notify change tracker
        if (window.changeTracker) {
          window.changeTracker.updateColor(this.currentSegmentId, fullHexValue);
        }
      } else if (this.isLineElement) {
        // Update line color
        const lineElement = document.getElementById(this.currentSegmentId);
        if (lineElement) {
          lineElement.setAttribute('stroke', fullHexValue);
        }
      } else {
        // Update segment color
        this.colorManager.updateSegmentColor(this.currentSegmentId, fullHexValue);
      }
      
      // Update color picker
      const colorInput = document.querySelector('.contextual-color-input');
      if (colorInput) {
        colorInput.value = fullHexValue;
        colorInput.style.backgroundColor = fullHexValue;
      }
      
      event.target.dataset.lastValidValue = hexValue.toUpperCase();
    }
  }

  handleHexInputBlur(event) {
    if (!this.currentSegmentId) return;

    const hexValue = event.target.value.trim();
    if (!hexValue) {
      const lastValidValue = event.target.dataset.lastValidValue;
      if (lastValidValue) {
        event.target.value = lastValidValue;
        const fullHexValue = '#' + lastValidValue;
        
        if (this.isTextElement) {
          // Update text color
          const textElement = document.getElementById(this.currentSegmentId);
          if (textElement) {
            textElement.setAttribute('fill', fullHexValue);
          }
          // Notify change tracker
          if (window.changeTracker) {
            window.changeTracker.updateColor(this.currentSegmentId, fullHexValue);
          }
        } else if (this.isLineElement) {
          // Update line color
          const lineElement = document.getElementById(this.currentSegmentId);
          if (lineElement) {
            lineElement.setAttribute('stroke', fullHexValue);
          }
        } else {
          // Update segment color
          this.colorManager.updateSegmentColor(this.currentSegmentId, fullHexValue);
        }
        
        // Update color picker
        const colorInput = document.querySelector('.contextual-color-input');
        if (colorInput) {
          colorInput.value = fullHexValue;
          colorInput.style.backgroundColor = fullHexValue;
        }
      }
    }
  }

  handleLabelInputChange(event) {
    if (!this.currentSegmentId) return;

    const newLabel = event.target.value.trim();
    
    if (this.isTextElement) {
      // Update text content directly
      const textElement = document.getElementById(this.currentSegmentId);
      if (textElement) {
        const tspan = textElement.querySelector('tspan');
        if (tspan) {
          tspan.textContent = newLabel;
        } else {
          textElement.textContent = newLabel;
        }
      }
      // Notify change tracker
      if (window.changeTracker) {
        window.changeTracker.updateLabel(this.currentSegmentId, newLabel);
      }
    } else {
      // Update segment label - find the corresponding label element
      const labelElement = document.getElementById(`label-${this.currentSegmentId}`);
      if (labelElement) {
        const tspan = labelElement.querySelector('tspan');
        if (tspan) {
          tspan.textContent = newLabel;
        } else {
          labelElement.textContent = newLabel;
        }
      } else {
        // Fallback to label manager
        this.labelManager.updateLabel(this.currentSegmentId, newLabel);
      }
    }
  }



  getCurrentSegmentId() {
    return this.currentSegmentId;
  }

  findAssociatedSegment(textElementId) {
    // Check if this is a label-segment-* element
    if (textElementId.startsWith('label-segment-')) {
      // Extract the segment ID from the label ID
      const segmentId = textElementId.replace('label-', '');
      // Check if the segment exists
      const segment = document.getElementById(segmentId);
      if (segment) {
        return segmentId;
      }
    }
    // For title elements or other text elements, return null (no associated segment)
    return null;
  }

  focusLabelInput() {
    // Focus the label input field after a short delay to ensure it's enabled
    setTimeout(() => {
      const labelInput = document.querySelector('.contextual-label-input');
      if (labelInput && !labelInput.disabled) {
        labelInput.focus();
        // Optionally select all text for easy replacement
        labelInput.select();
      }
    }, 50);
  }
}

export default ContextualEditor;
