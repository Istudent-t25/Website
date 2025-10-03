import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, Settings2, Eye, LogOut, Save, Paintbrush,
  Mail, Phone, Calendar, BadgeCheck, Camera, Copy, Trash,
  CheckCircle, XCircle, AlertTriangle, Info, Bell, Lock, Smartphone, IdCard, Sparkles,
  Sun, Moon, MonitorCog
} from "lucide-react";

/* ===================== Constants, Utils, and Helper Components (Keep as is) ===================== */
// Omitted for brevity. Assume GRADES, TRACKS, ACCENTS, LS, DEFAULTS, cls, fmtDate,
// applyTheme, useToast, GlowCard, Switch, StatCard, and Toast are included here.

const GRADES = ["7", "8", "9", "10", "11", "12"];
const TRACKS = ["زانستی", "ئەدەبی", "گشتی"];
const DEFAULTS = { accent: "#06b6d4" };
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

function GlowCard({ children, className, glow = false, ...props }) {
  return (
    <div
      className={cls(
        "relative rounded-xl bg-white/5 backdrop-blur-sm border border-white/10", // Smaller rounded-xl
        glow && "shadow-2xl shadow-[color:var(--accent)]/20",
        className
      )}
      {...props}
    >
      {glow && (
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[color:var(--accent)] to-purple-600 opacity-20 blur-sm" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function Switch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex-1 me-4">
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cls(
          "relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0",
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

// =================================================================================================
// 2. MODULARIZED TAB COMPONENTS (Defined after the main component)
// =================================================================================================

export default function ProfileSettings() {
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
    providerData: [{ providerId: "google.com" }, { providerId: "password" }]
  });

  const { toast, show } = useToast();

  // Preferences state
  const [theme, setTheme] = useState("dark");
  const [fontScale, setFontScale] = useState(1);
  const [accent, setAccent] = useState(DEFAULTS.accent);
  const [reduced, setReduced] = useState("off"); // State added to manage the setting
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

  // Apply theme & accents
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
    // In a real app, this would trigger an API call based on which tab's data changed.
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

  // --- Render ---
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white"
      style={{ fontSize: "calc(1rem * var(--font-scale, 1))" }}
    >
      <Toast toast={toast} />

      {/* Header (Simplified) */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-gray-900/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            {/* Title & Description */}
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

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <motion.button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[color:var(--accent)] to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save size={16} className="inline me-2" />
                پاشەکەوت
              </motion.button>

              <motion.button
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <LogOut size={16} />
              </motion.button>
            </div>
          </div>

          {/* Tabs - Centered and modern */}
          <div className="flex items-center justify-start gap-1 py-1 overflow-x-auto border-t border-white/10 mt-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cls(
                    "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap relative",
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={16} className={cls(isActive ? "text-[color:var(--accent)]" : "")} />
                  {tab.label}
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-[color:var(--accent)] to-purple-500 rounded-t-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <ProfileTab
              key="profile"
              user={user}
              name={name} setName={setName}
              grade={grade} setGrade={setGrade}
              track={track} setTrack={setTrack}
              bio={bio} setBio={setBio}
              uploading={uploading} progress={progress} mockUpload={mockUpload}
            />
          )}

          {activeTab === "security" && (
            <SecurityTab
              key="security"
              user={user}
              copyToClipboard={copyToClipboard}
              showDeleteModal={showDeleteModal}
              setShowDeleteModal={setShowDeleteModal}
            />
          )}

          {activeTab === "preferences" && (
            <PreferencesTab
              key="preferences"
              theme={theme} setTheme={setTheme}
              accent={accent} setAccent={setAccent}
              fontScale={fontScale} setFontScale={setFontScale}
              notifications={notifications} setNotifications={setNotifications}
              reduced={reduced} setReduced={setReduced} // Pass the new reduced state
            />
          )}

          {activeTab === "privacy" && (
            <PrivacyTab
              key="privacy"
              privacy={privacy} setPrivacy={setPrivacy}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Delete Account Modal (Simplified) */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="w-full max-w-md p-6 rounded-2xl bg-gray-800 border border-red-500/30 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <Trash2 size={32} className="text-red-500 mx-auto" />
                <h3 className="text-xl font-bold text-white">سڕینەوەی هەژمار</h3>
                <p className="text-gray-400">ئایا دڵنیایت؟ سڕینەوەی هەژمارەکەت ناتوانرێت بگەڕێندرێتەوە و هەموو داتاکانت دەسڕێنەوە.</p>
                <div className="flex justify-center gap-4 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-5 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                  >
                    هەڵوەشاندنەوە
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      show({ type: "error", text: "هەژمارەکەت سڕایەوە! (لەمەشدا بە شێوەی ساختە)" });
                    }}
                    className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                  >
                    دڵنیابوونەوە و سڕینەوە
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =================================================================================================
// 3. TAB COMPONENTS
// =================================================================================================

// --- Profile Tab ---
function ProfileTab({ user, name, setName, grade, setGrade, track, setTrack, bio, setBio, uploading, progress, mockUpload }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Profile Header Card */}
      <GlowCard className="lg:col-span-2 p-6" glow>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar Section */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-[color:var(--accent)] to-purple-600 p-0.5">
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <motion.button
              onClick={mockUpload}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-r from-[color:var(--accent)] to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Camera size={16} />
            </motion.button>

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

          {/* Profile Info Form */}
          <div className="flex-1 space-y-4 w-full">
            <InputField label="ناو" value={name} onChange={setName} placeholder="ناوی تۆ لێرە بنووسە" />
            
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="پۆل" value={grade} onChange={setGrade} options={GRADES.map(g => ({ value: g, label: `پۆلی ${g}` }))} />
              <SelectField label="لەق" value={track} onChange={setTrack} options={TRACKS.map(t => ({ value: t, label: t }))} />
            </div>
          </div>
        </div>
      </GlowCard>

      {/* Quick Stats Sidebar */}
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
  );
}

// --- Security Tab ---
function SecurityTab({ user, copyToClipboard, setShowDeleteModal }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2 space-y-6">
        <GlowCard className="p-6">
          <SectionHeader title="دەستگەیری و ئاسایش" icon={Shield} />

          <div className="space-y-4">
            <SecurityItem
              Icon={user.emailVerified ? BadgeCheck : AlertTriangle}
              title={user.emailVerified ? "ئیمەیل پشتڕاستکراوە" : "ئیمەیل پشتڕاست‌نەکراوە"}
              subtitle={user.email}
              color={user.emailVerified ? "green" : "yellow"}
              actionButton={!user.emailVerified ? "ناردنی پشتڕاستکردنەوە" : null}
              onAction={() => alert("Verify email link sent (mock)")}
            />

            <SecurityItem
              Icon={Lock}
              title="گۆڕینی وشەی نهێنی"
              subtitle="دوا گۆڕین: ٣ مانگ پێش"
              color="purple"
              actionButton="گۆڕین"
              onAction={() => alert("Password change form (mock)")}
            />

            <SecurityItem
              Icon={Smartphone}
              title="دەستگەیری دوو‌هەنگاوی"
              subtitle="ئاسایشی زیاتر بۆ هەژمارەکەت"
              color="blue"
              isSwitch
              switchChecked={true}
              onSwitchChange={() => { alert("2FA toggled (mock)") }}
            />
          </div>
        </GlowCard>

        {/* Danger Zone */}
        <GlowCard className="p-6 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Trash className="text-red-400" size={20} />
            <h3 className="text-xl font-bold text-red-400">ناوچەی مەترسی</h3>
          </div>
          <p className="text-gray-400 mb-4 text-sm">
            سڕینەوەی هەژمارەکەت واتە لەدەستدانی هەموو داتاکانت. ئەم کردارە ناگەڕێندرێتەوە.
          </p>
          <motion.button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            سڕینەوەی هەژمار
          </motion.button>
        </GlowCard>
      </div>

      {/* Security Info Sidebar */}
      <div className="space-y-6">
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

        <GlowCard className="p-4 space-y-3 text-sm text-gray-400">
          <h4 className="font-medium text-white border-b border-white/10 pb-2">زانیاری هەژمار</h4>
          <div className="flex items-center gap-2">
            <IdCard size={14} className="flex-shrink-0" />
            <span className="font-mono text-xs truncate">{user.uid}</span>
            <motion.button
              onClick={() => copyToClipboard(user.uid, "UID کۆپی کرا")}
              className="p-1 rounded hover:bg-white/10 flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Copy size={12} />
            </motion.button>
          </div>
          <p>دروستکردن: <span className="text-white">{fmtDate(user.metadata?.creationTime)}</span></p>
          <p>دوا چوونەژوور: <span className="text-white">{fmtDate(user.metadata?.lastSignInTime)}</span></p>
        </GlowCard>
      </div>
    </motion.div>
  );
}

// --- Preferences Tab ---
function PreferencesTab({ theme, setTheme, accent, setAccent, fontScale, setFontScale, notifications, setNotifications, reduced, setReduced }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2 space-y-6">
        {/* Theme & Appearance */}
        <GlowCard className="p-6">
          <SectionHeader title="ڕووکار و جوانکاری" icon={Paintbrush} />

          <div className="space-y-6">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">دابەزاندنی ڕووکار</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "ڕووناک", icon: Sun },
                  { id: "dark", label: "تاریک", icon: Moon },
                  { id: "system", label: "سیستەم", icon: MonitorCog },
                ].map(({ id, label, icon: Icon }) => (
                  <ThemeButton key={id} id={id} label={label} Icon={Icon} currentTheme={theme} setTheme={setTheme} />
                ))}
              </div>
            </div>

            {/* Accent Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">ڕەنگی تایبەت</label>
              <div className="flex flex-wrap gap-3">
                {ACCENTS.map(({ name, val }) => (
                  <AccentButton key={val} name={name} val={val} currentAccent={accent} setAccent={setAccent} />
                ))}
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Accessibility & Notifications */}
        <GlowCard className="p-6">
          <SectionHeader title="دەستڕاگەیشتن و ئاگادارکردنەوە" icon={Bell} />
          <div className="space-y-4">
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
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10 [&::-webkit-slider-thumb]:bg-[color:var(--accent)]"
                style={{ 
                    '--accent': accent,
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((fontScale - 0.8) / 0.4) * 100}%, #ffffff1a ${((fontScale - 0.8) / 0.4) * 100}%, #ffffff1a 100%)` 
                }}
              />
            </div>
            
            <Switch
              label="کەمکردنەوەی جووڵە"
              description="بۆ ئەو کەسانەی هەستیارن بە جووڵەی زۆر، ئەنیمەیشینەکان کەم دەکاتەوە."
              checked={reduced === "on"}
              onChange={(val) => setReduced(val ? "on" : "off")}
            />

            <Switch
              label="ئاگادارکردنەوەی پاڵپێوەنان"
              description="ئاگادارت دەکەینەوە بە گرنگترین نوێکارییەکان."
              checked={notifications}
              onChange={setNotifications}
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

        <GlowCard className="p-4 text-center text-sm text-gray-400">
            <Info size={16} className="inline-block me-2 text-white" />
            تێبینی: ڕێکخستنەکان (ڕووکار، قەبارەی نووسین) لەناو براوزەرەکەت پاشەکەوت دەکرێن.
        </GlowCard>
      </div>
    </motion.div>
  );
}

// --- Privacy Tab ---
function PrivacyTab({ privacy, setPrivacy }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <GlowCard className="p-6">
        <SectionHeader title="ڕێکخستنەکانی نهێنیایەتی" icon={Eye} />

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
            onChange={() => { alert("Email visibility toggled (mock)") }}
          />
          <Switch
            label="داتای بەکارهێنان"
            description="ڕێگە بدە داتای بەکارهێنان کۆبکەینەوە بۆ باشترکردنی ئەپەکە."
            checked={true}
            onChange={() => { alert("Usage data toggled (mock)") }}
          />
        </div>
      </GlowCard>

      {/* Data Management Card */}
      <GlowCard className="p-6">
        <SectionHeader title="بەڕێوەبردنی داتا" icon={Download} color="text-blue-400" />
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            داگرتنی داتای هەژمارەکەت لە شێوەی JSON. ئەم داتایە هەموو زانیارییە کەسییەکانت دەگرێتەوە.
          </p>
          <motion.button
            onClick={() => alert("Data download initiated (mock)")}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            داگرتنی داتا
          </motion.button>
        </div>
      </GlowCard>
    </motion.div>
  );
}

// =================================================================================================
// 4. NEW SMALLER HELPER COMPONENTS
// =================================================================================================

// General input field
const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-[color:var(--accent)] focus:ring-1 focus:ring-[color:var(--accent)] transition-colors"
      placeholder={placeholder}
    />
  </div>
);

// General select field
const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[color:var(--accent)] focus:ring-1 focus:ring-[color:var(--accent)] transition-colors"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-gray-800">{opt.label}</option>
      ))}
    </select>
  </div>
);

// Consistent section header
const SectionHeader = ({ title, icon: Icon, color = "text-[color:var(--accent)]" }) => (
  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
    <Icon className={cls(color)} size={20} />
    <h3 className="text-xl font-bold">{title}</h3>
  </div>
);

// A reusable item for the security tab
const SecurityItem = ({ Icon, title, subtitle, color, actionButton, onAction, isSwitch, switchChecked, onSwitchChange }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
    <div className="flex items-center gap-3">
      <div className={cls(
        "p-2 rounded-lg",
        `bg-${color}-500/20 text-${color}-400`
      )}>
        <Icon size={16} />
      </div>
      <div>
        <div className="font-medium text-white">{title}</div>
        <div className="text-sm text-gray-400">{subtitle}</div>
      </div>
    </div>
    {actionButton && (
      <motion.button
        onClick={onAction}
        className="px-4 py-2 rounded-lg bg-[color:var(--accent)] text-white hover:opacity-90 transition-opacity text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {actionButton}
      </motion.button>
    )}
    {isSwitch && <Switch checked={switchChecked} onChange={onSwitchChange} />}
  </div>
);

// Theme selection button
const ThemeButton = ({ id, label, Icon, currentTheme, setTheme }) => {
  const isActive = currentTheme === id;
  return (
    <motion.button
      onClick={() => setTheme(id)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cls(
        "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300",
        isActive
          ? "bg-gradient-to-br from-[color:var(--accent)]/20 to-purple-500/20 border-[color:var(--accent)]/50 text-white"
          : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
      )}
    >
      <Icon size={20} />
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

// Accent color button
const AccentButton = ({ name, val, currentAccent, setAccent }) => {
  const isActive = currentAccent === val;
  return (
    <motion.button
      onClick={() => setAccent(val)}
      className={cls(
        "w-8 h-8 rounded-full border-2 transition-all duration-300",
        isActive ? `border-white scale-110 shadow-lg` : "border-transparent"
      )}
      style={{ background: val }}
      aria-label={`Select ${name} accent color`}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    />
  );
};