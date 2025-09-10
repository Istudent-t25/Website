import React from "react";
import {
  Atom,
  Sigma,
  FlaskConical,
  Activity,
  Languages,
  BookOpen,
  MoonStar,
  History as HistoryIcon,
  TrendingUp,
  Globe,
} from "lucide-react";

export default function SubjectIcon({ name = "", className = "w-6 h-6" }) {
  const n = (name || "").toLowerCase();

  // Math (scientific + literary)
  if (/(^|\b)(math|mathematics|بیرکاری وێژەیی|بیرکاری)(\b|$)/.test(n))
    return <Sigma className={className} />;

  // Chemistry
  if (/chem|chemy|کیمیا/.test(n)) return <FlaskConical className={className} />;

  // Physics
  if (/phys|physics|فیز/.test(n)) return <Atom className={className} />;

  // Biology
  if (/bio|biology|زیند/.test(n)) return <Activity className={className} />;

  // Languages
  if (/english|ingliz|eng/.test(n)) return <Languages className={className} />;
  if (/kurd|kurdish|کورد/.test(n)) return <BookOpen className={className} />;
  if (/arab|عەرەب/.test(n)) return <Languages className={className} />;
  if (/islam|ئێسلام|ئسلام|دین/.test(n)) return <MoonStar className={className} />;

  // Humanities
  if (/history|مێژوو/.test(n)) return <HistoryIcon className={className} />;
  if (/econom/.test(n)) return <TrendingUp className={className} />;
  if (/geo|geograph|جووگراف/.test(n)) return <Globe className={className} />;

  return <BookOpen className={className} />;
}
