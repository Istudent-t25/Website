// src/pages/WelcomePWA.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Chrome, Smartphone, Monitor,
  CheckCircle2, X, Info, Sparkles, ShieldCheck,
  ChevronDown, ChevronUp, Compass, Rocket, BellRing,
  BookOpenCheck, Globe, Search, GraduationCap, BookOpen,
  Timer, Stars, Play, Wand2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SafariIcon = Compass;
const LS_INSTALLED = "welcome_pwa_installed";

const isStandaloneDisplay = () =>
  window.matchMedia?.("(display-mode: standalone)")?.matches ||
  (typeof navigator !== "undefined" && navigator.standalone === true);

function usePlatform() {
  const [displayStandalone, setDisplayStandalone] = useState(isStandaloneDisplay());
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [appInstalled, setAppInstalled] = useState(
    () => localStorage.getItem(LS_INSTALLED) === "1"
  );

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const vendor = typeof navigator !== "undefined" ? navigator.vendor : "";

  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isEdge = /Edg\//i.test(ua);
  const isChrome =
    ((/Chrome|CriOS/i.test(ua) && /Google Inc/.test(vendor || "")) || /Chromium/i.test(ua));
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|Edg\//i.test(ua);
  const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua);

  useEffect(() => {
    const onBIP = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    const onInstalled = () => { localStorage.setItem(LS_INSTALLED, "1"); setAppInstalled(true); };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    const mq = window.matchMedia?.("(display-mode: standalone)");
    const onChange = () => setDisplayStandalone(isStandaloneDisplay());
    mq?.addEventListener?.("change", onChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      mq?.removeEventListener?.("change", onChange);
    };
  }, []);

  return {
    displayStandalone, deferredPrompt, appInstalled,
    isAndroid, isIOS, isEdge, isChrome, isSafari, isMac
  };
}

function Step({ title, children, icon, defaultOpen = true, anchorId }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={anchorId} className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-right"
      >
        <div className="flex items-center gap-2 text-zinc-100">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="text-zinc-400" size={18} />
        ) : (
          <ChevronDown className="text-zinc-400" size={18} />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="px-4 pb-4 text-sm text-zinc-300 leading-7"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="group rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 hover:bg-white/[0.07] transition">
      <div className="flex items-center gap-2 text-zinc-100">
        {icon}
        <div className="font-semibold">{title}</div>
      </div>
      <div className="text-sm text-zinc-300 mt-1 leading-7">{desc}</div>
    </div>
  );
}

export default function WelcomePWA({ afterPath = "/auth" }) {
  const navigate = useNavigate();
  const {
    displayStandalone, deferredPrompt, appInstalled,
    isAndroid, isIOS, isEdge, isChrome, isSafari, isMac
  } = usePlatform();

  // optional app version badge (set VITE_APP_VERSION in .env)
  const appVersion = useMemo(() => {
    try {
      // Vite exposes import.meta.env
      return import.meta?.env?.VITE_APP_VERSION || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (displayStandalone) localStorage.setItem(LS_INSTALLED, "1");
  }, [displayStandalone]);

  const shouldHide = displayStandalone || appInstalled;

  useEffect(() => {
    if (shouldHide) navigate(afterPath, { replace: true });
  }, [shouldHide, navigate, afterPath]);

  const platformHint = useMemo(() => {
    if (isIOS && isSafari) return "ئایفۆن/ئایپاد • Safari";
    if (isIOS && !isSafari) return "iOS • تکایە لە Safari بکەرەوە بۆ دابەزاندن";
    if (isAndroid && isChrome) return "ئەندرۆید • Chrome";
    if (isAndroid) return "ئەندرۆید";
    if (isMac && isSafari) return "macOS • Safari";
    if (isChrome) return "Desktop • Chrome/Edge";
    if (isEdge) return "Desktop • Edge";
    return "وێبگەڕ";
  }, [isIOS, isSafari, isAndroid, isChrome, isEdge, isMac]);

  // --- Download/Install Dropdown state + outside click
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const gotoAnchor = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const preferredAnchor = () => {
    if (isIOS) return "ios";
    if (isMac && isSafari) return "macos";
    if (isAndroid) return "android";
    return "desktop";
  };

  async function handlePrimaryDownload() {
    try {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          localStorage.setItem(LS_INSTALLED, "1");
          setTimeout(() => window.location.reload(), 400);
          return;
        }
      }
      // fallback: open guide and jump to best section
      setMenuOpen(true);
      setTimeout(() => gotoAnchor(preferredAnchor()), 0);
    } catch {
      setMenuOpen(true);
      setTimeout(() => gotoAnchor(preferredAnchor()), 0);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-950 to-black text-zinc-100 relative overflow-hidden">
      {/* soft glows */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-14 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 -right-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-10 max-w-5xl mx-auto">
        {/* HERO / WELCOME */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl bg-white/5 backdrop-blur-3xl ring-1 ring-white/10 p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        >
          <div className="grid md:grid-cols-[1.1fr,0.9fr] gap-6">
            {/* text */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="text-cyan-300" size={22} />
                  بەخێربێیت بۆ iStudent — باشترین یارمەتی بۆ خوێندکار
                </h1>
                {appVersion && (
                  <span className="shrink-0 text-[11px] px-2 py-1 rounded-full bg-white/5 ring-1 ring-white/10 text-zinc-300">
                    v{appVersion}
                  </span>
                )}
              </div>

              <p className="mt-2 text-zinc-300 leading-7 text-[15px]">
                هەموو شتە گرنگەکان لە یەک شوێن: کتێب و بۆکڵێت، ڤیدیۆ، تاقیکردنەوەکان،
                خشتەی هەفتانە، و هێمای خوێندن. خێرا، ڕوون، و سازگار بۆ مۆبایل و کۆمپیوتەر.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10">
                  <Info size={14} className="text-cyan-300" />
                  وێبگەڕی پێناسکراو: <span className="text-zinc-200 font-semibold">{platformHint}</span>
                </div>

                {/* Always-visible primary CTA */}
                <button
                  onClick={handlePrimaryDownload}
                  className="rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm px-4 py-2 inline-flex items-center gap-1"
                >
                  <Download size={16} /> دابەزاندن / Install
                </button>

                {/* Download / Install dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                    className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-sm px-3 py-2 inline-flex items-center gap-1"
                    aria-haspopup="menu" aria-expanded={menuOpen}
                  >
                    <Download size={16} /> ڕێنمایی دابەزاندن
                    <ChevronDown size={14} className="opacity-80" />
                  </button>
                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute z-20 mt-2 w-64 rounded-xl bg-zinc-900/95 ring-1 ring-white/10 shadow-xl overflow-hidden"
                    >
                      <button onClick={() => gotoAnchor("android")}
                        className="w-full text-right px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2">
                        <Smartphone size={16}/> ئەندرۆید (Chrome)
                      </button>
                      <button onClick={() => gotoAnchor("desktop")}
                        className="w-full text-right px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2">
                        <Monitor size={16}/> کۆمپیوتەر (Chrome/Edge)
                      </button>
                      <button onClick={() => gotoAnchor("ios")}
                        className="w-full text-right px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2">
                        <SafariIcon size={16}/> iPhone / iPad (Safari)
                      </button>
                      <button onClick={() => gotoAnchor("macos")}
                        className="w-full text-right px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2">
                        <SafariIcon size={16}/> macOS (Safari 16.4+)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* quick benefits */}
              <div className="mt-4 grid sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 text-[13px] text-zinc-300">
                  <GraduationCap size={16} className="text-emerald-300" /> ئامادەکاری بۆ تاقیکردنەوە
                </div>
                <div className="flex items-center gap-2 text-[13px] text-zinc-300">
                  <Timer size={16} className="text-sky-300" /> خشتەی هەفتانە + ئاگاداری
                </div>
                <div className="flex items-center gap-2 text-[13px] text-zinc-300">
                  <Stars size={16} className="text-fuchsia-300" /> ڕووکارێکی خێرا و سادە
                </div>
              </div>
            </div>

            {/* image / showcase */}
            <div className="relative">
              <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-3 md:p-4 h-full">
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {/* Replace src with your real screenshots later */}
                  <img src="/images/welcome/books.png" alt="کتێبەکان"
                       className="aspect-[4/5] w-full rounded-xl object-cover ring-1 ring-white/10" loading="lazy"
                       onError={(e)=>{e.currentTarget.style.display='none'}}/>
                  <img src="/images/welcome/quiz.png" alt="تاقیکردنەوە"
                       className="aspect-[4/5] w-full rounded-xl object-cover ring-1 ring-white/10" loading="lazy"
                       onError={(e)=>{e.currentTarget.style.display='none'}}/>
                  <img src="/images/welcome/schedule.png" alt="خشتە"
                       className="aspect-[4/5] w-full rounded-xl object-cover ring-1 ring-white/10" loading="lazy"
                       onError={(e)=>{e.currentTarget.style.display='none'}}/>
                  {/* graceful fallbacks if images missing */}
                  <div className="hidden md:grid place-items-center aspect-[4/5] rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 ring-1 ring-white/10">
                    <BookOpen className="opacity-70" />
                  </div>
                  <div className="hidden md:grid place-items-center aspect-[4/5] rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-rose-500/10 ring-1 ring-white/10">
                    <Play className="opacity-70" />
                  </div>
                  <div className="hidden md:grid place-items-center aspect-[4/5] rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 ring-1 ring-white/10">
                    <Wand2 className="opacity-70" />
                  </div>
                </div>
                <div className="mt-3 text-[12px] text-zinc-400 text-center">
                  وێنەکان نمونەیەن — دەتوانیت بە وێنەی ئەپەکەت بگۆڕیت (‎/images/welcome/*)
                </div>
              </div>
            </div>
          </div>

          {/* FEATURES */}
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Feature
              icon={<Rocket size={16} className="text-emerald-300" />}
              title="خێرا و سادە"
              desc="PWA ـە؛ دەستگەیشتنێکی خێرا و کارکردنەکی ڕوون لەسەر هەموو ئامێر."
            />
            <Feature
              icon={<BookOpenCheck size={16} className="text-sky-300" />}
              title="کتێب + بۆکڵێت"
              desc="هەموو بابەتەکان، بەڕێکخستن، فلتەرکردن، و گەڕانی خێرا."
            />
            <Feature
              icon={<Search size={16} className="text-indigo-300" />}
              title="گەڕانی زیرەک"
              desc="بەپێی وانە، قۆناغ، مامۆستا، و شاخ (زانستی/ئەدەبی)."
            />
            <Feature
              icon={<BellRing size={16} className="text-pink-300" />}
              title="ئاگاداری"
              desc="تاقیکردنەوەکان و پلانی هەفتانەت لە یەک شوێن."
            />
            <Feature
              icon={<Globe size={16} className="text-cyan-300" />}
              title="کوردی + RTL"
              desc="بە زمانی کوردی و بە ڕاستەوخۆ ڕێکخستنی راست-بۆ-چەپ."
            />
            <Feature
              icon={<ShieldCheck size={16} className="text-emerald-300" />}
              title="ئاسایش"
              desc="داتاکانت لەناوخۆ پارێزراون. هەر کاتێک دەتوانیت لە ئەپی خۆت دەربچیت."
            />
          </div>
        </motion.div>

        {/* HOW TO INSTALL */}
        <div className="mt-6 space-y-4">
          {(isAndroid || !isIOS) && (
            <Step
              anchorId="android"
              title="دامەزراندنی لەسەر ئەندرۆید (Chrome)"
              icon={<Smartphone size={18} className="text-emerald-300" />}
            >
              <ol className="list-decimal pr-4 space-y-2">
                <li>بەکارهێنانی <b>Chrome</b>.</li>
                <li>ئەگەر دوگمەی <b>Install</b> دەربکەوێت، کلیک بکە.</li>
                <li>ئەگەر نەبوو: سێ خاڵ <b>(⋮)</b> → <b>Add to Home screen</b> یان <b>Install app</b>.</li>
                <li><b>Add</b> بکە → ئەپ لە سەرەکی دێت.</li>
              </ol>
            </Step>
          )}

          {!isIOS && (
            <Step
              anchorId="desktop"
              title="دامەزراندنی لەسەر کۆمپیوتەر (Chrome/Edge)"
              icon={<Monitor size={18} className="text-sky-300" />}
            >
              <ol className="list-decimal pr-4 space-y-2">
                <li>وێبگەڕی <b>Chrome</b> یان <b>Edge</b> بکەرەوە.</li>
                <li>لە بەڕی ناونیشان نیشانی <b>Install</b> (پڵەس) یان لە منیوی سێ خاڵ <b>Install App…</b>.</li>
                <li>پەسەند بکە → لۆگۆ لە Start/Launchpad دێت و ئەپ وەک بەرنامەیەکی سەرەکی دەکرێت.</li>
              </ol>
            </Step>
          )}

          {isIOS && (
            <Step
              anchorId="ios"
              title="دامەزراندنی لەسەر iPhone / iPad (Safari)"
              icon={<SafariIcon size={18} className="text-blue-300" />}
            >
              <ol className="list-decimal pr-4 space-y-2">
                <li><b>Safari</b> بکەرەوە (لە iOS تەنیا Safari داتوانێت PWA زیاد بکات).</li>
                <li>دوگمەی <b>Share</b> (قاچ) بکە.</li>
                <li><b>Add to Home Screen</b> بەدوایدا هەڵبژێرە.</li>
                <li>ناو بدە → <b>Add</b>. ئەپ لە سەرەکی دێت.</li>
              </ol>
            </Step>
          )}

          {isMac && isSafari && (
            <Step
              anchorId="macos"
              title="دامەزراندنی لەسەر macOS (Safari 16.4+)"
              icon={<SafariIcon size={18} className="text-indigo-300" />}
            >
              <ol className="list-decimal pr-4 space-y-2">
                <li><b>Safari</b> بکەرەوە.</li>
                <li>منیوی <b>File</b> → <b>Add to Dock…</b> (یان Install).</li>
                <li>شوێن و ناو پەسەند بکە → <b>Add</b>.</li>
              </ol>
            </Step>
          )}

          {/* TRUST / TIPS */}
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-sm text-zinc-300">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold mb-1">
              <ShieldCheck size={16} className="text-emerald-300" /> خێرا، ڕوون، و ئاسایش
            </div>
            <ul className="list-disc pr-5 space-y-1">
              <li>iStudent PWA ـە: هەندێک داتا لەناوخۆ هەڵدەگرێت بۆ کارکردنی ئۆفلاین.</li>
              <li>ژمارەی پەیوەندی و ئاگادارییەکانت بەخێریایی دەگات.</li>
              <li>کێشەی Install؟ هەوڵبدە <b>refresh</b> بکەی یان <b>Clear site data</b> → دووبارە هەوڵ بدە.</li>
            </ul>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(afterPath)}
            className="inline-flex items-center gap-1 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-4 py-2 text-sm text-zinc-200"
          >
            <CheckCircle2 size={16} /> دەستم پێکرد
          </button>
          <button
            onClick={() => navigate(afterPath)}
            className="text-[12px] text-zinc-400 hover:text-zinc-200 underline"
          >
            پەڕی بکەوە بۆ دواوە
          </button>
        </div>
      </div>

      {/* CLOSE */}
      <button
        onClick={() => navigate(afterPath)}
        className="fixed top-3 left-3 rounded-full bg-zinc-900/70 ring-1 ring-white/10 p-2 text-zinc-300 hover:bg-zinc-800/80"
        aria-label="داخستن"
      >
        <X size={18} />
      </button>
    </div>
  );
}
