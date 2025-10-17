/**
 * =============================================================================
 * Content Type Definitions
 * =============================================================================
 * TypeScript types matching _config.yml content structure
 * Used by content editors (hero, services, portfolio)
 * =============================================================================
 */

/**
 * Hero Section
 * Maps to _config.yml: hero:
 */
export interface HeroData {
  heading: string;
  description: string;
  button_text: string;
  button_link: string;
  background_image: string;
}

/**
 * Service Item
 * Individual service in services.list
 */
export interface ServiceItem {
  icon: string;        // Font Awesome class (e.g., 'fa-diamond')
  title: string;
  description: string;
  delay?: string | number; // Animation delay (optional)
}

/**
 * Services Section
 * Maps to _config.yml: services:
 */
export interface ServicesData {
  heading: string;
  list: ServiceItem[];
}

/**
 * Portfolio Item
 * Individual item in portfolio_items array
 */
export interface PortfolioItem {
  image: string;           // Image path (e.g., 'img/portfolio/1.jpg')
  category: string;        // Project category
  name: string;            // Project name/title
  link: string;            // Project link or '#'
  flip_description: string; // Description shown on card flip
}

/**
 * Portfolio Section
 * Maps to _config.yml: portfolio_heading + portfolio_items:
 */
export interface PortfolioData {
  portfolio_heading: string;
  portfolio_items: PortfolioItem[];
}

/**
 * Contact Section
 * Maps to _config.yml: contact:
 */
export interface ContactData {
  heading: string;
  description: string;
}

/**
 * Resume Section
 * Maps to _config.yml: resume:
 */
export interface ResumeData {
  heading: string;
  description: string;
  file_path: string;
  view_button_text: string;
  download_button_text: string;
}

/**
 * API Response Types
 */

export interface ContentApiResponse<T> {
  success: boolean;
  [key: string]: T | boolean; // Flexible for different content types
}

export interface HeroApiResponse {
  success: boolean;
  hero: HeroData;
}

export interface ServicesApiResponse {
  success: boolean;
  services: ServicesData;
}

export interface PortfolioApiResponse {
  success: boolean;
  portfolio: PortfolioData;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  errors?: Record<string, string[]>; // Validation errors
}

/**
 * Validation Error Type
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Content Update Options
 */
export interface ContentUpdateOptions {
  validateOnly?: boolean; // Only validate, don't save
  skipBackup?: boolean;   // Skip backup before write
}

/**
 * Type Guards
 */

export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

export function isHeroResponse(response: unknown): response is HeroApiResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    'hero' in response
  );
}

export function isServicesResponse(response: unknown): response is ServicesApiResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    'services' in response
  );
}

export function isPortfolioResponse(response: unknown): response is PortfolioApiResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    'portfolio' in response
  );
}
