import { useEffect, useState } from "react";

const KEY = "grade";

export default function useLocalGrade(defaultGrade = 12) {
  const [grade, setGrade] = useState(() => {
    const g = localStorage.getItem(KEY);
    return g ? Number(g) : defaultGrade;
  });

  useEffect(() => {
    if (grade) localStorage.setItem(KEY, String(grade));
  }, [grade]);

  return [grade, setGrade];
}
