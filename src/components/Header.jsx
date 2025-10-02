import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Search, Home, Library, BookMarked, Book,Newspaper, Settings } from "lucide-react";

const tabs = [
  { to: "/", label: "سەرەکی", icon: Home },
  { to: "/subjects", label: "بابەتەکان", icon: Library },
  { to: "/exam", label: "تاقیكردنه‌وه‌", icon: BookMarked },
    { to: "/news", label: "هه‌واڵه‌كان", icon: Newspaper },
  
  // { to: "/courses", label: "وانەکان", icon: Book },
  { to: "/settings", label: "ڕێکخستن", icon: Settings },
];
function isActive(path, to) {
  if (to === "/") return path === "/";
  return path === to || path.startsWith(to.replace(/\/$/, ""));
}

export default function Header({ onHeightChange }) {
  const loc = useLocation();
  const ref = useRef(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => onHeightChange?.(el.offsetHeight || 0);
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange]);

  return (
    <header
      ref={ref}
      // This is the updated line to fix the error:
      className="hidden md:flex fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="w-full max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
          من خوێندکارم
        </h1>
        <nav className="flex-1 flex justify-center">
          <div className="flex items-center gap-1 rounded-xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur px-2 py-1 border border-white/10 shadow-sm">
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = isActive(loc.pathname, to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-sky-500/15 text-sky-900 dark:text-sky-100 ring-1 ring-sky-400/40"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-700/60"
                  }`}
                  title={label}
                >
                  <Icon size={18} className="text-sky-600 dark:text-sky-400" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="relative w-64">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="گەڕان..."
            className="w-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-zinc-400" />
        </div>
      </div>
    </header>
  );
}