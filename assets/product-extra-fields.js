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
      const input = wrapper.querySelector('input[type="number"], input[type="text"], .custom-length-input');
      if (!input) return;
      
      // Ensure input has the correct class for compatibility
      if (!input.classList.contains('custom-length-input')) {
        input.classList.add('custom-length-input');
      }
      
      // Set data attribute for price per unit if not already set
      if (!input.dataset.pricePerUnit && config.pricePerUnit > 0) {
        input.dataset.pricePerUnit = config.pricePerUnit;
      }
      
      // Input Validation
      input.addEventListener('input', (e) => {
        this.validateInput(e.target, config);
        this.updateFieldCalculation(wrapper, config);
        this.updateFormProperties(wrapper, config);
      });
      
      input.addEventListener('change', (e) => {
        this.validateInput(e.target, config);
        this.updateFieldCalculation(wrapper, config);
        this.updateFormProperties(wrapper, config);
      });
      
      // Blur Event für finale Validierung
      input.addEventListener('blur', (e) => {
        this.validateInput(e.target, config);
        this.updateFormProperties(wrapper, config);
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
      
      // Remove existing property inputs (alle Varianten)
      const existingProperties = form.querySelectorAll(`input[name="properties[${propertyName}]"], input[name*="properties[${propertyName}]"]`);
      existingProperties.forEach(prop => prop.remove());
      
      // Add property if value exists
      if (value && value !== '' && parseFloat(value) > 0) {
        // Remove any existing property with this name first
        const existingProps = form.querySelectorAll(`input[name="properties[${propertyName}]"]`);
        existingProps.forEach(prop => prop.remove());
        
        const propertyInput = document.createElement('input');
        propertyInput.type = 'hidden';
        propertyInput.name = `properties[${propertyName}]`;
        propertyInput.value = value + (config.unit ? ' ' + config.unit : '');
        form.appendChild(propertyInput);
        
        // Debug log
        console.log('✅ Extra Field Property gesetzt:', propertyName, '=', propertyInput.value);
      } else {
        console.warn('⚠️ Extra Field: Kein Wert gesetzt für', propertyName, 'Value:', value);
      }
      
      // Add price per unit property (für Berechnung im Warenkorb)
      if (config.pricePerUnit > 0) {
        // Remove existing price per unit property
        const existingPricePerUnit = form.querySelectorAll('input[name="properties[_Preis pro Einheit]"]');
        existingPricePerUnit.forEach(prop => prop.remove());
        
        const pricePerUnitInput = document.createElement('input');
        pricePerUnitInput.type = 'hidden';
        pricePerUnitInput.name = 'properties[_Preis pro Einheit]';
        pricePerUnitInput.value = config.pricePerUnit;
        form.appendChild(pricePerUnitInput);
        
        console.log('✅ Preis pro Einheit gesetzt:', config.pricePerUnit, 'Cent');
      }
      
      // Add additional cost property if price calculation is enabled
      if (config.pricePerUnit > 0 && value && parseFloat(value) > 0) {
        const additionalCost = Math.round(parseFloat(value) * config.pricePerUnit);
        
        // Remove existing additional cost property
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
          
          // Debug log
          console.log('✅ Zusätzliche Kosten gesetzt:', additionalCost, 'Cent (', this.formatMoney(additionalCost), ')');
          console.log('   Berechnung: Länge', value, '× Preis pro Einheit', config.pricePerUnit, '=', additionalCost);
        } else {
          console.warn('⚠️ Zusätzliche Kosten: 0 (Länge:', value, ', Preis pro Einheit:', config.pricePerUnit, ')');
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
      const forms = document.querySelectorAll('form[action*="/cart/add"], form.f8pr, form[action*="/cart"], form.form-card');
      
      forms.forEach(form => {
        // Use capture phase to ensure properties are set before AJAX handlers
        form.addEventListener('submit', (e) => {
          // Update all properties before submit
          this.fields.forEach(field => {
            this.updateFormProperties(field.wrapper, field.config);
          });
          
          // Also handle old custom-length-input fields for compatibility
          const lengthInputs = form.querySelectorAll('.custom-length-input');
          lengthInputs.forEach(input => {
            const wrapper = input.closest('[data-price-per-unit], .custom-length-field-wrapper');
            if (wrapper) {
              const pricePerUnit = parseFloat(wrapper.dataset.pricePerUnit) || parseFloat(input.dataset.pricePerUnit) || 0;
              const length = parseFloat(input.value) || 0;
              
              if (length > 0 && pricePerUnit > 0) {
                const additionalCost = Math.round(length * pricePerUnit);
                
                // Remove existing additional cost property
                const existingCost = form.querySelector('input[name="properties[_Zusätzliche Kosten]"]');
                if (existingCost) {
                  existingCost.remove();
                }
                
                // Add additional cost property
                if (additionalCost > 0) {
                  const costInput = document.createElement('input');
                  costInput.type = 'hidden';
                  costInput.name = 'properties[_Zusätzliche Kosten]';
                  costInput.value = additionalCost;
                  form.appendChild(costInput);
                  console.log('Product Extra Fields: Zusätzliche Kosten gesetzt:', additionalCost, 'Cent');
                }
              }
            }
          });
          
          // Debug: Log all properties before submit
          setTimeout(() => {
            const formData = new FormData(form);
            const properties = {};
            for (let [key, value] of formData.entries()) {
              if (key.startsWith('properties[')) {
                const propKey = key.replace('properties[', '').replace(']', '');
                properties[propKey] = value;
              }
            }
            if (Object.keys(properties).length > 0) {
              console.log('Product Extra Fields: Alle Properties vor Submit:', properties);
            } else {
              console.warn('Product Extra Fields: Keine Properties gefunden!');
            }
          }, 10);
        }, { capture: true, once: false });
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
