import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animClass, setAnimClass] = useState('page-fade-enter');

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setAnimClass('page-fade-exit');
    }, 0);

    const frame = window.requestAnimationFrame(() => {
      setDisplayChildren(children);
      setAnimClass('page-fade-enter');
    });

    return () => {
      window.clearTimeout(exitTimer);
      window.cancelAnimationFrame(frame);
    };
  }, [location.pathname, children]);

  return (
    <div className={animClass} key={location.pathname}>
      {displayChildren}
    </div>
  );
};

export default PageTransition;
