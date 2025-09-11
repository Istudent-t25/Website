import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Library, BookMarked, Settings, Book } from "lucide-react";
import { useScrollDirection } from '../hooks/useScrollDirection';

const tabs = [
  { to: "/", label: "سەرەکی", icon: Home },
  { to: "/subjects", label: "بابەتەکان", icon: Library },
  { to: "/exams", label: "پرسارەکان", icon: BookMarked },
  { to: "/course", label: "وانەکان", icon: Book },
  // { to: "/courses", label: "وانەکان", icon: Book },
  { to: "/settings", label: "ڕێکخستن", icon: Settings },
];

function isActive(path, to) {
  if (to === "/") return path === "/";
  return path === to || path.startsWith(to.replace(/\/$/, ""));
}

export default function BottomNav() {
  const loc = useLocation();
  const scrollDir = useScrollDirection();

  return (
    <div
      dir="rtl"
      className={`
        md:hidden fixed bottom-0 inset-x-0 z-40
        backdrop-blur-xl
        rounded-t-2xl
        transition-transform duration-300 ease-in-out
        ${scrollDir === 'down' ? 'translate-y-full' : 'translate-y-0'}
      `}
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)",
        background: "rgba(0, 0, 0, 0.5)",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.4)"
      }}
    >
      <nav className="mx-auto max-w-xl px-2 py-2 grid grid-cols-5 gap-1">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = isActive(loc.pathname, to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center rounded-lg py-2 transition ${
                active
                  ? "text-sky-300 bg-sky-500/10"
                  : "text-zinc-300"
              }`}
              title={label}
            >
              <Icon size={20} />
              <span className="text-[10.5px] mt-1 leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}