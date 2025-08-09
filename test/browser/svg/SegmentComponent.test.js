import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from '@vitest/browser/context';
import registry from '../../../src/js/core/ComponentRegistry.js';
import SegmentComponent from '../../../src/js/components/svg/SegmentComponent.js';

describe('SegmentComponent Browser Tests', () => {
  beforeEach(async () => {
    // Create test SVG environment
    document.body.innerHTML = `
      <svg width="800" height="530" viewBox="0 0 800 530">
        <path
          id="segment-test"
          d="M100 100L200 100L200 200L100 200Z"
          fill="#FF6B6B"
        />
        <text
          id="label-segment-test"
          x="150"
          y="150"
          fill="#333333"
          class="svg-text"
        >
          <tspan>Test Segment</tspan>
        </text>
      </svg>
    `;

    // Initialize component
    const segment = document.getElementById('segment-test');
    registry.register('segment', SegmentComponent);
    registry.create('segment', segment);
  });

  afterEach(() => {
    registry.destroy();
  });

  it('should handle click selection', async () => {
    const segment = page.getByTestId('segment-test');
    
    // Click the segment
    await userEvent.click(segment);
    
    // Check selection styling
    await expect.element(segment).toHaveStyle({
      stroke: '#FF6600',
      'stroke-width': '2',
    });
  });

  it('should update color through state changes', async () => {
    const segment = page.getByTestId('segment-test');
    const newColor = '#00FF00';
    
    // Simulate color change through store
    store.setState({
      colors: {
        'segment-test': newColor
      }
    });
    
    // Check if color was updated
    await expect.element(segment).toHaveAttribute('fill', newColor);
  });

  it('should update label text', async () => {
    const label = page.getByTestId('label-segment-test');
    const newText = 'Updated Label';
    
    // Simulate label change through store
    store.setState({
      labels: {
        'segment-test': newText
      }
    });
    
    // Check if label was updated
    await expect.element(label).toHaveText(newText);
  });

  it('should handle hover states', async () => {
    const segment = page.getByTestId('segment-test');
    
    // Hover over segment
    await userEvent.hover(segment);
    await expect.element(segment).toHaveStyle({ opacity: '0.8' });
    
    // Move mouse away
    await userEvent.unhover(segment);
    await expect.element(segment).toHaveStyle({ opacity: '1' });
  });
});
