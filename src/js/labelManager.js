// Label Manager Module
import { getOptimalTextColor } from './colorUtils.js';

class LabelManager {
  constructor() {
    this.defaultLabels = {
      'segment-1': '1',
      'segment-2': '2', 
      'segment-3': '3',
      'segment-middle': 'middle',
      'segment-4': '4',
      'segment-5': '5',
      'segment-6': '6'
    };
    this.storageKey = 'svg-editor-labels';
    this.initializeLabels();
  }

  initializeLabels() {
    // Load saved labels or use defaults
    const savedLabels = this.loadLabels();
    Object.keys(this.defaultLabels).forEach(segmentId => {
      const labelElement = document.getElementById(`label-${segmentId}`);
      if (labelElement) {
        const labelText = savedLabels[segmentId] || this.defaultLabels[segmentId];
        labelElement.textContent = labelText;
      }
    });
  }

  updateLabel(segmentId, newLabel) {
    const labelElement = document.getElementById(`label-${segmentId}`);
    if (labelElement) {
      // If newLabel is empty, clear the text (allow blank labels)
      labelElement.textContent = newLabel || '';
    }
    this.saveLabels();
  }

  updateAllLabels(newLabel) {
    Object.keys(this.defaultLabels).forEach(segmentId => {
      this.updateLabel(segmentId, newLabel);
    });
    this.saveLabels();
  }

  getLabel(segmentId) {
    const labelElement = document.getElementById(`label-${segmentId}`);
    return labelElement ? labelElement.textContent : this.defaultLabels[segmentId];
  }

  saveLabels() {
    const labels = {};
    Object.keys(this.defaultLabels).forEach(segmentId => {
      const labelElement = document.getElementById(`label-${segmentId}`);
      if (labelElement) {
        labels[segmentId] = labelElement.textContent;
      }
    });
    localStorage.setItem(this.storageKey, JSON.stringify(labels));
  }

  loadLabels() {
    const savedLabels = localStorage.getItem(this.storageKey);
    if (savedLabels) {
      try {
        return JSON.parse(savedLabels);
      } catch (e) {
        console.error('Error parsing saved labels:', e);
        return {};
      }
    }
    return {};
  }

  resetToDefaults() {
    Object.keys(this.defaultLabels).forEach(segmentId => {
      this.updateLabel(segmentId, this.defaultLabels[segmentId]);
    });
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Updates the text color of a label based on the background color for optimal readability
   * @param {string} segmentId - The segment ID
   * @param {string} backgroundColor - The background color in hex format
   */
  updateLabelColor(segmentId, backgroundColor) {
    const labelElement = document.getElementById(`label-${segmentId}`);
    if (labelElement) {
      const optimalTextColor = getOptimalTextColor(backgroundColor);
      labelElement.setAttribute('fill', optimalTextColor);
    }
  }

  /**
   * Updates all label colors based on their corresponding segment background colors
   */
  updateAllLabelColors() {
    Object.keys(this.defaultLabels).forEach(segmentId => {
      const segmentElement = document.getElementById(segmentId);
      if (segmentElement) {
        const backgroundColor = segmentElement.getAttribute('fill');
        if (backgroundColor) {
          this.updateLabelColor(segmentId, backgroundColor);
        }
      }
    });
  }
}

export default LabelManager;
