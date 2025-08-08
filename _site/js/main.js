// Main Application Module
import ColorManager from './colorManager.js';
import SegmentEditor from './segmentEditor.js';
import DownloadManager from './downloadManager.js';
import ModeToggle from './modeToggle.js';
import LabelManager from './labelManager.js';

class SVGEditor {
  constructor() {
    this.colorManager = new ColorManager();
    this.labelManager = new LabelManager();
    this.segmentEditor = new SegmentEditor(this.colorManager, this.labelManager);
    this.downloadManager = new DownloadManager();
    this.modeToggle = new ModeToggle(this.colorManager, this.segmentEditor, this.labelManager);
    
    // Make labelManager available globally for color updates
    window.labelManager = this.labelManager;
    
    this.initialize();
  }

  // Initialize the application
  initialize() {
    // Load saved state or use original colors
    const savedState = this.colorManager.loadState();
    if (savedState) {
      this.colorManager.applyColors(savedState);
    }

    // Generate segment editors
    this.segmentEditor.generateSegmentEditors();
    
    // Initialize event listeners
    this.segmentEditor.initializeEventListeners();
    
    // Set initial revert button visibility
    this.segmentEditor.updateRevertButtonVisibility();
    
    // Initialize revert button
    this.initializeRevertButton();
    
    // Initialize label colors for optimal readability
    this.labelManager.updateAllLabelColors();
  }

  // Initialize revert button
  initializeRevertButton() {
    const revertBtn = document.getElementById('revert-btn');
    if (revertBtn) {
      revertBtn.addEventListener('click', () => {
        const originalColors = this.colorManager.revertToOriginal();
        this.labelManager.resetToDefaults();
        this.segmentEditor.generateSegmentEditors();
        this.segmentEditor.updateRevertButtonVisibility();
        // Update label colors after revert
        this.labelManager.updateAllLabelColors();
      });
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SVGEditor();
});