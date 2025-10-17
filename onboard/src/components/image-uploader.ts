/**
 * =============================================================================
 * Image Uploader Component (Modular, Progress-Tracked)
 * =============================================================================
 * Drag-and-drop image uploader with progress tracking
 * Integrates with content-api.ts for backend uploads
 * =============================================================================
 */

import { uploadImage, type UploadResult } from '../core/content-api.js';

/**
 * Type alias for uploaded file data (extracted from UploadResult)
 */
export type UploadedFile = UploadResult['upload'];

/**
 * Configuration (Tokenized)
 */
const CONFIG = {
  MAX_FILES: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  DRAG_HOVER_CLASS: 'upload-zone--dragover',
  UPLOADING_CLASS: 'upload-zone--uploading',
  SUCCESS_CLASS: 'upload-zone--success',
  ERROR_CLASS: 'upload-zone--error'
} as const;

/**
 * Upload state for tracking
 */
interface UploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  result?: UploadedFile;
  error?: string;
}

/**
 * Private state
 */
let uploadQueue: UploadState[] = [];
let isUploading = false;

/**
 * Initialize image uploader on an element
 *
 * @param container - Container element or selector
 * @param options - Configuration options
 * @returns Cleanup function
 *
 * @example
 * const cleanup = initImageUploader('#upload-zone', {
 *   onUpload: (result) => console.log('Uploaded:', result),
 *   multiple: true
 * });
 */
export function initImageUploader(
  container: string | HTMLElement,
  options: {
    onUpload?: (result: UploadedFile) => void;
    onBatchComplete?: (results: UploadedFile[]) => void;
    multiple?: boolean;
    autoInsert?: boolean; // Auto-insert image markdown/html into content
  } = {}
): () => void {
  const element = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)
    : container;

  if (!element) {
    console.warn('Upload container not found');
    return () => {};
  }

  // Create uploader UI if not exists
  if (!element.querySelector('.upload-zone__droparea')) {
    element.innerHTML = createUploaderHTML(options.multiple);
  }

  // Get references
  const dropArea = element.querySelector<HTMLElement>('.upload-zone__droparea');
  const fileInput = element.querySelector<HTMLInputElement>('input[type="file"]');
  const progressArea = element.querySelector<HTMLElement>('.upload-zone__progress');

  if (!dropArea || !fileInput) {
    console.warn('Upload components not found');
    return () => {};
  }

  // Configure file input
  fileInput.multiple = options.multiple ?? false;
  fileInput.accept = CONFIG.ALLOWED_TYPES.join(',');

  // Event handlers
  const handlers: Array<[EventTarget, string, EventListener]> = [];

  // Prevent default drag behaviors
  const preventDefault = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefault);
    handlers.push([dropArea, eventName, preventDefault]);
  });

  // Highlight drop area
  const highlight = () => element.classList.add(CONFIG.DRAG_HOVER_CLASS);
  const unhighlight = () => element.classList.remove(CONFIG.DRAG_HOVER_CLASS);

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight);
    handlers.push([dropArea, eventName, highlight]);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight);
    handlers.push([dropArea, eventName, unhighlight]);
  });

  // Handle drop
  const handleDrop = (e: Event) => {
    const dragEvent = e as DragEvent;
    const files = Array.from(dragEvent.dataTransfer?.files || []);
    void handleFiles(files, element, progressArea, options);
  };

  dropArea.addEventListener('drop', handleDrop);
  handlers.push([dropArea, 'drop', handleDrop]);

  // Handle click to browse
  const handleClick = () => fileInput.click();
  dropArea.addEventListener('click', handleClick);
  handlers.push([dropArea, 'click', handleClick]);

  // Handle file selection
  const handleSelect = (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    void handleFiles(files, element, progressArea, options);
  };

  fileInput.addEventListener('change', handleSelect);
  handlers.push([fileInput, 'change', handleSelect]);

  // Return cleanup function
  return () => {
    handlers.forEach(([target, event, handler]) => {
      target.removeEventListener(event, handler);
    });
  };
}

/**
 * Create uploader HTML
 */
function createUploaderHTML(multiple?: boolean): string {
  return `
    <div class="upload-zone__droparea">
      <svg class="upload-zone__icon" width="48" height="48" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
      </svg>
      <p class="upload-zone__text">
        ${multiple
          ? 'Drop images here or click to browse (max 10 files)'
          : 'Drop an image here or click to browse'
        }
      </p>
      <p class="upload-zone__hint">
        Supported: JPEG, PNG, WebP, GIF (max 10MB)
      </p>
      <input type="file" accept="image/*" style="display: none;" />
    </div>
    <div class="upload-zone__progress" style="display: none;">
      <div class="upload-progress">
        <!-- Progress items will be added here -->
      </div>
    </div>
    <div class="upload-zone__results" style="display: none;">
      <!-- Results will be shown here -->
    </div>
  `;
}

/**
 * Handle selected files
 */
async function handleFiles(
  files: File[],
  container: HTMLElement,
  progressArea: HTMLElement | null,
  options: {
    onUpload?: (result: UploadedFile) => void;
    onBatchComplete?: (results: UploadedFile[]) => void;
    multiple?: boolean;
    autoInsert?: boolean;
  }
): Promise<void> {
  // Validate file count
  if (!options.multiple && files.length > 1) {
    files = [files[0]];
  }

  if (files.length > CONFIG.MAX_FILES) {
    alert(`Maximum ${CONFIG.MAX_FILES} files allowed`);
    files = files.slice(0, CONFIG.MAX_FILES);
  }

  // Validate files
  const validFiles = files.filter(file => {
    if (!CONFIG.ALLOWED_TYPES.includes(file.type as typeof CONFIG.ALLOWED_TYPES[number])) {
      console.warn(`Invalid file type: ${file.type}`);
      return false;
    }
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      console.warn(`File too large: ${file.name}`);
      return false;
    }
    return true;
  });

  if (validFiles.length === 0) {
    alert('No valid files selected');
    return;
  }

  // Initialize upload queue
  uploadQueue = validFiles.map(file => ({
    file,
    progress: 0,
    status: 'pending' as const
  }));

  // Show progress area
  if (progressArea) {
    progressArea.style.display = 'block';
    updateProgressDisplay(progressArea);
  }

  container.classList.add(CONFIG.UPLOADING_CLASS);
  isUploading = true;

  // Upload files
  const results: UploadedFile[] = [];

  for (let i = 0; i < uploadQueue.length; i++) {
    const item = uploadQueue[i];
    item.status = 'uploading';
    if (progressArea) updateProgressDisplay(progressArea);

    const result = await uploadImage(item.file, (progress) => {
      item.progress = progress;
      if (progressArea) updateProgressDisplay(progressArea);
    });

    if (result) {
      item.status = 'complete';
      item.result = result;
      results.push(result);

      // Call individual upload callback
      if (options.onUpload) {
        options.onUpload(result);
      }

      // Auto-insert if enabled
      if (options.autoInsert) {
        insertImageIntoContent(result);
      }
    } else {
      item.status = 'error';
      item.error = 'Upload failed';
    }

    if (progressArea) updateProgressDisplay(progressArea);
  }

  // Mark upload as complete
  isUploading = false;
  container.classList.remove(CONFIG.UPLOADING_CLASS);

  // Show results
  setTimeout(() => {
    container.classList.add(CONFIG.SUCCESS_CLASS);
    showResults(container, results);

    // Call batch complete callback
    if (options.onBatchComplete && results.length > 0) {
      options.onBatchComplete(results);
    }

    // Reset after delay
    setTimeout(() => {
      container.classList.remove(CONFIG.SUCCESS_CLASS);
      if (progressArea) progressArea.style.display = 'none';
      uploadQueue = [];
    }, 3000);
  }, 500);
}

/**
 * Update progress display
 */
function updateProgressDisplay(progressArea: HTMLElement): void {
  const progressContainer = progressArea.querySelector('.upload-progress');
  if (!progressContainer) return;

  const itemsHTML = uploadQueue.map((item) => {
    const iconClass = item.status === 'complete' ? 'success'
                    : item.status === 'error' ? 'error'
                    : item.status === 'uploading' ? 'uploading'
                    : 'pending';

    return `
      <div class="upload-progress__item upload-progress__item--${iconClass}">
        <div class="upload-progress__info">
          <span class="upload-progress__name">${item.file.name}</span>
          <span class="upload-progress__size">
            ${(item.file.size / 1024).toFixed(1)} KB
          </span>
        </div>
        <div class="upload-progress__bar">
          <div class="upload-progress__fill" style="width: ${item.progress}%"></div>
        </div>
        <span class="upload-progress__percent">${item.progress}%</span>
      </div>
    `;
  }).join('');

  progressContainer.innerHTML = itemsHTML;
}

/**
 * Show upload results
 */
function showResults(container: HTMLElement, results: UploadedFile[]): void {
  const resultsArea = container.querySelector<HTMLElement>('.upload-zone__results');
  if (!resultsArea || results.length === 0) return;

  const resultsHTML = results.map(result => {
    const savings = result.webp
      ? `${result.webp.compression_ratio.toFixed(1)}% smaller`
      : 'Original format';

    return `
      <div class="upload-result">
        <img
          src="${result.webp?.url || result.original.url}"
          alt="Uploaded image"
          class="upload-result__thumbnail"
        />
        <div class="upload-result__info">
          <p class="upload-result__size">
            ${result.original.width} × ${result.original.height}px
          </p>
          <p class="upload-result__savings">${savings}</p>
        </div>
      </div>
    `;
  }).join('');

  resultsArea.innerHTML = `
    <h4 class="upload-zone__results-title">
      Uploaded ${results.length} ${results.length === 1 ? 'image' : 'images'}
    </h4>
    <div class="upload-results-grid">
      ${resultsHTML}
    </div>
  `;

  resultsArea.style.display = 'block';

  // Hide after delay
  setTimeout(() => {
    resultsArea.style.display = 'none';
  }, 5000);
}

/**
 * Auto-insert image into content editor
 */
function insertImageIntoContent(result: UploadedFile): void {
  const contentArea = document.querySelector<HTMLTextAreaElement>('#content-body');
  if (!contentArea) return;

  const imageUrl = result.webp?.url || result.original.url;
  const imageMarkdown = `\n![Image](${imageUrl})\n`;

  // Insert at cursor position or end
  const start = contentArea.selectionStart;
  const end = contentArea.selectionEnd;
  const text = contentArea.value;

  contentArea.value = text.substring(0, start) + imageMarkdown + text.substring(end);

  // Move cursor after inserted text
  contentArea.selectionStart = contentArea.selectionEnd = start + imageMarkdown.length;
  contentArea.focus();

  // Trigger input event for change tracking
  contentArea.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Get current upload status
 */
export function getUploadStatus(): {
  isUploading: boolean;
  queue: UploadState[];
  progress: number;
} {
  const totalProgress = uploadQueue.length > 0
    ? uploadQueue.reduce((sum, item) => sum + item.progress, 0) / uploadQueue.length
    : 0;

  return {
    isUploading,
    queue: [...uploadQueue],
    progress: totalProgress
  };
}