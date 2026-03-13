import { useEffect } from 'react';

/**
 * Adds ripple effect to buttons and scroll shadow to headers.
 */
const useGlobalEffects = () => {
  useEffect(() => {
    // === RIPPLE EFFECT ===
    const handleMouseDown = (e) => {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      target.appendChild(ripple);

      setTimeout(() => ripple.remove(), 500);
    };

    const buttons = document.querySelectorAll('button, a[class*="bg-"]');
    buttons.forEach(btn => btn.addEventListener('mousedown', handleMouseDown));

    // === HEADER SCROLL SHADOW ===
    const handleScroll = () => {
      const headers = document.querySelectorAll('header');
      headers.forEach(header => {
        if (window.scrollY > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      buttons.forEach(btn => btn.removeEventListener('mousedown', handleMouseDown));
      window.removeEventListener('scroll', handleScroll);
    };
  });
};

export default useGlobalEffects;
