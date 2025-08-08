// Segment Editor Module
import ColorManager from './colorManager.js';

class SegmentEditor {
  constructor(colorManager) {
    this.colorManager = colorManager;
    this.template = document.getElementById('segment-editor-template');
  }

  // Generate segment editors dynamically
  generateSegmentEditors() {
    const svgContainer = document.querySelector('#svg-container');
    const editorsContainer = document.getElementById('segment-editors');
    
    if (!svgContainer || !editorsContainer || !this.template) {
      return;
    }
    
    const segments = svgContainer.querySelectorAll('[id^="segment-"]');
    
    // Clear existing editors
    editorsContainer.innerHTML = '';
    
    // Create flex container
    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex justify-center';
    flexContainer.style.width = '800px';
    flexContainer.style.margin = '0 auto';
    flexContainer.style.gap = '40px';
    
    // Sort segments in visual order (left to right)
    const segmentOrder = ['segment-6', 'segment-5', 'segment-4', 'segment-middle', 'segment-3', 'segment-2', 'segment-1'];
    const sortedSegments = Array.from(segments).sort((a, b) => {
      const aIndex = segmentOrder.indexOf(a.id);
      const bIndex = segmentOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
    
    // Generate editor for each segment
    sortedSegments.forEach(segment => {
      const segmentId = segment.id;
      const currentColor = segment.getAttribute('fill');
      
      const editorContainer = this.template.content.cloneNode(true);
      
      // Set up color input
      const colorInput = editorContainer.querySelector('.segment-color-input');
      if (colorInput) {
        colorInput.value = currentColor;
        colorInput.setAttribute('data-segment-id', segmentId);
        this.colorManager.updateColorPickerBackground(colorInput, currentColor);
      }
      
      // Set up hex input
      const hexInput = editorContainer.querySelector('.hex-input');
      if (hexInput) {
        const hexValue = currentColor.toUpperCase().replace('#', '');
        hexInput.value = hexValue;
        hexInput.setAttribute('data-segment-id', segmentId);
        hexInput.dataset.lastValidValue = hexValue;
      }
      
      // Set editor width and add data attributes
      const editorDiv = editorContainer.querySelector('.segment-editor');
      if (editorDiv) {
        editorDiv.style.width = '80px';
        editorDiv.dataset.segmentId = segmentId;
        
        // Add specific class for middle segment
        if (segmentId === 'segment-middle') {
          editorDiv.classList.add('middle-segment');
        }
      }
      
      flexContainer.appendChild(editorContainer);
    });
    
    editorsContainer.appendChild(flexContainer);
  }

  // Update hex input for a specific segment
  updateHexInput(segmentId, hexValue) {
    const hexInput = document.querySelector(`.hex-input[data-segment-id="${segmentId}"]`);
    if (hexInput) {
      hexInput.value = hexValue.toUpperCase();
      hexInput.dataset.lastValidValue = hexValue.toUpperCase();
    }
  }

  // Update all hex inputs
  updateAllHexInputs(hexValue) {
    const allHexInputs = document.querySelectorAll('.hex-input');
    allHexInputs.forEach(input => {
      input.value = hexValue.toUpperCase();
      input.dataset.lastValidValue = hexValue.toUpperCase();
    });
  }

  // Handle color picker changes
  handleColorPickerChange(event) {
    const colorInput = event.target;
    const segmentId = colorInput.dataset.segmentId;
    const newColor = colorInput.value;
    
    this.colorManager.updateSegmentColor(segmentId, newColor);
    this.updateHexInput(segmentId, newColor.toUpperCase().replace('#', ''));
    
    this.colorManager.saveState();
    this.updateRevertButtonVisibility();
  }

  // Handle hex input changes
  handleHexInputChange(event) {
    const hexInput = event.target;
    const segmentId = hexInput.dataset.segmentId;
    const hexValue = hexInput.value.trim();
    
    if (this.colorManager.isValidHexColor(hexValue)) {
      const fullHexValue = '#' + hexValue.toUpperCase();
      const selectAll = document.getElementById('select-all');
      
      hexInput.dataset.lastValidValue = hexValue.toUpperCase();
      
      this.colorManager.updateSegmentColor(segmentId, fullHexValue);
      
      this.colorManager.saveState();
      this.updateRevertButtonVisibility();
    }
  }

  // Handle hex input blur (revert to last valid value if empty)
  handleHexInputBlur(event) {
    const hexInput = event.target;
    const hexValue = hexInput.value.trim();
    
    if (hexValue === '' && hexInput.dataset.lastValidValue) {
      hexInput.value = hexInput.dataset.lastValidValue;
    }
  }

  // Update revert button visibility
  updateRevertButtonVisibility() {
    const revertBtn = document.getElementById('revert-btn');
    if (revertBtn) {
      const hasSavedState = localStorage.getItem(this.colorManager.storageKey) !== null;
      revertBtn.style.display = hasSavedState ? 'flex' : 'none';
    }
  }

  // Initialize event listeners
  initializeEventListeners() {
    // Color picker changes
    document.addEventListener('change', (e) => {
      if (e.target.type === 'color') {
        this.handleColorPickerChange(e);
      }
    });

    // Hex input changes
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('hex-input')) {
        this.handleHexInputChange(e);
      }
    });

    // Hex input blur
    document.addEventListener('blur', (e) => {
      if (e.target.classList.contains('hex-input')) {
        this.handleHexInputBlur(e);
      }
    }, true);
  }
}

export default SegmentEditor;
