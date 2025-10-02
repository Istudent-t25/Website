import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Camera, LogOut, Mail, Phone, Shield, IdCard, Calendar,
  Upload, Trash2, BadgeCheck, AlertTriangle, Copy, Download,
  Sun, Moon, MonitorCog, Paintbrush, Info, Settings2,
  Wand2, Palette, ToggleLeft, ToggleRight, Trash, Save, QrCode,
  CheckCircle, XCircle, Bell, Lock, Eye, EyeOff, Smartphone,
  Globe, Zap, Star, Heart, Sparkles
} from "lucide-react";

/* ===================== Constants ===================== */
const GRADES = ["7", "8", "9", "10", "11", "12"];
const TRACKS = ["زانستی", "ئەدەبی", "گشتی"];
const ACCEPT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
const MAX_IMG = 4 * 1024 * 1024; // 4MB

const LS = {
  grade: "grade",
  track: "track",
  theme: "theme",
  font: "fontScale",
  accent: "accent",
  reduced: "reducedMotion",
};

const DEFAULTS = {
  theme: "system",
  font: 1,
  accent: "#06b6d4", // cyan-500
  reduced: "off",
  grade: "12",
  track: "زانستی",
};

const ACCENTS = [
  { name: "Cyan", val: "#06b6d4", gradient: "from-cyan-400 to-cyan-600" },
  { name: "Emerald", val: "#10b981", gradient: "from-emerald-400 to-emerald-600" },
  { name: "Violet", val: "#8b5cf6", gradient: "from-violet-400 to-violet-600" },
  { name: "Rose", val: "#f43f5e", gradient: "from-rose-400 to-rose-600" },
  { name: "Amber", val: "#f59e0b", gradient: "from-amber-400 to-amber-600" },
  { name: "Sky", val: "#0ea5e9", gradient: "from-sky-400 to-sky-600" },
  { name: "Purple", val: "#a855f7", gradient: "from-purple-400 to-purple-600" },
  { name: "Pink", val: "#ec4899", gradient: "from-pink-400 to-pink-600" },
];

/* ===================== Utils ===================== */
const cls = (...a) => a.filter(Boolean).join(" ");

function fmtDate(ts) {
  try {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString('ku-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  catch { return "—"; }
}

function applyTheme(theme) {
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const dark = theme === "system" ? prefersDark : theme === "dark";
  document.documentElement.classList.toggle("dark", !!dark);
}

function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);
  return { toast, show: setToast, clear: () => setToast(null) };
}

/* ===================== Components ===================== */
function GlowCard({ children, className, glow = false, ...props }) {
  return (
    <div
      className={cls(
        "relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10",
        glow && "shadow-2xl shadow-[color:var(--accent)]/20",
        className
      )}
      {...props}
    >
      {glow && (
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[color:var(--accent)] to-purple-600 opacity-20 blur-sm" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function Switch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cls(
          "relative w-11 h-6 rounded-full transition-all duration-300",
          checked
            ? "bg-gradient-to-r from-[color:var(--accent)] to-purple-500"
            : "bg-gray-600"
        )}
      >
        <div className={cls(
          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300",
          checked ? "left-5" : "left-0.5"
        )} />
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "text-cyan-400" }) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
      <div className="flex items-center gap-3">
        <div className={cls("p-2 rounded-lg bg-white/10", color)}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
          <div className="text-sm font-medium text-white truncate">{value}</div>
        </div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;

  const variants = {
    success: { bg: "bg-emerald-500/90", icon: CheckCircle, text: "text-emerald-50" },
    error: { bg: "bg-red-500/90", icon: XCircle, text: "text-red-50" },
    warning: { bg: "bg-amber-500/90", icon: AlertTriangle, text: "text-amber-50" },
    info: { bg: "bg-blue-500/90", icon: Info, text: "text-blue-50" },
  };

  const variant = variants[toast.type] || variants.info;
  const Icon = variant.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={cls(
          "fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-sm border border-white/20",
          variant.bg, variant.text
        )}
      >
        <Icon size={18} />
        <span className="font-medium">{toast.text}</span>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ProfileSettings() {
  // Mock user data since we can't use Firebase in this environment
  const [user] = useState({
    displayName: "Ahmad Kurdistan",
    email: "ahmad@example.com",
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    phoneNumber: "+964 750 123 4567",
    uid: "mock-user-id-12345",
    emailVerified: true,
    metadata: {
      creationTime: "2023-01-15T10:30:00Z",
      lastSignInTime: "2024-01-20T14:22:00Z"
    },
    providerData: [
      { providerId: "google.com" },
      { providerId: "password" }
    ]
  });

  const { toast, show } = useToast();

  // Preferences state
  const [theme, setTheme] = useState("dark");
  const [fontScale, setFontScale] = useState(1);
  const [accent, setAccent] = useState(DEFAULTS.accent);
  const [reduced, setReduced] = useState("off");
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(true);

  // Profile state
  const [name, setName] = useState(user?.displayName || "خوێندکار");
  const [grade, setGrade] = useState("12");
  const [track, setTrack] = useState("زانستی");
  const [bio, setBio] = useState("Student passionate about learning and technology");

  // UI state
  const [activeTab, setActiveTab] = useState("profile");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Apply theme
  useEffect(() => {
    applyTheme(theme);
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
  }, [theme, accent, fontScale]);

  const tabs = [
    { id: "profile", label: "پڕۆفایل", icon: User },
    { id: "security", label: "ئاسایش", icon: Shield },
    { id: "preferences", label: "ڕێكخستنەکان", icon: Settings2 },
    { id: "privacy", label: "نهێنیایەتی", icon: Eye },
  ];

  const mockUpload = async () => {
    setUploading(true);
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setUploading(false);
    setTimeout(() => setProgress(0), 500);
    show({ type: "success", text: "وێنە بە سەرکەوتوویی نوێکرایەوە!" });
  };

  const handleSave = () => {
    show({ type: "success", text: "گۆڕانکارییەکان پاشەکەوت کران!" });
  };

  const copyToClipboard = async (text, message = "کۆپی کرا!") => {
    try {
      await navigator.clipboard.writeText(text);
      show({ type: "success", text: message });
    } catch {
      show({ type: "error", text: "کۆپی نەکرا" });
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white"
      style={{ fontSize: "calc(1rem * var(--font-scale, 1))" }}
    >
      <Toast toast={toast} />

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-gray-900/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[color:var(--accent)] to-purple-600">
                    <Settings2 size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      ڕێکخستنی پڕۆفایل
                    </h1>
                    <p className="text-sm text-gray-400">بەڕێوەبردنی هەژمار و ڕێکخستنەکان</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[color:var(--accent)] to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Save size={16} className="inline me-2" />
                  پاشەکەوت
                </button>

                <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-6 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cls(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap",
                      isActive
                        ? "bg-gradient-to-r from-[color:var(--accent)]/20 to-purple-500/20 text-white border border-[color:var(--accent)]/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Profile Header Card */}
              <GlowCard className="lg:col-span-2 p-6" glow>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Avatar Section */}
                  <div className="relative group">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-[color:var(--accent)] to-purple-600 p-0.5">
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                    <button
                      onClick={mockUpload}
                      className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-r from-[color:var(--accent)] to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Camera size={16} />
                    </button>

                    {uploading && (
                      <div className="absolute inset-0 rounded-2xl bg-black/70 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs text-white mb-2">{progress}%</div>
                          <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[color:var(--accent)] transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">ناو</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-[color:var(--accent)] focus:ring-1 focus:ring-[color:var(--accent)] transition-colors"
                        placeholder="ناوی تۆ لێرە بنووسە"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">باسی کورت</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-[color:var(--accent)] focus:ring-1 focus:ring-[color:var(--accent)] transition-colors resize-none"
                        placeholder="باسێکی کورت دەربارەی خۆت بنووسە..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">پۆل</label>
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[color:var(--accent)] focus:ring-1 focus:ring-[color:var(--accent)] transition-colors"
                        >
                          {GRADES.map(g => (
                            <option key={g} value={g} className="bg-gray-800">پۆلی {g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">لەق</label>
                        <select
                          value={track}
                          onChange={(e) => setTrack(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[color:var(--accent)] focus:ring-1 focus:ring-[color:var(--accent)] transition-colors"
                        >
                          {TRACKS.map(t => (
                            <option key={t} value={t} className="bg-gray-800">{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </GlowCard>

              {/* Quick Stats */}
              <div className="space-y-4">
                <StatCard
                  icon={Mail}
                  label="ئیمەیل"
                  value={user.email}
                  color="text-blue-400"
                />
                <StatCard
                  icon={Phone}
                  label="مۆبایل"
                  value={user.phoneNumber}
                  color="text-green-400"
                />
                <StatCard
                  icon={Calendar}
                  label="بەشداربوون"
                  value={fmtDate(user.metadata?.creationTime)}
                  color="text-purple-400"
                />
                <StatCard
                  icon={BadgeCheck}
                  label="دۆخ"
                  value={user.emailVerified ? "پشتڕاستکراو" : "پشتڕاست‌نەکراو"}
                  color={user.emailVerified ? "text-green-400" : "text-yellow-400"}
                />
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                <GlowCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-[color:var(--accent)]" size={20} />
                    <h3 className="text-xl font-bold">دەستگەیری و ئاسایش</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className={cls(
                          "p-2 rounded-lg",
                          user.emailVerified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                        )}>
                          {user.emailVerified ? <BadgeCheck size={16} /> : <AlertTriangle size={16} />}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.emailVerified ? "ئیمەیل پشتڕاستکراوە" : "ئیمەیل پشتڕاست‌نەکراوە"}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                      {!user.emailVerified && (
                        <button className="px-4 py-2 rounded-lg bg-[color:var(--accent)] text-white hover:opacity-90 transition-opacity">
                          ناردنی پشتڕاستکردنەوە
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                          <Lock size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-white">گۆڕینی وشەی نهێنی</div>
                          <div className="text-sm text-gray-400">دوا گۆڕین: ٣ مانگ پێش</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                        گۆڕین
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                          <Smartphone size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-white">دەستگەیری دوو‌هەنگاوی</div>
                          <div className="text-sm text-gray-400">ئاسایشی زیاتر بۆ هەژمارەکەت</div>
                        </div>
                      </div>
                      <Switch
                        checked={true}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                </GlowCard>

                <GlowCard className="p-6 border-red-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Trash className="text-red-400" size={20} />
                    <h3 className="text-xl font-bold text-red-400">ناوچەی مەترسی</h3>
                  </div>

                  <p className="text-gray-400 mb-4">
                    سڕینەوەی هەژمارەکەت واتە لەدەستدانی هەموو داتاکانت. ئەم کردارە ناگەڕێندرێتەوە.
                  </p>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                  >
                    سڕینەوەی هەژمار
                  </button>
                </GlowCard>
              </div>

              {/* Security Info Sidebar */}
              <div className="space-y-4">
                <GlowCard className="p-4">
                  <div className="text-center space-y-3">
                    <div className="p-3 rounded-xl bg-green-500/20 text-green-400 mx-auto w-fit">
                      <Shield size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-green-400">ئاسایش باش</div>
                      <div className="text-sm text-gray-400">هەژمارەکەت پارێزراوە</div>
                    </div>
                  </div>
                </GlowCard>

                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <IdCard size={14} />
                    <span className="font-mono text-xs">{user.uid}</span>
                    <button
                      onClick={() => copyToClipboard(user.uid, "UID کۆپی کرا")}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <div>دروستکردن: {fmtDate(user.metadata?.creationTime)}</div>
                  <div>دوا چوونەژوور: {fmtDate(user.metadata?.lastSignInTime)}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                {/* Theme Settings */}
                <GlowCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Paintbrush className="text-[color:var(--accent)]" size={20} />
                    <h3 className="text-xl font-bold">ڕووکار و جوانکاری</h3>
                  </div>

                  {/* Theme Selection */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">دابەزاندنی ڕووکار</label>
                      <div className="flex gap-3">
                        {[
                          { id: "light", label: "ڕووناک", icon: Sun },
                          { id: "dark", label: "تاریک", icon: Moon },
                          { id: "system", label: "سیستەم", icon: MonitorCog },
                        ].map(({ id, label, icon: Icon }) => (
                          <motion.button
                            key={id}
                            onClick={() => setTheme(id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cls(
                              "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300",
                              theme === id
                                ? "bg-gradient-to-br from-[color:var(--accent)]/20 to-purple-500/20 border-[color:var(--accent)]/50 text-white"
                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                            )}
                          >
                            <Icon size={20} />
                            <span className="text-sm font-medium">{label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">ڕەنگی تایبەت</label>
                      <div className="flex flex-wrap gap-2">
                        {ACCENTS.map(({ name, val, gradient }) => (
                          <motion.button
                            key={val}
                            onClick={() => setAccent(val)}
                            className={cls(
                              "w-8 h-8 rounded-full border-2 transition-all duration-300",
                              accent === val ? `border-white scale-110 shadow-lg` : "border-transparent"
                            )}
                            style={{ background: val }}
                            aria-label={`Select ${name} accent color`}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Font Scale Slider */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">قەبارەی نووسین ({Math.round(fontScale * 100)}%)</label>
                      <input
                        type="range"
                        min="0.8"
                        max="1.2"
                        step="0.05"
                        value={fontScale}
                        onChange={(e) => setFontScale(Number(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10"
                        style={{ background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((fontScale - 0.8) / 0.4) * 100}%, #ffffff1a ${((fontScale - 0.8) / 0.4) * 100}%, #ffffff1a 100%)` }}
                      />
                    </div>
                  </div>
                </GlowCard>

                {/* Privacy and Notifications */}
                <GlowCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="text-[color:var(--accent)]" size={20} />
                    <h3 className="text-xl font-bold">ئاگادارکردنەوەکان</h3>
                  </div>

                  <div className="space-y-4">
                    <Switch
                      label="ئاگادارکردنەوەی پاڵپێوەنان"
                      description="ئاگادارت دەکەینەوە بە گرنگترین نوێکارییەکان."
                      checked={notifications}
                      onChange={setNotifications}
                    />
                    <Switch
                      label="ئاگادارکردنەوەی ئیمەیل"
                      description="نوێکاری و پڕوپاگەندەی گرنگ دەنێرین بۆ ئیمەیلەکەت."
                      checked={privacy}
                      onChange={setPrivacy}
                    />
                  </div>
                </GlowCard>
              </div>

              {/* Preferences Sidebar */}
              <div className="space-y-6">
                <GlowCard className="p-4">
                  <div className="text-center space-y-3">
                    <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400 mx-auto w-fit">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-orange-400">ڕێکخستنی تایبەت</div>
                      <div className="text-sm text-gray-400">ڕووی ئەپەکە بگۆڕە بە دڵی خۆت</div>
                    </div>
                  </div>
                </GlowCard>

                <div className="text-center text-sm text-gray-500">
                  <p>تێبینی: ڕێکخستنەکان لەناو براوزەرەکەت پاشەکەوت دەکرێن.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <GlowCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="text-[color:var(--accent)]" size={20} />
                  <h3 className="text-xl font-bold">ڕێکخستنەکانی نهێنیایەتی</h3>
                </div>

                <div className="space-y-4">
                  <Switch
                    label="پڕۆفایلی گشتی"
                    description="ڕێگە بدە بە بەکارهێنەرانی دیکە پڕۆفایلەکەت ببینن."
                    checked={privacy}
                    onChange={setPrivacy}
                  />
                  <Switch
                    label="شاردنەوەی ئیمەیل"
                    description="ئیمەیلەکەت لە پڕۆفایلی گشتی بشارەوە."
                    checked={true}
                    onChange={() => {}}
                  />
                  <Switch
                    label="داتای بەکارهێنان"
                    description="ڕێگە بدە داتای بەکارهێنان کۆبکەینەوە بۆ باشترکردنی ئەپەکە."
                    checked={true}
                    onChange={() => {}}
                  />
                </div>
              </GlowCard>

              {/* Data Management Card */}
              <GlowCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Download className="text-blue-400" size={20} />
                  <h3 className="text-xl font-bold">بەڕێوەبردنی داتا</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-400">
                    داگرتنی داتای هەژمارەکەت لە شێوەی JSON. ئەم داتایە هەموو زانیارییە کەسییەکانت دەگرێتەوە.
                  </p>
                  <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                    داگرتنی داتا
                  </button>
                </div>
              </GlowCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 p-8 rounded-2xl max-w-lg w-full text-center border border-white/10"
            >
              <div className="p-4 rounded-xl bg-red-500/20 text-red-400 w-fit mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">ئایا دڵنیایت؟</h3>
              <p className="text-gray-400 mb-6">
                سڕینەوەی هەژمارەکەت ناتوانرێت بگەڕێندرێتەوە.
                هەموو داتاکانت بە یەکجاری دەسڕێنەوە.
              </p>
              <div className="flex items-center gap-4 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  هەڵوەشاندنەوە
                </button>
                <button
                  onClick={() => {
                    // Implement actual delete logic here
                    setShowDeleteModal(false);
                    show({ type: "error", text: "هەژمار سڕایەوە." });
                  }}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  سڕینەوە
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}