/**
 * =============================================================================
 * 2D Color Selector Component
 * =============================================================================
 * Circular hue-chroma wheel for visual OKLCH color selection
 * Canvas-based with click/drag interaction
 * Phase 7 Enhancement: Modern color picker with visual feedback
 * =============================================================================
 */

import type { OklchColor } from '../types/color.types.js';
import { toCssColor } from '../utils/color-convert.js';

/**
 * 2D Color Selector configuration
 */
interface ColorSelector2DConfig {
  size: number;              // Canvas size in pixels
  lightness: number;         // Current lightness (0-100)
  onColorChange: (color: OklchColor) => void;
}

/**
 * Color selector state
 */
interface ColorSelectorState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  isDragging: boolean;
  currentColor: OklchColor;
  config: ColorSelector2DConfig;
}

/**
 * Create 2D color selector HTML
 *
 * @param id - Unique selector ID
 * @param lightness - Initial lightness value
 * @returns HTML string
 */
export function createColorSelector2DHTML(id: string, _lightness: number): string {
  const size = 200; // Canvas size

  return `
    <div class="color-selector-2d" data-selector-2d="${id}">
      <canvas
        class="color-selector-2d__canvas"
        data-canvas
        width="${size}"
        height="${size}"
      ></canvas>
      <div
        class="color-selector-2d__marker"
        data-marker
        hidden
      ></div>
    </div>
  `;
}

/**
 * Initialize 2D color selector
 *
 * @param container - Container element
 * @param initialColor - Initial OKLCH color
 * @param onChange - Color change callback
 * @returns Cleanup function
 */
export function initColorSelector2D(
  container: HTMLElement,
  initialColor: OklchColor,
  onChange: (color: OklchColor) => void
): () => void {
  const canvas = container.querySelector('[data-canvas]') as HTMLCanvasElement;
  const marker = container.querySelector('[data-marker]') as HTMLElement;

  if (!canvas) {
    console.error('2D Color Selector: canvas not found');
    return () => {};
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('2D Color Selector: failed to get canvas context');
    return () => {};
  }

  const state: ColorSelectorState = {
    canvas,
    ctx,
    isDragging: false,
    currentColor: initialColor,
    config: {
      size: canvas.width,
      lightness: initialColor.l,
      onColorChange: onChange
    }
  };

  // Render initial wheel
  renderColorWheel(state);

  // Set initial marker position
  if (marker) {
    updateMarkerPosition(state, marker, initialColor);
  }

  // Event listeners
  const handleMouseDown = (e: MouseEvent) => {
    state.isDragging = true;
    handleColorSelect(e, state, marker);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (state.isDragging) {
      handleColorSelect(e, state, marker);
    }
  };

  const handleMouseUp = () => {
    state.isDragging = false;
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    state.isDragging = true;
    handleColorSelectTouch(e, state, marker);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (state.isDragging) {
      handleColorSelectTouch(e, state, marker);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    state.isDragging = false;
  };

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);

  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Cleanup
  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mouseleave', handleMouseUp);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
  };
}

/**
 * Update selector lightness and re-render
 *
 * @param container - Selector container
 * @param lightness - New lightness value (0-100)
 */
export function updateSelector2DLightness(
  container: HTMLElement,
  lightness: number
): void {
  const canvas = container.querySelector('[data-canvas]') as HTMLCanvasElement;

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const state: Partial<ColorSelectorState> = {
    canvas,
    ctx,
    config: {
      size: canvas.width,
      lightness,
      onColorChange: () => {} // Not used in re-render
    }
  };

  renderColorWheel(state as ColorSelectorState);
}

/**
 * Render color wheel on canvas
 * Circular gradient: hue (360°) × chroma (radial distance)
 */
function renderColorWheel(state: ColorSelectorState): void {
  const { ctx, config } = state;
  const { size, lightness } = config;
  const center = size / 2;
  const radius = size / 2 - 10; // Leave margin for border

  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Draw color wheel using polar coordinates
  const steps = 360; // Angular resolution
  const radiusSteps = 50; // Radial resolution

  for (let angle = 0; angle < 360; angle += 360 / steps) {
    for (let r = 0; r <= radius; r += radius / radiusSteps) {
      const hue = angle;
      const chroma = (r / radius) * 0.32; // Max chroma ~0.32 for visible colors

      // Convert to CSS color
      const color = toCssColor({ l: lightness, c: chroma, h: hue });

      // Calculate pixel position
      const rad = (angle * Math.PI) / 180;
      const x = center + r * Math.cos(rad);
      const y = center + r * Math.sin(rad);

      // Draw pixel
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // Draw outer border circle
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

/**
 * Handle color selection from mouse event
 */
function handleColorSelect(
  e: MouseEvent,
  state: ColorSelectorState,
  marker: HTMLElement | null
): void {
  const { canvas } = state;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  selectColorAt(x, y, state, marker);
}

/**
 * Handle color selection from touch event
 */
function handleColorSelectTouch(
  e: TouchEvent,
  state: ColorSelectorState,
  marker: HTMLElement | null
): void {
  const { canvas } = state;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  selectColorAt(x, y, state, marker);
}

/**
 * Select color at canvas coordinates
 */
function selectColorAt(
  x: number,
  y: number,
  state: ColorSelectorState,
  marker: HTMLElement | null
): void {
  const { config } = state;
  const { size, lightness, onColorChange } = config;
  const center = size / 2;
  const radius = size / 2 - 10;

  // Convert to polar coordinates
  const dx = x - center;
  const dy = y - center;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Check if within wheel bounds
  if (distance > radius) {
    return;
  }

  // Calculate hue (angle) and chroma (distance)
  let hue = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (hue < 0) hue += 360;

  const chroma = Math.min((distance / radius) * 0.32, 0.32);

  // Create new color
  const newColor: OklchColor = {
    l: lightness,
    c: chroma,
    h: hue
  };

  // Update state
  state.currentColor = newColor;

  // Update marker position
  if (marker) {
    updateMarkerPosition(state, marker, newColor);
  }

  // Trigger callback
  onColorChange(newColor);
}

/**
 * Update marker position based on color
 */
function updateMarkerPosition(
  state: ColorSelectorState,
  marker: HTMLElement,
  color: OklchColor
): void {
  const { config } = state;
  const { size } = config;
  const center = size / 2;
  const radius = size / 2 - 10;

  // Convert OKLCH to polar coordinates
  const distance = (color.c / 0.32) * radius;
  const rad = (color.h * Math.PI) / 180;

  const x = center + distance * Math.cos(rad);
  const y = center + distance * Math.sin(rad);

  // Position marker
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
  marker.hidden = false;
}
