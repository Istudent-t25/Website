// src/utils/slug.js
const CANONICAL_SUBJECTS = {
  "زیندەزانی": "زینده\u200Cزانی",
  "زینده زانی": "زینده\u200Cزانی",
  "زنده‌زانی": "زینده\u200Cزانی",
  "زینده‌زانی": "زینده\u200Cزانی",
};

export function canonicalSubject(name = "") {
  const n = String(name).trim();
  if (CANONICAL_SUBJECTS[n]) return CANONICAL_SUBJECTS[n];
  // Heuristic: insert ZWNJ after "زینده" when followed by "زانی"
  return n.replace(/زینده(?=زانی)/, "زینده\u200C");
}

export function slug(input = "") {
  return encodeURIComponent(canonicalSubject(input));
}
