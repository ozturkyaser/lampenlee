# Shopify App für Product Extra Fields - Plan

## Warum eine Shopify App?

Eine Shopify App würde folgende Vorteile bieten:

### ✅ Echte Preisänderung
- **Aktuelles Problem**: Properties ändern den Preis nicht automatisch
- **Mit App**: Der Preis wird tatsächlich im Warenkorb und Checkout geändert
- Line Items können dynamisch angepasst werden

### ✅ Professionelle Verwaltung
- Admin-Interface für Extra Fields
- Einfache Konfiguration pro Produkt
- Bulk-Operations möglich

### ✅ Erweiterte Features
- Mehrere Extra Fields pro Produkt
- Verschiedene Feldtypen (Text, Zahl, Dropdown, etc.)
- Bedingte Logik (z.B. Feld nur bei bestimmten Varianten)
- Preisberechnungsregeln

### ✅ Bessere Integration
- Funktioniert mit Shopify Scripts
- Unterstützt Shopify Flow
- API-basiert für bessere Performance

## App-Struktur

### 1. Backend (Node.js/Express oder Ruby on Rails)

```
shopify-extra-fields-app/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── extra_field.rb (oder .js)
│   │   ├── controllers/
│   │   │   └── extra_fields_controller.rb
│   │   └── services/
│   │       └── price_calculator.rb
│   ├── config/
│   └── db/
│       └── migrations/
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   └── ExtraFieldEditor.tsx
│   │   └── pages/
│   │       └── Products.tsx
│   └── public/
└── shopify.app.toml
```

### 2. Hauptfunktionen

#### A. Admin-Interface
- Produktliste mit Extra Fields
- Extra Field Editor pro Produkt
- Feldtypen: Text, Number, Dropdown, Checkbox
- Preisberechnungsregeln

#### B. Storefront Integration
- JavaScript SDK für Theme-Integration
- Automatische Preisberechnung
- Cart API Integration

#### C. Webhooks
- `orders/create` - Für Bestellverarbeitung
- `cart/update` - Für Preisaktualisierung

## Technische Umsetzung

### Option 1: Shopify App mit Remix/React (Empfohlen)

**Vorteile:**
- Modernes Framework
- Gute Shopify-Integration
- TypeScript-Support

**Technologie-Stack:**
- Remix (Frontend + Backend)
- Shopify CLI
- Shopify Admin API
- Shopify Storefront API

### Option 2: Shopify App mit Ruby on Rails

**Vorteile:**
- Shopify's bevorzugtes Framework
- Viele Beispiele verfügbar
- Gute Dokumentation

**Technologie-Stack:**
- Ruby on Rails
- Shopify App Bridge
- Shopify Admin API

### Option 3: Headless App (Node.js + React)

**Vorteile:**
- Flexibel
- Kann mit jedem Frontend arbeiten
- Gut für komplexe Logik

## Preisänderung im Checkout

### Lösung mit Shopify Scripts (Shopify Plus)

```ruby
# Script für Preisänderung basierend auf Properties
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

### Lösung mit Shopify Flow (Alle Pläne)

1. Flow Trigger: `Order created`
2. Action: `Calculate price based on properties`
3. Update: `Cart line item price`

## App-Features

### Basis-Features
- ✅ Extra Fields pro Produkt verwalten
- ✅ Feldtypen: Text, Number, Dropdown, Checkbox
- ✅ Preisberechnung pro Feld
- ✅ Properties automatisch setzen

### Erweiterte Features
- 📊 Analytics: Welche Extra Fields werden am meisten genutzt
- 🔄 Bulk-Operations: Extra Fields für mehrere Produkte gleichzeitig
- 📋 Templates: Vordefinierte Extra Field-Konfigurationen
- 🎨 Customization: Eigene Feldtypen erstellen

## Kosten

### Entwicklung
- **Einfache App**: 2-4 Wochen Entwicklung
- **Erweiterte App**: 4-8 Wochen Entwicklung

### Shopify App Store
- **Listing Fee**: Einmalig $99 (wenn veröffentlicht)
- **Monatliche Kosten**: Optional (kann kostenlos sein)

## Nächste Schritte

1. **Entscheidung**: Welche Technologie? (Remix empfohlen)
2. **Setup**: Shopify CLI installieren
3. **Development**: App entwickeln
4. **Testing**: In Development Store testen
5. **Publishing**: Optional im App Store veröffentlichen

## Alternative: Shopify Scripts (Nur Shopify Plus)

Wenn Sie Shopify Plus haben, können Sie auch Shopify Scripts verwenden, um den Preis direkt zu ändern, ohne eine vollständige App zu entwickeln.

## Empfehlung

Für Ihre Anforderungen würde ich empfehlen:
1. **Kurzfristig**: Shopify Scripts verwenden (wenn Shopify Plus)
2. **Langfristig**: Eine einfache Shopify App entwickeln für bessere Verwaltung

Soll ich mit der Entwicklung einer Shopify App beginnen?
