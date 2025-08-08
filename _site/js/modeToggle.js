// Mode Toggle Module - Following NN/g Guidelines
class ModeToggle {
  constructor(colorManager, segmentEditor, labelManager) {
    this.colorManager = colorManager;
    this.segmentEditor = segmentEditor;
    this.labelManager = labelManager;
    this.currentMode = 'individual'; // Default to individual mode
    this.initializeToggle();
  }

  initializeToggle() {
    const toggleInput = document.getElementById('mode-toggle');
    
    if (toggleInput) {
      // Set initial state
      toggleInput.checked = false; // Individual mode
      
      // Add event listener for immediate results (NN/g guideline)
      toggleInput.addEventListener('change', (event) => {
        this.currentMode = event.target.checked ? 'all' : 'individual';
        this.updateUI();
      });
    }
  }

  updateUI() {
    const segmentEditors = document.getElementById('segment-editors');
    
    if (this.currentMode === 'all') {
      this.showAllModeUI();
    } else {
      this.showIndividualModeUI();
    }
  }

  showAllModeUI() {
    const segmentEditors = document.getElementById('segment-editors');
    const segments = document.querySelectorAll('#svg-container [id^="segment-"]');
    
    if (segments.length === 0) return;

    // Get the current color of the middle segment (segment-middle)
    const middleSegment = document.querySelector('#segment-middle');
    const currentColor = middleSegment ? middleSegment.getAttribute('fill') : '#E8C04E';

    // Create the all mode UI with identical styling to individual controls
    segmentEditors.innerHTML = `
      <div class="flex justify-center">
        <div class="segment-editor p-2 transition-all duration-300 ease-in-out">
          <div class="text-center">
            <input 
              type="color" 
              class="w-16 h-10 rounded border-2 cursor-pointer shadow-sm hover:border-gray-400 hover:shadow-md focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300 transition-all duration-200 segment-color-input-all"
              style="background-color: var(--color-picker-bg, ${currentColor}); border-color: var(--color-picker-border, ${currentColor});"
              value="${currentColor}"
              tabindex="1"
            />
                          <div class="flex items-center justify-center mt-3">
                <div class="flex items-center border border-gray-300 rounded bg-gray-50">
                  <span class="text-xs text-gray-500 font-mono px-2 py-1 border-r border-gray-300 bg-gray-100">#</span>
                  <input 
                    type="text" 
                    class="hex-input-all w-14 h-6 text-xs text-center font-mono border-0 bg-transparent px-1 focus:outline-none text-black"
                    placeholder="000000"
                    value="${currentColor.toUpperCase().replace('#', '')}"
                    tabindex="2"
                  />
                </div>
              </div>

          </div>
        </div>
      </div>
    `;

    // Set up event listeners for the all mode
    this.setupAllModeEventListeners();
    
    // Update the color picker background to match the current color
    const colorInput = document.querySelector('.segment-color-input-all');
    if (colorInput) {
      this.colorManager.updateColorPickerBackground(colorInput, currentColor);
    }
  }

  showIndividualModeUI() {
    // Regenerate individual segment editors
    this.segmentEditor.generateSegmentEditors();
    this.segmentEditor.initializeEventListeners();
  }

  setupAllModeEventListeners() {
    const colorInput = document.querySelector('.segment-color-input-all');
    const hexInput = document.querySelector('.hex-input-all');

    if (colorInput) {
      colorInput.addEventListener('change', (event) => {
        const newColor = event.target.value;
        this.colorManager.updateAllSegments(newColor);
        this.updateAllModeHexInput(newColor);
        this.colorManager.updateColorPickerBackground(colorInput, newColor);
        this.labelManager.updateAllLabelColors();
        this.colorManager.saveState();
      });
    }

    if (hexInput) {
      hexInput.addEventListener('input', (event) => {
        const hexValue = event.target.value.trim();
        if (this.colorManager.isValidHexColor(hexValue)) {
          const fullHexValue = '#' + hexValue.toUpperCase();
          this.colorManager.updateAllSegments(fullHexValue);
          this.updateAllModeColorInput(fullHexValue);
          this.colorManager.updateColorPickerBackground(colorInput, fullHexValue);
          this.labelManager.updateAllLabelColors();
          event.target.dataset.lastValidValue = hexValue.toUpperCase();
          this.colorManager.saveState();
        }
      });

      hexInput.addEventListener('blur', (event) => {
        const hexValue = event.target.value.trim();
        if (!hexValue) {
          const lastValidValue = event.target.dataset.lastValidValue;
          if (lastValidValue) {
            event.target.value = lastValidValue;
            const fullHexValue = '#' + lastValidValue;
            this.colorManager.updateAllSegments(fullHexValue);
            this.updateAllModeColorInput(fullHexValue);
          }
        }
      });
    }


  }

  updateAllModeHexInput(color) {
    const hexInput = document.querySelector('.hex-input-all');
    if (hexInput) {
      hexInput.value = color.toUpperCase().replace('#', '');
      hexInput.dataset.lastValidValue = color.toUpperCase().replace('#', '');
    }
  }

  updateAllModeColorInput(color) {
    const colorInput = document.querySelector('.segment-color-input-all');
    if (colorInput) {
      colorInput.value = color;
      this.colorManager.updateColorPickerBackground(colorInput, color);
    }
  }

  getCurrentMode() {
    return this.currentMode;
  }
}

export default ModeToggle;
