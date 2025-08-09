import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from '@vitest/browser/context';
import registry from '../../../src/js/core/ComponentRegistry.js';
import TextComponent from '../../../src/js/components/svg/TextComponent.js';

describe('TextComponent Browser Tests', () => {
  beforeEach(async () => {
    // Create test SVG environment
    document.body.innerHTML = `
      <svg width="800" height="530" viewBox="0 0 800 530">
        <text
          id="title-test"
          x="150"
          y="150"
          fill="#333333"
          class="svg-text"
        >
          <tspan>Test Title</tspan>
        </text>
      </svg>
    `;

    // Initialize component
    const text = document.getElementById('title-test');
    registry.register('text', TextComponent);
    registry.create('text', text);
  });

  afterEach(() => {
    registry.destroy();
  });

  it('should handle click selection with underline', async () => {
    const text = page.getByTestId('title-test');
    
    // Click the text
    await userEvent.click(text);
    
    // Check for underline presence
    const underline = page.getByTestId('text-highlight-underline');
    await expect.element(underline).toBeInTheDocument();
    await expect.element(underline).toHaveAttribute('stroke', '#FF6600');
  });

  it('should update text color', async () => {
    const text = page.getByTestId('title-test');
    const newColor = '#FF0000';
    
    // Simulate color change through store
    store.setState({
      colors: {
        'title-test': newColor
      }
    });
    
    // Check if color was updated
    await expect.element(text).toHaveAttribute('fill', newColor);
  });

  it('should update text content', async () => {
    const text = page.getByTestId('title-test');
    const newText = 'Updated Title';
    
    // Simulate text change through store
    store.setState({
      texts: {
        'title-test': newText
      }
    });
    
    // Check if text was updated
    await expect.element(text).toHaveText(newText);
  });

  it('should handle hover states', async () => {
    const text = page.getByTestId('title-test');
    
    // Hover over text
    await userEvent.hover(text);
    await expect.element(text).toHaveStyle({ opacity: '0.8' });
    
    // Move mouse away
    await userEvent.unhover(text);
    await expect.element(text).toHaveStyle({ opacity: '1' });
  });

  it('should remove underline when deselected', async () => {
    const text = page.getByTestId('title-test');
    
    // Click to select
    await userEvent.click(text);
    
    // Check underline exists
    const underline = page.getByTestId('text-highlight-underline');
    await expect.element(underline).toBeInTheDocument();
    
    // Click elsewhere to deselect
    await userEvent.click(document.body);
    
    // Check underline is removed
    await expect.element(underline).not.toBeInTheDocument();
  });
});
