# Product Extra Fields - Shopify App

Eine Shopify App für flexible zusätzliche Produktfelder mit automatischer Preisberechnung.

## Features

- ✅ Extra Fields pro Produkt verwalten
- ✅ Automatische Preisberechnung
- ✅ Echte Preisänderung im Warenkorb und Checkout
- ✅ Verschiedene Feldtypen (Text, Number, Dropdown)
- ✅ Admin-Interface für einfache Verwaltung

## Setup

### Voraussetzungen

- Node.js 18+ oder Ruby 3.0+
- Shopify CLI (`npm install -g @shopify/cli @shopify/theme`)
- Shopify Partner Account

### Installation

```bash
# Mit Remix (Empfohlen)
npm create @shopify/app@latest

# Oder mit Ruby
shopify app create ruby
```

## App-Struktur

```
shopify-extra-fields-app/
├── app/
│   ├── routes/
│   │   ├── _index.tsx          # Dashboard
│   │   ├── products.tsx        # Produktliste
│   │   └── products.$id.tsx    # Extra Fields Editor
│   ├── models/
│   │   └── extra-field.ts      # Datenmodell
│   └── services/
│       └── price-calculator.ts  # Preisberechnung
├── extensions/
│   └── theme-app-extension/
│       ├── blocks/
│       │   └── extra-field.liquid
│       └── assets/
│           └── extra-field.js
└── shopify.app.toml
```

## Entwicklung

### 1. App erstellen

```bash
npm create @shopify/app@latest extra-fields-app
cd extra-fields-app
```

### 2. Development Server starten

```bash
npm run dev
```

### 3. In Shopify Development Store installieren

Die App wird automatisch im Development Store installiert.

## API-Endpunkte

### Admin API

- `GET /api/products/:id/extra-fields` - Extra Fields abrufen
- `POST /api/products/:id/extra-fields` - Extra Field erstellen
- `PUT /api/products/:id/extra-fields/:fieldId` - Extra Field aktualisieren
- `DELETE /api/products/:id/extra-fields/:fieldId` - Extra Field löschen

### Storefront API

- GraphQL Query für Extra Fields
- Cart API für Preisaktualisierung

## Preisänderung

Die App verwendet Shopify Scripts (Shopify Plus) oder Shopify Flow, um den Preis basierend auf Extra Fields zu ändern.

## Deployment

```bash
# Development
npm run dev

# Production
npm run deploy
```

## Nächste Schritte

1. App-Struktur erstellen
2. Admin-Interface entwickeln
3. Storefront-Integration implementieren
4. Preisberechnung implementieren
5. Testing und Deployment
