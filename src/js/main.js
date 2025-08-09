import registry from './core/ComponentRegistry.js';
import store from './core/Store.js';

// Import components
import './components/svg/SegmentComponent.js';
import './components/svg/TextComponent.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  registry.initializeComponents();

  // Load saved state if any
  const savedState = localStorage.getItem('svg-editor-state');
  if (savedState) {
    try {
      store.setState(JSON.parse(savedState));
    } catch (e) {
      console.error('Error loading saved state:', e);
    }
  }

  // Save state on changes
  store.on('stateChange', (state) => {
    localStorage.setItem('svg-editor-state', JSON.stringify(state));
  });
});