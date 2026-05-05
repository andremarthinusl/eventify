"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isSessionValid, setSessionActive } from "../lib/session";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isSessionValid()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setErrorMessage(payload?.message ?? "Email atau password salah.");
      setIsSubmitting(false);
      return;
    }

    setSessionActive();
    router.push("/dashboard");
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-[#111211] text-[#f3f3f2]" : "bg-[#f6f6f4] text-[#1f1f1e]"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDarkMode
            ? "bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_40%)]"
            : "bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.8),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(229,229,227,0.9),transparent_35%),radial-gradient(circle_at_60%_80%,rgba(239,239,236,0.9),transparent_40%)]"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] [background-size:28px_28px] ${
          isDarkMode ? "opacity-25" : "opacity-50"
        }`}
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-6 sm:px-8 sm:py-8">
        <section
          className={`w-full max-w-sm rounded-2xl border p-5 backdrop-blur sm:max-w-md sm:p-8 ${
            isDarkMode
              ? "border-white/10 bg-[#191a19]/90 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
              : "border-black/10 bg-white/90 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
          }`}
        >
          <p
            className={`mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-xs ${
              isDarkMode ? "text-white/45" : "text-black/45"
            }`}
          >
            Eventify Workspace
          </p>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Masuk</h1>
          <p className={`mt-2 text-sm ${isDarkMode ? "text-white/55" : "text-black/55"}`}>
            Lanjutkan ke dashboard Anda dengan akun yang sudah terdaftar.
          </p>

          <form className="mt-6 space-y-4 sm:mt-7" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className={`mb-1.5 block text-sm font-medium ${
                  isDarkMode ? "text-white/80" : "text-black/80"
                }`}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-4 ${
                  isDarkMode
                    ? "border-white/15 bg-[#121312] text-white placeholder:text-white/35 focus:border-white/30 focus:ring-white/10"
                    : "border-black/15 bg-white text-black placeholder:text-black/35 focus:border-black/35 focus:ring-black/5"
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={`mb-1.5 block text-sm font-medium ${
                  isDarkMode ? "text-white/80" : "text-black/80"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="........"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`h-11 w-full rounded-xl border px-3.5 pr-12 text-sm outline-none transition focus:ring-4 ${
                    isDarkMode
                      ? "border-white/15 bg-[#121312] text-white placeholder:text-white/35 focus:border-white/30 focus:ring-white/10"
                      : "border-black/15 bg-white text-black placeholder:text-black/35 focus:border-black/35 focus:ring-black/5"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition ${
                    isDarkMode
                      ? "text-white/60 hover:text-white"
                      : "text-black/50 hover:text-black"
                  }`}
                >
                  {isPasswordVisible ? (
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path
                        d="M3 3l18 18"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.6 10.6a2.5 2.5 0 0 0 3.4 3.4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6.6 6.6C4.2 8.2 2.5 10.8 2 12c.9 2 4.7 6 10 6 1.6 0 3.1-.3 4.4-.8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14.7 14.7c1.7-.8 3.2-2.1 4.2-3.7.2-.3.3-.6.4-1-1-2.2-4.8-6-9.3-6-1.2 0-2.4.2-3.4.6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path
                        d="M2 12c1.2-2.4 4.8-6 10-6 5.2 0 8.8 3.6 10 6-1.2 2.4-4.8 6-10 6-5.2 0-8.8-3.6-10-6Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 text-sm">
              <label
                className={`inline-flex items-center gap-2 ${
                  isDarkMode ? "text-white/70" : "text-black/70"
                }`}
              >
                <input
                  type="checkbox"
                  className={`h-4 w-4 rounded ${
                    isDarkMode
                      ? "border-white/25 bg-transparent text-white focus:ring-white/25"
                      : "border-black/25 text-black focus:ring-black/20"
                  }`}
                />
                Ingat saya
              </label>
              <a
                href="#"
                className={`font-medium transition ${
                  isDarkMode ? "text-white/70 hover:text-white" : "text-black/70 hover:text-black"
                }`}
              >
                Lupa password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-1 h-11 w-full rounded-xl text-sm font-semibold transition ${
                isDarkMode
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-[#1f1f1e] text-white hover:bg-black"
              } ${isSubmitting ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {isSubmitting ? "Memeriksa..." : "Masuk"}
            </button>
          </form>

        </section>
      </main>

      {errorMessage ? (
        <div
          className={`fixed right-4 top-4 z-30 w-[min(92vw,360px)] rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
            isDarkMode
              ? "border-rose-400/20 bg-[#1b1414]/90 text-rose-100"
              : "border-rose-200 bg-white text-rose-700"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="pr-2">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              aria-label="Close"
              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition ${
                isDarkMode
                  ? "text-rose-100/80 hover:text-rose-100"
                  : "text-rose-700/80 hover:text-rose-700"
              }`}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsDarkMode((prev) => !prev)}
        aria-label={isDarkMode ? "Switch to white mode" : "Switch to dark mode"}
        title={isDarkMode ? "Switch to white mode" : "Switch to dark mode"}
        className={`fixed bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition sm:bottom-6 sm:right-6 sm:h-12 sm:w-12 ${
          isDarkMode
            ? "border-white/15 bg-[#1b1c1b] text-white hover:bg-[#242524]"
            : "border-black/15 bg-white text-black hover:bg-[#f0f0ef]"
        }`}
      >
        <span className="text-base leading-none" aria-hidden="true">
          {isDarkMode ? "☀" : "☾"}
        </span>
      </button>
    </div>
  );
}
