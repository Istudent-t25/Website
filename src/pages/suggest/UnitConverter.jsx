// src/pages/UnitConverter.jsx — Ultra Converter + Categories Sidebar (RTL, Dark, Tailwind, Framer Motion)
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Search, RefreshCcw, Copy, Star, StarOff, Clock3,
  ArrowLeftRight, Wand2, ChevronRight, ArrowRight, Database,
  Ruler, Thermometer, Square, Beaker, Weight, Clock, Gauge, Activity, Zap, BatteryCharging, ArrowLeft
} from "lucide-react";
// If you're using react-router, uncomment the next line.
// import { useNavigate } from "react-router-dom";

/* ---------------------------- Helpers / Storage ---------------------------- */
const storage = (() => {
  try { const k="__t"; localStorage.setItem(k,"1"); localStorage.removeItem(k); return localStorage; }
  catch { let mem={}; return { getItem:k=>mem[k]??null, setItem:(k,v)=>{mem[k]=String(v)}, removeItem:k=>{delete mem[k]} }; }
})();
const lsGet = (k, fb) => { try { const v=storage.getItem(k); return v==null?fb:JSON.parse(v); } catch { return fb; } };
const lsSet = (k, v) => { try { storage.setItem(k, JSON.stringify(v)); } catch {} };
const nf = (locale="ku-IQ", max=8) => new Intl.NumberFormat(locale, { maximumFractionDigits: max });

/* ---------------------------- Conversion Models ---------------------------- */
const MODELS = {
  length: {
    title: "درێژی",
    base: "m",
    units: { km:1e3, m:1, cm:1e-2, mm:1e-3, μm:1e-6, nm:1e-9, mi:1609.344, yd:0.9144, ft:0.3048, in:0.0254 },
    labels:{ km:"کیلۆمەتر", m:"مەتر", cm:"سەنتیمەتر", mm:"میلیمەتر", μm:"میکرۆم", nm:"نانۆم", mi:"مایل", yd:"یارد", ft:"فوت", in:"ئینچ" }
  },
  mass: {
    title: "كێش",
    base: "kg",
    units: { t:1000, kg:1, g:1e-3, mg:1e-6, μg:1e-9, lb:0.45359237, oz:0.028349523125 },
    labels:{ t:"تەن", kg:"كیلوگرام", g:"گرام", mg:"میلیگرام", μg:"میکرۆگرام", lb:"پاوند", oz:"ئۆنس" }
  },
  area: {
    title: "ڕووبەر",
    base: "m2",
    units: { km2:1e6, m2:1, cm2:1e-4, mm2:1e-6, ha:1e4, acre:4046.8564224 },
    labels:{ km2:"کیلۆمەترە ڕەبع", m2:"مەترە ڕەبع", cm2:"سەنتیمەترە ڕەبع", mm2:"میلیمەترە ڕەبع", ha:"هەکتار", acre:"ئەیکەر" }
  },
  volume: {
    title: "قەبارە",
    base: "m3",
    units: { m3:1, L:1e-3, mL:1e-6, ft3:0.028316846592, in3:1.6387064e-5, gal:0.003785411784 },
    labels:{ m3:"مەترە مكعب", L:"لیتر", mL:"میلی لیتر", ft3:"فوت مكعب", in3:"ئینچ مكعب", gal:"گالۆن (US)" }
  },
  temperature: {
    title: "پلەی گەرمی",
    affine: true,
    units: ["C","F","K"],
    labels:{ C:"سێنتیگراد (°C)", F:"فاهرنهایت (°F)", K:"كێلوڤین (K)" },
    toK: (v,u)=>(u==="C"? v+273.15 : u==="F"? (v-32)*5/9+273.15 : v),
    fromK:(k,u)=>(u==="C"? k-273.15 : u==="F"? (k-273.15)*9/5+32 : k)
  },
  time: {
    title: "کات",
    base: "s",
    units: { d:86400, h:3600, min:60, s:1, ms:1e-3, μs:1e-6, wk:604800, mo:2629800, yr:31557600 },
    labels:{ wk:"هەفتە", d:"ڕۆژ", h:"كاتژمێر", min:"خولەک", s:"چرکە", ms:"میلی چرکە", μs:"میکرۆ چرکە", mo:"مانگ (~30.44 ڕۆژ)", yr:"ساڵ (~365.25 ڕۆژ)" }
  },
  speed: {
    title: "خێرایی",
    base: "m/s",
    units: { "m/s":1, "km/h":(1000/3600), "mph":0.44704, "kn":0.514444, "ft/s":0.3048 },
    labels:{ "m/s":"مەتر/چرکە", "km/h":"كیلۆ/كاتژمێر", "mph":"مایل/كاتژمێر", kn:"نات", "ft/s":"فوت/چرکە" }
  },
  pressure: {
    title: "دەپڕێس",
    base: "Pa",
    units: { Pa:1, kPa:1e3, MPa:1e6, bar:1e5, atm:101325, mmHg:133.3223684211, psi:6894.757293168 },
    labels:{ Pa:"پاسكال", kPa:"كیلو پاسكال", MPa:"مەگا پاسكال", bar:"بار", atm:"ئەتەمۆسفێر", mmHg:"mmHg", psi:"psi" }
  },
  energy: {
    title: "وزە",
    base: "J",
    units: { J:1, kJ:1e3, MJ:1e6, Wh:3600, kWh:3.6e6, cal:4.184, kcal:4184, BTU:1055.05585262 },
    labels:{ J:"ژول", kJ:"كیلو ژول", MJ:"مەگا ژول", Wh:"وات-كاتژمێر", kWh:"كیلو وات-كاتژمێر", cal:"كەلۆری", kcal:"كیلوكەلۆری", BTU:"BTU" }
  },
  power: {
    title: "توان",
    base: "W",
    units: { W:1, kW:1e3, MW:1e6, hp:745.6998715823 },
    labels:{ W:"وات", kW:"كیلو وات", MW:"مەگا وات", hp:"هۆرس پاوەر" }
  },
  data: {
    title: "داتا",
    base: "B",
    unitsSI: { B:1, kB:1e3, MB:1e6, GB:1e9, TB:1e12 },
    unitsIEC:{ B:1, KiB:1024, MiB:1024**2, GiB:1024**3, TiB:1024**4 },
    labels:{ B:"بایت", kB:"كیلوبایت", MB:"مەگابایت", GB:"گیگابایت", TB:"تێرابایت", KiB:"كیبیبایت", MiB:"مێبیبایت", GiB:"گیبیبایت", TiB:"تیبیبایت" }
  }
};

/* ---------------------------- Conversion Engine ---------------------------- */
function convert(category, from, to, value, opts = { dataMode: "SI" }) {
  const v = Number(value);
  if (!isFinite(v)) return NaN;

  if (category === "temperature") {
    const k = MODELS.temperature.toK(v, from);
    return MODELS.temperature.fromK(k, to);
  }
  if (category === "data") {
    const table = opts.dataMode === "IEC" ? MODELS.data.unitsIEC : MODELS.data.unitsSI;
    const any   = { ...MODELS.data.unitsIEC, ...MODELS.data.unitsSI };
    const fromF = any[from]; const toF = any[to];
    if (!fromF || !toF) return NaN;
    return v * fromF / toF;
  }

  const m = MODELS[category];
  if (!m) return NaN;
  const fromF = m.units[from], toF = m.units[to];
  if (fromF == null || toF == null) return NaN;
  return v * fromF / toF;
}

/* ---------------------------- Quick Parse ---------------------------- */
const arrowRx = /\s(?:to|→|->)\s/i;
function quickParse(s) {
  const t = (s||"").trim();
  if (!t || !arrowRx.test(t)) return null;
  const [lhs, rhs] = t.split(arrowRx);
  const m = lhs.match(/^\s*([-+]?[\d.,]+)\s*([^\s]+)\s*$/);
  if (!m) return null;
  const value = Number(m[1].replace(/,/g,"."));
  const from = m[2]; const to = rhs.trim();
  if (!isFinite(value)) return null;
  return { value, from, to };
}

/* ---------------------------- Modern Select ---------------------------- */
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    function onClick(e) { if (!ref.current || ref.current.contains(e.target)) return; handler(); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, handler]);
}
const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function ModernSelect({
  value, onChange, options, placeholder = "هەڵبژاردن",
  searchable = true, className = "", size = "md"
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const boxRef = useRef(null);
  const btnRef = useRef(null);
  useOnClickOutside(boxRef, () => setOpen(false));

  const current = options.find(o => String(o.value) === String(value));
  const fontSize = size==="lg" ? "text-base" : "text-sm";
  const padY = size==="lg" ? "py-3.5" : "py-3";

  if (isMobile) {
    return (
      <div className={`relative w-full ${className}`}>
        <select
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          className={`appearance-none w-full pr-3 pl-10 ${padY} rounded-xl 
                     bg-zinc-900/80 border border-white/10 text-white ${fontSize}
                     focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
        >
          {!current && <option value="" disabled>{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value} className="bg-zinc-900 text-white">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18}/>
      </div>
    );
  }

  const filtered = !term.trim()
    ? options
    : options.filter(o => o.label.toLowerCase().includes(term.toLowerCase()) || String(o.value).toLowerCase().includes(term.toLowerCase()));

  const handleKey = (e) => {
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault(); setOpen(true);
    } else if (open && e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className={`relative w-full ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={()=>setOpen(o=>!o)}
        onKeyDown={handleKey}
        className={`w-full pr-3 pl-10 ${padY} rounded-xl text-left
                    bg-zinc-900/80 border border-white/10 text-white ${fontSize}
                    hover:border-white/20 focus:outline-none
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`}
        title={current?.label || placeholder}
      >
        <span className="truncate">{current?.label || <span className="text-zinc-400">{placeholder}</span>}</span>
      </button>
      <ChevronDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl"
          >
            {searchable && (
              <div className="p-2 border-b border-white/10">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                  <input
                    autoFocus
                    value={term}
                    onChange={(e)=>setTerm(e.target.value)}
                    placeholder="گەڕان..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-auto p-1">
              {filtered.map((o) => (
                <button
                  key={o.value}
                  onClick={()=>{ onChange(o.value); setOpen(false); setTerm(""); }}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm
                              hover:bg-white/5 ${String(o.value)===String(value) ? "bg-white/10 text-white" : "text-zinc-200"}`}
                  title={o.label}
                >
                  <span className="truncate">{o.label}</span>
                </button>
              ))}
              {filtered.length===0 && (
                <div className="px-3 py-3 text-sm text-zinc-400">هیچ هەڵبژاردنێک نییە</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------- Sidebar UI bits ---------------------------- */
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm shadow-md ${className}`}>{children}</div>
);

const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all
      flex items-center justify-center gap-2
      ${active
        ? "bg-blue-600/20 border-blue-500/30 text-blue-300"
        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}
    title="هاوپۆل"
  >
    {children}
  </button>
);

/* ---------------------------- Page ---------------------------- */
export default function UnitConverter() {
  // const navigate = useNavigate(); // if you use react-router
  const back = () => {
    try { window.history.length > 1 ? window.history.back() : null; } catch {}
    // If using navigate: navigate(-1);
  };

  const [category, setCategory] = useState(lsGet("uc_category","length"));
  const [from, setFrom]         = useState(lsGet("uc_from","m"));
  const [to, setTo]             = useState(lsGet("uc_to","km"));
  const [value, setValue]       = useState(lsGet("uc_value","1"));
  const [dataMode, setDataMode] = useState(lsGet("uc_dataMode","SI")); // SI | IEC
  const [history, setHistory]   = useState(lsGet("uc_history",[]));
  const [favorites, setFavorites]=useState(lsGet("uc_favs",[]));
  const [quick, setQuick]       = useState("");

  useEffect(()=>{ lsSet("uc_category",category); },[category]);
  useEffect(()=>{ lsSet("uc_from",from); },[from]);
  useEffect(()=>{ lsSet("uc_to",to); },[to]);
  useEffect(()=>{ lsSet("uc_value",String(value)); },[value]);
  useEffect(()=>{ lsSet("uc_dataMode",dataMode); },[dataMode]);
  useEffect(()=>{ lsSet("uc_history",history.slice(0,40)); },[history]);
  useEffect(()=>{ lsSet("uc_favs",favorites.slice(0,30)); },[favorites]);

  // Build unit options from category
  const { unitOptions, unitLabels } = useMemo(()=>{
    if (category==="temperature") {
      const arr = MODELS.temperature.units.map(u => ({ value:u, label:MODELS.temperature.labels[u] }));
      return { unitOptions: arr, unitLabels: MODELS.temperature.labels };
    } else if (category==="data") {
      const table = { ...MODELS.data.unitsIEC, ...MODELS.data.unitsSI };
      const opts = Object.keys(table).map(k=>({ value:k, label: MODELS.data.labels[k]||k }));
      const order = ["B","kB","MB","GB","TB","KiB","MiB","GiB","TiB"];
      opts.sort((a,b) => (order.indexOf(a.value) - order.indexOf(b.value)));
      return { unitOptions: opts, unitLabels: MODELS.data.labels };
    } else {
      const m = MODELS[category];
      const opts = Object.keys(m.units).map(k=>({ value:k, label: m.labels[k]||k }));
      opts.sort((a,b)=> (m.units[b.value]-m.units[a.value]) || String(m.labels[a.value]).localeCompare(m.labels[b.value],"ku"));
      return { unitOptions: opts, unitLabels: m.labels };
    }
  },[category]);

  // Ensure from/to exist on category change
  useEffect(()=>{
    const vals = unitOptions.map(o=>o.value);
    if (!vals.includes(from)) setFrom(vals[0]);
    if (!vals.includes(to))   setTo(vals[Math.min(1, vals.length-1)]);
    // eslint-disable-next-line
  },[unitOptions]);

  const result = useMemo(()=> convert(category, from, to, value, { dataMode }), [category, from, to, value, dataMode]);

  const swap = () => { const a=from,b=to; setFrom(b); setTo(a); };
  const copyResult = async () => { try { await navigator.clipboard.writeText(String(result)); } catch {} };

  const addHistory = useCallback((src)=> {
    const row = { t: Date.now(), ...src };
    setHistory(h=> [row, ...h.filter(r => !(r.category===row.category && r.from===row.from && r.to===row.to && String(r.value)===String(row.value)))].slice(0,40));
  },[]);
  useEffect(()=> {
    if (!isFinite(Number(value))) return;
    if (!from || !to) return;
    addHistory({ category, from, to, value });
    // eslint-disable-next-line
  }, [category, from, to]);

  const toggleFav = () => {
    const key = `${category}|${from}|${to}`;
    setFavorites(f => f.includes(key) ? f.filter(k=>k!==key) : [key, ...f]);
  };
  const isFav = favorites.includes(`${category}|${from}|${to}`);

  const runQuick = () => {
    const parsed = quickParse(quick);
    if (!parsed) return;
    const cats = Object.keys(MODELS);
    for (const c of cats) {
      if (c==="temperature") {
        const arr = MODELS.temperature.units;
        if (arr.includes(parsed.from) && arr.includes(parsed.to)) {
          setCategory(c); setFrom(parsed.from); setTo(parsed.to); setValue(parsed.value); return;
        }
      } else if (c==="data") {
        const all = new Set([...Object.keys(MODELS.data.unitsSI), ...Object.keys(MODELS.data.unitsIEC)]);
        if (all.has(parsed.from) && all.has(parsed.to)) {
          setCategory(c); setFrom(parsed.from); setTo(parsed.to); setValue(parsed.value); return;
        }
      } else {
        const keys = Object.keys(MODELS[c].units);
        if (keys.includes(parsed.from) && keys.includes(parsed.to)) {
          setCategory(c); setFrom(parsed.from); setTo(parsed.to); setValue(parsed.value); return;
        }
      }
    }
  };

  const formatter = nf("ku-IQ", 8);
  const formatted = Number.isFinite(result) ? formatter.format(result) : "—";

  /* ----- Categories Sidebar config ----- */
  const CATEGORIES = [
    { key: "length",      label: MODELS.length.title,      icon: Ruler },
    { key: "temperature", label: MODELS.temperature.title, icon: Thermometer },
    { key: "area",        label: MODELS.area.title,        icon: Square },
    { key: "volume",      label: MODELS.volume.title,      icon: Beaker },
    { key: "mass",        label: MODELS.mass.title,        icon: Weight },
    { key: "time",        label: MODELS.time.title,        icon: Clock },
    { key: "speed",       label: MODELS.speed.title,       icon: Gauge },
    { key: "pressure",    label: MODELS.pressure.title,    icon: Activity },
    { key: "energy",      label: MODELS.energy.title,      icon: Zap },
    { key: "power",       label: MODELS.power.title,       icon: BatteryCharging },
    { key: "data",        label: MODELS.data.title,        icon: Database },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-950 text-white">
      {/* background flair */}
      <div aria-hidden className="fixed inset-0 -z-10 [background:radial-gradient(900px_500px_at_90%_-10%,rgba(99,102,241,0.14),transparent),radial-gradient(800px_400px_at_10%_110%,rgba(168,85,247,0.12),transparent)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Categories */}
        <Card className="lg:col-span-3 p-4 sticky top-4 self-start">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 grid place-items-center">
                <Wand2 size={18} className="text-white" />
              </div>
              <h2 className="text-lg font-bold">گۆڕەری یەکەکان</h2>
            </div>
            <button
              onClick={back}
              className="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-sm inline-flex items-center gap-2"
              title="گەڕانەوە"
            >
              <ArrowLeft size={16}/> گەڕانەوە
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-1 gap-2">
            {CATEGORIES.map(({key,label,icon:Icon}) => (
              <Chip key={key} active={category===key} onClick={()=>setCategory(key)}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{label}</span>
              </Chip>
            ))}
          </div>

          {category === "data" && (
            <div className="mt-4 flex items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-3">
              <span>ڕێكخستن: SI (kB/MB)</span>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-blue-500 w-4 h-4"
                  checked={dataMode === "IEC"}
                  onChange={(e)=> setDataMode(e.target.checked ? "IEC" : "SI")}
                />
                IEC (KiB/MiB)
              </label>
            </div>
          )}
        </Card>

        {/* Main */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header (Title + Reset + Quick) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 grid place-items-center">
                  <Wand2 size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    {MODELS[category]?.title} — گۆڕینی یه‌كه‌
                  </h1>
                  <p className="text-zinc-400 text-sm">خێرا، ورد، و تەواو — بە هەموو هاوپۆلەکان.</p>
                </div>
              </div>
              <button
                onClick={()=>{ setCategory("length"); setFrom("m"); setTo("km"); setValue("1"); setQuick(""); setDataMode("SI"); }}
                className="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 inline-flex items-center gap-2 text-zinc-200"
                title="ڕیسێت‌کردن"
              >
                <RefreshCcw size={16}/> ڕیسێت‌کردن
              </button>
            </div>
          </div>

          {/* Converter Card */}
          <motion.div
            initial={{ opacity:0, y:8}}
            animate={{ opacity:1, y:0}}
            className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 md:p-6"
          >
            {/* On small screens, show category selector (since sidebar stacks) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 items-center lg:hidden">
              <div className="md:col-span-1">
                <label className="text-sm text-zinc-400 mb-1 block">هاوپۆل</label>
                <ModernSelect
                  value={category}
                  onChange={setCategory}
                  options={Object.entries(MODELS).map(([k,v])=>({ value:k, label:v.title }))}
                  size="lg"
                />
              </div>

              {category==="data" && (
                <div className="md:col-span-1">
                  <label className="text-sm text-zinc-400 mb-1 block">ڕێژە</label>
                  <ModernSelect
                    value={dataMode}
                    onChange={setDataMode}
                    options={[{value:"SI", label:"SI (kB, MB, GB)"},{value:"IEC", label:"IEC (KiB, MiB, GiB)"}]}
                  />
                </div>
              )}

              <div className="md:col-span-1">
                <label className="text-sm text-zinc-400 mb-1 block">بەها</label>
                <input
                  inputMode="decimal"
                  value={value}
                  onChange={(e)=> setValue(e.target.value.replace(/[^\d.,-]/g,""))}
                  className="w-full px-3 py-3 rounded-xl bg-zinc-900/80 border border-white/10 text-white text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>

              <div className="md:col-span-1 flex items-end">
                <button
                  onClick={toggleFav}
                  className={`w-full px-3 py-3 rounded-xl border inline-flex items-center justify-center gap-2
                    ${isFav ? "border-amber-500/40 bg-amber-500/15 text-amber-200" : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"}`}
                  title="زیادکردن بۆ دڵخواز"
                >
                  {isFav ? <Star size={16} className="fill-current"/> : <StarOff size={16}/>}
                  دڵخواز
                </button>
              </div>
            </div>

            {/* Units Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 mt-2">
              <div className="md:col-span-2">
                <label className="text-sm text-zinc-400 mb-1 block">لە یەکە</label>
                <ModernSelect value={from} onChange={setFrom} options={unitOptions} size="lg"/>
              </div>

              <div className="md:col-span-1 flex items-end justify-center">
                <button
                  onClick={swap}
                  className="w-full md:w-auto px-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 inline-flex items-center justify-center gap-2"
                  title="گۆڕین"
                >
                  <ArrowLeftRight size={16}/> گۆڕین
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-zinc-400 mb-1 block">بۆ یەکە</label>
                <ModernSelect value={to} onChange={setTo} options={unitOptions} size="lg"/>
              </div>
            </div>

            {/* Value + Fav (desktop, nicely aligned under units) */}
            <div className="hidden lg:grid grid-cols-5 gap-4 mt-4">
              <div className="col-span-2">
                <label className="text-sm text-zinc-400 mb-1 block">بەها</label>
                <input
                  inputMode="decimal"
                  value={value}
                  onChange={(e)=> setValue(e.target.value.replace(/[^\d.,-]/g,""))}
                  className="w-full px-3 py-3 rounded-xl bg-zinc-900/80 border border-white/10 text-white text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
              <div className="col-span-1" />
              <div className="col-span-2 flex items-end">
                <button
                  onClick={toggleFav}
                  className={`w-full px-3 py-3 rounded-xl border inline-flex items-center justify-center gap-2
                    ${isFav ? "border-amber-500/40 bg-amber-500/15 text-amber-200" : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"}`}
                  title="زیادکردن بۆ دڵخواز"
                >
                  {isFav ? <Star size={16} className="fill-current"/> : <StarOff size={16}/>}
                  دڵخواز
                </button>
              </div>
            </div>

            {/* Result */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 md:p-6">
              <div className="text-sm text-zinc-400 mb-2">ئەنجام</div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  {formatted}
                </div>
                <div className="text-zinc-300 text-lg"> {unitLabels[to] || to}</div>
                <button
                  onClick={copyResult}
                  className="ml-auto px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 inline-flex items-center gap-2 text-sm"
                >
                  <Copy size={16}/> کۆپیکردن
                </button>
              </div>
              <div className="mt-2 text-sm text-zinc-400">
                {nf("ku-IQ",8).format(Number(value)||0)} {unitLabels[from]||from} → {unitLabels[to]||to}
              </div>
            </div>
          </motion.div>

          {/* Favorites & History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Favorites */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star size={18} className="text-amber-300"/>
                <h3 className="font-semibold">دڵخوازەکان</h3>
              </div>
              {favorites.length===0 ? (
                <div className="text-sm text-zinc-400">هیچ دڵخوازێك نییە.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {favorites.map((k)=> {
                    const [c,f,t] = k.split("|");
                    const title = `${MODELS[c]?.title||c} • ${f} → ${t}`;
                    return (
                      <button
                        key={k}
                        onClick={()=>{ setCategory(c); setFrom(f); setTo(t); }}
                        className="text-right px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm truncate"
                        title={title}
                      >
                        {title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* History */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock3 size={18} className="text-blue-300"/>
                <h3 className="font-semibold">مێژوو</h3>
              </div>
              {history.length===0 ? (
                <div className="text-sm text-zinc-400">هیچ مێژوویەك نییە.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {history.slice(0,10).map((h,i)=> {
                    const label = `${MODELS[h.category]?.title||h.category} • ${h.value} ${h.from} → ${h.to}`;
                    return (
                      <button
                        key={h.t+"_"+i}
                        onClick={()=>{ setCategory(h.category); setFrom(h.from); setTo(h.to); setValue(h.value); }}
                        className="text-right px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm truncate"
                        title={label}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          {/* <div className="text-xs text-zinc-500 text-center">
            داتا: SI = kB/MB/GB (×1000) • IEC = KiB/MiB/GiB (×1024) — کات/مانگ/ساڵ نزیکەینە.
          </div> */}
        </div>
      </div>
    </div>
  );
}
