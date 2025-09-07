// src/hooks/useScrollDirection.js
import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDir, setScrollDir] = useState('up');

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    
    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      if (direction !== scrollDir && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDir(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    
    window.addEventListener('scroll', updateScrollDir);
    return () => {
      window.removeEventListener('scroll', updateScrollDir);
    };
  }, [scrollDir]);

  return scrollDir;
}