
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function CardPage() {
  const params = useParams();
  const code = String(params.code ?? "");

  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [activationCode, setActivationCode] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box" as const,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "460px",
          margin: "auto",
          background: "white",
          padding: "30px",
          borderRadius: "18px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            color: "#2563eb",
            textAlign: "center",
            fontSize: "32px",
          }}
        >
          MAPIFY
        </h1>

        <h2 style={{ textAlign: "center" }}>
          Aktivasi Review Card
        </h2>

        <p
          style={{
            color: "#64748b",
            textAlign: "center",
          }}
        >
          Kode Kartu: <strong>{code}</strong>
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert(
              "Tampilan formulir berhasil! Sistem aktivasi belum terhubung."
            );
          }}
          style={{
            display: "grid",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <label>
            <strong>Kode Aktivasi</strong>
            <input
              type="password"
              required
              value={activationCode}
              onChange={(e) =>
                setActivationCode(e.target.value)
              }
              placeholder="Masukkan kode aktivasi"
              style={{ ...inputStyle, marginTop: "8px" }}
            />
          </label>

          <label>
            <strong>Nama Usaha</strong>
            <input
              required
              value={businessName}
              onChange={(e) =>
                setBusinessName(e.target.value)
              }
              placeholder="Contoh: Urban Kopi"
              style={{ ...inputStyle, marginTop: "8px" }}
            />
          </label>

          <label>
            <strong>Nomor WhatsApp</strong>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) =>
                setWhatsapp(e.target.value)
              }
              placeholder="Contoh: 6281234567890"
              style={{ ...inputStyle, marginTop: "8px" }}
            />
          </label>

          <label>
            <strong>Link Google Review</strong>
            <input
              type="url"
              required
              value={reviewUrl}
              onChange={(e) =>
                setReviewUrl(e.target.value)
              }
              placeholder="https://..."
              style={{ ...inputStyle, marginTop: "8px" }}
            />
          </label>

          <button
            type="submit"
            style={{
              background: "#2563eb",
              color: "white",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Aktifkan Kartu
          </button>
        </form>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "12px",
            textAlign: "center",
            marginTop: "28px",
          }}
        >
          © 2026 MAPIFY. Make Every Review Matter.
        </p>
      </section>
    </main>
  );
}
