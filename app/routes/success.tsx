import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";
import { Polar } from "@polar-sh/sdk";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  // Polar sends either checkoutId or checkout_id depending on the flow
  const checkoutId =
    url.searchParams.get("checkoutId") ||
    url.searchParams.get("checkout_id");

  if (!checkoutId) {
    return {
      success: false,
      error: "No checkout ID provided",
      checkout: null,
    };
  }

  try {
    const checkout = await polarClient.checkouts.get({
      id: checkoutId,
    });

    const isSuccessful = checkout.status === "succeeded";

    return {
      success: isSuccessful,
      error: isSuccessful ? null : `Checkout status: ${checkout.status}`,
      checkout: {
        id: checkout.id,
        status: checkout.status,
        customerEmail: checkout.customerEmail,
        productName: checkout.product?.name ?? null,
        amount: checkout.amount,
        currency: checkout.currency,
      },
    };
  } catch (error) {
    console.error("Failed to verify checkout:", error);
    return {
      success: false,
      error: "Failed to verify checkout. Please contact support.",
      checkout: null,
    };
  }
}

export default function SuccessPage() {
  const { success, error, checkout } = useLoaderData<typeof loader>();

  if (!success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a2e",
          color: "#e0e0e0",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "480px",
            padding: "48px 32px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "12px",
              color: "#ff6b6b",
            }}
          >
            Payment Issue
          </h1>
          <p style={{ color: "#999", marginBottom: "24px", lineHeight: 1.6 }}>
            {error}
          </p>
          <Link
            to="/app"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 500,
              transition: "background 0.2s",
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)",
        color: "#e0e0e0",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "520px",
          padding: "48px 40px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00c853, #69f0ae)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "28px",
          }}
        >
          ✓
        </div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "8px",
            background: "linear-gradient(135deg, #fff, #b0bec5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Payment Successful!
        </h1>
        <p
          style={{
            color: "#78909c",
            marginBottom: "32px",
            fontSize: "16px",
            lineHeight: 1.6,
          }}
        >
          Thank you for your purchase. Your account has been upgraded.
        </p>

        {checkout && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "12px",
              padding: "20px 24px",
              marginBottom: "32px",
              border: "1px solid rgba(255,255,255,0.06)",
              textAlign: "left",
            }}
          >
            {checkout.productName && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span style={{ color: "#78909c", fontSize: "14px" }}>
                  Product
                </span>
                <span style={{ color: "#e0e0e0", fontWeight: 500 }}>
                  {checkout.productName}
                </span>
              </div>
            )}
            {checkout.amount != null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span style={{ color: "#78909c", fontSize: "14px" }}>
                  Amount
                </span>
                <span style={{ color: "#e0e0e0", fontWeight: 500 }}>
                  {(checkout.amount / 100).toFixed(2)}{" "}
                  {(checkout.currency ?? "USD").toUpperCase()}
                </span>
              </div>
            )}
            {checkout.customerEmail && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#78909c", fontSize: "14px" }}>
                  Email
                </span>
                <span style={{ color: "#e0e0e0", fontWeight: 500 }}>
                  {checkout.customerEmail}
                </span>
              </div>
            )}
          </div>
        )}

        <Link
          to="/app"
          style={{
            display: "inline-block",
            padding: "14px 40px",
            background: "linear-gradient(135deg, #6c63ff, #3f51b5)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "15px",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 16px rgba(108, 99, 255, 0.3)",
          }}
        >
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}
