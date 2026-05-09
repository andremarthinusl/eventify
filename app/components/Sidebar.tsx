"use client";

import { useState } from "react";
import Link from "next/link";

type SidebarProps = {
  active: "dashboard" | "manage-account";
  onLogout: () => void;
};

export default function Sidebar({ active, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const linkBase =
    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition";

  return (
    <>
      {isCollapsed ? null : (
        <div
          className="fixed inset-0 z-20 bg-black/60 sm:hidden"
          onClick={() => setIsCollapsed(true)}
          role="presentation"
        />
      )}

      <aside
        className={`flex min-h-full shrink-0 flex-col rounded-2xl border border-white/10 bg-[#191a19]/90 p-3 backdrop-blur transition-all sm:w-60 sm:p-4 ${
          isCollapsed ? "w-16" : "w-64"
        } sm:static sm:z-0 ${
          isCollapsed
            ? ""
            : "fixed left-3 top-5 z-30 sm:relative sm:left-auto sm:top-auto"
        }`}
      >
      <div className={`mb-6 ${isCollapsed ? "items-center" : ""}`}>
        <div className="flex items-center justify-between">
          <div
            className={`transition-all sm:opacity-100 sm:w-auto ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Admin Panel
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">Eventify</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 transition hover:text-white sm:hidden"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="text-lg" aria-hidden="true">
              {isCollapsed ? "»" : "«"}
            </span>
          </button>
        </div>
      </div>

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className={`${linkBase} ${
            active === "dashboard"
              ? "border-white/10 font-medium text-white/85 hover:border-white/25 hover:text-white"
              : "border-white/5 text-white/65 hover:border-white/20 hover:text-white"
          } ${isCollapsed ? "justify-center px-2" : ""} sm:justify-start sm:px-3`}
        >
          <span className="text-base">▣</span>
          {!isCollapsed && <span className="sm:hidden">Dashboard</span>}
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <Link
          href="/manage-account"
          className={`${linkBase} ${
            active === "manage-account"
              ? "border-white/10 font-medium text-white/85 hover:border-white/25 hover:text-white"
              : "border-white/5 text-white/65 hover:border-white/20 hover:text-white"
          } ${isCollapsed ? "justify-center px-2" : ""} sm:justify-start sm:px-3`}
        >
          <span className="text-base">⌁</span>
          {!isCollapsed && <span className="sm:hidden">Manage Account</span>}
          <span className="hidden sm:inline">Manage Account</span>
        </Link>
      </nav>

      <div className="mt-auto">
        <button
          type="button"
          onClick={onLogout}
          className={`w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white/65 transition hover:border-white/25 hover:text-white ${
            isCollapsed ? "px-2" : ""
          }`}
        >
          {isCollapsed ? (
            <span className="inline-flex items-center justify-center sm:hidden" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M9 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 12h9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M10 8l3 4-3 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : null}
          <span className="hidden sm:inline">Logout</span>
          {!isCollapsed && <span className="sm:hidden">Logout</span>}
        </button>
      </div>
      </aside>
    </>
  );
}
