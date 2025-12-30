// Sidebar Navigation Mobile Toggle
(function() {
  'use strict';
  
  const mobileToggle = document.querySelector('.sidebar-mobile-toggle');
  const sidebarNav = document.querySelector('.sidebar-navigation');
  const overlay = document.querySelector('.sidebar-mobile-overlay');
  const body = document.body;
  
  // Sidebar muss existieren, Mobile-Toggle ist optional (nur auf Mobile vorhanden)
  if (!sidebarNav) return;
  
  function toggleMenu() {
    const isActive = sidebarNav.classList.contains('active');
    
    if (isActive) {
      closeMenu();
    } else {
      openMenu();
    }
  }
  
  function openMenu() {
    sidebarNav.classList.add('active');
    if (mobileToggle) {
      mobileToggle.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
    }
    if (overlay) {
      overlay.classList.add('active');
    }
    body.style.overflow = 'hidden';
  }
  
  function closeMenu() {
    sidebarNav.classList.remove('active');
    if (mobileToggle) {
      mobileToggle.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
    if (overlay) {
      overlay.classList.remove('active');
    }
    body.style.overflow = '';
  }
  
  // Toggle button click
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }
  
  // Overlay click to close
  if (overlay) {
    overlay.addEventListener('click', function() {
      closeMenu();
    });
  }
  
  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebarNav.classList.contains('active')) {
      closeMenu();
    }
  });
  
  // Close menu when clicking on a link (optional)
  const navLinks = sidebarNav.querySelectorAll('a');
  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      // Only close on mobile
      if (window.innerWidth <= 760) {
        setTimeout(closeMenu, 300);
      }
    });
  });
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Auf Desktop: Stelle sicher, dass die Sidebar sichtbar ist
      if (window.innerWidth > 760) {
        // Entferne active-Klasse, da sie auf Desktop nicht benötigt wird
        sidebarNav.classList.remove('active');
        if (mobileToggle) {
          mobileToggle.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
        if (overlay) {
          overlay.classList.remove('active');
        }
        body.style.overflow = '';
      }
    }, 250);
  });
})();



