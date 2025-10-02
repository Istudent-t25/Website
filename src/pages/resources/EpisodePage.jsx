import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Layers,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  StarOff,
  Download,
  X,
  List,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  PlayCircle,
  Filter,
  Grid3x3,
  LayoutGrid,
  Calendar,
  FileText,
  Volume2,
  Video,
  Image as ImageIcon,
  ArrowUpDown,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Eye,
  Users,
  Globe,
  Settings,
  Heart,
  Trophy,
  BarChart2,
  BookmarkCheck,
  RotateCcw
} from "lucide-react";

/* =========================
   CONFIG / API
   ========================= */
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";
const PER_PAGE = 50;
const SPRING = { type: "spring", stiffness: 300, damping: 25, mass: 0.7 };
const STAGGER = { delayChildren: 0.1, staggerChildren: 0.05 };

/* =========================
   STATE
   ========================= */
const pageInitial = {
  view: "list",
  isLoading: true,
  isFetching: false,
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
    case "SET_FETCHING":
      return { ...state, isFetching: action.payload };
    case "SET_ERROR":
      return { ...state, err: action.payload, isLoading: false, isFetching: false };
    case "SET_PAPERS":
      return { ...state, papers: action.payload, isLoading: false, isFetching: false };
    case "SELECT_EPISODE":
      return { ...state, view: "episode", selectedEpisode: action.payload.episode, episodeItems: action.payload.items };
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
  textPx: 16, 
  searchTerm: "", 
  sortKey: "title", 
  sortDir: "asc", 
  onlyFavorites: false 
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
  const url = it?.url || it?.pdf_url || it?.file_url || it?.image_url || it?.thumb_url || "";
  const lower = url.toLowerCase();
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

/* =========================
   COMPONENTS
   ========================= */

const ImageViewer = ({ src, onClose }) => {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-full max-h-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              src={src}
              alt="Viewed image"
              className="max-w-full max-h-[85vh] md:max-h-[90vh] rounded-xl shadow-2xl border-2 border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
            <motion.button
              className="absolute top-4 left-4 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* =========================
   MAIN COMPONENT
   ========================= */
export default function ModernEpisodePage() {
  const nav = useNavigate();
  const q = useQuery();
  const { id: routeSubjectId } = useParams();
  const subjectId = q.get("subject") || q.get("subject_id") || routeSubjectId || "";

  // From route
  const qGrade = q.get("grade") || "";
  const qStream = q.get("stream") || "";
  const qRead = q.get("read") === "1";
  const qEpisodeId = q.get("episode");

  const [page, dispatch] = useReducer(pageReducer, pageInitial);
  const [controls, setControls] = useReducer(controlsReducer, controlsInitial);
  const [favorites, setFavorites] = useState({});
  const [progress, setProgress] = useState({});
  const [openedItemId, setOpenedItemId] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

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
            type: "episode" || undefined,
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
        dispatch({ type: "SET_ERROR", payload: e?.message || "هەڵەیەك ڕوویدا" });
      }
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [qGrade, qStream, subjectId, qEpisodeId]);

  /* ---------- Derivations ---------- */
  const filteredSorted = useMemo(() => {
    const { searchTerm, sortKey, sortDir, onlyFavorites } = controls;
    const term = (searchTerm || "").trim().toLowerCase();
    let list = page.papers || [];
    if (term) list = list.filter((e) => e.title?.toLowerCase().includes(term) || String(e.year || "").includes(term));
    if (onlyFavorites) list = list.filter((e) => favorites[e.id]);
    list = list.slice().sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "title") return mul * String(a.title || "").localeCompare(String(b.title || ""), "ku");
      if (sortKey === "items") return mul * ((a.items?.length || 0) - (b.items?.length || 0));
      if (sortKey === "year") return mul * ((a.year || 0) - (b.year || 0));
      return 0;
    });
    return list;
  }, [page.papers, controls, favorites]);

  const viewedPercent = useMemo(() => {
    if (!page.selectedEpisode) return 0;
    const epId = page.selectedEpisode.id;
    const map = progress[epId] || {};
    const total = page.episodeItems.length || 1;
    const done = Object.values(map).filter(Boolean).length;
    return Math.round((done / total) * 100);
  }, [progress, page.selectedEpisode, page.episodeItems]);

  const stats = useMemo(() => {
    const totalEpisodes = page.papers.length;
    const totalFavorites = Object.values(favorites).filter(Boolean).length;
    const totalItems = page.papers.reduce((sum, ep) => sum + (ep.items?.length || 0), 0);
    const completedEpisodes = page.papers.filter(ep => {
      const epProgress = progress[ep.id] || {};
      const totalItems = ep.items?.length || 0;
      const completedItems = Object.values(epProgress).filter(Boolean).length;
      return totalItems > 0 && completedItems === totalItems;
    }).length;
    
    return { totalEpisodes, totalFavorites, totalItems, completedEpisodes };
  }, [page.papers, favorites, progress]);

  /* ---------- Actions ---------- */
  const selectEpisode = (episode) => {
    const items = (episode.items || []).map((it, idx) => ({
      id: it?.id ?? idx,
      url: it?.url || it?.pdf_url || it?.file_url || it?.image_url || it?.thumb_url || "",
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
      const next = { ...prev, [episodeId]: { ...ep, [itemId]: !ep[itemId] } };
      return next;
    });
  };

  /* ---------- Sub-components ---------- */
  const GlassCard = ({ children, className = "", gradient = false, glow = false }) => (
    <motion.div
      className={`
        relative rounded-3xl backdrop-blur-xl border border-white/[0.08]
        ${gradient ? 'bg-gradient-to-br from-white/[0.15] to-white/[0.05]' : 'bg-white/[0.08]'}
        ${glow ? 'shadow-2xl shadow-cyan-500/10' : 'shadow-xl shadow-black/20'}
        ${className}
      `}
    >
      {glow && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
      )}
      {children}
    </motion.div>
  );

  const ModernBadge = ({ children, variant = "default", icon: Icon, pulse = false }) => {
    const variants = {
      default: "bg-white/10 text-white border-white/20",
      primary: "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border-cyan-400/30",
      success: "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border-emerald-400/30",
      warning: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-200 border-amber-400/30",
      purple: "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-200 border-purple-400/30",
    };
    
    return (
      <span className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold 
        border backdrop-blur-sm transition-all duration-200
        ${variants[variant]}
        ${pulse ? 'animate-pulse' : ''}
      `}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {children}
      </span>
    );
  };

  const StatsCard = ({ title, value, icon: Icon, trend, color = "cyan" }) => {
    const colors = {
      cyan: "from-cyan-500/20 to-blue-500/20 border-cyan-400/30",
      purple: "from-purple-500/20 to-indigo-500/20 border-purple-400/30",
      emerald: "from-emerald-500/20 to-green-500/20 border-emerald-400/30",
      amber: "from-amber-500/20 to-yellow-500/20 border-amber-400/30",
    };

    return (
      <GlassCard className={`p-4 bg-gradient-to-br ${colors[color]} border group hover:scale-[1.02] transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-300 mt-1">{title}</p>
          </div>
          <div className="relative">
            <Icon className={`w-8 h-8 text-${color}-300 group-hover:scale-110 transition-transform duration-300`} />
            {trend && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
        </div>
      </GlassCard>
    );
  };

  const LoadingSkeleton = () => (
    <div className={viewMode === "grid" ? 
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6" : 
      "space-y-4"
    }>
      {Array.from({ length: viewMode === "compact" ? 8 : 12 }).map((_, i) => (
        <GlassCard key={i} className={`overflow-hidden ${viewMode === "compact" ? "h-20" : ""}`}>
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30" />
          <div className={viewMode === "grid" ? "p-6 space-y-4" : "p-4 flex items-center gap-4"}>
            <div className={`${viewMode === "grid" ? "w-12 h-12" : "w-10 h-10"} bg-white/10 rounded-xl animate-pulse`} />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-3 w-1/2 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );

  const ModernEpisodeCard = ({ episode, onOpen, isFav, onToggleFav }) => {
    const epId = episode.id;
    const epProgress = progress[epId] || {};
    const totalItems = episode.items?.length || 0;
    const completedItems = Object.values(epProgress).filter(Boolean).length;
    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const isCompleted = progressPercent === 100;

    if (viewMode === "compact") {
      return (
        <motion.div
          layout
          whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.12)" }}
          transition={SPRING}
          className="group"
        >
          <GlassCard className="overflow-hidden hover:border-white/20 transition-all duration-300">
            {progressPercent > 0 && (
              <div className="h-1 bg-gradient-to-r from-zinc-800 to-zinc-700">
                <motion.div
                  className={`h-full ${isCompleted ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gradient-to-r from-cyan-400 to-purple-400'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            )}
            <div className="p-4 flex items-center gap-4">
              <button onClick={() => onOpen(episode)} className="flex-1 flex items-center gap-4 text-right">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                    isCompleted ? 'from-emerald-500/30 to-cyan-500/30' : 'from-cyan-500/30 to-purple-500/30'
                  } flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {isCompleted ? <Award className="w-6 h-6 text-emerald-300" /> : <BookOpen className="w-6 h-6 text-cyan-300" />}
                  </div>
                  {progressPercent > 0 && progressPercent < 100 && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-500/30 backdrop-blur-sm flex items-center justify-center border border-purple-400/40">
                      <span className="text-[10px] text-purple-200 font-bold">{progressPercent}%</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-cyan-300 transition-colors">
                    {episode.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-400">{totalItems} بەش</span>
                    {episode.year && <span className="text-xs text-zinc-400">• {episode.year}</span>}
                    {isCompleted && <span className="text-xs text-emerald-400">• تەواو</span>}
                  </div>
                </div>
              </button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFav(episode.id);
                }}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  isFav ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isFav ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>
      );
    }

    return (
      <motion.div
        layout
        whileHover={{ y: -8, scale: 1.02 }}
        transition={SPRING}
        className="group"
      >
        <GlassCard className="overflow-hidden hover:border-white/20 transition-all duration-500" glow>
          {/* Enhanced Progress Bar */}
          {progressPercent > 0 && (
            <div className="h-1.5 bg-gradient-to-r from-zinc-800 to-zinc-700">
              <motion.div
                className={`h-full ${isCompleted ? 
                  'bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400' : 
                  'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          )}
          
          <div className="relative p-6 space-y-4">
            {/* Floating Action Button */}
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onOpen(episode)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg"
              >
                <PlayCircle className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="relative">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                  isCompleted ? 'from-emerald-500/30 to-cyan-500/30' : 'from-cyan-500/30 to-purple-500/30'
                } flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  {isCompleted ? 
                    <Award className="w-8 h-8 text-emerald-300" /> : 
                    <BookOpen className="w-8 h-8 text-cyan-300" />
                  }
                </div>
                
                {/* Progress Indicator */}
                {progressPercent > 0 && progressPercent < 100 && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm flex items-center justify-center border-2 border-purple-400/40 shadow-lg">
                    <span className="text-xs text-purple-200 font-bold">{progressPercent}%</span>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500/40 to-cyan-500/40 backdrop-blur-sm flex items-center justify-center border-2 border-emerald-400/50 shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  </div>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFav(episode.id);
                }}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isFav
                    ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 shadow-lg shadow-amber-500/20"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isFav ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
              </motion.button>
            </div>

            {/* Content */}
            <button onClick={() => onOpen(episode)} className="w-full text-right space-y-3">
              <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-cyan-300 transition-colors duration-300">
                {episode.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-2">
                <ModernBadge variant="purple" icon={Layers}>
                  {totalItems} بەش
                </ModernBadge>
                
                {episode.year && (
                  <ModernBadge variant="primary" icon={Calendar}>
                    {episode.year}
                  </ModernBadge>
                )}
                
                {completedItems > 0 && (
                  <ModernBadge variant="success" icon={CheckCircle2}>
                    {completedItems} تەواو
                  </ModernBadge>
                )}
                
                {isCompleted && (
                  <ModernBadge variant="success" icon={Award} pulse>
                    تەواو کرا
                  </ModernBadge>
                )}
              </div>
            </button>

            {/* Enhanced Hover Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  const ModernHeader = ({ title, subtitle, showControls = true, showBack = false }) => (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <GlassCard className="p-8 sticky top-4 z-20 shadow-2xl" gradient glow>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,#00d4ff_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,#a855f7_0%,transparent_50%)]" />
        </div>

        <div className="relative space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6 min-w-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/40 to-purple-500/40 flex items-center justify-center shadow-xl">
                  <BookOpen className="w-8 h-8 text-cyan-200" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-900 shadow-lg">
                  <div className="w-full h-full rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-zinc-300 mt-2 text-lg">{subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {showBack && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
                  className="p-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20 text-white hover:from-white/20 hover:to-white/10 transition-all duration-300 shadow-lg"
                >
                  <List className="w-5 h-5" />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => nav(-1)}
                className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-white hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-300 shadow-lg"
              >
                <Home className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          {showControls && !page.isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatsCard
                title="کۆی ئیپسۆدەکان"
                value={stats.totalEpisodes}
                icon={Layers}
                color="cyan"
              />
              
              <StatsCard
                title="کۆی بەشەکان"
                value={stats.totalItems}
                icon={FileText}
                color="purple"
              />
              
              <StatsCard
                title="تەواوکراوەکان"
                value={stats.completedEpisodes}
                icon={Trophy}
                color="emerald"
              />
              
              <StatsCard
                title="دڵخوازەکان"
                value={stats.totalFavorites}
                icon={Heart}
                color="amber"
              />
            </motion.div>
          )}

          {/* Controls Section */}
          {showControls && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 relative min-w-[200px]">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="گەڕان..."
                  value={controls.searchTerm}
                  onChange={(e) => setControls({ payload: { searchTerm: e.target.value } })}
                  className="w-full px-6 py-3 pr-12 rounded-full text-white bg-white/5 border border-white/20 focus:border-white/40 focus:outline-none transition-colors duration-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(p => !p)}
                  className="p-3 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  <Filter className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="p-3 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  {viewMode === "grid" ? <Grid3x3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <GlassCard className="p-4 mt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-zinc-300 font-semibold">ڕێکخستن بەپێی:</label>
                    <select
                      value={controls.sortKey}
                      onChange={(e) => setControls({ payload: { sortKey: e.target.value } })}
                      className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20"
                    >
                      <option value="title">ناونیشان</option>
                      <option value="items">ژمارەی بەشەکان</option>
                      <option value="year">ساڵ</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-zinc-300 font-semibold">سەرەڕێژکردن:</label>
                    <button
                      onClick={() => setControls({ payload: { sortDir: controls.sortDir === "asc" ? "desc" : "asc" } })}
                      className="p-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-200"
                    >
                      <ArrowUpDown className={`w-5 h-5 transform transition-transform ${controls.sortDir === "desc" ? "rotate-180" : ""}`} />
                    </button>
                    <label className="flex items-center gap-2 text-zinc-300">
                      <input
                        type="checkbox"
                        checked={controls.onlyFavorites}
                        onChange={(e) => setControls({ payload: { onlyFavorites: e.target.checked } })}
                        className="form-checkbox text-amber-500 bg-white/10 border-white/20 rounded-md focus:ring-amber-500"
                      />
                      تەنها دڵخوازەکان
                    </label>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </GlassCard>
    </motion.div>
  );

  const EpisodeItemCard = ({ item, isRead, onToggleRead, isExpanded, onToggleExpand, onImageClick }) => {
    const Icon = getMimeIcon(item.mime);
    const itemIsExpanded = openedItemId === item.id;
    const isImage = item.mime.startsWith("image");

    return (
      <GlassCard className="p-4 transition-all duration-300 hover:border-white/20 overflow-hidden" gradient>
        <div className="flex items-center gap-4">
          <div className="flex items-center flex-1 min-w-0 gap-4">
            <button
              onClick={() => onToggleExpand(item.id)}
              className="p-2 rounded-full text-white/50 hover:text-white transition-colors duration-200"
            >
              <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${itemIsExpanded ? "rotate-90" : ""}`} />
            </button>

            <button
              onClick={isImage ? () => onImageClick(item.url) : null}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 ${isRead ? 'bg-emerald-500/30' : 'bg-cyan-500/30'} ${isImage ? 'cursor-pointer hover:scale-110' : ''}`}
            >
              {isImage ? (
                <img
                  src={item.url}
                  alt={item.label}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Icon className={`w-6 h-6 ${isRead ? 'text-emerald-300' : 'text-cyan-300'}`} />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white line-clamp-1">{item.label}</h4>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{item.description || item.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleRead(item.id)}
              className={`p-3 rounded-full transition-all duration-200 ${
                isRead ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BookmarkCheck className="w-5 h-5" />
            </motion.button>
            {!isImage && (
              <motion.a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/30 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
              </motion.a>
            )}
          </div>
        </div>
        <AnimatePresence>
          {itemIsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 border-t border-white/10 pt-4 overflow-hidden"
            >
              <div className="text-zinc-300 text-sm">
                <p><strong>جۆری فایل:</strong> {item.mime}</p>
                <p className="mt-2">{item.description || "هیچ زانیارییەکی زیاتر نییە."}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    );
  };

  const renderContent = () => {
    if (page.err) {
      return (
        <GlassCard className="p-8 text-center text-red-400 border-red-500/30">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="font-semibold text-lg">{page.err}</p>
          <p className="text-sm mt-2 text-red-300">تکایە دڵنیابەرەوە لە هێڵی ئینتەرنێتەکەت و دووبارە هەوڵبدەوە.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 rounded-full bg-red-500/20 text-white border border-red-400/30 hover:bg-red-500/30 transition-all duration-200"
          >
            <RotateCcw className="inline-block w-4 h-4 mr-2" />
            هەوڵدانەوە
          </motion.button>
        </GlassCard>
      );
    }
    
    if (page.isLoading) return <LoadingSkeleton />;
    
    if (page.view === "list") {
      if (filteredSorted.length === 0) {
        return (
          <GlassCard className="p-8 text-center text-white">
            <Layers className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
            <h3 className="font-semibold text-lg">هیچ ئیپسۆدێک نەدۆزرایەوە</h3>
            <p className="text-sm mt-2 text-zinc-300">هەوڵبدە گەڕانەکەت بگۆڕیت یان فلتەرەکان لابدەیت.</p>
          </GlassCard>
        );
      }
      return (
        <motion.div
          key="list"
          variants={STAGGER}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={viewMode === "grid" ? 
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6" : 
            "space-y-4"
          }
        >
          <AnimatePresence>
            {filteredSorted.map((ep) => (
              <ModernEpisodeCard
                key={ep.id}
                episode={ep}
                onOpen={selectEpisode}
                isFav={favorites[ep.id]}
                onToggleFav={toggleFavorite}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      );
    }
    
    if (page.view === "episode" && page.selectedEpisode) {
      return (
        <motion.div key="episode-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <GlassCard className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-white line-clamp-1">{page.selectedEpisode.title}</h2>
                <div className="flex items-center gap-3 mt-2 text-zinc-300 text-sm">
                  <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {page.episodeItems.length} بەش</span>
                  {page.selectedEpisode.year && (
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {page.selectedEpisode.year}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleFavorite(page.selectedEpisode.id)}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    favorites[page.selectedEpisode.id] ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </motion.button>
              </div>
            </div>
            
            {page.episodeItems.length > 0 ? (
              <div className="space-y-4">
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${viewedPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-sm text-zinc-400 text-right">
                  {viewedPercent}% تەواو کرا ({Object.values(progress[page.selectedEpisode.id] || {}).filter(Boolean).length} لە {page.episodeItems.length} بەش)
                </p>
                <div className="space-y-3">
                  {page.episodeItems.map((item) => (
                    <EpisodeItemCard
                      key={item.id}
                      item={item}
                      isRead={progress[page.selectedEpisode.id]?.[item.id]}
                      onToggleRead={() => toggleItemViewed(page.selectedEpisode.id, item.id)}
                      onToggleExpand={setOpenedItemId}
                      onImageClick={(url) => dispatch({ type: "OPEN_IMAGE_VIEWER", payload: url })}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-zinc-400">
                <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-amber-400" />
                <p>هیچ بەشێک بۆ ئەم ئیپسۆدە نییە.</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      );
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen font-sans p-4 md:p-8 relative">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>
      
      <div className="max-w-7xl mx-auto space-y-8">
        <ModernHeader 
          title="کتێبخانەی ئیپسۆد" 
          subtitle="گەڕان بەدوای ئیپسۆدە خوێندنەکانت" 
          showControls={page.view === "list"}
          showBack={page.view === "episode"}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={page.view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      <ImageViewer 
        src={page.imageViewer} 
        onClose={() => dispatch({ type: "CLOSE_IMAGE_VIEWER" })} 
      />
    </div>
  );
}