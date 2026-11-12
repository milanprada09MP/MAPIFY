
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1. Membaca kode kartu dari URL
    const code = request.nextUrl.searchParams.get("code");

    if (!code || !/^MP[0-9]{3,6}$/.test(code)) {
      return NextResponse.json(
        { error: "Kode kartu tidak valid." },
        { status: 400 }
      );
    }

    // 2. Mengambil konfigurasi Supabase
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("MAPIFY: Supabase configuration missing");

      return NextResponse.json(
        { error: "Konfigurasi server belum lengkap." },
        { status: 500 }
      );
    }

    // 3. Menghubungkan API dengan Supabase
    const supabase = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // 4. Mengambil status dan link tujuan kartu
    const { data, error } = await supabase
      .from("cards")
      .select("is_active, google_review_url")
      .eq("card_code", code)
      .maybeSingle();

    if (error) {
      console.error("MAPIFY card status error:", {
        message: error.message,
        code: error.code,
      });

      return NextResponse.json(
        { error: "Gagal memeriksa status kartu." },
        { status: 500 }
      );
    }

    // 5. Jika kartu tidak terdaftar
    if (!data) {
      return NextResponse.json(
        { error: "Kartu tidak ditemukan." },
        { status: 404 }
      );
    }

    // 6. Jika kartu belum aktif
    if (!data.is_active) {
      return NextResponse.json(
        { isActive: false },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // 7. Jika kartu sudah aktif
    return NextResponse.json(
      {
        isActive: true,
        reviewUrl: data.google_review_url,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "MAPIFY card status error:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return NextResponse.json(
      { error: "Permintaan tidak dapat diproses." },
      { status: 500 }
    );
  }
}
