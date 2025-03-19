import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app.jsx'
import { App2 } from './app2.jsx'

const MainApp = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Simple navigation handler
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Pass navigate to the components via props
  if (currentPath === '/app2') {
    return <App2 onNavigate={navigate} />;
  }
  
  // Default to the home page
  return <App onNavigate={navigate} />;
};

const rootElement = document.getElementById('root')
if (rootElement != null) {
  const root = createRoot(rootElement)
  root.render(<MainApp />)
}
