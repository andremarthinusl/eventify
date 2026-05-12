"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { clearSession, isSessionValid, setSessionActive } from "../../../lib/session";

type PriceMode = "gratis" | "berbayar";

type UserItem = {
  id: number;
  name: string;
  email: string;
  role: boolean;
};

type EventItem = {
  id: string;
  title: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  kuota: number;
  deskripsi?: string | null;
  category: string;
  price: string;
  organizer_id: number;
  image_url?: string | null;
  created_at: string;
  users?: { name?: string } | null;
};

export default function NewEventPage() {
  const [title, setTitle] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [kuota, setKuota] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [category, setCategory] = useState("Seminar");
  const [organizerId, setOrganizerId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [priceMode, setPriceMode] = useState<PriceMode>("gratis");
  const [priceValue, setPriceValue] = useState("");

  const [users, setUsers] = useState<UserItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const router = useRouter();


  useEffect(() => {
    document.title = "Eventify - Add Event";
  }, []);

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      router.replace("/");
      return;
    }

    setSessionActive();
    setIsSessionReady(true);
    const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    const handleActivity = () => setSessionActive();
    activityEvents.forEach((event) => window.addEventListener(event, handleActivity));

    const timer = setInterval(() => {
      if (!isSessionValid()) {
        clearSession();
        router.replace("/");
      }
    }, 60000);

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, handleActivity));
      clearInterval(timer);
    };
  }, [router]);

  useEffect(() => {
    const loadUsers = async () => {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as { users?: UserItem[] } | null;
      setUsers(payload?.users ?? []);
    };

    const loadEvents = async () => {
      const response = await fetch("/api/events", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as { events?: EventItem[] } | null;
      setEvents(payload?.events ?? []);
    };

    loadUsers();
    loadEvents();
  }, []);

  const handleLogout = () => setIsLogoutOpen(true);

  const confirmLogout = () => {
    clearSession();
    router.push("/");
  };

  const resetForm = () => {
    setTitle("");
    setTanggal("");
    setWaktu("");
    setLokasi("");
    setKuota("");
    setDeskripsi("");
    setCategory("Seminar");
    setOrganizerId("");
    setImageFile(null);
    setPriceMode("gratis");
    setPriceValue("");
  };

  const openModal = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setModalMode("create");
    setEditingId(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const openDeleteConfirm = (eventItem: EventItem) => {
    setErrorMessage("");
    setSuccessMessage("");
    setDeleteTarget(eventItem);
    setIsDeleteOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteOpen(false);
    setDeleteTarget(null);
  };

  const openEditModal = (eventItem: EventItem) => {
    setErrorMessage("");
    setSuccessMessage("");
    setModalMode("edit");
    setEditingId(eventItem.id);
    setTitle(eventItem.title);
    setTanggal(eventItem.tanggal);
    setWaktu(eventItem.waktu);
    setLokasi(eventItem.lokasi);
    setKuota(String(eventItem.kuota));
    setDeskripsi(eventItem.deskripsi ?? "");
    setCategory(eventItem.category);
    setOrganizerId(String(eventItem.organizer_id));
    setPriceMode(eventItem.price === "Gratis" ? "gratis" : "berbayar");
    setPriceValue(eventItem.price === "Gratis" ? "" : eventItem.price);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !title.trim() ||
      !tanggal ||
      !waktu ||
      !lokasi.trim() ||
      !kuota ||
      !deskripsi.trim() ||
      !category.trim() ||
      !organizerId.trim()
    ) {
      setErrorMessage("Semua field wajib diisi.");
      return;
    }

    const finalPrice =
      priceMode === "berbayar" && priceValue.trim() ? priceValue.trim() : "Gratis";

    setIsSubmitting(true);

    if (modalMode === "create") {
      if (!imageFile) {
        setErrorMessage("Image wajib diupload.");
        setIsSubmitting(false);
        return;
      }
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("tanggal", tanggal);
      formData.append("waktu", waktu);
      formData.append("lokasi", lokasi.trim());
      formData.append("kuota", kuota);
      formData.append("deskripsi", deskripsi.trim());
      formData.append("category", category.trim());
      formData.append("organizer_id", organizerId.trim());
      formData.append("price", finalPrice);
      formData.append("image", imageFile);

      const response = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setErrorMessage(payload?.message ?? "Gagal menambah event.");
        setIsSubmitting(false);
        return;
      }
    } else if (editingId) {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("tanggal", tanggal);
      formData.append("waktu", waktu);
      formData.append("lokasi", lokasi.trim());
      formData.append("kuota", kuota);
      formData.append("deskripsi", deskripsi.trim());
      formData.append("category", category.trim());
      formData.append("organizer_id", organizerId.trim());
      formData.append("price", finalPrice);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(`/api/events/${editingId}`, {
        method: "PATCH",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setErrorMessage(payload?.message ?? "Gagal memperbarui event.");
        setIsSubmitting(false);
        return;
      }
    }

    setSuccessMessage(
      modalMode === "create" ? "Event berhasil ditambahkan." : "Event berhasil diperbarui."
    );
    setIsSubmitting(false);
    closeModal();

    const refresh = await fetch("/api/events", { cache: "no-store" });
    const eventsPayload = (await refresh.json().catch(() => null)) as { events?: EventItem[] } | null;
    setEvents(eventsPayload?.events ?? []);
  };

  const handleDelete = async (id: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    const response = await fetch(`/api/events/${id}`, { method: "DELETE" });
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setErrorMessage(payload?.message ?? "Gagal menghapus event.");
      return;
    }

    setSuccessMessage("Event berhasil dihapus.");
    const refresh = await fetch("/api/events", { cache: "no-store" });
    const eventsPayload = (await refresh.json().catch(() => null)) as { events?: EventItem[] } | null;
    setEvents(eventsPayload?.events ?? []);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    await handleDelete(deleteTarget.id);
    closeDeleteConfirm();
  };

  if (!isSessionReady) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111211] text-[#f4f4f2]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-row gap-4 overflow-x-hidden px-3 py-5 sm:gap-8 sm:px-8 sm:py-10">
        <Sidebar active="events-new" onLogout={handleLogout} />

        <div className="flex min-h-[70vh] w-full min-w-0 flex-1 flex-col gap-6 rounded-2xl border border-white/10 bg-[#191a19]/90 p-4 backdrop-blur sm:p-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Event Management
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Tambah Event</h1>
              <p className="mt-2 text-sm text-white/55">
                Tambahkan event baru dan simpan ke database.
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="h-11 rounded-xl border border-white/15 px-5 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Add Event
            </button>
          </header>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1d1c]/90">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <h2 className="text-base font-semibold text-white">Daftar Event</h2>
              <span className="text-xs text-white/40">{events.length} event</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#161716] text-white/60">
                  <tr>
                    <th className="px-5 py-3 font-medium">Title</th>
                    <th className="px-5 py-3 font-medium">Tanggal</th>
                    <th className="px-5 py-3 font-medium">Waktu</th>
                    <th className="px-5 py-3 font-medium">Lokasi</th>
                    <th className="px-5 py-3 font-medium">Kuota</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Organizer</th>
                    <th className="px-5 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {events.length === 0 ? (
                    <tr>
                      <td className="px-5 py-6 text-white/45" colSpan={9}>
                        Belum ada event.
                      </td>
                    </tr>
                  ) : (
                    events.map((eventItem) => (
                      <tr key={eventItem.id} className="text-white/70">
                        <td className="px-5 py-4 text-white">{eventItem.title}</td>
                        <td className="px-5 py-4 text-white/50">{eventItem.tanggal}</td>
                        <td className="px-5 py-4 text-white/50">{eventItem.waktu}</td>
                        <td className="px-5 py-4 text-white/50">{eventItem.lokasi}</td>
                        <td className="px-5 py-4 text-white/50">{eventItem.kuota}</td>
                        <td className="px-5 py-4 text-white/50">{eventItem.category}</td>
                        <td className="px-5 py-4 text-white/50">{eventItem.price}</td>
                        <td className="px-5 py-4 text-white/50">
                          {eventItem.users?.name ?? "-"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(eventItem)}
                              aria-label="Edit"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:border-white/25 hover:text-white"
                            >
                              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                                <path
                                  d="M4 16.75V20h3.25L18.5 8.75l-3.25-3.25L4 16.75Z"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M13.75 5.5l3.25 3.25"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteConfirm(eventItem)}
                              aria-label="Delete"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-400/20 text-rose-200 transition hover:border-rose-300/40 hover:text-rose-100"
                            >
                              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                                <path
                                  d="M6 7h12"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M9 7V5h6v2"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M8 7l.6 10.2A2 2 0 0 0 10.6 19h2.8a2 2 0 0 0 2-1.8L16 7"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {(errorMessage || successMessage) && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                errorMessage
                  ? "border-rose-400/20 bg-[#1b1414]/90 text-rose-100"
                  : "border-emerald-400/20 bg-[#131a16]/90 text-emerald-100"
              }`}
            >
              {errorMessage || successMessage}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeModal}
            role="presentation"
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#191a19] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Event Baru
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {modalMode === "create" ? "Tambah Event" : "Edit Event"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:text-white"
              >
                ×
              </button>
            </div>

            <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                  placeholder="Judul event"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Category</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                >
                  <option value="Seminar">Seminar</option>
                  <option value="Competition">Competition</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Festival">Festival</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Tanggal</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(event) => setTanggal(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Waktu</label>
                <input
                  type="time"
                  value={waktu}
                  onChange={(event) => setWaktu(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Lokasi</label>
                <input
                  value={lokasi}
                  onChange={(event) => setLokasi(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                  placeholder="Lokasi event"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Kuota</label>
                <input
                  type="number"
                  min="1"
                  value={kuota}
                  onChange={(event) => setKuota(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Organizer</label>
                <select
                  value={organizerId}
                  onChange={(event) => setOrganizerId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                >
                  <option value="">Pilih organizer</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Price</label>
                <select
                  value={priceMode}
                  onChange={(event) => setPriceMode(event.target.value as PriceMode)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                >
                  <option value="gratis">Gratis</option>
                  <option value="berbayar">Berbayar</option>
                </select>
              </div>
              {priceMode === "berbayar" ? (
                <div>
                  <label className="mb-1.5 block text-sm text-white/70">Harga</label>
                  <input
                    type="number"
                    min="0"
                    value={priceValue}
                    onChange={(event) => setPriceValue(event.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                    placeholder="50000"
                  />
                </div>
              ) : (
                <div className="flex items-end text-sm text-white/45">Harga otomatis Gratis.</div>
              )}
              <div className="lg:col-span-2">
                <label className="mb-1.5 block text-sm text-white/70">Deskripsi</label>
                <textarea
                  rows={4}
                  value={deskripsi}
                  onChange={(event) => setDeskripsi(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 py-2 text-sm text-white outline-none focus:border-white/25"
                  placeholder="Deskripsi event"
                />
              </div>
              <div className="lg:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`h-11 rounded-xl border border-white/15 px-6 text-sm text-white/85 transition hover:border-white/30 hover:text-white ${
                    isSubmitting ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Event"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 rounded-xl border border-white/10 px-6 text-sm text-white/50 transition hover:text-white"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLogoutOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsLogoutOpen(false)}
            role="presentation"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#191a19] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Konfirmasi Logout</h3>
            <p className="mt-2 text-sm text-white/55">Yakin ingin logout dari sesi ini?</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={confirmLogout}
                className="h-11 flex-1 rounded-xl border border-white/15 text-sm text-white/85 transition hover:border-white/30 hover:text-white"
              >
                Ya, logout
              </button>
              <button
                type="button"
                onClick={() => setIsLogoutOpen(false)}
                className="h-11 flex-1 rounded-xl border border-white/10 text-sm text-white/50 transition hover:text-white"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeDeleteConfirm}
            role="presentation"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#191a19] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Konfirmasi Hapus</h3>
            <p className="mt-2 text-sm text-white/55">
              Hapus event
              <span className="font-semibold text-white"> {deleteTarget?.title}</span>?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="h-11 flex-1 rounded-xl border border-rose-400/30 text-sm text-rose-100 transition hover:border-rose-300/60 hover:text-rose-50"
              >
                Ya, hapus
              </button>
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="h-11 flex-1 rounded-xl border border-white/10 text-sm text-white/50 transition hover:text-white"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
