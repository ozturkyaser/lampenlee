import React from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import type { ExtraField, ExtraFieldConfig } from "../models/extra-field";
import { parseExtraFieldFromMetafield, serializeExtraFieldConfig } from "../models/extra-field";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const productId = params.id;

  if (!productId) {
    throw new Response("Product ID required", { status: 400 });
  }

  // Fetch product
  const productResponse = await admin.graphql(`
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        metafields(first: 10, namespace: "extra_fields") {
          edges {
            node {
              id
              key
              value
              type
            }
          }
        }
      }
    }
  `, {
    variables: { id: `gid://shopify/Product/${productId}` }
  });

  const productData = await productResponse.json();
  const product = productData.data.product;

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  // Parse extra fields config
  const configMetafield = product.metafields.edges.find(
    (edge: any) => edge.node.key === "config"
  );
  
  let extraFieldsConfig: ExtraFieldConfig | null = null;
  if (configMetafield) {
    extraFieldsConfig = parseExtraFieldFromMetafield(configMetafield.node);
  }

  return json({
    product: {
      id: product.id.replace('gid://shopify/Product/', ''),
      title: product.title,
      handle: product.handle
    },
    extraFieldsConfig: extraFieldsConfig || {
      productId: productId,
      fields: []
    }
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const productId = params.id;

  if (!productId) {
    return json({ error: "Product ID required" }, { status: 400 });
  }

  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "save") {
    // Parse form data
    const fieldsJson = formData.get("fields");
    if (!fieldsJson) {
      return json({ error: "No fields data" }, { status: 400 });
    }

    try {
      const fields: ExtraField[] = JSON.parse(fieldsJson as string);
      const config: ExtraFieldConfig = {
        productId: productId,
        fields: fields
      };

      // Save as metafield
      const metafieldInput = {
        namespace: "extra_fields",
        key: "config",
        value: serializeExtraFieldConfig(config),
        type: "json",
        ownerId: `gid://shopify/Product/${productId}`
      };

      const response = await admin.graphql(`
        mutation setMetafield($metafield: MetafieldsSetInput!) {
          metafieldsSet(metafields: [$metafield]) {
            metafields {
              id
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        variables: {
          metafield: metafieldInput
        }
      });

      const result = await response.json();
      
      if (result.data.metafieldsSet.userErrors.length > 0) {
        return json({ 
          error: result.data.metafieldsSet.userErrors[0].message 
        }, { status: 400 });
      }

      return json({ success: true, message: "Extra Fields gespeichert!" });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function ProductExtraFields() {
  const { product, extraFieldsConfig } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [fields, setFields] = React.useState<ExtraField[]>(extraFieldsConfig.fields || []);

  const addField = () => {
    setFields([...fields, {
      productId: product.id,
      name: `field_${Date.now()}`,
      type: 'number',
      label: 'Neues Feld',
      required: false,
      enabled: true,
      pricePerUnit: 0
    }]);
  };

  const updateField = (index: number, updates: Partial<ExtraField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link
          to="/"
          style={{ color: "#008060", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}
        >
          ← Zurück zur Übersicht
        </Link>
        <h1 style={{ fontSize: "2rem", marginTop: "1rem" }}>
          Extra Fields für: {product.title}
        </h1>
      </div>

      {actionData?.success && (
        <div style={{
          padding: "1rem",
          backgroundColor: "#d4edda",
          color: "#155724",
          borderRadius: "4px",
          marginBottom: "1rem"
        }}>
          {actionData.message}
        </div>
      )}

      {actionData?.error && (
        <div style={{
          padding: "1rem",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderRadius: "4px",
          marginBottom: "1rem"
        }}>
          Fehler: {actionData.error}
        </div>
      )}

      <Form method="post">
        <input type="hidden" name="action" value="save" />
        <input type="hidden" name="fields" value={JSON.stringify(fields)} />

        <div style={{ marginBottom: "2rem" }}>
          <button
            type="button"
            onClick={addField}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#008060",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            + Feld hinzufügen
          </button>
        </div>

        {fields.length === 0 ? (
          <p style={{ color: "#666", padding: "2rem", textAlign: "center" }}>
            Noch keine Extra Fields konfiguriert. Klicken Sie auf "Feld hinzufügen" um zu beginnen.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {fields.map((field, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  backgroundColor: "#fff"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0 }}>Feld {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Entfernen
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Feld-Label *
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Feld-Typ *
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as ExtraField['type'] })}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                      }}
                    >
                      <option value="number">Zahl</option>
                      <option value="text">Text</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Einheit (z.B. "cm")
                    </label>
                    <input
                      type="text"
                      value={field.unit || ""}
                      onChange={(e) => updateField(index, { unit: e.target.value })}
                      placeholder="cm"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Preis pro Einheit (Cent)
                    </label>
                    <input
                      type="number"
                      value={field.pricePerUnit || 0}
                      onChange={(e) => updateField(index, { pricePerUnit: parseInt(e.target.value) || 0 })}
                      min="0"
                      step="1"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                      }}
                    />
                    {field.pricePerUnit && field.pricePerUnit > 0 && (
                      <small style={{ color: "#666", display: "block", marginTop: "0.25rem" }}>
                        = {(field.pricePerUnit / 100).toFixed(2)} € pro {field.unit || "Einheit"}
                      </small>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Minimum
                    </label>
                    <input
                      type="number"
                      value={field.min || ""}
                      onChange={(e) => updateField(index, { min: parseInt(e.target.value) || undefined })}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Maximum
                    </label>
                    <input
                      type="number"
                      value={field.max || ""}
                      onChange={(e) => updateField(index, { max: parseInt(e.target.value) || undefined })}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Schrittweite
                    </label>
                    <input
                      type="number"
                      value={field.step || 1}
                      onChange={(e) => updateField(index, { step: parseFloat(e.target.value) || 1 })}
                      min="0.01"
                      step="0.01"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={field.enabled}
                      onChange={(e) => updateField(index, { enabled: e.target.checked })}
                    />
                    <span>Feld aktivieren</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    <span>Pflichtfeld</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={field.showPriceCalculation || false}
                      onChange={(e) => updateField(index, { showPriceCalculation: e.target.checked })}
                    />
                    <span>Preisberechnung anzeigen</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#008060",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: navigation.state === "submitting" ? "not-allowed" : "pointer",
              fontWeight: "600",
              opacity: navigation.state === "submitting" ? 0.6 : 1
            }}
          >
            {navigation.state === "submitting" ? "Speichern..." : "Speichern"}
          </button>
        </div>
      </Form>
    </div>
  );
}

// React import hinzufügen
import React from "react";
import { Link } from "@remix-run/react";
