import { describe, it, expect, beforeEach, vi } from 'vitest';
import ColorManager from '../src/js/colorManager.js';
import SegmentEditor from '../src/js/segmentEditor.js';

describe('SegmentEditor', () => {
  let segmentEditor;
  let colorManager;

  beforeEach(() => {
    // Mock DOM
    document.body.innerHTML = `
      <div id="svg-container">
        <div id="segment-1" fill="#FF6B6B"></div>
        <div id="segment-2" fill="#4ECDC4"></div>
        <div id="segment-3" fill="#45B7D1"></div>
      </div>
      <div id="segment-editors"></div>
      <template id="segment-editor-template">
        <div class="segment-editor">
          <input class="segment-color-input" data-segment-id="" />
          <input class="hex-input" data-segment-id="" />
        </div>
      </template>

    `;
    
    colorManager = new ColorManager();
    segmentEditor = new SegmentEditor(colorManager);
  });

  describe('constructor', () => {
    it('should initialize with color manager and template', () => {
      expect(segmentEditor.colorManager).toBe(colorManager);
      expect(segmentEditor.template).toBe(document.getElementById('segment-editor-template'));
    });
  });

  describe('generateSegmentEditors', () => {
    it('should generate segment editors for all segments', () => {
      segmentEditor.generateSegmentEditors();
      
      const editorsContainer = document.getElementById('segment-editors');
      const editors = editorsContainer.querySelectorAll('.segment-editor');
      
      expect(editors).toHaveLength(3);
    });

    it('should set up color inputs correctly', () => {
      segmentEditor.generateSegmentEditors();
      
      const colorInputs = document.querySelectorAll('.segment-color-input');
      expect(colorInputs).toHaveLength(3);
      
      // With the new sorting, segment-1 should be last (rightmost)
      expect(colorInputs[2].value).toBe('#FF6B6B');
      expect(colorInputs[2].getAttribute('data-segment-id')).toBe('segment-1');
    });

    it('should set up hex inputs correctly', () => {
      segmentEditor.generateSegmentEditors();
      
      const hexInputs = document.querySelectorAll('.hex-input');
      expect(hexInputs).toHaveLength(3);
      
      // With the new sorting, segment-1 should be last (rightmost)
      expect(hexInputs[2].value).toBe('FF6B6B');
      expect(hexInputs[2].getAttribute('data-segment-id')).toBe('segment-1');
      expect(hexInputs[2].dataset.lastValidValue).toBe('FF6B6B');
    });

    it('should handle missing template gracefully', () => {
      document.getElementById('segment-editor-template').remove();
      segmentEditor = new SegmentEditor(colorManager);
      
      expect(() => segmentEditor.generateSegmentEditors()).not.toThrow();
    });

    it('should handle missing containers gracefully', () => {
      document.getElementById('svg-container').remove();
      document.getElementById('segment-editors').remove();
      
      expect(() => segmentEditor.generateSegmentEditors()).not.toThrow();
    });
  });

  describe('updateHexInput', () => {
    it('should update hex input for specific segment', () => {
      // First generate editors
      segmentEditor.generateSegmentEditors();
      
      segmentEditor.updateHexInput('segment-1', 'FF0000');
      
      const hexInput = document.querySelector('.hex-input[data-segment-id="segment-1"]');
      expect(hexInput.value).toBe('FF0000');
      expect(hexInput.dataset.lastValidValue).toBe('FF0000');
    });

    it('should handle non-existent segment gracefully', () => {
      expect(() => segmentEditor.updateHexInput('non-existent', 'FF0000')).not.toThrow();
    });
  });

  describe('updateAllHexInputs', () => {
    it('should update all hex inputs', () => {
      // First generate editors
      segmentEditor.generateSegmentEditors();
      
      segmentEditor.updateAllHexInputs('FF0000');
      
      const hexInputs = document.querySelectorAll('.hex-input');
      hexInputs.forEach(input => {
        expect(input.value).toBe('FF0000');
        expect(input.dataset.lastValidValue).toBe('FF0000');
      });
    });
  });

  describe('handleColorPickerChange', () => {
    it('should handle single segment color change', () => {
      // First generate editors to create the DOM elements
      segmentEditor.generateSegmentEditors();
      
      // Mock color manager methods
      const updateSegmentColorSpy = vi.spyOn(colorManager, 'updateSegmentColor');
      const updateHexInputSpy = vi.spyOn(segmentEditor, 'updateHexInput');
      const saveStateSpy = vi.spyOn(colorManager, 'saveState');
      const updateRevertButtonVisibilitySpy = vi.spyOn(segmentEditor, 'updateRevertButtonVisibility');
      
      // Mock event
      const event = {
        target: {
          dataset: { segmentId: 'segment-1' },
          value: '#FF0000'
        }
      };
      
      segmentEditor.handleColorPickerChange(event);
      
      expect(updateSegmentColorSpy).toHaveBeenCalledWith('segment-1', '#FF0000');
      expect(updateHexInputSpy).toHaveBeenCalledWith('segment-1', 'FF0000');
      expect(saveStateSpy).toHaveBeenCalled();
      expect(updateRevertButtonVisibilitySpy).toHaveBeenCalled();
    });


  });

  describe('handleHexInputChange', () => {
    it('should handle valid hex input change for single segment', () => {
      // First generate editors to create the DOM elements
      segmentEditor.generateSegmentEditors();
      
      // Mock color manager methods
      const updateSegmentColorSpy = vi.spyOn(colorManager, 'updateSegmentColor');
      const saveStateSpy = vi.spyOn(colorManager, 'saveState');
      const updateRevertButtonVisibilitySpy = vi.spyOn(segmentEditor, 'updateRevertButtonVisibility');
      
      // Mock event
      const event = {
        target: {
          dataset: { segmentId: 'segment-1' },
          value: 'FF0000'
        }
      };
      
      segmentEditor.handleHexInputChange(event);
      
      expect(updateSegmentColorSpy).toHaveBeenCalledWith('segment-1', '#FF0000');
      expect(saveStateSpy).toHaveBeenCalled();
      expect(updateRevertButtonVisibilitySpy).toHaveBeenCalled();
    });



    it('should not process invalid hex input', () => {
      // Mock color manager methods
      const updateSegmentColorSpy = vi.spyOn(colorManager, 'updateSegmentColor');
      const saveStateSpy = vi.spyOn(colorManager, 'saveState');
      
      // Mock event with invalid hex
      const event = {
        target: {
          dataset: { segmentId: 'segment-1' },
          value: 'GG0000'
        }
      };
      
      segmentEditor.handleHexInputChange(event);
      
      expect(updateSegmentColorSpy).not.toHaveBeenCalled();
      expect(saveStateSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleHexInputBlur', () => {
    it('should revert to last valid value when field is empty', () => {
      // Mock event
      const event = {
        target: {
          value: '',
          dataset: { lastValidValue: 'FF0000' }
        }
      };
      
      segmentEditor.handleHexInputBlur(event);
      
      expect(event.target.value).toBe('FF0000');
    });

    it('should not revert when field has content', () => {
      // Mock event
      const event = {
        target: {
          value: 'FF0000',
          dataset: { lastValidValue: '00FF00' }
        }
      };
      
      segmentEditor.handleHexInputBlur(event);
      
      expect(event.target.value).toBe('FF0000');
    });

    it('should not revert when no last valid value exists', () => {
      // Mock event
      const event = {
        target: {
          value: '',
          dataset: {}
        }
      };
      
      segmentEditor.handleHexInputBlur(event);
      
      expect(event.target.value).toBe('');
    });
  });

  describe('updateRevertButtonVisibility', () => {
    it('should show revert button when saved state exists', () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('{"segment-1":"#FF0000"}')
      };
      global.localStorage = mockLocalStorage;
      
      // Mock revert button
      const revertBtn = document.getElementById('revert-btn') || document.createElement('button');
      revertBtn.id = 'revert-btn';
      document.body.appendChild(revertBtn);
      
      segmentEditor.updateRevertButtonVisibility();
      
      expect(revertBtn.style.display).toBe('flex');
    });

    it('should hide revert button when no saved state exists', () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue(null)
      };
      global.localStorage = mockLocalStorage;
      
      // Mock revert button
      const revertBtn = document.getElementById('revert-btn') || document.createElement('button');
      revertBtn.id = 'revert-btn';
      document.body.appendChild(revertBtn);
      
      segmentEditor.updateRevertButtonVisibility();
      
      expect(revertBtn.style.display).toBe('none');
    });
  });

  describe('initializeEventListeners', () => {
    it('should add event listeners for color picker changes', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      segmentEditor.initializeEventListeners();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should add event listeners for hex input changes', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      segmentEditor.initializeEventListeners();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('input', expect.any(Function));
    });

    it('should add event listeners for hex input blur', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      segmentEditor.initializeEventListeners();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function), true);
    });
  });
});
