import { describe, it, expect, beforeEach, vi } from 'vitest';
import ChangeTracker from '../src/js/changeTracker.js';

describe('ChangeTracker', () => {
  let changeTracker;
  let mockDocument;

  beforeEach(() => {
    // Mock DOM elements
    const mockSegments = [
      { id: 'segment-1', getAttribute: vi.fn(() => '#FF0000') },
      { id: 'segment-2', getAttribute: vi.fn(() => '#00FF00') },
      { id: 'segment-middle', getAttribute: vi.fn(() => '#0000FF') }
    ];

    const mockLabels = [
      { 
        id: 'label-segment-1', 
        textContent: '1',
        querySelector: vi.fn(() => ({ textContent: '1' }))
      },
      { 
        id: 'label-segment-2', 
        textContent: '2',
        querySelector: vi.fn(() => ({ textContent: '2' }))
      },
      { 
        id: 'label-segment-middle', 
        textContent: 'middle',
        querySelector: vi.fn(() => ({ textContent: 'middle' }))
      }
    ];

    mockDocument = {
      querySelectorAll: vi.fn((selector) => {
        if (selector === '[id^="segment-"]') {
          return mockSegments;
        }
        if (selector === '[id^="label-segment-"], [id^="title-"]') {
          return mockLabels;
        }
        if (selector === '[id^="label-segment-"]') {
          return mockLabels;
        }
        return [];
      }),
      getElementById: vi.fn((id) => {
        if (id === 'revert-btn') {
          return {
            classList: {
              add: vi.fn(),
              remove: vi.fn()
            }
          };
        }
        if (id.startsWith('segment-')) {
          return {
            setAttribute: vi.fn(),
            getAttribute: vi.fn(() => '#FF0000')
          };
        }
        if (id.startsWith('label-segment-')) {
          return {
            textContent: '1',
            querySelector: vi.fn(() => ({ textContent: '1' }))
          };
        }
        if (id.startsWith('title-')) {
          return {
            textContent: 'Title Text',
            querySelector: vi.fn(() => ({ textContent: 'Title Text' }))
          };
        }
        // Handle any other element ID
        return {
          textContent: 'Default Text',
          querySelector: vi.fn(() => ({ textContent: 'Default Text' }))
        };
        return null;
      })
    };

    global.document = mockDocument;
  });

  describe('initialization', () => {
    it('should initialize with original state', () => {
      changeTracker = new ChangeTracker();
      
      expect(changeTracker.originalColors).toEqual({
        'segment-1': '#FF0000',
        'segment-2': '#00FF00',
        'segment-middle': '#0000FF'
      });
      
      expect(changeTracker.originalLabels).toEqual({
        'label-segment-1': '1',
        'label-segment-2': '2',
        'label-segment-middle': 'middle',
        'segment-1': '1',
        'segment-2': '2',
        'segment-middle': 'middle'
      });
    });

    it('should start with no changes', () => {
      changeTracker = new ChangeTracker();
      
      expect(changeTracker.hasChanges).toBe(false);
    });
  });

  describe('color tracking', () => {
    beforeEach(() => {
      changeTracker = new ChangeTracker();
    });

    it('should track color changes', () => {
      changeTracker.updateColor('segment-1', '#FFFF00');
      
      expect(changeTracker.currentColors['segment-1']).toBe('#FFFF00');
    });

    it('should detect when colors have changed', () => {
      changeTracker.updateColor('segment-1', '#FFFF00');
      
      expect(changeTracker.hasChanges).toBe(true);
    });

    it('should not detect changes when color is same as original', () => {
      changeTracker.updateColor('segment-1', '#FF0000');
      
      expect(changeTracker.hasChanges).toBe(false);
    });
  });

  describe('label tracking', () => {
    beforeEach(() => {
      changeTracker = new ChangeTracker();
    });

    it('should track label changes', () => {
      changeTracker.updateLabel('segment-1', 'New Label');
      
      expect(changeTracker.currentLabels['segment-1']).toBe('New Label');
    });

    it('should detect when labels have changed', () => {
      changeTracker.updateLabel('segment-1', 'New Label');
      
      expect(changeTracker.hasChanges).toBe(true);
    });

    it('should not detect changes when label is same as original', () => {
      changeTracker.updateLabel('segment-1', '1');
      
      expect(changeTracker.hasChanges).toBe(false);
    });
  });

  describe('revert button visibility', () => {
    beforeEach(() => {
      changeTracker = new ChangeTracker();
    });

    it('should hide revert button when no changes', () => {
      changeTracker.updateRevertButtonVisibility();
      
      expect(mockDocument.getElementById).toHaveBeenCalledWith('revert-btn');
    });

    it('should show revert button when changes exist', () => {
      changeTracker.updateColor('segment-1', '#FFFF00');
      
      expect(changeTracker.hasChanges).toBe(true);
    });
  });

  describe('reset functionality', () => {
    beforeEach(() => {
      changeTracker = new ChangeTracker();
    });

    it('should reset colors to original', () => {
      changeTracker.updateColor('segment-1', '#FFFF00');
      changeTracker.resetToOriginal();
      
      expect(changeTracker.currentColors['segment-1']).toBe('#FF0000');
    });

    it('should reset labels to original', () => {
      changeTracker.updateLabel('segment-1', 'New Label');
      changeTracker.resetToOriginal();
      
      expect(changeTracker.currentLabels['segment-1']).toBe('1');
    });

    it('should clear changes flag after reset', () => {
      changeTracker.updateColor('segment-1', '#FFFF00');
      changeTracker.resetToOriginal();
      
      expect(changeTracker.hasChanges).toBe(false);
    });

    it('should clear localStorage when resetting to original', () => {
      // Mock localStorage
      const mockLocalStorage = {
        removeItem: vi.fn(),
        setItem: vi.fn()
      };
      global.localStorage = mockLocalStorage;

      changeTracker.updateColor('segment-1', '#FFFF00');
      changeTracker.resetToOriginal();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('svg-editor-colors');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('svg-editor-labels');
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      changeTracker = new ChangeTracker();
    });

    it('should return original colors', () => {
      const originalColors = changeTracker.getOriginalColors();
      
      expect(originalColors).toEqual({
        'segment-1': '#FF0000',
        'segment-2': '#00FF00',
        'segment-middle': '#0000FF'
      });
    });

    it('should return original labels', () => {
      const originalLabels = changeTracker.getOriginalLabels();
      
      expect(originalLabels).toEqual({
        'label-segment-1': '1',
        'label-segment-2': '2',
        'label-segment-middle': 'middle',
        'segment-1': '1',
        'segment-2': '2',
        'segment-middle': 'middle'
      });
    });

    it('should save state to localStorage', () => {
      const mockLocalStorage = {
        setItem: vi.fn()
      };
      global.localStorage = mockLocalStorage;

      changeTracker.updateColor('segment-1', '#FFFF00');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('svg-editor-colors', JSON.stringify(changeTracker.currentColors));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('svg-editor-labels', JSON.stringify(changeTracker.currentLabels));
    });

    it('should load saved state from localStorage', () => {
      const savedColors = {
        'segment-1': '#FFFF00',
        'segment-2': '#00FF00'
      };
      const savedLabels = {
        'label-segment-1': 'Custom Label',
        'label-segment-2': 'Another Label'
      };

      const mockLocalStorage = {
        getItem: vi.fn((key) => {
          if (key === 'svg-editor-colors') {
            return JSON.stringify(savedColors);
          }
          if (key === 'svg-editor-labels') {
            return JSON.stringify(savedLabels);
          }
          return null;
        })
      };
      global.localStorage = mockLocalStorage;

      changeTracker.loadSavedState();
      
      expect(changeTracker.currentColors['segment-1']).toBe('#FFFF00');
      expect(changeTracker.currentColors['segment-2']).toBe('#00FF00');
      expect(changeTracker.currentLabels['label-segment-1']).toBe('Custom Label');
      expect(changeTracker.currentLabels['label-segment-2']).toBe('Another Label');
    });
  });
});
