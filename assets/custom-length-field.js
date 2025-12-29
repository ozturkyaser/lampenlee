// Custom Length Field with Dynamic Price Calculation
(function() {
  'use strict';
  
  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = parseInt(cents, 10);
    }
    
    const value = cents / 100;
    const currencySymbol = '€';
    
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  
  function updatePrice() {
    const lengthFields = document.querySelectorAll('.custom-length-field-wrapper');
    
    lengthFields.forEach(function(wrapper) {
      const input = wrapper.querySelector('.custom-length-input');
      const pricePerUnit = parseFloat(wrapper.dataset.pricePerUnit) || 0;
      const basePrice = parseFloat(wrapper.dataset.basePrice) || 0;
      
      if (!input) return;
      
      const length = parseFloat(input.value) || 0;
      const lengthPrice = (length * pricePerUnit);
      const totalPrice = basePrice + lengthPrice;
      
      // Update price display in the field wrapper
      const lengthPriceValue = wrapper.querySelector('.length-price-value');
      const totalPriceValue = wrapper.querySelector('.total-price-value');
      
      if (lengthPriceValue) {
        lengthPriceValue.textContent = formatMoney(lengthPrice);
      }
      
      if (totalPriceValue) {
        totalPriceValue.textContent = formatMoney(totalPrice);
      }
      
      // Update main product price display
      const productPriceDisplay = document.querySelector('.product-price-display');
      if (productPriceDisplay) {
        productPriceDisplay.textContent = formatMoney(totalPrice);
        productPriceDisplay.dataset.calculatedPrice = totalPrice;
      }
      
      // Update all price displays on the page
      const allPriceDisplays = document.querySelectorAll('.f8pr-price .product-price-display, .s1pr .product-price-display, .price .product-price-display');
      allPriceDisplays.forEach(function(display) {
        if (display !== productPriceDisplay) {
          display.textContent = formatMoney(totalPrice);
        }
      });
      
      // Update sticky add to cart price if exists
      const stickyPrice = document.querySelector('.sticky-add-to-cart .price, #product-price-sticky');
      if (stickyPrice) {
        const stickyPriceDisplay = stickyPrice.querySelector('.product-price-display');
        if (stickyPriceDisplay) {
          stickyPriceDisplay.textContent = formatMoney(totalPrice);
        } else {
          stickyPrice.innerHTML = formatMoney(totalPrice);
        }
      }
    });
  }
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    const lengthInputs = document.querySelectorAll('.custom-length-input');
    
    lengthInputs.forEach(function(input) {
      // Update on input
      input.addEventListener('input', updatePrice);
      input.addEventListener('change', updatePrice);
      
      // Update on variant change
      const variantSelects = document.querySelectorAll('[name="id"], .product-variant-id');
      variantSelects.forEach(function(select) {
        select.addEventListener('change', function() {
          setTimeout(updatePrice, 100);
        });
      });
    });
    
    // Initial update
    updatePrice();
  });
  
  // Listen for variant changes via custom events
  document.addEventListener('variant:change', function() {
    setTimeout(updatePrice, 100);
  });
  
  // Update price when variant changes (for theme compatibility)
  if (typeof window !== 'undefined') {
    const originalUpdatePrice = window.updatePrice;
    if (originalUpdatePrice) {
      window.updatePrice = function() {
        if (originalUpdatePrice) originalUpdatePrice.apply(this, arguments);
        setTimeout(updatePrice, 100);
      };
    }
  }
})();



