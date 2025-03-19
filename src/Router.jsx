import React, { useState, useEffect, createContext, useContext } from 'react';

// Create a context to hold our routing state
const RouterContext = createContext();

export function RouterProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Update the path when the user navigates
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Navigate to a new page
  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setCurrentPath(to);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

// Hook to use the router
export function useRouter() {
  return useContext(RouterContext);
}

// Link component
export function Link({ to, children, ...props }) {
  const { navigate } = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

// Route component
export function Route({ path, component: Component }) {
  const { currentPath } = useRouter();
  
  console.log(`Route checking: path=${path}, currentPath=${currentPath}`);
  
  // Simple path matching (exact match or root path special case)
  const isMatch = currentPath === path || 
                  (path === '/' && (currentPath === '' || currentPath === '/'));
  
  if (isMatch) {
    console.log(`Route matched: ${path}`);
    return <Component />;
  }
  
  return null;
}

// Routes component
export function Routes({ children }) {
  return <>{children}</>;
} 