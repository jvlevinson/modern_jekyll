// =============================================================================
// Dashboard Navigation
// =============================================================================
// Handles tab switching between Theme, Content, Structure, and Preview sections
// Phase 7: TypeScript Theme Editor
// =============================================================================

import { on } from './core/event-bus.js';
import { EventName } from './types/events.types.js';
import { saveActiveTab } from './core/storage-manager.js';

/**
 * Initialize dashboard navigation
 * Sets up event listeners for tab switching
 */
export function initDashboardNav(): void {
  const navButtons = document.querySelectorAll('[data-section]');
  const sections = document.querySelectorAll('.dashboard__section');
  const unsavedIndicator = document.getElementById('unsaved-indicator');

  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetSection = button.getAttribute('data-section');

      if (!targetSection) return;

      // Save active tab to localStorage
      saveActiveTab(targetSection);

      // Update active nav button
      navButtons.forEach((btn) => btn.classList.remove('dashboard__nav-item--active'));
      button.classList.add('dashboard__nav-item--active');

      // Show target section, hide others
      sections.forEach((section) => {
        const sectionId = section.id.replace('section-', '');

        if (sectionId === targetSection) {
          section.removeAttribute('hidden');
        } else {
          section.setAttribute('hidden', '');
        }
      });
    });
  });

  // Listen to dirty state changes from config manager
  on(EventName.CONFIG_DIRTY, ({ isDirty }) => {
    if (unsavedIndicator) {
      unsavedIndicator.hidden = !isDirty;
    }
  });

  // Refresh preview iframe when preview tab is clicked
  const previewButton = document.querySelector('[data-section="preview"]');
  const previewIframe = document.querySelector('[data-preview-target]') as HTMLIFrameElement;

  if (previewButton && previewIframe) {
    previewButton.addEventListener('click', () => {
      // Small delay to ensure section is visible before reloading
      setTimeout(() => {
        if (previewIframe.src) {
          previewIframe.src = previewIframe.src; // Reload iframe
        }
      }, 100);
    });
  }

  // Refresh preview button handler
  const refreshButton = document.getElementById('refresh-preview');

  if (refreshButton && previewIframe) {
    refreshButton.addEventListener('click', () => {
      if (previewIframe.src) {
        previewIframe.src = previewIframe.src; // Reload iframe
      }
    });
  }

  // Viewport selector handler
  const viewportSelector = document.getElementById('preview-viewport') as HTMLSelectElement;

  if (viewportSelector && previewIframe) {
    viewportSelector.addEventListener('change', () => {
      const viewport = viewportSelector.value;
      const container = previewIframe.parentElement;

      if (!container) return;

      // Update iframe container width based on viewport
      switch (viewport) {
        case 'mobile':
          container.style.maxWidth = '375px';
          break;
        case 'tablet':
          container.style.maxWidth = '768px';
          break;
        case 'desktop':
        default:
          container.style.maxWidth = '100%';
          break;
      }
    });
  }
}
