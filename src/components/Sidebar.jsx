import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Library,
  BookOpenCheck,
  FileText,
  CalendarDays,
  GraduationCap,
  Headphones,
  ChevronDown,
  ChevronUp,
  Sparkles,
  UserCircle2,
  LogIn,
  UserPlus,
  LogOut,
  X,
  Settings,
  BookMarked,
} from "lucide-react";

/**
 * Sidebar — clean + compact
 * - Only "Subjects" (grades 7–12) is a dropdown.
 * - Added Exam Bank (/exams/bank) and Profile Settings (/settings).
 * - Mobile drawer + Desktop column, RTL-first, dark-mode ready.
 */

const EASE = [0.22, 0.61, 0.36, 1];

const cls = {
  wrap: "flex h-full flex-col overflow-y-auto overflow-x-hidden custom-scroll select-none",
  brand:
    "px-3 py-3 mb-3 text-[1.05rem] font-extrabold tracking-tight text-sky-700 dark:text-sky-300 border-b border-zinc-200/60 dark:border-zinc-700/60",
  sectionLabel:
    "px-3 py-2 text-[0.75rem] font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400",
  linkBase:
    "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[0.95rem] font-medium transition-all",
  linkIdle:
    "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
  linkActive:
    "bg-gradient-to-l from-sky-500/14 to-transparent text-sky-900 dark:text-sky-100 ring-1 ring-sky-400/40",
  icon: "shrink-0 text-sky-600 dark:text-sky-400",
  rail: "absolute -right-1 top-1 bottom-1 w-1 rounded-full bg-sky-500/90 shadow-[0_0_0_2px_rgba(14,165,233,0.15)]",
};

function Rail({ show }) {
  if (!show) return null;
  return <span className={cls.rail} />;
}

function Item({ to, icon: Icon, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${cls.linkBase} ${active ? cls.linkActive : cls.linkIdle}`}
      title={label}
    >
      <Rail show={active} />
      <Icon size={18} className={cls.icon} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SubjectsGroup({ openId, setOpenId, active, onItemClick }) {
  const isOpen = openId === "subjects";
  const location = useLocation();

  return (
    <div className="mb-1.5">
      <button
        onClick={() => setOpenId(isOpen ? null : "subjects")}
        className={`w-full ${cls.linkBase} justify-between ${
          active ? cls.linkActive : cls.linkIdle
        }`}
        aria-expanded={isOpen}
      >
        <Rail show={active} />
        <span className="flex items-center gap-3">
          <Library size={18} className={cls.icon} />
          <span className="truncate">بابەتەکان</span>
        </span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="ps-9 pe-1 mt-1 space-y-1 overflow-hidden"
          >
            {[7, 8, 9, 10, 11, 12].map((g) => (
              <Item
                key={g}
                to={`/students/grade${g}`}
                icon={BookOpenCheck}
                label={`پۆلی ${g}`}
                active={location.pathname === `/students/grade${g}`}
                onClick={onItemClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({
  isOpen = true,
  onClose,
  user,
  onLogout,
  openLoginModal,
  openRegisterModal,
  variant = "desktop", // "desktop" | "mobile"
}) {
  const location = useLocation();
  const [openId, setOpenId] = useState(null);

  // Only subjects dropdown should auto-open when inside /students
  const subjectsActive = location.pathname.startsWith("/students");

  useEffect(() => {
    setOpenId(subjectsActive ? "subjects" : null);
  }, [subjectsActive]);

  // Quick helpers for active state
  const isActive = (p) => location.pathname === p;
  const starts = (p) => location.pathname.startsWith(p);

  // =======================
  // Mobile drawer variant
  // =======================
  if (variant === "mobile") {
    return (
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: isOpen ? "0%" : "100%", opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.24, ease: EASE }}
        className="h-full flex flex-col p-3 overflow-y-auto overflow-x-hidden custom-scroll touch-pan-y"
        role="dialog"
        aria-modal="true"
      >
        {/* Brand + close */}
        <div className="flex items-center justify-between px-2 py-2 mb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-sky-500" />
            <span className="text-[1.15rem] font-extrabold text-sky-700 dark:text-sky-300">
              به‌شه‌كان
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Close"
          >
            <X size={22} className="text-zinc-600 dark:text-zinc-300" />
          </button>
        </div>

        {/* Primary */}
        <div className="space-y-1">
          <Item
            to="/"
            icon={Home}
            label="سەرەکی"
            active={isActive("/")}
            onClick={onClose}
          />
        </div>

        {/* Subjects (only dropdown) */}
        <div className="mt-2 space-y-2">
          <SubjectsGroup
            openId={openId}
            setOpenId={setOpenId}
            active={subjectsActive}
            onItemClick={onClose}
          />
        </div>

        {/* Free links (no dropdowns) */}
        <div className="mt-2">
          <div className={cls.sectionLabel}>ڕێزمان</div>
          <div className="space-y-1">
            <Item
              to="/grammar/"
              icon={FileText}
              label="ڕیزمان - Grammar - القواعد"
              active={isActive("/grammar")}
              onClick={onClose}
            />
          </div>

          <div className={cls.sectionLabel}>تاقیکردنەوە</div>
          <div className="space-y-1">
            <Item
              to="/exams/bank"
              icon={BookMarked}
              label="بانكی پرسار"
              active={isActive("/exams/bank")}
              onClick={onClose}
            />
            <Item
              to="/exams/grade12"
              icon={GraduationCap}
              label="پۆلی ١٢ (نیشتیمانی)"
              active={isActive("/exams/grade12")}
              onClick={onClose}
            />
            <Item
              to="/schedule"
              icon={CalendarDays}
              label="خشتەی هەفتانە"
              active={isActive("/schedule")}
              onClick={onClose}
            />
          </div>

          <div className={cls.sectionLabel}>دەنگ</div>
          <div className="space-y-1">
            <Item
              to="/sounds"
              icon={Headphones}
              label="ده‌نگه‌كان (ئینگلیزی)"
              active={isActive("/sounds")}
              onClick={onClose}
            />
          </div>

          <div className={cls.sectionLabel}>هەژمار</div>
          <div className="space-y-1">
            <Item
              to="/settings"
              icon={Settings}
              label="ڕێکخستن"
              active={starts("/settings")}
              onClick={onClose}
            />
          </div>
        </div>

        {/* Auth */}
        <div className="mt-auto p-3 border-t border-zinc-200/60 dark:border-zinc-700/60">
          {user ? (
            <div className="flex items-center gap-3">
              <UserCircle2 size={36} className="text-sky-600" />
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                  بەخێربێیت، {user.name}
                </span>
                <span className="text-xs text-zinc-500">خوێندکار</span>
                <button
                  onClick={onLogout}
                  className="text-red-600 text-xs mt-1 self-end hover:underline"
                >
                  <LogOut size={14} className="inline-block" /> چوونە دەرەوە
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              <button
                onClick={openLoginModal}
                className="px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
              >
                <LogIn size={16} className="inline-block mr-1" />
                چونەژوورەوە
              </button>
              <button
                onClick={openRegisterModal}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <UserPlus size={16} className="inline-block mr-1" />
                تۆمارکردن
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // =======================
  // Desktop full-height column
  // =======================
  return (
    <nav className={cls.wrap}>
      {/* Brand */}
      <div className={cls.brand}>
        <span className="inline-flex items-center gap-2">
          <Sparkles size={18} className="text-sky-500" />
          به‌شه‌كان
        </span>
      </div>

      {/* Primary */}
      <div className="space-y-1">
        <Item to="/" icon={Home} label="سەرەکی" active={isActive("/")} />
      </div>

      {/* Subjects (only dropdown) */}
      <div className="mt-2 space-y-2">
        <SubjectsGroup
          openId={openId}
          setOpenId={setOpenId}
          active={subjectsActive}
        />
      </div>

      {/* Free links (no dropdowns) */}
      <div className="mt-2">
        <div className={cls.sectionLabel}>ڕێزمان</div>
        <div className="space-y-1">
          <Item
            to="/grammar/"
            icon={FileText}
            label="ڕیزمان - Grammar - القواعد"
            active={isActive("/grammar")}
          />
        </div>

        <div className={cls.sectionLabel}>تاقیکردنەوە</div>
        <div className="space-y-1">
          <Item
            to="/exams/bank"
            icon={BookMarked}
            label="بانكی پرسار"
            active={isActive("/exams/bank")}
          />
          <Item
            to="/exams/grade12"
            icon={GraduationCap}
            label="پۆلی ١٢ (نیشتیمانی)"
            active={isActive("/exams/grade12")}
          />
          <Item
            to="/schedule"
            icon={CalendarDays}
            label="خشتەی هەفتانە"
            active={isActive("/schedule")}
          />
        </div>

        <div className={cls.sectionLabel}>دەنگ</div>
        <div className="space-y-1">
          <Item
            to="/sounds"
            icon={Headphones}
            label="ده‌نگه‌كان (ئینگلیزی)"
            active={isActive("/sounds")}
          />
        </div>

        <div className={cls.sectionLabel}>هەژمار</div>
        <div className="space-y-1">
          <Item
            to="/settings"
            icon={Settings}
            label="ڕێکخستن"
            active={starts("/settings")}
          />
        </div>
      </div>

      {/* Auth */}
      <div className="mt-auto p-3 border-t border-zinc-200/60 dark:border-zinc-700/60">
        {user ? (
          <div className="flex items-center gap-3">
            <UserCircle2 size={36} className="text-sky-600" />
            <div className="flex flex-col text-sm">
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                بەخێربێیت، {user.name}
              </span>
              <span className="text-xs text-zinc-500">خوێندکار</span>
              <button
                onClick={onLogout}
                className="text-red-600 text-xs mt-1 self-end hover:underline"
              >
                <LogOut size={14} className="inline-block" /> چوونە دەرەوە
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-sm">
            <button
              onClick={openLoginModal}
              className="px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
            >
              <LogIn size={16} className="inline-block mr-1" />
              چونەژوورەوە
            </button>
            <button
              onClick={openRegisterModal}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <UserPlus size={16} className="inline-block mr-1" />
              تۆمارکردن
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}