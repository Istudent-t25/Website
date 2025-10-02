import { useEffect, useMemo, useState, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged
} from "firebase/auth";
import {
  collection, doc, onSnapshot, addDoc, setDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy, getDoc
} from "firebase/firestore";

/**
 * Firestore structure:
 * users/{uid}/schedule/weekly    -> { data: {...your WEEKLY_DEFAULT}, updatedAt }
 * users/{uid}/homeworks/{id}     -> { subject, title, due, priority, done, createdAt }
 * users/{uid}/events/{id}        -> { title, date, time, place, createdAt }
 */

export default function useFirebaseSchedule() {
  const [user, setUser] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  // paths (avoid re-computing)
  const paths = useMemo(() => {
    if (!user) return null;
    const base = doc(db, "users", user.uid);
    return {
      weeklyDoc: doc(base, "schedule", "weekly"),
      homeworksCol: collection(base, "homeworks"),
      eventsCol: collection(base, "events"),
    };
  }, [user]);

  // 2) live reads
  useEffect(() => {
    if (!paths) { setLoading(false); return; }
    setLoading(true);

    const unsubs = [];

    // weekly schedule doc
    unsubs.push(onSnapshot(paths.weeklyDoc, async (snap) => {
      setWeekly(snap.exists() ? (snap.data().data || {}) : null);
    }));

    // homeworks (ordered)
    unsubs.push(onSnapshot(query(paths.homeworksCol, orderBy("createdAt","desc")), (qs) => {
      setHomeworks(qs.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    // events (ordered by date+time)
    unsubs.push(onSnapshot(query(paths.eventsCol, orderBy("date","asc")), (qs) => {
      setEvents(qs.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    setLoading(false);
    return () => unsubs.forEach(u => u());
  }, [paths]);

  // 3) writers
  const saveWeekly = useCallback(async (data) => {
    if (!paths) throw new Error("No user");
    await setDoc(paths.weeklyDoc, { data, updatedAt: serverTimestamp() }, { merge: true });
  }, [paths]);

  const addHomework = useCallback(async (payload) => {
    if (!paths) throw new Error("No user");
    await addDoc(paths.homeworksCol, {
      ...payload,
      done: !!payload.done,
      createdAt: serverTimestamp(),
    });
  }, [paths]);

  const toggleHomework = useCallback(async (id, done) => {
    if (!paths) throw new Error("No user");
    await updateDoc(doc(paths.homeworksCol, id), { done: !!done });
  }, [paths]);

  const deleteHomework = useCallback(async (id) => {
    if (!paths) throw new Error("No user");
    await deleteDoc(doc(paths.homeworksCol, id));
  }, [paths]);

  const addEvent = useCallback(async (payload) => {
    if (!paths) throw new Error("No user");
    await addDoc(paths.eventsCol, {
      ...payload,
      createdAt: serverTimestamp(),
    });
  }, [paths]);

  const deleteEvent = useCallback(async (id) => {
    if (!paths) throw new Error("No user");
    await deleteDoc(doc(paths.eventsCol, id));
  }, [paths]);

  return {
    user,
    loading,
    weekly, setWeekly: saveWeekly,            // setter writes to Firestore
    homeworks, addHomework, toggleHomework, deleteHomework,
    events, addEvent, deleteEvent,
  };
}
