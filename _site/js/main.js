// Main Application Module
import ColorManager from './colorManager.js';
import SegmentEditor from './segmentEditor.js';
import DownloadManager from './downloadManager.js';
import ModeToggle from './modeToggle.js';

class SVGEditor {
  constructor() {
    this.colorManager = new ColorManager();
    this.segmentEditor = new SegmentEditor(this.colorManager);
    this.downloadManager = new DownloadManager();
    this.modeToggle = new ModeToggle(this.colorManager, this.segmentEditor);
    
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
  }

  // Initialize revert button
  initializeRevertButton() {
    const revertBtn = document.getElementById('revert-btn');
    if (revertBtn) {
      revertBtn.addEventListener('click', () => {
        const originalColors = this.colorManager.revertToOriginal();
        this.segmentEditor.generateSegmentEditors();
        this.segmentEditor.updateRevertButtonVisibility();
      });
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SVGEditor();
});