import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, StarOff, Search, ChevronDown, RefreshCw, BookOpenCheck, House,
  Shuffle, SkipBack, SkipForward, Volume2, Copy as CopyIcon, Share2, Sparkles
} from "lucide-react";

/* ======================= HELPERS ======================= */
const LS_KEY = "sounds_page_state_v15";
const usePersisted = (initial) => {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return initial;
      return { ...initial, ...JSON.parse(raw) };
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);
  return [state, setState];
};

const Collapsible = ({ children, isOpen }) => (
  <AnimatePresence initial={false}>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ overflow: "hidden" }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const SPRING = { type: "spring", stiffness: 260, damping: 26, mass: 0.7 };
const cls = (...a) => a.filter(Boolean).join(" ");

/* Speak helper (Web Speech API) */
function speak(text) {
  try {
    if (!window.speechSynthesis) return false;
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prefer English voices
    const v = voices.find(v => v.lang?.toLowerCase().startsWith("en-")) || voices[0];
    if (v) u.voice = v;
    u.rate = 0.95; u.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}

/* ======================= MAIN COMPONENT ======================= */
export default function SoundsPage() {
  const [persist, setPersist] = usePersisted({
    favorites: [],
    search: "",
    onlyFavs: false,
    activeId: null,
  });

  const [wordsData, setWordsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [openPlaces, setOpenPlaces] = useState({});
  const [openUnits, setOpenUnits] = useState({});
  const isTouchDevice = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches, []);

  const searchRef = useRef(null);
  const placeAnchors = useRef({});

  const fetchWords = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const spIn = new URLSearchParams(window.location.search);
      const subjectParam = spIn.get("subject_id") || spIn.get("subjectId");
      const subjectName = spIn.get("subject");

      const url = new URL("https://api.studentkrd.com/api/v1/sounds");
      url.searchParams.set("all", "true");
      // send both, server can accept either
      if (subjectParam) {
        url.searchParams.set("subject_id", subjectParam);
        url.searchParams.set("subjectId", subjectParam);
      }
      if (subjectName) {
        url.searchParams.set("subject", subjectName);
      }
      // pass through grade/stream if present
      ["grade", "stream"].forEach(k => {
        const v = spIn.get(k);
        if (v) url.searchParams.set(k, v);
      });

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.json();
      const words = Array.isArray(data) ? data : data.data;

      setWordsData(words.map(item => ({
        id: item.id,
        word: item.word,
        ipa: item.phonetic,
        kurdishMeaning: item.kurdish_meaning,
        kurdishReading: item.kurdish_reading,
        exampleSentence: item.sentence,
        place: item.place,
        unit: item.unit,
        subjectId: item.subject_id ?? item.subjectId ?? item.subject?.id ?? null,
        subjectName: item.subject?.name ?? null,
      })));
      setPersist(s => ({ ...s, activeId: words[0]?.id || null }));
    } catch (e) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [setPersist]);


  useEffect(() => { fetchWords(); }, [fetchWords]);

  /* -------- Derived data -------- */
  const groupedWords = useMemo(() => {
    const groups = {};
    const filtered = wordsData.filter(w => {
      if (persist.onlyFavs && !persist.favorites.includes(w.id)) return false;
      if (persist.search.trim()) {
        const q = persist.search.toLowerCase();
        return w.word?.toLowerCase().includes(q) ||
               w.ipa?.toLowerCase().includes(q) ||
               w.kurdishMeaning?.includes(persist.search) ||
               w.kurdishReading?.includes(persist.search);
      }
      return true;
    });
    for (const w of filtered) {
      if (!groups[w.place]) groups[w.place] = {};
      if (!groups[w.place][w.unit]) groups[w.place][w.unit] = [];
      groups[w.place][w.unit].push(w);
    }
    return groups;
  }, [wordsData, persist.search, persist.onlyFavs, persist.favorites]);

  const allWords = useMemo(() => {
    return Object.values(groupedWords).flatMap(units => Object.values(units).flatMap(v => v));
  }, [groupedWords]);

  const currentIndex = useMemo(() => Math.max(0, allWords.findIndex(w => w.id === persist.activeId)), [allWords, persist.activeId]);
  const currentWord = allWords[currentIndex] || allWords[0] || {};

  const setActiveId = useCallback((id) => setPersist(s => ({ ...s, activeId: id })), [setPersist]);
  const toggleFavorite = useCallback((id) => setPersist(s => {
    const favs = new Set(s.favorites);
    favs.has(id) ? favs.delete(id) : favs.add(id);
    return { ...s, favorites: [...favs] };
  }), [setPersist]);

  const togglePlace = useCallback((place) => setOpenPlaces(prev => ({ ...prev, [place]: !prev[place] })), []);
  const toggleUnit = useCallback((place, unit) => setOpenUnits(prev => ({ ...prev, [`${place}-${unit}`]: !prev[`${place}-${unit}`] })), []);

  /* -------- Enhancements: keyboard + actions -------- */
  const goPrev = useCallback(() => {
    if (!allWords.length) return;
    const idx = (currentIndex - 1 + allWords.length) % allWords.length;
    setActiveId(allWords[idx].id);
  }, [allWords, currentIndex, setActiveId]);

  const goNext = useCallback(() => {
    if (!allWords.length) return;
    const idx = (currentIndex + 1) % allWords.length;
    setActiveId(allWords[idx].id);
  }, [allWords, currentIndex, setActiveId]);

  const goRandom = useCallback(() => {
    if (!allWords.length) return;
    let idx = Math.floor(Math.random() * allWords.length);
    if (idx === currentIndex && allWords.length > 1) idx = (idx + 1) % allWords.length;
    setActiveId(allWords[idx].id);
  }, [allWords, currentIndex, setActiveId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      if (e.key.toLowerCase() === "f") { e.preventDefault(); if (currentWord?.id) toggleFavorite(currentWord.id); }
      if (e.key.toLowerCase() === "r") { e.preventDefault(); goRandom(); }
      if (e.key === "Enter" && currentWord?.word) { e.preventDefault(); speak(currentWord.word); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentWord, goPrev, goNext, goRandom, toggleFavorite]);

  /* -------- Tilt effect for spotlight card -------- */
  const cardRef = useRef(null);
  const onTilt = (e) => {
    if (isTouchDevice) return;
    const el = cardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    el.style.setProperty("--rx", `${(-dy * 6).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(dx * 8).toFixed(2)}deg`);
  };
  const resetTilt = () => {
    if (isTouchDevice) return;
    const el = cardRef.current; if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  const copy = async (text) => { try { await navigator.clipboard.writeText(text||""); } catch {} };
  const share = async (title, text) => { try { if (navigator.share) await navigator.share({ title, text }); else await copy(`${title}\n${text}`); } catch {} };

  /* ======================= UI ======================= */
  return (
    <div dir="rtl" className="h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Background aurora */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"/>
        <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-3xl"/>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl"/>
      </div>

      {/* Header */}
      <div className="px-4 pt-3 pb-2 sticky top-0 z-30 bg-gradient-to-b from-zinc-950/80 to-transparent backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-md bg-emerald-400/30"/>
              <div className="relative rounded-xl px-2 py-1 bg-zinc-900 ring-1 ring-white/10 inline-flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-emerald-300"/>
                <span className="font-extrabold text-sm sm:text-base">ده‌نگه‌کان</span>
              </div>
            </div>
            <span className="hidden sm:inline text-sm text-zinc-400">— English Pronunciation Vault</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setPersist(s => ({ ...s, onlyFavs: !s.onlyFavs }))}
              className={cls("px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs",
                persist.onlyFavs ? "bg-yellow-500/20 border-yellow-400/30 text-yellow-100" : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10")}
              title="فقط دڵخواز"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1"/> دڵخواز
            </button>
            <button onClick={fetchWords} className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] sm:text-xs">
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1"/> نوێکردنەوە
            </button>
            <button onClick={() => window.history.back()} className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] sm:text-xs">
              <House className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1"/> گەڕانەوە
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative max-w-full sm:max-w-xl">
          <input
            dir="ltr"
            ref={searchRef}
            value={persist.search}
            onChange={(e) => setPersist(s => ({ ...s, search: e.target.value }))}
            placeholder="/  گەڕان بە وشە، IPA، یان واتا…"
            className="w-full rounded-2xl bg-zinc-900/70 border border-white/10 text-sm px-9 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400/30"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"/>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 pb-5 overflow-hidden">
        {/* Spotlight */}
        <div className="min-h-[18rem] lg:h-full lg:sticky lg:top-24">
          <motion.div
            ref={cardRef}
            onMouseMove={onTilt}
            onMouseLeave={resetTilt}
            className="relative rounded-3xl p-[2px] bg-[conic-gradient(at_70%_30%,#22d3ee_0deg,#a78bfa_140deg,#34d399_260deg,#22d3ee_360deg)]"
            style={{ transform: "perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))" }}
          >
            <div className="rounded-3xl bg-zinc-950 ring-1 ring-white/10 overflow-hidden">
              <div className="p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-400">{allWords.length ? `${currentIndex+1} / ${allWords.length}` : "—"}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (currentWord?.id) toggleFavorite(currentWord.id); }}
                    className="rounded-xl bg-white/5 hover:bg-white/10 transition p-2 ring-1 ring-white/10"
                    aria-label="favorite"
                    title="دڵخواز"
                  >
                    {persist.favorites.includes(currentWord?.id) ? (
                      <Star className="w-5 h-5 text-yellow-300"/>
                    ) : (
                      <StarOff className="w-5 h-5 text-white/80"/>
                    )}
                  </button>
                </div>

                {/* Place / Unit badge */}
                {(currentWord.place || currentWord.unit) && (
                  <div className="mt-4 mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10">
                    {currentWord.place && <span className="text-sm font-semibold text-emerald-200">{currentWord.place}</span>}
                    {currentWord.unit && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30">به‌شی {currentWord.unit}</span>}
                  </div>
                )}

                {/* Word */}
                <div className="text-center select-none">
                  <div className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none drop-shadow-[0_6px_24px_rgba(34,211,238,0.25)]">
                    {currentWord.word || "—"}
                  </div>
                  {currentWord.ipa && <div className="mt-2 text-xl sm:text-2xl font-bold text-cyan-200/90">{currentWord.ipa}</div>}
                  {currentWord.kurdishReading && <div dir="rtl" className="mt-1 text-base sm:text-lg font-semibold text-zinc-200">{currentWord.kurdishReading}</div>}
                  {currentWord.kurdishMeaning && <div dir="rtl" className="mt-1 text-sm text-zinc-400">{currentWord.kurdishMeaning}</div>}
                </div>

                {/* Controls */}
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button onClick={goPrev} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10"><SkipBack className="w-5 h-5"/></button>
                  <button onClick={() => { if (!currentWord.word) return; const ok = speak(currentWord.word); if (!ok) navigator.clipboard.writeText(currentWord.word); }} className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 ring-1 ring-emerald-400/30 inline-flex items-center gap-2">
                    <Volume2 className="w-5 h-5"/> <span className="text-sm">خوێندنەوە</span>
                  </button>
                  <button onClick={goNext} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10"><SkipForward className="w-5 h-5"/></button>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-zinc-400 flex-wrap">
                  <button onClick={goRandom} className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 inline-flex items-center gap-1"><Shuffle className="w-3 h-3 sm:w-4 sm:h-4"/> هەڕەمەکی</button>
                  <button onClick={() => copy(currentWord.word || "")} className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 inline-flex items-center gap-1"><CopyIcon className="w-3 h-3 sm:w-4 sm:h-4"/> کۆپی</button>
                  <button onClick={() => share("وشە", `${currentWord.word || ""} — ${currentWord.ipa || ""}`)} className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-white/10 inline-flex items-center gap-1"><Share2 className="w-3 h-3 sm:w-4 sm:h-4"/> هاوبەشکردن</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Browser */}
        <div className="min-h-[40vh] overflow-y-auto pr-0 lg:pr-2">
          {isError && (
            <div className="bg-rose-500/10 border border-rose-400/30 text-rose-200 rounded-xl p-4 mb-4 text-center">ببورە، کێشەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.</div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse"/>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedWords).map(place => (
                <div key={place} className="space-y-2" ref={el => (placeAnchors.current[place] = el)}>
                  <button
                    onClick={() => togglePlace(place)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                  >
                    <h2 className="text-lg font-extrabold">{place}</h2>
                    <ChevronDown className={cls("w-5 h-5 text-zinc-400 transition-transform", openPlaces[place] ? "rotate-180" : "rotate-0")} />
                  </button>
                  <Collapsible isOpen={openPlaces[place]}>
                    <div className="space-y-2 pr-2">
                      {Object.keys(groupedWords[place]).map(unit => {
                        const key = `${place}-${unit}`;
                        return (
                          <div key={key} className="space-y-2">
                            <button
                              onClick={() => toggleUnit(place, unit)}
                              className="flex items-center justify-between w-full px-4 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                            >
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30">به‌شی {unit}</span>
                              <ChevronDown className={cls("w-4 h-4 text-zinc-400 transition-transform", openUnits[key] ? "rotate-180" : "rotate-0")} />
                            </button>
                            <Collapsible isOpen={openUnits[key]}>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-2">
                                {groupedWords[place][unit].map((w) => {
                                  const active = w.id === currentWord.id;
                                  const fav = persist.favorites.includes(w.id);
                                  return (
                                    <motion.button
                                      key={w.id}
                                      onClick={() => setActiveId(w.id)}
                                      whileHover={{ y: -2 }}
                                      transition={SPRING}
                                      className={cls(
                                        "group text-right rounded-2xl overflow-hidden border ring-1 p-3 sm:p-4",
                                        active
                                          ? "bg-emerald-600/20 border-emerald-400/30 ring-emerald-400/20"
                                          : "bg-zinc-950/60 border-white/10 hover:border-emerald-400/30"
                                      )}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className={cls("font-extrabold leading-tight line-clamp-2", active ? "text-emerald-100" : "text-white")}>{w.word}</div>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); toggleFavorite(w.id); }}
                                          className="h-7 w-7 grid place-items-center rounded-md bg-white/5 hover:bg-white/10 ring-1 ring-white/10"
                                          title={fav ? "دڵخواز" : "زیادکردن بۆ دڵخواز"}
                                        >
                                          {fav ? <Star className={cls("w-4 h-4", active ? "text-yellow-300" : "text-yellow-400")} /> : <StarOff className={cls("w-4 h-4", active ? "text-white/80" : "text-zinc-400")} />}
                                        </button>
                                      </div>
                                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] sm:text-[11px]">
                                        {w.ipa && <span className={cls("px-2 py-0.5 rounded-full font-mono", active ? "bg-white/10 text-white" : "bg-white/5 text-zinc-300")}>{w.ipa}</span>}
                                        {w.kurdishReading && <span dir="rtl" className={cls("px-2 py-0.5 rounded-full font-semibold", active ? "bg-white/10 text-white" : "bg-white/5 text-zinc-300")}>{w.kurdishReading}</span>}
                                        {w.kurdishMeaning && <span dir="rtl" className={cls("px-2 py-0.5 rounded-full", active ? "bg-white/10 text-white" : "bg-white/5 text-zinc-300")}>{w.kurdishMeaning}</span>}
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </div>
                  </Collapsible>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer hints */}
      <div className="px-4 pb-4 text-[11px] text-zinc-400 grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div>کورتەڕێک: <kbd className="px-1.5 py-0.5 rounded bg-white/10">/</kbd> گەڕان</div>
        <div><kbd className="px-1.5 py-0.5 rounded bg-white/10">←</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-white/10">→</kbd> پێش/دواتر</div>
        <div className="hidden sm:block"><kbd className="px-1.5 py-0.5 rounded bg-white/10">F</kbd> دڵخواز · <kbd className="px-1.5 py-0.5 rounded bg-white/10">R</kbd> هەڕەمەکی</div>
      </div>
    </div>
  );
}