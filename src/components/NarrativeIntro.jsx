import { useEffect, useState } from 'react';
import NavBar from './NavBar';

// NarrativeIntro — page 0 of every activity: Amara's story chapter
export default function NarrativeIntro({ data, activityNumber, sidebarDot, progress, onStart }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 100);
    const t2 = setTimeout(() => setStep(2), 400);
    const t3 = setTimeout(() => setStep(3), 700);
    const t4 = setTimeout(() => setStep(4), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const fade = (s) => ({
    opacity: step >= s ? 1 : 0,
    transform: step >= s ? 'none' : 'translateY(10px)',
    transition: 'opacity .55s ease, transform .55s ease',
  });

  return (
    <div style={{ minHeight: '100dvh', background: '#131313', paddingBottom: 32 }}>
      <div style={{ height: 56 }} />
      <div style={{ padding: '0 16px 8px', maxWidth: 540, margin: '0 auto' }}>

        {/* activity number + chapter tag */}
        <div style={{ ...fade(1), marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              fontSize: 'clamp(40px,8vw,56px)', fontWeight: 900, color: '#BD3939',
              lineHeight: 1, letterSpacing: '-.04em',
            }}>
              {String(activityNumber).padStart(2, '0')}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(189,57,57,.1)', border: '1px solid rgba(189,57,57,.2)',
              borderRadius: 6, padding: '4px 10px',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#BD3939' }} />
              <span style={{ fontSize: 10, color: '#BD3939', letterSpacing: '.07em',
                textTransform: 'uppercase', fontWeight: 600 }}>
                {data.chapter}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#59413f', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            {data.scene}
          </div>
        </div>

        {/* Amara card */}
        <div style={{ ...fade(2), background: '#1C1B1B', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
          {/* amber header strip */}
          <div style={{
            background: 'linear-gradient(135deg, #160E00, #231500)',
            padding: '14px 14px 0',
            display: 'flex', alignItems: 'flex-end', gap: 12,
            borderBottom: '1px solid #2A2A2A',
          }}>
            <AmaraSVG />
            <div style={{ paddingBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e5e2e1', marginBottom: 2 }}>Amara</div>
              <div style={{ fontSize: 11, color: '#D97706', letterSpacing: '.02em' }}>
                Agricultural Researcher · Nairobi
              </div>
            </div>
          </div>

          {/* body */}
          <div style={{ padding: '14px 16px' }}>
            {data.body.split('\n\n').map((para, i, arr) => (
              <p key={i} style={{
                fontSize: 14, color: '#AAAAAA', lineHeight: 1.7,
                margin: 0, marginBottom: i < arr.length - 1 ? 12 : 0,
              }}>
                {para}
              </p>
            ))}
          </div>

          {/* thought quote */}
          {data.thought && (
            <div style={{
              margin: '0 14px 14px',
              background: 'rgba(189,57,57,.06)',
              borderLeft: '2px solid rgba(189,57,57,.45)',
              borderRadius: '0 6px 6px 0',
              padding: '10px 12px',
            }}>
              <p style={{ fontSize: 13, fontStyle: 'italic', color: '#e5e2e1',
                lineHeight: 1.6, margin: 0 }}>
                {data.thought}
              </p>
            </div>
          )}
        </div>

        {/* your role */}
        <div style={{
          ...fade(3),
          background: 'rgba(57,155,163,.06)',
          borderRadius: 8, padding: '12px 14px',
          borderLeft: '2px solid #399BA3', marginBottom: 12,
        }}>
          <div style={{ fontSize: 10, color: '#399BA3', letterSpacing: '.07em',
            textTransform: 'uppercase', marginBottom: 5 }}>
            Your Role in This Activity
          </div>
          <p style={{ fontSize: 13, color: '#e5e2e1', lineHeight: 1.65, margin: 0 }}>
            {data.connection}
          </p>
        </div>

        {/* learning outcome */}
        <div style={{
          ...fade(4),
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: '#1C1B1B', borderRadius: 8, padding: '10px 12px',
          border: '1px solid #2A2A2A',
        }}>
          <span className="material-symbols-outlined"
            style={{ fontSize: 16, color: '#9ADDBD', marginTop: 2, flexShrink: 0 }}>
            school
          </span>
          <div>
            <div style={{ fontSize: 10, color: '#a88a87', letterSpacing: '.07em',
              textTransform: 'uppercase', marginBottom: 4 }}>
              Learning Outcome
            </div>
            <p style={{ fontSize: 13, color: '#AAAAAA', lineHeight: 1.55, margin: 0 }}>
              {data.learningOutcome}
            </p>
          </div>
        </div>

        <NavBar
          onNext={onStart}
          nextLabel={`Start Activity ${String(activityNumber).padStart(2, '0')}`}
          nextIcon="play_arrow"
        />
      </div>
    </div>
  );
}

// Amara portrait — consistent across all activities
function AmaraSVG() {
  return (
    <svg width="48" height="60" viewBox="0 0 52 64" fill="none" style={{ flexShrink: 0 }}>
      <ellipse cx="26" cy="48" rx="14" ry="16" fill="#B45309" />
      <path d="M12 52 Q10 64 13 64 L39 64 Q42 64 40 52 Z" fill="#D97706" />
      <rect x="22" y="33" width="8" height="8" rx="2" fill="#92400E" />
      <ellipse cx="26" cy="26" rx="11" ry="12" fill="#92400E" />
      <path d="M15 24 Q15 12 26 11 Q37 12 37 24 Q35 18 26 18 Q17 18 15 24 Z" fill="#1A0800" />
      <ellipse cx="22" cy="25" rx="1.5" ry="1.5" fill="#1A0800" />
      <ellipse cx="30" cy="25" rx="1.5" ry="1.5" fill="#1A0800" />
      <path d="M22 30 Q26 33 30 30" stroke="#7A3008" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M12 50 Q6 56 8 62" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 50 Q46 54 44 60" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
      <rect x="42" y="56" width="10" height="8" rx="1" fill="#201F1F" stroke="#399BA3" strokeWidth="1" />
      <line x1="44" y1="59" x2="50" y2="59" stroke="#399BA3" strokeWidth=".8" />
      <line x1="44" y1="61" x2="50" y2="61" stroke="#399BA3" strokeWidth=".8" />
    </svg>
  );
}
