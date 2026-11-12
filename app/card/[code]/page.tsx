
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type CardStatus =
  | "checking"
  | "inactive"
  | "redirecting"
  | "invalid-url"
  | "error";

function isValidGoogleReviewUrl(value: string) {
  try {
    const url = new URL(value);

    const allowedHosts = [
      "g.page",
      "google.com",
      "www.google.com",
      "maps.google.com",
    ];

    return (
      url.protocol === "https:" &&
      allowedHosts.includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.pathname.includes("CONTOH")
    );
  } catch {
    return false;
  }
}

export default function CardPage() {
  const params = useParams();
  const code = String(params.code ?? "").toUpperCase();

  const [status, setStatus] =
    useState<CardStatus>("checking");

  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    async function checkCard() {
      try {
        const response = await fetch(
          `/api/card-status?code=${encodeURIComponent(code)}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Gagal memeriksa kartu."
          );
        }

        if (cancelled) return;

        if (result.isActive) {
          if (
            typeof result.reviewUrl === "string" &&
            isValidGoogleReviewUrl(result.reviewUrl)
          ) {
            setStatus("redirecting");
            window.location.replace(result.reviewUrl);
          } else {
            setStatus("invalid-url");
          }
        } else {
          setStatus("inactive");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("MAPIFY status error:", error);
          setStatus("error");
        }
      }
    }

    checkCard();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box" as const,
  };

  async function handleActivation(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!isValidGoogleReviewUrl(reviewUrl)) {
      alert(
        "Masukkan link Google Review asli dari Google Maps."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardCode: code,
          activationCode,
          businessName,
          whatsapp,
          reviewUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Aktivasi gagal.");
        return;
      }

      alert("Kartu MAPIFY berhasil diaktifkan!");
      window.location.reload();
    } catch {
      alert("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
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

        <p
          style={{
            color: "#64748b",
            textAlign: "center",
          }}
        >
          Kode Kartu: <strong>{code}</strong>
        </p>

        {status === "checking" && (
          <p style={{ textAlign: "center" }}>
            Memeriksa status kartu...
          </p>
        )}

        {status === "redirecting" && (
          <p style={{ textAlign: "center" }}>
            Mengarahkan ke Google Review...
          </p>
        )}

        {status === "invalid-url" && (
          <div style={{ textAlign: "center" }}>
            <h2>Link Review Belum Valid</h2>
            <p>
              Kartu ini sudah aktif, tetapi link
              Google Review belum valid.
            </p>
            <p>
              Silakan hubungi pengelola MAPIFY
              untuk memperbarui link.
            </p>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center" }}>
            <h2>Terjadi Gangguan</h2>
            <p>
              Status kartu belum dapat diperiksa.
              Silakan coba beberapa saat lagi.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {status === "inactive" && (
          <>
            <h2 style={{ textAlign: "center" }}>
              Aktivasi Review Card
            </h2>

            <form
              onSubmit={handleActivation}
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
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
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
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
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
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
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
                  placeholder="https://g.page/r/..."
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "14px",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: submitting
                    ? "not-allowed"
                    : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting
                  ? "Memproses..."
                  : "Aktifkan Kartu"}
              </button>
            </form>
          </>
        )}

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
