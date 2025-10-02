// src/pages/SoundsPage.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, StarOff, Search, RefreshCw, Volume2, Copy as CopyIcon,
  Share2, Sparkles, Shuffle, X
} from "lucide-react";
import HeaderGradientBar from "@/components/HeaderGradientBar";

/* ======================= HELPERS ======================= */
const LS_KEY = "sounds_page_state_sheet_red_v1";
const usePersisted = (initial) => {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return initial;
      return { ...initial, ...JSON.parse(raw) };
    } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(state)); }, [state]);
  return [state, setState];
};

const cls = (...a) => a.filter(Boolean).join(" ");

// Remove anything inside [...] to get the pronounced form
const pronouncedFromMarked = (s) => (s || "").replace(/\[[^\]]+\]/g, "");

function speak(text) {
  try {
    if (!window.speechSynthesis) return false;
    const u = new SpeechSynthesisUtterance(text);
    const run = () => {
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find(v => v.lang?.toLowerCase().startsWith("en-")) || voices[0];
      if (v) u.voice = v;
      u.rate = 0.95; u.pitch = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = run;
    } else { run(); }
    return true;
  } catch { return false; }
}

/* Highlight [marked] parts.
   - If removeSilent=false (default): keep letters and paint them RED.
   - If removeSilent=true: hide letters and show a tiny dot placeholder. */
function RenderMarked({ marked, rule, showMarks = true, removeSilent = false }) {
  if (!marked) return null;

  // Split "co[l]eag[u]e" into segments
  const parts = [];
  let i = 0;
  while (i < marked.length) {
    const open = marked.indexOf("[", i);
    if (open === -1) { parts.push({ t: marked.slice(i), marked: false }); break; }
    if (open > i) parts.push({ t: marked.slice(i, open), marked: false });
    const close = marked.indexOf("]", open + 1);
    if (close === -1) { parts.push({ t: marked.slice(open), marked: false }); break; }
    parts.push({ t: marked.slice(open + 1, close), marked: true });
    i = close + 1;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="leading-tight">
        {parts.map((p, idx) => {
          if (!p.marked) return <span key={idx}>{p.t}</span>;

          // Not showing marks at all => remove letters silently (no placeholder)
          if (!showMarks) return <React.Fragment key={idx} />;

          // Remove letters & show a tiny dot placeholder
          if (removeSilent) {
            return (
              <span
                key={idx}
                title={rule || "Silent letter"}
                className="inline-block align-baseline mx-0.5"
                aria-label={`silent: ${p.t}`}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full border border-red-400 translate-y-[2px]" />
              </span>
            );
          }

          // Keep letters and paint them RED
          return (
            <span
              key={idx}
              title={rule || "Silent letter"}
              className="align-baseline text-red-400 underline decoration-dotted underline-offset-2 px-0.5 rounded bg-red-500/10"
            >
              {p.t}
            </span>
          );
        })}
      </span>

      {/* rule chip on larger screens */}
      {rule ? (
        <span className="hidden sm:inline-block text-[10px] ml-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
          {rule}
        </span>
      ) : null}
    </span>
  );
}

/* ======================= MAIN ======================= */
export default function SoundsPage() {
  const [persist, setPersist] = usePersisted({
    favorites: [],
    search: "",
    onlyFavs: false,
    activeId: null,
    placeFilter: "all",
    unitFilter: "all",
    showMarks: true,            // show silent markers (highlight/dot)
    removeSilentLetters: false, // DEFAULT OFF so letters show in RED
  });

  const [wordsData, setWordsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const listRef = useRef(null);
  const searchRef = useRef(null);
  const sheetRef = useRef(null);

  // Obey global font scale
  useEffect(() => {
    const fs = localStorage.getItem("fontScale");
    if (fs) document.documentElement.style.setProperty("--font-scale", fs);
  }, []);

  const fetchWords = useCallback(async () => {
    setIsLoading(true); setIsError(false);
    try {
      const spIn = new URLSearchParams(window.location.search);
      const subjectParam = spIn.get("subject_id") || spIn.get("subjectId");
      const subjectName = spIn.get("subject");

      const url = new URL("https://api.studentkrd.com/api/v1/sounds");
      url.searchParams.set("all", "true");
      if (subjectParam) { url.searchParams.set("subject_id", subjectParam); url.searchParams.set("subjectId", subjectParam); }
      if (subjectName) url.searchParams.set("subject", subjectName);
      ["grade", "stream"].forEach(k => { const v = spIn.get(k); if (v) url.searchParams.set(k, v); });

      const r = await fetch(url.toString());
      if (!r.ok) throw new Error("bad");
      const j = await r.json();
      const words = Array.isArray(j) ? j : j.data;

      const mapped = words.map(item => ({
        id: item.id,
        word: item.word,
        ipa: item.phonetic,
        kurdishMeaning: item.kurdish_meaning,
        kurdishReading: item.kurdish_reading,
        exampleSentence: item.sentence,
        place: item.place || "نازانراو",
        unit: item.unit || "١",
        subjectId: item.subject_id ?? item.subjectId ?? item.subject?.id ?? null,
        subjectName: item.subject?.name ?? null,
        // silent meta from API (or fallback)
        wordMarked: item.word_marked || item.word,
        isSilent: !!item.is_silent,
        silentPart: item.silent_part || null,
        silentRule: item.silent_rule || null,
      }));

      setWordsData(mapped);
      setPersist(s => ({ ...s, activeId: mapped[0]?.id ?? null }));
    } catch { setIsError(true); }
    finally { setIsLoading(false); }
  }, [setPersist]);

  useEffect(() => { fetchWords(); }, [fetchWords]);

  /* ===== Lists, Filters ===== */
  const places = useMemo(() => {
    const set = new Set(wordsData.map(w => w.place).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [wordsData]);

  const units = useMemo(() => {
    const src = persist.placeFilter === "all"
      ? wordsData
      : wordsData.filter(w => w.place === persist.placeFilter);
    const setU = new Set(src.map(w => w.unit).filter(Boolean));
    return ["all", ...Array.from(setU)];
  }, [wordsData, persist.placeFilter]);

  const filtered = useMemo(() => {
    const q = persist.search.trim().toLowerCase();
    const result = wordsData.filter(w => {
      if (persist.onlyFavs && !persist.favorites.includes(w.id)) return false;
      if (persist.placeFilter !== "all" && w.place !== persist.placeFilter) return false;
      if (persist.unitFilter !== "all" && w.unit !== persist.unitFilter) return false;
      if (!q) return true;
      return (
        w.word?.toLowerCase().includes(q) ||
        w.ipa?.toLowerCase().includes(q) ||
        w.kurdishMeaning?.includes(persist.search) ||
        w.kurdishReading?.includes(persist.search)
      );
    });
    return result;
  }, [wordsData, persist]);

  const currentIndex = useMemo(
    () => Math.max(0, filtered.findIndex(w => w.id === persist.activeId)),
    [filtered, persist.activeId]
  );
  const currentWord = filtered[currentIndex] || filtered[0];
  const setActiveId = useCallback((id) => setPersist(s => ({ ...s, activeId: id })), [setPersist]);
  const toggleFavorite = useCallback((id) => setPersist(s => {
    const favs = new Set(s.favorites);
    favs.has(id) ? favs.delete(id) : favs.add(id);
    return { ...s, favorites: [...favs] };
  }), [setPersist]);

  const goPrev = useCallback(() => {
    if (!filtered.length) return;
    const idx = (currentIndex - 1 + filtered.length) % filtered.length;
    setActiveId(filtered[idx].id);
  }, [filtered, currentIndex, setActiveId]);

  const goNext = useCallback(() => {
    if (!filtered.length) return;
    const idx = (currentIndex + 1) % filtered.length;
    setActiveId(filtered[idx].id);
  }, [filtered, currentIndex, setActiveId]);

  const goRandom = useCallback(() => {
    if (!filtered.length) return;
    let idx = Math.floor(Math.random() * filtered.length);
    if (idx === currentIndex && filtered.length > 1) idx = (idx + 1) % filtered.length;
    setActiveId(filtered[idx].id);
  }, [filtered, currentIndex, setActiveId]);

  /* ===== Share/Copy ===== */
  const copy = async (text) => { try { await navigator.clipboard.writeText(text || ""); } catch {} };
  const share = async (title, text) => {
    try { if (navigator.share) await navigator.share({ title, text }); else await copy(`${title}\n${text}`); }
    catch {}
  };

  /* ===== Bottom Sheet gestures ===== */
  const [sheetOpen, setSheetOpen] = useState(false);
  const startY = useRef(0);
  const deltaY = useRef(0);
  useEffect(() => { setSheetOpen(!!currentWord); }, [currentWord?.id]);
  const onSheetTouchStart = (e) => { startY.current = e.touches[0].clientY; deltaY.current = 0; };
  const onSheetTouchMove = (e) => { deltaY.current = e.touches[0].clientY - startY.current; const el = sheetRef.current; if (el && deltaY.current > 0) el.style.transform = `translateY(${deltaY.current}px)`; };
  const onSheetTouchEnd = () => { const el = sheetRef.current; if (!el) return; if (deltaY.current > 60) { setSheetOpen(false); } el.style.transform = ""; };

  /* ===== Keyboard nav ===== */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      if (e.key.toLowerCase() === "r") { e.preventDefault(); goRandom(); }
      if (e.key === "/" && searchRef.current) { e.preventDefault(); searchRef.current.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, goRandom]);

  /* ===== Scroll active into view ===== */
  useEffect(() => {
    if (!listRef.current || !persist.activeId) return;
    const el = listRef.current.querySelector(`[data-row-id="${persist.activeId}"]`);
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [persist.activeId, filtered.length]);

  /* ===== Header tabs (optional) ===== */
  const tabs = [];
  const activeTabId = tabs[0]?.id;

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-zinc-950 text-zinc-50"
      style={{ fontSize: "calc(1rem * var(--font-scale, 1))" }}>
      {/* HEADER */}
      <div className="p-3 sm:p-4">
        <HeaderGradientBar
          title="ده‌نگه‌کان"
          subtitle="/sounds"
          showQuickControls={false}
          tabs={[]}
        />
      </div>

      {/* QUICK BAR */}
      <div className="px-3 sm:px-4 -mt-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap justify-between">
          {/* Search + Favorites + ShowMarks + RemoveSilent */}
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <div className="relative flex-1">
              <input
                dir="ltr"
                ref={searchRef}
                value={persist.search}
                onChange={(e) => setPersist(s => ({ ...s, search: e.target.value }))}
                placeholder="/  گەڕان بە وشە، IPA، یان واتا…"
                className="w-full rounded-xl bg-zinc-900/70 border border-white/10 text-[13px] px-8 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent,#22d3ee)]/30"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>

            <button
              onClick={() => setPersist(s => ({ ...s, onlyFavs: !s.onlyFavs }))}
              className={cls(
                "whitespace-nowrap px-2 py-2 rounded-xl border text-[12px]",
                persist.onlyFavs
                  ? "bg-yellow-500/15 border-yellow-400/30 text-yellow-100"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
              )}
              title="فقط دڵخواز"
            >
              <Sparkles className="w-4 h-4 inline mr-1 text-[color:var(--accent,#22d3ee)]" /> دڵخواز
            </button>

            <button
              onClick={() => setPersist(s => ({ ...s, showMarks: !s.showMarks }))}
              className={cls(
                "whitespace-nowrap px-2 py-2 rounded-xl border text-[12px]",
                persist.showMarks
                  ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-100"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
              )}
              title="نیشاندانی هێمای بێ‌دەنگ"
            >
              نیشاندانی هێمای بێ‌دەنگ
            </button>

            <button
              onClick={() => setPersist(s => ({ ...s, removeSilentLetters: !s.removeSilentLetters }))}
              className={
                "whitespace-nowrap px-2 py-2 rounded-xl border text-[12px] " +
                (persist.removeSilentLetters
                  ? "bg-red-500/15 border-red-400/30 text-red-100"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10")
              }
              title="سڕینەوەی پیتە بێ‌دەنگەکان"
            >
              سڕینەوەی پیتە بێ‌دەنگەکان
            </button>

            <button
              onClick={fetchWords}
              className="px-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[12px]"
              title="نوێکردنەوە"
            >
              <RefreshCw className="w-4 h-4 inline mr-1 text-[color:var(--accent,#22d3ee)]" /> نوێکردنەوە
            </button>
          </div>

          {/* Place / Unit filters */}
          <div className="grid grid-cols-2 gap-2">
            <FilterSelect
              label="شوێن"
              value={persist.placeFilter}
              options={places}
              onChange={(v) => setPersist(s => ({ ...s, placeFilter: v, unitFilter: "all" }))}
            />
            <FilterSelect
              label="به‌شی"
              value={persist.unitFilter}
              options={units}
              onChange={(v) => setPersist(s => ({ ...s, unitFilter: v }))}
            />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 min-h-0">
        {isError && (
          <div className="m-3 p-3 text-sm text-rose-200 bg-rose-500/10 border border-rose-400/30 rounded-xl">
            ببورە، کێشەیەک ڕوویدا. دووبارە هەوڵبدە.
          </div>
        )}

        {isLoading ? (
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div ref={listRef} className="p-2 pb-24 max-w-4xl mx-auto">
            {filtered.length === 0 && (
              <div className="mt-10 text-center text-zinc-400 text-sm">هیچ داتا نییە بۆ فلتەرەکان</div>
            )}

            <ul className="space-y-1">
              {filtered.map((w) => {
                const fav = persist.favorites.includes(w.id);
                const active = w.id === persist.activeId;
                return (
                  <li key={w.id} data-row-id={w.id}>
                    <button
                      onClick={() => setActiveId(w.id)}
                      className={cls(
                        "w-full text-right rounded-xl px-3 py-3 border flex items-center justify-between gap-2",
                        active ? "bg-[color:var(--accent,#22d3ee)]/10 border-[color:var(--accent,#22d3ee)]/30" : "bg-zinc-950/60 border-white/10"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-[15px] truncate">
                          <RenderMarked
                            marked={w.wordMarked || w.word}
                            rule={w.silentRule}
                            showMarks={persist.showMarks}
                            removeSilent={persist.removeSilentLetters}
                          />
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-zinc-400">
                          {w.ipa && <span className="font-mono">{w.ipa}</span>}
                          {w.kurdishReading && <span className="truncate">{w.kurdishReading}</span>}
                        </div>
                        <div className="mt-0.5 text-[11px] text-zinc-500 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{w.place}</span>
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">به‌شی {w.unit}</span>
                          {w.isSilent && persist.showMarks && (
                            <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-400/30 text-red-200">
                              هێمای بێ‌دەنگ
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(w.id); }}
                        className="shrink-0 h-9 w-9 grid place-items-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                        title={fav ? "دڵخواز" : "زیادکردن بۆ دڵخواز"}
                        aria-pressed={fav}
                      >
                        {fav
                          ? <Star className="w-5 h-5 text-yellow-300" />
                          : <StarOff className="w-5 h-5 text-[color:var(--accent,#22d3ee)]" />
                        }
                      </button>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* FAB: Random */}
      <button
        onClick={goRandom}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] right-3 z-40 rounded-full h-12 w-12 grid place-items-center bg-[color:var(--accent,#22d3ee)] hover:brightness-110 border border-white/20 shadow-xl"
        aria-label="Random"
      >
        <Shuffle className="w-6 h-6 text-white" />
      </button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {sheetOpen && currentWord && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <button
              className="absolute inset-0 bg-black/40"
              onClick={() => setSheetOpen(false)}
              aria-label="Close"
            />
            {/* Sheet */}
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              className="absolute inset-x-0 bottom-0 bg-zinc-900 rounded-t-2xl border-t border-white/10"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onTouchStart={onSheetTouchStart}
              onTouchMove={onSheetTouchMove}
              onTouchEnd={onSheetTouchEnd}
            >
              {/* Grabber */}
              <div className="w-full grid place-items-center pt-2">
                <div className="h-1 w-10 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="px-4 pt-2 pb-3 flex items-center justify-between">
                <div className="text-[11px] text-zinc-400">
                  {filtered.length ? `${currentIndex + 1} / ${filtered.length}` : "—"}
                </div>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  <X className="w-5 h-5 text-zinc-300" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+14px)]">
                <div className="text-center select-none">
                  <div className="text-3xl font-black tracking-tight">
                    <RenderMarked
                      marked={currentWord.wordMarked || currentWord.word}
                      rule={currentWord.silentRule}
                      showMarks={persist.showMarks}
                      removeSilent={persist.removeSilentLetters}
                    />
                  </div>
                  {currentWord.ipa && <div className="mt-1 text-lg font-bold text-cyan-200/90 Doulos">{currentWord.ipa}</div>}
                  {currentWord.kurdishReading && <div dir="rtl" className="mt-1 text-[15px] font-semibold text-zinc-200">{currentWord.kurdishReading}</div>}
                  {currentWord.kurdishMeaning && <div dir="rtl" className="mt-1 text-[13px] text-zinc-400">{currentWord.kurdishMeaning}</div>}
                </div>

                {/* Meta */}
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-zinc-400 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{currentWord.place}</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">به‌شی {currentWord.unit}</span>
                  {currentWord.isSilent && persist.showMarks && (
                    <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-400/30 text-red-200">
                      هێمای بێ‌دەنگ
                    </span>
                  )}
                </div>

                {/* Controls */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button className="rounded-xl py-2 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95" onClick={goPrev}>پێشتر</button>
                  <button
                    onClick={() => {
                      // Speak the pronounced (no [..]) so TTS is correct
                      const say = pronouncedFromMarked(currentWord.wordMarked || currentWord.word);
                      if (!say) return;
                      const ok = speak(say);
                      if (!ok) navigator.clipboard.writeText(say);
                    }}
                    className="rounded-xl py-2 bg-[color:var(--accent,#22d3ee)] hover:brightness-110 border border-white/20 text-white active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-5 h-5" /> خوێندنەوە
                  </button>
                  <button className="rounded-xl py-2 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95" onClick={goNext}>دواتر</button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                  <button onClick={goRandom} className="rounded-xl py-2 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 flex items-center justify-center gap-1">
                    <Shuffle className="w-4 h-4 text-[color:var(--accent,#22d3ee)]" /> هەڕەمەکی
                  </button>
                  <button
                    onClick={() => {
                      const txt = pronouncedFromMarked(currentWord.wordMarked || currentWord.word);
                      navigator.clipboard && navigator.clipboard.writeText(txt);
                    }}
                    className="rounded-xl py-2 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 flex items-center justify-center gap-1"
                  >
                    <CopyIcon className="w-4 h-4 text-[color:var(--accent,#22d3ee)]" /> کۆپی
                  </button>
                  <button
                    onClick={() => {
                      const base = pronouncedFromMarked(currentWord.wordMarked || currentWord.word);
                      const text = `${base}${currentWord.ipa ? ` — ${currentWord.ipa}` : ""}${currentWord.kurdishMeaning ? `\n${currentWord.kurdishMeaning}` : ""}`;
                      share("وشە", text);
                    }}
                    className="rounded-xl py-2 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 flex items-center justify-center gap-1"
                  >
                    <Share2 className="w-4 h-4 text-[color:var(--accent,#22d3ee)]" /> هاوبەشکردن
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-center">
                  <FavToggle
                    isFav={persist.favorites.includes(currentWord.id)}
                    onToggle={() => toggleFavorite(currentWord.id)}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============== Small Components ============== */
function FilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const current = options.includes(value) ? value : "all";
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[13px]"
      >
        <span className="text-zinc-300">{label}: <span className="text-white">{current}</span></span>
        <span className="h-2 w-2 rounded-full bg-[color:var(--accent,#22d3ee)]" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute z-20 mt-1 w-full rounded-xl bg-zinc-900 border border-white/10 shadow-lg max-h-56 overflow-auto"
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={cls(
                  "w-full text-right px-3 py-2 text-[13px] hover:bg-white/5",
                  opt === current ? "text-[color:var(--accent,#22d3ee)]" : "text-zinc-200"
                )}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FavToggle({ isFav, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={cls(
        "px-3 py-2 rounded-xl border inline-flex items-center gap-2",
        isFav ? "bg-yellow-500/15 border-yellow-400/30 text-yellow-100" : "bg-white/5 border-white/10 text-zinc-300"
      )}
      aria-pressed={isFav}
      title="دڵخواز"
    >
      {isFav ? <Star className="w-5 h-5 text-yellow-300" /> : <StarOff className="w-5 h-5 text-[color:var(--accent,#22d3ee)]" />}
      <span className="text-[13px]">{isFav ? "لە دڵخوازەکاندا" : "زیادکردن بۆ دڵخواز"}</span>
    </button>
  );
}
