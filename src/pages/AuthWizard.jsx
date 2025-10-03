import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Mail, Globe, LogIn, Lock, Eye, EyeOff,
  Loader2, User, GraduationCap, Users, X, CheckCircle2, AlertTriangle,
  ChevronRight, ChevronLeft, Briefcase, BookOpen, Star, Repeat2,
  Hash, RotateCcw, PenTool, UserCog, UploadCloud,
  UserCircle, Heart, Rabbit, Cat, Dog, Bot, Smile, Code
} from "lucide-react";

// ✅ Real Firebase (your existing lib)
import { auth, storage } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ✅ Laravel API helper (Bearer <ID_TOKEN>)
import { api } from "@/lib/apiClient";

/* -------------------------------------------------------------------------- */
/* Helpers & Settings                                                         */
/* -------------------------------------------------------------------------- */

const cls = (...a) => a.filter(Boolean).join(" ");
const EASE = [0.22, 0.61, 0.36, 1];
const MIN_PASSWORD_LENGTH = 8;

function burstConfetti() { console.log("🎉 Confetti!"); }

// Map UI track → API enum
function mapTrackForApi(uiTrack, grade) {
  const g = Number(grade);
  if (g <= 9) return "general"; // UI shows "common"
  if (uiTrack === "scientific" || uiTrack === "literary") return uiTrack;
  return "general";
}

// Friendly errors
function kuAuthError(e, { context = "generic" } = {}) {
  const code = String(e?.code || "");
  const map = {
    "auth/invalid-credential": "ناونیشانی ئیمەیل یان وشەی نهێنی نادروستە.",
    "auth/wrong-password": "وشەی نهێنی هەڵەیە.",
    "auth/user-not-found": "هەژماریەک بەو ئیمەیلە نەدۆزرایەوە.",
    "auth/too-many-requests": "هەوڵدان زۆر بوو. چەند خولەک چاوەڕێ بکە.",
    "auth/email-already-in-use": "ئەم ئیمەیلە پێشتر تۆمارکراوە.",
    "auth/invalid-email": "ئیمەیل نادروستە.",
    "auth/weak-password": `وشەی نهێنی لاوازە (کەمتر لە ${MIN_PASSWORD_LENGTH} پیت).`,
    "auth/popup-closed-by-user": "پەنجەرە داخرا.",
  };
  return map[code] || "هەڵەیەک ڕوویدا. دووبارە هەوڵبدە.";
}

/* -------------------------------------------------------------------------- */
/* Strings                                                                    */
/* -------------------------------------------------------------------------- */

const STR = {
  title: "دەروازەی چوونەژوورەوە",
  subtitle: "فێربوونی زیرەکانە لە هەموو شوێنێک.",
  google: "چوونەژوورەوە بە Google",
  or: "یان",
  login: "چوونەژوورەوە",
  register: "تۆمارکردن",
  next: "دواتر",
  back: "پێشوو",
  finishLogin: "چوونەژوورەوە",
  finishRegister: "تەواوکردنی تۆمارکردن",
  name: "ناو و ناوی خێزان",
  email: "ئیمەیل",
  password: "وشەی نهێنی",
  confirmPw: "دووبارە وشەی نهێنی",
  grade: "پۆل",
  gradePrompt: "پۆلی ئێستا هەڵبژێرە:",
  gender: "رەگەز",
  male: "نێر",
  female: "مێ",
  track: "لقی خوێندن",
  trackPrompt: "بۆ پۆلی ١٠-١٢",
  scientific: "زانستی",
  literary: "ئەدبی",
  common: "گشتی (٧-٩)",
  personalTitle: "کەسایەتی کردن",
  personalSubtitle: "وێنەی تایبەت بە خۆت هەڵبژێرە.",
  uploadImage: "وێنە باربکە",
  writeBio: "بایۆ",
  capsLock: "Caps Lock لەسەرە.",
};

const ICON_COMPONENTS = { UserCircle, Heart, Rabbit, Cat, Dog, Bot, Smile, Code };
const SUGGESTED_ICONS = {
  male: ["UserCircle", "Bot", "Code", "Dog"],
  female: ["Heart", "Rabbit", "Cat", "Smile"],
};

/* -------------------------------------------------------------------------- */
/* Small UI                                                                   */
/* -------------------------------------------------------------------------- */

function Field({ label, icon, children, hint, className, required }) {
  return (
    <label className={cls("block text-sm", className)}>
      <span className="mb-1.5 inline-flex items-center gap-2 text-zinc-800 font-medium">
        {icon}{label}
        {required && <span className="text-rose-500 text-xs font-normal">(پێویستە)</span>}
      </span>
      {children}
      {hint}
    </label>
  );
}

function SelectButton({ icon, label, onClick, selected, colorClass = "bg-indigo" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "px-3 py-2 rounded-xl border text-sm transition font-medium flex items-center justify-center gap-2",
        selected
          ? `${colorClass}-500 text-white border-${colorClass}-500 shadow-md shadow-${colorClass}-300/60`
          : "bg-white/50 border-white/40 text-zinc-700 hover:bg-white/80"
      )}
    >
      {icon} {label}
    </button>
  );
}

function IconSelectorButton({ iconName, currentIcon, onClick, className }) {
  const IconComponent = ICON_COMPONENTS[iconName];
  const isSelected = iconName === currentIcon;
  if (!IconComponent) return null;

  return (
    <button
      type="button"
      onClick={() => onClick(iconName)}
      className={cls(
        "h-12 w-12 rounded-full grid place-items-center ring-2 transition-all duration-300",
        isSelected
          ? "bg-indigo-500 ring-indigo-300 text-white shadow-lg shadow-indigo-300/50"
          : "bg-white ring-gray-300 text-zinc-600 hover:bg-indigo-50 hover:ring-indigo-200",
        className
      )}
      aria-label={`Select icon ${iconName}`}
    >
      <IconComponent className="h-6 w-6" />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AuthWizard() {
  const nav = useNavigate();
  const loc = useLocation();
  const backTo = loc.state?.from?.pathname || "/";

  const [mode, setMode] = useState("login");
  const LOGIN_STEPS = 2, REG_STEPS = 3;
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // login & register states
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [pw2, setPw2] = useState("");

  // register step 1
  const [name, setName] = useState("");
  const GRADES = ["7","8","9","10","11","12"];
  const [grade, setGrade] = useState(localStorage.getItem("grade") || "12");
  const [gender, setGender] = useState(localStorage.getItem("gender") || "male");
  const [track, setTrack] = useState(() => {
    const g = Number(localStorage.getItem("grade") || "12");
    const existing = localStorage.getItem("track") || "";
    return g > 9 ? existing || "scientific" : "common";
  });

  // register step 3
  const [icon, setIcon] = useState(localStorage.getItem("icon") || (gender === 'female' ? 'Heart' : 'UserCircle'));
  const [bio, setBio] = useState(localStorage.getItem("bio") || "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => {
    const stored = localStorage.getItem("icon");
    if (stored && (stored.startsWith("http") || ICON_COMPONENTS[stored])) return stored;
    return gender === 'female' ? 'Heart' : 'UserCircle';
  });

  // focus mgmt
  const firstInputRef = useRef(null);
  useEffect(() => { firstInputRef.current?.focus?.(); }, [mode, step]);
  const onKeyPw = (e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"));

  const total = mode === "login" ? LOGIN_STEPS : REG_STEPS;
  const pct = Math.round(((step > total ? total : step) - 1) / total * 100);
  const needsTrackSelection = Number(grade) > 9;

  function go(modeKey){ setErr(""); setMode(modeKey); setStep(1); }
  function next() { setErr(""); if (step < total) setStep(step+1); }
  function back() { setErr(""); if (step > 1) setStep(step-1); }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAvatarUrl(URL.createObjectURL(selectedFile)); // preview
      setIcon(selectedFile.name);
    }
  };

  async function startUpload() {
    // If no file chosen, keep current avatarUrl/icon choice (could be an icon name)
    if (!file) return { ok: true, url: (avatarUrl && avatarUrl.startsWith("http")) ? avatarUrl : null };

    if (!auth.currentUser) return { ok: false, error: "not-authenticated" };
    try {
      setUploading(true);
      const uid = auth.currentUser.uid;
      const path = `users/${uid}/avatar_${Date.now()}.jpg`;
      const r = ref(storage, path);
      await uploadBytes(r, file, { contentType: file.type || "image/jpeg" });
      const url = await getDownloadURL(r);
      setAvatarUrl(url);
      setIcon(url);
      setUploading(false);
      return { ok: true, url };
    } catch (e) {
      setUploading(false);
      return { ok: false, error: e };
    }
  }

  // Save to Laravel (/me). Also stash locally for UX.
  async function persistProfileToBackend({ avatarUrlFinal }) {
    const payload = {
      grade: Number(grade),
      track: mapTrackForApi(track, grade),
      photo_url: avatarUrlFinal || (avatarUrl.startsWith("http") ? avatarUrl : null),
      settings: { gender, bio, icon: avatarUrlFinal || icon },
    };
    await api("/api/v1/me", { method: "PUT", body: payload });

    // local cache (optional)
    localStorage.setItem("grade", String(grade));
    localStorage.setItem("gender", gender);
    localStorage.setItem("track", track);
    if (payload.photo_url) localStorage.setItem("icon", payload.photo_url);
    if (bio) localStorage.setItem("bio", bio);
  }

  // Google Sign-in (works on both tabs)
  async function doGoogle() {
    setLoading(true); setErr("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      // Notify backend (optional convenience)
      await api("/api/v1/auth/firebase", {
        method: "POST",
        body: { idToken: await auth.currentUser.getIdToken(true) },
      });

      burstConfetti();
      setTimeout(()=> nav(backTo, { replace: true }), 400);
    } catch (e) {
      setErr(kuAuthError(e, { context: "google-login" }));
    } finally {
      setLoading(false);
    }
  }

  // Login (email/password)
  async function submitLogin(){
    setErr("");
    if (!email || !pw) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pw);

      // Optional “login” hit (else /me will upsert on first call)
      await api("/api/v1/auth/firebase", {
        method: "POST",
        body: { idToken: await auth.currentUser.getIdToken(true) },
      });

      burstConfetti();
      setTimeout(()=> nav(backTo, { replace: true }), 400);
    } catch (e) {
      setErr(kuAuthError(e) || "هەڵەی چوونەژوورەوە.");
    } finally { setLoading(false); }
  }

  // Final register submit (creates Firebase user, uploads avatar, updates Laravel)
  async function submitRegStep3() {
    setErr("");
    setLoading(true);
    try {
      // 1) Create Firebase account
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      if (name) await updateProfile(cred.user, { displayName: name });

      // 2) Upload avatar (if any)
      const up = await startUpload();
      if (up.ok === false) throw up.error;

      // 3) Update profile photo in Firebase (optional)
      if (up.url) {
        try { await updateProfile(auth.currentUser, { photoURL: up.url }); } catch {}

        // 4) Tell backend we logged in (optional)
      }
      await api("/api/v1/auth/firebase", {
        method: "POST",
        body: { idToken: await auth.currentUser.getIdToken(true) },
      });

      // 5) Persist grade/track/photo/settings to Laravel
      await persistProfileToBackend({ avatarUrlFinal: up.url || null });

      burstConfetti();
      setTimeout(()=> nav(backTo, { replace: true }), 400);
    } catch (e) {
      setErr(kuAuthError(e) || "هەڵەی تۆمارکردن.");
    } finally {
      setLoading(false);
    }
  }

  // validation
  const canNext = useMemo(() => {
    if (mode === "login") {
      if (step === 1) return !!email;
      return !!pw && pw.length >= MIN_PASSWORD_LENGTH;
    } else {
      if (step === 1) {
        const trackOK = needsTrackSelection ? (track === "scientific" || track === "literary") : true;
        return !!name && !!email && !!grade && (gender === "male" || gender === "female") && trackOK;
      }
      if (step === 2) return !!pw && pw.length >= MIN_PASSWORD_LENGTH && pw2 === pw;
      if (step === 3) return !!avatarUrl && !uploading;
    }
    return false;
  }, [mode, step, email, name, pw, pw2, grade, gender, track, needsTrackSelection, avatarUrl, uploading]);

  /* ---------------------- UI steps ---------------------- */

  const LoginStep1 = (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-bold text-indigo-700">{STR.login}</h3>
      <Field label={STR.email} icon={<Mail className="h-4 w-4 text-sky-500" />} required>
        <input
          type="email" ref={firstInputRef}
          className="w-full p-3 rounded-xl border border-white/80 bg-white/70 shadow-inner shadow-gray-200 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-400/50"
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="email@example.com"
        />
      </Field>
    </div>
  );

  const LoginStep2 = (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-bold text-indigo-700">{STR.password}</h3>
      <Field label={STR.password} icon={<Lock className="h-4 w-4 text-rose-500" />} required>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"} ref={firstInputRef}
            className="w-full p-3 pr-12 rounded-xl border border-white/80 bg-white/70 shadow-inner shadow-gray-200 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-400/50"
            value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={onKeyPw}
            placeholder={`لانی کەم ${MIN_PASSWORD_LENGTH} پیت`}
          />
          <button type="button" onClick={() => setShowPw(p => !p)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-indigo-500 transition">
            {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {capsOn && <div className="mt-1 text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {STR.capsLock}</div>}
      </Field>
      <button type="button" className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition w-fit">وشەی نهێنیم بیرچووە</button>
    </div>
  );

  const RegStep1 = (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-bold text-indigo-700">{STR.register}</h3>

      <Field label={STR.name} icon={<User className="h-4 w-4 text-sky-500" />} required>
        <input
          type="text" ref={firstInputRef}
          className="w-full p-3 rounded-xl border border-white/80 bg-white/70 shadow-inner shadow-gray-200 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-400/50"
          value={name} onChange={e => setName(e.target.value)}
          placeholder="وەکو: ئەحمەد محەمەد"
        />
      </Field>

      <Field label={STR.email} icon={<Mail className="h-4 w-4 text-emerald-500" />} required>
        <input
          type="email"
          className="w-full p-3 rounded-xl border border-white/80 bg-white/70 shadow-inner shadow-gray-200 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-400/50"
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="email@example.com"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={STR.grade} icon={<GraduationCap className="h-4 w-4 text-rose-500" />} required>
          <select
            className="w-full p-3 rounded-xl border border-white/80 bg-white/70 shadow-inner shadow-gray-200 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-400/50 appearance-none"
            value={grade}
            onChange={e => {
              const newGrade = e.target.value;
              setGrade(newGrade);
              if (Number(newGrade) <= 9) setTrack("common");
            }}
          >
            {GRADES.map(g => <option key={g} value={g}>پۆلی {g}</option>)}
          </select>
        </Field>

        <Field label={STR.gender} icon={<Users className="h-4 w-4 text-amber-500" />} required>
          <div className="flex gap-2 h-full items-center pt-2">
            <SelectButton
              label={STR.male} icon={<UserCircle className="h-4 w-4" />}
              onClick={() => setGender("male")} selected={gender === "male"}
            />
            <SelectButton
              label={STR.female} icon={<Heart className="h-4 w-4" />}
              onClick={() => setGender("female")} selected={gender === "female"}
            />
          </div>
        </Field>
      </div>

      <AnimatePresence>
        {needsTrackSelection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Field
              label={STR.track}
              icon={<BookOpen className="h-4 w-4 text-teal-500" />}
              required
              hint={<div className="text-xs text-zinc-500 mt-1">{STR.trackPrompt}</div>}
            >
              <div className="flex gap-2 pt-1">
                <SelectButton
                  label={STR.scientific} icon={<Hash className="h-4 w-4" />}
                  onClick={() => setTrack("scientific")} selected={track === "scientific"}
                  colorClass="bg-teal"
                />
                <SelectButton
                  label={STR.literary} icon={<PenTool className="h-4 w-4" />}
                  onClick={() => setTrack("literary")} selected={track === "literary"}
                  colorClass="bg-orange"
                />
              </div>
            </Field>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const RegStep2 = (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-bold text-indigo-700">دروستکردنی وشەی نهێنی</h3>

      <Field label={STR.password} icon={<Lock className="h-4 w-4 text-rose-500" />} required>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"} ref={firstInputRef}
            className="w-full p-3 pr-12 rounded-xl border border-white/80 bg-white/70 shadow-inner shadow-gray-200 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-400/50"
            value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={onKeyPw}
            placeholder={`لانی کەم ${MIN_PASSWORD_LENGTH} پیت`}
          />
          <button type="button" onClick={() => setShowPw(p => !p)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-indigo-500 transition">
            {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {capsOn && <div className="mt-1 text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {STR.capsLock}</div>}
      </Field>

      <Field label={STR.confirmPw} icon={<Repeat2 className="h-4 w-4 text-purple-500" />} required>
        <input
          type="password"
          className={cls(
            "w-full p-3 rounded-xl border border-white/80 bg-white/70 shadow-inner shadow-gray-200 text-sm text-zinc-900 outline-none focus:ring-2",
            pw2 !== pw && pw2.length > 0 ? "focus:ring-rose-400/50 border-rose-300" : "focus:ring-indigo-400/50"
          )}
          value={pw2} onChange={e => setPw2(e.target.value)}
          placeholder="دووبارە وشەی نهێنی بنووسە"
        />
        {pw2 !== pw && pw2.length > 0 && <div className="mt-1 text-xs text-rose-600 font-medium">وشەکان یەکسان نین.</div>}
      </Field>
    </div>
  );

  const isImg = avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("blob"));
  const IconComponent = avatarUrl ? ICON_COMPONENTS[avatarUrl] : null;
  const RegStep3 = (
    <div className="flex flex-col gap-6">
      <header>
        <h3 className="text-xl font-bold text-indigo-700">{STR.personalTitle}</h3>
        <p className="text-sm text-zinc-500 mt-1">{STR.personalSubtitle}</p>
      </header>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative flex-shrink-0 h-20 w-20 rounded-full bg-gray-200 grid place-items-center ring-4 ring-indigo-500/50 shadow-lg overflow-hidden">
          {isImg ? (
            <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
          ) : IconComponent ? (
            <IconComponent className="h-10 w-10 text-indigo-600" />
          ) : (
            <UserCircle className="h-10 w-10 text-zinc-500" />
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1 w-full">
          <Field label={STR.uploadImage} icon={<UploadCloud className="h-4 w-4 text-fuchsia-500" />}>
            <input type="file" id="avatar-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
            <label htmlFor="avatar-upload" className="w-full text-center px-4 py-2 rounded-xl text-sm border border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-700 font-semibold cursor-pointer hover:bg-fuchsia-500/20 transition flex items-center justify-center gap-2">
              {file ? <CheckCircle2 className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
              {file ? `فایل هەڵبژێردراوە: ${file.name}` : "وێنەیەک هەڵبژێرە"}
            </label>
          </Field>

          <div className="mt-1 flex items-center gap-3">
            {SUGGESTED_ICONS[gender].map(iconName => (
              <IconSelectorButton
                key={iconName}
                iconName={iconName}
                currentIcon={icon}
                onClick={() => { setIcon(iconName); setAvatarUrl(iconName); setFile(null); }}
              />
            ))}
          </div>
          {uploading && (
            <div className="mt-2 text-xs text-indigo-600 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> بارکردنی وێنە...
            </div>
          )}
        </div>
      </div>

      <Field label={STR.writeBio} icon={<PenTool className="h-4 w-4 text-amber-500" />}>
        <textarea
          className="w-full h-24 p-3 rounded-xl border border-white/80 bg-white/70 shadow-inner shadow-gray-200 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-400/50 resize-none"
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="کورتە باس لەسەر خۆت..."
          maxLength={200}
        />
        <div className="text-xs text-zinc-400 mt-1 text-right">
          {bio.length} / 200
        </div>
      </Field>
    </div>
  );

  const progressSteps = mode === "login"
    ? [{ label: STR.email, icon: Mail }, { label: STR.password, icon: Lock }]
    : [{ label: "زانیاری", icon: User }, { label: "وشەی نهێنی", icon: Lock }, { label: "کەسایەتی", icon: UserCog }];

  /* ----------------------------- Render ----------------------------- */
  return (
    <div dir="rtl" className="min-h-[100svh] text-zinc-900 bg-gray-50 overflow-hidden">
      <div className="fixed inset-0 lg:right-[50%] bg-gradient-to-br from-indigo-50 to-sky-100" />

      <div className="relative flex min-h-[100svh]">
        <div
          className="hidden lg:block fixed inset-y-0 left-[50%] bg-gradient-to-br from-sky-400 to-indigo-600 shadow-2xl shadow-indigo-500/50 transition-all duration-500 ease-out"
          style={{ width: isFocused ? '60%' : '50%' }}
        >
          <div className={cls(
            "absolute inset-0 backdrop-blur-xl bg-black/10 flex flex-col justify-center p-12 text-white/90 transition-all duration-500 ease-out",
            isFocused ? "scale-[0.9] opacity-80" : "scale-[1] opacity-100",
            "items-end text-right pr-16"
          )}>
            <Star className="h-16 w-16 text-amber-300 mb-4 animate-pulse" />
            <h2 className="text-4xl font-extrabold mb-3 leading-tight">دەروازەی</h2>
            <h2 className="text-4xl font-extrabold mb-3 leading-tight">{STR.title}</h2>
            <p className="text-lg font-light max-w-sm">{STR.subtitle}</p>
          </div>
        </div>

        <div
          className={cls(
            "w-full p-4 sm:p-8 lg:p-12 flex flex-col justify-center items-center lg:items-end min-h-[100svh] transition-all duration-500 ease-out",
            isFocused ? 'lg:w-[40%]' : 'lg:w-1/2'
          )}
        >
          <header className="pb-6 lg:hidden">
            <h1 className="text-3xl font-bold leading-tight">{STR.title}</h1>
            <p className="text-sm text-zinc-500 mt-1">{STR.subtitle}</p>
          </header>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: .25, ease: EASE }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => {
                if (!document.activeElement.closest('.auth-wizard-form')) setIsFocused(false);
              }, 100);
            }}
            className="rounded-3xl border border-white/70 bg-white/70 backdrop-blur-3xl shadow-2xl shadow-gray-200/60 p-6 sm:p-8 w-full max-w-lg auth-wizard-form"
          >
            <div className="lg:pl-4">
              {/* Google Button */}
              <div className="grid">
                <button
                  onClick={doGoogle} disabled={loading}
                  className="rounded-xl border border-white/80 bg-white/70 hover:bg-white px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium text-zinc-8 00 shadow-md transition"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-5 w-5 text-emerald-500" />}
                  <div>{STR.google}</div>
                </button>
              </div>

              {/* OR */}
              <div className="my-4 flex items-center gap-3 text-xs text-zinc-500">
                <div className="h-px flex-1 bg-gray-300" /> {STR.or} <div className="h-px flex-1 bg-gray-300" />
              </div>

              {/* Mode selector */}
              <div className="mb-6 flex gap-1 p-1 rounded-xl bg-white/90 border border-white/90 shadow-inner shadow-gray-200/50">
                <button type="button" onClick={()=>go("login")}
                  className={cls("px-3 py-2 rounded-lg text-sm flex-1 font-semibold transition", mode==="login"?"bg-indigo-500 text-white shadow-lg shadow-indigo-200/80":"text-zinc-600 hover:bg-white")}>
                  {STR.login}
                </button>
                <button type="button" onClick={()=>go("register")}
                  className={cls("px-3 py-2 rounded-lg text-sm flex-1 font-semibold transition", mode==="register"?"bg-indigo-500 text-white shadow-lg shadow-indigo-200/80":"text-zinc-600 hover:bg-white")}>
                  {STR.register}
                </button>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs text-zinc-600 mb-2">
                  <span className="font-medium">هەنگاو: {step} / {total}</span>
                  <span className="font-medium">{pct}% تەواو</span>
                </div>
                <div className="flex items-center justify-between relative mb-2">
                  <div className="absolute inset-x-0 h-1 rounded-full bg-white/70 top-1/2 -translate-y-1/2 z-0 shadow-inner shadow-gray-200" />
                  <div className="absolute h-1 rounded-full bg-indigo-500 top-1/2 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${pct}%` }} />
                  {(mode === "login"
                    ? [{ label: STR.email, icon: Mail }, { label: STR.password, icon: Lock }]
                    : [{ label: "زانیاری", icon: User }, { label: "وشەی نهێنی", icon: Lock }, { label: "کەسایەتی", icon: UserCog }]
                  ).map((p, i) => (
                    <div key={i} className={cls("flex flex-col items-center z-10", mode === "login" ? "w-1/2" : "w-1/3")}>
                      <div className={cls("h-6 w-6 rounded-full grid place-items-center ring-2 transition-all duration-300", step >= i+1 ? "bg-indigo-500 ring-white text-white shadow-md shadow-indigo-300" : "bg-white ring-gray-300 text-zinc-500")}>
                        <p.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className={cls("text-xs mt-1 transition-colors duration-300", step >= i+1 ? "text-indigo-600 font-semibold" : "text-zinc-500")}>
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step body */}
              <div className="min-h-[280px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${mode}-${step}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: .25, ease: EASE }}
                    className="space-y-4"
                  >
                    {mode === "login" && (step === 1 ? LoginStep1 : LoginStep2)}
                    {mode === "register" && (step === 1 ? RegStep1 : step === 2 ? RegStep2 : RegStep3)}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Error */}
              {err && <div className="mt-4 text-rose-600 text-sm font-medium flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{err}</div>}

              {/* Footer buttons */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button" onClick={back} disabled={step===1 || loading || uploading}
                  className={cls("inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition", step===1 || loading || uploading ? "opacity-40 cursor-not-allowed text-zinc-500" : "text-zinc-700 hover:bg-white/90")}>
                  <ChevronLeft className="h-4 w-4" /> {STR.back}
                </button>

                {mode === "login" && step === LOGIN_STEPS ? (
                  <button
                    type="button" onClick={submitLogin} disabled={!canNext || loading}
                    className={cls("inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-300/60 transition", !canNext || loading ? "opacity-60 cursor-not-allowed" : "")}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                    {STR.finishLogin}
                  </button>
                ) : mode === "register" && step === REG_STEPS ? (
                  <button
                    type="button" onClick={submitRegStep3} disabled={!canNext || loading || uploading}
                    className={cls("inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-300/60 transition", !canNext || loading || uploading ? "opacity-60 cursor-not-allowed" : "")}>
                    {loading || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {STR.finishRegister}
                  </button>
                ) : (
                  <button
                    type="button" onClick={next} disabled={!canNext || loading || uploading}
                    className={cls("inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold shadow-lg shadow-sky-300/60 transition", !canNext || loading || uploading ? "opacity-60 cursor-not-allowed" : "")}>
                    {STR.next} <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
