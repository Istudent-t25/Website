// src/pages/EpisodePage.jsx
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Home,
  Layers,
  Sparkles,
  BookOpen,
  ChevronRight,
  Star,
  StarOff,
  Share2,
  Download,
  Filter,
  Search,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

/* =========================
   CONFIG / API
   ========================= */
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";
const PER_PAGE = 50;
const SPRING = { type: "spring", stiffness: 260, damping: 24, mass: 0.6 };

const LS_FAV = "episode_favorites";
const LS_PROGRESS = "episode_progress";
const LS_CACHE = "episode_cache_v1";
const LS_TEXTPX = "episode_text_px";

/* =========================
   HELPERS
   ========================= */
async function fetchAllPages(baseUrl, params = {}) {
  const sp = new URLSearchParams({ per_page: String(PER_PAGE), ...params });
  let url = `${baseUrl}?${sp.toString()}`;
  let out = [];
  for (;;) {
    const r = await fetch(url);
    if (!r.ok) throw new Error("Network error");
    const j = await r.json();
    const pageData = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
    out = out.concat(pageData);
    if (!j?.next_page_url) break;
    url = j.next_page_url;
  }
  return out;
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function saveLS(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}
function loadLS(key, fallback) {
  try {
    const x = localStorage.getItem(key);
    return x ? JSON.parse(x) : fallback;
  } catch {
    return fallback;
  }
}

/* =========================
   PAGE STATE
   ========================= */
const pageInitialState = {
  view: "list",
  selectedEpisode: null,
  err: "",
  paperSets: [],
  episodeItems: [],
};

function pageReducer(state, action) {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.payload };
    case "SET_ERROR":
      return { ...state, err: action.payload };
    case "SET_EPISODES":
      return { ...state, paperSets: action.payload };
    case "SELECT_EPISODE":
      return {
        ...state,
        view: "episode",
        selectedEpisode: action.payload.episode,
        episodeItems: action.payload.items,
      };
    case "CLEAR_SELECTION":
      return { ...state, view: "list", selectedEpisode: null, episodeItems: [] };
    default:
      return state;
  }
}

/* =========================
   MAIN COMPONENT
   ========================= */
export default function EpisodePage() {
  const nav = useNavigate();
  const q = useQuery();
  const qGrade = q.get("grade") || "";
  const qStream = q.get("stream") || "";
  const qRead = q.get("read") === "1";
  const qEpisodeId = q.get("episode");

  const [state, dispatch] = useReducer(pageReducer, pageInitialState);

  // UI controls
  const [textPx, setTextPx] = useState(() => loadLS(LS_TEXTPX, 16)); // persisted
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("title");
  const [sortDir, setSortDir] = useState("asc");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // local data helpers
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [favorites, setFavorites] = useState(() => loadLS(LS_FAV, {}));
  const [progress, setProgress] = useState(() => loadLS(LS_PROGRESS, {}));
  const [openedItemId, setOpenedItemId] = useState(null);

  // fetch with optimistic cache
  useEffect(() => {
    const cached = loadLS(LS_CACHE, null);
    if (
      cached?.grade === qGrade &&
      cached?.stream === qStream &&
      Array.isArray(cached?.data)
    ) {
      dispatch({ type: "SET_EPISODES", payload: cached.data });
      setLoading(true);
    }
    (async () => {
      try {
        const data = await fetchAllPages(API_PAPERS, {
          grade: qGrade,
          stream: qStream,
          type: "episode",
        });
        dispatch({ type: "SET_EPISODES", payload: data });
        saveLS(LS_CACHE, { grade: qGrade, stream: qStream, data });
        setLoading(false);
      } catch (e) {
        dispatch({
          type: "SET_ERROR",
          payload: "نەتوانرا بابەتەکان باربکرێت.",
        });
        setLoading(false);
      }
    })();
  }, [qGrade, qStream]);

  // If user navigates directly to read route with episode id, auto-select
  useEffect(() => {
    if (qRead && qEpisodeId && state.paperSets.length && !state.selectedEpisode) {
      const ep = state.paperSets.find((e) => String(e.id) === String(qEpisodeId));
      if (ep) selectEpisode(ep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qRead, qEpisodeId, state.paperSets]);

  // persist text size
  useEffect(() => saveLS(LS_TEXTPX, textPx), [textPx]);

  // quote of the day
  useEffect(() => {
    const quotes = [
      "هەوڵ بدە، هەموو شتێک دەگەیتەوە.",
      "زۆرترین هەوڵ، باشترین ئەنجام.",
      "کەمێک بۆ هەموو ڕۆژێک = گەورە گۆڕانکاری.",
      "خۆت باوەر پێبکە — پاشان دەستی پێ بکە.",
    ];
    setQuote(quotes[new Date().getDate() % quotes.length]);
  }, []);

  // computed: filtered + sorted episodes
  const filteredSorted = useMemo(() => {
    const term = searchTerm.trim();
    let list = state.paperSets || [];
    if (term) {
      const t = term.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(t) ||
          String(e.year || "").includes(t)
      );
    }
    if (onlyFavorites) {
      list = list.filter((e) => favorites[e.id]);
    }
    list = list.slice().sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "title")
        return mul * String(a.title || "").localeCompare(String(b.title || ""));
      if (sortKey === "items")
        return mul * ((a.items?.length || 0) - (b.items?.length || 0));
      if (sortKey === "year") return mul * ((a.year || 0) - (b.year || 0));
      return 0;
    });
    return list;
  }, [state.paperSets, searchTerm, sortKey, sortDir, favorites, onlyFavorites]);

  // actions
  const selectEpisode = (episode) => {
    const items = (episode.items || []).map((it, idx) => ({
      id: it?.id ?? idx,
      url:
        it?.url ||
        it?.pdf_url ||
        it?.file_url ||
        it?.image_url ||
        it?.thumb_url ||
        "",
      label: it?.label || `بەشی ${idx + 1}`,
      description: it?.description || "",
      mime: guessMime(it),
    }));
    dispatch({ type: "SELECT_EPISODE", payload: { episode, items } });
  };

  const openReadPage = () => {
    const id = state.selectedEpisode?.id;
    if (!id) return;
    const params = new URLSearchParams(window.location.search);
    params.set("read", "1");
    params.set("episode", String(id));
    nav({ search: `?${params.toString()}` }, { replace: false });
  };

  const exitReadPage = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("read");
    // keep episode param so user can come back if needed, or drop it:
    params.delete("episode");
    nav({ search: `?${params.toString()}` }, { replace: false });
  };

  const toggleFavorite = (episodeId) => {
    setFavorites((prev) => {
      const next = { ...prev, [episodeId]: !prev[episodeId] };
      saveLS(LS_FAV, next);
      return next;
    });
  };

  const toggleItemViewed = (episodeId, itemId) => {
    setProgress((prev) => {
      const byEpisode = { ...(prev[episodeId] || {}) };
      byEpisode[itemId] = !byEpisode[itemId];
      const next = { ...prev, [episodeId]: byEpisode };
      saveLS(LS_PROGRESS, next);
      return next;
    });
  };

  const toggleDescription = (itemId) =>
    setOpenedItemId(openedItemId === itemId ? null : itemId);

  const viewedPercent = useMemo(() => {
    if (!state.selectedEpisode) return 0;
    const epId = state.selectedEpisode.id;
    const map = progress[epId] || {};
    const total = state.episodeItems.length || 1;
    const done = Object.values(map).filter(Boolean).length;
    return Math.round((done / total) * 100);
  }, [progress, state.selectedEpisode, state.episodeItems]);

  /* ========= RENDER ========= */

  // If user is on the "read page" route, show that page and nothing else
  if (qRead && state.view === "episode") {
    const textPxRead = Math.max(12, Math.min(28, textPx - 2)); // slightly smaller in read mode
    return (
      <div dir="rtl" className="p-3 sm:p-5 space-y-3">
        {/* Slimmer header for mobile – smaller text */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 p-2 sm:p-3 sticky top-2 z-10 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-white min-w-0">
              <BookOpen className="w-5 h-5 text-fuchsia-300 shrink-0" />
              <div className="font-bold text-sm sm:text-base truncate">
                {state.selectedEpisode?.title}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* font slider persists */}
              <label className="hidden sm:flex items-center gap-2 text-white/90 text-[11px]">
                قەبارە
                <input
                  type="range"
                  min="12"
                  max="28"
                  value={textPx}
                  onChange={(e) => setTextPx(parseInt(e.target.value))}
                  className="accent-fuchsia-400"
                />
              </label>
              <button
                onClick={exitReadPage}
                className="text-xs sm:text-sm px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow hover:opacity-90"
              >
                <X className="inline w-4 h-4" /> داخستن
              </button>
            </div>
          </div>
        </div>

        {/* Reading content */}
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-3 sm:p-4">
            <div
              className="text-zinc-300 leading-relaxed space-y-5"
              style={{ fontSize: `${textPxRead}px` }}
            >
              {state.episodeItems.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="text-white font-semibold">{item.label}</div>
                  {item.description && <p>{item.description}</p>}
                  {item.url && renderMedia(item)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4">
      {/* Header (smaller on mobile) */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 p-2 sm:p-4 sticky top-2 z-10 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white min-w-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-300 shrink-0" />
            <div className="font-extrabold text-base sm:text-xl truncate tracking-wide drop-shadow-lg">
              {state.view === "list"
                ? "📺 ئەپیسۆدەکان"
                : state.selectedEpisode?.title || "بابەت"}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="hidden sm:flex items-center gap-2 text-white/90 text-xs">
              قەبارەی نوسین
              <input
                type="range"
                min="12"
                max="28"
                value={textPx}
                onChange={(e) => setTextPx(parseInt(e.target.value))}
                className="accent-fuchsia-400"
              />
            </label>

            <button
              onClick={() => nav(-1)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:opacity-90 text-white shadow-lg"
            >
              <Home className="w-4 h-4" /> سسه‌ره‌تا
            </button>
          </div>
        </div>

        {/* quote of the day (smaller) */}
        <div className="mt-1 text-fuchsia-200 text-[11px] sm:text-xs flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{quote}</span>
        </div>
      </div>

      {/* LIST VIEW */}
      {state.view === "list" && (
        <motion.div
          key="list"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={SPRING}
          className="space-y-3"
        >
          {/* Filters bar */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="episode-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="گەڕان لە ناونیشان/ساڵ..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-fuchsia-400/30"
                  style={{ fontSize: `${textPx}px` }}
                />
              </div>
              <div className="flex gap-2">
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-xl bg-zinc-800/60 border border-white/10 text-zinc-200">
                  <Filter className="w-4 h-4" />
                  <select
                    className="bg-transparent outline-none"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                  >
                    <option value="title">ناونیشان</option>
                    <option value="items">ژمارەی بەش</option>
                    <option value="year">ساڵ</option>
                  </select>
                  <select
                    className="bg-transparent outline-none"
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value)}
                  >
                    <option value="asc">⬆️</option>
                    <option value="desc">⬇️</option>
                  </select>
                </div>

                <button
                  onClick={() => setOnlyFavorites((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl border text-sm transition ${
                    onlyFavorites
                      ? "bg-amber-400/20 border-amber-300/40 text-amber-200"
                      : "bg-white/5 border-white/10 text-white"
                  }`}
                >
                  ❤ دڵخواز
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden"
                />
              ))}
            </div>
          ) : filteredSorted.length === 0 ? (
            <div className="text-zinc-300 text-center py-6">
              هیچ بابەتێک نەدۆزرایەوە.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSorted.map((episode) => (
                <motion.div
                  key={episode.id}
                  whileHover={{ scale: 1.02 }}
                  transition={SPRING}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectEpisode(episode)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") selectEpisode(episode);
                  }}
                  className="rounded-2xl p-5 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 hover:border-violet-400/40 shadow-md hover:shadow-violet-500/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-extrabold text-white leading-tight line-clamp-2"
                        style={{ fontSize: `${textPx + 2}px` }}
                      >
                        {episode.title}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
                        <Badge className="text-fuchsia-200 border-fuchsia-400/30 bg-fuchsia-500/10">
                          <Sparkles className="w-3 h-3" /> {episode.items?.length || 0} بەش
                        </Badge>
                        {episode.year && <Badge>ساڵ {episode.year}</Badge>}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(episode.id);
                      }}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-amber-300"
                      title={favorites[episode.id] ? "لابردنی دڵخواز" : "زیادکردن بۆ دڵخواز"}
                    >
                      {favorites[episode.id] ? <Star className="w-5 h-5" /> : <StarOff className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectEpisode(episode);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm shadow hover:opacity-90"
                    >
                      بینینی بەشەکان
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* EPISODE VIEW */}
      {state.view === "episode" && (
        <motion.div
          key="episode"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={SPRING}
          className="space-y-3"
        >
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/70 p-3 sm:p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-fuchsia-300" />
              <div className="text-white font-bold text-sm sm:text-base">
                {state.selectedEpisode?.title}
              </div>
              <span className="text-[11px] text-zinc-400">
                ({viewedPercent}% تەواو بووە)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openReadPage}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs sm:text-sm hover:bg-white/10"
                title="کردنەوەی دۆخی خوێندن لە پەڕەی جیاواز"
              >
                <Maximize2 className="inline w-4 h-4" /> دۆخی خوێندن
              </button>
              <button
                onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow hover:opacity-90"
              >
                گەڕانەوە
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {state.episodeItems.map((item) => {
              const epId = state.selectedEpisode?.id;
              const done = !!(progress[epId]?.[item.id]);
              const isOpen = openedItemId === item.id;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  transition={SPRING}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => toggleItemViewed(epId, item.id)}
                      className={`px-2 py-1 rounded-md text-xs border ${
                        done
                          ? "bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-200"
                          : "bg-white/5 border-white/10 text-white"
                      }`}
                    >
                      {done ? "✓" : "◻︎"}
                    </button>

                    {/* label as div not button */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleDescription(item.id)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-fuchsia-300" />
                      <span
                        className="font-semibold text-white"
                        style={{ fontSize: `${textPx}px` }}
                      >
                        {item.label}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 ml-auto text-zinc-400 transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      {/* <IconBtn
                        title="بلێکەوە"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareItem(item);
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </IconBtn> */}
                      {item.url && (
                        <a
                          href={item.url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10"
                          title="داگرتن"
                        >
                          <Download className="inline w-4 h-4" /> داگرتن
                        </a>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && item.description && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={SPRING}
                        className="mt-2 text-zinc-300 leading-relaxed whitespace-pre-wrap"
                        style={{ fontSize: `${textPx}px` }}
                      >
                        {item.description}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {item.url && (
                    <div className="mt-3 rounded-xl ring-1 ring-violet-400/20 overflow-hidden bg-black/30">
                      {renderMedia(item)}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* =========================
   UI HELPERS
   ========================= */
function Badge({ children, className = "" }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 ${className}`}
    >
      {children}
    </span>
  );
}

function IconBtn({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10"
    >
      {children}
    </button>
  );
}

function guessMime(it) {
  const url =
    it?.url ||
    it?.pdf_url ||
    it?.file_url ||
    it?.image_url ||
    it?.thumb_url ||
    "";
  const lower = url.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.match(/\.(mp4|webm|ogg)$/)) return "video";
  if (lower.match(/\.(mp3|wav|m4a)$/)) return "audio";
  if (lower.match(/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/)) return "image";
  return "unknown";
}

function renderMedia(item) {
  const { url, mime } = item;
  if (!url) return null;
  if (mime === "image") {
    return (
      <img
        src={url}
        alt={item.label}
        loading="lazy"
        className="w-full h-auto object-contain bg-black/20"
      />
    );
  }
  if (mime === "application/pdf") {
    return (
      <iframe
        src={`${url}#view=FitH`}
        title={item.label}
        className="w-full h-[65vh] sm:h-[70vh] bg-black"
      />
    );
  }
  if (mime === "video") {
    return (
      <video controls className="w-full h-auto bg-black" preload="metadata">
        <source src={url} />
      </video>
    );
  }
  if (mime === "audio") {
    return (
      <audio controls className="w-full">
        <source src={url} />
      </audio>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block p-4 text-center text-white underline"
    >
      کرتە بکە بۆ بینین
    </a>
  );
}

/* Robust mobile share with fallbacks */
async function shareItem(item) {
  const url = item.url || window.location.href;
  const title = item.label || document.title || "Share";
  const text = item.description || title;

  try {
    // Prefer Web Share API v2 if available & allowed
    if (navigator.share) {
      const can = !navigator.canShare || navigator.canShare({ title, text, url });
      if (can) {
        await navigator.share({ title, text, url });
        return;
      }
    }
  } catch {
    // ignore and try fallbacks
  }

  // Fallback 1: copy to clipboard (works on most mobiles if HTTPS)
  try {
    await navigator.clipboard.writeText(url);
    alert("لینک لە کەپیۆ بۆردرا!");
    return;
  } catch {
    // ignore
  }

  // Fallback 2: try opening link (lets user share from the opened app/page)
  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    // last resort: no-op
  }
}
