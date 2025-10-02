import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, ChevronDown, Circle, Moon, Sun, MonitorSmartphone,
} from "lucide-react";

/**
 * HeaderGradientBar
 *
 * Props:
 * - title: string
 * - subtitle?: string
 * - tabs?: { id: string; label: string; icon?: React.ReactNode }[]
 * - activeTabId?: string
 * - onTabChange?: (id: string) => void
 * - showQuickControls?: boolean (default true)
 *
 * Notes:
 * - Persists { theme, fontScale, accent } in localStorage.
 * - Applies:
 *   - document.documentElement.classList.toggle("dark", ...)
 *   - document.documentElement.style.setProperty("--accent", accent)
 *   - container style fontSize: calc(1rem * var(--font-scale, 1))
 * - If theme === "system", listens to OS theme changes.
 * - All primary icons/buttons use var(--accent).
 * - Quick controls sit on the RIGHT (visual) regardless of RTL text flow.
 */
export default function HeaderGradientBar({
  title,
  subtitle,
  tabs,
  activeTabId,
  onTabChange,
  showQuickControls = true,
}) {
  // ---------- Persistence ----------
  const read = (k, fallback) => {
    try { const v = localStorage.getItem(k); return v ?? fallback; } catch { return fallback; }
  };
  const [theme, setTheme] = useState(() => read("theme", "system"));              // "light" | "dark" | "system"
  const [fontScale, setFontScale] = useState(() => Number(read("fontScale", "1")) || 1);
  const [accent, setAccent] = useState(() => read("accent", "#22d3ee"));          // default cyan-400

  // Apply theme (with system listener)
  const mqlRef = useRef(null);
  const applyTheme = (t) => {
    if (t === "system") {
      const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    } else {
      document.documentElement.classList.toggle("dark", t === "dark");
    }
  };
  useEffect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
    if (theme === "system") {
      if (!mqlRef.current && window.matchMedia) {
        mqlRef.current = window.matchMedia("(prefers-color-scheme: dark)");
      }
      const mql = mqlRef.current;
      const fn = () => applyTheme("system");
      mql?.addEventListener?.("change", fn);
      return () => mql?.removeEventListener?.("change", fn);
    }
  }, [theme]);

  // Apply accent + fontScale
  useEffect(() => {
    try { localStorage.setItem("accent", accent); } catch {}
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  useEffect(() => {
    try { localStorage.setItem("fontScale", String(fontScale)); } catch {}
  }, [fontScale]);

  // ---------- Derived ----------
  const isRTL = useMemo(() => {
    if (typeof document === "undefined") return true;
    return (document.documentElement.getAttribute("dir") || document.documentElement.dir || "rtl").toLowerCase() === "rtl";
  }, []);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // ---------- Handlers ----------
  const handleTab = (id) => {
    onTabChange?.(id);
  };

  // Palette suggestions (feel free to tweak)
  const SWATCHES = [
    "#22d3ee", // cyan-400 (default)
    "#a78bfa", // violet-400
    "#34d399", // emerald-400
    "#f472b6", // (pink-400)  NOTE: remove the #*# if your linter complains
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#60a5fa", // blue-400
  ];

  // ---------- UI ----------
  return (
    <header
      dir="rtl"
      className="relative overflow-hidden rounded-3xl ring-1 ring-white/10"
      style={{ fontSize: "calc(1rem * var(--font-scale, 1))" }}
    >
      {/* Gradient hero */}
      <div className="relative bg-gradient-to-br from-[color:var(--accent,#22d3ee)]/10 via-fuchsia-500/10 to-emerald-500/10 p-4 sm:p-5">
        {/* Subtle ring overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />

        {/* Floating glossy blobs */}
        <div aria-hidden className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-[color:var(--accent,#22d3ee)]/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-10 -right-12 w-60 h-60 rounded-full bg-fuchsia-500/20 blur-3xl" />

        {/* Top row: Back + Title/Subtitle + Quick controls (right) */}
        <div className="relative z-10 flex items-start gap-3">
          {/* Left: Back + Titles (stick to visual left on all dirs) */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => (window.history.length > 1 ? window.history.back() : null)}
                className="inline-flex items-center justify-center rounded-xl px-2.5 py-1.5 bg-black/20 ring-1 ring-white/10 hover:bg-white/10 transition"
                aria-label="Back"
              >
                <BackIcon className="w-5 h-5 text-[color:var(--accent,#22d3ee)]" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-[12px] sm:text-sm text-white/70 leading-snug">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Controls */}
          {showQuickControls && (
            <div className="flex items-center gap-2">
              {/* Theme group */}
              <div
                role="group"
                aria-label="Theme"
                className="bg-black/20 ring-1 ring-white/10 rounded-xl p-1 flex items-center gap-1"
              >
                <QCButton
                  active={theme === "light"}
                  onClick={() => setTheme("light")}
                  label="Light"
                >
                  <Sun className="w-4 h-4 text-[color:var(--accent,#22d3ee)]" />
                </QCButton>
                <QCButton
                  active={theme === "dark"}
                  onClick={() => setTheme("dark")}
                  label="Dark"
                >
                  <Moon className="w-4 h-4 text-[color:var(--accent,#22d3ee)]" />
                </QCButton>
                <QCButton
                  active={theme === "system"}
                  onClick={() => setTheme("system")}
                  label="System"
                >
                  <MonitorSmartphone className="w-4 h-4 text-[color:var(--accent,#22d3ee)]" />
                </QCButton>
              </div>

              {/* Font scale */}
              <div className="bg-black/20 ring-1 ring-white/10 rounded-xl px-2 py-1 flex items-center gap-2">
                <span className="text-[11px] text-white/70">A</span>
                <input
                  type="range"
                  min={0.85}
                  max={1.25}
                  step={0.01}
                  value={fontScale}
                  onChange={(e) => setFontScale(Number(e.target.value))}
                  className="w-24 accent-[color:var(--accent,#22d3ee)]"
                  aria-label="Font scale"
                />
                <span className="text-[13px] font-semibold text-white/90">A</span>
              </div>

              {/* Accent swatches + picker */}
              <div className="bg-black/20 ring-1 ring-white/10 rounded-xl px-2 py-1 flex items-center gap-1">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    className={`h-6 w-6 rounded-lg ring-1 ${accent === c ? "ring-white/70" : "ring-white/10"}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Accent ${c}`}
                  />
                ))}
                <label
                  className="h-6 w-6 rounded-lg ring-1 ring-white/10 grid place-items-center cursor-pointer bg-white/10 hover:bg-white/15"
                  title="Pick color"
                >
                  <Circle className="w-3.5 h-3.5 text-[color:var(--accent,#22d3ee)]" />
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    className="sr-only"
                    aria-label="Accent color"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Tabs row (optional) */}
        {tabs?.length > 0 && (
          <div className="relative z-10 mt-3">
            <div
              role="tablist"
              aria-label="Header Tabs"
              className="inline-flex items-center gap-1 bg-black/20 ring-1 ring-white/10 rounded-xl p-1"
            >
              {tabs.map((t) => {
                const active = t.id === activeTabId;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleTab(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      active ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {t.icon ? t.icon : null}
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/** Pill button for theme controls */
function QCButton({ active, onClick, children, label }) {
  return (
    <button
      aria-pressed={active}
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-sm transition ${
        active ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"
      }`}
      title={label}
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}
