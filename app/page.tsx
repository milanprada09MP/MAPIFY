
export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ color: "#2563eb", fontSize: "36px" }}>
          MAPIFY
        </h1>

        <h2 style={{ color: "#1e293b" }}>
          Make Every Review Matter.
        </h2>

        <p style={{ color: "#64748b", lineHeight: "1.7" }}>
          Welcome to MAPIFY. Activate your NFC and QR
          Review Card to make it easier for customers
          to discover and review your business.
        </p>

        <button
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "14px 28px",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Coming Soon
        </button>

        <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "30px" }}>
          © 2026 MAPIFY. All rights reserved.
        </p>
      </section>
    </main>
  );
}
