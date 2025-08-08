// Main Application Module
import ColorManager from './colorManager.js';
import ContextualEditor from './contextualEditor.js';
import DownloadManager from './downloadManager.js';
import LabelManager from './labelManager.js';
import ChangeTracker from './changeTracker.js';

class SVGEditor {
    constructor() {
    this.colorManager = new ColorManager();
    this.labelManager = new LabelManager();
    this.contextualEditor = new ContextualEditor(this.colorManager, this.labelManager);
    this.downloadManager = new DownloadManager();
    this.changeTracker = new ChangeTracker();

    // Make labelManager available globally for color updates
    window.labelManager = this.labelManager;
    // Make changeTracker available globally
    window.changeTracker = this.changeTracker;

    this.initialize();
  }

  // Initialize the application
  initialize() {
    // Load saved state from ChangeTracker
    this.changeTracker.loadSavedState();

    this.contextualEditor.initialize();

    this.initializeRevertButton();

    // Initialize label colors for optimal readability
    this.labelManager.updateAllLabelColors();
  }

  // Initialize revert button
  initializeRevertButton() {
    const revertBtn = document.getElementById('revert-btn');
    if (revertBtn) {
      revertBtn.addEventListener('click', () => {
        this.changeTracker.resetToOriginal();
        this.contextualEditor.clearSelection();
        this.labelManager.updateAllLabelColors();
      });
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SVGEditor();
});