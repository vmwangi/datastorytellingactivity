import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentActivity, setCurrentActivity] = useState(null); // null = home
  const [completed, setCompleted]   = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // sidebar state for each activity (dot + progress) — updated by activities
  const [sidebarMeta, setSidebarMeta] = useState({ dot: 1, progress: 0 });

  // Score tracking — global attempt + error counts across all activities
  const [scoreData, setScoreData] = useState({ attempts: 0, errors: 0 });

  function openActivity(n) { setCurrentActivity(n); setSidebarOpen(false); }
  function goHome()        { setCurrentActivity(null); setSidebarOpen(false); }
  function markComplete(n) { setCompleted(s => new Set([...s, n])); }
  function updateSidebar(dot, progress) { setSidebarMeta({ dot, progress }); }

  function recordAttempt() {
    setScoreData(s => ({ ...s, attempts: s.attempts + 1 }));
  }
  function recordError() {
    setScoreData(s => ({ ...s, attempts: s.attempts + 1, errors: s.errors + 1 }));
  }

  // Score 0–100; null if no attempts yet
  const score = scoreData.attempts > 0
    ? Math.round(Math.max(0, (1 - scoreData.errors / scoreData.attempts) * 100))
    : null;

  return (
    <AppContext.Provider value={{
      currentActivity, completed,
      sidebarOpen, setSidebarOpen,
      sidebarMeta, updateSidebar,
      openActivity, goHome, markComplete,
      recordAttempt, recordError, score, scoreData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
