
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function isAllowedReviewUrl(value: string): boolean {
  try {
    const url = new URL(value);

    const allowedHosts = [
      "g.page",
      "google.com",
      "www.google.com",
      "maps.google.com",
      "search.google.com",
    ];

    return (
      url.protocol === "https:" &&
      allowedHosts.includes(url.hostname) &&
      url.username === "" &&
      url.password === "" &&
      !url.pathname.includes("CONTOH") &&
      value.length <= 2048
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      cardCode,
      activationCode,
      reviewUrl,
    } = body ?? {};

    if (
      typeof cardCode !== "string" ||
      typeof activationCode !== "string" ||
      typeof reviewUrl !== "string"
    ) {
      return NextResponse.json(
        { error: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    const code = cardCode.trim().toUpperCase();

    if (
      !/^MP[0-9]{3,6}$/.test(code) ||
      activationCode.length < 1 ||
      activationCode.length > 200
    ) {
      return NextResponse.json(
        { error: "Kode kartu atau aktivasi tidak valid." },
        { status: 400 }
      );
    }

    if (!isAllowedReviewUrl(reviewUrl)) {
      return NextResponse.json(
        { error: "Masukkan link Google Review yang valid." },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("MAPIFY: Supabase configuration missing");

      return NextResponse.json(
        { error: "Konfigurasi server belum lengkap." },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data, error } = await supabase.rpc(
      "update_mapify_review_url",
      {
        p_card_code: code,
        p_activation_code: activationCode,
        p_new_review_url: reviewUrl,
      }
    );

    if (error) {
      console.error(
        "MAPIFY update-review database error:",
        error.code,
        error.message
      );

      return NextResponse.json(
        { error: "Gagal memperbarui link." },
        { status: 500 }
      );
    }

    if (data !== true) {
      return NextResponse.json(
        {
          error:
            "Kode aktivasi salah, kartu belum aktif, atau link tidak valid.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Link Google Review berhasil diperbarui.",
    });
  } catch (error) {
    console.error("MAPIFY update-review error:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
