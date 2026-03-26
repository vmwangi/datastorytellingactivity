import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import HomeScreen from './HomeScreen';
import Activity01 from './activities/01/index';
import Activity02 from './activities/02/index';
import Activity03 from './activities/03/index';
import Activity04 from './activities/04/index';
import Activity05 from './activities/05/index';
import Activity06 from './activities/06/index';
import Activity07 from './activities/07/index';
import Activity08 from './activities/08/index';

// Logical learning order: Context → Structure → Audience → Language → Visual → Emotion → Action → Trust
const ACTIVITIES = {
  1: Activity03, 2: Activity02, 3: Activity01, 4: Activity04,
  5: Activity05, 6: Activity06, 7: Activity07, 8: Activity08,
};

// AppShell — persistent hamburger + sidebar overlay on every screen
function AppShell() {
  const { currentActivity, completed, sidebarOpen, setSidebarOpen, sidebarMeta, openActivity } = useApp();

  const Activity = currentActivity ? ACTIVITIES[currentActivity] : null;

  return (
    <div style={{ minHeight: '100dvh', background: '#131313' }}>

      {/* ── Persistent hamburger ─────────────────────────────── */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle menu"
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 200,
          background: '#1C1B1B', border: '1px solid #2A2A2A',
          borderRadius: 8, width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#a88a87',
          boxShadow: '0 2px 8px rgba(0,0,0,.5)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          {sidebarOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* ── Sidebar overlay ──────────────────────────────────── */}
      <Sidebar
        activeDot={sidebarMeta.dot}
        progress={sidebarMeta.progress}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        completed={completed}
        onSelectActivity={openActivity}
      />

      {/* ── Page content ─────────────────────────────────────── */}
      {Activity ? <Activity /> : <HomeScreen />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
