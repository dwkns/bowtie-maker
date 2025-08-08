// Color utility functions for contrast and readability analysis

/**
 * Converts a hex color to RGB values
 * @param {string} hex - Hex color string (with or without #)
 * @returns {Object} RGB object with r, g, b values (0-255)
 */
export function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return { r, g, b };
}

/**
 * Calculates the relative luminance of a color
 * @param {string} hex - Hex color string
 * @returns {number} Luminance value (0-1)
 */
export function calculateLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  
  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  // Apply gamma correction
  const rL = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gL = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bL = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

/**
 * Determines the best text color (black or white) for maximum readability
 * @param {string} backgroundColor - Hex color string
 * @returns {string} '#000000' for black text or '#FFFFFF' for white text
 */
export function getOptimalTextColor(backgroundColor) {
  const luminance = calculateLuminance(backgroundColor);
  
  // Use black text on light backgrounds, white text on dark backgrounds
  // Threshold of 0.5 provides good contrast for most colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Calculates contrast ratio between two colors
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @returns {number} Contrast ratio
 */
export function calculateContrastRatio(color1, color2) {
  const lum1 = calculateLuminance(color1);
  const lum2 = calculateLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}
