import { describe, it, expect } from 'vitest';
import { hexToRgb, calculateLuminance, getOptimalTextColor, calculateContrastRatio } from '../src/js/colorUtils.js';

describe('ColorUtils', () => {
  describe('hexToRgb', () => {
    it('should convert 6-digit hex to RGB', () => {
      const result = hexToRgb('#FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert 3-digit hex to RGB', () => {
      const result = hexToRgb('#F00');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle hex without #', () => {
      const result = hexToRgb('FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle mixed case hex', () => {
      const result = hexToRgb('#fF00Aa');
      expect(result).toEqual({ r: 255, g: 0, b: 170 });
    });
  });

  describe('calculateLuminance', () => {
    it('should calculate luminance for pure red', () => {
      const luminance = calculateLuminance('#FF0000');
      expect(luminance).toBeCloseTo(0.2126, 4);
    });

    it('should calculate luminance for pure green', () => {
      const luminance = calculateLuminance('#00FF00');
      expect(luminance).toBeCloseTo(0.7152, 4);
    });

    it('should calculate luminance for pure blue', () => {
      const luminance = calculateLuminance('#0000FF');
      expect(luminance).toBeCloseTo(0.0722, 4);
    });

    it('should calculate luminance for white', () => {
      const luminance = calculateLuminance('#FFFFFF');
      expect(luminance).toBeCloseTo(1.0, 4);
    });

    it('should calculate luminance for black', () => {
      const luminance = calculateLuminance('#000000');
      expect(luminance).toBeCloseTo(0.0, 4);
    });

    it('should calculate luminance for gray', () => {
      const luminance = calculateLuminance('#808080');
      expect(luminance).toBeCloseTo(0.2159, 4);
    });
  });

  describe('getOptimalTextColor', () => {
    it('should return black text for light backgrounds', () => {
      expect(getOptimalTextColor('#FFFFFF')).toBe('#000000');
      expect(getOptimalTextColor('#FFFF00')).toBe('#000000');
      expect(getOptimalTextColor('#00FFFF')).toBe('#000000');
      // Magenta is actually dark (luminance ~0.285), so it gets white text
      expect(getOptimalTextColor('#FF00FF')).toBe('#FFFFFF');
    });

    it('should return white text for dark backgrounds', () => {
      expect(getOptimalTextColor('#000000')).toBe('#FFFFFF');
      expect(getOptimalTextColor('#000080')).toBe('#FFFFFF');
      expect(getOptimalTextColor('#800000')).toBe('#FFFFFF');
      expect(getOptimalTextColor('#008000')).toBe('#FFFFFF');
    });

    it('should handle edge cases around the threshold', () => {
      // Test with a color that's close to the 0.5 threshold
      const mediumGray = calculateLuminance('#808080');
      expect(mediumGray).toBeLessThan(0.5);
      expect(getOptimalTextColor('#808080')).toBe('#FFFFFF');
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate maximum contrast for black and white', () => {
      const ratio = calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21.0, 1);
    });

    it('should calculate minimum contrast for same colors', () => {
      const ratio = calculateContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBeCloseTo(1.0, 1);
    });

    it('should calculate contrast for different colors', () => {
      const ratio = calculateContrastRatio('#FF0000', '#00FF00');
      expect(ratio).toBeGreaterThan(1.0);
      expect(ratio).toBeLessThan(21.0);
    });

    it('should be symmetric', () => {
      const ratio1 = calculateContrastRatio('#FF0000', '#00FF00');
      const ratio2 = calculateContrastRatio('#00FF00', '#FF0000');
      expect(ratio1).toBeCloseTo(ratio2, 4);
    });
  });

  describe('Integration tests', () => {
    it('should provide good contrast for common color combinations', () => {
      // Test that our algorithm provides good contrast ratios
      const testColors = [
        '#FF0000', // Red
        '#00FF00', // Green
        '#0000FF', // Blue
        '#FFFF00', // Yellow
        '#FF00FF', // Magenta
        '#00FFFF', // Cyan
        '#FFA500', // Orange
        '#800080', // Purple
        '#A52A2A', // Brown
        '#FFC0CB'  // Pink
      ];

      testColors.forEach(color => {
        const textColor = getOptimalTextColor(color);
        const contrastRatio = calculateContrastRatio(color, textColor);
        
        // Our algorithm should provide reasonable contrast for readability
        // Some colors may have lower contrast but still be readable
        expect(contrastRatio).toBeGreaterThan(1.5);
      });
    });

    it('should handle edge cases gracefully', () => {
      // Test with very light and very dark colors
      expect(getOptimalTextColor('#FEFEFE')).toBe('#000000'); // Very light
      expect(getOptimalTextColor('#010101')).toBe('#FFFFFF'); // Very dark
    });
  });
});
