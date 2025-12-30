# Product Extra Fields - Dokumentation

## Übersicht

Das **Product Extra Fields** System ermöglicht es, flexible zusätzliche Felder zu Produkten hinzuzufügen, die:
- Produkt-spezifische Konfiguration über Metafields unterstützen
- Automatische Preisberechnung ermöglichen
- Validierung und Fehlerbehandlung bieten
- Nahtlos in den Warenkorb-Add-Prozess integriert sind

## Features

✅ **Flexible Feldtypen**: Unterstützt verschiedene Feldtypen (Zahl, Text, etc.)
✅ **Metafield-Integration**: Produkt-spezifische Einstellungen über Shopify Metafields
✅ **Preisberechnung**: Automatische Berechnung zusätzlicher Kosten
✅ **Validierung**: Automatische Validierung von Min/Max-Werten
✅ **Varianten-Unterstützung**: Funktioniert mit allen Produktvarianten
✅ **Responsive**: Mobile-optimiert

## Setup

### 1. Metafields erstellen (Optional, aber empfohlen)

Erstellen Sie folgende Metafields für Produkte:

**Namespace**: `custom`
**Keys**:
- `extra_field_enabled` (Boolean) - Aktiviert das Extra-Feld für dieses Produkt
- `field_label` (Single line text) - Überschreibt das Feld-Label
- `field_unit` (Single line text) - Überschreibt die Einheit (z.B. "cm", "m")
- `field_min` (Number) - Mindestwert
- `field_max` (Number) - Maximalwert
- `price_per_unit` (Number) - Preis pro Einheit in Cent

### 2. Block in Theme Editor konfigurieren

1. Gehen Sie zum Theme Editor
2. Öffnen Sie eine Produktseite
3. Fügen Sie den Block "Längenfeld & Preis" hinzu
4. Konfigurieren Sie die Einstellungen:
   - **Aktivierung**: Wählen Sie "Für alle Produkte aktivieren" oder geben Sie einen Collection-Handle ein
   - **Feld-Einstellungen**: Konfigurieren Sie Label, Placeholder, Einheit, Min/Max, etc.
   - **Preis-Einstellungen**: Setzen Sie den Preis pro Einheit

### 3. Metafields für produkt-spezifische Einstellungen verwenden

Wenn Sie Metafields erstellt haben, können Sie diese für einzelne Produkte verwenden:

1. Gehen Sie zu einem Produkt im Shopify Admin
2. Scrollen Sie zu "Metafields"
3. Füllen Sie die Metafields aus:
   - `extra_field_enabled`: `true` aktiviert das Feld
   - `field_label`: Überschreibt das Standard-Label
   - `price_per_unit`: Überschreibt den Standard-Preis pro Einheit

## Verwendung

### Für Shop-Besitzer

1. **Block hinzufügen**: Im Theme Editor den Block "Längenfeld & Preis" zur Produktseite hinzufügen
2. **Einstellungen konfigurieren**: Die Block-Einstellungen konfigurieren
3. **Optional Metafields setzen**: Für produkt-spezifische Anpassungen Metafields verwenden

### Für Entwickler

#### Neue Feldtypen hinzufügen

Um einen neuen Feldtyp hinzuzufügen:

1. Erweitern Sie `snippets/main-product-info.liquid` mit einem neuen `when`-Block
2. Verwenden Sie das `data-extra-field` Attribut im Wrapper
3. Das JavaScript erkennt automatisch das neue Feld

Beispiel:
```liquid
{%- when 'custom_text_field' -%}
  <div 
    class="product-extra-field" 
    data-extra-field="text"
    data-field-id="text-{{ section.id }}"
    data-property-name="Zusätzlicher Text"
  >
    <label>Ihr Text</label>
    <input type="text" name="properties[Zusätzlicher Text]">
  </div>
```

#### JavaScript Events

Das System dispatcht folgende Events:

```javascript
// Preis wurde aktualisiert
window.addEventListener('extraFields:priceUpdated', (e) => {
  console.log('Neuer Preis:', e.detail.totalPrice);
});
```

#### API-Zugriff

Das System ist global verfügbar:

```javascript
// Zugriff auf die Instanz
window.ProductExtraFields

// Manuelle Preisaktualisierung
window.ProductExtraFields.updateAllCalculations()

// Alle Felder
window.ProductExtraFields.fields
```

## Technische Details

### Datenstruktur

Jedes Feld hat folgende Konfiguration:
```javascript
{
  wrapper: HTMLElement,
  type: string,
  config: {
    pricePerUnit: number,
    basePrice: number,
    min: number,
    max: number,
    step: number,
    unit: string,
    propertyName: string,
    showCalculation: boolean
  }
}
```

### Preisberechnung

Die Preisberechnung erfolgt automatisch:
- **Zusätzlicher Preis** = Wert × Preis pro Einheit
- **Gesamtpreis** = Grundpreis (Variant) + Zusätzlicher Preis

### Form Properties

Das System fügt automatisch folgende Properties zum Warenkorb hinzu:
- `properties[Länge]`: Der eingegebene Wert mit Einheit
- `properties[_Zusätzliche Kosten]`: Berechnete zusätzliche Kosten in Cent

## Troubleshooting

### Feld wird nicht angezeigt

1. Prüfen Sie, ob der Block aktiviert ist
2. Prüfen Sie die Collection-Handle-Einstellung
3. Prüfen Sie Metafield `extra_field_enabled`

### Preis wird nicht aktualisiert

1. Prüfen Sie die Browser-Konsole auf Fehler
2. Stellen Sie sicher, dass `product-extra-fields.js` geladen wird
3. Prüfen Sie, ob `data-price-per-unit` korrekt gesetzt ist

### Validierung funktioniert nicht

1. Prüfen Sie `data-min` und `data-max` Attribute
2. Stellen Sie sicher, dass das Input-Feld existiert

## Best Practices

1. **Metafields verwenden**: Für produkt-spezifische Einstellungen Metafields verwenden
2. **Preis pro Einheit**: Immer in Cent angeben (z.B. 50 für 0,50 €)
3. **Validierung**: Sinnvolle Min/Max-Werte setzen
4. **Einheiten**: Klare Einheiten verwenden (cm, m, kg, etc.)

## Support

Bei Fragen oder Problemen:
1. Prüfen Sie die Browser-Konsole auf Fehler
2. Prüfen Sie die Metafield-Konfiguration
3. Prüfen Sie die Block-Einstellungen im Theme Editor

