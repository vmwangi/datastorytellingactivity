const ACTIVITY_LABELS = [
  'Data Context',
  'Narrative Structure',
  'Audience-Centric Thinking',
  'Clarity Over Complexity',
  'Visual Encoding',
  'Emotional Connection',
  'Actionability',
  'Credibility & Transparency',
];

export default function Sidebar({ activeDot, progress, open, onClose, completed = new Set(), onSelectActivity, onGoHome }) {
  return (
    <>
      {/* backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.6)',
            zIndex: 110,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* panel */}
      <aside
        aria-label="Activity progress"
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
          background: '#0E0E0E', borderRight: '1px solid #1C1B1B',
          display: 'flex', flexDirection: 'column',
          zIndex: 120,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
          overflowY: 'auto',
        }}
      >
        {/* header */}
        <div style={{
          padding: '56px 16px 14px',
          borderBottom: '1px solid #1C1B1B',
        }}>
          <div style={{ fontSize: 10, color: '#59413f', letterSpacing: '.08em',
            textTransform: 'uppercase', marginBottom: 4 }}>
            Assessment
          </div>
          <div style={{ fontSize: 14, color: '#e5e2e1', fontWeight: 700 }}>
            Data Storytelling Test
          </div>
        </div>

        {/* Home link */}
        <button
          onClick={() => { onGoHome?.(); onClose(); }}
          style={{
            width: '100%', textAlign: 'left',
            background: 'transparent', border: 'none',
            borderBottom: '1px solid #1C1B1B',
            padding: '11px 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: 'Inter', transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#a88a87', flexShrink: 0 }}>home</span>
          <span style={{ fontSize: 12, color: '#a88a87', fontWeight: 500 }}>Back to Home</span>
        </button>

        {/* activity list */}
        <div style={{ flex: 1, padding: '8px 0' }}>
          {ACTIVITY_LABELS.map((label, i) => {
            const n       = i + 1;
            const isActive = n === activeDot;
            const isDone   = completed.has(n);

            return (
              <button
                key={n}
                onClick={() => { onSelectActivity?.(n); onClose(); }}
                style={{
                  width: '100%', textAlign: 'left',
                  background: isActive ? 'rgba(189,57,57,.08)' : 'transparent',
                  border: 'none', borderBottom: '1px solid #131313',
                  padding: '10px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: 'Inter',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* dot */}
                <div style={{ width: 16, flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center' }}>
                  {isActive ? (
                    <div className="pulse-dot" style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#BD3939',
                    }} />
                  ) : (
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: isDone ? '#BD3939' : '#2A2A2A',
                      opacity: isDone ? 0.6 : 0.35,
                    }} />
                  )}
                </div>

                {/* label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: '#59413f', letterSpacing: '.06em',
                    textTransform: 'uppercase', lineHeight: 1.2 }}>
                    {String(n).padStart(2, '0')}
                  </div>
                  <div style={{
                    fontSize: 12, lineHeight: 1.3, marginTop: 1,
                    color: isActive ? '#e5e2e1' : isDone ? '#9ADDBD' : '#555',
                    fontWeight: isActive ? 600 : 400,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </div>
                </div>

                {isDone && (
                  <span className="material-symbols-outlined"
                    style={{ fontSize: 14, color: '#9ADDBD', flexShrink: 0 }}>
                    check_circle
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* overall progress bar */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #1C1B1B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#a88a87', letterSpacing: '.06em',
              textTransform: 'uppercase' }}>Overall</span>
            <span style={{ fontSize: 10, color: '#a88a87' }}>{progress}%</span>
          </div>
          <div style={{ height: 4, background: '#1C1B1B', borderRadius: 2 }}>
            <div style={{ height: 4, background: '#BD3939', borderRadius: 2,
              width: `${progress}%`, transition: 'width .8s ease' }} />
          </div>
        </div>
      </aside>
    </>
  );
}
