/**
 * Product Extra Fields - Flexible Extra Field System
 * Unterstützt verschiedene Feldtypen und Metafields
 */
(function() {
  'use strict';
  
  class ProductExtraFields {
    constructor() {
      this.fields = [];
      this.priceCalculations = {};
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
      // Finde alle Extra-Field-Wrapper
      const wrappers = document.querySelectorAll('[data-extra-field]');
      
      wrappers.forEach(wrapper => {
        const fieldType = wrapper.dataset.extraField;
        const fieldConfig = this.parseFieldConfig(wrapper);
        
        this.fields.push({
          wrapper,
          type: fieldType,
          config: fieldConfig
        });
        
        this.initializeField(wrapper, fieldType, fieldConfig);
      });
      
      // Event Listeners für Variantenwechsel
      this.setupVariantChangeListeners();
      
      // Form Submit Handler
      this.setupFormSubmitHandlers();
      
      // Initiale Berechnung
      this.updateAllCalculations();
    }
    
    parseFieldConfig(wrapper) {
      return {
        pricePerUnit: parseFloat(wrapper.dataset.pricePerUnit) || 0,
        basePrice: parseFloat(wrapper.dataset.basePrice) || 0,
        min: parseFloat(wrapper.dataset.min) || 0,
        max: parseFloat(wrapper.dataset.max) || 999999,
        step: parseFloat(wrapper.dataset.step) || 1,
        unit: wrapper.dataset.unit || '',
        propertyName: wrapper.dataset.propertyName || 'Extra',
        showCalculation: wrapper.dataset.showCalculation === 'true'
      };
    }
    
    initializeField(wrapper, type, config) {
      const input = wrapper.querySelector('input[type="number"], input[type="text"]');
      if (!input) return;
      
      // Store original value format function
      const formatValueWithUnit = (val) => {
        const numVal = parseFloat(val) || 0;
        return numVal > 0 ? numVal + (config.unit ? ' ' + config.unit : '') : '';
      };
      
      // Input Validation
      input.addEventListener('input', (e) => {
        this.validateInput(e.target, config);
        this.updateFieldCalculation(wrapper, config);
      });
      
      input.addEventListener('change', (e) => {
        this.validateInput(e.target, config);
        this.updateFieldCalculation(wrapper, config);
        this.updateFormProperties(wrapper, config);
        
        // Update input value with unit if it has property name
        if (input.name && input.name.startsWith('properties[') && input.value) {
          const numVal = parseFloat(input.value);
          if (numVal > 0) {
            input.value = formatValueWithUnit(input.value);
          }
        }
      });
      
      // Blur Event für finale Validierung und Formatierung
      input.addEventListener('blur', (e) => {
        this.validateInput(e.target, config);
        this.updateFormProperties(wrapper, config);
        
        // Update input value with unit if it has property name
        if (input.name && input.name.startsWith('properties[') && input.value) {
          const numVal = parseFloat(input.value);
          if (numVal > 0) {
            input.value = formatValueWithUnit(input.value);
          }
        }
      });
    }
    
    validateInput(input, config) {
      const value = parseFloat(input.value);
      
      if (input.value === '' || isNaN(value)) {
        if (config.min > 0) {
          input.value = config.min;
        }
        return;
      }
      
      if (value < config.min) {
        input.value = config.min;
        this.showError(input, `Mindestwert: ${config.min}${config.unit ? ' ' + config.unit : ''}`);
      } else if (value > config.max) {
        input.value = config.max;
        this.showError(input, `Maximalwert: ${config.max}${config.unit ? ' ' + config.unit : ''}`);
      } else {
        this.clearError(input);
      }
    }
    
    showError(input, message) {
      const wrapper = input.closest('[data-extra-field]');
      let errorEl = wrapper.querySelector('.field-error');
      
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        wrapper.appendChild(errorEl);
      }
      
      errorEl.textContent = message;
      input.classList.add('has-error');
    }
    
    clearError(input) {
      input.classList.remove('has-error');
      const wrapper = input.closest('[data-extra-field]');
      const errorEl = wrapper.querySelector('.field-error');
      if (errorEl) {
        errorEl.remove();
      }
    }
    
    updateFieldCalculation(wrapper, config) {
      const input = wrapper.querySelector('input[type="number"], input[type="text"]');
      if (!input) return;
      
      const value = parseFloat(input.value) || 0;
      const additionalPrice = value * config.pricePerUnit;
      const totalPrice = config.basePrice + additionalPrice;
      
      // Update Price Display
      if (config.showCalculation) {
        const additionalPriceEl = wrapper.querySelector('.additional-price-value');
        const totalPriceEl = wrapper.querySelector('.total-price-value');
        
        if (additionalPriceEl) {
          additionalPriceEl.textContent = this.formatMoney(additionalPrice);
        }
        
        if (totalPriceEl) {
          totalPriceEl.textContent = this.formatMoney(totalPrice);
        }
      }
      
      // Store calculation
      this.priceCalculations[wrapper.dataset.fieldId || 'default'] = {
        value,
        additionalPrice,
        totalPrice,
        basePrice: config.basePrice
      };
      
      // Update main product price
      this.updateMainProductPrice(totalPrice);
    }
    
    updateAllCalculations() {
      this.fields.forEach(field => {
        // Update base price from current variant
        const variantIdInput = document.querySelector('.product-variant-id, input[name="id"]');
        if (variantIdInput) {
          const variantId = variantIdInput.value;
          const variantData = this.getVariantData(variantId);
          if (variantData && variantData.price) {
            field.config.basePrice = variantData.price;
            field.wrapper.dataset.basePrice = variantData.price;
          }
        }
        
        this.updateFieldCalculation(field.wrapper, field.config);
      });
    }
    
    getVariantData(variantId) {
      // Versuche Variant-Daten aus verschiedenen Quellen zu bekommen
      if (window.productVariants && window.productVariants[variantId]) {
        return window.productVariants[variantId];
      }
      
      // Fallback: Parse from DOM
      const variantSelect = document.querySelector(`option[value="${variantId}"]`);
      if (variantSelect && variantSelect.dataset.variantinfo) {
        try {
          return JSON.parse(variantSelect.dataset.variantinfo);
        } catch (e) {
          console.warn('Could not parse variant data', e);
        }
      }
      
      return null;
    }
    
    updateMainProductPrice(totalPrice) {
      // Update all price displays
      const priceSelectors = [
        '.product-price-display',
        '.f8pr-price .price',
        '.s1pr .price',
        '[data-product-price]'
      ];
      
      priceSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (!el.dataset.originalPrice) {
            el.dataset.originalPrice = el.textContent;
          }
          el.textContent = this.formatMoney(totalPrice);
        });
      });
      
      // Update sticky add to cart price
      const stickyPrice = document.querySelector('.sticky-add-to-cart .price, #product-price-sticky');
      if (stickyPrice) {
        stickyPrice.textContent = this.formatMoney(totalPrice);
      }
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('extraFields:priceUpdated', {
        detail: { totalPrice }
      }));
    }
    
    updateFormProperties(wrapper, config) {
      const form = wrapper.closest('form');
      if (!form) return;
      
      const input = wrapper.querySelector('input[type="number"], input[type="text"]');
      if (!input) return;
      
      const value = input.value;
      const propertyName = config.propertyName;
      
      // If input already has property name, ensure value includes unit
      if (input.name && input.name.startsWith('properties[')) {
        // Input already has property name, ensure value includes unit
        const numericValue = parseFloat(value) || 0;
        if (numericValue > 0) {
          // Only update if unit is missing
          if (!input.value.includes(config.unit)) {
            input.value = numericValue + (config.unit ? ' ' + config.unit : '');
          }
        }
      } else {
        // Remove existing property inputs (alle Varianten) except the main input
        const existingProperties = form.querySelectorAll(`input[name="properties[${propertyName}]"], input[name*="properties[${propertyName}]"]`);
        existingProperties.forEach(prop => {
          // Don't remove the main input field itself
          if (prop !== input && prop.type === 'hidden') {
            prop.remove();
          }
        });
        
        // Add hidden property if value exists and input doesn't have property name
        if (value && value !== '' && parseFloat(value) > 0) {
          const propertyInput = document.createElement('input');
          propertyInput.type = 'hidden';
          propertyInput.name = `properties[${propertyName}]`;
          propertyInput.value = parseFloat(value) + (config.unit ? ' ' + config.unit : '');
          form.appendChild(propertyInput);
        }
      }
      
      // Remove existing price per unit property
      const existingPricePerUnit = form.querySelector('input[name="properties[_Preis pro Einheit]"]');
      if (existingPricePerUnit) {
        existingPricePerUnit.remove();
      }
      
      // Add price per unit property (für Berechnung im Warenkorb)
      if (config.pricePerUnit > 0) {
        const pricePerUnitInput = document.createElement('input');
        pricePerUnitInput.type = 'hidden';
        pricePerUnitInput.name = 'properties[_Preis pro Einheit]';
        pricePerUnitInput.value = config.pricePerUnit;
        form.appendChild(pricePerUnitInput);
      }
      
      // Remove existing additional cost property
      const existingCost = form.querySelector('input[name="properties[_Zusätzliche Kosten]"]');
      if (existingCost) {
        existingCost.remove();
      }
      
      // Add additional cost property if price calculation is enabled
      if (config.pricePerUnit > 0 && value && parseFloat(value) > 0) {
        const additionalCost = Math.round(parseFloat(value) * config.pricePerUnit);
        
        if (additionalCost > 0) {
          const costInput = document.createElement('input');
          costInput.type = 'hidden';
          costInput.name = 'properties[_Zusätzliche Kosten]';
          costInput.value = additionalCost;
          form.appendChild(costInput);
          
          // Debug log
          console.log('Extra Field: Länge=', value, 'cm, Preis pro Einheit=', config.pricePerUnit, 'Cent, Zusätzliche Kosten=', additionalCost, 'Cent');
        }
      }
    }
    
    setupVariantChangeListeners() {
      // Listen to variant select changes
      const variantSelects = document.querySelectorAll(
        '.product-variant-id, input[name="id"], select[name="id"]'
      );
      
      variantSelects.forEach(select => {
        select.addEventListener('change', () => {
          setTimeout(() => {
            this.updateAllCalculations();
            this.fields.forEach(field => {
              this.updateFormProperties(field.wrapper, field.config);
            });
          }, 100);
        });
      });
      
      // Listen to custom variant change events
      document.addEventListener('variant:change', () => {
        setTimeout(() => {
          this.updateAllCalculations();
        }, 100);
      });
      
      // Listen to theme variant update events
      window.addEventListener('themeVariantUpdated', () => {
        setTimeout(() => {
          this.updateAllCalculations();
        }, 100);
      });
    }
    
    setupFormSubmitHandlers() {
      const forms = document.querySelectorAll('form[action*="/cart/add"], form.f8pr, form[action*="/cart"]');
      
      forms.forEach(form => {
        // Use capture phase to run BEFORE other handlers
        form.addEventListener('submit', (e) => {
          // Update all properties BEFORE submit
          this.fields.forEach(field => {
            this.updateFormProperties(field.wrapper, field.config);
          });
          
          // Debug: Log all properties before submit
          const formData = new FormData(form);
          const properties = {};
          for (let [key, value] of formData.entries()) {
            if (key.startsWith('properties[')) {
              const propKey = key.replace('properties[', '').replace(']', '');
              properties[propKey] = value;
            }
          }
          if (Object.keys(properties).length > 0) {
            console.log('Product Extra Fields: Properties vor Submit:', properties);
          }
        }, { capture: true, passive: false });
        
        // Also hook into button clicks to update properties early
        const submitButtons = form.querySelectorAll('button[type="submit"], button[name="add"]');
        submitButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            // Update properties on button click (before form submit)
            this.fields.forEach(field => {
              this.updateFormProperties(field.wrapper, field.config);
            });
          }, { capture: true });
        });
      });
    }
    
    formatMoney(cents) {
      if (typeof cents === 'string') {
        cents = parseFloat(cents);
      }
      
      const value = cents / 100;
      
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
  }
  
  // Initialize
  window.ProductExtraFields = new ProductExtraFields();
})();

