// Change Tracker Module
class ChangeTracker {
  constructor() {
    this.originalColors = {};
    this.originalLabels = {};
    this.currentColors = {};
    this.currentLabels = {};
    this.hasChanges = false;
    this.initializeOriginalState();
  }

  initializeOriginalState() {
    // Store original colors
    const segments = document.querySelectorAll('[id^="segment-"]');
    segments.forEach(segment => {
      const segmentId = segment.id;
      const originalColor = segment.getAttribute('fill');
      this.originalColors[segmentId] = originalColor;
      this.currentColors[segmentId] = originalColor;
    });

    // Store original labels and text content
    const textElements = document.querySelectorAll('[id^="label-segment-"], [id^="title-"]');
    textElements.forEach(textElement => {
      const elementId = textElement.id;
      const tspan = textElement.querySelector('tspan');
      const originalText = tspan ? tspan.textContent : textElement.textContent;
      
      // Store with full element ID for new elements
      this.originalLabels[elementId] = originalText;
      this.currentLabels[elementId] = originalText;
      
      // Also store with segment ID for backward compatibility (for label-segment-* elements)
      if (elementId.startsWith('label-segment-')) {
        const segmentId = elementId.replace('label-', '');
        this.originalLabels[segmentId] = originalText;
        this.currentLabels[segmentId] = originalText;
      }
    });
  }

  updateColor(segmentId, newColor) {
    this.currentColors[segmentId] = newColor;
    this.saveState();
    this.checkForChanges();
  }

  updateLabel(elementId, newLabel) {
    this.currentLabels[elementId] = newLabel;
    
    // Also update segment ID for backward compatibility (for label-segment-* elements)
    if (elementId.startsWith('label-segment-')) {
      const segmentId = elementId.replace('label-', '');
      this.currentLabels[segmentId] = newLabel;
    }
    
    this.saveState();
    this.checkForChanges();
  }

  checkForChanges() {
    // Check if colors have changed
    const colorChanged = Object.keys(this.originalColors).some(segmentId => {
      return this.originalColors[segmentId] !== this.currentColors[segmentId];
    });

    // Check if labels have changed
    const labelChanged = Object.keys(this.originalLabels).some(segmentId => {
      return this.originalLabels[segmentId] !== this.currentLabels[segmentId];
    });

    this.hasChanges = colorChanged || labelChanged;
    this.updateRevertButtonVisibility();
  }

  updateRevertButtonVisibility() {
    const revertBtn = document.getElementById('revert-btn');
    if (revertBtn) {
      if (this.hasChanges) {
        revertBtn.classList.remove('hidden');
      } else {
        revertBtn.classList.add('hidden');
      }
    }
  }

  resetToOriginal() {
    // Reset colors to original
    Object.keys(this.originalColors).forEach(segmentId => {
      const segment = document.getElementById(segmentId);
      if (segment) {
        segment.setAttribute('fill', this.originalColors[segmentId]);
        this.currentColors[segmentId] = this.originalColors[segmentId];
      }
    });

    // Reset labels to original (only process text elements)
    Object.keys(this.originalLabels).forEach(elementId => {
      // Only process text elements, not segment elements
      if (elementId.startsWith('label-segment-') || elementId.startsWith('title-')) {
        const textElement = document.getElementById(elementId);
        if (textElement) {
          const tspan = textElement.querySelector('tspan');
          if (tspan) {
            tspan.textContent = this.originalLabels[elementId];
          } else {
            textElement.textContent = this.originalLabels[elementId];
          }
          this.currentLabels[elementId] = this.originalLabels[elementId];
        }
      }
    });
    
    // Also reset segment IDs for backward compatibility
    Object.keys(this.originalLabels).forEach(elementId => {
      if (elementId.startsWith('label-segment-')) {
        const segmentId = elementId.replace('label-', '');
        this.currentLabels[segmentId] = this.originalLabels[elementId];
      }
    });

    // Clear localStorage
    localStorage.removeItem('svg-editor-colors');
    localStorage.removeItem('svg-editor-labels');

    this.hasChanges = false;
    this.updateRevertButtonVisibility();
  }

  getOriginalColors() {
    return { ...this.originalColors };
  }

  getOriginalLabels() {
    return { ...this.originalLabels };
  }

  saveState() {
    // Save current colors to localStorage
    localStorage.setItem('svg-editor-colors', JSON.stringify(this.currentColors));
    
    // Save current labels to localStorage
    localStorage.setItem('svg-editor-labels', JSON.stringify(this.currentLabels));
  }

  loadSavedState() {
    // Load saved colors
    const savedColors = localStorage.getItem('svg-editor-colors');
    if (savedColors) {
      try {
        const colors = JSON.parse(savedColors);
        Object.keys(colors).forEach(segmentId => {
          const segment = document.getElementById(segmentId);
          if (segment) {
            segment.setAttribute('fill', colors[segmentId]);
            this.currentColors[segmentId] = colors[segmentId];
          }
        });
      } catch (e) {
        console.error('Error parsing saved colors:', e);
      }
    }

    // Load saved labels
    const savedLabels = localStorage.getItem('svg-editor-labels');
    if (savedLabels) {
      try {
        const labels = JSON.parse(savedLabels);
        Object.keys(labels).forEach(elementId => {
          // Only process text elements, not segment elements
          if (elementId.startsWith('label-segment-') || elementId.startsWith('title-')) {
            const textElement = document.getElementById(elementId);
            if (textElement) {
              const tspan = textElement.querySelector('tspan');
              if (tspan) {
                tspan.textContent = labels[elementId];
              } else {
                textElement.textContent = labels[elementId];
              }
              this.currentLabels[elementId] = labels[elementId];
            }
          }
        });
        
        // Also load segment IDs for backward compatibility
        Object.keys(labels).forEach(elementId => {
          if (elementId.startsWith('label-segment-')) {
            const segmentId = elementId.replace('label-', '');
            this.currentLabels[segmentId] = labels[elementId];
          }
        });
      } catch (e) {
        console.error('Error parsing saved labels:', e);
      }
    }

    // Check for changes after loading
    this.checkForChanges();
  }
}

export default ChangeTracker;
