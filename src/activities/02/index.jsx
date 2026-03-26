import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import NarrativeIntro from '../../components/NarrativeIntro';
import Debrief from '../../components/Debrief';
import { AMARA } from '../../data/amara';

/* ── CONSTANTS ─────────────────────────────────────────────────── */
const CARDS = [
  { id: 'A', text: 'Zawadi distributes cooking oil, flour, and soap across 6 East African regions.', icon: 'language'  },
  { id: 'B', text: '72% of household sales come from only 2 regions — Nairobi and the Coast.',       icon: 'bar_chart' },
  { id: 'C', text: 'Those 2 regions have the most distributor coverage; Western Kenya has almost none.', icon: 'warning' },
  { id: 'D', text: 'In Western Kenya, product restocks take 3 days longer than in covered regions.', icon: 'schedule'  },
  { id: 'E', text: 'This points to a structural gap — demand exists but the supply chain does not reach it.', icon: 'link' },
  { id: 'F', text: 'Amara recommends a pilot expansion into 3 Western Kenya counties to close the gap.', icon: 'campaign' },
];
const CORRECT_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'];
const INITIAL_POOL  = ['D', 'A', 'F', 'C', 'B', 'E']; // scrambled

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

// Arc: rows 0(Low)→4(High), indexed bottom-up
const TENSION_ROWS = ['Low', 'Med-Low', 'Medium', 'Med-High', 'High'];
const REF_ARC = { 1: 0, 2: 2, 3: 3, 4: 4, 5: 2, 6: 0 }; // col→row(0=Low)

const TAG_DEFS = {
  problem:     { label: 'Problem Context',      color: '#BD3939', text: '#FFF'    },
  discovery:   { label: 'Data Discovery',       color: '#399BA3', text: '#FFF'    },
  implication: { label: 'Business Implication', color: '#9ADDBD', text: '#1A1A1A' },
};
const REF_TAGS = { A: 'problem', B: 'discovery', C: 'discovery', D: 'discovery', E: 'implication', F: 'implication' };

const PROGRESS = { 0: 12, 1: 12, 2: 35, 3: 60, 4: 85, 5: 100, 6: 100 };

const ORDER_HINTS = [
  'Think about what needs to be established before the audience can understand what follows.',
  'A strong data story usually moves from context → discovery → consequence. Does your order reflect that?',
  'Consider where the "turning point" moment sits — it usually belongs in the middle, not at the start.',
  'Look for the cause-and-effect relationships. Which events make other events make sense?',
  'The opening panel should orient the audience. The closing panel should give them something to act on.',
  'One panel describes the overall picture. That picture needs to exist in the audience\'s mind before any detail can land.',
  'Two panels point to an imbalance — one shows it in numbers, one explains why it exists. Which comes first?',
  'There is a panel that names the root cause. It can only follow the panels that presented the evidence.',
  'The last panel is the only one asking for something. Everything before it should make that ask feel inevitable.',
  'Try reading your sequence out loud as a sentence: "First we learn X, then Y, then Z…" — does it flow, or does something feel out of place?',
];

/* ── SHARED INNER COMPONENTS ──────────────────────────────────── */
function CTABtn({ onClick, disabled, children, breathe = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 28px',
        borderRadius: '12px',
        fontWeight: 700,
        fontSize: '15px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '44px',
        background: disabled
          ? '#222222'
          : 'linear-gradient(135deg, #BD3939 0%, #8D141B 100%)',
        color: disabled ? '#666666' : '#FFFFFF',
        opacity: disabled ? 0.4 : 1,
        animation: breathe && !disabled ? 'ctaBreathe 2s ease-in-out infinite' : 'none',
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 24px',
        borderRadius: '12px',
        fontWeight: 700,
        fontSize: '14px',
        border: '1px solid rgba(89,65,63,0.25)',
        background: 'transparent',
        color: '#FFFFFF',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        transition: 'all 0.2s ease',
        minHeight: '44px',
      }}
    >
      {children}
    </button>
  );
}

function StepLabel({ step, sub }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{
        fontSize: '11px', fontWeight: 700, color: '#BD3939',
        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', margin: '0 0 6px',
      }}>{step}</p>
      <p style={{ fontSize: '16px', color: '#FFFFFF', margin: 0 }}>{sub}</p>
    </div>
  );
}

/* ── PAGE 1 — CONCEPT INTRO ───────────────────────────────────── */
function Page1({ onNext }) {
  const [step, setStep] = useState(0);
  const [breathe, setBreathe] = useState(false);

  useEffect(() => {
    const ts = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => setStep(2), 500),
      setTimeout(() => setStep(3), 800),
      setTimeout(() => setStep(4), 1100),
      setTimeout(() => setStep(5), 1400),
      setTimeout(() => setBreathe(true), 2000),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const box = (s, label, bg, border, textColor, delay) => (
    <div style={{
      opacity: step >= s ? 1 : 0,
      transform: step >= s ? 'none' : 'translateY(10px)',
      transition: `all 0.45s ease ${delay}ms`,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 'clamp(100px,18vw,180px)',
      height: 'clamp(56px,8vw,80px)',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 'clamp(14px,2vw,18px)', fontWeight: 700, color: textColor }}>{label}</span>
    </div>
  );

  const arrow = (s, delay) => (
    <div style={{
      opacity: step >= s ? 1 : 0,
      transition: `opacity 0.35s ease ${delay}ms`,
      display: 'flex', alignItems: 'center', flexShrink: 0,
    }}>
      <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
        <line x1="4" y1="12" x2="38" y2="12" stroke="#BD3939" strokeWidth="1.5" />
        <polyline points="32,6 42,12 32,18" stroke="#BD3939" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: '80px 16px',
      animation: 'slideInPage 400ms cubic-bezier(0.25,0.46,0.45,0.94) both',
    }}>
      <div style={{ width: '100%', maxWidth: '680px' }}>

        {/* Headline */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{
            fontSize: '80px', fontWeight: 900, color: '#BD3939',
            lineHeight: 1, letterSpacing: '-0.04em',
            userSelect: 'none', marginBottom: '12px',
          }}>
            02
          </div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, margin: 0 }}>
            Narrative Structure
          </h1>
        </div>

        {/* Animation boxes */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', marginBottom: '48px', flexWrap: 'wrap',
        }}>
          {box(1, 'Beginning', '#1A1A1A', '#BD3939', '#FFFFFF', 0)}
          {arrow(2, 0)}
          {box(3, 'Middle', '#1E1E1E', '#399BA3', '#FFFFFF', 0)}
          {arrow(4, 0)}
          {box(5, 'End', '#BD3939', '#BD3939', '#FFFFFF', 0)}
        </div>

        {/* Tagline */}
        <div style={{
          textAlign: 'center',
          opacity: step >= 5 ? 1 : 0,
          transform: step >= 5 ? 'none' : 'translateY(8px)',
          transition: 'all 0.5s ease 200ms',
          marginBottom: '24px',
        }}>
          <p style={{
            fontSize: 'clamp(18px,3vw,22px)', fontStyle: 'italic',
            color: '#FFFFFF', fontWeight: 600, marginBottom: '16px',
          }}>
            Order changes everything.
          </p>
          <p style={{
            fontSize: 'clamp(14px,2.2vw,17px)', color: '#AAAAAA',
            lineHeight: 1.75, maxWidth: '520px', margin: '0 auto',
          }}>
            A data story without structure is just information. Told in the right order, the same facts become a narrative that moves people to act.
          </p>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '40px', right: '24px' }}>
        <CTABtn onClick={onNext} breathe={breathe}>
          <span>Build the Story</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </CTABtn>
      </div>
    </div>
  );
}

/* ── PAGE 2 — TIMELINE SEQUENCING ────────────────────────────── */
function Page2({ onNext }) {
  const { recordAttempt, recordError } = useApp();
  const [pool, setPool]         = useState(INITIAL_POOL);
  const [zones, setZones]       = useState(Array(6).fill(null));
  const [selected, setSelected] = useState(null); // {id, from: 'pool'|zoneIdx}
  const [checked, setChecked]   = useState(false);
  const [results, setResults]   = useState(null);  // array of booleans
  const [shaking, setShaking]   = useState([]);    // zone indices shaking
  const [hintIndex, setHintIndex] = useState(-1);
  const [scoredSlots, setScoredSlots] = useState(new Set()); // indices already scored correct

  const card = id => CARDS.find(c => c.id === id);
  const allFilled = zones.every(z => z !== null);

  function clickPool(id) {
    if (checked) return;
    // Auto-queue: place in the next available empty slot
    const nextEmpty = zones.findIndex(z => z === null);
    if (nextEmpty !== -1) {
      const newZones = [...zones];
      newZones[nextEmpty] = id;
      setPool(p => p.filter(pid => pid !== id));
      setZones(newZones);
      setSelected(null);
    }
  }

  function clickZone(zIdx) {
    if (checked) return;
    if (zones[zIdx]) {
      // Tap an occupied slot to return the card to the pool
      const id = zones[zIdx];
      const newZones = [...zones];
      newZones[zIdx] = null;
      setZones(newZones);
      setPool(p => [...p, id]);
      setSelected(null);
    }
  }

  function checkOrder() {
    const res = zones.map((id, i) => id === CORRECT_ORDER[i]);
    res.forEach((correct, i) => {
      if (correct && !scoredSlots.has(i)) recordAttempt();
      else if (!correct) recordError();
    });
    setScoredSlots(prev => {
      const next = new Set(prev);
      res.forEach((correct, i) => { if (correct) next.add(i); });
      return next;
    });
    setResults(res);
    setChecked(true);
    const wrongIdx = res.map((r, i) => r ? null : i).filter(x => x !== null);
    setShaking(wrongIdx);
    if (!res.every(Boolean)) {
      setHintIndex(h => Math.min(h + 1, ORDER_HINTS.length - 1));
    }
    setTimeout(() => {
      const returning = wrongIdx.map(i => zones[i]).filter(Boolean);
      setZones(z => { const n = [...z]; wrongIdx.forEach(i => n[i] = null); return n; });
      setPool(p => [...p, ...returning]);
      setShaking([]);
      setChecked(false);
      setResults(null);
      if (res.every(Boolean)) { setTimeout(onNext, 800); }
    }, 700);
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      paddingBottom: '128px',
      paddingTop: '80px',
      padding: '80px 16px 128px',
      animation: 'slideInPage 400ms cubic-bezier(0.25,0.46,0.45,0.94) both',
    }}>
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>

        <StepLabel
          step="Step 1 of 3 — Arrange the Story"
          sub="Select a panel, then select a position on the timeline to sequence the story."
        />

        {/* How it works instruction */}
        <div style={{
          background:'rgba(57,155,163,.07)', borderRadius:8,
          padding:'10px 14px', borderLeft:'2px solid #399BA3', marginBottom:14,
          display:'flex', alignItems:'flex-start', gap:10,
        }}>
          <span className="material-symbols-outlined" style={{fontSize:16,color:'#399BA3',marginTop:2,flexShrink:0}}>touch_app</span>
          <div>
            <div style={{fontSize:11,color:'#399BA3',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:3}}>How it works</div>
            <p style={{fontSize:13,color:'#AAAAAA',margin:0,lineHeight:1.6}}>
              <strong style={{color:'#e5e2e1'}}>Tap a story panel</strong> to add it to the next open slot on the timeline. <strong style={{color:'#e5e2e1'}}>Tap a placed panel</strong> on the timeline to remove it and return it to the pool. Drag to place in a specific slot.
            </p>
          </div>
        </div>

        {/* Card pool */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '40px',
        }}>
          {pool.map(id => {
            const c     = card(id);
            const isSel = selected?.id === id;
            return (
              <button
                key={id}
                onClick={() => clickPool(id)}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({ id, from: 'pool' }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                aria-pressed={isSel}
                style={{
                  background: isSel ? 'rgba(189,57,57,0.12)' : '#1A1A1A',
                  border: isSel ? '1px solid rgba(189,57,57,0.6)' : '1px solid rgba(89,65,63,0.15)',
                  boxShadow: isSel ? '0 0 16px rgba(189,57,57,0.2)' : 'none',
                  transform: isSel ? 'translateY(-2px)' : 'none',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'grab',
                  minHeight: '44px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#BD3939' }}>{c.icon}</span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: isSel ? 600 : 400, color: '#FFFFFF', lineHeight: 1.45, margin: 0 }}>{c.text}</p>
              </button>
            );
          })}
          {pool.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '80px', color: '#444', fontSize: '13px', fontStyle: 'italic',
            }}>
              All panels placed on timeline
            </div>
          )}
        </div>

        {/* Timeline */}
        <div style={{ borderRadius: '16px', padding: '24px', marginBottom: '32px', background: '#1A1A1A', border: '1px solid rgba(89,65,63,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Start</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase' }}>End</span>
          </div>

          {/* Timeline line */}
          <div style={{ position: 'relative', height: '2px', background: 'rgba(89,65,63,0.2)', marginBottom: '8px' }}>
            <div style={{ position: 'absolute', left: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: '#BD3939' }} />
            <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: '#BD3939' }} />
          </div>

          {/* Drop zones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px', marginTop: '16px' }}>
            {zones.map((id, zIdx) => {
              const c         = id ? card(id) : null;
              const ok        = results ? results[zIdx] : null;
              const isShaking = shaking.includes(zIdx);
              const isSel     = selected?.from === zIdx;
              const isTarget  = selected && !id;
              return (
                <div key={zIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => clickZone(zIdx)}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (checked) return;
                      try {
                        const { id: dragId, from: dragFrom } = JSON.parse(e.dataTransfer.getData('text/plain'));
                        const prev = zones[zIdx];
                        const newZones = [...zones];
                        newZones[zIdx] = dragId;
                        if (dragFrom === 'pool') {
                          const newPool = pool.filter(p => p !== dragId);
                          if (prev) setPool([...newPool, prev]);
                          else setPool(newPool);
                        } else {
                          newZones[dragFrom] = prev;
                        }
                        setZones(newZones);
                        setSelected(null);
                      } catch {}
                    }}
                    draggable={!!id}
                    onDragStart={(e) => {
                      if (!id) { e.preventDefault(); return; }
                      e.dataTransfer.setData('text/plain', JSON.stringify({ id, from: zIdx }));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      height: c ? 'auto' : '80px',
                      padding: c ? '10px 8px' : '0',
                      border: ok === true  ? '1px solid rgba(154,221,189,0.5)'
                            : ok === false ? '1px solid rgba(189,57,57,0.5)'
                            : isSel        ? '1px solid rgba(189,57,57,0.6)'
                            : isTarget     ? '1px dashed rgba(189,57,57,0.5)'
                            :                '1px dashed rgba(89,65,63,0.25)',
                      background: ok === true  ? 'rgba(154,221,189,0.08)'
                                : ok === false ? 'rgba(189,57,57,0.08)'
                                : isSel        ? 'rgba(189,57,57,0.08)'
                                : isTarget     ? 'rgba(189,57,57,0.04)' : '#111111',
                      minHeight: '80px',
                      cursor: id ? 'grab' : 'pointer',
                      transition: 'all 0.15s ease',
                      animation: isShaking ? 'shake 0.35s ease-out' : 'none',
                    }}
                  >
                    {c ? (
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: ok === true ? '#9ADDBD' : '#BD3939' }}>{card(id).icon}</span>
                          {ok === true  && <span className="material-symbols-outlined icon-filled" style={{ fontSize: '14px', color: '#9ADDBD' }}>check_circle</span>}
                          {ok === false && <span className="material-symbols-outlined icon-filled" style={{ fontSize: '14px', color: '#BD3939' }}>cancel</span>}
                          {ok === null  && <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#444', opacity: 0.7 }} title="Tap to remove">close</span>}
                        </div>
                        <p style={{ fontSize: '11px', color: '#FFFFFF', lineHeight: 1.35, textAlign: 'left', margin: 0 }}>{c.text}</p>
                      </div>
                    ) : (
                      <span className="material-symbols-outlined" style={{ color: '#222222', fontSize: '20px' }}>add</span>
                    )}
                  </button>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{ORDINALS[zIdx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setHintIndex(h => Math.min(h + 1, ORDER_HINTS.length - 1))}
              style={{
                padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(189,57,57,0.25)',
                background: 'transparent', color: '#BD3939', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lightbulb</span>
              {hintIndex < 0 ? 'Need a hint?' : 'Another hint'}
            </button>
            <CTABtn onClick={checkOrder} disabled={!allFilled}>
              <span>Check Order</span>
              <span className="material-symbols-outlined">check</span>
            </CTABtn>
          </div>
          {hintIndex >= 0 && (
            <div style={{
              width: '100%', background:'rgba(189,57,57,.07)', borderRadius:6,
              padding:'8px 12px', borderLeft:'2px solid rgba(189,57,57,.4)',
            }}>
              <div style={{fontSize:11,color:'#BD3939',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:3}}>
                Hint {hintIndex + 1} of {ORDER_HINTS.length}
              </div>
              <p style={{fontSize:13,color:'#AAAAAA',margin:0,lineHeight:1.55}}>{ORDER_HINTS[hintIndex]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ARC_HINTS = [
  'A good story arc is not flat — it builds tension before releasing it. Think about which panels create unease and which resolve it.',
  'Panel 1 is the opening scene. Ask: does the audience need to feel alarmed at the start, or grounded first?',
  'The peak tension should sit somewhere in the middle of the story — the moment where the problem feels most urgent and unresolved.',
  'Resolution panels tend to follow the highest tension. Which panel names the root cause? Which one offers a solution? Those usually sit lower on the arc.',
  'Think about the board hearing this for the first time. When would they lean forward — and when would they breathe out? Map that feeling onto the grid.',
];

/* ── PAGE 3 — ARC GRAPH ──────────────────────────────────────── */
function Page3({ onNext }) {
  const [placed, setPlaced]     = useState({ 1: null, 2: null, 3: null, 4: null, 5: null, 6: null });
  const [selectedTok, setTok]   = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [arcHintIdx, setArcHintIdx] = useState(-1);
  const [draggingTok, setDraggingTok] = useState(null);

  const allPlaced = Object.values(placed).every(v => v !== null);

  function selectToken(n) { setTok(prev => prev === n ? null : n); }

  function clickCell(col, row) {
    if (selectedTok !== null) {
      setPlaced(p => ({ ...p, [selectedTok]: row }));
      setTok(null);
    } else if (placed[col] !== null) {
      setTok(col);
      setPlaced(p => ({ ...p, [col]: null }));
    } else {
      setPlaced(p => ({ ...p, [col]: row }));
    }
  }

  // Build SVG polyline points
  const COLS = 6; const ROWS = 5;
  const cellW = 100 / COLS; const cellH = 100 / ROWS;
  function ptX(col) { return (col - 1) * cellW + cellW / 2; }
  function ptY(row) { return (ROWS - 1 - row) * cellH + cellH / 2; }

  const points = [1, 2, 3, 4, 5, 6]
    .filter(c => placed[c] !== null)
    .map(c => ({ col: c, row: placed[c] }));

  const polylineStr = points.map(p => `${ptX(p.col)}%,${ptY(p.row)}%`).join(' ');

  const refPoints  = [1, 2, 3, 4, 5, 6].map(c => ({ col: c, row: REF_ARC[c] }));
  const refPolyStr = refPoints.map(p => `${ptX(p.col)}%,${ptY(p.row)}%`).join(' ');

  function accuracy(col) {
    if (placed[col] === null) return null;
    return Math.abs(placed[col] - REF_ARC[col]) <= 1 ? 'close' : 'far';
  }

  const CARD_LABELS = ['6 regions', '2 dominate', 'No coverage', 'Restock gap', 'Supply gap', 'Pilot ask'];

// Reasoning for each panel's reference tension level (shown on reveal)
const ARC_REASONING = [
  { panel: 1, level: 'Low',      reason: 'Panel 1 establishes the baseline — Zawadi operates across 6 regions. No tension yet; the audience simply needs this frame before anything else can land.' },
  { panel: 2, level: 'Medium',   reason: 'Panel 2 surfaces the first imbalance: 72% of household sales come from only 2 regions. The audience begins to sense an opportunity — or a problem.' },
  { panel: 3, level: 'Med-High', reason: 'Panel 3 sharpens the tension: the 2 dominant regions have distributor coverage; Western Kenya has almost none. Demand exists but supply does not reach it.' },
  { panel: 4, level: 'High',     reason: 'Panel 4 is the peak. Product restocks take 3 days longer in Western Kenya — this is measurable, operational proof that the gap has real consequences.' },
  { panel: 5, level: 'Medium',   reason: 'Panel 5 names the pattern: a structural supply gap. Tension eases as the story moves from evidence to diagnosis — the audience now understands the root cause.' },
  { panel: 6, level: 'Low',      reason: 'Panel 6 resolves the arc with a clear ask: pilot expansion into 3 Western Kenya counties. Tension returns to low — the audience has been given a specific decision to make.' },
];

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      paddingBottom: '128px',
      padding: '80px 16px 128px',
      animation: 'slideInPage 400ms cubic-bezier(0.25,0.46,0.45,0.94) both',
    }}>
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>

        <StepLabel
          step="Step 2 of 3 — Map the Narrative Arc"
          sub={selectedTok
            ? `Token ${selectedTok} selected — click a row on the grid to set its tension level`
            : 'Click a token, then click the grid to plot its tension level.'
          }
        />

        {/* Why this matters to Amara */}
        <div style={{
          background: 'rgba(189,57,57,.06)', borderRadius: 10,
          padding: '14px 16px', borderLeft: '3px solid rgba(189,57,57,.4)', marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: '#BD3939', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
            Why this matters to Amara
          </div>
          <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
            Amara's 47 slides have the right data in the right order — but a boardroom needs to <em style={{ color: '#e5e2e1' }}>feel</em> the story, not just follow it.
            A narrative arc controls when tension rises and when it releases, guiding the audience from "interesting" to "we need to act."
            Without it, even a perfect sequence lands flat. Amara needs the board to feel the urgency of the Western Kenya gap before she asks them to fund the pilot.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Token tray */}
            <div style={{
              display: 'flex', flexDirection: 'row', gap: '12px',
              flexWrap: 'wrap', flexShrink: 0,
              background: '#1A1A1A',
              borderLeft: '2px solid rgba(57,155,163,0.4)',
              borderRadius: '12px', padding: '16px 12px',
              alignSelf: 'flex-start',
            }}>
              <p style={{
                fontSize: '10px', fontWeight: 700, color: '#399BA3',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                marginBottom: '4px', margin: '0 0 4px', width: '100%',
              }}>Tokens</p>
              {[1, 2, 3, 4, 5, 6].map(n => {
                const isPlaced = placed[n] !== null;
                const isSel    = selectedTok === n;
                const acc      = accuracy(n);
                return (
                  <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <button
                      onClick={() => !isPlaced && selectToken(n)}
                      draggable={!isPlaced}
                      onDragStart={e => {
                        e.dataTransfer.setData('text/plain', String(n));
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggingTok(n);
                        setTok(null);
                      }}
                      onDragEnd={() => setDraggingTok(null)}
                      disabled={isPlaced && !isSel}
                      style={{
                        width: '40px', height: '40px', minHeight: '40px',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        background: isPlaced
                          ? (revealed && acc === 'close' ? 'rgba(154,221,189,0.15)' : 'rgba(189,57,57,0.15)')
                          : isSel ? '#BD3939' : 'rgba(189,57,57,0.2)',
                        border: isPlaced
                          ? (revealed && acc === 'close' ? '2px solid #9ADDBD' : '2px solid rgba(189,57,57,0.4)')
                          : isSel ? '2px solid #BD3939' : '2px solid rgba(189,57,57,0.5)',
                        opacity: isPlaced ? 0.5 : 1,
                        cursor: isPlaced ? 'default' : 'grab',
                        boxShadow: isSel ? '0 0 12px rgba(189,57,57,0.5)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 700, color: isSel ? '#FFF' : '#BD3939' }}>{n}</span>
                    </button>
                    <span style={{
                      fontSize: '9px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2,
                      color: isPlaced ? '#444' : isSel ? '#e5e2e1' : '#666',
                      maxWidth: 52, transition: 'color 0.2s',
                    }}>
                      {CARD_LABELS[n - 1]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0, minWidth: '200px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>

                {/* Y-axis labels */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0', flexShrink: 0, width: '70px' }}>
                  {[...TENSION_ROWS].reverse().map(l => (
                    <span key={l} style={{
                      fontSize: '10px', color: '#555', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      textAlign: 'right', lineHeight: 1,
                    }}>{l}</span>
                  ))}
                </div>

                {/* Grid area */}
                <div style={{
                  flex: 1, position: 'relative',
                  background: '#1A1A1A',
                  border: '1px solid rgba(89,65,63,0.1)',
                  borderRadius: '8px', overflow: 'hidden',
                }}>
                  {/* Grid cells (5 rows × 6 cols) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6,1fr)',
                    gridTemplateRows: 'repeat(5,1fr)',
                    height: '260px',
                    position: 'relative', zIndex: 1,
                  }}>
                    {[...Array(5)].map((_, rowFlipped) => {
                      const row = 4 - rowFlipped;
                      return [...Array(6)].map((_, colIdx) => {
                        const col         = colIdx + 1;
                        const isPlacedHere = placed[col] === row;
                        const isTokTarget  = selectedTok === col;
                        const acc          = isPlacedHere && revealed ? accuracy(col) : null;
                        const refRow       = REF_ARC[col];
                        const isRefHere    = revealed && refRow === row;
                        return (
                          <div
                            key={`${row}-${col}`}
                            onClick={() => clickCell(col, row)}
                            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                            onDrop={e => {
                              e.preventDefault();
                              const tok = parseInt(e.dataTransfer.getData('text/plain'), 10);
                              if (!tok || tok !== col) return; // token number must match column
                              setPlaced(p => ({ ...p, [tok]: row }));
                              setDraggingTok(null);
                            }}
                            style={{
                              border: '1px solid rgba(34,34,34,0.8)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: (selectedTok || draggingTok) ? 'crosshair' : 'pointer',
                              background: (isTokTarget && selectedTok) ? 'rgba(189,57,57,0.05)' : 'transparent',
                              position: 'relative',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (selectedTok || draggingTok) e.currentTarget.style.background = 'rgba(189,57,57,0.08)'; }}
                            onMouseLeave={e => { if (selectedTok || draggingTok) e.currentTarget.style.background = isTokTarget ? 'rgba(189,57,57,0.05)' : 'transparent'; }}
                          >
                            {isPlacedHere && (
                              <div
                                draggable
                                onDragStart={e => {
                                  e.dataTransfer.setData('text/plain', String(col));
                                  e.dataTransfer.effectAllowed = 'move';
                                  setDraggingTok(col);
                                  // clear placement so it can be re-dropped
                                  setPlaced(p => ({ ...p, [col]: null }));
                                }}
                                onDragEnd={() => setDraggingTok(null)}
                                style={{
                                  width: '32px', height: '32px',
                                  borderRadius: '50%',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: acc === 'close' ? 'rgba(154,221,189,0.2)' : 'rgba(189,57,57,0.2)',
                                  border: acc === 'close' ? '2px solid #9ADDBD' : '2px solid #BD3939',
                                  animation: 'popIn 0.25s ease-out forwards',
                                  cursor: 'grab',
                                }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: acc === 'close' ? '#9ADDBD' : '#BD3939' }}>{col}</span>
                              </div>
                            )}
                            {isRefHere && !isPlacedHere && (
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(154,221,189,0.4)', border: '1px solid #9ADDBD' }} />
                            )}
                          </div>
                        );
                      });
                    })}
                  </div>

                  {/* SVG overlay for lines */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
                    {points.length >= 2 && (
                      <polyline points={polylineStr} fill="none" stroke="#BD3939" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" />
                    )}
                    {revealed && (
                      <polyline points={refPolyStr} fill="none" stroke="#9ADDBD" strokeWidth="2" strokeDasharray="6 3" opacity="0.8" />
                    )}
                  </svg>
                </div>
              </div>

              {/* X-axis labels */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <div style={{ width: '70px' }} />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <span key={n} style={{ fontSize: '10px', color: '#555', fontWeight: 600, width: `${100 / 6}%`, textAlign: 'center' }}>{n}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <div style={{ width: '70px' }} />
                <p style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>Story Progress</p>
              </div>
            </div>
          </div>
        </div>


        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {revealed && (
            <div style={{ width: '100%' }} aria-live="polite">
              <p style={{ fontSize: '13px', color: '#9ADDBD', fontStyle: 'italic', margin: '0 0 16px' }}>
                Green line = reference arc. Tokens with mint ring are within 1 level.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ARC_REASONING.map(({ panel, level, reason }) => (
                  <div key={panel} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    background: '#1A1A1A', borderRadius: 8, padding: '10px 12px',
                    border: '1px solid rgba(154,221,189,0.12)',
                  }}>
                    <div style={{
                      flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(189,57,57,0.15)', border: '1px solid rgba(189,57,57,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#BD3939' }}>{panel}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#9ADDBD', letterSpacing: '.06em', textTransform: 'uppercase', marginRight: 6 }}>{level}</span>
                      <span style={{ fontSize: 12, color: '#AAAAAA', lineHeight: 1.6 }}>{reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: '100%', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setArcHintIdx(i => Math.min(i + 1, ARC_HINTS.length - 1))}
              style={{
                padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(189,57,57,0.25)',
                background: 'transparent', color: '#BD3939', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lightbulb</span>
              {arcHintIdx < 0 ? 'Need a hint?' : 'Another hint'}
            </button>
            {allPlaced && !revealed && (
              <GhostBtn onClick={() => setRevealed(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                Reveal Reference Arc
              </GhostBtn>
            )}
            <CTABtn onClick={onNext} disabled={!allPlaced}>
              <span>Next Step</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </CTABtn>
          </div>
          {arcHintIdx >= 0 && (
            <div style={{
              width: '100%', background: 'rgba(189,57,57,.07)', borderRadius: 6,
              padding: '8px 12px', borderLeft: '2px solid rgba(189,57,57,.4)', marginTop: 10,
            }}>
              <div style={{ fontSize: 11, color: '#BD3939', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>
                Hint {arcHintIdx + 1} of {ARC_HINTS.length}
              </div>
              <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.55 }}>{ARC_HINTS[arcHintIdx]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── PAGE 4 — THREAD TAGGING ─────────────────────────────────── */
function Page4({ onNext }) {
  const [selTag, setSelTag]       = useState(null);
  const [panelTags, setPanelTags] = useState(Array(6).fill(null));
  const [revealed, setRevealed]   = useState(false);

  const allTagged = panelTags.every(t => t !== null);

  const refTagArray = ['problem', 'discovery', 'discovery', 'discovery', 'implication', 'implication'];

  function tagPanel(idx) {
    if (!selTag || revealed) return;
    setPanelTags(p => { const n = [...p]; n[idx] = selTag; return n; });
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      paddingBottom: '128px',
      padding: '80px 16px 128px',
      animation: 'slideInPage 400ms cubic-bezier(0.25,0.46,0.45,0.94) both',
    }}>
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>

        <StepLabel
          step="Step 3 of 3 — Tag the Narrative Threads"
          sub="Select a tag below, then click each panel to categorise it."
        />

        {/* Amara transition + guidance */}
        <div style={{
          background: 'rgba(189,57,57,.06)', borderRadius: 10,
          padding: '14px 16px', borderLeft: '3px solid rgba(189,57,57,.4)', marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: '#BD3939', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
            Amara's next problem
          </div>
          <p style={{ fontSize: 13, color: '#AAAAAA', margin: '0 0 10px', lineHeight: 1.65 }}>
            Amara has her arc — she knows where the tension peaks and where it resolves. But knowing the <em style={{ color: '#e5e2e1' }}>shape</em> of the story isn't the same as understanding its <em style={{ color: '#e5e2e1' }}>structure</em>.
            Every panel in her deck plays a different role: some set the scene, some reveal the problem, some deliver the evidence, and some demand a decision.
            If she doesn't know which panel is doing which job, she risks burying the most important moments — or front-loading the ask before the audience is ready for it.
          </p>
          <div style={{
            background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '10px 12px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#399BA3', marginTop: 1, flexShrink: 0 }}>touch_app</span>
            <p style={{ fontSize: 12, color: '#AAAAAA', margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: '#e5e2e1' }}>Pick a tag</strong> from the three categories below, then <strong style={{ color: '#e5e2e1' }}>tap each panel</strong> to assign it a role.
              Every panel needs a tag before you can see how Amara's story is threaded together.
            </p>
          </div>
        </div>

        {/* Tag pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          {Object.entries(TAG_DEFS).map(([key, def]) => {
            const isSel = selTag === key;
            return (
              <button
                key={key}
                onClick={() => setSelTag(prev => prev === key ? null : key)}
                aria-pressed={isSel}
                style={{
                  padding: '10px 20px',
                  borderRadius: '999px',
                  fontWeight: 700, fontSize: '14px',
                  border: `1px solid ${def.color}`,
                  background: isSel ? def.color : 'transparent',
                  color: isSel ? def.text : def.color,
                  boxShadow: isSel ? `0 0 12px ${def.color}55` : 'none',
                  transform: isSel ? 'scale(1.03)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '44px',
                }}
              >
                {def.label}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: '12px', color: '#AAAAAA', marginBottom: '24px', fontStyle: 'italic' }}>
          {selTag
            ? `"${TAG_DEFS[selTag].label}" selected — click a panel to apply`
            : 'Click a tag above to start tagging panels'}
        </p>

        {/* Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {CARDS.map((c, i) => {
            const tag       = panelTags[i];
            const refTag    = refTagArray[i];
            const def       = tag ? TAG_DEFS[tag] : null;
            const isCorrect = revealed && tag === refTag;
            const isWrong   = revealed && tag && tag !== refTag;
            return (
              <button
                key={c.id}
                onClick={() => tagPanel(i)}
                aria-pressed={tag !== null}
                style={{
                  display: 'flex', alignItems: 'stretch',
                  width: '100%', textAlign: 'left',
                  background: '#1A1A1A',
                  border: isCorrect ? '1px solid rgba(154,221,189,0.4)'
                        : isWrong   ? '1px solid rgba(189,57,57,0.4)'
                        : def       ? `1px solid ${def.color}55`
                        :              '1px solid rgba(89,65,63,0.15)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: selTag && !revealed ? 'pointer' : 'default',
                  opacity: revealed && !tag ? 0.5 : 1,
                  minHeight: '44px',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Color ribbon */}
                <div style={{
                  width: '5px', flexShrink: 0,
                  background: isCorrect ? '#9ADDBD'
                             : isWrong  ? '#BD3939'
                             : def      ? def.color
                             :            'rgba(89,65,63,0.2)',
                  transition: 'background 0.2s',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', flex: 1 }}>
                  {/* Number */}
                  <div style={{
                    flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#222222',
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#BD3939' }}>{i + 1}</span>
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 500, margin: 0 }}>{c.text}</p>
                  </div>

                  {/* Tag badge */}
                  {def && (
                    <span style={{
                      padding: '4px 12px', borderRadius: '999px',
                      fontSize: '11px', fontWeight: 700, flexShrink: 0,
                      background: def.color + '22', color: def.color,
                      border: `1px solid ${def.color}44`,
                    }}>
                      {def.label}
                    </span>
                  )}

                  {/* Correct/wrong */}
                  {revealed && tag && (
                    <span className="material-symbols-outlined icon-filled" style={{ fontSize: '18px', color: isCorrect ? '#9ADDBD' : '#BD3939', flexShrink: 0 }}>
                      {isCorrect ? 'check_circle' : 'cancel'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Reference reveal */}
        {revealed && (
          <div style={{
            borderRadius: '12px', padding: '32px', marginBottom: '24px',
            position: 'relative', overflow: 'hidden',
            background: '#0F5560',
            animation: 'fadeUp 0.4s ease-out forwards',
          }} aria-live="polite">
            <div style={{
              position: 'absolute', right: '-32px', top: '-32px',
              width: '128px', height: '128px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)', filter: 'blur(40px)',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', zIndex: 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#7DD5D5', flexShrink: 0 }}>lightbulb</span>
              <div>
                <h4 style={{ fontWeight: 700, color: '#FFF', fontSize: '16px', marginBottom: '6px', marginTop: 0 }}>Reference Tags Applied</h4>
                <p style={{ color: '#9AF1F2', lineHeight: 1.7, fontSize: '15px', margin: '0 0 16px' }}>
                  A strong data story balances all three threads. Notice how the <strong>Data Discovery</strong> panels (2–4) form the core tension — Zawadi's coverage gap is introduced, then proven with sales data and restock times, before any implications are drawn.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.entries(TAG_DEFS).map(([key, def]) => (
                    <span key={key} style={{
                      padding: '4px 12px', borderRadius: '999px',
                      fontSize: '11px', fontWeight: 700,
                      background: def.color + '22', color: def.color,
                      border: `1px solid ${def.color}44`,
                    }}>
                      {def.label}: {refTagArray.filter(t => t === key).length} panels
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {!revealed ? (
            <CTABtn onClick={() => setRevealed(true)} disabled={!allTagged}>
              <span>See Reference Tagging</span>
              <span className="material-symbols-outlined">visibility</span>
            </CTABtn>
          ) : (
            <CTABtn onClick={onNext}>
              <span>Complete Activity</span>
              <span className="material-symbols-outlined">check_circle</span>
            </CTABtn>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── COMPLETION ──────────────────────────────────────────────── */
function Completion({ onRetry }) {
  const { goHome, markComplete } = useApp();

  useEffect(() => {
    markComplete(2);
  }, []);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: '80px 16px',
      textAlign: 'center',
      animation: 'slideInPage 400ms cubic-bezier(0.25,0.46,0.45,0.94) both',
    }}>
      <div style={{ maxWidth: '512px' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>🎯</div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFF', marginBottom: '12px', marginTop: 0 }}>
          Activity Complete!
        </h2>
        <p style={{ fontSize: '17px', color: '#AAAAAA', lineHeight: 1.7, marginBottom: '32px' }}>
          You've sequenced a data story, mapped its tension arc, and identified the narrative threads that give it structure. This is the backbone of every compelling data presentation.
        </p>
        <div style={{
          borderRadius: '12px', padding: '24px', marginBottom: '20px',
          background: '#1A1A1A', border: '1px solid rgba(89,65,63,0.15)',
        }}>
          <p style={{ fontSize: '15px', color: '#9AF1F2', fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
            "Order changes everything. When data is told as a story — with context, complication, discovery, and resolution — it stops being information and starts being persuasion."
          </p>
        </div>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 24, fontStyle: 'italic' }}>
          Next, Amara must take that structured story and tailor it for three very different people sitting in the same boardroom.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <GhostBtn onClick={onRetry}>
            <span className="material-symbols-outlined">refresh</span>
            Try Again
          </GhostBtn>
          <CTABtn onClick={goHome} breathe>
            <span>Next Activity</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </CTABtn>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ──────────────────────────────────────────── */
export default function Activity02() {
  const [page, setPage] = useState(0);
  const next = () => setPage(p => p + 1);

  const progress = PROGRESS[page] ?? 100;

  return (
    <>
      <style>{`
        @keyframes slideInPage {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes ctaBreathe {
          0%, 100% { box-shadow: 0 0 20px rgba(189,57,57,0.15); }
          50%       { box-shadow: 0 0 36px rgba(189,57,57,0.45); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-5px); }
          40%      { transform: translateX(5px); }
          60%      { transform: translateX(-3px); }
          80%      { transform: translateX(3px); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.15); }
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          user-select: none;
        }
        .icon-filled {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      {page === 0 && (
        <NarrativeIntro
          data={AMARA[2].intro}
          activityNumber={2}
          onStart={() => setPage(1)}
          sidebarDot={2}
          progress={12}
        />
      )}
      {page === 1 && <Page1 onNext={next} />}
      {page === 2 && <Page2 onNext={next} />}
      {page === 3 && <Page3 onNext={next} />}
      {page === 4 && <Page4 onNext={next} />}
      {page === 5 && (
        <Debrief
          data={AMARA[2].debrief}
          activityNumber={2}
          onFinish={next}
          sidebarDot={2}
          progress={100}
        />
      )}
      {page === 6 && <Completion onRetry={() => setPage(1)} />}

      {/* Ambient glows */}
      <div style={{
        position: 'fixed', pointerEvents: 'none', borderRadius: '50%',
        top: '-20%', right: '-15%', width: '45%', height: '45%',
        background: 'rgba(189,57,57,0.03)', filter: 'blur(120px)',
      }} />
      <div style={{
        position: 'fixed', pointerEvents: 'none', borderRadius: '50%',
        bottom: '-20%', left: '-10%', width: '35%', height: '35%',
        background: 'rgba(0,117,118,0.04)', filter: 'blur(100px)',
      }} />
    </>
  );
}
