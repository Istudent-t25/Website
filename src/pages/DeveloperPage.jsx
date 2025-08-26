// DeveloperProfile.jsx — Full-screen RTL developer profile for Arez (venos)
// Stack: React + Tailwind + Framer Motion + Lucide
// - Hero with avatar, name, title, quick actions (copy email, download CV)
// - Social links row
// - About + quick info (location, email, phone)
// - Skills & tools (chips)
// - Highlighted projects (cards)
// - Contact box (mailto) + public PGP/Key placeholder
// Notes: replace placeholder links/avatars/CV with your real ones.

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Instagram,
  Link2,
  Download,
  Code2,
  ExternalLink,
  FolderCode,
  BadgeCheck,
} from "lucide-react";

const EASE = [0.22, 0.61, 0.36, 1];

// ====== CONFIG (edit these) ==================================================
const PROFILE = {
  name: "Arez (venos)",
  title: "Full-Stack Developer",
  avatar:
    "https://placehold.co/240x240/png?text=Arez%20(venos)", // put your avatar URL
  location: "هەولێر، کوردستان",
  email: "arez@example.com",
  phone: "+964 7xx xxx xxxx",
  website: "https://arez.dev", // or leave empty
  bio: `من ${"Arez (venos)"}م — گەشەپێدەری وێب. حەزم لە دیزاینێکی پاک، کارایی بەرز و ئەپڵیکەیشنی زانستیارەکانە. لەکاتی خۆدا
هەمووشت لە React/Tailwind, Node.js و PostgreSQL دەکەم، و هەوڵ دەدەم کۆدێکی ڕیز و بەتاقەتی بنوسم.`,
  socials: [
    { id: "github", label: "GitHub", href: "https://github.com/venos", icon: Github },
    { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/venos", icon: Linkedin },
    { id: "instagram", label: "Instagram", href: "https://instagram.com/venos", icon: Instagram },
    { id: "website", label: "Website", href: "https://arez.dev", icon: Globe },
  ],
  resumeUrl: "/Arez-CV.pdf", // put your file in public/
};

const SKILLS = {
  main: [
    "JavaScript/TypeScript",
    "React • Next.js",
    "Tailwind CSS",
    "Node.js • Express",
    "PostgreSQL • Prisma",
    "REST • Webhooks",
  ],
  tools: ["Git", "Vite", "Zod", "JWT", "Framer Motion", "Docker (basic)"],
};

const PROJECTS = [
  {
    title: "Exam Bank — Student Tools",
    desc:
      "سیستەمی تاقیکردنەوە و هەڵسەنگاندن بە زمانی کوردی، هەیەتی ڕێکخستنی هەفتانە و ئەرک.",
    tech: ["React", "Tailwind", "Framer Motion"],
    href: "#",
    repo: "#",
  },
  {
    title: "Schedule & Homework",
    desc:
      "خشتەی هەفتانە + ڕووداو + ئەرک، ئامادە بۆ مۆبایل و دێسکتۆپ، پاڵپشتی RTL.",
    tech: ["React", "LocalStorage"],
    href: "#",
    repo: "#",
  },
  {
    title: "Dev Portal Mock",
    desc:
      "پەڕەی گەشەپێدەر، کلیلەکان، وێبهوک، لۆگ و یاریکردنی API (موک).",
    tech: ["React", "Lucide", "Framer Motion"],
    href: "#",
    repo: "#",
  },
];

// ============================================================================

export default function DeveloperPage() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE } },
  };

  const chip =
    "px-2.5 py-1 rounded-full text-[11px] ring-1 ring-white/10 bg-white/5 text-zinc-300";

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-950 to-black text-zinc-100"
    >
      {/* HERO */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-b-3xl bg-gradient-to-l from-indigo-950 via-zinc-950 to-zinc-950 ring-1 ring-white/10 p-4 md:p-8"
      >
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6">
          {/* Avatar */}
          <img
            src={PROFILE.avatar}
            alt={PROFILE.name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl ring-1 ring-white/15 object-cover"
          />

          {/* Name + Actions */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Sparkles size={22} className="text-sky-300" />
              {PROFILE.name}
            </h1>
            <div className="mt-1 text-sky-300 font-semibold">{PROFILE.title}</div>
            <p className="mt-3 text-zinc-300 text-sm leading-7">{PROFILE.bio}</p>

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={copyEmail}
                className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-3 py-2 text-sm inline-flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-300" /> کۆپی کرا
                  </>
                ) : (
                  <>
                    <Mail size={16} /> کۆپی ئیمەیل
                  </>
                )}
              </button>
              {PROFILE.resumeUrl && (
                <a
                  href={PROFILE.resumeUrl}
                  className="rounded-xl bg-sky-600/80 hover:bg-sky-600 px-3 py-2 text-sm text-white inline-flex items-center gap-1"
                >
                  <Download size={16} /> داگرتنی CV
                </a>
              )}
              {PROFILE.website && (
                <a
                  href={PROFILE.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-3 py-2 text-sm inline-flex items-center gap-1"
                >
                  <Globe size={16} /> وێبسایت
                </a>
              )}
            </div>

            {/* Socials */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {PROFILE.socials.map((s) => {
                const Icon = s.icon ?? Link2;
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-sm"
                    title={s.label}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{s.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Info */}
          <div className="w-full lg:w-72 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
            <div className="font-bold text-zinc-100 mb-3">زانیاری خێرا</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-300" />
                <span>{PROFILE.location}</span>
              </li>
              <li className="flex items-center gap-2 break-all">
                <Mail size={16} className="text-sky-300" />
                <span>{PROFILE.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-amber-300" />
                <span>{PROFILE.phone}</span>
              </li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={chip}>فریلانس: بەردەست</span>
              <span className={chip}>هەژمار بار: پاک</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BODY */}
      <div className="px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Skills */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="xl:col-span-5 rounded-3xl bg-zinc-950/70 ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-zinc-100 font-semibold flex items-center gap-2">
                <Code2 size={18} className="text-sky-300" />
                توانایە سەرەکی
              </div>
              <BadgeCheck size={18} className="text-emerald-300" />
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILLS.main.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-xl bg-white/5 ring-1 ring-white/10 text-sm">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 text-zinc-100 font-semibold flex items-center gap-2">
              <FolderCode size={18} className="text-amber-300" />
              ئامراز و فریموەرک
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {SKILLS.tools.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-xl bg-white/5 ring-1 ring-white/10 text-sm">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Projects */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="xl:col-span-7 rounded-3xl bg-zinc-950/70 ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] p-5"
          >
            <div className="text-zinc-100 font-semibold flex items-center gap-2 mb-3">
              <FolderCode size={18} className="text-emerald-300" />
              پڕۆژە هەڵبژێردراوەکان
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROJECTS.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: EASE, delay: i * 0.03 }}
                  viewport={{ once: true }}
                  className="rounded-2xl bg-zinc-900/60 ring-1 ring-white/10 p-4"
                >
                  <div className="text-sm text-zinc-400">{p.tech.join(" • ")}</div>
                  <div className="font-bold text-zinc-100 mt-1">{p.title}</div>
                  <p className="text-sm text-zinc-300 mt-1 leading-6">{p.desc}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {p.href && (
                      <a
                        href={p.href}
                        className="px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-xs inline-flex items-center gap-1"
                        target="_blank"
                        rel="noreferrer"
                      >
                        دیمۆ <ExternalLink size={14} />
                      </a>
                    )}
                    {p.repo && (
                      <a
                        href={p.repo}
                        className="px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-xs inline-flex items-center gap-1"
                        target="_blank"
                        rel="noreferrer"
                      >
                        کۆد <Github size={14} />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact / Footer card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="xl:col-span-12 rounded-3xl bg-zinc-950/70 ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] p-5"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-zinc-100 font-semibold flex items-center gap-2">
                  هاوکاریت پێویستە؟
                </div>
                <p className="text-sm text-zinc-400 mt-1">
                  بۆ کارە فریلانس یاخود هاوکاری پڕۆژەکان پەیوەندیم پێوە بکە. ئیمەیلەکەم بە باشی پاساژ دەکرێت.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${PROFILE.email}`}
                  className="rounded-xl bg-sky-600/80 hover:bg-sky-600 px-3 py-2 text-sm text-white inline-flex items-center gap-1"
                >
                  <Mail size={16} /> ناردنی نامە
                </a>
                {PROFILE.phone && (
                  <a
                    href={`tel:${PROFILE.phone.replace(/\s+/g, "")}`}
                    className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-3 py-2 text-sm inline-flex items-center gap-1"
                  >
                    <Phone size={16} /> پەیوەندی
                  </a>
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-3 text-xs text-zinc-500">
              <span className="px-2 py-0.5 rounded-md bg-white/5 ring-1 ring-white/10">
                Public Key (PGP)‎: ‎<span className="text-zinc-400">—</span>
              </span>
              <span className="ml-2">© {new Date().getFullYear()} {PROFILE.name}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
