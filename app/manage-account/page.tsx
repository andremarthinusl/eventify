"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, isSessionValid, setSessionActive } from "../../lib/session";
import Sidebar from "../components/Sidebar";

type UserItem = {
  id: number;
  name: string;
  email: string;
  role: boolean;
};

type ApiPayload = { message?: string; users?: UserItem[]; user?: UserItem } | null;

type ModalMode = "create" | "edit";

export default function ManageAccountPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(false);

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingId) ?? null,
    [users, editingId]
  );

  const resetFeedback = () => {
    setFormError("");
    setFormSuccess("");
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole(false);
    setEditingId(null);
  };

  const loadUsers = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as ApiPayload;

    if (!response.ok) {
      setFormError(payload?.message ?? "Gagal memuat data user.");
      setIsLoading(false);
      return;
    }

    setUsers(payload?.users ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    document.title = "Eventify - Manage Account";
    loadUsers();
  }, []);

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      router.replace("/");
      return;
    }

    setSessionActive();
    setIsSessionReady(true);
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    const handleActivity = () => setSessionActive();
    events.forEach((event) => window.addEventListener(event, handleActivity));

    const timer = setInterval(() => {
      if (!isSessionValid()) {
        clearSession();
        router.replace("/");
      }
    }, 60000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearInterval(timer);
    };
  }, [router]);

  const handleLogout = () => {
    setIsLogoutOpen(true);
  };

  const confirmLogout = () => {
    clearSession();
    router.push("/");
  };

  const openCreateModal = () => {
    resetFeedback();
    setModalMode("create");
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserItem) => {
    resetFeedback();
    setModalMode("edit");
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (!name.trim() || !email.trim()) {
      setFormError("Nama dan email wajib diisi.");
      return;
    }

    if (modalMode === "create" && !password) {
      setFormError("Password wajib diisi untuk user baru.");
      return;
    }

    const endpoint = modalMode === "create" ? "/api/admin/users" : `/api/admin/users/${editingId}`;
    const method = modalMode === "create" ? "POST" : "PATCH";

    const payload: Record<string, unknown> = {
      name: name.trim(),
      email: email.trim(),
      role,
    };

    if (password) {
      payload.password = password;
    }

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as ApiPayload;
    if (!response.ok) {
      setFormError(data?.message ?? "Gagal menyimpan user.");
      return;
    }

    setFormSuccess(modalMode === "create" ? "User berhasil ditambahkan." : "User berhasil diperbarui.");
    closeModal();
    await loadUsers();
  };

  const handleDelete = async (id: number) => {
    resetFeedback();
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = (await response.json().catch(() => null)) as ApiPayload;

    if (!response.ok) {
      setFormError(data?.message ?? "Gagal menghapus user.");
      return;
    }

    setFormSuccess("User berhasil dihapus.");
    await loadUsers();
  };

  if (!isSessionReady) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111211] text-[#f4f4f2]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:flex-row sm:gap-8 sm:px-8 sm:py-10">
        <Sidebar active="manage-account" onLogout={handleLogout} />

        <div className="flex min-h-[70vh] flex-1 flex-col gap-6 rounded-2xl border border-white/10 bg-[#191a19]/90 p-6 backdrop-blur sm:p-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Manage Account
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Kelola User</h1>
              <p className="mt-2 text-sm text-white/55">
                Tambah, edit, dan hapus user dengan akses admin panel.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="h-11 rounded-xl border border-white/15 px-5 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Tambah User
            </button>
          </header>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1d1c]/90">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <h2 className="text-base font-semibold text-white">Daftar User</h2>
              <span className="text-xs text-white/40">
                {isLoading ? "Memuat..." : `${users.length} user`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#161716] text-white/60">
                  <tr>
                    <th className="px-5 py-3 font-medium">Nama</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {isLoading ? (
                    <tr>
                      <td className="px-5 py-6 text-white/45" colSpan={4}>
                        Memuat data...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td className="px-5 py-6 text-white/45" colSpan={4}>
                        Belum ada user.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="text-white/70">
                        <td className="px-5 py-4 text-white">{user.name}</td>
                        <td className="px-5 py-4 text-white/50">{user.email}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                            {user.role ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="text-xs font-semibold text-white/70 hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id)}
                              className="text-xs font-semibold text-rose-200 hover:text-rose-100"
                            >
                              Hapus
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

          {(formError || formSuccess) && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                formError
                  ? "border-rose-400/20 bg-[#1b1414]/90 text-rose-100"
                  : "border-emerald-400/20 bg-[#131a16]/90 text-emerald-100"
              }`}
            >
              {formError || formSuccess}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
            role="presentation"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#191a19] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  {modalMode === "create" ? "Tambah User" : "Edit User"}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {modalMode === "create" ? "User baru" : "Perbarui user"}
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

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Nama</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                  placeholder="Nama user"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                  placeholder="nama@email.com"
                  disabled={modalMode === "edit"}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">
                  {modalMode === "create" ? "Password" : "Password baru"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#121312] px-3.5 text-sm text-white outline-none focus:border-white/25"
                  placeholder={modalMode === "create" ? "Password" : "Kosongkan jika tidak diubah"}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={role}
                  onChange={(event) => setRole(event.target.checked)}
                  className="h-4 w-4 rounded border-white/25 bg-transparent text-white focus:ring-white/25"
                />
                Aktifkan akses login
              </label>

              {editingUser && modalMode === "edit" ? (
                <p className="text-xs text-white/40">
                  Mengubah user: <span className="text-white/80">{editingUser.email}</span>
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="h-11 rounded-xl border border-white/15 px-5 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 rounded-xl border border-white/10 px-5 text-sm text-white/50 transition hover:text-white"
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
            <p className="mt-2 text-sm text-white/55">
              Yakin ingin logout dari sesi ini?
            </p>
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
    </div>
  );
}
