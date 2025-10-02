
import { useEffect, useRef } from "react";

export default function useLocalAppearance() {
  const mqlRef = useRef(null);

  useEffect(() => {
    // font scale
    const fs = localStorage.getItem("fontScale") ?? "1";
    document.documentElement.style.setProperty("--font-scale", fs);

    // accent
    const accent = localStorage.getItem("accent") ?? "#22d3ee";
    document.documentElement.style.setProperty("--accent", accent);

    // theme
    const theme = localStorage.getItem("theme") ?? "system"; // "light" | "dark" | "system"
    const applyTheme = (t) => {
      if (t === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)")?.matches;
        document.documentElement.classList.toggle("dark", !!isDark);
      } else {
        document.documentElement.classList.toggle("dark", t === "dark");
      }
    };
    applyTheme(theme);

    // if system, listen to OS changes
    if (theme === "system") {
      if (!mqlRef.current) {
        mqlRef.current = window.matchMedia("(prefers-color-scheme: dark)");
      }
      const onChange = () => applyTheme("system");
      mqlRef.current.addEventListener?.("change", onChange);
      return () => mqlRef.current?.removeEventListener?.("change", onChange);
    }
  }, []);
}
