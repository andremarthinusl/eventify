"use client";

import { useState } from "react";
import Link from "next/link";

type SidebarProps = {
  active: "dashboard" | "manage-account";
  onLogout: () => void;
};

export default function Sidebar({ active, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const linkBase =
    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#1b1c1b] text-white/80 shadow-lg transition hover:text-white sm:hidden"
        aria-label="Open menu"
      >
        <span className="text-lg" aria-hidden="true">
          ≡
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 sm:hidden"
          onClick={() => setIsOpen(false)}
          role="presentation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 -translate-x-full border-r border-white/10 bg-[#191a19]/95 p-5 backdrop-blur transition-transform sm:static sm:z-0 sm:w-60 sm:translate-x-0 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-[#191a19]/90 ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Admin Panel
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">Eventify</h2>
        </div>
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className={`${linkBase} ${
              active === "dashboard"
                ? "border-white/10 font-medium text-white/85 hover:border-white/25 hover:text-white"
                : "border-white/5 text-white/65 hover:border-white/20 hover:text-white"
            }`}
          >
            <span className="text-base">▣</span>
            Dashboard
          </Link>
          <Link
            href="/manage-account"
            onClick={() => setIsOpen(false)}
            className={`${linkBase} ${
              active === "manage-account"
                ? "border-white/10 font-medium text-white/85 hover:border-white/25 hover:text-white"
                : "border-white/5 text-white/65 hover:border-white/20 hover:text-white"
            }`}
          >
            <span className="text-base">⌁</span>
            Manage Account
          </Link>
        </nav>
        <div className="mt-6 sm:mt-auto">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white/65 transition hover:border-white/25 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
