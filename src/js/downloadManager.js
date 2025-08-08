// Download Manager Module
class DownloadManager {
  constructor() {
    this.initializeDownloadButton();
  }

  // Initialize download button
  initializeDownloadButton() {
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadSVG());
    }
  }

  // Download SVG file
  downloadSVG() {
    const svgContainer = document.getElementById('svg-container');
    const svg = svgContainer ? svgContainer.querySelector('svg') : null;
    if (svg) {
      // Clone the SVG to avoid modifying the original
      const svgClone = svg.cloneNode(true);
      
      // Create a new SVG element with proper namespace
      const svgString = new XMLSerializer().serializeToString(svgClone);
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
}

export default DownloadManager;
