/*!
 * Start Bootstrap - Creative Bootstrap Theme (http://startbootstrap.com)
 * Modernized for Bootstrap 5 and Vanilla JavaScript (2025)
 * Original code licensed under the Apache License v2.0.
 */

(function() {
    "use strict";

    // =============================================================================
    // Storage Utilities with Private Browsing Detection
    // =============================================================================
    const storage = {
        get: function(key) {
            try {
                return localStorage.getItem(key) || sessionStorage.getItem(key);
            } catch (e) {
                // Private browsing mode - use in-memory fallback
                return this.memory[key] || null;
            }
        },
        set: function(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                // Fallback to sessionStorage, then memory
                try {
                    sessionStorage.setItem(key, value);
                } catch (e2) {
                    this.memory[key] = value;
                }
            }
        },
        memory: {} // In-memory fallback for private browsing
    };

    // =============================================================================
    // Smooth Scroll for Navigation Links
    // =============================================================================
    function initSmoothScroll() {
        const scrollLinks = document.querySelectorAll('a.page-scroll');

        scrollLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 50;

                    // Smooth scroll with easing (native CSS smooth behavior)
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // =============================================================================
    // Navbar Scrollspy (Bootstrap 5 Native)
    // =============================================================================
    function initScrollSpy() {
        const scrollSpyElement = document.body;
        if (scrollSpyElement) {
            // Bootstrap 5 ScrollSpy initialization
            const scrollSpy = new bootstrap.ScrollSpy(scrollSpyElement, {
                target: '.navbar',
                offset: 51
            });
        }
    }

    // =============================================================================
    // Mobile Menu Auto-Close
    // =============================================================================
    function initMobileMenuClose() {
        const navLinks = document.querySelectorAll('.navbar-collapse ul li a');
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Check if navbar toggler is visible (mobile view)
                if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                    // Use Bootstrap 5 Collapse API
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    }
                }
            });
        });
    }

    // =============================================================================
    // Responsive Text Sizing (Replaces fitText.js)
    // =============================================================================
    function initResponsiveText() {
        const headers = document.querySelectorAll('h1');

        function resizeText() {
            headers.forEach(header => {
                const containerWidth = header.parentElement.offsetWidth;
                let fontSize = containerWidth / 10; // Base calculation

                // Clamp between min and max
                fontSize = Math.max(35, Math.min(65, fontSize));
                header.style.fontSize = fontSize + 'px';
            });
        }

        // Initial resize and on window resize
        resizeText();
        window.addEventListener('resize', resizeText);
    }

    // =============================================================================
    // Sticky Navbar (Replaces jQuery affix)
    // =============================================================================
    function initStickyNav() {
        const mainNav = document.getElementById('mainNav');

        if (mainNav) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 100) {
                    mainNav.classList.add('navbar-shrink');
                } else {
                    mainNav.classList.remove('navbar-shrink');
                }
            });
        }
    }

    // =============================================================================
    // WOW.js Scroll Animations
    // =============================================================================
    function initScrollAnimations() {
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }
    }

    // =============================================================================
    // Portfolio Flip Functionality
    // =============================================================================
    function initPortfolioFlip() {
        const flipContainers = document.querySelectorAll('.portfolio-flip-container');

        flipContainers.forEach(container => {
            container.addEventListener('click', function(e) {
                e.preventDefault();
                this.classList.toggle('flipped');
            });
        });
    }

    // =============================================================================
    // Theme Toggle Functionality
    // =============================================================================
    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;
        const configTheme = html.getAttribute('data-config-theme') || 'light';

        // Get stored theme or use config default
        const getStoredTheme = () => storage.get('theme') || configTheme;

        // Apply theme to document
        const applyTheme = (theme) => {
            html.setAttribute('data-theme', theme);
            storage.set('theme', theme);

            // Update button icon visibility
            updateThemeIcon(theme);
        };

        // Update icon based on current theme
        const updateThemeIcon = (theme) => {
            if (!themeToggle) return;

            const lightIcon = themeToggle.querySelector('.theme-icon-light');
            const darkIcon = themeToggle.querySelector('.theme-icon-dark');

            if (theme === 'dark') {
                lightIcon?.classList.remove('active');
                darkIcon?.classList.add('active');
            } else {
                lightIcon?.classList.add('active');
                darkIcon?.classList.remove('active');
            }
        };

        // Initialize theme on load
        const initialTheme = getStoredTheme();
        applyTheme(initialTheme);

        // Toggle theme on button click
        if (themeToggle) {
            themeToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                applyTheme(newTheme);
            });
        }
    }

    // =============================================================================
    // Copy Watermark - Accessibility-Friendly Attribution
    // =============================================================================
    function initCopyWatermark() {
        // Configuration - can be customized
        const config = {
            minLength: 40, // Minimum text length to add watermark
            enableWatermark: storage.get('enableCopyWatermark') !== 'false', // Default enabled
            siteName: document.title || 'William M. Orr - Professional Portfolio',
            siteUrl: window.location.origin,
            attributionText: '\n\n---\nSource: {title}\nURL: {url}\n© William M. Orr - williammorr.com'
        };

        // Only proceed if watermarking is enabled
        if (!config.enableWatermark) return;

        // Handle copy events
        document.addEventListener('copy', function(e) {
            try {
                // Get selected text
                const selection = window.getSelection();
                if (!selection.rangeCount) return;

                const selectedText = selection.toString();

                // Only add watermark for substantial text copies
                if (selectedText.length < config.minLength) return;

                // Check if copying from input/textarea (don't watermark form fields)
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA')) {
                    return;
                }

                // Check if copying from code blocks (be gentle with code)
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer.nodeType === 3
                    ? range.commonAncestorContainer.parentNode
                    : range.commonAncestorContainer;

                if (container.closest('pre') || container.closest('code')) {
                    // For code blocks, use a lighter attribution
                    const codeAttribution = '\n\n// Source: ' + window.location.href;
                    e.clipboardData.setData('text/plain', selectedText + codeAttribution);
                    e.preventDefault();
                    return;
                }

                // Build attribution text
                const attribution = config.attributionText
                    .replace('{title}', config.siteName)
                    .replace('{url}', window.location.href);

                // Add watermark to clipboard
                e.clipboardData.setData('text/plain', selectedText + attribution);
                e.preventDefault();

                // Optional: Visual feedback (subtle notification)
                showCopyNotification();

            } catch (error) {
                // Fail silently to not break copy functionality
                console.error('Copy watermark error:', error);
            }
        });

        // Optional: Visual feedback when text is copied
        function showCopyNotification() {
            // Check if notification already exists
            if (document.querySelector('.copy-notification')) return;

            const notification = document.createElement('div');
            notification.className = 'copy-notification';
            notification.textContent = 'Content copied with attribution';
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--color-primary, #333);
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            `;

            document.body.appendChild(notification);

            // Fade in
            requestAnimationFrame(() => {
                notification.style.opacity = '0.9';
            });

            // Remove after 2 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }

        // Optional: Add toggle control to enable/disable watermarking
        const watermarkToggle = document.getElementById('watermark-toggle');
        if (watermarkToggle) {
            watermarkToggle.addEventListener('click', function(e) {
                e.preventDefault();
                const isEnabled = storage.get('enableCopyWatermark') !== 'false';
                storage.set('enableCopyWatermark', isEnabled ? 'false' : 'true');
                window.location.reload(); // Simple reload to apply changes
            });
        }
    }

    // =============================================================================
    // Initialize All Features on DOM Ready
    // =============================================================================
    function init() {
        initSmoothScroll();
        initScrollSpy();
        initMobileMenuClose();
        initResponsiveText();
        initStickyNav();
        initScrollAnimations();
        initPortfolioFlip();
        initThemeToggle();
        initCopyWatermark();
    }

    // DOM Ready Event
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();