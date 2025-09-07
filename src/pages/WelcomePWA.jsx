// src/pages/WelcomePWA.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Chrome, Smartphone, Monitor,
  CheckCircle2, X, Info, Sparkles, ShieldCheck, ChevronDown, ChevronUp,
  Compass,  // <-- use Compass instead of Safari
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SafariIcon = Compass; // <-- alias so the rest of the code stays the same

const LS_HIDE = "welcome_pwa_hide";
const LS_INSTALLED = "welcome_pwa_installed";

const isStandaloneDisplay = () =>
  window.matchMedia?.("(display-mode: standalone)")?.matches ||
  (typeof navigator !== "undefined" && navigator.standalone === true);

function usePlatform() {
  const [displayStandalone, setDisplayStandalone] = useState(isStandaloneDisplay());
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [appInstalled, setAppInstalled] = useState(() => localStorage.getItem(LS_INSTALLED) === "1");

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const vendor = typeof navigator !== "undefined" ? navigator.vendor : "";

  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isEdge = /Edg\//i.test(ua);
  const isChrome = ((/Chrome|CriOS/i.test(ua) && /Google Inc/.test(vendor || "")) || /Chromium/i.test(ua));
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

  return { displayStandalone, deferredPrompt, appInstalled, isAndroid, isIOS, isEdge, isChrome, isSafari, isMac };
}

function Step({ title, children, icon }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 text-right">
        <div className="flex items-center gap-2 text-zinc-100">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="text-zinc-400" size={18} /> : <ChevronDown className="text-zinc-400" size={18} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="px-4 pb-4 text-sm text-zinc-300 leading-7">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WelcomePWA({ afterPath = "/auth" }) {
  const navigate = useNavigate();
  const [dontShow, setDontShow] = useState(() => localStorage.getItem(LS_HIDE) === "1");
  const [dismissed, setDismissed] = useState(false);

  const { displayStandalone, deferredPrompt, appInstalled, isAndroid, isIOS, isEdge, isChrome, isSafari, isMac } = usePlatform();

  useEffect(() => {
    if (displayStandalone) localStorage.setItem(LS_INSTALLED, "1");
  }, [displayStandalone]);

  const shouldHide = displayStandalone || appInstalled || dontShow || localStorage.getItem(LS_INSTALLED) === "1";

  useEffect(() => {
    if (shouldHide && !dismissed) {
      setDismissed(true);
      const id = setTimeout(() => navigate(afterPath, { replace: true }), 0);
      return () => clearTimeout(id);
    }
  }, [shouldHide, dismissed, navigate, afterPath]);

  if (dismissed || shouldHide) return null;

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

  async function handleInstallClick() {
    try {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem(LS_INSTALLED, "1");
        setTimeout(() => window.location.reload(), 400);
      }
    } catch (e) {
      console.error("install failed", e);
    }
  }

  function finish() {
    if (dontShow) localStorage.setItem(LS_HIDE, "1");
    setDismissed(true);
    navigate(afterPath, { replace: true });
  }

  return (
    <div dir="rtl" className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-950 to-black text-zinc-100 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-14 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 -right-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-10 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="rounded-3xl bg-white/5 backdrop-blur-3xl ring-1 ring-white/10 p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="text-cyan-300" size={22} /> بەخێربێیت بە بەرهەمە مۆبایلییەکەمان!
              </h1>
              <p className="mt-2 text-zinc-300 leading-7 text-sm">
                بەم ڕێنماییانە دەتوانیت ئەپەکە بە شێوازی PWA دامەزرێنی لەسەر مۆبایل و کۆمپیوتەر — بۆ خێرایی زیاتر و کارکردنی بەبێ هاتووچۆ.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10">
                <Info size={14} className="text-cyan-300" /> وێبگەڕی پێناسکراو: <span className="text-zinc-200 font-semibold">{platformHint}</span>
              </div>
            </div>
            <div className="hidden sm:block shrink-0">
              <div className="grid place-items-center w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/15">
                {isSafari ? <SafariIcon className="text-white" /> : <Chrome className="text-white" />}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {deferredPrompt && (
              <button onClick={handleInstallClick} className="rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm px-4 py-2 inline-flex items-center gap-1">
                <Download size={16} /> دابەزاندنی ئەپ
              </button>
            )}
            <label className="flex items-center gap-2 text-zinc-300 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} className="accent-cyan-400" />
              ئەم پەڕەیە بەدواداچونمەوە مەشانە
            </label>
          </div>
        </motion.div>

        <div className="mt-6 space-y-4">
          {(isAndroid || !isIOS) && (
            <Step title="دامەزراندنی لەسەر ئەندرۆید (Chrome)" icon={<Smartphone size={18} className="text-emerald-300" />}>
              <ol className="list-decimal pr-4 space-y-2">
                <li>پەیوەست بن بە وێبگەڕی <b>Chrome</b>.</li>
                <li>ئەگەر دوگمەی <b>Install</b> دەربکەوێت لە سەرەوە، کلیک بکە لەسەری.</li>
                <li>ئەگەر نەبوو: کلیک بکە لە سێ خاڵ <b>(⋮)</b> لەکۆنەی سەرەوە، وە هەڵبژێرە <b>Add to Home screen</b> یان <b>Install app</b>.</li>
                <li>لە دوایدا <b>Add</b> هەڵبژێرە. ئەپەکە لە سەرەکی ئیش دەکات.</li>
              </ol>
            </Step>
          )}

          {!isIOS && !isAndroid && (
            <Step title="دامەزراندنی لەسەر کۆمپیوتەر (Chrome/Edge)" icon={<Monitor size={18} className="text-sky-300" />}>
              <ol className="list-decimal pr-4 space-y-2">
                <li>لە <b>Chrome</b> یان <b>Edge</b> بکەرەوە.</li>
                <li>لە کۆنەی سەرەوە، دوگمەی <b>Install</b> (نیشانی + لە بەڕی ناونیشان) یان لە منیوی سێ خاڵ <b>Install App…</b> هەڵبژێرە.</li>
                <li>پەیامەکە پەسەند بکە. ئەپەکە لە شاشەیەکی تایبەتی دێت و لۆگۆ لە Start Menu/Launchpad دەربکەوێت.</li>
              </ol>
            </Step>
          )}

          {isIOS && (
            <Step title="دامەزراندنی لەسەر iPhone / iPad (Safari)" icon={<SafariIcon size={18} className="text-blue-300" />}>
              <ol className="list-decimal pr-4 space-y-2">
                <li>پەیوەست بن بە <b>Safari</b> (نەکرۆم/نەئەیج لە iOS).</li>
                <li>دوگمەی <b>Share</b> بکە (نیشانی قاچ لە خوارەوە).</li>
                <li>بخوە <b>Add to Home Screen</b> و کلیک بکە لەسەری.</li>
                <li>ناو بدە و <b>Add</b> هەڵبژێرە. ئێستا ئەپ وەک بەرنامەیەکی سەرەکی کار دەکات.</li>
              </ol>
              <div className="mt-2 text-[12px] text-zinc-400">تێبینی: لە iOS تەنیا Safari داتوانێت PWA لە سەرەکی زیاد بکات.</div>
            </Step>
          )}

          {isMac && isSafari && (
            <Step title="دامەزراندنی لەسەر macOS (Safari 16.4+)" icon={<SafariIcon size={18} className="text-indigo-300" />}>
              <ol className="list-decimal pr-4 space-y-2">
                <li>پەیوەست بن بە <b>Safari</b>.</li>
                <li>لە منیوی <b>File</b> ــەوە هەڵبژێرە <b>Add to Dock…</b> (یان Install).</li>
                <li>پەسەندی ناو/شوێن بکە و <b>Add</b> هەڵبژێرە. ئەپ لە Dock و Launchpad دەربکەوێت.</li>
              </ol>
            </Step>
          )}

          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-sm text-zinc-300">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold mb-1">
              <ShieldCheck size={16} className="text-emerald-300" /> بەپەروەردە و خێرا
            </div>
            <ul className="list-disc pr-5 space-y-1">
              <li>ئەپەکە PWA ـە؛ خێراترە و هەندێک زانیاری لە ناوخۆ هەڵدەگرێت.</li>
              <li>کاتێک دابەزێنیت، ئەم پەڕەیە دووبارە نیشان نادات.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button onClick={finish} className="inline-flex items-center gap-1 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-4 py-2 text-sm text-zinc-200">
            <CheckCircle2 size={16} /> تەواوە، دەستم پێکرد
          </button>
          <button onClick={() => navigate(afterPath)} className="text-[12px] text-zinc-400 hover:text-zinc-200 underline">
            دەستم پێدەکەم بەبێ دابەزاندن
          </button>
        </div>
      </div>

      <button onClick={finish} className="fixed top-3 left-3 rounded-full bg-zinc-900/70 ring-1 ring-white/10 p-2 text-zinc-300 hover:bg-zinc-800/80" aria-label="داخستن">
        <X size={18} />
      </button>
    </div>
  );
}
