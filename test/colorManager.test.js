import { describe, it, expect, beforeEach, vi } from 'vitest';
import ColorManager from '../src/js/colorManager.js';

describe('ColorManager', () => {
  let colorManager;
  let mockLocalStorage;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    global.localStorage = mockLocalStorage;
    
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="segment-1" fill="#FF6B6B"></div>
      <div id="segment-2" fill="#4ECDC4"></div>
      <div id="segment-3" fill="#45B7D1"></div>
    `;
    
    colorManager = new ColorManager();
  });

  describe('constructor', () => {
    it('should initialize with original colors', () => {
      expect(colorManager.originalColors).toEqual({
        'segment-1': '#837C67',
        'segment-2': '#837C67',
        'segment-3': '#837C67',
        'segment-middle': '#E8C04E',
        'segment-4': '#837C67',
        'segment-5': '#837C67',
        'segment-6': '#837C67'
      });
    });

    it('should set storage key', () => {
      expect(colorManager.storageKey).toBe('svg-editor-state');
    });
  });

  describe('saveState', () => {
    it('should save current state to localStorage', () => {
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="svg-container">
          <div id="segment-1" fill="#837C67"></div>
          <div id="segment-2" fill="#837C67"></div>
          <div id="segment-3" fill="#837C67"></div>
          <div id="segment-middle" fill="#E8C04E"></div>
        </div>
      `;
      
      colorManager.saveState();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'svg-editor-state',
        JSON.stringify({
          'segment-1': '#837C67',
          'segment-2': '#837C67',
          'segment-3': '#837C67',
          'segment-middle': '#E8C04E'
        })
      );
    });
  });

  describe('loadState', () => {
    it('should return parsed state from localStorage', () => {
      const mockState = { 'segment-1': '#FF0000' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockState));
      
      const result = colorManager.loadState();
      
      expect(result).toEqual(mockState);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('svg-editor-state');
    });

    it('should return null when no saved state exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = colorManager.loadState();
      
      expect(result).toBeNull();
    });

    it('should return null when localStorage contains invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const result = colorManager.loadState();
      
      expect(result).toBeNull();
    });
  });

  describe('applyColors', () => {
    it('should apply colors to SVG elements', () => {
      const colorMap = {
        'segment-1': '#FF0000',
        'segment-2': '#00FF00'
      };
      
      colorManager.applyColors(colorMap);
      
      expect(document.getElementById('segment-1').getAttribute('fill')).toBe('#FF0000');
      expect(document.getElementById('segment-2').getAttribute('fill')).toBe('#00FF00');
    });

    it('should handle non-existent segments gracefully', () => {
      const colorMap = {
        'non-existent': '#FF0000'
      };
      
      expect(() => colorManager.applyColors(colorMap)).not.toThrow();
    });
  });

  describe('updateColorPickerBackground', () => {
    it('should do nothing (method kept for backward compatibility)', () => {
      const mockColorInput = {
        style: {
          setProperty: vi.fn()
        }
      };
      
      colorManager.updateColorPickerBackground(mockColorInput, '#FF0000');
      
      // Method no longer sets properties, just returns without error
      expect(mockColorInput.style.setProperty).not.toHaveBeenCalled();
    });

    it('should handle null color input gracefully', () => {
      expect(() => colorManager.updateColorPickerBackground(null, '#FF0000')).not.toThrow();
    });
  });

  describe('updateSegmentColor', () => {
    it('should update segment color and color picker', () => {
      // Mock DOM for this test
      document.body.innerHTML = `
        <div id="segment-1" fill="#FF6B6B"></div>
        <div class="segment-editor">
          <input class="segment-color-input" data-segment-id="segment-1" />
        </div>
      `;
      
      colorManager.updateSegmentColor('segment-1', '#FF0000');
      
      expect(document.getElementById('segment-1').getAttribute('fill')).toBe('#FF0000');
    });
  });

  describe('updateAllSegments', () => {
    it('should update all segments and color inputs', () => {
      // Mock DOM for this test
      document.body.innerHTML = `
        <div id="svg-container">
          <div id="segment-1" fill="#FF6B6B"></div>
          <div id="segment-2" fill="#4ECDC4"></div>
        </div>
        <input class="segment-color-input" />
        <input class="segment-color-input" />
      `;
      
      colorManager.updateAllSegments('#FF0000');
      
      expect(document.getElementById('segment-1').getAttribute('fill')).toBe('#FF0000');
      expect(document.getElementById('segment-2').getAttribute('fill')).toBe('#FF0000');
    });
  });

  describe('isValidHexColor', () => {
    it('should validate 6-digit hex colors', () => {
      expect(colorManager.isValidHexColor('FF0000')).toBe(true);
      expect(colorManager.isValidHexColor('ff0000')).toBe(true);
      expect(colorManager.isValidHexColor('00FF00')).toBe(true);
    });

    it('should validate 3-digit hex colors', () => {
      expect(colorManager.isValidHexColor('F00')).toBe(true);
      expect(colorManager.isValidHexColor('f00')).toBe(true);
      expect(colorManager.isValidHexColor('0F0')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(colorManager.isValidHexColor('')).toBe(false);
      expect(colorManager.isValidHexColor('GG0000')).toBe(false);
      expect(colorManager.isValidHexColor('FF00')).toBe(false);
      expect(colorManager.isValidHexColor('FF00000')).toBe(false);
      expect(colorManager.isValidHexColor('FF')).toBe(false);
      expect(colorManager.isValidHexColor('F')).toBe(false);
    });
  });

  describe('revertToOriginal', () => {
    it('should revert to original colors and clear localStorage', () => {
      const result = colorManager.revertToOriginal();
      
      expect(result).toEqual(colorManager.originalColors);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('svg-editor-state');
    });
  });
});
