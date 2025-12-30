# Installation Guide - Product Extra Fields App

## Schritt-für-Schritt Installation

### 1. Voraussetzungen prüfen

```bash
# Node.js Version prüfen (sollte 18+ sein)
node --version

# Shopify CLI installieren
npm install -g @shopify/cli @shopify/theme
```

### 2. Shopify Partner Account erstellen

1. Gehen Sie zu https://partners.shopify.com
2. Erstellen Sie einen Partner Account (falls noch nicht vorhanden)
3. Erstellen Sie eine neue App im Partner Dashboard

### 3. App Setup

```bash
cd shopify-app

# Dependencies installieren
npm install
```

### 4. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env` Datei im `shopify-app` Verzeichnis:

```env
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_SCOPES=write_products,read_products,write_orders,read_orders,write_checkouts,read_checkouts
SHOPIFY_APP_URL=https://your-app-url.com
```

**Wichtig**: Diese Werte erhalten Sie aus dem Shopify Partner Dashboard.

### 5. Development Store erstellen

1. Im Shopify Partner Dashboard: "Stores" → "Add store"
2. Wählen Sie "Development store"
3. Geben Sie einen Namen ein (z.B. "Extra Fields Test Store")

### 6. App starten

```bash
npm run dev
```

Die Shopify CLI wird:
- Einen Tunnel erstellen (ngrok)
- Die App automatisch im Development Store installieren
- Den Browser öffnen

### 7. App konfigurieren

1. Im Browser: App-Zugriff gewähren
2. Im Shopify Admin: "Apps" → "Product Extra Fields"
3. Produkt auswählen und Extra Fields konfigurieren

### 8. Theme Extension aktivieren

1. Gehen Sie zum Theme Editor
2. Öffnen Sie eine Produktseite
3. Fügen Sie den Block "Extra Fields" hinzu
4. Speichern Sie das Theme

## Troubleshooting

### Problem: "Cannot find module"

```bash
cd shopify-app
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Authentication failed"

- Prüfen Sie die `.env` Datei
- Stellen Sie sicher, dass die API Keys korrekt sind
- Prüfen Sie die Scopes im Partner Dashboard

### Problem: "App not loading"

- Prüfen Sie die `SHOPIFY_APP_URL` in der `.env`
- Stellen Sie sicher, dass der Tunnel läuft
- Prüfen Sie die Browser-Konsole auf Fehler

## Nächste Schritte

Nach der Installation:

1. ✅ Extra Fields für ein Produkt konfigurieren
2. ✅ Im Storefront testen
3. ✅ Preisberechnung prüfen
4. ✅ Warenkorb-Integration testen

## Production Deployment

Für Production:

1. Hosting einrichten (z.B. Heroku, Railway, Fly.io)
2. Umgebungsvariablen auf dem Server setzen
3. `npm run build` ausführen
4. `npm run deploy` ausführen
