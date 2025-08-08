// Color Manager Module
class ColorManager {
  constructor() {
    this.originalColors = {
      'segment-1': '#837C67',
      'segment-2': '#837C67',
      'segment-3': '#837C67',
      'segment-middle': '#E8C04E',
      'segment-4': '#837C67',
      'segment-5': '#837C67',
      'segment-6': '#837C67'
    };
    this.storageKey = 'svg-editor-state';
  }

  // Save current state to localStorage
  saveState() {
    const segments = document.querySelectorAll('#svg-container [id^="segment-"]');
    const state = {};
    segments.forEach(segment => {
      state[segment.id] = segment.getAttribute('fill');
    });
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  // Load state from localStorage
  loadState() {
    const savedState = localStorage.getItem(this.storageKey);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error('Error parsing saved state:', e);
        return null;
      }
    }
    return null;
  }

  // Apply colors to SVG elements
  applyColors(colorMap) {
    Object.keys(colorMap).forEach(segmentId => {
      const segment = document.getElementById(segmentId);
      if (segment) {
        segment.setAttribute('fill', colorMap[segmentId]);
      }
    });
  }

  // Update color picker background and border using CSS custom properties
  updateColorPickerBackground(colorInput, color) {
    if (colorInput) {
      // Use CSS custom properties for dynamic colors while keeping Tailwind classes
      colorInput.style.setProperty('--color-picker-bg', color);
      colorInput.style.setProperty('--color-picker-border', color);
    }
  }

  // Update a single segment's color
  updateSegmentColor(segmentId, newColor) {
    const segment = document.getElementById(segmentId);
    if (segment) {
      segment.setAttribute('fill', newColor);
    }
    
    // Update the color picker for this segment
    const editorContainer = document.querySelector(`[data-segment-id="${segmentId}"]`).closest('.segment-editor');
    if (editorContainer) {
      const colorInput = editorContainer.querySelector('.segment-color-input');
      if (colorInput) {
        colorInput.value = newColor;
        this.updateColorPickerBackground(colorInput, newColor);
      }
    }
    
    // Update label color for optimal readability
    if (window.labelManager) {
      window.labelManager.updateLabelColor(segmentId, newColor);
    }
  }

  // Update all segments with the same color
  updateAllSegments(newColor) {
    const allSegments = document.querySelectorAll('#svg-container [id^="segment-"]');
    allSegments.forEach(segment => {
      segment.setAttribute('fill', newColor);
    });
    
    // Update all color inputs
    const allColorInputs = document.querySelectorAll('.segment-color-input');
    allColorInputs.forEach(input => {
      input.value = newColor;
      this.updateColorPickerBackground(input, newColor);
    });
  }

  // Validate hex color format
  isValidHexColor(hex) {
    const hexRegex = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  }

  // Revert to original colors
  revertToOriginal() {
    this.applyColors(this.originalColors);
    localStorage.removeItem(this.storageKey);
    return this.originalColors;
  }
}

export default ColorManager;
