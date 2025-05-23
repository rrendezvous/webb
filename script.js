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
function showSection(id, isPopState = false) {
  let targetId = id;
  let newSection = getElement(targetId);

  // Fallback to home if section doesn't exist
  if (!newSection) {
    console.warn(`Section with ID "${targetId}" not found. Defaulting to "home".`);
    targetId = 'home';
    newSection = getElement(targetId);
    if (!newSection) {
      console.error("Default 'home' section not found. Cannot switch sections.");
      return;
    }
  }

  // Skip if already showing this section
  if (targetId === state.currentSection && newSection.classList.contains('active')) {
    if (!isPopState) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  // Hide current section and show new one
  const currentActiveSection = document.querySelector('.section.active');
  if (currentActiveSection) currentActiveSection.classList.remove('active');
  
  newSection.classList.add('active');
  state.currentSection = targetId;
  updateNavActiveState(targetId);

  // Close menus
  closeAllDesktopDropdowns();
  if (elements.sidebar?.classList.contains('open')) {
    closeSidebar();
  }

  // Update URL and history
  if (!isPopState) {
    const newHash = `#${targetId}`;
    if (window.location.hash !== newHash) {
      try {
        const method = window.history.length <= 2 ? 'replaceState' : 'pushState';
        window.history[method]({ section: targetId }, '', newHash);
      } catch (e) {
        console.warn("History API not supported or restricted.");
        window.location.hash = newHash;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// --- UI Effects & Handlers ---

/**
 * Handles scroll effects (header, back-to-top button)
 */
function handleScroll() {
  const { header, backToTopButton } = elements;
  const currentScrollY = window.scrollY;
  
  // Header effect
  if (header) {
    header.classList.toggle('scrolled', currentScrollY > 50);
  }
  
  // Back to top button visibility
  if (backToTopButton) {
    backToTopButton.classList.toggle('visible', currentScrollY > 300);
  }
}

/**
 * Simulates message sending and provides immediate feedback
 * @param {Event} e - Submit event
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formStatus = getElement('form-status');
  const submitButton = form.querySelector('.submit-btn');
  
  // Get form data for simulation
  const formData = new FormData(form);
  const name = formData.get('name')?.trim() || '';
  const email = formData.get('email')?.trim() || '';
  const subject = formData.get('subject')?.trim() || '';
  const message = formData.get('message')?.trim() || '';
  
  // Validation
  let isValid = true;
  const errors = [];
  const requiredInputs = form.querySelectorAll('[required]');

  requiredInputs.forEach(input => {
    input.style.borderColor = '';
    let inputValid = true;
    const value = input.value.trim();
    const fieldName = input.getAttribute('name') || input.getAttribute('id') || 'field';

    if (!value) {
      inputValid = false;
      errors.push(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
    } else if (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
      inputValid = false;
      errors.push('Please enter a valid email address');
    }

    if (!inputValid) {
      isValid = false;
      input.style.borderColor = '#ef4444';
    }
  });

  if (!isValid) {
    formStatus.textContent = errors[0] || 'Please fill out all required fields correctly.';
    formStatus.className = 'error';
    form.querySelector('[required]:invalid, [style*="border-color: rgb(239, 68, 68)"]')?.focus();
    return;
  }

  // Show sending state
  formStatus.textContent = 'Sending message...';
  formStatus.className = 'sending';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
  }

  // Simulate message processing time
  const processingTime = Math.random() * 1200 + 800;
  
  setTimeout(() => {
    // Simulate successful message send
    const successMessages = [
      `Thank you, ${name}! Your message has been sent successfully. I'll get back to you soon.`,
      `Message sent successfully! Thanks for reaching out, ${name}. I'll respond within 24 hours.`,
      `Your message has been delivered successfully, ${name}! I appreciate you getting in touch.`,
      `Thanks for your message, ${name}! I've received it and will reply shortly.`
    ];
    
    const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
    
    formStatus.textContent = randomMessage;
    formStatus.className = 'success';
    
    // Reset form
    form.reset();
    requiredInputs.forEach(input => {
      input.style.borderColor = '';
    });
    
    // Reset submit button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';
    }

    // Log simulated message
    console.log('📧 Simulated Message Sent:', {
      timestamp: new Date().toISOString(),
      name: name,
      email: email,
      subject: subject,
      message: message,
      status: 'delivered'
    });

    // Clear success message
    setTimeout(() => {
      if (formStatus.className === 'success') {
        formStatus.textContent = '';
        formStatus.className = '';
      }
    }, 8000);
    
  }, processingTime);
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
function setupScrollAnimations() {
  const elementsToAnimate = document.querySelectorAll(
    '.hobby-card, .project-card, .service-card, .about-image, .about-content h3, .about-content p, .contact-item, .contact-form'
  );
  
  if (!('IntersectionObserver' in window) || elementsToAnimate.length === 0) return;
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  elementsToAnimate.forEach(el => {
    if (el) scrollObserver.observe(el);
  });
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
function setupEventListeners() {
  // Scroll event
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // History navigation
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
  
  // Back to top button
  addSafeEventListener(elements.backToTopButton, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // Contact form
  const contactForm = getElement('contactForm');
  addSafeEventListener(contactForm, 'submit', handleFormSubmit);
  
  // Form input validation
  contactForm?.querySelectorAll('[required]').forEach(input => {
    addSafeEventListener(input, 'input', handleFormInput);
  });
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

function runTypewriterAnimation() {
  const typewriter = document.querySelector('.typewriter');
  if (!typewriter) return;

  // Reset animation
  typewriter.classList.remove('typing-complete');
  typewriter.style.animation = 'none';
  typewriter.offsetHeight; // Trigger reflow
  typewriter.style.animation = 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite';

  // Stop cursor after animation completes
  setTimeout(() => {
    typewriter.classList.add('typing-complete');
  }, 4000); // 3.5s typing + buffer
}

// Run on page load
document.addEventListener('DOMContentLoaded', runTypewriterAnimation);

// Run again whenever "Home" is clicked
document.querySelectorAll('a[href="#home"]').forEach(link => {
  link.addEventListener('click', () => {
    setTimeout(runTypewriterAnimation, 10); // slight delay allows view to update
  });
});

// Add scroll animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
      if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
      }
  });
}, observerOptions);

// Initialize cards with animation
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.service-card');
  cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
      observer.observe(card);
  });
});