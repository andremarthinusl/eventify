import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

type CreateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: boolean;
};

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id,name,email,role")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as CreateUserPayload;

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const role = body.role ?? false;

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Nama, email, dan password wajib diisi." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({ name, email, password, role })
    .select("id,name,email,role")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: error?.message ?? "Gagal menambah user." },
      { status: 500 }
    );
  }

  return NextResponse.json({ user: data }, { status: 201 });
}