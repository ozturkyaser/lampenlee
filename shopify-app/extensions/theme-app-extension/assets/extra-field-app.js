/**
 * Extra Fields App - Storefront Integration
 * Berechnet Preise basierend auf Extra Fields
 */

(function() {
  'use strict';
  
  class ExtraFieldsApp {
    constructor() {
      this.fields = [];
      this.init();
    }
    
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }
    
    setup() {
      const wrappers = document.querySelectorAll('.extra-field-wrapper');
      
      wrappers.forEach(wrapper => {
        const field = {
          wrapper,
          type: wrapper.dataset.fieldType,
          name: wrapper.dataset.fieldName,
          pricePerUnit: parseFloat(wrapper.dataset.pricePerUnit) || 0,
          min: parseFloat(wrapper.dataset.min) || 0,
          max: parseFloat(wrapper.dataset.max) || 999999,
          step: parseFloat(wrapper.dataset.step) || 1,
          unit: wrapper.dataset.unit || '',
          showCalculation: wrapper.dataset.showCalculation === 'true'
        };
        
        this.fields.push(field);
        this.initializeField(field);
      });
      
      // Listen for variant changes
      this.setupVariantListeners();
      
      // Listen for form submit
      this.setupFormSubmit();
    }
    
    initializeField(field) {
      const input = field.wrapper.querySelector('.extra-field-input');
      if (!input) return;
      
      // Update on input
      input.addEventListener('input', () => {
        this.updateFieldPrice(field);
        this.updateFormProperties(field);
      });
      
      input.addEventListener('change', () => {
        this.updateFieldPrice(field);
        this.updateFormProperties(field);
      });
      
      // Initial update
      this.updateFieldPrice(field);
    }
    
    updateFieldPrice(field) {
      const input = field.wrapper.querySelector('.extra-field-input');
      if (!input) return;
      
      const value = parseFloat(input.value) || 0;
      const additionalCost = value * field.pricePerUnit;
      
      // Update price display
      if (field.showCalculation) {
        const priceDisplay = field.wrapper.querySelector('.additional-price-value');
        if (priceDisplay) {
          priceDisplay.textContent = this.formatMoney(additionalCost);
        }
      }
      
      // Update main product price
      this.updateMainPrice();
    }
    
    updateMainPrice() {
      // Calculate total additional cost
      let totalAdditional = 0;
      this.fields.forEach(field => {
        const input = field.wrapper.querySelector('.extra-field-input');
        if (input) {
          const value = parseFloat(input.value) || 0;
          totalAdditional += value * field.pricePerUnit;
        }
      });
      
      // Get base price from variant
      const variantIdInput = document.querySelector('.product-variant-id, input[name="id"]');
      if (variantIdInput) {
        const variantId = variantIdInput.value;
        // Fetch variant price and update display
        // This would need to be implemented based on your theme
      }
    }
    
    updateFormProperties(field) {
      const form = field.wrapper.closest('form');
      if (!form) return;
      
      const input = field.wrapper.querySelector('.extra-field-input');
      if (!input) return;
      
      const value = input.value;
      const propertyName = input.name.replace('properties[', '').replace(']', '');
      
      // Remove existing property
      const existing = form.querySelector(`input[name="properties[${propertyName}]"]`);
      if (existing && existing !== input) {
        existing.remove();
      }
      
      // Add additional cost property if price calculation enabled
      if (field.pricePerUnit > 0 && value) {
        const additionalCost = Math.round(parseFloat(value) * field.pricePerUnit);
        
        // Remove existing cost property
        const existingCost = form.querySelector('input[name="properties[_Zusätzliche Kosten]"]');
        if (existingCost) {
          existingCost.remove();
        }
        
        if (additionalCost > 0) {
          const costInput = document.createElement('input');
          costInput.type = 'hidden';
          costInput.name = 'properties[_Zusätzliche Kosten]';
          costInput.value = additionalCost;
          form.appendChild(costInput);
        }
      }
    }
    
    setupVariantListeners() {
      const variantSelects = document.querySelectorAll('.product-variant-id, input[name="id"]');
      variantSelects.forEach(select => {
        select.addEventListener('change', () => {
          setTimeout(() => {
            this.fields.forEach(field => {
              this.updateFieldPrice(field);
            });
          }, 100);
        });
      });
    }
    
    setupFormSubmit() {
      const forms = document.querySelectorAll('form[action*="/cart/add"], form.f8pr');
      forms.forEach(form => {
        form.addEventListener('submit', () => {
          this.fields.forEach(field => {
            this.updateFormProperties(field);
          });
        });
      });
    }
    
    formatMoney(cents) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(cents / 100);
    }
  }
  
  // Initialize
  window.ExtraFieldsApp = new ExtraFieldsApp();
})();
