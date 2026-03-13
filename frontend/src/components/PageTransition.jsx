import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animClass, setAnimClass] = useState('page-fade');

  useEffect(() => {
    setAnimClass('');
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setAnimClass('page-fade');
    }, 10);
    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  return (
    <div className={animClass} key={location.pathname}>
      {displayChildren}
    </div>
  );
};

export default PageTransition;
