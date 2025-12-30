import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Fetch products with extra fields
  const response = await admin.graphql(`
    query getProductsWithExtraFields {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            metafields(first: 5, namespace: "extra_fields") {
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
      }
    }
  `);

  const data = await response.json();
  return json({
    products: data.data.products.edges.map((edge: any) => ({
      id: edge.node.id.replace('gid://shopify/Product/', ''),
      title: edge.node.title,
      handle: edge.node.handle,
      hasExtraFields: edge.node.metafields.edges.length > 0
    }))
  });
};

export default function Index() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Product Extra Fields
        </h1>
        <p style={{ color: "#666" }}>
          Verwalten Sie zusätzliche Felder für Ihre Produkte mit automatischer Preisberechnung.
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <Link
          to="/products/new"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#008060",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            fontWeight: "600"
          }}
        >
          + Neues Extra Field hinzufügen
        </Link>
      </div>

      <div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Produkte</h2>
        {products.length === 0 ? (
          <p style={{ color: "#666" }}>Keine Produkte gefunden.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>Produkt</th>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>Status</th>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                  <td style={{ padding: "0.75rem" }}>
                    <Link
                      to={`/products/${product.id}`}
                      style={{ color: "#008060", textDecoration: "none" }}
                    >
                      {product.title}
                    </Link>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    {product.hasExtraFields ? (
                      <span style={{ color: "#008060", fontWeight: "600" }}>✓ Aktiv</span>
                    ) : (
                      <span style={{ color: "#999" }}>Nicht konfiguriert</span>
                    )}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <Link
                      to={`/products/${product.id}`}
                      style={{
                        color: "#008060",
                        textDecoration: "none",
                        marginRight: "1rem"
                      }}
                    >
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
