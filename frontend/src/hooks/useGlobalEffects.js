import { useEffect } from 'react';

/**
 * Adds ripple effect to buttons and scroll shadow to headers.
 */
const useGlobalEffects = () => {
  useEffect(() => {
    // === RIPPLE EFFECT (event delegation, one global listener) ===
    const handleMouseDown = (e) => {
      const target = e.target?.closest?.('button, a[class*="bg-"]');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const prevRipple = target.querySelector('.ripple-effect');
      if (prevRipple) prevRipple.remove();

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      target.appendChild(ripple);

      setTimeout(() => ripple.remove(), 500);
    };

    // === HEADER SCROLL SHADOW ===
    let frameId = null;

    const applyHeaderShadowState = () => {
      const headers = document.querySelectorAll('header');
      headers.forEach((header) => {
        if (window.scrollY > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });

      frameId = null;
    };

    const handleScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(applyHeaderShadowState);
    };

    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    applyHeaderShadowState();

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);
};

export default useGlobalEffects;
