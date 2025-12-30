# Product Extra Fields - Shopify App

Eine vollständige Shopify App für flexible zusätzliche Produktfelder mit automatischer Preisberechnung.

## Features

✅ **Admin-Interface**: Einfache Verwaltung von Extra Fields pro Produkt
✅ **Verschiedene Feldtypen**: Text, Number, Dropdown, Checkbox
✅ **Preisberechnung**: Automatische Berechnung zusätzlicher Kosten
✅ **Theme-Integration**: Nahtlose Integration ins Storefront
✅ **Metafields**: Speicherung der Konfiguration in Shopify Metafields

## Setup

### 1. Voraussetzungen

- Node.js 18+
- Shopify CLI: `npm install -g @shopify/cli`
- Shopify Partner Account

### 2. Installation

```bash
cd shopify-app
npm install
```

### 3. Umgebungsvariablen

Erstellen Sie eine `.env` Datei:

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=write_products,read_products,write_orders,read_orders
SHOPIFY_APP_URL=https://your-app-url.com
```

### 4. Development Server starten

```bash
npm run dev
```

Die App wird automatisch in Ihrem Development Store installiert.

## App-Struktur

```
shopify-app/
├── app/
│   ├── routes/
│   │   ├── _index.tsx              # Dashboard
│   │   └── products.$id.tsx        # Extra Fields Editor
│   ├── models/
│   │   └── extra-field.ts          # Datenmodell
│   ├── services/
│   │   └── price-calculator.ts      # Preisberechnung
│   └── shopify.server.ts            # Shopify Authentifizierung
├── extensions/
│   └── theme-app-extension/
│       ├── blocks/
│       │   └── extra-field.liquid   # Theme Block
│       └── assets/
│           ├── extra-field-app.js   # Storefront JS
│           └── extra-field-app.css  # Storefront CSS
└── shopify.app.toml                 # App-Konfiguration
```

## Verwendung

### 1. Extra Fields konfigurieren

1. Öffnen Sie die App im Shopify Admin
2. Wählen Sie ein Produkt aus
3. Konfigurieren Sie die Extra Fields
4. Speichern Sie die Konfiguration

### 2. Im Theme verwenden

Die Extra Fields werden automatisch im Theme angezeigt, wenn der Block "Extra Fields" zur Produktseite hinzugefügt wird.

### 3. Preisberechnung

Die zusätzlichen Kosten werden automatisch berechnet und als Property zum Warenkorb hinzugefügt.

## Entwicklung

### Neue Features hinzufügen

1. Model erweitern (`app/models/extra-field.ts`)
2. Service-Logik hinzufügen (`app/services/`)
3. UI-Komponente erstellen (`app/routes/`)
4. Theme-Integration aktualisieren (`extensions/theme-app-extension/`)

### Testing

```bash
npm test
```

## Deployment

```bash
# Build
npm run build

# Deploy
npm run deploy
```

## Shopify Scripts (Für Preisänderung im Checkout)

Für Shopify Plus können Sie Shopify Scripts verwenden, um den Preis tatsächlich zu ändern:

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
        message: "Zusätzliche Kosten für Länge"
      )
    end
  end
end

Output.cart = Input.cart
```

## Support

Bei Fragen zur Entwicklung:
- [Shopify App Docs](https://shopify.dev/docs/apps)
- [Remix Documentation](https://remix.run/docs)
- [Shopify Community](https://community.shopify.com)
