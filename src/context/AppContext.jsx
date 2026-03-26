import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentActivity, setCurrentActivity] = useState(null); // null = home
  const [completed, setCompleted]   = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // sidebar state for each activity (dot + progress) — updated by activities
  const [sidebarMeta, setSidebarMeta] = useState({ dot: 1, progress: 0 });

  function openActivity(n) { setCurrentActivity(n); setSidebarOpen(false); }
  function goHome()        { setCurrentActivity(null); setSidebarOpen(false); }
  function markComplete(n) { setCompleted(s => new Set([...s, n])); }
  function updateSidebar(dot, progress) { setSidebarMeta({ dot, progress }); }

  return (
    <AppContext.Provider value={{
      currentActivity, completed,
      sidebarOpen, setSidebarOpen,
      sidebarMeta, updateSidebar,
      openActivity, goHome, markComplete,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
