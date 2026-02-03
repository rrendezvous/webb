// --- Global State ---
const state = {
  currentSection: 'home',
  activeMobileDropdown: null
};

// --- DOM Elements ---
const elements = {
  header: document.getElementById('header'),
  sidebar: document.getElementById('sidebar'),
  overlay: document.getElementById('overlay'),
  mobileToggleButton: document.querySelector('.toggle-btn'),
  backToTopButton: document.getElementById('back-to-top'),
  mainContent: document.getElementById('main-content')
};

// --- Utility Functions ---
/**
 * Safely get DOM element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} - DOM element or null
 */
const getElement = (id) => document.getElementById(id);

/**
 * Safely add event listener to element
 * @param {HTMLElement|null} element - DOM element
 * @param {string} event - Event name
 * @param {Function} callback - Event handler
 * @param {Object} [options] - Event options
 */
const addSafeEventListener = (element, event, callback, options = {}) => {
  if (element) element.addEventListener(event, callback, options);
};

// --- Navigation Functions ---
/**
 * Closes all open desktop dropdown menus
 */
function closeAllDesktopDropdowns() {
  document.querySelectorAll('.desktop-dropdown.open').forEach(dropdown => {
    dropdown.classList.remove('open');
    const trigger = dropdown.querySelector('.dropdown-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
  window.removeEventListener('click', closeDropdownOnClickOutside);
}

/**
 * Closes desktop dropdowns when clicking outside
 * @param {Event} event - Click event
 */
function closeDropdownOnClickOutside(event) {
  if (!event.target.closest('.desktop-dropdown')) {
    closeAllDesktopDropdowns();
  }
}

/**
 * Toggles a specific desktop dropdown menu
 * @param {string} id - Dropdown element ID
 */
function toggleDesktopDropdown(id) {
  const dropdown = getElement(id);
  if (!dropdown) return;
  
  const trigger = dropdown.querySelector('.dropdown-trigger');
  const isOpen = dropdown.classList.contains('open');

  // Close other dropdowns first if opening this one
  if (!isOpen) closeAllDesktopDropdowns();

  // Toggle current dropdown
  dropdown.classList.toggle('open');
  if (trigger) trigger.setAttribute('aria-expanded', String(!isOpen));

  // Add/remove listener for closing on outside click
  if (!isOpen) {
    setTimeout(() => window.addEventListener('click', closeDropdownOnClickOutside), 0);
  } else {
    window.removeEventListener('click', closeDropdownOnClickOutside);
  }
}

/**
 * Opens the mobile sidebar navigation
 */
function openSidebar() {
  const { sidebar, overlay, mobileToggleButton } = elements;
  if (!sidebar || !overlay || !mobileToggleButton) return;
  
  document.body.style.overflow = 'hidden';
  overlay.classList.add('visible');
  overlay.setAttribute('aria-hidden', 'false');
  sidebar.classList.add('open');
  sidebar.setAttribute('aria-hidden', 'false');
  mobileToggleButton.setAttribute('aria-expanded', 'true');
  
  // Focus first focusable element in sidebar
  sidebar.querySelector('a, button')?.focus();
}

/**
 * Closes the mobile sidebar navigation
 */
function closeSidebar() {
  const { sidebar, overlay, mobileToggleButton } = elements;
  if (!sidebar || !overlay || !mobileToggleButton) return;
  
  overlay.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');
  sidebar.classList.remove('open');
  sidebar.setAttribute('aria-hidden', 'true');
  mobileToggleButton.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  mobileToggleButton.focus();
}

/**
 * Toggles a specific mobile dropdown within the sidebar
 * @param {HTMLButtonElement} buttonElement - Dropdown trigger button
 */
function toggleMobileDropdown(buttonElement) {
  const container = buttonElement.nextElementSibling;
  if (!container) return;
  
  const isOpening = !container.classList.contains('open');

  // Close other dropdowns if opening this one
  if (isOpening && state.activeMobileDropdown && state.activeMobileDropdown !== container) {
    const otherBtn = state.activeMobileDropdown.previousElementSibling;
    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
    state.activeMobileDropdown.classList.remove('open');
    state.activeMobileDropdown.style.maxHeight = null;
  }

  // Toggle current dropdown
  buttonElement.setAttribute('aria-expanded', String(isOpening));
  container.classList.toggle('open', isOpening);

  // Animate height
  if (isOpening) {
    container.style.maxHeight = `${container.scrollHeight}px`;
    state.activeMobileDropdown = container;
  } else {
    container.style.maxHeight = null;
    if (state.activeMobileDropdown === container) {
      state.activeMobileDropdown = null;
    }
  }
}

/**
 * Updates active navigation states in desktop and mobile menus
 * @param {string} activeId
 */
function updateNavActiveState(activeId) {
  // Reset all active states
  const selectors = {
    links: '.desktop-nav a, .desktop-dropdown-content a, .mobile-nav a, .dropdown-container a',
    mobileButtons: '.mobile-nav .dropdown-btn',
    desktopTriggers: '.desktop-dropdown .dropdown-trigger'
  };

  document.querySelectorAll(selectors.links).forEach(link => link.removeAttribute('aria-current'));
  document.querySelectorAll(selectors.mobileButtons).forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll(selectors.desktopTriggers).forEach(trigger => trigger.classList.remove('has-active-child'));

  // Set active state for current section
  const activeDesktopLink = getElement(`${activeId}-link`);
  const activeMobileLink = getElement(`${activeId}-mobile`);

  if (activeDesktopLink) activeDesktopLink.setAttribute('aria-current', 'page');
  if (activeMobileLink) activeMobileLink.setAttribute('aria-current', 'page');

  // Handle parent dropdown active states
  const activeLinkParentDesktop = activeDesktopLink?.closest('.desktop-dropdown-content');
  const activeLinkParentMobile = activeMobileLink?.closest('.dropdown-container');

  // Desktop dropdown parent
  if (activeLinkParentDesktop) {
    const parentTrigger = activeLinkParentDesktop.closest('.desktop-dropdown')?.querySelector('.dropdown-trigger');
    if (parentTrigger) parentTrigger.classList.add('has-active-child');
  }

  // Mobile dropdown parent
  if (activeLinkParentMobile) {
    const parentBtn = activeLinkParentMobile.previousElementSibling;
    if (parentBtn?.classList.contains('dropdown-btn')) {
      parentBtn.classList.add('active');
    }
  }
}

/**
 * Shows specified section and hides others
 * @param {string} id - Section ID to show
 * @param {boolean} [isPopState=false] - If call is from history navigation
 */
/**
 * Smoothly scrolls to the specified section
 * @param {string} id - Section ID to scroll to
 */
/**
 * Smoothly scrolls to the specified section for a single-page experience
 * @param {string} id - Section ID to scroll to
 */
/**
 * Smoothly scrolls to the specified section for a single-page experience
 * @param {string} id - Section ID to scroll to
 */
function showSection(id) {
  const targetSection = getElement(id);
  
  if (targetSection) {
    // 1. Calculate spacing for your fixed header dynamically
    const headerHeight = elements.header ? elements.header.offsetHeight : 80;
    const elementPosition = targetSection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    // 2. Execute smooth scroll
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });

    // 3. Update URL hash without jumping the page
    window.history.pushState({ section: id }, '', `#${id}`);
    
    // 4. Update the Nav highlights
    updateNavActiveState(id);
    state.currentSection = id;
  }

  // 5. Close menus automatically
  if (elements.sidebar?.classList.contains('open')) {
    closeSidebar();
  }
  closeAllDesktopDropdowns();
}

// --- UI Effects & Handlers ---

/**
 * Handles scroll effects (header, back-to-top button)
 */
/**
 * Handles scroll effects (header, back-to-top button, and ScrollSpy)
 */
function handleScroll() {
  const { header, backToTopButton } = elements;
  const currentScrollY = window.scrollY;
  
  if (header) {
    header.classList.toggle('scrolled', currentScrollY > 50);
  }
  
  if (backToTopButton) {
    backToTopButton.classList.toggle('visible', currentScrollY > 300);
  }

  // This MUST be here for the Nav highlights to work
  handleScrollSpy();
}

/**
 * Simulates message sending and provides immediate feedback
 * @param {Event} e - Submit event
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formStatus = getElement('form-status');
  const submitButton = form.querySelector('.submit-btn');
  
  // Show "Sending" state
  formStatus.textContent = 'Sending message...';
  formStatus.className = 'sending';
  submitButton.disabled = true;

  // Send the data to Formspree
  const response = await fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  });

  if (response.ok) {
    formStatus.textContent = "Thanks! Your message has been sent to my email.";
    formStatus.className = 'success';
    form.reset();
  } else {
    formStatus.textContent = "Oops! There was a problem sending your message.";
    formStatus.className = 'error';
  }
  
  submitButton.disabled = false;
}

/**
 * Handles input events on form fields for real-time validation
 * @param {Event} e - Input event
 */
function handleFormInput(e) {
  const input = e.target;
  
  // Clear error styling if field becomes valid
  if (input.style.borderColor.includes('239, 68, 68') || input.style.borderColor === '#ef4444') {
    if (input.checkValidity() && input.value.trim()) {
      input.style.borderColor = '';
      
      const form = input.closest('form');
      const formStatus = getElement('form-status');
      
      // Clear error message if all fields are now valid
      if (form && formStatus && formStatus.className === 'error') {
        const invalidFields = form.querySelectorAll('[required]:invalid, [style*="border-color: rgb(239, 68, 68)"], [style*="border-color: #ef4444"]');
        if (invalidFields.length === 0) {
          formStatus.textContent = '';
          formStatus.className = '';
        }
      }
    }
  }
}

/**
 * Setup lazy loading for images with improved mobile support
 */
function setupLazyLoading() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if (lazyImages.length === 0) return;
  
  // For browsers without IntersectionObserver, load all images immediately
  if (!('IntersectionObserver' in window)) {
    lazyImages.forEach(img => {
      if (img.dataset.src) img.src = img.dataset.src;
      img.removeAttribute('loading');
      img.style.opacity = 1;
    });
    return;
  }
  
  const lazyImageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Set initial loading state
        img.style.transition = 'opacity 0.3s ease-in-out';
        img.style.opacity = 0;
        
        const loadImage = () => {
          return new Promise((resolve) => {
            const newImg = new Image();
            
            newImg.onload = () => {
              // Image loaded successfully
              if (img.dataset.src) {
                img.src = img.dataset.src;
              }
              img.removeAttribute('loading');
              img.style.opacity = 1;
              img.classList.add('loaded');
              resolve(true);
            };
            
            newImg.onerror = () => {
              // Image failed to load, still show it
              if (img.dataset.src) {
                img.src = img.dataset.src;
              }
              img.removeAttribute('loading');
              img.style.opacity = 1;
              img.classList.add('loaded');
              img.classList.add('error');
              console.warn('Image failed to load:', img.dataset.src || img.src);
              resolve(false);
            };
            
            // Start loading
            newImg.src = img.dataset.src || img.src;
          });
        };
        
        // Check if image is already cached/loaded
        if (img.complete && img.naturalHeight !== 0) {
          img.style.opacity = 1;
          img.classList.add('loaded');
          observer.unobserve(img);
          return;
        }
        
        // Load the image
        loadImage().finally(() => {
          observer.unobserve(img);
        });
        
        // Mobile fallback timeout
        setTimeout(() => {
          if (!img.classList.contains('loaded') && !img.classList.contains('error')) {
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            img.removeAttribute('loading');
            img.style.opacity = 1;
            img.classList.add('loaded');
          }
        }, 1500);
      }
    });
  }, { 
    rootMargin: '100px 0px 100px 0px', // Increased margin for better mobile performance
    threshold: 0.01 // Lower threshold for better detection
  });

  lazyImages.forEach(img => {
    // For images already in viewport or cached, show immediately
    if (img.complete && img.naturalHeight !== 0) {
      img.style.opacity = 1;
      img.classList.add('loaded');
      return;
    }
    
    // Set initial state for lazy loading
    img.style.opacity = 0;
    lazyImageObserver.observe(img);
  });
}

/**
 * Setup animations using Intersection Observer
 */
/**
 * Setup animations using Intersection Observer for a premium reveal effect
 */
function setupScrollAnimations() {
  const animTargets = document.querySelectorAll('.reveal, .project-card, .service-card, .bento-card');
  
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers: show everything
    animTargets.forEach(el => el.style.opacity = "1");
    return;
  }
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Optional: stop observing once it has appeared
        // observer.unobserve(entry.target); 
      }
    });
  }, { 
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px" // Triggers slightly before the element hits the view
  });

  animTargets.forEach(el => scrollObserver.observe(el));
}

/**
 * Set up mobile navigation dropdown accessibility
 */
function setupMobileNavDropdowns() {
  const dropdownBtns = document.querySelectorAll('.mobile-nav .dropdown-btn');
  
  dropdownBtns.forEach(btn => {
    const container = btn.nextElementSibling;
    
    // Setup accessibility attributes
    if (!btn.id) {
      btn.id = `mobile-dd-btn-${Math.random().toString(36).substring(2, 9)}`;
    }
    
    if (container?.classList.contains('dropdown-container')) {
      if (!container.id) {
        container.id = `mobile-dd-container-${Math.random().toString(36).substring(2, 9)}`;
      }
      btn.setAttribute('aria-controls', container.id);
      container.setAttribute('aria-labelledby', btn.id);
      
      // Add click event
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileDropdown(btn);
      });
    } else {
      console.warn('Dropdown container not found for button:', btn);
    }
  });
}

/**
 * Initialize page based on URL hash
 */
function initPageFromHash() {
  const initialHash = window.location.hash.substring(1);
  let initialSectionId = 'home';
  
  if (initialHash && getElement(initialHash)) {
    initialSectionId = initialHash;
  } else if (initialHash) {
    console.warn(`Section for hash "#${initialHash}" not found. Loading home section.`);
    try {
      window.location.hash = '#home';
    } catch (e) {
      console.warn('Unable to reset location hash');
    }
  }

  // Set initial state and replace history entry
  showSection(initialSectionId, true);
  
  try {
    window.history.replaceState({ section: initialSectionId }, '', `#${initialSectionId}`);
  } catch(e) {
    console.warn('History API replaceState not supported or restricted.');
  }
}

// --- Event Listeners & Initialization ---

/**
 * Set up all event listeners
 */
/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // 1. Existing Scroll event
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // 2. Existing History navigation
  window.addEventListener('popstate', (event) => {
    let targetSectionId = 'home';
    if (event.state?.section) {
      targetSectionId = event.state.section;
    } else {
      const hash = window.location.hash.substring(1);
      if (hash && getElement(hash)) {
        targetSectionId = hash;
      }
    }
    showSection(targetSectionId, true);
  });
  
  // 3. Existing Back to top button
  addSafeEventListener(elements.backToTopButton, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // --- THE FIX STARTS HERE ---
  // 4. Contact form logic: Find the form by the ID 'contactForm' from your HTML
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    // Correctly attach the submit handler
    contactForm.addEventListener('submit', handleFormSubmit);
    
    // Correctly attach validation to each required input
    contactForm.querySelectorAll('[required]').forEach(input => {
      input.addEventListener('input', handleFormInput);
    });
  }
}

/**
 * Initialize the application
 */
function init() {
  // Update copyright year
  const currentYearSpan = getElement('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
  
  setupMobileNavDropdowns();
  initPageFromHash();
  setupScrollAnimations();
  setupLazyLoading();
  setupEventListeners();
  
  // Initial scroll handler call to set correct states
  handleScroll();
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Simple fade transition for View Details links
document.addEventListener('DOMContentLoaded', function() {
  // Find all "View Details" links (adjust selector as needed)
  const viewDetailsLinks = document.querySelectorAll('a[href*="details"], .project-links a:first-child');
  
  viewDetailsLinks.forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Add transition class to body
          document.body.classList.add('transitioning');
          document.body.classList.add('view-details-transition');
          
          // Navigate after transition
          setTimeout(() => {
              window.location.href = this.href;
          }, 300);
      });
  });
});

let typewriterCompletionTimeout;

function runTypewriterAnimation() {
  const typewriter = document.querySelector('.typewriter');
  const underline = document.querySelector('.home-underline');
  if (!typewriter) return;

  // Clear any pending completion timeout from previous runs
  if (typewriterCompletionTimeout) {
    clearTimeout(typewriterCompletionTimeout);
    typewriterCompletionTimeout = null;
  }

  // Wrap content once so we can reveal text without layout shifting
  let textWrap = typewriter.querySelector('.tw-text');
  if (!textWrap) {
    textWrap = document.createElement('span');
    textWrap.className = 'tw-text';
    while (typewriter.firstChild) {
      textWrap.appendChild(typewriter.firstChild);
    }
    typewriter.appendChild(textWrap);
  }

  // 1. Clear previous state
  textWrap.style.animation = 'none';
  textWrap.style.borderRight = '';
  typewriter.classList.remove('is-typing', 'ready');
  typewriter.offsetHeight; // Force reflow
  // Set the final width for a true "typing" reveal
  typewriter.style.setProperty('--tw-width', `${textWrap.scrollWidth}px`);
  typewriter.style.setProperty('--tw-steps', '40');
  // Keep original smooth timing
  typewriter.style.setProperty('--tw-duration', '3.5s');
  typewriter.style.width = `${textWrap.scrollWidth}px`;

  // Compute offset so the underline sits under "Hi" while the line is centered
  const computed = window.getComputedStyle(typewriter);
  const measurer = document.createElement('span');
  measurer.textContent = 'Hi';
  measurer.style.position = 'absolute';
  measurer.style.visibility = 'hidden';
  measurer.style.whiteSpace = 'nowrap';
  measurer.style.font = computed.font;
  measurer.style.letterSpacing = computed.letterSpacing;
  document.body.appendChild(measurer);
  const hiWidth = measurer.getBoundingClientRect().width;
  measurer.remove();
  const fullWidth = textWrap.scrollWidth || 0;
  const hiOffset = (hiWidth - fullWidth) / 2 - 14;
  if (underline) {
    underline.style.setProperty('--hi-offset', `${hiOffset}px`);
  }
  
  // 2. Re-apply animation with the 'forwards' logic
  typewriter.classList.add('ready', 'is-typing');
  textWrap.style.animation = 'typing 3.5s steps(var(--tw-steps, 40), end) forwards, blink-caret 0.75s step-end infinite';

  // 3. Optional: Remove the cursor after it's done so it looks clean
  typewriterCompletionTimeout = setTimeout(() => {
    textWrap.style.borderRight = 'none';
  }, 3500); 
}

function triggerTypewriterAnimation() {
  const run = () => requestAnimationFrame(runTypewriterAnimation);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run);
  } else {
    run();
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', triggerTypewriterAnimation);

// Run again whenever "Home" is clicked
document.querySelectorAll('a[href="#home"]').forEach(link => {
  link.addEventListener('click', () => {
    setTimeout(triggerTypewriterAnimation, 10); // slight delay allows view to update
  });
});

// Recalculate on width resize only (prevents mobile scroll glitch)
let typewriterResizeTimer;
let lastWindowWidth = window.innerWidth;

window.addEventListener('resize', () => {
  if (window.innerWidth === lastWindowWidth) return;
  lastWindowWidth = window.innerWidth;
  
  clearTimeout(typewriterResizeTimer);
  typewriterResizeTimer = setTimeout(triggerTypewriterAnimation, 150);
});

/**
 * Automatically updates navigation links based on scroll position
 */
function handleScrollSpy() {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
  
  // Calculate the current scroll position + header offset
  const headerHeight = elements.header ? elements.header.offsetHeight : 80;
  const scrollPosition = window.scrollY + headerHeight + 100; // Added extra buffer for better detection

  let currentSectionId = 'home';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    
    // Check if the scroll position is within the boundaries of this section
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSectionId = section.getAttribute('id');
    }
  });

  // Special check: If at the very bottom of the page, force 'contact'
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
    currentSectionId = 'contact';
  }

  if (state.currentSection !== currentSectionId) {
    state.currentSection = currentSectionId;
    updateNavActiveState(currentSectionId);
  }
}
