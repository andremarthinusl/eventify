import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

type UpdateUserPayload = {
  name?: string;
  password?: string;
  role?: boolean;
};

type RouteContext = {
  params: { id: string };
};

export async function PATCH(request: Request, context: RouteContext) {
  const body = (await request.json().catch(() => ({}))) as UpdateUserPayload;
  const name = body.name?.trim();
  const password = body.password;
  const role = body.role;
  const id = Number(context.params.id);

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (name) {
    updates.name = name;
  }
  if (typeof password === "string" && password.length > 0) {
    updates.password = password;
  }
  if (typeof role === "boolean") {
    updates.role = role;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { message: "Tidak ada data yang diperbarui." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", id)
    .select("id,name,email,role")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: error?.message ?? "Gagal memperbarui user." },
      { status: 500 }
    );
  }

  return NextResponse.json({ user: data });
}

export async function DELETE(_: Request, context: RouteContext) {
  const id = Number(context.params.id);

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: error.message ?? "Gagal menghapus user." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
