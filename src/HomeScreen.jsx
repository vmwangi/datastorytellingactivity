import { useApp } from './context/AppContext';

const ACTIVITIES = [
  { n: 1, title: 'Data Context',                  subtitle: 'Context Layers Stacking',          duration: '4–5 min' },
  { n: 2, title: 'Narrative Structure',           subtitle: 'The Three-Layer Story Builder',    duration: '5–7 min' },
  { n: 3, title: 'Audience-Centric Thinking',     subtitle: 'Multi-Audience Dataset Challenge', duration: '6–8 min' },
  { n: 4, title: 'Clarity Over Complexity',       subtitle: 'The Clarity Makeover',             duration: '5–6 min' },
  { n: 5, title: 'Visual Encoding',               subtitle: 'The Chart Detective',              duration: '5–6 min' },
  { n: 6, title: 'Emotional Connection',          subtitle: 'The Emotional Impact Journey',     duration: '5–6 min' },
  { n: 7, title: 'Actionability',                 subtitle: 'The So What Ladder',               duration: '4–5 min' },
  { n: 8, title: 'Credibility & Transparency',    subtitle: 'The Trust Audit',                  duration: '6–7 min' },
];

export default function HomeScreen() {
  const { openActivity, completed, score, scoreData } = useApp();

  return (
    <div style={{ minHeight: '100dvh', background: '#131313', padding: '0 0 40px' }}>
      {/* hero */}
      <div style={{ background: '#0E0E0E', padding: '32px 20px 28px', borderBottom: '1px solid #1C1B1B' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: '#a88a87', letterSpacing: '.08em',
            textTransform: 'uppercase', marginBottom: 10 }}>
            Assessment
          </div>
          <div style={{ fontSize: 'clamp(28px,7vw,42px)', fontWeight: 900, color: '#e5e2e1',
            lineHeight: 1.15, letterSpacing: '-.02em' }}>
            Data Storytelling<br />
            <span style={{ color: '#BD3939' }}>Test.</span>
          </div>
          <div style={{ fontSize: 15, color: '#AAAAAA', marginTop: 12, lineHeight: 1.6 }}>
            Eight interactive activities that gauge your ability to communicate data
            effectively — from framing context and structuring narrative, to choosing
            the right visualisation, building credibility, and driving action.
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ height: 4, flex: 1, background: '#353534', borderRadius: 2 }}>
              <div style={{
                height: 4, background: '#BD3939', borderRadius: 2,
                width: `${(completed.size / 8) * 100}%`, transition: 'width .6s',
              }} />
            </div>
            <span style={{ fontSize: 12, color: '#a88a87', whiteSpace: 'nowrap' }}>
              {completed.size}/8 complete
            </span>
          </div>

          {score !== null && (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12,
              background: '#1C1B1B', borderRadius: 10, padding: '12px 16px',
              border: '1px solid #2A2A2A' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                background: score >= 80 ? 'rgba(154,221,189,.12)' : score >= 50 ? 'rgba(189,57,57,.1)' : 'rgba(189,57,57,.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 900,
                color: score >= 80 ? '#9ADDBD' : '#BD3939',
              }}>
                {score}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#a88a87', letterSpacing: '.07em',
                  textTransform: 'uppercase', marginBottom: 2 }}>Current Score</div>
                <div style={{ fontSize: 13, color: '#AAAAAA', lineHeight: 1.4 }}>
                  {scoreData.attempts - scoreData.errors} correct of {scoreData.attempts} attempts
                </div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 900,
                color: score >= 80 ? '#9ADDBD' : '#BD3939' }}>
                {score}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* activity grid */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ACTIVITIES.map(a => {
            const done = completed.has(a.n);
            return (
              <button
                key={a.n}
                onClick={() => openActivity(a.n)}
                style={{
                  background: '#1C1B1B', borderRadius: 10,
                  border: done ? '1px solid rgba(154,221,189,.3)' : '1px solid #2A2A2A',
                  padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 14,
                  fontFamily: 'Inter', transition: 'background .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#201F1F'}
                onMouseLeave={e => e.currentTarget.style.background = '#1C1B1B'}
              >
                {/* number badge */}
                <div style={{
                  width: 42, height: 42, borderRadius: 8, flexShrink: 0,
                  background: done ? 'rgba(154,221,189,.1)' : 'rgba(189,57,57,.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 900,
                  color: done ? '#9ADDBD' : '#BD3939',
                  letterSpacing: '-.02em',
                }}>
                  {String(a.n).padStart(2, '0')}
                </div>
                {/* text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: done ? '#9ADDBD' : '#e5e2e1',
                    marginBottom: 2, lineHeight: 1.3 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#AAAAAA', lineHeight: 1.4 }}>
                    {a.subtitle}
                  </div>
                </div>
                {/* meta */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                  gap: 4, flexShrink: 0 }}>
                  {done
                    ? <span className="material-symbols-outlined" style={{ color: '#9ADDBD', fontSize: 20 }}>check_circle</span>
                    : <span className="material-symbols-outlined" style={{ color: '#59413f', fontSize: 20 }}>arrow_forward_ios</span>}
                  <span style={{ fontSize: 11, color: '#59413f' }}>{a.duration}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
