import { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import NavBar from '../../components/NavBar';
import { useApp } from '../../context/AppContext';
import NarrativeIntro from '../../components/NarrativeIntro';
import Debrief from '../../components/Debrief';
import { AMARA } from '../../data/amara';

/* ─── Keyframe styles injected once ───────────────────────────────────────── */
const STYLES = `
  @keyframes confettiFall07 {
    from { transform: translateY(-20px) rotate(0deg); opacity: 1; }
    to   { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }
  @keyframes dotClimb07 {
    from { transform: scale(.7); }
    to   { transform: scale(1); }
  }
  @keyframes shake07 {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px); }
    60%     { transform: translateX(-5px); }
    80%     { transform: translateX(5px); }
  }
  @keyframes mintGlow07 {
    0%   { box-shadow: 0 0 0 0 rgba(154,221,189,0); }
    40%  { box-shadow: 0 0 0 6px rgba(154,221,189,.45); }
    100% { box-shadow: 0 0 0 0 rgba(154,221,189,0); }
  }
  @keyframes crimsonPulse07 {
    0%   { box-shadow: 0 0 0 0 rgba(189,57,57,.8); }
    40%  { box-shadow: 0 0 0 8px rgba(189,57,57,0); }
    100% { box-shadow: 0 0 0 0 rgba(189,57,57,0); }
  }
  @keyframes slideInPage07 {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: none; }
  }
  .page-enter-07 { animation: slideInPage07 400ms cubic-bezier(0.25,0.46,0.45,0.94) both; }
  .anim-shake-07  { animation: shake07 .4s ease; }
  .anim-mint-07   { animation: mintGlow07 .7s ease; }
  .anim-crimson-07 { animation: crimsonPulse07 .7s ease; }
  .dot-climber-07 {
    width: 14px; height: 14px; border-radius: 50%;
    background: #BD3939;
    box-shadow: 0 0 8px rgba(189,57,57,.8);
    transition: top 0.75s cubic-bezier(.4,0,.2,1);
    animation: dotClimb07 .3s ease;
  }
  .card-hover-07 { transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease; }
  .card-hover-07:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(189,57,57,0.25); border-color: #BD3939 !important; }
`;

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function injectStyles(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Confetti ─────────────────────────────────────────────────────────────── */
function Confetti() {
  const particles = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: i % 3 === 0 ? '#BD3939' : i % 3 === 1 ? '#9ADDBD' : '#399BA3',
    delay: Math.random() * 0.6,
    duration: 1.2 + Math.random() * 1,
    size: 5 + Math.random() * 7,
    round: Math.random() > 0.5,
  })), []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 200 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: 0,
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.round ? '50%' : '2px',
          animation: `confettiFall07 ${p.duration}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

/* ─── Ladder Illustration (intro page) ────────────────────────────────────── */
const INTRO_RUNG_DEFS = [
  { key: 'action',      label: 'ACTION',      bg: '#BD3939', glowOuter: 'rgba(189,57,57,.35)', showLabel: true },
  { key: 'implication', label: 'IMPLICATION', bg: '#1D1C1C', glowOuter: null, showLabel: false },
  { key: 'insight',     label: 'INSIGHT',     bg: '#171717', glowOuter: null, showLabel: false },
  { key: 'observation', label: 'OBSERVATION', bg: '#111',    glowOuter: null, showLabel: false },
];

function LadderIllustration() {
  return (
    <div style={{ position: 'relative', width: 300, maxWidth: '100%' }}>
      {/* Rails */}
      <div style={{ position: 'absolute', left: 18, top: 0, bottom: 0, width: 2,
        background: 'rgba(189,57,57,.5)', borderRadius: 1 }} />
      <div style={{ position: 'absolute', right: 18, top: 0, bottom: 0, width: 2,
        background: 'rgba(189,57,57,.5)', borderRadius: 1 }} />
      {/* Rungs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10,
        paddingLeft: 28, paddingRight: 28, paddingTop: 8, paddingBottom: 8 }}>
        {INTRO_RUNG_DEFS.map((rung, idx) => (
          <div key={rung.key} style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', right: 'calc(100% + 28px)', top: '50%',
              transform: 'translateY(-50%)', fontSize: 10, color: '#a88a87',
              letterSpacing: '.12em', textTransform: 'uppercase',
              whiteSpace: 'nowrap', fontWeight: 600,
            }}>
              {rung.label}
            </div>
            <div style={{
              height: 58, borderRadius: 6,
              background: rung.bg,
              border: idx === 0 ? 'none' : '1px solid #222222',
              boxShadow: rung.glowOuter ? `0 0 16px ${rung.glowOuter}` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {rung.showLabel && (
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '.04em' }}>
                  ACTION
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Ladder interactive constants ────────────────────────────────────────── */
const RUNG_HEIGHT = 70;
const RUNG_GAP    = 10;
const RUNG_PAD    = 8;
const RUNG_LABELS = ['OBSERVATION', 'INSIGHT', 'IMPLICATION', 'ACTION'];
const RUNG_KEYS   = ['observation', 'insight', 'implication', 'action'];
const VISUAL_RUNGS = [3, 2, 1, 0]; // action at top → observation at bottom

function rungYCenter(logicalIdx) {
  const vi = 3 - logicalIdx;
  return RUNG_PAD + vi * (RUNG_HEIGHT + RUNG_GAP) + RUNG_HEIGHT / 2;
}

/* ─── Shared LadderPage ────────────────────────────────────────────────────── */
function LadderPage({ scenario, progress, showCompletion, onComplete }) {
  const { recordAttempt, recordError } = useApp();
  const [cards]      = useState(() => shuffle(scenario.cards));
  const [placements, setPlacements] = useState({ insight: null, implication: null, action: null });
  const [selected,   setSelected]   = useState(null);
  const [dragging,   setDragging]   = useState(null);
  const [climbStep,  setClimbStep]  = useState(-1);
  const [rungStatus, setRungStatus] = useState({});
  const [wrongHint,  setWrongHint]  = useState(null); // { rungKey, text }
  const [complete,   setComplete]   = useState(false);
  const [confetti,   setConfetti]   = useState(false);
  const [shaking,    setShaking]    = useState(null);

  const climbing  = climbStep >= 0 && !complete;
  const allFilled = placements.insight && placements.implication && placements.action;
  const poolCards = cards.filter(c => !Object.values(placements).includes(c.id));

  const dotY = climbStep >= 0
    ? (climbStep === 4 ? rungYCenter(3) - 30 : rungYCenter(climbStep))
    : rungYCenter(0) + 10;

  function pickCard(id) {
    if (climbing) return;
    setSelected(s => s === id ? null : id);
  }

  function placeOnRung(rungKey, cardId) {
    if (climbing || rungKey === 'observation') return;
    const id = cardId || selected;
    if (id) {
      // Find if this card is already on another rung — if so, swap
      const fromRung = Object.keys(placements).find(k => placements[k] === id);
      if (fromRung && fromRung !== rungKey) {
        // Swap: put whatever was on target rung back onto fromRung
        const displaced = placements[rungKey];
        setPlacements(p => ({ ...p, [fromRung]: displaced || null, [rungKey]: id }));
      } else {
        setPlacements(p => ({ ...p, [rungKey]: id }));
      }
      setSelected(null);
      setDragging(null);
      setWrongHint(null);
    } else if (placements[rungKey]) {
      setPlacements(p => ({ ...p, [rungKey]: null }));
    }
  }

  function onDragStart(e, cardId) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
    setDragging(cardId);
    setSelected(null);
  }

  function onDragOver(e, rungKey) {
    if (climbing || rungKey === 'observation') return;
    if (dragging && dragging === placements[rungKey]) return; // same card
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onDrop(e, rungKey) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (!cardId) return;
    placeOnRung(rungKey, cardId);
  }

  function onDragEnd() {
    setDragging(null);
  }

  function climbLadder() {
    if (!allFilled || climbing || complete) return;
    const rungs = ['insight', 'implication', 'action'];
    const isCorrect = {};
    rungs.forEach(r => { isCorrect[r] = placements[r] === scenario.correctIds[r]; });
    const firstWrongIdx = rungs.findIndex(r => !isCorrect[r]);
    const stepsNeeded   = firstWrongIdx === -1 ? 4 : firstWrongIdx + 1;
    const rungsToScore  = firstWrongIdx === -1 ? rungs : rungs.slice(0, firstWrongIdx + 1);
    rungsToScore.forEach(r => { if (isCorrect[r]) recordAttempt(); else recordError(); });

    setClimbStep(0);
    setRungStatus({});

    for (let i = 1; i <= stepsNeeded; i++) {
      ((step) => {
        setTimeout(() => {
          setClimbStep(step);
          if (step >= 1 && step <= 3) {
            const rungKey = rungs[step - 1];
            const ok = isCorrect[rungKey];
            setRungStatus(prev => ({ ...prev, [rungKey]: ok ? 'correct' : 'wrong' }));
            if (!ok) {
              setShaking(rungKey);
              setWrongHint({ rungKey, text: scenario.hints?.[rungKey] || null });
              setTimeout(() => {
                setPlacements(p => ({ ...p, [rungKey]: null }));
                setClimbStep(-1);
                setRungStatus({});
                setShaking(null);
              }, 1400);
            }
          }
          if (step === 4) {
            setComplete(true);
            setConfetti(true);
            setTimeout(() => setConfetti(false), 3200);
          }
        }, step * 900);
      })(i);
    }
  }

  const containerH = RUNG_PAD * 2 + 4 * RUNG_HEIGHT + 3 * RUNG_GAP;

  return (
    <Layout sidebarDot={7} progress={progress}>
      {confetti && <Confetti />}

      <div className="page-enter-07" style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: '#a88a87', letterSpacing: '.12em', textTransform: 'uppercase' }}>
            {scenario.title}
          </span>
          <span style={{ fontSize: 11, color: '#AAAAAA' }}>
            {Object.values(placements).filter(Boolean).length}/3 placed
          </span>
        </div>
        <div style={{ height: 4, background: '#222222', borderRadius: 2 }}>
          <div style={{
            height: 4, background: '#BD3939', borderRadius: 2, transition: 'width .5s',
            width: `${(Object.values(placements).filter(Boolean).length / 3) * 100}%`,
          }} />
        </div>
      </div>

      {/* Amara intro */}
      <div style={{ padding: '0 16px', marginTop: 12 }}>
        <div style={{ background: 'rgba(189,57,57,0.06)', border: '1px solid rgba(189,57,57,0.25)',
          borderRadius: 12, padding: '14px 18px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 7px 0' }}>
            Amara's ladder
          </p>
          <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
            Raw data does not drive decisions — the ladder from observation to action does.
            Amara has broken {scenario.title.split('—')[1]?.trim() || 'this scenario'} into three rungs:
            the <strong style={{ color: '#e5e2e1' }}>observation</strong> (what the data shows),
            the <strong style={{ color: '#e5e2e1' }}>insight</strong> (what it means), and
            the <strong style={{ color: '#e5e2e1' }}>recommendation</strong> (what to do).
            Place each card on the rung where it belongs to rebuild her chain of reasoning.
          </p>
        </div>
      </div>

      {/* Ladder + pool */}
      <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Ladder */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
            {/* Rails */}
            <div style={{
              position: 'absolute', left: 10, top: RUNG_PAD, bottom: RUNG_PAD, width: 2,
              background: 'rgba(189,57,57,.4)', borderRadius: 1, zIndex: 1,
            }} />
            <div style={{
              position: 'absolute', right: 10, top: RUNG_PAD, bottom: RUNG_PAD, width: 2,
              background: 'rgba(189,57,57,.4)', borderRadius: 1, zIndex: 1,
            }} />

            {/* Climbing dot */}
            {climbStep >= 0 && (
              <div className="dot-climber-07" style={{
                position: 'absolute', left: '50%', marginLeft: -7, top: dotY - 7, zIndex: 10,
                transition: 'top .75s cubic-bezier(.4,0,.2,1)',
              }} />
            )}

            {/* Instruction text */}
            <div aria-live="polite" style={{ padding: `${RUNG_PAD}px 22px 4px`, fontSize: 13, color: '#AAAAAA', lineHeight: 1.5 }}>
              {climbing && !complete
                ? <span style={{ color: '#BD3939' }}>Climbing the ladder…</span>
                : complete
                ? <span style={{ color: '#9ADDBD' }}>You reached the top. Data turned into decision.</span>
                : selected
                ? <span style={{ color: '#BD3939' }}>Now tap an empty rung to place this card ↓</span>
                : dragging
                ? <span style={{ color: '#BD3939' }}>Drop onto a rung to place it ↓</span>
                : 'Drag or tap a card, then drop or tap the rung it belongs to.'}
            </div>

            {/* Rung slots */}
            <div style={{ padding: `4px 22px`, display: 'flex', flexDirection: 'column', gap: RUNG_GAP }}>
              {VISUAL_RUNGS.map((logicalIdx) => {
                const rungKey   = RUNG_KEYS[logicalIdx];
                const label     = RUNG_LABELS[logicalIdx];
                const isObs     = rungKey === 'observation';
                const isTop     = rungKey === 'action';
                const placed    = isObs ? null : placements[rungKey];
                const card      = placed ? cards.find(c => c.id === placed) : null;
                const status    = rungStatus[rungKey];
                const isShaking = shaking === rungKey;

                let borderColor = '#1E1E1E';
                if (status === 'correct') borderColor = 'rgba(154,221,189,.55)';
                if (status === 'wrong')   borderColor = 'rgba(189,57,57,.7)';
                if (!isObs && (selected || dragging) && dragging !== placed) borderColor = placed ? 'rgba(57,155,163,.5)' : 'rgba(189,57,57,.4)';

                let bg = '#111';
                if (isTop && complete)   bg = '#BD3939';
                else if (isTop)          bg = '#1A1A1A';
                else if (logicalIdx === 2) bg = '#161616';
                else if (logicalIdx === 1) bg = '#131313';

                return (
                  <div key={rungKey} style={{ position: 'relative' }}>
                    {/* Rung label outside rails */}
                    <div style={{
                      position: 'absolute', right: 'calc(100% + 14px)', top: '50%',
                      transform: 'translateY(-50%)', fontSize: 9.5, color: '#a88a87',
                      letterSpacing: '.12em', textTransform: 'uppercase',
                      whiteSpace: 'nowrap', fontWeight: 600,
                    }}>
                      {label}
                    </div>

                    <div
                      onClick={() => placeOnRung(rungKey)}
                      onDragOver={e => onDragOver(e, rungKey)}
                      onDrop={e => onDrop(e, rungKey)}
                      role={!isObs ? 'button' : undefined}
                      tabIndex={!isObs ? 0 : undefined}
                      onKeyDown={e => { if (!isObs && (e.key === 'Enter' || e.key === ' ')) placeOnRung(rungKey); }}
                      aria-label={!isObs ? `${label} rung drop zone` : undefined}
                      className={isShaking ? 'anim-shake-07' : status === 'correct' ? 'anim-mint-07' : status === 'wrong' ? 'anim-crimson-07' : ''}
                      style={{
                        height: RUNG_HEIGHT,
                        minHeight: 44,
                        background: bg,
                        borderRadius: 6,
                        border: isObs ? '1px solid #1A1A1A' : `1px ${placed ? 'solid' : 'dashed'} ${borderColor}`,
                        borderLeft: (isObs || card) ? '3px solid #BD3939' : undefined,
                        cursor: (!isObs && (selected || dragging)) ? 'pointer' : (placed && !isObs && !climbing) ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center',
                        padding: '10px 12px', gap: 8,
                        transition: 'border-color .25s, background .25s',
                        boxShadow: isTop && complete ? '0 0 20px rgba(189,57,57,.4)' : 'none',
                      }}
                    >
                      {isObs ? (
                        <span style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.5, flex: 1 }}>
                          {scenario.observation}
                        </span>
                      ) : card ? (
                        <span
                          draggable={!climbing}
                          onDragStart={!climbing ? e => onDragStart(e, card.id) : undefined}
                          onDragEnd={!climbing ? onDragEnd : undefined}
                          style={{ fontSize: 13, color: status === 'correct' ? '#9ADDBD' : '#FFFFFF', lineHeight: 1.5, flex: 1,
                            cursor: climbing ? 'default' : 'grab',
                            opacity: dragging === card.id ? 0.35 : 1 }}
                        >
                          {card.text}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#333', fontStyle: 'italic' }}>
                          Drop a card here
                        </span>
                      )}

                      {status === 'correct' && (
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#9ADDBD', flexShrink: 0 }}>check_circle</span>
                      )}
                      {status === 'wrong' && (
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#BD3939', flexShrink: 0 }}>close</span>
                      )}
                      {isTop && complete && !status && (
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'white', flexShrink: 0 }}>star</span>
                      )}
                    </div>

                    {status === 'wrong' && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 10,
                        fontSize: 12, color: '#e5e2e1',
                        background: '#1C1B1B', border: '1px solid rgba(189,57,57,.4)',
                        borderLeft: '3px solid #BD3939',
                        borderRadius: 6, padding: '8px 12px', lineHeight: 1.55,
                      }}>
                        <span style={{ color: '#BD3939', fontWeight: 700, marginRight: 4 }}>Wrong rung.</span>
                        {wrongHint?.rungKey === rungKey && wrongHint.text
                          ? wrongHint.text
                          : 'That card doesn\'t belong here — try another.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Failed climb feedback banner */}
        {!climbing && !complete && wrongHint && (
          <div style={{
            margin: '12px 0 4px',
            background: 'rgba(189,57,57,0.08)',
            border: '1px solid rgba(189,57,57,0.35)',
            borderLeft: '3px solid #BD3939',
            borderRadius: 8, padding: '12px 16px',
            animation: 'fadeInUp .35s ease-out forwards',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#BD3939', flexShrink: 0 }}>close</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#BD3939', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Wrong rung — {wrongHint.rungKey}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.6 }}>
              {wrongHint.text || 'That card doesn\'t belong on this rung. Re-read the options and think about what each rung level asks for.'}
            </p>
            <p style={{ fontSize: 12, color: '#666', margin: '8px 0 0', lineHeight: 1.5 }}>
              The card has been returned to the pool. Place it again when you\'re ready.
            </p>
          </div>
        )}

        {/* Completion insight */}
        {complete && showCompletion && (
          <div style={{
            background: '#0F5560', borderRadius: 8, padding: '14px 18px', marginTop: 4,
          }}>
            <div style={{ fontSize: 11, color: '#399BA3', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>
              Key Insight
            </div>
            <div style={{ fontSize: 14, fontStyle: 'italic', color: 'white', lineHeight: 1.65 }}>
              {showCompletion}
            </div>
          </div>
        )}

        {complete && (
          <div style={{ background: '#1A1A1A', borderRadius: 8, padding: '14px 18px', borderLeft: '3px solid #BD3939' }}>
            <div style={{ fontSize: 14, color: '#FFFFFF', lineHeight: 1.6 }}>
              You have turned data into a decision. That is the whole job.
            </div>
          </div>
        )}

        {/* Card pool */}
        {!complete && (
          <div style={{ paddingBottom: 100 }}>
            <div style={{ fontSize: 10, color: '#a88a87', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              Card Pool — {poolCards.length} remaining
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {poolCards.map(card => (
                <div key={card.id}
                  draggable
                  onDragStart={e => onDragStart(e, card.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => pickCard(card.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') pickCard(card.id); }}
                  className="card-hover-07"
                  style={{
                    background: selected === card.id ? 'rgba(189,57,57,.14)' : '#1A1A1A',
                    borderRadius: 6, padding: '11px 12px',
                    border: selected === card.id ? '1px solid rgba(189,57,57,.6)' : '1px solid #222222',
                    cursor: 'grab', transition: 'all .2s', lineHeight: 1.55,
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    color: selected === card.id ? '#FFFFFF' : '#AAAAAA',
                    fontSize: 13, minHeight: 44,
                    opacity: dragging === card.id ? 0.35 : 1,
                  }}
                >
                  <span style={{ color: '#59413f', fontSize: 11, marginTop: 2, flexShrink: 0 }}>⠿</span>
                  <span>{card.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, #131313 55%)',
        padding: '32px 20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingLeft: 60,
      }}>
        <span style={{ fontSize: 13, color: '#AAAAAA' }}>
          {complete ? 'Complete ✓' : `${Object.values(placements).filter(Boolean).length}/3 placed`}
        </span>
        {!complete ? (
          <button
            onClick={climbLadder}
            disabled={!allFilled || climbing}
            className={allFilled && !climbing ? 'bg-crimson-gradient' : ''}
            style={{
              padding: '14px 28px', borderRadius: 8, border: 'none',
              color: allFilled && !climbing ? 'white' : '#555',
              fontSize: 16, fontWeight: 700,
              cursor: allFilled && !climbing ? 'pointer' : 'not-allowed',
              background: allFilled && !climbing ? undefined : '#1A1A1A',
              display: 'flex', alignItems: 'center', gap: 8, minHeight: 44,
              fontFamily: 'Inter',
            }}
          >
            Climb the Ladder
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_upward</span>
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="bg-crimson-gradient"
            style={{
              padding: '14px 28px', borderRadius: 8, border: 'none', color: 'white',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, minHeight: 44,
              fontFamily: 'Inter',
            }}
          >
            {scenario.cta || 'Next Scenario'}
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </button>
        )}
      </div>
    </Layout>
  );
}

/* ─── Page 1 — Intro ───────────────────────────────────────────────────────── */
function Page1({ onNext }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 200);
    const t2 = setTimeout(() => setStep(2), 800);
    const t3 = setTimeout(() => setStep(3), 1400);
    const t4 = setTimeout(() => setStep(4), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <Layout sidebarDot={7} progress={75}>
      <div className="page-enter-07" style={{ padding: '24px 16px 0', maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          opacity: step >= 1 ? 1 : 0,
          transform: step >= 1 ? 'none' : 'translateY(12px)',
          transition: 'all .6s ease',
        }}>
          <div style={{ fontSize: 80, fontWeight: 900, color: '#BD3939', lineHeight: 1, letterSpacing: '-.04em' }}>07</div>
          <div style={{ fontSize: 'clamp(22px,5vw,32px)', fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>Actionability</div>
          <div style={{ fontSize: 13, color: '#a88a87', marginTop: 6, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            The So What Ladder
          </div>
        </div>

        {/* Ladder illustration */}
        <div style={{
          opacity: step >= 2 ? 1 : 0,
          transform: step >= 2 ? 'none' : 'translateY(16px)',
          transition: 'all .7s ease',
          display: 'flex', justifyContent: 'center', marginTop: 32, paddingLeft: 80,
        }}>
          <LadderIllustration />
        </div>

        {/* Tagline */}
        <div style={{
          opacity: step >= 3 ? 1 : 0,
          transform: step >= 3 ? 'none' : 'translateY(12px)',
          transition: 'all .7s ease',
          textAlign: 'center', marginTop: 28,
        }}>
          <div style={{ fontSize: 'clamp(18px,5vw,22px)', fontStyle: 'italic', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3 }}>
            "Data without action is just noise."
          </div>
        </div>

        {/* Concept text */}
        <div style={{
          opacity: step >= 4 ? 1 : 0,
          transform: step >= 4 ? 'none' : 'translateY(12px)',
          transition: 'all .7s ease',
          marginTop: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#AAAAAA', lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>
            Every data point has a <em style={{ color: '#BD3939' }}>so what</em>. Your job as a storyteller is to keep asking
            that question — at every level — until you reach something someone can actually do.
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, #131313 55%)',
        padding: '32px 20px 24px',
        display: 'flex', justifyContent: 'flex-end', paddingLeft: 60,
      }}>
        <button
          onClick={onNext}
          className="bg-crimson-gradient"
          style={{
            padding: '14px 28px', borderRadius: 8, border: 'none', color: 'white',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, minHeight: 44,
            fontFamily: 'Inter',
          }}
        >
          Climb the Ladder
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_upward</span>
        </button>
      </div>
    </Layout>
  );
}

/* ─── Page 2 — Scenario 1: Bounce Rate ────────────────────────────────────── */
function Page2({ onNext }) {
  const scenario = useMemo(() => ({
    title: 'Scenario 1 — Outlet Onboarding Drop',
    observation: 'Outlet onboarding into the Zawadi Western Kenya pilot dropped by 44% in the month after the new SMS order-placement process launched.',
    cards: shuffle([
      { id: 's1-a', text: 'Outlets are dropping out at the SMS ordering step — the process is too complex or does not work on older handsets.' },
      { id: 's1-b', text: 'If onboarding friction is not fixed, the pilot cannot reach its 340-outlet target before the Q2 retail peak.' },
      { id: 's1-c', text: 'Test the SMS ordering flow with 20 outlets in Siaya County using the most common handset models, and simplify to a single-reply confirmation within 10 days.' },
      { id: 's1-d', text: 'Cancel the SMS channel and switch to in-person order forms instead.' },
      { id: 's1-e', text: 'The drop is probably seasonal — retailers are busy with stock-taking cycles.' },
      { id: 's1-f', text: 'Increase the field sales team to visit every outlet individually.' },
      { id: 's1-g', text: 'Rebrand the Zawadi pilot with a new campaign name.' },
    ]),
    correctIds: { insight: 's1-a', implication: 's1-b', action: 's1-c' },
    hints: {
      insight:     'The insight explains *why* the drop happened — look for a card that diagnoses the cause, not the consequence.',
      implication: 'The implication states what happens if nothing changes — look for a card that frames the business risk, not a fix.',
      action:      'The action must be specific, time-bound, and testable — look for a card with a clear who, what, and when.',
    },
    cta: 'Next Scenario →',
  }), []);

  return <LadderPage scenario={scenario} progress={83} showCompletion={null} onComplete={onNext} />;
}

/* ─── Page 3 — Scenario 2: Support Tickets ────────────────────────────────── */
function Page3({ onNext }) {
  const scenario = useMemo(() => ({
    title: "Scenario 2 — Amara's Core Finding",
    observation: "Amara's survey data shows 40.3% of Western Kenya households source cooking oil from informal kiosks — not from registered retail outlets stocking Zawadi.",
    cards: shuffle([
      { id: 's2-a', text: 'Nearly half of households in the region are buying from informal channels — a market Zawadi has never reached, worth an estimated KES 340M annually.' },
      { id: 's2-b', text: 'If this gap is not addressed before the Q2 retail peak, informal kiosks will capture another full season of sales that could be Zawadi\'s.' },
      { id: 's2-c', text: 'Present this finding to leadership with a specific ask: KES 18M to pilot distribution in Kisumu, Kakamega, and Siaya counties before Q2 2024.' },
      { id: 's2-d', text: 'Share the finding in the quarterly report and wait for leadership to notice.' },
      { id: 's2-e', text: 'Reduce the scope to only cover urban outlets with reliable electricity.' },
      { id: 's2-f', text: 'The data is just a baseline — no action is required until follow-up surveys are complete.' },
      { id: 's2-g', text: 'Conduct more surveys to verify the finding before acting.' },
    ]),
    correctIds: { insight: 's2-a', implication: 's2-b', action: 's2-c' },
    hints: {
      insight:     'The insight names the hidden opportunity the data reveals — look for a card that quantifies the untapped market, not a risk or a task.',
      implication: 'The implication connects the finding to what Zawadi stands to lose — look for a card about the cost of inaction before the Q2 peak.',
      action:      'The action must be a specific ask with a budget, target counties, and a deadline — not a passive report or further study.',
    },
    cta: 'Next Concept →',
  }), []);

  return (
    <LadderPage
      scenario={scenario}
      progress={90}
      showCompletion="Notice how the action at the top is specific, time-bound, and cross-functional. A vague action is not an action — it is a hope."
      onComplete={onNext}
    />
  );
}

/* ─── Completion ───────────────────────────────────────────────────────────── */
function CompletionPage() {
  const { goHome } = useApp();
  return (
    <Layout sidebarDot={7} progress={100} bottomPad={false}>
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#BD3939', letterSpacing: '-.04em', lineHeight: 1 }}>07</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', marginTop: 8 }}>Complete</div>
          <div style={{ width: 48, height: 3, background: 'linear-gradient(135deg,#BD3939,#8D141B)',
            borderRadius: 2, margin: '14px auto 20px' }} />
          <div style={{ fontSize: 14, color: '#AAAAAA', lineHeight: 1.7, marginBottom: 20 }}>
            You've built the reasoning chain from raw observation all the way up to a specific,
            actionable recommendation — twice. That chain is the core skill of data storytelling.
          </div>
          <div style={{
            background: 'rgba(57,155,163,.08)', borderRadius: 8, padding: '14px 18px',
            borderLeft: '3px solid #399BA3', textAlign: 'left', marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, color: '#399BA3', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>
              Key Insight
            </div>
            <div style={{ fontSize: 14, color: '#FFFFFF', lineHeight: 1.65 }}>
              Observation tells you what happened. Insight tells you why. Implication tells you what it means.
              Action tells you what to do. Every step up the ladder earns the next.
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#888', lineHeight: 1.65, marginBottom: 20, fontStyle: 'italic' }}>
            Next, the CFO emails back with three questions about Amara's methodology — and she realises she gave them a reason to care, but not yet a reason to believe.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={goHome}
              style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid #2A2A2A', color: '#AAAAAA', background: 'transparent', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter' }}
            >
              Back to Home
            </button>
            <button
              onClick={goHome}
              className="bg-crimson-gradient"
              style={{
                padding: '14px 32px', borderRadius: 8, border: 'none',
                color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 44,
                fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              Next Activity
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ─── Activity 07 Root ─────────────────────────────────────────────────────── */
export default function Activity07() {
  injectStyles('activity-07-styles', STYLES);
  const { markComplete } = useApp();
  const [page, setPage] = useState(0);

  function handleComplete() {
    markComplete(7);
    setPage(4);
  }

  return (
    <>
      {page === 0 && (
        <NarrativeIntro
          data={AMARA[7].intro}
          activityNumber={7}
          onStart={() => setPage(1)}
          sidebarDot={7}
          progress={75}
        />
      )}
      {page === 1 && <Page1 onNext={() => setPage(2)} />}
      {page === 2 && <Page2 onNext={() => setPage(3)} />}
      {page === 3 && <Page3 onNext={() => handleComplete()} />}
      {page === 4 && (
        <Debrief
          data={AMARA[7].debrief}
          activityNumber={7}
          onFinish={() => setPage(5)}
          sidebarDot={7}
          progress={100}
        />
      )}
      {page === 5 && <CompletionPage />}
    </>
  );
}
