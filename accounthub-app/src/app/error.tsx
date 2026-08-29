"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: 32,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600 }}>AccountHub hit a snag</div>
          <p style={{ maxWidth: 380, fontSize: 14, color: "#737373" }}>
            {error.message || "Something went wrong loading the app."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 8,
              borderRadius: 6,
              background: "#171717",
              color: "#fff",
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
