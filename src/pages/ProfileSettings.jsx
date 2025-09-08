
// src/pages/ProfileSettings.ultra.kur.v2.jsx — کوردی • پڕۆفایلی پێشکەوتوو (v2)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Camera, LogOut, Mail, Phone, Shield, IdCard, Calendar,
  Upload, Trash2, ImagePlus, BadgeCheck, AlertTriangle, Check
} from "lucide-react";

import { auth } from "../lib/firebase";
import { updateProfile, signOut, sendEmailVerification, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// ---------- helpers ----------
const GRADES = ["7", "8", "9", "10", "11", "12"];
const TRACKS = ["زانستی", "ئەدەبی", "گشتی"];

function fmtDate(ts) {
  try { const d = new Date(ts); return isNaN(d.getTime()) ? "—" : d.toLocaleString(); }
  catch { return "—"; }
}
const cls = (...a)=>a.filter(Boolean).join(" ");

// auto square-crop via canvas (center)
async function squareCrop(file) {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });
  const size = Math.min(img.width, img.height);
  const sx = (img.width - size) / 2;
  const sy = (img.height - size) / 2;
  const canvas = document.createElement("canvas");
  const MAX = 512;
  canvas.width = MAX; canvas.height = MAX;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, sx, sy, size, size, 0, 0, MAX, MAX);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9));
}

// tiny toast
function useToast() {
  const [toast, setToast] = useState(null); // {type:'ok'|'err'|'warn', text}
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(()=>setToast(null), 2600);
    return ()=>clearTimeout(id);
  }, [toast]);
  return { toast, show: setToast, clear: ()=>setToast(null) };
}

// ---------- component ----------
export default function ProfileSettings() {
  const storage = getStorage(); // requires Firebase app to be initialized
  const [user, setUser] = useState(() => auth.currentUser);
  const [boot, setBoot] = useState(!auth.currentUser);
  useEffect(() => onAuthStateChanged(auth, (u)=>{ setUser(u); setBoot(false); }), []);

  const [name, setName] = useState(user?.displayName || "خوێندکار");
  const [avatar, setAvatar] = useState(user?.photoURL || "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [grade, setGrade] = useState(localStorage.getItem("grade") || "12");
  const [track, setTrack] = useState(localStorage.getItem("track") || "زانستی");

  const { toast, show, clear } = useToast();

  useEffect(() => { setName(user?.displayName || "خوێندکار"); setAvatar(user?.photoURL || ""); }, [user]);

  // Avatar handlers
  const fileInputRef = useRef(null);
  const onPick = () => fileInputRef.current?.click();

  const acceptTypes = ["image/png","image/jpeg","image/webp","image/jpg"];
  const maxSize = 4 * 1024 * 1024; // 4MB

  const onDrop = async (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) await processImage(f);
  };
  const onBrowse = async (e) => {
    const f = e.target.files?.[0];
    if (f) await processImage(f);
    e.target.value = ""; // reset
  };
  const processImage = async (f) => {
    if (!user) return;
    if (!acceptTypes.includes(f.type)) { show({type:"warn", text:"جۆری وێنە پشتگیر ناکرێت."}); return; }
    if (f.size > maxSize) { show({type:"warn", text:"قەبارەی وێنە زۆر گەورەیە (4MB)." }); return; }
    setUploading(true); setErr("");
    try {
      const blob = await squareCrop(f);
      const path = `avatars/${user.uid}.jpg`;
      const ref = sRef(storage, path);
      const task = uploadBytesResumable(ref, blob, { contentType: "image/jpeg" });
      task.on("state_changed", (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)));
      await new Promise((res, rej) => task.on("state_changed", null, rej, res));
      const url = await getDownloadURL(ref);
      await updateProfile(auth.currentUser, { photoURL: url });
      setAvatar(url);
      show({type:"ok", text:"وێنە نوێکرایەوە ✅"});
    } catch (e) {
      console.error(e); setErr("هەڵە لە بارکردنی وێنە.");
    } finally { setUploading(false); setTimeout(()=>setProgress(0), 800); }
  };

  const removeAvatar = async () => {
    if (!user) return;
    try {
      const ref = sRef(storage, `avatars/${user.uid}.jpg`);
      await deleteObject(ref).catch(()=>{}); // if not exists, ignore
      await updateProfile(auth.currentUser, { photoURL: "" });
      setAvatar("");
      show({type:"ok", text:"وێنە سڕایەوە ✅"});
    } catch (e) {
      console.error(e); show({type:"err", text:"نەتوانرا وێنە بسڕدرێت."});
    }
  };

  // SAVE base profile + prefs
  const save = async () => {
    if (!user) return;
    setSaving(true); setErr("");
    try {
      if (name && name !== user.displayName) await updateProfile(auth.currentUser, { displayName: name });
      localStorage.setItem("grade", grade);
      localStorage.setItem("track", track);
      show({type:"ok", text:"پاشەکەوت کرا ✅"});
    } catch (e) { console.error(e); setErr("نەتوانرا پاشەکەوت بکرێت."); }
    finally { setSaving(false); }
  };

  const doLogout = async () => {
    try { await signOut(auth); }
    catch (e) { console.error(e); show({type:"err", text:"نەتوانرا دەرچوون بکرێت."}); }
  };

  const resendVerify = async () => {
    if (!user || user.emailVerified) return;
    try { await sendEmailVerification(user); show({type:"ok", text:"بەستەری پشتڕاستکردنەوە نێردرا ✅"}); }
    catch (e) { console.error(e); show({type:"err", text:"نەتوانرا نامە بنێردرێت."}); }
  };

  const sendReset = async () => {
    if (!user?.email) return show({type:"warn", text:"ئیمەیل نییە."});
    try { await sendPasswordResetEmail(auth, user.email); show({type:"ok", text:"بەستەری گۆڕینی وشەی نهێنی نێردرا ✅"}); }
    catch (e) { console.error(e); show({type:"err", text:"هەڵە لە ناردن."}); }
  };

  const providerBadges = (user?.providerData || []).map((p, idx) => {
    const label = p.providerId.includes("google") ? "Google"
      : p.providerId.includes("phone") ? "Phone"
      : p.providerId.includes("password") ? "Email"
      : p.providerId;
    return <span key={idx} className="px-2 py-0.5 rounded-full text-[11px] bg-white/10 ring-1 ring-white/10">{label}</span>;
  });

  return (
    <div dir="rtl" className="px-3 sm:px-4 py-6 space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            className={cls(
              "fixed top-3 right-3 z-50 rounded-xl px-3 py-2 text-sm shadow-lg backdrop-blur ring-1",
              toast.type==="ok" && "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
              toast.type==="err" && "bg-rose-500/15 text-rose-200 ring-rose-400/30",
              toast.type==="warn" && "bg-amber-500/15 text-amber-200 ring-amber-400/30",
            )}
            role="status"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/10 via-fuchsia-500/10 to-emerald-500/10 ring-1 ring-white/10 p-5 sm:p-6">
        <div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -right-20 -bottom-28 w-64 h-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-50 flex items-center gap-2">
              <User className="text-cyan-300" size={20} /> ڕێکخستنی پڕۆفایل
            </h2>
            <p className="text-zinc-300 text-sm mt-1 max-w-2xl">
              ناو، وێنە، پۆل و لق— هەمووی لێرە ڕێک بخە. ئەگەر پێویستە پشتڕاستکردنەوەی ئیمەیل بکەیت، لە خوارەوە دەتوانیت.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={doLogout}
            className="shrink-0 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-2"
            title="دەرچوون"
          >
            <LogOut size={16} />
            دەرچوون
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="rounded-2xl ring-1 ring-white/10 bg-zinc-900/80 backdrop-blur p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div
              onDrop={onDrop}
              onDragOver={(e)=>e.preventDefault()}
              className="relative group rounded-2xl overflow-hidden ring-1 ring-white/10"
              aria-label="ناوونیشانی وێنە"
            >
              <img
                src={avatar || "https://placehold.co/160x160/0a0a0b/ffffff?text=Avatar"}
                alt="avatar"
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition grid place-items-center text-[11px] text-zinc-200">
                وێنە دابگرە یان دای بنێ
              </div>
              <button
                onClick={onPick}
                className="absolute -bottom-2 -left-2 bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-xl shadow-lg"
                title="وێنەی نوێ"
              >
                <Camera size={16} />
              </button>
              {avatar && (
                <button
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl shadow-lg"
                  title="سڕینەوەی وێنە"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onBrowse} />
            </div>

            <div className="flex-1">
              <label className="text-sm text-zinc-400">ناو</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full p-2 rounded-lg bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                maxLength={40}
              />
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-cyan-300" />
                  <span className="truncate">{user?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-emerald-300" />
                  <span className="truncate">{user?.phoneNumber || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 text-xs text-zinc-300 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <Upload size={14} className="text-cyan-300" />
                  بارکردنی وێنە...
                </div>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-zinc-400">پۆل</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="mt-1 w-full p-2 rounded-lg bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-cyan-500"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>پۆلی {g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-zinc-400">لەق</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="mt-1 w-full p-2 rounded-lg bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-cyan-500"
              >
                {TRACKS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {(err) && <div className="text-xs text-rose-300">{err}</div>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
            onClick={save}
            disabled={saving || uploading}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Check size={16} className="inline me-1" />{" "}
            {saving ? "پاشەکەوت دەکرێت..." : "پاشەکەوت"}
          </motion.button>
        </div>

        {/* Security / Quick actions */}
        <div className="rounded-2xl ring-1 ring-white/10 bg-zinc-900/80 backdrop-blur p-5 space-y-4">
          <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 text-xs text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BadgeCheck size={14} className={user?.emailVerified ? "text-emerald-300" : "text-amber-300"} />
              {user?.emailVerified ? "ئیمەیل پشتڕاستکراوە" : "پشتڕاست‌نەکراوە"}
            </span>
            {!user?.emailVerified && (
              <button onClick={resendVerify} className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700">
                ناردنی پشتڕاستکردنەوە
              </button>
            )}
          </div>

          <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 text-xs text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-violet-300" /> گۆڕینی وشەی نهێنی
            </span>
            <button onClick={sendReset} className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700">
              ناردنی بەستەری گۆڕین
            </button>
          </div>

          <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-cyan-300" />
              <span>جۆری هاتنەژوور: {providerBadges.length ? providerBadges : "—"}</span>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-zinc-400" />
                <span>دروستکردن: {fmtDate(user?.metadata?.creationTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-zinc-400" />
                <span>دواکەوتنە ژوورەوە: {fmtDate(user?.metadata?.lastSignInTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 sm:col-span-2">
                <IdCard size={14} className="text-violet-300" />
                <span className="truncate">UID: {user?.uid || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help / Sign out */}
        <div className="rounded-2xl ring-1 ring-white/10 bg-zinc-900/80 backdrop-blur p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-zinc-100 font-bold flex items-center gap-2">
              یارمەتی خێرا
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              تکایە ناو، وێنە، پۆل و لقنوێ بکە و پاشەکەوت بکە. ئەگەر کێشەت هەبوو، دەتوانیت دای‌بنێیتەوە.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={doLogout}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-2 self-end"
            title="دەرچوون"
          >
            <LogOut size={16} />
            دەرچوون
          </motion.button>
        </div>
      </div>

      {/* Loading skeleton */}
      <AnimatePresence>
        {boot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-items-center z-40"
          >
            <div className="rounded-2xl bg-zinc-900/80 ring-1 ring-white/10 p-5 text-zinc-200 text-sm">
              بارکردن...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
