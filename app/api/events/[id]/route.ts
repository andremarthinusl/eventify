import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const getText = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id: eventId } = await params;
  if (!eventId) {
    return NextResponse.json({ message: "ID event tidak valid." }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("image");

  const title = getText(form, "title");
  const tanggal = getText(form, "tanggal");
  const waktu = getText(form, "waktu");
  const lokasi = getText(form, "lokasi");
  const kuota = Number(getText(form, "kuota"));
  const deskripsi = getText(form, "deskripsi");
  const category = getText(form, "category");
  const price = getText(form, "price") || "Gratis";
  const organizerId = Number(getText(form, "organizer_id"));

  if (
    !title ||
    !tanggal ||
    !waktu ||
    !lokasi ||
    !Number.isFinite(kuota) ||
    !deskripsi ||
    !category ||
    !Number.isFinite(organizerId)
  ) {
    return NextResponse.json(
      { message: "Semua field wajib diisi." },
      { status: 400 }
    );
  }

  let imageUrl: string | undefined;
  if (file instanceof File) {
    const ext = file.name.split(".").pop();
    const safeExt = ext ? `.${ext}` : "";
    const fileName = `${crypto.randomUUID()}${safeExt}`;
    const storagePath = `events/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("event-images")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      return NextResponse.json(
        { message: uploadError.message ?? "Gagal upload image." },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("event-images")
      .getPublicUrl(storagePath);
    imageUrl = publicUrlData?.publicUrl ?? "";
  }

  const updates: Record<string, unknown> = {
    title,
    tanggal,
    waktu,
    lokasi,
    kuota,
    deskripsi,
    category,
    price: price || "Gratis",
    organizer_id: organizerId,
  };

  if (typeof imageUrl === "string") {
    updates.image_url = imageUrl;
  }

  const { error: updateError } = await supabaseAdmin
    .from("events")
    .update(updates)
    .eq("id", eventId);

  if (updateError) {
    return NextResponse.json(
      { message: updateError.message ?? "Gagal memperbarui event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const { id: eventId } = await params;
  if (!eventId) {
    return NextResponse.json({ message: "ID event tidak valid." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("events").delete().eq("id", eventId);

  if (error) {
    return NextResponse.json(
      { message: error.message ?? "Gagal menghapus event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
