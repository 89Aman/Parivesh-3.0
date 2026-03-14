import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TopProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timer0 = setTimeout(() => {
      setVisible(true);
      setProgress(30);
    }, 0);
    const timer1 = setTimeout(() => setProgress(60), 50);
    const timer2 = setTimeout(() => setProgress(85), 120);
    const timer3 = setTimeout(() => setProgress(100), 200);
    const timer4 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);

    return () => {
      clearTimeout(timer0);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [location.pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="top-progress-bar"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        transition: 'width 0.3s ease, opacity 0.3s ease',
      }}
    />
  );
};

export default TopProgressBar;
