import { Link, useLocation } from "react-router-dom";
import { Home, Library, BookMarked, CalendarDays, Settings } from "lucide-react";

const tabs = [
  { to: "/", label: "سەرەکی", icon: Home },
  { to: "/students/grade12", label: "بابەتەکان", icon: Library },
  { to: "/exams", label: "پرسارەکان", icon: BookMarked },
  { to: "/schedule", label: "خشتە", icon: CalendarDays },
  { to: "/settings", label: "ڕێکخستن", icon: Settings },
];

function isActive(path, to) {
  if (to === "/") return path === "/";
  return path === to || path.startsWith(to.replace(/\/$/, ""));
}

export default function BottomNav() {
  const loc = useLocation();
  return (
    <div
      dir="rtl"
      className="
        md:hidden fixed bottom-0 inset-x-0 z-40
        bg-white/90 dark:bg-zinc-900/90 backdrop-blur
        border-t border-white/10
        rounded-t-2xl shadow-[0_-6px_12px_-4px_rgba(0,0,0,0.2)]
      "
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}
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
                  ? "text-sky-700 dark:text-sky-300 bg-sky-500/10"
                  : "text-zinc-600 dark:text-zinc-300"
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
