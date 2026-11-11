
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      cardCode,
      activationCode,
      businessName,
      whatsapp,
      reviewUrl,
    } = body;

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

    const code = cardCode.trim();
    const name = businessName.trim();
    const phone = whatsapp.trim();
    const url = reviewUrl.trim();

    if (
      !/^MP[A-Z0-9]{3,20}$/.test(code) ||
      name.length < 2 ||
      name.length > 100 ||
      !/^628[0-9]{7,12}$/.test(phone) ||
      activationCode.length > 128
    ) {
      return NextResponse.json(
        { error: "Format data tidak valid." },
        { status: 400 }
      );
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Link Google Review tidak valid." },
        { status: 400 }
      );
    }

    if (
      parsedUrl.protocol !== "https:" ||
      ![
        "google.com",
        "www.google.com",
        "maps.google.com",
        "g.page",
      ].includes(parsedUrl.hostname)
    ) {
      return NextResponse.json(
        { error: "Gunakan link Google Review yang valid." },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("Supabase server configuration missing");

      return NextResponse.json(
        { error: "Konfigurasi server belum lengkap." },
        { status: 500 }
      );
    }

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

    if (error) {
      console.error("Activation RPC failed:", error.code);

      return NextResponse.json(
        { error: "Aktivasi belum dapat diproses." },
        { status: 500 }
      );
    }

    if (data !== true) {
      return NextResponse.json(
        {
          error:
            "Aktivasi gagal. Periksa kode aktivasi atau status kartu.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kartu MAPIFY berhasil diaktifkan!",
    });
 
} catch (error) {
  console.error(
    "MAPIFY activation error:",
    error instanceof Error ? error.message : "Unknown error"
  );

  return NextResponse.json(
    { error: "Permintaan tidak dapat diproses." },
    { status: 500 }
  );
}

}
