# Shopify App Setup Guide - Product Extra Fields

## Schritt-für-Schritt Anleitung

### Schritt 1: Shopify CLI installieren

```bash
npm install -g @shopify/cli @shopify/theme
```

### Schritt 2: Shopify Partner Account erstellen

1. Gehen Sie zu https://partners.shopify.com
2. Erstellen Sie einen Partner Account
3. Erstellen Sie eine neue App

### Schritt 3: App erstellen

```bash
# Option A: Mit Remix (Empfohlen für 2024)
npm create @shopify/app@latest extra-fields-app
# Wählen Sie: Remix

# Option B: Mit Ruby on Rails
shopify app create ruby
```

### Schritt 4: App-Struktur

Nach der Erstellung haben Sie folgende Struktur:

```
extra-fields-app/
├── app/
│   ├── routes/
│   │   └── _index.tsx
│   └── lib/
│       └── shopify.server.ts
├── extensions/
└── shopify.app.toml
```

### Schritt 5: Extra Fields Model erstellen

Erstellen Sie `app/models/extra-field.ts`:

```typescript
export interface ExtraField {
  id: string;
  productId: string;
  name: string;
  type: 'text' | 'number' | 'dropdown';
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  pricePerUnit?: number;
  required: boolean;
  options?: string[]; // Für dropdown
}
```

### Schritt 6: Admin-Interface erstellen

Erstellen Sie `app/routes/products.$id.tsx`:

```typescript
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const productId = params.id;
  
  // Fetch product and extra fields
  const product = await admin.graphql(`
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        metafields(first: 10) {
          edges {
            node {
              id
              key
              value
            }
          }
        }
      }
    }
  `, {
    variables: { id: `gid://shopify/Product/${productId}` }
  });
  
  return json({ product });
};

export default function ProductExtraFields() {
  const { product } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>Extra Fields für {product.title}</h1>
      {/* Extra Fields Editor hier */}
    </div>
  );
}
```

### Schritt 7: Storefront Integration

Erstellen Sie `extensions/theme-app-extension/blocks/extra-field.liquid`:

```liquid
{% schema %}
{
  "name": "Extra Field",
  "target": "section",
  "settings": [
    {
      "type": "product",
      "id": "product",
      "label": "Product"
    }
  ]
}
{% endschema %}

<div class="extra-field-wrapper" data-product-id="{{ product.id }}">
  <!-- Extra Field Input wird hier gerendert -->
</div>

<script src="{{ 'extra-field.js' | asset_url }}" defer></script>
```

### Schritt 8: Preisberechnung mit Shopify Scripts

Erstellen Sie ein Shopify Script für Shopify Plus:

```ruby
# Script: extra-fields-price-adjustment.rb
Input.cart.line_items.each do |line_item|
  length_property = line_item.properties.find { |p| p.name == 'Länge' }
  price_per_unit_property = line_item.properties.find { |p| p.name == '_Preis pro Einheit' }
  
  if length_property && price_per_unit_property
    length = length_property.value.to_f
    price_per_unit = price_per_unit_property.value.to_f
    additional_cost = (length * price_per_unit).round
    
    if additional_cost > 0
      line_item.change_line_price(
        line_item.line_price + Money.new(cents: additional_cost * 100),
        message: "Zusätzliche Kosten für Länge: #{length_property.value}"
      )
    end
  end
end

Output.cart = Input.cart
```

## Testing

1. Development Store erstellen
2. App installieren
3. Extra Fields für ein Produkt konfigurieren
4. Im Storefront testen

## Deployment

```bash
# Development
npm run dev

# Production Build
npm run build

# Deploy
shopify app deploy
```

## App Store Listing (Optional)

Wenn Sie die App im Shopify App Store veröffentlichen möchten:

1. App Store Listing vorbereiten
2. Screenshots und Beschreibung erstellen
3. $99 Listing Fee bezahlen
4. Review-Prozess durchlaufen

## Support

Bei Fragen zur Entwicklung:
- Shopify Partner Docs: https://shopify.dev/docs/apps
- Shopify Community: https://community.shopify.com
