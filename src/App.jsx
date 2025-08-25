// App.jsx – Full, smooth, and lightweight (RTL, single-scroll, mobile-perfect)
// - One scroll area (main) to avoid double scrollbars
// - Real 100vh on mobile with --vh fix
// - Subtle Framer Motion animations tuned for performance
// - Header border removed (kept a very soft shadow for depth)
// - Mobile drawer locks body scroll to prevent background jitter

import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import ExamsGrade12 from "./pages/ExamsGrade12.jsx";
import Schedule from "./pages/Schedule.jsx";
import SoundsPage from "./pages/Sounds.jsx";
import GrammarPage from "./pages/Grammers.jsx";

import LoginModal from "./components/LoginModal.jsx";
import RegisterModal from "./components/RegisterModal.jsx";
import UserDetailsModal from "./components/UserDetailsModal.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import SplashScreen from "./components/SplashScreen.jsx";

function App() {
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  // ===== UI state =====
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // ===== Auth state =====
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token") || "");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bypassAuth] = useState(true);
  const isAuthenticated = Boolean(accessToken && user);

  // ===== Modal states =====
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showProtectedRouteWarning, setShowProtectedRouteWarning] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [registeredStudentId, setRegisteredStudentId] = useState(null);

  // ===== Mobile viewport height fix (real 100vh) =====
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  // ===== Lock body scroll when mobile drawer is open =====
  useEffect(() => {
    if (sidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [sidebarOpen]);

  const closeModal = useCallback(() => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowUserDetailsModal(false);
    setShowProtectedRouteWarning(false);
    setWarningText("");
  }, []);

  const openLoginModal = useCallback(() => {
    setShowRegisterModal(false);
    setShowUserDetailsModal(false);
    setShowLoginModal(true);
    setSidebarOpen(false);
  }, []);

  const openRegisterModal = useCallback(() => {
    setShowLoginModal(false);
    setShowUserDetailsModal(false);
    setShowRegisterModal(true);
    setSidebarOpen(false);
  }, []);

  const openUserDetailsModal = useCallback(() => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowUserDetailsModal(true);
    setSidebarOpen(false);
  }, []);

  const handleOpenLoginWarning = useCallback(
    (msg) => {
      setWarningText(msg || "تکایە بچۆ ژوورەوە بۆ ئەم پەڕەیە (Login required).");
      setShowProtectedRouteWarning(true);
      openLoginModal();
    },
    [openLoginModal]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    setAccessToken("");
    setUser(null);
  }, []);

  const handleSignupSuccess = useCallback(
    (userData) => {
      const studentId = userData.id || userData.studentId;
      if (studentId) {
        setRegisteredStudentId(studentId);
        openUserDetailsModal();
      } else {
        closeModal();
      }
    },
    [closeModal, openUserDetailsModal]
  );

  const handleSaveUserDetails = useCallback(
    (details) => {
      setUser({ id: registeredStudentId, name: "New User", ...details });
      setRegisteredStudentId(null);
      closeModal();
    },
    [closeModal, registeredStudentId]
  );

  // ===== Delay auth fetch until splash ends & app fading in =====
  useEffect(() => {
    if (!showSplash && appReady) {
      const fetchUser = async () => {
        if (!accessToken) {
          setAuthLoading(false);
          return;
        }
        try {
          const res = await fetch("http://134.209.212.209:8000/student/v1/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Client-Type": "student",
            },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else if (res.status === 401) {
            localStorage.removeItem("access_token");
            setAccessToken("");
            setUser(null);
          }
        } catch (e) {
          console.error("Failed to fetch user:", e);
        } finally {
          setAuthLoading(false);
        }
      };
      fetchUser();
    }
  }, [accessToken, showSplash, appReady]);

  const handleSplashEnd = useCallback(() => {
    setShowSplash(false);
    setTimeout(() => setAppReady(true), 40); // tiny delay for smoothness
  }, []);

  // ===== Splashes / busy states =====
  if (showSplash) return <SplashScreen onAnimationEnd={handleSplashEnd} />;

  if (!appReady || authLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(var(--vh, 1vh) * 100)" }}>
        <p className="text-gray-500">جارێک چاوەڕوان بە...</p>
      </div>
    );
  }

  // ===== Animation helpers (reduced motion aware) =====
  const headerMotion = prefersReduced
    ? { initial: false, animate: false, transition: { duration: 0 } }
    : { initial: { y: -12, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.28, ease: "easeOut" } };

  const pageMotion = prefersReduced
    ? { initial: false, animate: false, exit: false, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.22, ease: "easeOut" } };

  const drawerMotion = prefersReduced
    ? { initial: false, animate: false, exit: false }
    : { initial: { x: 320 }, animate: { x: 0 }, exit: { x: 320 }, transition: { type: "spring", stiffness: 380, damping: 32 } };

  // ===== Main app =====
  return (
    <div
      dir="rtl"
      
      className={`relative isolate bg-white text-gray-800`}
      style={{ height: "calc(var(--vh, 1vh) * 100)" }}
    >
      {!prefersReduced && (
        <motion.div
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full"
          animate={{ y: [0, 10, 0], x: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        />
      )}

      <div className="flex h-full w-full overflow-hidden ">
        {/* Desktop Sidebar (fixed width; own scroll) */}
        <motion.aside
          className="hidden md:block w-84 h-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70"
          initial={prefersReduced ? false : { x: 40, opacity: 0 }}
          animate={prefersReduced ? false : { x: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="h-full overflow-y-auto custom-scroll p-0">
            <Sidebar
              isOpen
              onClose={() => {}}
              user={user}
              onLogout={handleLogout}
              openLoginModal={openLoginModal}
              openRegisterModal={openRegisterModal}
            />
          </div>
        </motion.aside>

        {/* Content column (ONLY scrollable area) */}
        <section className="flex flex-1 h-full min-w-0 flex-col">
          {/* Sticky header without border (soft shadow only) */}
          <motion.div
            {...headerMotion}
          >
            <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
          </motion.div>

          {/* Main scroll area */}
          <main className="flex-1 min-h-0 overflow-y-auto custom-scroll p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname} className="w-full" {...pageMotion}> {/* Removed mx-auto max-w-6xl */}
                <Routes location={location}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/sounds" element={<SoundsPage />} />
                  <Route path="/grammar/:lang" element={<GrammarPage />} />

                  <Route
                    path="/students/:grade"
                    element={
                      bypassAuth ? (
                        <Students />
                      ) : (
                        <ProtectedRoute
                          isAuthenticated={isAuthenticated}
                          openLoginModal={handleOpenLoginWarning}
                          warningMessage="تکایە بچۆ ژوورەوە بۆ بینینی فهرستی خوێندکاران."
                        >
                          <Students />
                        </ProtectedRoute>
                      )
                    }
                  />

                  <Route
                    path="/exams/grade12"
                    element={
                      bypassAuth ? (
                        <ExamsGrade12 />
                      ) : (
                        <ProtectedRoute
                          isAuthenticated={isAuthenticated}
                          openLoginModal={handleOpenLoginWarning}
                          warningMessage="تکایە بچۆ ژوورەوە بۆ تاقیکردنەوەکان."
                        >
                          <ExamsGrade12 />
                        </ProtectedRoute>
                      )
                    }
                  />

                  <Route
                    path="/schedule"
                    element={
                      bypassAuth ? (
                        <Schedule />
                      ) : (
                        <ProtectedRoute
                          isAuthenticated={isAuthenticated}
                          openLoginModal={handleOpenLoginWarning}
                          warningMessage="تکایە بچۆ ژوورەوە بۆ ڕوژنامە."
                        >
                          <Schedule />
                        </ProtectedRoute>
                      )
                    }
                  />

                  <Route path="*" element={<p className="text-center text-red-500">هەڵە: پەڕە نەدۆزرایەوە</p>} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </section>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={prefersReduced ? false : { opacity: 1 }}
            exit={prefersReduced ? false : { opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 "
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={prefersReduced ? false : { opacity: 1 }}
              exit={prefersReduced ? false : { opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto custom-scroll"
              initial={prefersReduced ? false : { x: 320 }}
              animate={prefersReduced ? false : { x: 0 }}
              exit={prefersReduced ? false : { x: 320 }}
              transition={prefersReduced ? undefined : { type: "spring", stiffness: 380, damping: 32 }}
            >
              <Sidebar
                isOpen
                onClose={() => setSidebarOpen(false)}
                user={user}
                onLogout={handleLogout}
                openLoginModal={openLoginModal}
                openRegisterModal={openRegisterModal}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeModal}
        onSwitchToRegister={openRegisterModal}
        onLoginSuccess={({ accessToken }) => {
          localStorage.setItem("access_token", accessToken);
          setAccessToken(accessToken);
          closeModal();
        }}
        showProtectedRouteWarning={showProtectedRouteWarning}
        warningText={warningText}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={closeModal}
        onSwitchToLogin={openLoginModal}
        onSignupSuccess={handleSignupSuccess}
      />

      <UserDetailsModal
        isOpen={showUserDetailsModal}
        onClose={closeModal}
        onSaveDetails={handleSaveUserDetails}
        studentId={registeredStudentId}
      />
    </div>
  );
}

export default App;
