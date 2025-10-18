// =============================================================================
// Dashboard Navigation
// =============================================================================
// Handles sidebar navigation, tab switching, and sidebar collapse
// Phase 7: TypeScript Theme Editor - Sidebar Layout
// =============================================================================

import { on } from './core/event-bus.js';
import { EventName } from './types/events.types.js';
import { saveActiveTab } from './core/storage-manager.js';

const SIDEBAR_STATE_KEY = 'onboard-sidebar-collapsed';
const THEME_KEY = 'onboard-theme-preference';

/**
 * Initialize dashboard navigation
 * Sets up event listeners for sidebar toggle and tab switching
 */
export function initDashboardNav(): void {
  const navButtons = document.querySelectorAll('[data-section]');
  const sections = document.querySelectorAll('.dashboard__section');
  const unsavedIndicator = document.getElementById('unsaved-indicator');
  const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
  const sidebarToggle = document.querySelector('[data-sidebar-toggle]') as HTMLButtonElement;
  const themeToggle = document.querySelector('[data-theme-toggle]') as HTMLButtonElement;

  // Initialize sidebar state from localStorage
  initSidebarState(sidebar);

  // Initialize theme from localStorage
  initTheme();

  // Sidebar toggle button
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('dashboard__sidebar--collapsed');
      localStorage.setItem(SIDEBAR_STATE_KEY, isCollapsed ? 'true' : 'false');
    });
  }

  // Theme toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const html = document.documentElement;
      const isDark = html.classList.toggle('dark');
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    });
  }

  // Tab/Section switching
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetSection = button.getAttribute('data-section');

      if (!targetSection) return;

      // Save active tab to localStorage
      saveActiveTab(targetSection);

      // Update active sidebar button
      navButtons.forEach((btn) => btn.classList.remove('dashboard__sidebar-item--active'));
      button.classList.add('dashboard__sidebar-item--active');

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

/**
 * Initialize sidebar collapsed state from localStorage
 */
function initSidebarState(sidebar: HTMLElement | null): void {
  if (!sidebar) return;

  const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);

  // On mobile, always start collapsed (CSS handles this)
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    sidebar.classList.add('dashboard__sidebar--collapsed');
  } else if (savedState === 'true') {
    sidebar.classList.add('dashboard__sidebar--collapsed');
  }
}

/**
 * Initialize theme from localStorage or system preference
 */
function initTheme(): void {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === 'dark') {
    html.classList.add('dark');
  } else if (savedTheme === 'light') {
    html.classList.remove('dark');
  } else {
    // Default to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      html.classList.add('dark');
    }
  }
}
