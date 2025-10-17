/**
 * =============================================================================
 * Content API Client (Aligned with Roda API)
 * =============================================================================
 * Handles content management operations for hero, services, and portfolio
 * Communicates with Ruby Roda API server on port 4001
 * =============================================================================
 */

import {
  isApiError
} from '../types/content.types.js';
import type {
  HeroData,
  ServicesData,
  PortfolioData,
  HeroApiResponse,
  ServicesApiResponse,
  PortfolioApiResponse,
  ApiErrorResponse
} from '../types/content.types.js';
import { EventName } from '../types/events.types.js';
import { emit } from './event-bus.js';

/**
 * API Configuration (Tokenized)
 */
const API_CONFIG = {
  BASE_URL: 'http://localhost:4001',
  TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
} as const;

/**
 * API Endpoints (Matching Roda routes)
 */
const ENDPOINTS = {
  HERO: `${API_CONFIG.BASE_URL}/api/content/hero`,
  SERVICES: `${API_CONFIG.BASE_URL}/api/content/services`,
  PORTFOLIO: `${API_CONFIG.BASE_URL}/api/content/portfolio`,
  UPLOAD: `${API_CONFIG.BASE_URL}/api/upload`
} as const;

/**
 * Upload result interface
 */
export interface UploadResult {
  success: boolean;
  upload: {
    original: {
      url: string;
      path: string;
      size: number;
      mime_type: string;
      width: number;
      height: number;
    };
    webp?: {
      url: string;
      path: string;
      size: number;
      width: number;
      height: number;
      compression_ratio: number;
    };
    thumbnails?: {
      small?: { url: string; path: string; width: number; height: number };
      medium?: { url: string; path: string; width: number; height: number };
      large?: { url: string; path: string; width: number; height: number };
    };
  };
}

/**
 * =============================================================================
 * Hero Section API
 * =============================================================================
 */

/**
 * Get hero section content
 *
 * @returns Hero data or null if failed
 *
 * @example
 * const hero = await getHero();
 * if (hero) {
 *   console.log(hero.heading, hero.description);
 * }
 */
export async function getHero(): Promise<HeroData | null> {
  try {
    const response = await fetch(ENDPOINTS.HERO);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as HeroApiResponse | ApiErrorResponse;

    if (isApiError(data)) {
      throw new Error(data.error);
    }

    return data.hero;
  } catch (error) {
    console.error('Failed to get hero:', error);
    emit(EventName.CONFIG_ERROR, {
      error: error as Error,
      operation: 'getHero'
    });
    return null;
  }
}

/**
 * Update hero section
 *
 * @param heroData - Updated hero data
 * @returns Updated hero data or null if failed
 *
 * @example
 * const updated = await updateHero({
 *   heading: 'New Heading',
 *   description: 'New description',
 *   button_text: 'Click me',
 *   button_link: '#services',
 *   background_image: 'img/header.jpg'
 * });
 */
export async function updateHero(heroData: HeroData): Promise<HeroData | null> {
  try {
    const response = await fetch(ENDPOINTS.HERO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hero: heroData })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as HeroApiResponse | ApiErrorResponse;

    if (isApiError(data)) {
      throw new Error(data.message || data.error);
    }

    emit(EventName.CONFIG_SAVED, { section: 'hero', data: heroData });
    return data.hero;
  } catch (error) {
    console.error('Failed to update hero:', error);
    emit(EventName.CONFIG_ERROR, {
      error: error as Error,
      operation: 'updateHero'
    });
    return null;
  }
}

/**
 * =============================================================================
 * Services Section API
 * =============================================================================
 */

/**
 * Get services section content
 *
 * @returns Services data or null if failed
 *
 * @example
 * const services = await getServices();
 * if (services) {
 *   console.log(services.heading, services.list);
 * }
 */
export async function getServices(): Promise<ServicesData | null> {
  try {
    const response = await fetch(ENDPOINTS.SERVICES);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as ServicesApiResponse | ApiErrorResponse;

    if (isApiError(data)) {
      throw new Error(data.error);
    }

    return data.services;
  } catch (error) {
    console.error('Failed to get services:', error);
    emit(EventName.CONFIG_ERROR, {
      error: error as Error,
      operation: 'getServices'
    });
    return null;
  }
}

/**
 * Update services section
 *
 * @param servicesData - Updated services data
 * @returns Updated services data or null if failed
 *
 * @example
 * const updated = await updateServices({
 *   heading: 'Our Services',
 *   list: [
 *     { icon: 'fa-laptop', title: 'Web Dev', description: '...' }
 *   ]
 * });
 */
export async function updateServices(servicesData: ServicesData): Promise<ServicesData | null> {
  try {
    const response = await fetch(ENDPOINTS.SERVICES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services: servicesData })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as ServicesApiResponse | ApiErrorResponse;

    if (isApiError(data)) {
      throw new Error(data.message || data.error);
    }

    emit(EventName.CONFIG_SAVED, { section: 'services', data: servicesData });
    return data.services;
  } catch (error) {
    console.error('Failed to update services:', error);
    emit(EventName.CONFIG_ERROR, {
      error: error as Error,
      operation: 'updateServices'
    });
    return null;
  }
}

/**
 * =============================================================================
 * Portfolio Section API
 * =============================================================================
 */

/**
 * Get portfolio section content
 *
 * @returns Portfolio data or null if failed
 *
 * @example
 * const portfolio = await getPortfolio();
 * if (portfolio) {
 *   console.log(portfolio.portfolio_heading, portfolio.portfolio_items);
 * }
 */
export async function getPortfolio(): Promise<PortfolioData | null> {
  try {
    const response = await fetch(ENDPOINTS.PORTFOLIO);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as PortfolioApiResponse | ApiErrorResponse;

    if (isApiError(data)) {
      throw new Error(data.error);
    }

    return data.portfolio;
  } catch (error) {
    console.error('Failed to get portfolio:', error);
    emit(EventName.CONFIG_ERROR, {
      error: error as Error,
      operation: 'getPortfolio'
    });
    return null;
  }
}

/**
 * Update portfolio section
 *
 * @param portfolioData - Updated portfolio data
 * @returns Updated portfolio data or null if failed
 *
 * @example
 * const updated = await updatePortfolio({
 *   portfolio_heading: 'My Work',
 *   portfolio_items: [
 *     {
 *       image: 'img/portfolio/1.jpg',
 *       category: 'Web',
 *       name: 'Project 1',
 *       link: '#',
 *       flip_description: 'Cool project'
 *     }
 *   ]
 * });
 */
export async function updatePortfolio(portfolioData: PortfolioData): Promise<PortfolioData | null> {
  try {
    const response = await fetch(ENDPOINTS.PORTFOLIO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio: portfolioData })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as PortfolioApiResponse | ApiErrorResponse;

    if (isApiError(data)) {
      throw new Error(data.message || data.error);
    }

    emit(EventName.CONFIG_SAVED, { section: 'portfolio', data: portfolioData });
    return data.portfolio;
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    emit(EventName.CONFIG_ERROR, {
      error: error as Error,
      operation: 'updatePortfolio'
    });
    return null;
  }
}

/**
 * =============================================================================
 * Image Upload API
 * =============================================================================
 */

/**
 * Upload an image file with progress tracking
 *
 * @param file - File to upload
 * @param onProgress - Progress callback (0-100)
 * @returns Upload result or null if failed
 *
 * @example
 * const result = await uploadImage(file, (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 */
export async function uploadImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult['upload'] | null> {
  // Validate file type
  if (!API_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type as typeof API_CONFIG.ALLOWED_IMAGE_TYPES[number])) {
    emit(EventName.CONFIG_ERROR, {
      error: new Error(`Invalid file type: ${file.type}`),
      operation: 'upload'
    });
    return null;
  }

  // Validate file size
  if (file.size > API_CONFIG.MAX_FILE_SIZE) {
    emit(EventName.CONFIG_ERROR, {
      error: new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB`),
      operation: 'upload'
    });
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as UploadResult;
            if (response.success && response.upload) {
              resolve(response.upload);
            } else {
              reject(new Error('Upload failed'));
            }
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      // Configure and send
      xhr.open('POST', ENDPOINTS.UPLOAD);
      xhr.timeout = API_CONFIG.TIMEOUT;
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Upload failed:', error);
    emit(EventName.CONFIG_ERROR, {
      error: error as Error,
      operation: 'upload'
    });
    return null;
  }
}

/**
 * Batch upload multiple images
 *
 * @param files - Array of files to upload
 * @param onProgress - Progress callback for each file
 * @returns Array of upload results
 *
 * @example
 * const results = await batchUpload(files, (index, progress) => {
 *   console.log(`File ${index + 1}: ${progress}%`);
 * });
 */
export async function batchUpload(
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult['upload'][]> {
  const results: UploadResult['upload'][] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadImage(files[i], (progress) => {
      if (onProgress) {
        onProgress(i, progress);
      }
    });

    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Re-export types for convenience
 */
export type {
  HeroData,
  ServicesData,
  PortfolioData,
  ServiceItem,
  PortfolioItem
} from '../types/content.types.js';
