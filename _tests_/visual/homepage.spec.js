// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Visual regression tests for the homepage
 * These tests capture screenshots and compare them to baseline images
 * Run 'pnpm run test:visual:update' to create/update baseline screenshots
 */

test.describe('Homepage Visual Tests', () => {

  test('homepage renders correctly in light mode', async ({ page }) => {
    await page.goto('/');

    // Wait for fonts and images to load
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-light.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('dark mode renders correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click theme toggle
    await page.click('#theme-toggle');

    // Wait for theme transition
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('navigation shrinks on scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(300);

    await expect(page.locator('.nav, .navbar')).toHaveScreenshot('nav-scrolled.png');
  });

  test('portfolio hover overlay appears', async ({ page }) => {
    await page.goto('/#portfolio');
    await page.waitForLoadState('networkidle');

    // Hover over first portfolio item
    const firstPortfolioBox = page.locator('.portfolio-box').first();
    await firstPortfolioBox.hover();
    await page.waitForTimeout(300);

    await expect(firstPortfolioBox).toHaveScreenshot('portfolio-hover.png');
  });

  test('portfolio flip interaction works', async ({ page }) => {
    await page.goto('/#portfolio');
    await page.waitForLoadState('networkidle');

    // Click to flip
    const flippableBox = page.locator('.portfolio-box--flippable').first();
    await flippableBox.click();
    await page.waitForTimeout(600); // Wait for flip animation

    await expect(flippableBox).toHaveScreenshot('portfolio-flipped.png');
  });

  test('button hover state displays correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const primaryButton = page.locator('.btn--primary, .btn-primary').first();
    await primaryButton.hover();
    await page.waitForTimeout(200);

    await expect(primaryButton).toHaveScreenshot('button-hover.png');
  });

  test('services section renders correctly', async ({ page }) => {
    await page.goto('/#services');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#services')).toHaveScreenshot('services-section.png');
  });

  test('resume section displays correctly', async ({ page }) => {
    await page.goto('/#resume');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#resume')).toHaveScreenshot('resume-section.png');
  });

  test('contact section renders correctly', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#contact')).toHaveScreenshot('contact-section.png');
  });

  test('footer displays correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    await expect(page.locator('.footer, footer')).toHaveScreenshot('footer.png');
  });
});

test.describe('Responsive Layout Tests', () => {

  test('mobile navigation toggles correctly', async ({ page }) => {
    // This test only makes sense on mobile viewports
    test.skip(page.viewportSize()?.width > 768, 'Desktop viewport');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click hamburger menu
    const navToggle = page.locator('.navbar-toggler, .nav__toggle');
    if (await navToggle.isVisible()) {
      await navToggle.click();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('mobile-nav-open.png');
    }
  });

  test('portfolio cards stack on mobile', async ({ page }) => {
    test.skip(page.viewportSize()?.width > 768, 'Desktop viewport');

    await page.goto('/#portfolio');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#portfolio')).toHaveScreenshot('portfolio-mobile.png');
  });
});

test.describe('Accessibility Visual Tests', () => {

  test('focus indicators are visible on keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab to first focusable element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    await expect(page).toHaveScreenshot('focus-indicator.png', {
      clip: {
        x: 0,
        y: 0,
        width: 400,
        height: 100,
      },
    });
  });

  test('theme toggle has visible focus', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Focus on theme toggle
    await page.locator('#theme-toggle').focus();
    await page.waitForTimeout(200);

    await expect(page.locator('#theme-toggle')).toHaveScreenshot('theme-toggle-focus.png');
  });
});
