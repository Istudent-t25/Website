import { Menu, Search, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header({ onMenuClick, headerHeight = 56 }) {
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(
    () =>
      document.documentElement.classList.contains("dark") ||
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 backdrop-blur bg-white/80 dark:bg-zinc-900/80 border-b border-white/10 px-4 py-2 flex items-center justify-between gap-4"
      style={{
        height: `calc(env(safe-area-inset-top) + ${headerHeight}px)`,
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {/* Mobile Menu */}
      <button className="md:hidden text-zinc-700 dark:text-zinc-200" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={24} />
      </button>

      {/* Title */}
      <h1 className="text-lg md:text-xl font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
        من خوێندکارم
      </h1>

      {/* Search */}
      <div className="relative flex-1 max-w-xs hidden sm:block">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="گەڕان..."
          className="w-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <Search size={18} className="absolute left-3 top-2.5 text-zinc-400" />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setDark((v) => !v)}
        className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
        aria-label="Toggle theme"
      >
        {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-zinc-700 dark:text-zinc-200" />}
      </button>
    </header>
  );
}
