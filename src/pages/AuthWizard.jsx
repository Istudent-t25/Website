// src/pages/AuthWizard.jsx — add track picker when grade > 9 (save to localStorage)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Mail, Globe, LogIn, Lock, Eye, EyeOff,
  Loader2, User, GraduationCap, Users, X, CheckCircle2, AlertTriangle,
  ChevronRight, ChevronLeft
} from "lucide-react";

// Firebase
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
  setPersistence,
  browserLocalPersistence,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

/* ---------- یارمەتیدەر ---------- */
const cls = (...a) => a.filter(Boolean).join(" ");
const EASE = [0.22, 0.61, 0.36, 1];
const EMAIL_COMMON = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "icloud.com"];

function lev(a="", b=""){
  const m=a.length,n=b.length,dp=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for(let i=0;i<=m;i++)dp[i][0]=i;for(let j=0;j<=n;j++)dp[0][j]=j;
  for(let i=1;i<=m;i++){for(let j=1;j<=n;j++){const c=a[i-1]===b[j-1]?0:1;dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+c);}}
  return dp[m][n];
}
function suggestEmailDomain(value) {
  if (!value || !value.includes("@")) return null;
  const [, dom] = value.split("@");
  if (!dom) return null;
  let best = null, bestD = 1e9;
  for (const d of EMAIL_COMMON) {
    const L = lev(dom, d);
    if (L < bestD) { bestD = L; best = d; }
  }
  return bestD > 0 && bestD <= 2 ? best : null;
}

function burstConfetti() {
  const N = 90;
  const wrap = document.createElement("div");
  wrap.style.position = "fixed"; wrap.style.inset = "0"; wrap.style.pointerEvents = "none"; wrap.style.zIndex = "9999";
  document.body.appendChild(wrap);
  const colors = ["#22d3ee","#a78bfa","#34d399","#f472b6","#f59e0b","#ef4444"];
  for (let i=0;i<N;i++){
    const p = document.createElement("div");
    p.style.position = "absolute"; p.style.width = "8px"; p.style.height = "12px";
    p.style.background = colors[i%colors.length]; p.style.left = (Math.random()*100)+"%"; p.style.top = "-20px";
    p.style.opacity = "0.9"; p.style.borderRadius = "2px"; wrap.appendChild(p);
    const duration = 1100 + Math.random()*900, x = (Math.random()*200-100);
    p.animate([{ transform:`translate(0,0)`, top:"-10px" }, { transform:`translate(${x}px, 100vh)`, top:"100vh" }], { duration, easing:"cubic-bezier(.22,.61,.36,1)", fill:"forwards" });
  }
  setTimeout(()=>wrap.remove(), 2200);
}

async function persistProfile({ grade, gender }) {
  try {
    const user = auth.currentUser;
    const data = { grade, gender, updatedAt: serverTimestamp ? serverTimestamp() : new Date() };
    if (user && db) {
      const ref = doc(db, "users", user.uid);
      const prev = await getDoc(ref);
      await setDoc(ref, { ...prev.data(), ...data }, { merge: true });
    }
    localStorage.setItem("grade", grade);
    localStorage.setItem("gender", gender);
  } catch {}
}

/* ---------- وەرگێڕانی هەڵەکانی Firebase بۆ کوردی ---------- */
function kuAuthError(e, { context = "generic" } = {}) {
  const code = (e?.code || "").toString();
  const map = {
    "auth/invalid-credential": "ناونیشانی ئیمەیل یان وشەی نهێنی نادروستە.",
    "auth/wrong-password": "وشەی نهێنی هەڵەیە.",
    "auth/user-not-found": "هەژماریەک بەو ئیمەیلە نەدۆزرایەوە.",
    "auth/too-many-requests": "هەوڵدانەکان زۆر بوون. تکایە دوای چەند خولەکە هەوڵبدەوە.",
    "auth/network-request-failed": "کێشەی تۆڕ. تکایە پەیوەندیت بپشکنە.",
    "auth/account-exists-with-different-credential": "ئەم ئیمەیلە پێشتر بە ڕێگایەکی تر داخڵکراوە. هەمان ڕێگا بەکاربێنە.",
    "auth/email-already-in-use": "ئەم ئیمەیلە پێشتر تۆمارکراوە.",
    "auth/invalid-email": "ئیمەیل نادروستە.",
    "auth/weak-password": "وشەی نهێنی لاوازە (کەمەند ٨ پیت).",
    "auth/popup-closed-by-user": "پەنجەرەکە داخرا پێشەوە.",
    "auth/operation-not-allowed": "ئەم جۆرە چوونەژوورەوە ڕێگەپێنەدراوە.",
    "auth/requires-recent-login": "تکایە دووبارە بچۆ ژوورەوە و هەوڵبدە."
  };
  if (code === "auth/invalid-credential" && context === "login") {
    return "ئیمەیل یان وشەی نهێنی هەڵەیە. تکایە دوبارە دابننەوە یان وشەی نهێنیت لەبیرکردووەتەوە؟";
  }
  if (code === "auth/account-exists-with-different-credential" && context === "google") {
    return "ئەم ئیمەیلە پێشترە بە ڕێگایەکی تر (مثلاً پەسۆرد). تکایە هەمان ڕێگا هەڵبژێرە یان بچۆ بۆ چوونەژوورەوە بە پەسۆرد.";
  }
  return map[code] || "هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵبدە.";
}

/* ---------- ڕستەکان (کوردی) ---------- */
const STR = {
  title: "چوونەژوورەوە / تۆمارکردن",
  subtitle: "هەموو شتێک بە هەنگاو — سادە و خۆش.",
  google: "چوونەژوورەوەی Google",
  or: "یان",
  login: "چوونەژوورەوە",
  register: "تۆمارکردن",
  next: "دواتر",
  back: "پێشوو",
  finishLogin: "چوونەژوورەوە",
  finishRegister: "دروستکردنی هەژمار",
  name: "ناو",
  email: "ئیمەیل",
  password: "وشەی نهێنی",
  confirmPw: "دووبارە وشەی نهێنی",
  grade: "پۆل",
  gender: "رەگەز",
  male: "نێر",
  female: "مێ",
  capsOn: "CAPS LOCK چالاکە",
  emailSuggest: (s) => `واتە ${s}‌ت دەخوازیت؟`,
};

/* ---------- خانەی تێکست ---------- */
function Field({ label, icon, children, hint }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 inline-flex items-center gap-2 text-zinc-300">{icon}{label}</span>
      {children}
      {hint}
    </label>
  );
}

/* ---------- کۆمپۆنەنتی سەرەکی ---------- */
export default function AuthWizard() {
  const nav = useNavigate();
  const loc = useLocation();
  const backTo = loc.state?.from?.pathname || "/";

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const LOGIN_STEPS = 2, REG_STEPS = 3;
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // login
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [emailHint, setEmailHint] = useState(null);

  // register
  const [name, setName] = useState("");
  const [pw2, setPw2] = useState("");
  const GRADES = ["7","8","9","10","11","12"];
  const [grade, setGrade] = useState(localStorage.getItem("grade") || "12");
  const [gender, setGender] = useState(localStorage.getItem("gender") || "male");

  // NEW: track (only required when grade > 9)
  const [track, setTrack] = useState(() => {
    const g = Number(localStorage.getItem("grade") || "12");
    const existing = localStorage.getItem("track") || "";
    return g > 9 ? existing : "common";
  });

  // focus
  const firstInputRef = useRef(null);
  useEffect(() => { firstInputRef.current?.focus?.(); }, [mode, step]);

  // theming & persistence
  useEffect(() => { document.documentElement.classList.add("dark"); }, []);
  useEffect(() => { setPersistence(auth, browserLocalPersistence).catch(()=>{}); }, []);
  useEffect(() => { setEmailHint(suggestEmailDomain(email)); }, [email]);
  const onKeyPw = (e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"));

  const total = mode === "login" ? LOGIN_STEPS : REG_STEPS;
  const pct = Math.round((step-1) / total * 100);

  function go(modeKey){
    setErr("");
    setMode(modeKey);
    setStep(1);
  }
  function next() {
    setErr("");
    if (step < total) setStep(step+1);
  }
  function back() {
    setErr("");
    if (step > 1) setStep(step-1);
  }

  // ڕەزامەندی بۆ هەر هەنگاوێک
  const canNext = useMemo(() => {
    if (mode === "login") {
      if (step === 1) return !!email;
      return !!pw && pw.length >= 8;
    } else {
      if (step === 1) return !!name && !!email;
      if (step === 2) return !!pw && pw.length >= 8 && pw2 === pw;
      if (step === 3) {
        const needsTrack = Number(grade) > 9;
        const trackOK = needsTrack ? (track === "scientific" || track === "literary") : true;
        return !!grade && (gender === "male" || gender === "female") && trackOK;
      }
    }
  }, [mode, step, email, name, pw, pw2, grade, gender, track]);

  /* ---------- کردارەکان ---------- */
  async function doGoogle() {
    setErr(""); setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      const g = Number(localStorage.getItem("grade") || "0");
      const gen = localStorage.getItem("gender");
      const tr = localStorage.getItem("track");

      const hasBasics = g > 0 && (gen === "male" || gen === "female");
      const needsTrack = g > 9;
      const hasTrack = tr === "scientific" || tr === "literary";

      if (hasBasics && (!needsTrack || hasTrack)) {
        burstConfetti();
        setTimeout(()=> nav(backTo, { replace: true }), 600);
      } else {
        setMode("register");
        setStep(3);
      }
    } catch (e) {
      setErr(kuAuthError(e, { context: "google" }));
    } finally { setLoading(false); }
  }

  async function submitLogin(){
    setErr("");
    if (!email || !pw) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      burstConfetti();
      setTimeout(()=> nav(backTo, { replace: true }), 600);
    } catch (e) {
      setErr(kuAuthError(e, { context: "login" }));
    } finally { setLoading(false); }
  }

  async function submitRegister(){
    setErr("");
    if (!name || !email || !pw || pw !== pw2) return;
    setLoading(true);
    try {
      // Save track to localStorage (and default to "common" for grade <= 9)
      const needsTrack = Number(grade) > 9;
      const toStore = needsTrack ? (track || "scientific") : "common";
      localStorage.setItem("track", toStore);

      const cr = await createUserWithEmailAndPassword(auth, email, pw);
      if (name) await updateProfile(cr.user, { displayName: name });
      try { await sendEmailVerification(cr.user); } catch {}
      await persistProfile({ grade, gender });
      burstConfetti();
      setTimeout(()=> nav(backTo, { replace: true }), 700);
    } catch (e) {
      if (e?.code === "auth/email-already-in-use") {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          setErr(`ئەم ئیمەیلە پێشتر تۆمارکراوە. ڕێگای پێشووتر: ${methods.join(", ")}`);
        } catch {
          setErr(kuAuthError(e));
        }
      } else {
        setErr(kuAuthError(e));
      }
    } finally { setLoading(false); }
  }

  /* ---------- هەنگاوەکان (UI) ---------- */
  const LoginStep1 = (
    <Field
      label={STR.email}
      icon={<Mail className="h-4 w-4" />}
      hint={emailHint && (
        <div className="mt-1 text-xs text-amber-300 inline-flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" /> {STR.emailSuggest(`${email.split("@")[0]}@${emailHint}`)}
        </div>
      )}
    >
      <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-900/60 px-3 py-2">
        <input
          ref={firstInputRef}
          className="w-full bg-transparent outline-none text-sm"
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>
    </Field>
  );
  const LoginStep2 = (
    <Field label={STR.password} icon={<Lock className="h-4 w-4" /> }
      hint={capsOn && (
        <div className="mt-1 text-xs text-amber-300 inline-flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" /> {STR.capsOn}
        </div>
      )}
    >
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/60 px-3 py-2">
        <input
          ref={firstInputRef}
          className="w-full bg-transparent outline-none text-sm"
          type={showPw?"text":"password"}
          value={pw}
          onChange={e=>setPw(e.target.value)}
          onKeyUp={onKeyPw} onKeyDown={onKeyPw}
          placeholder="********"
          required minLength={8}
          autoComplete="current-password"
        />
        <button type="button" onClick={()=>setShowPw(v=>!v)} className="text-zinc-400 hover:text-zinc-200" tabIndex={-1} aria-label="Show password">
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );

  const RegStep1 = (
    <div className="grid gap-3">
      <Field label={STR.name} icon={<User className="h-4 w-4" />}>
        <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-900/60 px-3 py-2">
          <input
            ref={firstInputRef}
            className="w-full bg-transparent outline-none text-sm"
            value={name}
            onChange={e=>setName(e.target.value)}
            placeholder="..."
            required
          />
        </div>
      </Field>
      <Field
        label={STR.email}
        icon={<Mail className="h-4 w-4" />}
        hint={emailHint && (
          <div className="mt-1 text-xs text-amber-300 inline-flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> {STR.emailSuggest(`${email.split("@")[0]}@${emailHint}`)}
          </div>
        )}
      >
        <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-900/60 px-3 py-2">
          <input
            className="w-full bg-transparent outline-none text-sm"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="new-email"
          />
        </div>
      </Field>
    </div>
  );

  const RegStep2 = (
    <div className="grid sm:grid-cols-2 gap-3">
      <Field label={STR.password} icon={<Lock className="h-4 w-4" /> }
        hint={capsOn && (
          <div className="mt-1 text-xs text-amber-300 inline-flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> {STR.capsOn}
          </div>
        )}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/60 px-3 py-2">
          <input
            ref={firstInputRef}
            className="w-full bg-transparent outline-none text-sm"
            type={showPw?"text":"password"}
            value={pw}
            onChange={e=>setPw(e.target.value)}
            onKeyUp={onKeyPw} onKeyDown={onKeyPw}
            placeholder="********"
            required minLength={8}
            autoComplete="new-password"
          />
          <button type="button" onClick={()=>setShowPw(v=>!v)} className="text-zinc-400 hover:text-zinc-200" tabIndex={-1} aria-label="Show password">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <Field label={STR.confirmPw} icon={<Lock className="h-4 w-4" />}>
        <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-900/60 px-3 py-2">
          <input
            className="w-full bg-transparent outline-none text-sm"
            type="password"
            value={pw2}
            onChange={e=>setPw2(e.target.value)}
            placeholder="********"
            required minLength={8}
            autoComplete="new-password"
          />
        </div>
      </Field>
    </div>
  );

  const RegStep3 = (
    <div className="grid sm:grid-cols-2 gap-3">
      <div>
        <div className="mb-1.5 inline-flex items-center gap-2 text-zinc-300 text-sm"><GraduationCap className="h-4 w-4" /> {STR.grade}</div>
        <div className="grid grid-cols-3 gap-2">
          {GRADES.map((g) => (
            <button
              key={g}
              ref={g===GRADES[0] ? firstInputRef : undefined}
              type="button"
              onClick={() => {
                setGrade(g);
                if (Number(g) > 9) {
                  const prev = localStorage.getItem("track") || "";
                  setTrack(prev); // require fresh selection if empty
                } else {
                  setTrack("common");
                  localStorage.setItem("track", "common");
                }
              }}
              className={cls("px-3 py-2 rounded-xl border text-sm transition",
                grade===g?"bg-emerald-500 text-black border-emerald-300":"bg-zinc-900/60 border-white/10 text-zinc-200 hover:bg-white/10")}
            >{g}</button>
          ))}
        </div>

        {/* NEW: Track selector for grade > 9 */}
        {Number(grade) > 9 && (
          <div className="mt-3">
            <div className="mb-1.5 inline-flex items-center gap-2 text-zinc-300 text-sm">
              <GraduationCap className="h-4 w-4" /> تۆ زانستی یان وێژەیی؟
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setTrack("scientific"); localStorage.setItem("track","scientific"); }}
                className={cls("px-3 py-2 rounded-xl border text-sm transition",
                  track==="scientific" ? "bg-cyan-500 text-black border-cyan-300"
                                       : "bg-zinc-900/60 border-white/10 text-zinc-200 hover:bg-white/10")}
              >
                زانستی
              </button>
              <button
                type="button"
                onClick={() => { setTrack("literary"); localStorage.setItem("track","literary"); }}
                className={cls("px-3 py-2 rounded-xl border text-sm transition",
                  track==="literary" ? "bg-cyan-500 text-black border-cyan-300"
                                     : "bg-zinc-900/60 border-white/10 text-zinc-200 hover:bg-white/10")}
              >
                وێژەیی
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="mb-1.5 inline-flex items-center gap-2 text-zinc-300 text-sm"><Users className="h-4 w-4" /> {STR.gender}</div>
        <div className="grid grid-cols-2 gap-2">
          {[{key:"male",label:STR.male},{key:"female",label:STR.female}].map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGender(g.key)}
              className={cls("px-3 py-2 rounded-xl border text-sm transition",
                gender===g.key?"bg-cyan-500 text-black border-cyan-300":"bg-zinc-900/60 border-white/10 text-zinc-200 hover:bg-white/10")}
            >{g.label}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="min-h-[100svh] text-white">
      {/* پاشمەرجەی پاشەکەوت و پسپۆڕی پشتەوە */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 right-0 left-0 h-[28rem] blur-3xl opacity-60"
          style={{ background: "conic-gradient(from 180deg at 50% 50%, rgba(34,211,238,.25), rgba(167,139,250,.22), rgba(52,211,153,.18), rgba(244,114,182,.18), rgba(34,211,238,.25))" }}
        />
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:14px_14px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 pt-10 pb-[env(safe-area-inset-bottom,0px)]">
        <header className="pb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-cyan-500/20 ring-1 ring-cyan-400/40 grid place-items-center">
              <Sparkles className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{STR.title}</h1>
              <p className="text-sm text-zinc-400 mt-1">{STR.subtitle}</p>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: .35, ease: EASE }}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 max-w-xl mx-auto overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            {/* Google */}
            <div className="grid">
              <button
                onClick={doGoogle}
                disabled={loading}
                className="rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 px-4 py-3 flex items-center justify-center gap-3 text-sm"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-5 w-5 text-emerald-300" />}
                <div>{STR.google}</div>
              </button>
            </div>

            {/* یان */}
            <div className="my-4 flex items-center gap-3 text-xs text-zinc-400">
              <div className="h-px flex-1 bg-white/10" />
              {STR.or}
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* هەڵبژاردنی دۆخ */}
            <div className="mb-4 flex gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
              <button type="button" onClick={()=>go("login")}
                className={cls("px-3 py-1.5 rounded-xl text-xs sm:text-sm flex-1", mode==="login"?"bg-white/10 ring-1 ring-white/10":"hover:bg-white/5")}>
                {STR.login}
              </button>
              <button type="button" onClick={()=>go("register")}
                className={cls("px-3 py-1.5 rounded-xl text-xs sm:text-sm flex-1", mode==="register"?"bg-white/10 ring-1 ring-white/10":"hover:bg-white/5")}>
                {STR.register}
              </button>
            </div>

            {/* پڕۆگرەس */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>هەنگاو {step} / {total}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* ناوەڕۆک */}
            <div className="min-h-[210px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${mode}-${step}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: .22, ease: EASE }}
                  className="space-y-3"
                >
                  {mode === "login" && (step === 1 ? LoginStep1 : LoginStep2)}
                  {mode === "register" && (step === 1 ? RegStep1 : step === 2 ? RegStep2 : RegStep3)}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* هەڵە */}
            {err && <div className="mt-2 text-rose-400 text-xs">{err}</div>}

            {/* دوگمەکان */}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                disabled={step===1 || loading}
                className={cls("inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm",
                  step===1 || loading ? "opacity-50 cursor-not-allowed bg-white/5 border-white/10" : "bg-white/5 border-white/10 hover:bg-white/10")}
              >
                <ChevronRight className="h-4 w-4" /> {STR.back}
              </button>

              {step < total ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={!canNext || loading}
                  className={cls("inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black font-medium shadow-lg shadow-cyan-500/20",
                    !canNext || loading ? "opacity-60 cursor-not-allowed" : "")}
                >
                  {STR.next} <ChevronLeft className="h-4 w-4" />
                </button>
              ) : (
                mode === "login" ? (
                  <button
                    type="button"
                    onClick={submitLogin}
                    disabled={!canNext || loading}
                    className={cls("inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-medium shadow-lg shadow-emerald-500/20",
                      !canNext || loading ? "opacity-60 cursor-not-allowed" : "")}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                    {STR.finishLogin}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitRegister}
                    disabled={!canNext || loading}
                    className={cls("inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-medium shadow-lg shadow-emerald-500/20",
                      !canNext || loading ? "opacity-60 cursor-not-allowed" : "")}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {STR.finishRegister}
                  </button>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
