
"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type GeneratedCard = {
  card_code: string;
  activation_code: string;
  card_url: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    boxSizing: "border-box" as const,
    fontSize: "15px",
  };

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Login gagal.");
        return;
      }

      setLoggedIn(true);
      setPassword("");
      setMessage("Login admin berhasil.");
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");
    setCards([]);

    try {
      const response = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ quantity }),
      });

      const result = await response.json();

      if (response.status === 401) {
        setLoggedIn(false);
        setError("Sesi berakhir. Silakan login kembali.");
        return;
      }

      if (!response.ok) {
        setError(result.error || "Gagal membuat kartu.");
        return;
      }

      setCards(result.cards);
      setMessage(
        `${result.quantity} kartu berhasil dibuat! Segera unduh CSV.`
      );
    } catch {
      setError(
        "Koneksi terputus. Periksa database sebelum mencoba lagi agar tidak membuat kartu ganda."
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (cards.length === 0) return;

    const escapeCSV = (value: string) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const rows = [
      ["Kode Kartu", "URL QR NFC", "Kode Aktivasi"],
      ...cards.map((card) => [
        card.card_code,
        card.card_url,
        card.activation_code,
      ]),
    ];

    const csv = rows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `MAPIFY-KARTU-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

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
          maxWidth: "650px",
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
          }}
        >
          MAPIFY
        </h1>

        <h2 style={{ textAlign: "center" }}>
          Admin Card Generator
        </h2>

        {!loggedIn ? (
          <form
            onSubmit={handleLogin}
            style={{
              display: "grid",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            <p style={{ color: "#64748b" }}>
              Masukkan password admin untuk mengelola
              pembuatan kartu MAPIFY.
            </p>

            <label>
              <strong>Password Admin</strong>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                padding: "14px",
                border: "none",
                borderRadius: "10px",
                background: "#2563eb",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {loading ? "Memeriksa..." : "Login Admin"}
            </button>
          </form>
        ) : (
          <>
            <p
              style={{
                color: "#64748b",
                textAlign: "center",
              }}
            >
              Buat kartu baru secara otomatis.
            </p>

            <form
              onSubmit={handleGenerate}
              style={{
                display: "grid",
                gap: "16px",
                marginTop: "24px",
              }}
            >
              <label>
                <strong>Jumlah Kartu</strong>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Number(e.target.value))
                  }
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={loading || cards.length > 0}
                style={{
                  padding: "14px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  opacity:
                    loading || cards.length > 0 ? 0.6 : 1,
                }}
              >
                {loading
                  ? "Membuat kartu..."
                  : "Generate Kartu"}
              </button>
            </form>

            {cards.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <h3>Hasil Generate</h3>

                <p style={{ color: "#64748b" }}>
                  Kode aktivasi hanya ditampilkan saat
                  pembuatan kartu. Simpan CSV dengan aman.
                </p>

                <div
                  style={{
                    overflowX: "auto",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ padding: "10px" }}>
                          Kartu
                        </th>
                        <th style={{ padding: "10px" }}>
                          URL QR
                        </th>
                        <th style={{ padding: "10px" }}>
                          Kode Aktivasi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {cards.map((card) => (
                        <tr key={card.card_code}>
                          <td style={{ padding: "10px" }}>
                            {card.card_code}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {card.card_url}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {card.activation_code}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={downloadCSV}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    padding: "14px",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Download CSV Kartu
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Pastikan CSV sudah disimpan. Kode aktivasi tidak dapat ditampilkan kembali. Lanjutkan?"
                      )
                    ) {
                      setCards([]);
                      setMessage("");
                    }
                  }}
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "12px",
                    background: "#e2e8f0",
                    color: "#0f172a",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  Buat Batch Berikutnya
                </button>
              </div>
            )}
          </>
        )}

        {message && (
          <p
            role="status"
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "8px",
            }}
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "8px",
            }}
          >
            {error}
          </p>
        )}

        <p
          style={{
            marginTop: "28px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          © 2026 MAPIFY. Make Every Review Matter.
        </p>
      </section>
    </main>
  );
}
