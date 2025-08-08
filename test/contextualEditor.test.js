import { describe, it, expect, beforeEach, vi } from 'vitest';
import ContextualEditor from '../src/js/contextualEditor.js';

// Mock the colorUtils module
vi.mock('../src/js/colorUtils.js', () => ({
  getOptimalTextColor: vi.fn((color) => {
    if (color === '#FFFFFF') return '#000000';
    if (color === '#000000') return '#FFFFFF';
    if (color === '#837C67') return '#FFFFFF';
    if (color === '#E8C04E') return '#000000';
    return '#000000';
  })
}));

describe('ContextualEditor', () => {
  let contextualEditor;
  let mockColorManager;
  let mockLabelManager;
  let mockDocument;

  beforeEach(() => {
    // Create mock managers
    mockColorManager = {
      updateSegmentColor: vi.fn(),
      updateColorPickerBackground: vi.fn(),
      isValidHexColor: vi.fn((hex) => /^[A-Fa-f0-9]{6}$/.test(hex)),
      saveState: vi.fn()
    };

    mockLabelManager = {
      getLabel: vi.fn((segmentId) => {
        if (segmentId === 'segment-middle') return 'middle';
        return segmentId.replace('segment-', '');
      }),
      updateLabel: vi.fn()
    };

    // Create mock DOM elements
    mockDocument = {
      getElementById: vi.fn((id) => {
        if (id === 'svg-container') {
          return {
            querySelectorAll: vi.fn(() => [
              { id: 'segment-1', style: { cursor: '' }, addEventListener: vi.fn() },
              { id: 'segment-2', style: { cursor: '' }, addEventListener: vi.fn() },
              { id: 'segment-middle', style: { cursor: '' }, addEventListener: vi.fn() }
            ])
          };
        }
        if (id.startsWith('segment-')) {
          return {
            getAttribute: vi.fn(() => '#837C67'),
            style: { cursor: '', stroke: '', strokeWidth: '' },
            addEventListener: vi.fn()
          };
        }
        if (id === 'contextual-edit-box') {
          return {
            contains: vi.fn(() => false)
          };
        }
        return null;
      }),
      querySelector: vi.fn((selector) => {
        if (selector === '.contextual-color-input') {
          return { value: '#837C67', style: {} };
        }
        if (selector === '.contextual-hex-input') {
          return { value: '', dataset: {}, placeholder: '000000' };
        }
        if (selector === '.contextual-label-input') {
          return { value: '', placeholder: 'Label' };
        }
        if (selector === '#contextual-editor') {
          return { classList: { remove: vi.fn(), add: vi.fn() } };
        }
        return null;
      }),
      querySelectorAll: vi.fn(() => [
        { style: { stroke: '', strokeWidth: '' } },
        { style: { stroke: '', strokeWidth: '' } }
      ]),
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

  describe('constructor and initialization', () => {
    it('should initialize with correct dependencies', () => {
      contextualEditor = new ContextualEditor(mockColorManager, mockLabelManager);
      
      expect(contextualEditor.colorManager).toBe(mockColorManager);
      expect(contextualEditor.labelManager).toBe(mockLabelManager);
      expect(contextualEditor.currentSegmentId).toBeNull();
    });

    it('should set up SVG click handlers', () => {
      contextualEditor = new ContextualEditor(mockColorManager, mockLabelManager);
      
      expect(mockDocument.getElementById).toHaveBeenCalledWith('svg-container');
    });

    it('should initialize with disabled controls', () => {
      const mockColorInput = { disabled: false };
      const mockHexInput = { disabled: false };
      const mockLabelInput = { disabled: false };
      
      mockDocument.querySelector
        .mockReturnValueOnce(mockColorInput)
        .mockReturnValueOnce(mockHexInput)
        .mockReturnValueOnce(mockLabelInput);
      
      contextualEditor.initialize();
      
      expect(mockColorInput.disabled).toBe(true);
      expect(mockHexInput.disabled).toBe(true);
      expect(mockLabelInput.disabled).toBe(true);
    });
  });

  describe('segment selection', () => {
    beforeEach(() => {
      contextualEditor = new ContextualEditor(mockColorManager, mockLabelManager);
    });

    it('should select a segment and populate edit box', () => {
      contextualEditor.selectSegment('segment-1');
      
      expect(contextualEditor.currentSegmentId).toBe('segment-1');
    });

    it('should highlight selected segment', () => {
      const mockSegment = {
        style: { stroke: '', strokeWidth: '' }
      };
      mockDocument.getElementById.mockReturnValueOnce(mockSegment);
      
      contextualEditor.highlightSegment('segment-1');
      
      expect(mockSegment.style.stroke).toBe('#FF6600');
      expect(mockSegment.style.strokeWidth).toBe('5');
    });

    it('should clear segment highlights', () => {
      const mockSegments = [
        { style: { stroke: '#FF6600', strokeWidth: '5' } },
        { style: { stroke: '#FF6600', strokeWidth: '5' } }
      ];
      
      mockDocument.querySelectorAll.mockReturnValueOnce(mockSegments);
      
      contextualEditor.clearSegmentHighlight();
      
      mockSegments.forEach(segment => {
        expect(segment.style.stroke).toBe('');
        expect(segment.style.strokeWidth).toBe('');
      });
    });

    it('should clear selection', () => {
      contextualEditor.currentSegmentId = 'segment-1';
      contextualEditor.clearSelection();
      
      expect(contextualEditor.currentSegmentId).toBeNull();
    });

    it('should enable controls when segment is selected', () => {
      const mockColorInput = { disabled: true };
      const mockHexInput = { disabled: true };
      const mockLabelInput = { disabled: true };
      
      mockDocument.querySelector
        .mockReturnValueOnce(mockColorInput)
        .mockReturnValueOnce(mockHexInput)
        .mockReturnValueOnce(mockLabelInput);
      
      contextualEditor.enableControls();
      
      expect(mockColorInput.disabled).toBe(false);
      expect(mockHexInput.disabled).toBe(false);
      expect(mockLabelInput.disabled).toBe(false);
    });

    it('should disable controls when no segment is selected', () => {
      const mockColorInput = { disabled: false };
      const mockHexInput = { disabled: false };
      const mockLabelInput = { disabled: false };
      
      mockDocument.querySelector
        .mockReturnValueOnce(mockColorInput)
        .mockReturnValueOnce(mockHexInput)
        .mockReturnValueOnce(mockLabelInput);
      
      contextualEditor.disableControls();
      
      expect(mockColorInput.disabled).toBe(true);
      expect(mockHexInput.disabled).toBe(true);
      expect(mockLabelInput.disabled).toBe(true);
    });

    it('should populate edit box with segment data', () => {
      const mockSegment = {
        getAttribute: vi.fn(() => '#FF0000')
      };
      
      mockDocument.getElementById.mockReturnValueOnce(mockSegment);
      
      contextualEditor.populateEditBox('segment-1');
      
      expect(mockSegment.getAttribute).toHaveBeenCalledWith('fill');
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      contextualEditor = new ContextualEditor(mockColorManager, mockLabelManager);
      contextualEditor.currentSegmentId = 'segment-1';
    });

    it('should handle color picker changes', () => {
      const event = {
        target: {
          value: '#FF0000',
          classList: { contains: vi.fn(() => true) }
        }
      };

      contextualEditor.handleColorChange(event);
      
      expect(mockColorManager.updateSegmentColor).toHaveBeenCalledWith('segment-1', '#FF0000');
    });

    it('should handle valid hex input changes', () => {
      const event = {
        target: {
          value: 'FF0000',
          dataset: {},
          classList: { contains: vi.fn(() => true) }
        }
      };

      contextualEditor.handleHexInputChange(event);
      
      expect(mockColorManager.updateSegmentColor).toHaveBeenCalledWith('segment-1', '#FF0000');
    });

    it('should not process invalid hex input', () => {
      const event = {
        target: {
          value: 'INVALID',
          classList: { contains: vi.fn(() => true) }
        }
      };

      contextualEditor.handleHexInputChange(event);
      
      expect(mockColorManager.updateSegmentColor).not.toHaveBeenCalled();
    });

    it('should handle label input changes', () => {
      const event = {
        target: {
          value: 'New Label',
          classList: { contains: vi.fn(() => true) }
        }
      };

      contextualEditor.handleLabelInputChange(event);
      
      expect(mockLabelManager.updateLabel).toHaveBeenCalledWith('segment-1', 'New Label');
    });



    it('should not process events when no segment is selected', () => {
      contextualEditor.currentSegmentId = null;
      
      const event = {
        target: {
          value: '#FF0000',
          classList: { contains: vi.fn(() => true) }
        }
      };

      contextualEditor.handleColorChange(event);
      
      expect(mockColorManager.updateSegmentColor).not.toHaveBeenCalled();
    });
  });

  describe('UI state management', () => {
    beforeEach(() => {
      contextualEditor = new ContextualEditor(mockColorManager, mockLabelManager);
    });

    it('should highlight selected segment', () => {
      const mockSegment = { style: { stroke: '', strokeWidth: '' } };
      mockDocument.getElementById.mockReturnValueOnce(mockSegment);
      
      contextualEditor.highlightSegment('segment-1');
      
      expect(mockSegment.style.stroke).toBe('#FF6600');
      expect(mockSegment.style.strokeWidth).toBe('5');
    });

    it('should clear segment highlights', () => {
      const mockSegments = [
        { style: { stroke: '#FF6600', strokeWidth: '5' } },
        { style: { stroke: '#FF6600', strokeWidth: '5' } }
      ];
      
      mockDocument.querySelectorAll.mockReturnValueOnce(mockSegments);
      
      contextualEditor.clearSegmentHighlight();
      
      mockSegments.forEach(segment => {
        expect(segment.style.stroke).toBe('');
        expect(segment.style.strokeWidth).toBe('');
      });
    });

    it('should clear edit box inputs', () => {
      const mockColorInput = { value: '', style: {} };
      const mockHexInput = { value: '', placeholder: '' };
      const mockLabelInput = { value: '', placeholder: '' };
      
      mockDocument.querySelector
        .mockReturnValueOnce(mockColorInput)
        .mockReturnValueOnce(mockHexInput)
        .mockReturnValueOnce(mockLabelInput);
      
      contextualEditor.clearEditBox();
      
      expect(mockColorInput.value).toBe('#d1d5db');
      expect(mockHexInput.value).toBe('');
      expect(mockLabelInput.value).toBe('');
      expect(mockHexInput.placeholder).toBe('');
      expect(mockLabelInput.placeholder).toBe('Enter label text');
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      contextualEditor = new ContextualEditor(mockColorManager, mockLabelManager);
    });

    it('should return current segment ID', () => {
      contextualEditor.currentSegmentId = 'segment-1';
      
      expect(contextualEditor.getCurrentSegmentId()).toBe('segment-1');
    });

    it('should handle missing DOM elements gracefully', () => {
      mockDocument.getElementById.mockReturnValue(null);
      mockDocument.querySelector.mockReturnValue(null);
      
      expect(() => {
        contextualEditor.populateEditBox('segment-1');
        contextualEditor.clearEditBox();
        contextualEditor.highlightSegment('segment-1');
        contextualEditor.clearSegmentHighlight();
      }).not.toThrow();
    });

    it('should trim whitespace from text content when populating edit box', () => {
      // Mock a text element with whitespace
      const mockTextElement = {
        getAttribute: vi.fn(() => '#333333'),
        querySelector: vi.fn(() => ({ textContent: '  Test Text  ' }))
      };
      
      const mockColorInput = { value: '', style: {} };
      const mockHexInput = { value: '', dataset: {} };
      const mockLabelInput = { value: '' };
      
      mockDocument.getElementById.mockReturnValue(mockTextElement);
      mockDocument.querySelector
        .mockReturnValueOnce(mockColorInput)
        .mockReturnValueOnce(mockHexInput)
        .mockReturnValueOnce(mockLabelInput);
      
      contextualEditor.isTextElement = true;
      contextualEditor.populateEditBox('test-element');
      
      // Check that the text was trimmed
      expect(mockLabelInput.value).toBe('Test Text');
    });

    it('should focus label input when segment is selected', () => {
      // Mock the label input element
      const mockLabelInput = { 
        disabled: false, 
        focus: vi.fn(), 
        select: vi.fn() 
      };
      
      // Mock setTimeout
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn((callback) => {
        callback();
        return 1;
      });
      
      mockDocument.querySelector.mockReturnValue(mockLabelInput);
      
      contextualEditor.focusLabelInput();
      
      // Check that focus and select were called
      expect(mockLabelInput.focus).toHaveBeenCalled();
      expect(mockLabelInput.select).toHaveBeenCalled();
      
      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('should create orange underline for text elements', () => {
      // Mock text element with getBBox
      const mockTextElement = {
        getBBox: vi.fn(() => ({ x: 100, y: 50, width: 80, height: 20 })),
        parentNode: { appendChild: vi.fn() }
      };
      
      const mockUnderline = {
        setAttribute: vi.fn(),
        id: 'text-highlight-underline'
      };
      
      mockDocument.getElementById
        .mockReturnValueOnce(mockTextElement)  // text element
        .mockReturnValueOnce(null)             // no existing underline
        .mockReturnValueOnce(mockUnderline);   // underline after creation
      
      // Mock createElementNS
      const mockCreateElementNS = vi.fn(() => mockUnderline);
      mockDocument.createElementNS = mockCreateElementNS;
      
      contextualEditor.highlightTextElement('test-text');
      
      // Verify the underline was created with correct properties
      expect(mockCreateElementNS).toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'line');
      expect(mockUnderline.setAttribute).toHaveBeenCalledWith('stroke', '#FF6600');
      expect(mockUnderline.setAttribute).toHaveBeenCalledWith('stroke-width', '4');
      expect(mockUnderline.setAttribute).toHaveBeenCalledWith('stroke-linecap', 'round');
      
      // Verify underline positioning
      expect(mockUnderline.setAttribute).toHaveBeenCalledWith('x1', 100);
      expect(mockUnderline.setAttribute).toHaveBeenCalledWith('y1', 74); // 50 + 20 + 4
      expect(mockUnderline.setAttribute).toHaveBeenCalledWith('x2', 180); // 100 + 80
      expect(mockUnderline.setAttribute).toHaveBeenCalledWith('y2', 74);
    });
  });

  describe('click detection', () => {
    beforeEach(() => {
      contextualEditor = new ContextualEditor(mockColorManager, mockLabelManager);
    });

    it('should find associated segment for label-segment elements', () => {
      // Mock DOM elements
      const mockSegment = { id: 'segment-1' };
      const mockLabel = { id: 'label-segment-1' };
      
      document.getElementById = vi.fn((id) => {
        if (id === 'segment-1') return mockSegment;
        if (id === 'label-segment-1') return mockLabel;
        return null;
      });

      const result = contextualEditor.findAssociatedSegment('label-segment-1');
      expect(result).toBe('segment-1');
    });

    it('should return null for title elements', () => {
      const result = contextualEditor.findAssociatedSegment('title-expand');
      expect(result).toBeNull();
    });

    it('should return null for non-existent segments', () => {
      document.getElementById = vi.fn(() => null);

      const result = contextualEditor.findAssociatedSegment('label-segment-nonexistent');
      expect(result).toBeNull();
    });


  });
});
