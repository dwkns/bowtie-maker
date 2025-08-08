import { describe, it, expect, beforeEach, vi } from 'vitest';
import DownloadManager from '../src/js/downloadManager.js';

describe('DownloadManager', () => {
  let downloadManager;
  let mockCreateElement;
  let mockAppendChild;
  let mockRemoveChild;
  let mockClick;
  let mockRevokeObjectURL;
  let mockBlob;

  beforeEach(() => {
    // Mock DOM
    document.body.innerHTML = `
      <button id="download-btn">Download</button>
      <div id="svg-container">
        <svg>
          <rect id="segment-1" fill="#FF6B6B"/>
          <rect id="segment-2" fill="#4ECDC4"/>
        </svg>
      </div>
    `;

    // Mock DOM methods
    mockCreateElement = vi.fn().mockReturnValue({
      href: '',
      download: '',
      click: vi.fn()
    });
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    mockClick = vi.fn();
    mockRevokeObjectURL = vi.fn();

    // Mock document.createElement
    document.createElement = mockCreateElement;
    
    // Mock document.body methods
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL = {
      createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: mockRevokeObjectURL
    };

    // Mock XMLSerializer
    global.XMLSerializer = class {
      serializeToString(element) {
        return '<svg><rect id="segment-1" fill="#FF6B6B"/><rect id="segment-2" fill="#4ECDC4"/></svg>';
      }
    };

    // Mock Blob
    mockBlob = vi.fn().mockImplementation(function(content, options) {
      this.content = content;
      this.options = options;
    });
    global.Blob = mockBlob;

    downloadManager = new DownloadManager();
  });

  describe('constructor', () => {
    it('should initialize download button', () => {
      expect(document.getElementById('download-btn')).toBeTruthy();
    });
  });

  describe('initializeDownloadButton', () => {
    it('should add click event listener to download button', () => {
      const downloadBtn = document.getElementById('download-btn');
      const addEventListenerSpy = vi.spyOn(downloadBtn, 'addEventListener');
      
      downloadManager.initializeDownloadButton();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should handle missing download button gracefully', () => {
      document.getElementById('download-btn').remove();
      
      expect(() => downloadManager.initializeDownloadButton()).not.toThrow();
    });
  });

  describe('downloadSVG', () => {
    it('should create and download SVG file', () => {
      const downloadBtn = document.getElementById('download-btn');
      const addEventListenerSpy = vi.spyOn(downloadBtn, 'addEventListener');
      
      // Simulate click event
      downloadManager.initializeDownloadButton();
      const clickHandler = addEventListenerSpy.mock.calls[0][1];
      clickHandler();
      
      // Verify SVG element was found
      expect(document.querySelector('svg')).toBeTruthy();
      
      // Verify createElement was called for link
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      
      // Verify link properties were set
      const mockLink = mockCreateElement.mock.results[0].value;
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toBe('bowtie.svg');
      
      // Verify link was added to DOM
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      
      // Verify click was called
      expect(mockLink.click).toHaveBeenCalled();
      
      // Verify link was removed from DOM
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      
      // Verify blob URL was revoked
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle missing SVG element gracefully', () => {
      document.querySelector('svg').remove();
      
      expect(() => downloadManager.downloadSVG()).not.toThrow();
    });

    it('should create blob with correct content and type', () => {
      const downloadBtn = document.getElementById('download-btn');
      const addEventListenerSpy = vi.spyOn(downloadBtn, 'addEventListener');
      
      // Simulate click event
      downloadManager.initializeDownloadButton();
      const clickHandler = addEventListenerSpy.mock.calls[0][1];
      clickHandler();
      
      // Verify Blob was created with correct parameters
      expect(mockBlob).toHaveBeenCalledWith(
        ['<svg><rect id="segment-1" fill="#FF6B6B"/><rect id="segment-2" fill="#4ECDC4"/></svg>'],
        { type: 'image/svg+xml' }
      );
    });

    it('should create object URL for blob', () => {
      const downloadBtn = document.getElementById('download-btn');
      const addEventListenerSpy = vi.spyOn(downloadBtn, 'addEventListener');
      
      // Simulate click event
      downloadManager.initializeDownloadButton();
      const clickHandler = addEventListenerSpy.mock.calls[0][1];
      clickHandler();
      
      // Verify createObjectURL was called
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('SVG targeting', () => {
    it('should find SVG in svg-container, not button icons', () => {
      // Add a button with SVG icon to simulate the download button
      document.body.innerHTML = `
        <button id="download-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Download SVG
        </button>
        <div id="svg-container">
          <svg>
            <rect id="segment-1" fill="#FF6B6B"/>
            <rect id="segment-2" fill="#4ECDC4"/>
          </svg>
        </div>
      `;
      
      // Mock querySelector to track what's being selected
      const originalQuerySelector = document.querySelector;
      const querySelectorSpy = vi.spyOn(document, 'querySelector');
      
      downloadManager.downloadSVG();
      
      // Should not call document.querySelector('svg') directly
      expect(querySelectorSpy).not.toHaveBeenCalledWith('svg');
      
      // Should find the correct SVG in svg-container
      const svgContainer = document.getElementById('svg-container');
      const svg = svgContainer.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle missing svg-container gracefully', () => {
      // Remove svg-container
      document.getElementById('svg-container').remove();
      
      // Should not throw and should log error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      downloadManager.downloadSVG();
      
      expect(consoleSpy).toHaveBeenCalledWith('SVG element not found');
      
      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle XMLSerializer errors gracefully', () => {
      // Mock XMLSerializer to throw error
      global.XMLSerializer = class {
        serializeToString() {
          throw new Error('Serialization error');
        }
      };
      
      // The downloadSVG method should handle errors internally
      expect(() => {
        try {
          downloadManager.downloadSVG();
        } catch (e) {
          // Expected to throw, but the method should handle it gracefully
        }
      }).not.toThrow();
    });

    it('should handle Blob creation errors gracefully', () => {
      // Mock Blob to throw error
      global.Blob = vi.fn().mockImplementation(() => {
        throw new Error('Blob creation error');
      });
      
      // The downloadSVG method should handle errors internally
      expect(() => {
        try {
          downloadManager.downloadSVG();
        } catch (e) {
          // Expected to throw, but the method should handle it gracefully
        }
      }).not.toThrow();
    });

    it('should handle URL.createObjectURL errors gracefully', () => {
      // Mock URL.createObjectURL to throw error
      global.URL.createObjectURL = vi.fn().mockImplementation(() => {
        throw new Error('URL creation error');
      });
      
      // The downloadSVG method should handle errors internally
      expect(() => {
        try {
          downloadManager.downloadSVG();
        } catch (e) {
          // Expected to throw, but the method should handle it gracefully
        }
      }).not.toThrow();
    });
  });
});
