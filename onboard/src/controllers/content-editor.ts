/**
 * =============================================================================
 * Content Editor Controller - Simplified for Hero/Services/Portfolio
 * =============================================================================
 * Manages editing of hero, services, and portfolio sections
 * Aligned with _config.yml structure
 * =============================================================================
 */

import {
  getHero,
  updateHero,
  getServices,
  updateServices,
  getPortfolio,
  updatePortfolio,
  type HeroData,
  type ServicesData,
  type PortfolioData,
  type ServiceItem,
  type PortfolioItem
} from '../core/content-api.js';
import { EventName } from '../types/events.types.js';
import { emit } from '../core/event-bus.js';
import { initImageUploader } from '../components/image-uploader.js';
import { attachIconPicker } from '../components/icon-picker.js';

/**
 * Initialize content editor on specified container
 *
 * @param containerId - Container element ID
 * @returns Cleanup function
 */
export async function initContentEditor(containerId: string): Promise<() => void> {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Content editor container not found: ${containerId}`);
    return () => {};
  }

  // Create tab structure
  container.innerHTML = `
    <div class="content-editor">
      <nav class="content-editor__tabs">
        <button class="content-editor__tab content-editor__tab--active" data-section="hero">
          <span class="tab-icon">🎯</span>
          <span>Hero Section</span>
        </button>
        <button class="content-editor__tab" data-section="services">
          <span class="tab-icon">⚡</span>
          <span>Services</span>
        </button>
        <button class="content-editor__tab" data-section="portfolio">
          <span class="tab-icon">📂</span>
          <span>Portfolio</span>
        </button>
      </nav>

      <div class="content-editor__panels">
        <div id="hero-panel" class="content-editor__panel content-editor__panel--active">
          <!-- Hero editor will be rendered here -->
        </div>
        <div id="services-panel" class="content-editor__panel">
          <!-- Services editor will be rendered here -->
        </div>
        <div id="portfolio-panel" class="content-editor__panel">
          <!-- Portfolio editor will be rendered here -->
        </div>
      </div>
    </div>
  `;

  // Setup tab switching
  const tabs = container.querySelectorAll('.content-editor__tab');
  const panels = container.querySelectorAll('.content-editor__panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const section = (tab as HTMLElement).dataset.section;

      // Update active states
      tabs.forEach(t => t.classList.remove('content-editor__tab--active'));
      panels.forEach(p => p.classList.remove('content-editor__panel--active'));

      tab.classList.add('content-editor__tab--active');
      const panel = container.querySelector(`#${section}-panel`);
      if (panel) {
        panel.classList.add('content-editor__panel--active');
      }
    });
  });

  // Initialize editors
  const cleanupHero = await initHeroEditor('hero-panel');
  const cleanupServices = await initServicesEditor('services-panel');
  const cleanupPortfolio = await initPortfolioEditor('portfolio-panel');

  // Return cleanup function
  return () => {
    cleanupHero();
    cleanupServices();
    cleanupPortfolio();
  };
}

/**
 * =============================================================================
 * Hero Editor
 * =============================================================================
 */

async function initHeroEditor(panelId: string): Promise<() => void> {
  const panel = document.getElementById(panelId);
  if (!panel) return () => {};

  // Load current hero data
  const hero = await getHero();
  if (!hero) {
    panel.innerHTML = '<div class="error">Failed to load hero data</div>';
    return () => {};
  }

  // Render form
  panel.innerHTML = `
    <form class="content-editor__form" id="hero-form">
      <div class="content-editor__field">
        <label class="content-editor__label">Heading</label>
        <input
          type="text"
          class="content-editor__input"
          name="heading"
          value="${hero.heading}"
          required
          maxlength="200"
        />
      </div>

      <div class="content-editor__field">
        <label class="content-editor__label">Description</label>
        <textarea
          class="content-editor__textarea"
          name="description"
          required
          maxlength="1000"
          rows="4"
        >${hero.description}</textarea>
      </div>

      <div class="content-editor__field">
        <label class="content-editor__label">Button Text</label>
        <input
          type="text"
          class="content-editor__input"
          name="button_text"
          value="${hero.button_text}"
          required
          maxlength="50"
        />
      </div>

      <div class="content-editor__field">
        <label class="content-editor__label">Button Link</label>
        <input
          type="text"
          class="content-editor__input"
          name="button_link"
          value="${hero.button_link}"
          required
          placeholder="#section or https://example.com"
        />
      </div>

      <div class="content-editor__field">
        <label class="content-editor__label">Background Image</label>
        <input
          type="text"
          class="content-editor__input"
          name="background_image"
          value="${hero.background_image}"
          required
          placeholder="img/header.jpg"
        />
        <div id="hero-image-upload" class="upload-zone" style="margin-top: 10px;"></div>
      </div>

      <div class="content-editor__actions">
        <button type="submit" class="btn btn--primary btn--large">
          💾 Save Hero Section
        </button>
        <button type="button" class="btn btn--secondary" id="hero-reset">
          ↺ Reset
        </button>
      </div>
    </form>
  `;

  // Setup image uploader
  const uploadCleanup = initImageUploader('#hero-image-upload', {
    multiple: false,
    onUpload: (result) => {
      const imageInput = panel.querySelector<HTMLInputElement>('[name="background_image"]');
      if (imageInput && result.original) {
        imageInput.value = result.original.path;
      }
    }
  });

  // Handle form submission
  const form = panel.querySelector('#hero-form') as HTMLFormElement;
  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const formData = new FormData(form);
    const heroData: HeroData = {
      heading: formData.get('heading') as string,
      description: formData.get('description') as string,
      button_text: formData.get('button_text') as string,
      button_link: formData.get('button_link') as string,
      background_image: formData.get('background_image') as string
    };

    emit(EventName.CONFIG_SAVING, undefined);
    const result = await updateHero(heroData);

    if (result) {
      alert('Hero section saved successfully!');
      emit(EventName.CONFIG_SAVED, { section: 'hero' });
    } else {
      alert('Failed to save hero section');
    }
  };

  // Handle reset
  const resetBtn = panel.querySelector('#hero-reset') as HTMLButtonElement;
  const handleReset = async () => {
    if (confirm('Reset all changes?')) {
      const freshData = await getHero();
      if (freshData) {
        form.reset();
        Object.entries(freshData).forEach(([key, value]: [string, string]) => {
          const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
          if (input) input.value = value;
        });
      }
    }
  };

  form.addEventListener('submit', (e) => {
    void handleSubmit(e);
  });
  resetBtn.addEventListener('click', () => {
    void handleReset();
  });

  return () => {
    // Note: event listeners handled by wrapper functions
    uploadCleanup();
  };
}

/**
 * =============================================================================
 * Services Editor
 * =============================================================================
 */

async function initServicesEditor(panelId: string): Promise<() => void> {
  const panel = document.getElementById(panelId);
  if (!panel) return () => {};

  // Load current services data
  const services = await getServices();
  if (!services) {
    panel.innerHTML = '<div class="error">Failed to load services data</div>';
    return () => {};
  }

  let currentServices = { ...services };

  const renderServicesForm = () => {
    panel.innerHTML = `
      <form class="content-editor__form" id="services-form">
        <div class="content-editor__field">
          <label class="content-editor__label">Section Heading</label>
          <input
            type="text"
            class="content-editor__input"
            name="heading"
            value="${currentServices.heading}"
            required
            maxlength="200"
          />
        </div>

        <div class="content-editor__array">
          <div class="content-editor__array-header">
            <h3>Services</h3>
            <button type="button" class="btn btn--small btn--primary" id="add-service">
              + Add Service
            </button>
          </div>
          <div id="services-list" class="content-editor__array-list">
            ${currentServices.list.map((service, index) => renderServiceItem(service, index)).join('')}
          </div>
        </div>

        <div class="content-editor__actions">
          <button type="submit" class="btn btn--primary btn--large">
            💾 Save Services
          </button>
          <button type="button" class="btn btn--secondary" id="services-reset">
            ↺ Reset
          </button>
        </div>
      </form>
    `;

    // Re-attach event listeners
    attachServicesListeners();
  };

  const renderServiceItem = (service: ServiceItem, index: number) => `
    <div class="service-item" data-index="${index}">
      <div class="service-item__handle">⋮⋮</div>
      <div class="service-item__fields">
        <input
          type="text"
          class="content-editor__input content-editor__input--small"
          placeholder="Icon (e.g., fa-diamond)"
          data-field="icon"
          value="${service.icon}"
          required
        />
        <div>
          <button type="button" class="btn btn--small" data-action="pick-icon" data-index="${index}">Pick Icon</button>
        </div>
        <input
          type="text"
          class="content-editor__input"
          placeholder="Title"
          data-field="title"
          value="${service.title}"
          required
        />
        <textarea
          class="content-editor__textarea content-editor__textarea--small"
          placeholder="Description"
          data-field="description"
          required
          rows="2"
        >${service.description}</textarea>
      </div>
      <button type="button" class="btn btn--danger btn--small" data-action="delete" data-index="${index}">
        Delete
      </button>
    </div>
  `;

  const attachServicesListeners = () => {
    const form = panel.querySelector('#services-form') as HTMLFormElement;
    const addBtn = panel.querySelector('#add-service') as HTMLButtonElement;
    const resetBtn = panel.querySelector('#services-reset') as HTMLButtonElement;

    // Add service
    addBtn?.addEventListener('click', () => {
      currentServices.list.push({
        icon: 'fa-diamond',
        title: 'New Service',
        description: 'Service description'
      });
      renderServicesForm();
    });

    // Delete service
    panel.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset.index || '0');
        if (confirm('Delete this service?')) {
          currentServices.list.splice(index, 1);
          renderServicesForm();
        }
      });
    });

    // Pick icon
    panel.querySelectorAll('[data-action="pick-icon"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0');
        const item = panel.querySelector(`.service-item[data-index="${index}"]`);
        const input = item?.querySelector('[data-field="icon"]') as HTMLInputElement | null;
        if (input) {
          attachIconPicker(input, { restrictTo: 'solid' });
          input.focus();
        }
      });
    });

    // Save
    const handleServicesSave = async (e: Event) => {
      e.preventDefault();

      // Collect data from form
      const heading = (form.querySelector('[name="heading"]') as HTMLInputElement).value;
      const serviceItems: ServiceItem[] = [];

      panel.querySelectorAll('.service-item').forEach(item => {
        const icon = (item.querySelector('[data-field="icon"]') as HTMLInputElement).value;
        const title = (item.querySelector('[data-field="title"]') as HTMLInputElement).value;
        const description = (item.querySelector('[data-field="description"]') as HTMLTextAreaElement).value;

        serviceItems.push({ icon, title, description });
      });

      const servicesData: ServicesData = {
        heading,
        list: serviceItems
      };

      emit(EventName.CONFIG_SAVING, undefined);
      const result = await updateServices(servicesData);

      if (result) {
        currentServices = result;
        alert('Services saved successfully!');
        emit(EventName.CONFIG_SAVED, { section: 'services' });
      } else {
        alert('Failed to save services');
      }
    };

    form?.addEventListener('submit', (e) => {
      void handleServicesSave(e);
    });

    // Reset
    const handleServicesReset = async () => {
      if (confirm('Reset all changes?')) {
        const freshData = await getServices();
        if (freshData) {
          currentServices = freshData;
          renderServicesForm();
        }
      }
    };

    resetBtn?.addEventListener('click', () => {
      void handleServicesReset();
    });
  };

  renderServicesForm();

  return () => {
    // Cleanup handled by re-render
  };
}

/**
 * =============================================================================
 * Portfolio Editor
 * =============================================================================
 */

async function initPortfolioEditor(panelId: string): Promise<() => void> {
  const panel = document.getElementById(panelId);
  if (!panel) return () => {};

  // Load current portfolio data
  const portfolio = await getPortfolio();
  if (!portfolio) {
    panel.innerHTML = '<div class="error">Failed to load portfolio data</div>';
    return () => {};
  }

  let currentPortfolio = { ...portfolio };

  const renderPortfolioForm = () => {
    panel.innerHTML = `
      <form class="content-editor__form" id="portfolio-form">
        <div class="content-editor__field">
          <label class="content-editor__label">Section Heading</label>
          <input
            type="text"
            class="content-editor__input"
            name="portfolio_heading"
            value="${currentPortfolio.portfolio_heading}"
            required
            maxlength="200"
          />
        </div>

        <div class="content-editor__array">
          <div class="content-editor__array-header">
            <h3>Portfolio Items</h3>
            <button type="button" class="btn btn--small btn--primary" id="add-portfolio-item">
              + Add Portfolio Item
            </button>
          </div>
          <div id="portfolio-list" class="content-editor__array-list">
            ${currentPortfolio.portfolio_items.map((item, index) => renderPortfolioItem(item, index)).join('')}
          </div>
        </div>

        <div class="content-editor__actions">
          <button type="submit" class="btn btn--primary btn--large">
            💾 Save Portfolio
          </button>
          <button type="button" class="btn btn--secondary" id="portfolio-reset">
            ↺ Reset
          </button>
        </div>
      </form>
    `;

    attachPortfolioListeners();
  };

  const renderPortfolioItem = (item: PortfolioItem, index: number) => `
    <div class="portfolio-item" data-index="${index}">
      <div class="portfolio-item__preview">
        <img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover;" />
      </div>
      <div class="portfolio-item__fields">
        <input
          type="text"
          class="content-editor__input content-editor__input--small"
          placeholder="Image path"
          data-field="image"
          value="${item.image}"
          required
        />
        <input
          type="text"
          class="content-editor__input"
          placeholder="Project name"
          data-field="name"
          value="${item.name}"
          required
        />
        <input
          type="text"
          class="content-editor__input content-editor__input--small"
          placeholder="Category"
          data-field="category"
          value="${item.category}"
          required
        />
        <input
          type="text"
          class="content-editor__input content-editor__input--small"
          placeholder="Link"
          data-field="link"
          value="${item.link}"
          required
        />
        <textarea
          class="content-editor__textarea content-editor__textarea--small"
          placeholder="Description (flip card)"
          data-field="flip_description"
          required
          rows="2"
        >${item.flip_description}</textarea>
        <div class="upload-zone upload-zone--inline" id="portfolio-upload-${index}"></div>
      </div>
      <button type="button" class="btn btn--danger btn--small" data-action="delete" data-index="${index}">
        Delete
      </button>
    </div>
  `;

  const attachPortfolioListeners = () => {
    const form = panel.querySelector('#portfolio-form') as HTMLFormElement;
    const addBtn = panel.querySelector('#add-portfolio-item') as HTMLButtonElement;
    const resetBtn = panel.querySelector('#portfolio-reset') as HTMLButtonElement;

    // Setup image uploaders for each portfolio item
    currentPortfolio.portfolio_items.forEach((_, index) => {
      initImageUploader(`#portfolio-upload-${index}`, {
        multiple: false,
        onUpload: (result) => {
          const item = panel.querySelector(`[data-index="${index}"]`);
          const imageInput = item?.querySelector('[data-field="image"]') as HTMLInputElement;
          if (imageInput && result.original) {
            imageInput.value = result.original.path;
            const preview = item?.querySelector('img') as HTMLImageElement;
            if (preview) preview.src = result.original.url;
          }
        }
      });
    });

    // Add portfolio item
    addBtn?.addEventListener('click', () => {
      currentPortfolio.portfolio_items.push({
        image: 'img/portfolio/placeholder.jpg',
        category: 'New Category',
        name: 'New Project',
        link: '#',
        flip_description: 'Project description'
      });
      renderPortfolioForm();
    });

    // Delete portfolio item
    panel.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset.index || '0');
        if (confirm('Delete this portfolio item?')) {
          currentPortfolio.portfolio_items.splice(index, 1);
          renderPortfolioForm();
        }
      });
    });

    // Save
    const handlePortfolioSave = async (e: Event) => {
      e.preventDefault();

      const heading = (form.querySelector('[name="portfolio_heading"]') as HTMLInputElement).value;
      const portfolioItems: PortfolioItem[] = [];

      panel.querySelectorAll('.portfolio-item').forEach(item => {
        const image = (item.querySelector('[data-field="image"]') as HTMLInputElement).value;
        const name = (item.querySelector('[data-field="name"]') as HTMLInputElement).value;
        const category = (item.querySelector('[data-field="category"]') as HTMLInputElement).value;
        const link = (item.querySelector('[data-field="link"]') as HTMLInputElement).value;
        const flip_description = (item.querySelector('[data-field="flip_description"]') as HTMLTextAreaElement).value;

        portfolioItems.push({ image, name, category, link, flip_description });
      });

      const portfolioData: PortfolioData = {
        portfolio_heading: heading,
        portfolio_items: portfolioItems
      };

      emit(EventName.CONFIG_SAVING, undefined);
      const result = await updatePortfolio(portfolioData);

      if (result) {
        currentPortfolio = result;
        alert('Portfolio saved successfully!');
        emit(EventName.CONFIG_SAVED, { section: 'portfolio' });
      } else {
        alert('Failed to save portfolio');
      }
    };

    form?.addEventListener('submit', (e) => {
      void handlePortfolioSave(e);
    });

    // Reset
    const handlePortfolioReset = async () => {
      if (confirm('Reset all changes?')) {
        const freshData = await getPortfolio();
        if (freshData) {
          currentPortfolio = freshData;
          renderPortfolioForm();
        }
      }
    };

    resetBtn?.addEventListener('click', () => {
      void handlePortfolioReset();
    });
  };

  renderPortfolioForm();

  return () => {
    // Cleanup handled by re-render
  };
}
