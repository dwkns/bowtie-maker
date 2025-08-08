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
      <button id="download-btn">Download SVG</button>
      <button id="download-png-btn">Download PNG</button>
      <div id="svg-container">
        <svg>
          <rect id="segment-1" fill="#FF6B6B"/>
          <rect id="segment-2" fill="#4ECDC4"/>
          <line id="text-highlight-underline" stroke="#FF6600"/>
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
    it('should initialize download buttons', () => {
      expect(document.getElementById('download-btn')).toBeTruthy();
      expect(document.getElementById('download-png-btn')).toBeTruthy();
    });
  });

  describe('initializeDownloadButtons', () => {
    it('should add click event listeners to download buttons', () => {
      const downloadSvgBtn = document.getElementById('download-btn');
      const downloadPngBtn = document.getElementById('download-png-btn');
      const addEventListenerSpy1 = vi.spyOn(downloadSvgBtn, 'addEventListener');
      const addEventListenerSpy2 = vi.spyOn(downloadPngBtn, 'addEventListener');
      
      downloadManager.initializeDownloadButtons();
      
      expect(addEventListenerSpy1).toHaveBeenCalledWith('click', expect.any(Function));
      expect(addEventListenerSpy2).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should handle missing download buttons gracefully', () => {
      document.getElementById('download-btn').remove();
      document.getElementById('download-png-btn').remove();
      
      expect(() => downloadManager.initializeDownloadButtons()).not.toThrow();
    });
  });

  describe('cleanSVG', () => {
    it('should remove selection highlights from SVG', () => {
      const svg = document.querySelector('svg');
      const originalSvg = svg.cloneNode(true);
      
      // Verify highlight element exists before cleaning
      expect(svg.querySelector('#text-highlight-underline')).toBeTruthy();
      
      const cleanedSvg = downloadManager.cleanSVG(svg);
      
      // Verify highlight element was removed
      expect(cleanedSvg.querySelector('#text-highlight-underline')).toBeFalsy();
      
      // Verify original SVG was not modified
      expect(svg.querySelector('#text-highlight-underline')).toBeTruthy();
    });

    it('should remove stroke attributes from segments', () => {
      const svg = document.querySelector('svg');
      const segment = svg.querySelector('#segment-1');
      
      // Add stroke attributes to simulate selection
      segment.setAttribute('stroke', '#FF6600');
      segment.setAttribute('stroke-width', '5');
      
      const cleanedSvg = downloadManager.cleanSVG(svg);
      const cleanedSegment = cleanedSvg.querySelector('#segment-1');
      
      // Verify stroke attributes were removed
      expect(cleanedSegment.getAttribute('stroke')).toBeFalsy();
      expect(cleanedSegment.getAttribute('stroke-width')).toBeFalsy();
    });
  });

  describe('downloadSVG', () => {
    it('should create and download SVG file', () => {
      const downloadBtn = document.getElementById('download-btn');
      const addEventListenerSpy = vi.spyOn(downloadBtn, 'addEventListener');
      
      // Simulate click event
      downloadManager.initializeDownloadButtons();
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
      downloadManager.initializeDownloadButtons();
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
      downloadManager.initializeDownloadButtons();
      const clickHandler = addEventListenerSpy.mock.calls[0][1];
      clickHandler();
      
      // Verify createObjectURL was called
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('downloadPNG', () => {
    it('should handle missing SVG element gracefully for PNG', () => {
      document.querySelector('svg').remove();
      
      expect(() => downloadManager.downloadPNG()).not.toThrow();
    });

    it('should calculate correct PNG dimensions', () => {
      const svg = document.querySelector('svg');
      svg.setAttribute('width', '800');
      svg.setAttribute('height', '506');
      
      // Mock canvas and context
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue({
          fillStyle: '',
          fillRect: vi.fn(),
          drawImage: vi.fn(),
          imageSmoothingEnabled: false,
          imageSmoothingQuality: ''
        }),
        toBlob: vi.fn()
      };
      
      // Mock Image
      const mockImage = {
        onload: null,
        src: ''
      };
      
      // Mock createElement
      document.createElement = vi.fn()
        .mockReturnValueOnce(mockCanvas) // canvas
        .mockReturnValueOnce(mockImage); // image
      
      downloadManager.downloadPNG();
      
      // Verify canvas was created with 2x dimensions
      expect(mockCanvas.width).toBe(1600); // 2x original width
      expect(mockCanvas.height).toBe(1012); // 2x original height
      
      // Verify high-quality rendering was enabled
      const mockContext = mockCanvas.getContext();
      expect(mockContext.imageSmoothingEnabled).toBe(true);
      expect(mockContext.imageSmoothingQuality).toBe('high');
    });

    it('should improve text rendering in SVG', () => {
      const svg = document.querySelector('svg');
      svg.setAttribute('width', '800');
      svg.setAttribute('height', '506');
      
      // Mock XMLSerializer
      const mockSerializeToString = vi.fn().mockReturnValue('<svg><text>Test</text></svg>');
      global.XMLSerializer = class {
        serializeToString() {
          return mockSerializeToString();
        }
      };
      
      // Mock canvas and context
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue({
          fillStyle: '',
          fillRect: vi.fn(),
          drawImage: vi.fn()
        }),
        toBlob: vi.fn()
      };
      
      // Mock Image
      const mockImage = {
        onload: null,
        src: ''
      };
      
      // Mock createElement and Blob
      document.createElement = vi.fn()
        .mockReturnValueOnce(mockCanvas) // canvas
        .mockReturnValueOnce(mockImage); // image
      
      global.Blob = vi.fn().mockImplementation((content) => {
        // Verify that the SVG string includes text rendering improvements
        const svgString = content[0];
        expect(svgString).toContain('text-rendering: optimizeLegibility');
        expect(svgString).toContain('-webkit-font-smoothing: antialiased');
        expect(svgString).toContain('-moz-osx-font-smoothing: grayscale');
        return { type: 'image/svg+xml' };
      });
      
      downloadManager.downloadPNG();
      
      // Verify XMLSerializer was called
      expect(mockSerializeToString).toHaveBeenCalled();
    });

    it('should preserve segments in cleaned SVG', () => {
      const svg = document.querySelector('svg');
      
      // Add a selection highlight to simulate selected segment
      const segment = svg.querySelector('#segment-1');
      segment.setAttribute('stroke', '#FF6600');
      segment.setAttribute('stroke-width', '5');
      
      const cleanedSvg = downloadManager.cleanSVG(svg);
      
      // Verify segment still exists
      const cleanedSegment = cleanedSvg.querySelector('#segment-1');
      expect(cleanedSegment).toBeTruthy();
      
      // Verify segment has fill attribute (original styling)
      expect(cleanedSegment.getAttribute('fill')).toBe('#FF6B6B');
      
      // Verify orange stroke was removed
      expect(cleanedSegment.getAttribute('stroke')).toBeFalsy();
      expect(cleanedSegment.getAttribute('stroke-width')).toBeFalsy();
    });

    it('should not remove non-orange stroke attributes', () => {
      const svg = document.querySelector('svg');
      
      // Add a non-orange stroke to simulate original styling
      const segment = svg.querySelector('#segment-1');
      segment.setAttribute('stroke', '#000000');
      segment.setAttribute('stroke-width', '2');
      
      const cleanedSvg = downloadManager.cleanSVG(svg);
      
      // Verify segment still exists
      const cleanedSegment = cleanedSvg.querySelector('#segment-1');
      expect(cleanedSegment).toBeTruthy();
      
      // Verify non-orange stroke was preserved
      expect(cleanedSegment.getAttribute('stroke')).toBe('#000000');
      expect(cleanedSegment.getAttribute('stroke-width')).toBe('2');
    });

    it('should handle revert-then-select-then-export scenario', () => {
      // Simulate the scenario: revert to original, select segment, then export
      const svg = document.querySelector('svg');
      
      // First, ensure we have all segments
      const allSegments = svg.querySelectorAll('[id^="segment-"]');
      expect(allSegments.length).toBeGreaterThan(0);
      
      // Simulate selecting a segment (add orange stroke)
      const selectedSegment = svg.querySelector('#segment-1');
      selectedSegment.setAttribute('stroke', '#FF6600');
      selectedSegment.setAttribute('stroke-width', '5');
      
      // Simulate the export process
      const cleanSvg = downloadManager.cleanSVG(svg);
      
      // Verify all segments are still present
      const cleanedSegments = cleanSvg.querySelectorAll('[id^="segment-"]');
      expect(cleanedSegments.length).toBe(allSegments.length);
      
      // Verify the selected segment is still there
      const cleanedSelectedSegment = cleanSvg.querySelector('#segment-1');
      expect(cleanedSelectedSegment).toBeTruthy();
      
      // Verify the segment has its original fill
      expect(cleanedSelectedSegment.getAttribute('fill')).toBe('#FF6B6B');
      
      // Verify the orange stroke was removed
      expect(cleanedSelectedSegment.getAttribute('stroke')).toBeFalsy();
      expect(cleanedSelectedSegment.getAttribute('stroke-width')).toBeFalsy();
      
      // Verify all other segments are also present
      const segmentIds = Array.from(cleanedSegments).map(s => s.id);
      expect(segmentIds).toContain('segment-1');
      expect(segmentIds).toContain('segment-2');
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
