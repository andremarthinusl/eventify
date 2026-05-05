import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginPayload;
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email dan password wajib diisi." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id,name,email,role")
    .eq("email", email)
    .eq("password", password)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: "Email atau password salah." },
      { status: 401 }
    );
  }

  if (!data.role) {
    return NextResponse.json(
      { message: "Maaf anda tidak bisa mengakses halaman ini." },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true, user: data });
}
