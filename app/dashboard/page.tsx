"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, isSessionValid, setSessionActive } from "../../lib/session";
import Sidebar from "../components/Sidebar";

type UserItem = {
  id: number;
  name: string;
  email: string;
  role: boolean;
};

type UsersResponse = {
  users?: UserItem[];
  message?: string;
};

export default function DashboardPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const router = useRouter();

  const loadUsers = async () => {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as UsersResponse | null;

    if (!response.ok) {
      setErrorMessage(payload?.message ?? "Gagal memuat data user.");
      setIsLoading(false);
      return;
    }

    setUsers(payload?.users ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    document.title = "Eventify - Dashboard";
    loadUsers();
    const interval = setInterval(loadUsers, 10000);
    return () => clearInterval(interval);
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

  if (!isSessionReady) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111211] text-[#f4f4f2]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:flex-row sm:gap-8 sm:px-8 sm:py-10">
        <Sidebar active="dashboard" onLogout={handleLogout} />

        <div className="flex min-h-[70vh] flex-1 flex-col gap-6 rounded-2xl border border-white/10 bg-[#191a19]/90 p-6 backdrop-blur sm:p-8">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Data Users</h1>
          </header>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#1c1d1c]/90 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Total Users</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {isLoading ? "..." : users.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#151615] text-white/70">
                <span className="text-xl" aria-hidden="true">👥</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#1c1d1c]/90 p-5 text-sm text-white/45">
              Ruang kosong untuk data berikutnya.
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#1c1d1c]/90 p-5 text-sm text-white/45">
              Ruang kosong untuk data berikutnya.
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#1c1d1c]/90 p-5 text-sm text-white/45">
              Ruang kosong untuk data berikutnya.
            </div>
          </section>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-400/20 bg-[#1b1414]/90 px-4 py-3 text-sm text-rose-100">
              {errorMessage}
            </div>
          ) : null}
        </div>
      </div>

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
