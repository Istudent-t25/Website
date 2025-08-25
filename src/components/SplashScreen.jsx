import React, { useState, useEffect, useRef } from 'react';

const SplashScreen = ({ onAnimationEnd }) => {
  const [isVisible, setIsVisible] = useState(true);
  const particlesContainerRef = useRef(null);
  const featureWordsContainerRef = useRef(null);

  const featureWords = ["کتێب", "مه‌لزه‌مه‌", "خشته‌ی", "گرامەر"];

  useEffect(() => {
    // Add meta theme color for a more cohesive mobile experience
    const metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    metaThemeColor.content = '#111827'; // Matches the dark background
    document.head.appendChild(metaThemeColor);

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      body.splash-active {
        margin: 0;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        background-size: 200% 200%;
        animation: backgroundPan 15s ease infinite alternate;
        color: #e5e7eb;
      }

      @keyframes backgroundPan {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }

      #splash-container {
        transform: scale(0.5) rotateY(30deg);
        opacity: 0;
        animation: containerEnter 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        animation-delay: 0.3s;
        position: relative;
        z-index: 10;
      }

      @keyframes containerEnter {
        0% { transform: scale(0.5) rotateY(30deg); opacity: 0; }
        50% { transform: scale(1.1) rotateY(-10deg); opacity: 1; }
        100% { transform: scale(1) rotateY(0deg); opacity: 1; }
      }

      .logo-reveal {
        opacity: 0;
        transform: translateY(30px);
        animation: logoFloat 2s ease-in-out infinite alternate, logoFadeIn 1s forwards;
        animation-delay: 1.5s;
      }

      @keyframes logoFadeIn {
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes logoFloat {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }

      .welcome-title {
        opacity: 0;
        transform: scale(0.8);
        animation: titleZoomIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        animation-delay: 2.2s;
      }

      @keyframes titleZoomIn {
        0% { opacity: 0; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1); }
      }

      .tagline-reveal {
        opacity: 0;
        transform: translateX(-20px);
        animation: taglineSlideIn 0.8s forwards;
        animation-delay: 2.8s;
      }

      @keyframes taglineSlideIn {
        to { opacity: 1; transform: translateX(0); }
      }

      .feature-word {
        opacity: 0;
        transform: scale(0.5) rotateY(90deg);
        animation: wordEntranceExit var(--word-duration) forwards;
        animation-delay: var(--delay-in);
        animation-fill-mode: forwards;
        white-space: nowrap; /* Ensures words don't break */
      }

      @keyframes wordEntranceExit {
        0% { opacity: 0; transform: scale(0.5) rotateY(90deg); }
        20% { opacity: 1; transform: scale(1.1) rotateY(-10deg); }
        30% { opacity: 1; transform: scale(1) rotateY(0deg); }
        70% { opacity: 1; transform: scale(1) rotateY(0deg); }
        100% { opacity: 0; transform: scale(0.8) rotateY(0deg); }
      }

      .loading-particles-container {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        z-index: 5;
      }

      .particle {
        position: absolute;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        opacity: 0;
        animation: particleFlow 5s infinite ease-out;
      }

      @keyframes particleFlow {
        0% { transform: translate(var(--x1), var(--y1)) scale(0); opacity: 0; }
        20% { opacity: 1; transform: translate(var(--x2), var(--y2)) scale(1); }
        80% { opacity: 0.5; transform: translate(var(--x3), var(--y3)) scale(0.8); }
        100% { transform: translate(var(--x4), var(--y4)) scale(0); opacity: 0; }
      }

      body.fade-out-screen #splash-screen-root {
        animation: fadeOutScreen 1s forwards;
        animation-delay: 5.5s;
      }

      @keyframes fadeOutScreen {
        from { opacity: 1; }
        to { opacity: 0; visibility: hidden; }
      }

      .animate-pulse-delay-1 { animation: pulse 1s infinite 0s; }
      .animate-pulse-delay-2 { animation: pulse 1s infinite 0.2s; }
      .animate-pulse-delay-3 { animation: pulse 1s infinite 0.4s; }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(styleSheet);
    document.body.classList.add('splash-active');

    if (particlesContainerRef.current) {
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 8 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.setProperty('--x1', `${Math.random() * 100}vw`);
        particle.style.setProperty('--y1', `${Math.random() * 100}vh`);
        particle.style.setProperty('--x2', `${Math.random() * 100}vw`);
        particle.style.setProperty('--y2', `${Math.random() * 100}vh`);
        particle.style.setProperty('--x3', `${Math.random() * 100}vw`);
        particle.style.setProperty('--y3', `${Math.random() * 100}vh`);
        particle.style.setProperty('--x4', `${Math.random() * 100}vw`);
        particle.style.setProperty('--y4', `${Math.random() * 100}vh`);
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particle.style.animationDuration = `${Math.random() * 5 + 5}s`;

        particlesContainerRef.current.appendChild(particle);
      }
    }

    const baseFeatureWordDelayIn = 3.5;
    const totalWordAnimationDuration = 3; 

    if (featureWordsContainerRef.current) {
      featureWords.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.textContent = word;
        wordSpan.classList.add('feature-word');

        const delayIn = baseFeatureWordDelayIn + (index * 0.2);
        wordSpan.style.setProperty('--delay-in', `${delayIn}s`);
        wordSpan.style.setProperty('--word-duration', `${totalWordAnimationDuration}s`);

        featureWordsContainerRef.current.appendChild(wordSpan);
      });
    }

    const fadeOutTimer = setTimeout(() => {
      document.body.classList.add('fade-out-screen');
    }, 5500);

    const handleAnimationEnd = (event) => {
      if (event.animationName === 'fadeOutScreen') {
        setIsVisible(false);
        document.body.classList.remove('splash-active');
        document.body.classList.remove('fade-out-screen');
        if (onAnimationEnd) {
          onAnimationEnd();
        }
      }
    };

    document.body.addEventListener('animationend', handleAnimationEnd);

    return () => {
      clearTimeout(fadeOutTimer);
      document.body.removeEventListener('animationend', handleAnimationEnd);
      document.head.removeChild(styleSheet);
      document.head.removeChild(metaThemeColor);
      if (particlesContainerRef.current) {
        particlesContainerRef.current.innerHTML = '';
      }
      if (featureWordsContainerRef.current) {
        featureWordsContainerRef.current.innerHTML = '';
      }
    };
  }, [onAnimationEnd]);


  if (!isVisible) {
    return null;
  }

  return (
    <div id="splash-screen-root" className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
      <div className="loading-particles-container" ref={particlesContainerRef}></div>

      <div id="splash-container" className="flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm p-8 sm:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center relative overflow-hidden border border-gray-700">
        <div className="logo-reveal mb-8">
          {/* Ensure logo.jpg is in your public folder */}
          <img src="/icons/logo-512.png" alt="iStudent Logo" className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-full shadow-lg border-4 border-purple-500 p-2"/>
        </div>

        <h1 className="welcome-title text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
          iStudent - من خوێندکارم
        </h1>
        <p className="tagline-reveal text-lg sm:text-xl text-indigo-300">
          گەشتەکەت دەست پێدەکات...
        </p>

        <div id="feature-words-container" ref={featureWordsContainerRef} className="mt-8 flex justify-center items-center gap-4 flex-wrap text-2xl sm:text-3xl font-bold text-blue-400">
        </div>

        <div className="mt-10 flex space-x-2">
          <span className="w-3 h-3 bg-purple-400 rounded-full animate-pulse-delay-1"></span>
          <span className="w-3 h-3 bg-blue-400 rounded-full animate-pulse-delay-2"></span>
          <span className="w-3 h-3 bg-pink-400 rounded-full animate-pulse-delay-3"></span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;