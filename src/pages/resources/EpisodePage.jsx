import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Layers,
  BookOpen,
  ChevronRight,
  Search,
  Star,
  StarOff,
  Download,
  X,
  List,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Grid3x3,
  Calendar,
  FileText,
  Volume2,
  Video,
  Image as ImageIcon,
  ArrowUpDown,
  Trophy,
  Heart,
  RotateCcw,
} from "lucide-react";

/* =========================
   CONFIG / API
   ========================= */
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";
const PER_PAGE = 50;
const SPRING = { type: "spring", stiffness: 260, damping: 24, mass: 0.7 };
const STAGGER = { delayChildren: 0.06, staggerChildren: 0.04 };

/* =========================
   STATE
   ========================= */
const pageInitial = {
  view: "list",
  isLoading: true,
  err: "",
  papers: [],
  selectedEpisode: null,
  episodeItems: [],
  imageViewer: null,
};

function pageReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, err: action.payload, isLoading: false };
    case "SET_PAPERS":
      return { ...state, papers: action.payload, isLoading: false };
    case "SELECT_EPISODE":
      return {
        ...state,
        view: "episode",
        selectedEpisode: action.payload.episode,
        episodeItems: action.payload.items,
      };
    case "CLEAR_SELECTION":
      return { ...state, view: "list", selectedEpisode: null, episodeItems: [] };
    case "OPEN_IMAGE_VIEWER":
      return { ...state, imageViewer: action.payload };
    case "CLOSE_IMAGE_VIEWER":
      return { ...state, imageViewer: null };
    default:
      return state;
  }
}

const controlsInitial = {
  searchTerm: "",
  sortKey: "title",
  sortDir: "asc",
  onlyFavorites: false,
  viewMode: "grid", // grid | list | compact
};

function controlsReducer(state, action) {
  return { ...state, ...action.payload };
}

/* =========================
   HELPERS
   ========================= */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

async function fetchAllPages(baseUrl, params = {}, signal) {
  const sp = new URLSearchParams({ per_page: String(PER_PAGE), ...params });
  let url = `${baseUrl}?${sp.toString()}`;
  const out = [];
  for (;;) {
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error(`Network error: ${r.status}`);
    const j = await r.json();
    const chunk = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
    out.push(...chunk);
    if (!j?.next_page_url) break;
    url = j.next_page_url;
  }
  return out;
}

function guessMime(it) {
  const url =
    it?.url ||
    it?.pdf_url ||
    it?.file_url ||
    it?.image_url ||
    it?.thumb_url ||
    "";
  const lower = (url || "").toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (/\.(mp4|webm|ogg)$/.test(lower)) return "video";
  if (/\.(mp3|wav|m4a)$/i.test(lower)) return "audio";
  if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(lower)) return "image";
  return "unknown";
}

const getMimeIcon = (mime) => {
  if (mime === "application/pdf") return FileText;
  if (mime.startsWith("video")) return Video;
  if (mime.startsWith("audio")) return Volume2;
  if (mime.startsWith("image")) return ImageIcon;
  return FileText;
};

// localStorage helpers
const LS_FAVORITES = "episode_favorites_v1";
const LS_PROGRESS = "episode_progress_v1";
// replace your safeParse with this:
const safeParse = (s, fb) => {
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" ? v : fb;
  } catch {
    return fb;
  }
};


/* =========================
   UI Primitives (Neutral, Professional)
   ========================= */
const Card = ({ children, className = "" }) => (
  <motion.div
    className={`relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg ${className}`}
    whileHover={{ translateY: -2 }}
    transition={SPRING}
  >
    {children}
  </motion.div>
);

const Button = ({
  children,
  className = "",
  onClick,
  variant = "ghost", // ghost | solid
  icon: Icon,
  ...rest
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors";
  const styles =
    variant === "solid"
      ? "bg-white/10 hover:bg-white/20 text-white border border-white/15"
      : "bg-transparent hover:bg-white/10 text-white border border-white/10";
  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`} {...rest}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const Stat = ({ label, value, Icon }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="text-xs text-zinc-400 mt-1">{label}</p>
      </div>
      {Icon && <Icon className="w-6 h-6 text-zinc-300" />}
    </div>
  </Card>
);

/* =========================
   VIEW
   ========================= */
const ImageViewer = ({ src, onClose }) => (
  <AnimatePresence>
    {src && (
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-full max-h-full"
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={src}
            alt="Preview"
            className="max-w-full max-h-[88vh] rounded-xl border border-white/15 shadow-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-2 rounded-lg bg-black/60 hover:bg-black/70 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function ModernEpisodePage() {
  const nav = useNavigate();
  const q = useQuery();
  const { id: routeSubjectId } = useParams();
  const subjectId = q.get("subject") || q.get("subject_id") || routeSubjectId || "";
  const qGrade = q.get("grade") || "";
  const qStream = q.get("stream") || "";
  const qEpisodeId = q.get("episode");

  const [page, dispatch] = useReducer(pageReducer, pageInitial);
  const [controls, setControls] = useReducer(controlsReducer, controlsInitial);
  const [favorites, setFavorites] = useState(() =>
    safeParse(localStorage.getItem(LS_FAVORITES), {})
  );
  const [progress, setProgress] = useState(() =>
    safeParse(localStorage.getItem(LS_PROGRESS), {})
  );
  const [openedItemId, setOpenedItemId] = useState(null);

  // Persist favorites + progress
  useEffect(() => {
    localStorage.setItem(LS_FAVORITES, JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem(LS_PROGRESS, JSON.stringify(progress));
  }, [progress]);

  // Load data
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    (async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: "" });
      try {
        const papers = await fetchAllPages(
          API_PAPERS,
          {
            grade: qGrade || undefined,
            stream: qStream || undefined,
            subject_id: subjectId || undefined,
            type: "episode",
          },
          controller.signal
        );
        if (!alive) return;
        dispatch({ type: "SET_PAPERS", payload: papers });
        if (qEpisodeId) {
          const ep = papers.find((p) => String(p.id) === String(qEpisodeId));
          if (ep) selectEpisode(ep);
        }
      } catch (e) {
        if (!alive || controller.signal.aborted) return;
        dispatch({
          type: "SET_ERROR",
          payload: e?.message || "هەڵەیەک ڕوویدا",
        });
      }
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [qGrade, qStream, subjectId, qEpisodeId]);

  /* ---------- Derived lists ---------- */
  const filteredSorted = useMemo(() => {
    const { searchTerm, sortKey, sortDir, onlyFavorites } = controls;
    const term = (searchTerm || "").trim().toLowerCase();
    let list = page.papers || [];
    if (term)
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(term) ||
          String(e.year || "").includes(term)
      );
    if (onlyFavorites) list = list.filter((e) => favorites[e.id]);
    list = list.slice().sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "title")
        return (
          mul * String(a.title || "").localeCompare(String(b.title || ""), "ku")
        );
      if (sortKey === "items")
        return mul * ((a.items?.length || 0) - (b.items?.length || 0));
      if (sortKey === "year") return mul * ((a.year || 0) - (b.year || 0));
      return 0;
    });
    return list;
  }, [page.papers, controls, favorites]);

  const stats = useMemo(() => {
    const totalEpisodes = page.papers.length;
    const totalFavorites = Object.values(favorites).filter(Boolean).length;
    const totalItems = page.papers.reduce(
      (sum, ep) => sum + (ep.items?.length || 0),
      0
    );
    const completedEpisodes = page.papers.filter((ep) => {
      const epProgress = progress[ep.id] || {};
      const total = ep.items?.length || 0;
      const done = Object.values(epProgress).filter(Boolean).length;
      return total > 0 && done === total;
    }).length;
    return { totalEpisodes, totalFavorites, totalItems, completedEpisodes };
  }, [page.papers, favorites, progress]);

  /* ---------- Actions ---------- */
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

  const toggleFavorite = (episodeId) => {
    setFavorites((prev) => ({ ...prev, [episodeId]: !prev[episodeId] }));
  };

  const toggleItemViewed = (episodeId, itemId) => {
    setProgress((prev) => {
      const ep = prev[episodeId] || {};
      return { ...prev, [episodeId]: { ...ep, [itemId]: !ep[itemId] } };
    });
  };

  const clearProgress = () => {
    // Confirmation dialog in Kurdish
    if (window.confirm("ئایا دڵنیایت لە سڕینەوەی هەموو پێشکەوتنەکان؟ ئەمە ناتوانرێت هەڵبوەشێنرێتەوە.")) {
      setProgress({});
      // Note: Progress will automatically persist and update local storage via useEffect.
    }
  };

  /* ---------- Small components ---------- */
  const LoadingSkeleton = () => {
    const layout =
      controls.viewMode === "grid"
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
        : "space-y-3";
    return (
      <div className={layout}>
        {Array.from({ length: controls.viewMode === "compact" ? 8 : 12 }).map(
          (_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-1 w-full bg-white/10" />
              <div
                className={
                  controls.viewMode === "grid" ? "p-6 space-y-4" : "p-4 flex gap-4"
                }
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </Card>
          )
        )}
      </div>
    );
  };

  const EpisodeCard = ({ episode }) => {
    const epId = episode.id;
    const epProgress = progress[epId] || {};
    const totalItems = episode.items?.length || 0;
    const done = Object.values(epProgress).filter(Boolean).length;
    const percent = totalItems > 0 ? Math.round((done / totalItems) * 100) : 0;
    const isCompleted = percent === 100;

    if (controls.viewMode === "compact") {
      return (
        <motion.div layout>
          <Card className="overflow-hidden">
            {percent > 0 && (
              <div className="h-1 bg-zinc-800">
                <motion.div
                  className={`h-full ${
                    isCompleted ? "bg-emerald-400" : "bg-cyan-400"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            )}
            <div className="p-4 flex items-center gap-4">
              <button
                onClick={() => selectEpisode(episode)}
                className="flex-1 flex items-center gap-4 text-right"
              >
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                    isCompleted ? "bg-emerald-500/15" : "bg-white/10"
                  }`}
                >
                  {isCompleted ? (
                    <Trophy className="w-6 h-6 text-emerald-300" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-zinc-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm line-clamp-1">
                    {episode.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                    <span>{totalItems} بەش</span>
                    {episode.year && <span>• {episode.year}</span>}
                    {isCompleted && <span className="text-emerald-400">• تەواو</span>}
                  </div>
                </div>
              </button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(episode.id);
                }}
                className={`p-2.5 ${
                  favorites[epId]
                    ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                    : ""
                }`}
              >
                {favorites[epId] ? (
                  <Star className="w-5 h-5 fill-current" />
                ) : (
                  <StarOff className="w-5 h-5" />
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      );
    }

    return (
      <motion.div layout>
        <Card className="overflow-hidden hover:border-white/15">
          {percent > 0 && (
            <div className="h-1 bg-zinc-800">
              <motion.div
                className={`h-full ${
                  isCompleted ? "bg-emerald-400" : "bg-cyan-400"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          )}
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center border ${
                    isCompleted
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                  ) : (
                    <BookOpen className="w-7 h-7 text-zinc-200" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white leading-tight">
                    {episode.title}
                  </h3>
                  <div className="mt-1 text-xs text-zinc-400 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-4 h-4" /> {totalItems} بەش
                    </span>
                    {episode.year && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {episode.year}
                      </span>
                    )}
                    {done > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> {done} تەواو
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => selectEpisode(episode)}
                  variant="solid"
                  className="px-3 py-2"
                >
                  بینین
                </Button>
                <Button
                  onClick={() => toggleFavorite(episode.id)}
                  className={`px-2.5 ${
                    favorites[epId]
                      ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                      : ""
                  }`}
                >
                  {favorites[epId] ? (
                    <Star className="w-5 h-5 fill-current" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const EpisodeItemCard = ({
    item,
    isRead,
    onToggleRead,
    onToggleExpand,
    onImageClick,
  }) => {
    const Icon = getMimeIcon(item.mime);
    const isExpanded = openedItemId === item.id;
    const isImage = item.mime.startsWith("image");
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onToggleExpand(item.id)}
            className="p-2 rounded-lg text-zinc-300 hover:bg-white/10"
            aria-label="expand"
          >
            <ChevronRight
              className={`w-5 h-5 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
          <button
            onClick={isImage ? () => onImageClick(item.url) : undefined}
            className={`w-12 h-12 rounded-lg flex items-center justify-center border border-white/10 ${
              isImage ? "overflow-hidden hover:scale-105 transition-transform" : ""
            } ${isRead ? "bg-emerald-500/10" : "bg-white/5"}`}
            title={item.label}
          >
            {isImage ? (
              <img
                src={item.url}
                alt={item.label}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon className={`w-6 h-6 ${isRead ? "text-emerald-300" : "text-zinc-200"}`} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white line-clamp-1">{item.label}</h4>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
              {item.description || item.url}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onToggleRead(item.id)}
              className={`px-2.5 ${
                isRead ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : ""
              }`}
            >
              {isRead ? "لەدەستکرا" : "نیشانەکردن"}
            </Button>
            {!isImage && item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-xl border border-white/10 hover:bg-white/10"
                title="داگرتن/کردنەوە"
              >
                <Download className="w-5 h-5 text-zinc-200" />
              </a>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 border-t border-white/10 pt-4 text-sm text-zinc-300"
            >
              <p>
                <span className="text-zinc-400">جۆری فایل:</span> {item.mime}
              </p>
              {item.description && <p className="mt-2">{item.description}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  /* ---------- Renderers ---------- */
  const viewedPercent = useMemo(() => {
    if (!page.selectedEpisode) return 0;
    const epId = page.selectedEpisode.id;
    const map = progress[epId] || {};
    const total = page.episodeItems.length || 1;
    const done = Object.values(map).filter(Boolean).length;
    return Math.round((done / total) * 100);
  }, [progress, page.selectedEpisode, page.episodeItems]);

  const renderList = () => {
    if (page.isLoading) return <LoadingSkeleton />;
    if (filteredSorted.length === 0) {
      return (
        <Card className="p-10 text-center">
          <Layers className="w-10 h-10 mx-auto text-zinc-300 mb-3" />
          <h3 className="font-medium text-white">هیچ ئیپسۆدێک نەدۆزرایەوە</h3>
          <p className="text-sm text-zinc-400 mt-1">
            فلتەرەکان بگۆڕە یان وشەی گەڕان دابدلە.
          </p>
        </Card>
      );
    }

    const grid =
      controls.viewMode === "grid"
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
        : controls.viewMode === "list"
        ? "space-y-4"
        : "space-y-3";

    return (
      <motion.div variants={STAGGER} initial="hidden" animate="visible" className={grid}>
        <AnimatePresence>
          {filteredSorted.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderEpisode = () => {
    if (!page.selectedEpisode) return null;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-semibold text-white line-clamp-1">
                {page.selectedEpisode.title}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-4 h-4" /> {page.episodeItems.length} بەش
                </span>
                {page.selectedEpisode.year && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {page.selectedEpisode.year}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => toggleFavorite(page.selectedEpisode.id)}>
                {favorites[page.selectedEpisode.id] ? (
                  <>
                    <Star className="w-4 h-4 fill-current" />
                    دڵخواز
                  </>
                ) : (
                  <>
                    <StarOff className="w-4 h-4" />
                    دڵخواز
                  </>
                )}
              </Button>
              <Button
                onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
                variant="solid"
                icon={List}
              >
                لیست
              </Button>
            </div>
          </div>

          <div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${viewedPercent}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-2 text-right">
              {viewedPercent}% تەواو کرا
            </p>
          </div>

          {page.episodeItems.length > 0 ? (
            <div className="space-y-3">
              {page.episodeItems.map((item) => (
                <EpisodeItemCard
                  key={item.id}
                  item={item}
                  isRead={progress[page.selectedEpisode.id]?.[item.id]}
                  onToggleRead={() => toggleItemViewed(page.selectedEpisode.id, item.id)}
                  onToggleExpand={setOpenedItemId}
                  onImageClick={(url) =>
                    dispatch({ type: "OPEN_IMAGE_VIEWER", payload: url })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-zinc-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3" />
              <p>هیچ بەشێک بۆ ئەم ئیپسۆدە نییە.</p>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  /* ---------- Layout ---------- */
  return (
    <div className="bg-zinc-950 text-white min-h-screen font-sans">
      {/* Subtle background grid */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 [background:radial-gradient(1200px_600px_at_80%_-10%,rgba(255,255,255,0.06),transparent),radial-gradient(800px_400px_at_10%_110%,rgba(255,255,255,0.05),transparent)]"
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-zinc-200" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  کتێبخانەی ئیپسۆد
                </h1>
                <p className="text-sm text-zinc-400">
                  بە سادگی گەڕان و ڕێکخستن، وە هەموو شتان بە پڕۆفێشەنەلێتی.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => nav(-1)} icon={Home}>
                سەرەکی
              </Button>
            </div>
          </div>

          {/* Stats */}
          {!page.isLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="کۆی ئیپسۆدەکان" value={stats.totalEpisodes} Icon={Layers} />
              <Stat label="کۆی بەشەکان" value={stats.totalItems} Icon={FileText} />
              <Stat label="تەواوکراوەکان" value={stats.completedEpisodes} Icon={Trophy} />
              <Stat label="دڵخوازەکان" value={stats.totalFavorites} Icon={Heart} />
            </div>
          )}

          {/* Controls */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="گەڕان..."
                  value={controls.searchTerm}
                  onChange={(e) =>
                    setControls({ payload: { searchTerm: e.target.value } })
                  }
                  className="w-full pl-3 pr-9 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-white/20 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() =>
                    setControls({
                      payload: {
                        viewMode:
                          controls.viewMode === "grid"
                            ? "list"
                            : controls.viewMode === "list"
                            ? "compact"
                            : "grid",
                      },
                    })
                  }
                >
                  {controls.viewMode === "grid"
                    ? "گەورە"
                    : controls.viewMode === "list"
                    ? "لیست"
                    : "كۆمپاكت"}
                </Button>

                <Button icon={Filter}>
                  فلتەر
                </Button>
              </div>
            </div>

            {/* Advanced filters row */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">ڕیزکردن:</span>
                <select
                  value={controls.sortKey}
                  onChange={(e) =>
                    setControls({ payload: { sortKey: e.target.value } })
                  }
                  className="flex-1 text-sm rounded-lg bg-white/5 border border-white/10 px-2 py-2"
                >
                  <option value="title">ناونیشان</option>
                  <option value="items">ژمارەی بەشەکان</option>
                  <option value="year">ساڵ</option>
                </select>
                <button
                  onClick={() =>
                    setControls({
                      payload: {
                        sortDir: controls.sortDir === "asc" ? "desc" : "asc",
                      },
                    })
                  }
                  className="p-2 rounded-lg border border-white/10 hover:bg-white/10"
                  title="سەرەڕێژکردن"
                >
                  <ArrowUpDown
                    className={`w-4 h-4 transition-transform ${
                      controls.sortDir === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={controls.onlyFavorites}
                  onChange={(e) =>
                    setControls({ payload: { onlyFavorites: e.target.checked } })
                  }
                  className="rounded border-white/20 bg-white/5"
                />
                تەنها دڵخوازەکان
              </label>

              <div className="flex items-center gap-2 justify-end">
                {/* NEW: Clear Progress Button */}
                <Button
                  onClick={clearProgress}
                  className="text-red-300 border-red-500/30 hover:bg-red-500/10"
                  title="سڕینەوەی پێشکەوتنەکان"
                  icon={RotateCcw} 
                >
                  سڕینەوەی پێشکەوتن
                </Button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-white/10 hover:bg-white/10"
                  title="نوێکردنەوە"
                >
                  <RotateCcw className="w-4 h-4" />
                  هەوڵدانەوە
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Content */}
        {page.err ? (
          <Card className="p-10 text-center border-red-500/20 bg-red-500/5">
            <AlertTriangle className="w-10 h-10 mx-auto text-red-400 mb-3" />
            <p className="font-medium text-red-300">{page.err}</p>
            <p className="text-sm text-red-300/80 mt-1">
              تکایە هێڵی ئینتەرنێت بپشکنە و دووبارە هەوڵبدەوە.
            </p>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            {page.view === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SPRING}
              >
                {renderList()}
              </motion.div>
            )}
            {page.view === "episode" && (
              <motion.div
                key="episode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SPRING}
              >
                {renderEpisode()}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
      <ImageViewer
        src={page.imageViewer}
        onClose={() => dispatch({ type: "CLOSE_IMAGE_VIEWER" })}
      />
    </div>
  );
}