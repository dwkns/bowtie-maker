// Download Manager Module
class DownloadManager {
  constructor() {
    this.initializeDownloadButtons();
  }

  // Initialize download buttons
  initializeDownloadButtons() {
    const downloadSvgBtn = document.getElementById('download-btn');
    const downloadPngBtn = document.getElementById('download-png-btn');
    
    if (downloadSvgBtn) {
      downloadSvgBtn.addEventListener('click', () => this.downloadSVG());
    }
    
    if (downloadPngBtn) {
      downloadPngBtn.addEventListener('click', () => this.downloadPNG());
    }
  }

  // Clean SVG by removing selection highlights
  cleanSVG(svg) {
    const svgClone = svg.cloneNode(true);
    
    // Remove selection highlights (orange underlines)
    const selectionElements = svgClone.querySelectorAll('#text-highlight-underline');
    selectionElements.forEach(element => element.remove());
    
    // Remove orange stroke styles from segments that might be highlighted
    const segments = svgClone.querySelectorAll('[id^="segment-"]');
    segments.forEach(segment => {
      const stroke = segment.getAttribute('stroke');
      const strokeWidth = segment.getAttribute('stroke-width');
      
      // Only remove stroke if it's the orange selection color
      if (stroke === '#FF6600' || stroke === 'rgb(255, 102, 0)') {
        segment.removeAttribute('stroke');
        segment.removeAttribute('stroke-width');
      }
    });
    
    // Remove orange stroke styles from text elements that might be highlighted
    const textElements = svgClone.querySelectorAll('[id^="label-segment-"], [id^="title-"]');
    textElements.forEach(textElement => {
      const stroke = textElement.getAttribute('stroke');
      const strokeWidth = textElement.getAttribute('stroke-width');
      
      // Only remove stroke if it's the orange selection color
      if (stroke === '#FF6600' || stroke === 'rgb(255, 102, 0)') {
        textElement.removeAttribute('stroke');
        textElement.removeAttribute('stroke-width');
      }
    });
    
    return svgClone;
  }

  // Download SVG file
  downloadSVG() {
    const svgContainer = document.getElementById('svg-container');
    const svg = svgContainer ? svgContainer.querySelector('svg') : null;
    if (svg) {
      // Clean the SVG by removing selection highlights
      const cleanSvg = this.cleanSVG(svg);
      
      // Debug: Check if segments are present
      const segments = cleanSvg.querySelectorAll('[id^="segment-"]');
      console.log(`Exporting SVG with ${segments.length} segments:`, 
        Array.from(segments).map(s => ({ id: s.id, fill: s.getAttribute('fill') }))
      );
      
      // Create a new SVG element with proper namespace
      const svgString = new XMLSerializer().serializeToString(cleanSvg);
      const svgBlob = new Blob([svgString], {type: 'image/svg+xml'});
      
      // Create download link
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bowtie.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      console.error('SVG element not found');
    }
  }

  // Download PNG file
  downloadPNG() {
    const svgContainer = document.getElementById('svg-container');
    const svg = svgContainer ? svgContainer.querySelector('svg') : null;
    if (svg) {
      // Clean the SVG by removing selection highlights
      const cleanSvg = this.cleanSVG(svg);
      
      // Debug: Check if segments are present
      const segments = cleanSvg.querySelectorAll('[id^="segment-"]');
      console.log(`Exporting PNG with ${segments.length} segments:`, 
        Array.from(segments).map(s => ({ id: s.id, fill: s.getAttribute('fill') }))
      );
      
      // Get original dimensions
      const originalWidth = parseInt(svg.getAttribute('width') || '800');
      const originalHeight = parseInt(svg.getAttribute('height') || '506');
      
      // Set PNG dimensions (2x for better resolution without excessive size)
      const pngWidth = originalWidth * 2;
      const pngHeight = originalHeight * 2;
      
      // Create a canvas to render the SVG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = pngWidth;
      canvas.height = pngHeight;
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Set white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, pngWidth, pngHeight);
      
      // Convert SVG to data URL with improved text rendering
      const svgString = new XMLSerializer().serializeToString(cleanSvg);
      
      // Add CSS for better text rendering
      const improvedSvgString = svgString.replace(
        '<svg',
        '<svg style="text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;"'
      );
      
      const svgBlob = new Blob([improvedSvgString], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(svgBlob);
      
      // Create an image from the SVG
      const img = new Image();
      img.onload = () => {
        // Draw the image with high quality
        ctx.drawImage(img, 0, 0, pngWidth, pngHeight);
        
        // Convert canvas to PNG with high quality
        canvas.toBlob((blob) => {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = 'bowtie.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        }, 'image/png', 1.0); // Maximum quality (1.0)
        
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } else {
      console.error('SVG element not found');
    }
  }
}

export default DownloadManager;
