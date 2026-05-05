import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111211] text-[#f4f4f2]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] [background-size:28px_28px]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col items-start justify-center gap-6 px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Eventify</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">404 - Halaman tidak ditemukan</h1>
        <p className="text-sm text-white/55">
          Halaman yang Anda cari tidak tersedia. Silakan kembali ke halaman utama.
        </p>
        <Link
          href="/"
          className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
        >
          Kembali ke Home
        </Link>
      </main>
    </div>
  );
}
