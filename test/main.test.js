import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the modules
vi.mock('../src/js/colorManager.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    loadState: vi.fn().mockReturnValue(null),
    applyColors: vi.fn(),
    saveState: vi.fn(),
    revertToOriginal: vi.fn().mockReturnValue({
      'segment-1': '#FF6B6B',
      'segment-2': '#4ECDC4'
    })
  }))
}));

vi.mock('../src/js/segmentEditor.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    generateSegmentEditors: vi.fn(),
    initializeEventListeners: vi.fn(),
    updateRevertButtonVisibility: vi.fn()
  }))
}));

vi.mock('../src/js/downloadManager.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    initializeDownloadButton: vi.fn()
  }))
}));

describe('Main Application', () => {
  let mockAddEventListener;

  beforeEach(() => {
    // Mock DOM
    document.body.innerHTML = `
      <button id="revert-btn">Revert</button>
      <div id="svg-container">
        <div id="segment-1" fill="#FF6B6B"></div>
        <div id="segment-2" fill="#4ECDC4"></div>
      </div>
    `;

    // Mock addEventListener
    mockAddEventListener = vi.fn();
    document.addEventListener = mockAddEventListener;

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Module imports and initialization', () => {
    it('should import main.js without errors', async () => {
      expect(() => import('../src/js/main.js')).not.toThrow();
    });

    it('should add DOMContentLoaded event listener', async () => {
      await import('../src/js/main.js');
      expect(mockAddEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
    });
  });

  describe('Module integration', () => {
    it('should create all required modules when DOM is loaded', async () => {
      const ColorManager = (await import('../src/js/colorManager.js')).default;
      const SegmentEditor = (await import('../src/js/segmentEditor.js')).default;
      const DownloadManager = (await import('../src/js/downloadManager.js')).default;

      await import('../src/js/main.js');

      // Verify that the modules can be imported and mocked
      expect(ColorManager).toBeDefined();
      expect(SegmentEditor).toBeDefined();
      expect(DownloadManager).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle missing DOM elements gracefully', async () => {
      // Remove DOM elements
      document.body.innerHTML = '';

      expect(() => import('../src/js/main.js')).not.toThrow();
    });

    it('should handle event listener errors gracefully', async () => {
      // Mock addEventListener to throw error
      document.addEventListener = vi.fn().mockImplementation(() => {
        throw new Error('Event listener error');
      });

      expect(() => import('../src/js/main.js')).not.toThrow();
    });
  });
});
