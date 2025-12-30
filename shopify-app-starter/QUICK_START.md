# Quick Start - Shopify App für Extra Fields

## Schnellstart (5 Minuten)

### 1. Shopify CLI installieren

```bash
npm install -g @shopify/cli @shopify/theme
```

### 2. App erstellen

```bash
npm create @shopify/app@latest extra-fields-app
```

Wählen Sie:
- **Template**: Remix
- **Language**: TypeScript
- **Package Manager**: npm

### 3. Development Server starten

```bash
cd extra-fields-app
npm run dev
```

### 4. In Development Store installieren

Die CLI öffnet automatisch einen Browser, wo Sie die App installieren können.

## Minimales Beispiel

### Admin-Seite für Extra Fields

Erstellen Sie `app/routes/products.$id.tsx`:

```typescript
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const productId = params.id;
  
  // Fetch product
  const response = await admin.graphql(`
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
      }
    }
  `, {
    variables: { id: `gid://shopify/Product/${productId}` }
  });
  
  const data = await response.json();
  return json({ product: data.data.product });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  // Save extra field configuration as metafield
  const metafield = {
    namespace: "extra_fields",
    key: "config",
    value: JSON.stringify({
      enabled: formData.get("enabled") === "on",
      pricePerUnit: formData.get("pricePerUnit"),
      // ... weitere Felder
    }),
    type: "json"
  };
  
  await admin.graphql(`
    mutation setMetafield($metafield: MetafieldInput!) {
      metafieldsSet(metafields: [$metafield]) {
        metafields {
          id
        }
      }
    }
  `, {
    variables: {
      metafield: {
        ...metafield,
        ownerId: `gid://shopify/Product/${params.id}`
      }
    }
  });
  
  return json({ success: true });
};

export default function ProductExtraFields() {
  const { product } = useLoaderData<typeof loader>();
  
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Extra Fields für {product.title}</h1>
      <Form method="post">
        <label>
          <input type="checkbox" name="enabled" />
          Extra Field aktivieren
        </label>
        <label>
          Preis pro Einheit (Cent):
          <input type="number" name="pricePerUnit" />
        </label>
        <button type="submit">Speichern</button>
      </Form>
    </div>
  );
}
```

### Theme Extension

Erstellen Sie `extensions/theme-app-extension/blocks/extra-field.liquid`:

```liquid
{% if product.metafields.extra_fields.config %}
  {% assign config = product.metafields.extra_fields.config.value %}
  {% if config.enabled %}
    <div class="extra-field" data-price-per-unit="{{ config.pricePerUnit }}">
      <label>Länge (cm)</label>
      <input type="number" name="properties[Länge]" class="extra-field-input" />
    </div>
  {% endif %}
{% endif %}

<script>
  // Preisberechnung JavaScript
  document.querySelectorAll('.extra-field-input').forEach(input => {
    input.addEventListener('input', function() {
      const pricePerUnit = parseFloat(this.closest('.extra-field').dataset.pricePerUnit) || 0;
      const length = parseFloat(this.value) || 0;
      const additionalCost = length * pricePerUnit;
      // Update price display
      console.log('Zusätzliche Kosten:', additionalCost);
    });
  });
</script>
```

## Nächste Schritte

1. ✅ App-Struktur erstellt
2. ⏭️ Admin-Interface erweitern
3. ⏭️ Storefront-Integration verbessern
4. ⏭️ Shopify Scripts für Preisänderung hinzufügen
5. ⏭️ Testing und Deployment

## Wichtige Ressourcen

- [Shopify App Development Docs](https://shopify.dev/docs/apps)
- [Remix Documentation](https://remix.run/docs)
- [Shopify Admin API](https://shopify.dev/docs/api/admin-graphql)
- [Shopify Scripts](https://shopify.dev/docs/apps/checkout/scripts)
