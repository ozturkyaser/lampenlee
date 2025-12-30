/**
 * Extra Field Model
 * Definiert die Struktur für zusätzliche Produktfelder
 */

export interface ExtraField {
  id?: string;
  productId: string;
  name: string;
  type: 'text' | 'number' | 'dropdown' | 'checkbox';
  label: string;
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number;
  pricePerUnit?: number; // In Cent
  required: boolean;
  options?: string[]; // Für dropdown
  enabled: boolean;
  showPriceCalculation?: boolean;
}

export interface ExtraFieldConfig {
  productId: string;
  fields: ExtraField[];
}

/**
 * Parse Extra Field from Metafield
 */
export function parseExtraFieldFromMetafield(metafield: any): ExtraFieldConfig | null {
  if (!metafield || metafield.type !== 'json') {
    return null;
  }

  try {
    const config = JSON.parse(metafield.value);
    return {
      productId: metafield.ownerId?.replace('gid://shopify/Product/', '') || '',
      fields: config.fields || []
    };
  } catch (e) {
    console.error('Error parsing extra field config:', e);
    return null;
  }
}

/**
 * Serialize Extra Field Config to Metafield value
 */
export function serializeExtraFieldConfig(config: ExtraFieldConfig): string {
  return JSON.stringify({
    fields: config.fields
  });
}
