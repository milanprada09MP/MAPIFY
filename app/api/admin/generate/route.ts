
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSession,
} from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GeneratedCard = {
  card_code: string;
  activation_code: string;
  card_url: string;
};

export async function POST(request: NextRequest) {
  try {
    // Hanya izinkan permintaan dari website MAPIFY.
    const origin = request.headers.get("origin");
    const expectedOrigin = new URL(request.url).origin;

    if (origin !== expectedOrigin) {
      return NextResponse.json(
        { error: "Permintaan tidak diizinkan." },
        { status: 403 }
      );
    }

    // Periksa sesi login admin.
    const session = request.cookies.get(
      ADMIN_COOKIE_NAME
    )?.value;

    if (!verifyAdminSession(session)) {
      return NextResponse.json(
        { error: "Silakan login sebagai admin." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const quantity = body?.quantity;

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Jumlah kartu harus berupa angka 1 sampai 100.",
        },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "Konfigurasi Supabase belum lengkap."
      );

      return NextResponse.json(
        { error: "Konfigurasi server belum siap." },
        { status: 503 }
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
      "generate_mapify_cards",
      {
        p_quantity: quantity,
      }
    );

    if (error) {
      console.error(
        "MAPIFY generate error:",
        error.message
      );

      return NextResponse.json(
        {
          error:
            "Gagal membuat kartu. Periksa konfigurasi generator.",
        },
        { status: 500 }
      );
    }

    const cards = (data ?? []) as GeneratedCard[];

    if (cards.length !== quantity) {
      console.error(
        "Jumlah kartu tidak sesuai:",
        cards.length
      );

      return NextResponse.json(
        {
          error:
            "Hasil generator tidak sesuai. Periksa database sebelum mencoba lagi.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        quantity: cards.length,
        cards,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "MAPIFY admin generate error:",
      error
    );

    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
