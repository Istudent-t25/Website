// Settings.jsx — profile & app preferences
// - Avatar, name, grade + track, theme toggle, language
// - RTL-friendly, dark, mobile-first

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Camera, Moon, Sun, Globe, GraduationCap, Check } from "lucide-react";

const GRADES = ["7","8","9","10","11","12"];
const TRACKS = ["زانستی","ئەدەبی","گشتی"];
const LANGS = [
  { key:"ku", label:"Kurdî" },
  { key:"en", label:"English" },
  { key:"ar", label:"العربية" },
];

export default function Settings() {
  const [name, setName] = useState("خوێندکار");
  const [grade, setGrade] = useState("12");
  const [track, setTrack] = useState("زانستی");
  const [lang, setLang] = useState("ku");
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
  const [avatar, setAvatar] = useState("");

  const applyTheme = (v)=>{
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    // mobile browser bar color
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name","theme-color"); document.head.appendChild(meta); }
    meta.setAttribute("content", v ? "#0a0a0b" : "#ffffff");
  };

  const onAvatar = (e)=>{
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatar(url);
  };

  const save = ()=>{
    // TODO: call your API
    alert("پاشەکەوت کرا ✅");
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-indigo-950/40 via-zinc-950/60 to-zinc-950/60 ring-1 ring-white/10 p-5">
        <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-10 -bottom-16 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-50 flex items-center gap-2">
            <User className="text-sky-300" size={20}/> هەڵبژاردنەکانی پرۆفایل
          </h2>
          <p className="text-zinc-400 text-sm mt-1">ناو، وێنە، پۆل/لەق، زمان و ڕووناکی.</p>
        </div>
      </div>

      {/* profile card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl ring-1 ring-white/10 bg-zinc-900 p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatar || "https://placehold.co/160x160/0a0a0b/ffffff?text=Avatar"}
                alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover ring-1 ring-white/10"
              />
              <label className="absolute -bottom-2 -left-2 bg-sky-600 hover:bg-sky-700 text-white p-2 rounded-xl cursor-pointer">
                <Camera size={16}/>
                <input type="file" accept="image/*" className="hidden" onChange={onAvatar}/>
              </label>
            </div>
            <div className="flex-1">
              <label className="text-sm text-zinc-400">ناو</label>
              <input
                value={name}
                onChange={e=>setName(e.target.value)}
                className="mt-1 w-full p-2 rounded-lg bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-zinc-400">پۆل</label>
              <select value={grade} onChange={e=>setGrade(e.target.value)}
                className="mt-1 w-full p-2 rounded-lg bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-sky-500">
                {GRADES.map(g=><option key={g} value={g}>پۆلی {g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-zinc-400">لەق</label>
              <select value={track} onChange={e=>setTrack(e.target.value)}
                className="mt-1 w-full p-2 rounded-lg bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-sky-500">
                {TRACKS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* preferences */}
        <div className="rounded-2xl ring-1 ring-white/10 bg-zinc-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-200">
              <Moon className="text-amber-300" size={18}/>
              <span>ڕوکاری تاریک</span>
            </div>
            <button
              onClick={()=>applyTheme(!dark)}
              className={`px-3 py-1.5 rounded-full text-sm ring-1 ${dark ? "bg-amber-500/20 text-amber-300 ring-amber-500/30" : "bg-zinc-800 text-zinc-200 ring-white/10"}`}
            >
              {dark ? "چالاکە" : "ناچالاکە"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-200">
              <Globe className="text-sky-300" size={18}/>
              <span>زمان</span>
            </div>
            <div className="flex items-center gap-2">
              {LANGS.map(l=>(
                <button key={l.key}
                  onClick={()=>setLang(l.key)}
                  className={`px-3 py-1.5 rounded-full text-sm ring-1 ${lang===l.key ? "bg-sky-600 text-white ring-sky-500/40" : "bg-zinc-800 text-zinc-200 ring-white/10"}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-200">
              <GraduationCap className="text-emerald-300" size={18}/>
              <span>پەیامەکانی خوێندن</span>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer"/>
              <span className="w-11 h-6 bg-zinc-700 peer-checked:bg-emerald-600 rounded-full relative transition">
                <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:right-5"/>
              </span>
            </label>
          </div>
        </div>

        {/* callout */}
        <div className="rounded-2xl ring-1 ring-white/10 bg-zinc-900 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-zinc-100 font-bold">کورتە</h3>
            <p className="text-zinc-400 text-sm mt-1">
              ئەم ڕێکخستنە پاشەکەوت دەکرێن لە ناوەڕۆکی ناوخۆی ئەپ. دواتر دەتوانیت پەیوەست بکەیت بە سێرڤەر/API.
            </p>
          </div>
          <motion.button
            whileTap={{scale:0.98}} whileHover={{y:-1}}
            onClick={save}
            className="self-start mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Check size={16} className="inline me-1"/> پاشەکەوت
          </motion.button>
        </div>
      </div>
    </div>
  );
}
