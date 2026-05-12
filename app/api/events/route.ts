import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

type EventPayload = {
  title: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  kuota: number;
  deskripsi: string;
  imageUrl: string;
  category: string;
  price: string;
  organizerId: number;
};

const getText = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Image wajib diisi." }, { status: 400 });
  }

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

  const imageUrl = publicUrlData?.publicUrl ?? "";
  const { error: insertError } = await supabaseAdmin
    .from("events")
    .insert({
      title,
      tanggal,
      waktu,
      lokasi,
      kuota,
      deskripsi,
      image_url: imageUrl,
      category,
      price: price || "Gratis",
      organizer_id: organizerId,
    });

  if (insertError) {
    return NextResponse.json(
      { message: insertError.message ?? "Gagal menambah event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("events")
    .select("id,title,tanggal,waktu,lokasi,kuota,deskripsi,category,price,image_url,organizer_id,created_at,users(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: error.message ?? "Gagal memuat event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ events: data ?? [] });
}
