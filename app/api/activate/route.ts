
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 1. Menerima data dari formulir aktivasi
    const body = await request.json();

    const {
      cardCode,
      activationCode,
      businessName,
      whatsapp,
      reviewUrl,
    } = body ?? {};

    // 2. Memeriksa tipe data
    if (
      typeof cardCode !== "string" ||
      typeof activationCode !== "string" ||
      typeof businessName !== "string" ||
      typeof whatsapp !== "string" ||
      typeof reviewUrl !== "string"
    ) {
      return NextResponse.json(
        { error: "Data aktivasi tidak lengkap." },
        { status: 400 }
      );
    }

    // 3. Membersihkan data
    const code = cardCode.trim();
    const name = businessName.trim();
    const phone = whatsapp.trim();
    const url = reviewUrl.trim();

    // 4. Validasi data
    if (
      !/^MP[A-Z0-9]{3,20}$/.test(code) ||
      name.length < 2 ||
      name.length > 100 ||
      !/^628[0-9]{7,12}$/.test(phone) ||
      activationCode.length < 1 ||
      activationCode.length > 128
    ) {
      return NextResponse.json(
        { error: "Format data aktivasi tidak valid." },
        { status: 400 }
      );
    }

    // 5. Validasi link Google Review
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Link Google Review tidak valid." },
        { status: 400 }
      );
    }

    const allowedHosts = [
      "google.com",
      "www.google.com",
      "maps.google.com",
      "search.google.com",
      "g.page",
    ];

    if (
      parsedUrl.protocol !== "https:" ||
      !allowedHosts.includes(parsedUrl.hostname)
    ) {
      return NextResponse.json(
        {
          error:
            "Gunakan link Google Review yang valid.",
        },
        { status: 400 }
      );
    }

    // 6. Mengambil konfigurasi Supabase dari Vercel
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error(
        "MAPIFY configuration error: Missing environment variable"
      );

      return NextResponse.json(
        { error: "Konfigurasi server belum lengkap." },
        { status: 500 }
      );
    }

    // 7. Membuat koneksi Supabase khusus server
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

    // 8. Memanggil fungsi aktivasi di Supabase
    const { data, error } = await supabase.rpc(
      "activate_mapify_card",
      {
        p_card_code: code,
        p_activation_code: activationCode,
        p_business_name: name,
        p_whatsapp: phone,
        p_review_url: url,
      }
    );

    // 9. Mencatat error Supabase secara lebih lengkap
    if (error) {
      console.error("Activation RPC failed:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      return NextResponse.json(
        {
          error:
            "Aktivasi belum dapat diproses. Periksa log server.",
        },
        { status: 500 }
      );
    }

    // 10. Jika kode aktivasi salah atau kartu sudah aktif
    if (data !== true) {
      return NextResponse.json(
        {
          error:
            "Aktivasi gagal. Periksa kode aktivasi atau status kartu.",
        },
        { status: 400 }
      );
    }

    // 11. Jika aktivasi berhasil
    return NextResponse.json({
      success: true,
      message: "Kartu MAPIFY berhasil diaktifkan!",
    });
  } catch (error) {
    // 12. Mencatat kesalahan yang tidak terduga
    console.error(
      "MAPIFY activation error:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return NextResponse.json(
      {
        error:
          "Permintaan tidak dapat diproses.",
      },
      { status: 500 }
    );
  }
}
