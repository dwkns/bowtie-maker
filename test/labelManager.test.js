import { describe, it, expect, beforeEach, vi } from 'vitest';
import LabelManager from '../src/js/labelManager.js';

// Mock the colorUtils module
vi.mock('../src/js/colorUtils.js', () => ({
  getOptimalTextColor: vi.fn((color) => {
    // Simple mock implementation
    if (color === '#FFFFFF') return '#000000';
    if (color === '#000000') return '#FFFFFF';
    if (color === '#837C67') return '#FFFFFF'; // Brown -> White text
    if (color === '#E8C04E') return '#000000'; // Yellow -> Black text
    return '#000000'; // Default
  })
}));

describe('LabelManager', () => {
  let labelManager;
  let mockDocument;

  beforeEach(() => {
    // Create mock DOM elements
    mockDocument = {
      getElementById: vi.fn((id) => {
        if (id.startsWith('label-')) {
          return {
            textContent: 'Test Label',
            setAttribute: vi.fn(),
            getAttribute: vi.fn(() => '#333')
          };
        }
        if (id.startsWith('segment-')) {
          return {
            getAttribute: vi.fn(() => {
              if (id === 'segment-middle') return '#E8C04E';
              return '#837C67';
            })
          };
        }
        return null;
      }),
      querySelectorAll: vi.fn(() => []),
      addEventListener: vi.fn()
    };

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    // Mock document globally
    global.document = mockDocument;
  });

  describe('updateLabelColor', () => {
    it('should update label color based on background color', () => {
      labelManager = new LabelManager();
      
      const mockLabelElement = {
        setAttribute: vi.fn()
      };
      
      mockDocument.getElementById.mockReturnValueOnce(mockLabelElement);
      
      labelManager.updateLabelColor('segment-1', '#837C67');
      
      expect(mockLabelElement.setAttribute).toHaveBeenCalledWith('fill', '#FFFFFF');
    });

    it('should handle missing label element gracefully', () => {
      labelManager = new LabelManager();
      
      mockDocument.getElementById.mockReturnValueOnce(null);
      
      expect(() => {
        labelManager.updateLabelColor('segment-1', '#837C67');
      }).not.toThrow();
    });
  });

  describe('updateAllLabelColors', () => {
    it('should update all label colors', () => {
      labelManager = new LabelManager();
      
      const mockLabelElement = {
        setAttribute: vi.fn()
      };
      
      const mockSegmentElement = {
        getAttribute: vi.fn(() => '#837C67')
      };
      
      // Mock getElementById to return different elements for labels and segments
      mockDocument.getElementById.mockImplementation((id) => {
        if (id.startsWith('label-')) {
          return mockLabelElement;
        }
        if (id.startsWith('segment-')) {
          return mockSegmentElement;
        }
        return null;
      });
      
      labelManager.updateAllLabelColors();
      
      // Should be called for each segment (7 segments)
      expect(mockLabelElement.setAttribute).toHaveBeenCalledTimes(7);
    });

    it('should handle missing segment elements gracefully', () => {
      labelManager = new LabelManager();
      
      mockDocument.getElementById.mockReturnValueOnce(null);
      
      expect(() => {
        labelManager.updateAllLabelColors();
      }).not.toThrow();
    });
  });

  describe('Integration with color analysis', () => {
    it('should use correct text colors for different backgrounds', () => {
      labelManager = new LabelManager();
      
      const mockLabelElement = {
        setAttribute: vi.fn()
      };
      
      mockDocument.getElementById.mockReturnValue(mockLabelElement);
      
      // Test brown background (should use white text)
      labelManager.updateLabelColor('segment-1', '#837C67');
      expect(mockLabelElement.setAttribute).toHaveBeenCalledWith('fill', '#FFFFFF');
      
      // Test yellow background (should use black text)
      labelManager.updateLabelColor('segment-middle', '#E8C04E');
      expect(mockLabelElement.setAttribute).toHaveBeenCalledWith('fill', '#000000');
    });
  });
});
