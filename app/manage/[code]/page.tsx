
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

export default function ManageCardPage() {
  const params = useParams();
  const code = String(params.code ?? "").toUpperCase();

  const [activationCode, setActivationCode] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/update-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardCode: code,
          activationCode,
          reviewUrl: reviewUrl.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error || "Gagal memperbarui link."
        );
        return;
      }

      setSuccess(true);
      setMessage(
        "Link Google Review berhasil diperbarui!"
      );

      setActivationCode("");
      setReviewUrl("");
    } catch {
      setMessage(
        "Terjadi kesalahan koneksi. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

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
          Kelola Review Card
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Kode Kartu: <strong>{code}</strong>
        </p>

        <p
          style={{
            color: "#64748b",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          Perbarui link Google Review tanpa
          mengganti QR atau NFC kartu.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "18px",
            marginTop: "24px",
          }}
        >
          <label>
            <strong>Kode Aktivasi Rahasia</strong>
            <input
              type="password"
              required
              autoComplete="off"
              value={activationCode}
              onChange={(e) =>
                setActivationCode(e.target.value)
              }
              placeholder="Masukkan kode aktivasi"
              style={{
                ...inputStyle,
                marginTop: "8px",
              }}
            />
          </label>

          <label>
            <strong>Link Google Review Baru</strong>
            <input
              type="url"
              required
              value={reviewUrl}
              onChange={(e) =>
                setReviewUrl(e.target.value)
              }
              placeholder="https://g.page/r/..."
              style={{
                ...inputStyle,
                marginTop: "8px",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "8px",
              background: success
                ? "#dcfce7"
                : "#fee2e2",
              color: success
                ? "#166534"
                : "#991b1b",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          <a
            href={`/card/${encodeURIComponent(code)}`}
            style={{ color: "#2563eb" }}
          >
            Lihat Halaman Kartu
          </a>
        </p>

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
