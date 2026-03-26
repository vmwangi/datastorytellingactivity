import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import ActivityHeader from '../../components/ActivityHeader';
import NavBar from '../../components/NavBar';
import TealCard from '../../components/TealCard';
import { useApp } from '../../context/AppContext';
import NarrativeIntro from '../../components/NarrativeIntro';
import Debrief from '../../components/Debrief';
import { AMARA } from '../../data/amara';

/* ── DATA ──────────────────────────────────────────────────── */
const JARGON_SENTENCE =
  'Our YoY channel penetration rate shows positive CAGR, but QoQ churn in the SME segment has impacted ARPU, and rising CAC in emerging territories is compressing our ROI against benchmark KPIs.';

const PARA_PARTS = [
  { t: 'text',   s: 'Our ' },
  { t: 'jargon', id: 'YoY',  s: 'YoY' },
  { t: 'text',   s: ' sales data shows overall growth, with a ' },
  { t: 'jargon', id: 'CAGR', s: 'CAGR' },
  { t: 'text',   s: ' of 11% across all product lines. However, ' },
  { t: 'jargon', id: 'QoQ',  s: 'QoQ' },
  { t: 'text',   s: ' trends in our ' },
  { t: 'jargon', id: 'SME',  s: 'SME' },
  { t: 'text',   s: ' retailer segment show declining reorder rates. When we examine ' },
  { t: 'jargon', id: 'ARPU', s: 'ARPU' },
  { t: 'text',   s: ' by territory, revenue per outlet has dropped 8% in the Coast region. Meanwhile, our ' },
  { t: 'jargon', id: 'CAC',  s: 'CAC' },
  { t: 'text',   s: ' in Western Kenya is 2.4× the Nairobi benchmark, which puts pressure on our ' },
  { t: 'jargon', id: 'ROI',  s: 'ROI' },
  { t: 'text',   s: ' and raises questions about whether our current go-to-market model scales beyond established territories.' },
];

// alts[0] = most complex → alts[last] = clearest
const JARGON_ITEMS = [
  { id: 'YoY',  label: 'YoY',  alts: ['Year-on-year percentage delta',         'Year-on-year change',                'Compared to last year'                 ] },
  { id: 'CAGR', label: 'CAGR', alts: ['Compound Annual Growth Rate',           'Average yearly growth rate',         'How fast we have grown each year'      ] },
  { id: 'QoQ',  label: 'QoQ',  alts: ['Sequential quarter-on-quarter variance','Quarter-on-quarter change',          'Compared to last quarter'              ] },
  { id: 'SME',  label: 'SME',  alts: ['Small and Medium Enterprise segment',   'Small and medium-sized businesses',  'Our smaller retail and shop customers'  ] },
  { id: 'ARPU', label: 'ARPU', alts: ['Average Revenue Per Unit/Outlet metric','Revenue generated per outlet',       'How much each shop spends with us'     ] },
  { id: 'CAC',  label: 'CAC',  alts: ['Customer Acquisition Cost metric',      'Cost to sign up a new outlet',       'What we spend per new customer'        ] },
  { id: 'ROI',  label: 'ROI',  alts: ['Return on Investment ratio',            'Profit relative to what we invested','Whether the money we spent was worth it'] },
];

const JARGON_IDS = JARGON_ITEMS.map(j => j.id);

// Feedback per jargon term: [most-complex, medium, clearest]
const SWAP_FEEDBACK = {
  YoY:  [
    'That is still shorthand. Most people outside finance will pause on it.',
    'Better — though "year-on-year" still assumes the reader knows what that cycle means.',
    'Perfect. Three plain words that need no glossary. Anyone reading this instantly moves on.',
  ],
  CAGR: [
    'An acronym decoded is still an acronym. The reader must know what a growth rate is.',
    'More transparent — but "average yearly" still implies a maths step most readers will skip.',
    'This is the question behind the number. Answer the question, not the formula.',
  ],
  QoQ:  [
    'Still financial shorthand. A non-analyst will hesitate.',
    'Better — but "quarter-on-quarter" is jargon dressed in full words.',
    'Clean and immediate. No calendar knowledge required.',
  ],
  SME:  [
    'An acronym that means three different things depending on context. Avoid.',
    '"Small and medium-sized" is accurate — but still a classification, not a description.',
    'This is who they are. A field manager pictures real shops, not a business tier.',
  ],
  ARPU: [
    'A four-letter acronym that finance teams use internally. Stakeholders outside finance will not recognise it.',
    'Accurate — but "per outlet" is still internal language. What does the outlet do with the money?',
    'This is the business question every manager actually asks. No calculation needed.',
  ],
  CAC:  [
    'Acronym-only. Meaningless to anyone not in a growth team or startup context.',
    '"Cost to sign up" is specific and honest — "a new outlet" makes it concrete.',
    'This is what a CEO or board member would say out loud. Match that register.',
  ],
  ROI:  [
    'ROI is widely known — but it still distances the reader from what is actually being asked.',
    'Specific and honest. But "profit relative to" still requires a mental ratio.',
    'This is the only question a decision-maker cares about. Give them the answer, not the metric name.',
  ],
};

const AFTER_REF =
  'Our sales data shows we grew 11% compared to last year. However, smaller retail shops in the Coast region are reordering less frequently — revenue per shop dropped 8%. Signing up new shops in Western Kenya costs us nearly two and a half times what it costs in Nairobi, which raises a question: does our current sales approach actually work outside markets where we are already established?';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initRankings() {
  const r = {};
  JARGON_ITEMS.forEach(j => { r[j.id] = shuffleArray(j.alts); });
  return r;
}

/* ── PROGRESS ───────────────────────────────────────────────── */
const PROGRESS = { 0: 37, 1: 37, 2: 52, 3: 67, 4: 80, 5: 80 };

/* ── PAGE 1 — CONCEPT INTRO ──────────────────────────────────── */
function Page1({ onNext }) {
  const [blurPx,  setBlurPx]  = useState(10);
  const [step,    setStep]    = useState(0);
  const [chip,    setChip]    = useState(null);
  const [breathe, setBreathe] = useState(false);

  useEffect(() => {
    const ts = [
      setTimeout(() => setBlurPx(0),    150),
      setTimeout(() => setStep(1),      1800),
      setTimeout(() => setStep(2),      2800),
      setTimeout(() => setStep(3),      3800),
      setTimeout(() => setBreathe(true), 4500),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const show = s => ({
    opacity: step >= s ? 1 : 0,
    transform: step >= s ? 'none' : 'translateY(8px)',
    transition: 'all 0.55s ease',
  });

  const initChips = [
    { id: 'mostly',   label: 'Mostly'    },
    { id: 'somewhat', label: 'Somewhat'  },
    { id: 'notatall', label: 'Not at all' },
  ];

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '80px 16px',
      animation: 'fadeInUp .45s ease-out forwards' }}>
      <div style={{ width: '100%', maxWidth: 680 }}>

        {/* Headline */}
        <div style={{ marginBottom: 40 }}>
          <ActivityHeader number={4} title="Clarity Over Complexity" />
        </div>

        {/* Jargon card with blur */}
        <div style={{ background: '#1C1B1B', border: '1px solid rgba(189,57,57,0.45)',
          borderRadius: 12, padding: '24px 28px', marginBottom: 32,
          filter: `blur(${blurPx}px)`, transition: 'filter 1.5s ease' }}>
          <p style={{ fontSize: 'clamp(14px,2.2vw,18px)', color: '#e5e2e1',
            lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
            "{JARGON_SENTENCE}"
          </p>
        </div>

        {/* Reaction */}
        <div style={show(1)}>
          <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', color: '#e5e2e1',
            fontWeight: 600, marginBottom: 12 }}>
            Did you understand that?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: chip ? 16 : 32 }}>
            {initChips.map(c => (
              <button key={c.id} onClick={() => setChip(c.id)}
                style={{
                  background: chip === c.id ? 'rgba(189,57,57,0.15)' : 'rgba(42,42,42,0.5)',
                  color:      chip === c.id ? '#BD3939' : '#888',
                  border:     `1px solid ${chip === c.id ? 'rgba(189,57,57,0.5)' : 'rgba(89,65,63,0.2)'}`,
                  minHeight: 44, padding: '10px 20px',
                  borderRadius: 999, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', transition: 'all .15s',
                  fontFamily: 'Inter',
                }}>
                {c.label}
              </button>
            ))}
          </div>

          {chip && (
            <div style={{
              marginBottom: 32, padding: '12px 16px', borderRadius: 10,
              animation: 'fadeInUp .35s ease-out forwards',
              ...(chip === 'mostly'
                ? { background: 'rgba(57,155,163,0.08)', borderLeft: '3px solid #399BA3' }
                : chip === 'somewhat'
                ? { background: 'rgba(189,57,57,0.07)', borderLeft: '3px solid rgba(189,57,57,0.5)' }
                : { background: 'rgba(154,221,189,0.07)', borderLeft: '3px solid rgba(154,221,189,0.4)' }),
            }}>
              {chip === 'mostly' && (
                <p style={{ fontSize: 14, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
                  You caught most of it — but notice how much mental effort it required.
                  Now picture the Head of Distribution reading this on a Friday afternoon.
                  <strong style={{ color: '#e5e2e1' }}> If understanding it takes effort, you have already lost part of your audience.</strong>
                </p>
              )}
              {chip === 'somewhat' && (
                <p style={{ fontSize: 14, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
                  That hesitation is the problem. If you — someone working with this data — found it
                  unclear, the CEO and the Head of Distribution will find it worse.
                  <strong style={{ color: '#e5e2e1' }}> Jargon does not signal expertise. It signals that you wrote for yourself, not your audience.</strong>
                </p>
              )}
              {chip === 'notatall' && (
                <p style={{ fontSize: 14, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
                  Good — that honest reaction is exactly what Amara's stakeholders felt.
                  A sentence full of acronyms forces the reader to decode before they can decide.
                  <strong style={{ color: '#e5e2e1' }}> When people stop to translate your language, they stop absorbing your argument.</strong>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Concept text */}
        <div style={show(2)}>
          <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: '#AAAAAA',
            lineHeight: 1.75, marginBottom: 16 }}>
            Complexity is not rigour. It is confusion wearing a suit. A data story your audience
            cannot understand has failed — no matter how accurate the numbers are.
          </p>
        </div>

        {/* Tagline */}
        <div style={show(3)}>
          <p style={{ fontSize: 'clamp(16px,2.8vw,20px)', fontStyle: 'italic',
            color: '#e5e2e1', fontWeight: 600 }}>
            Clarity is the ultimate data skill.
          </p>
        </div>
      </div>

      <NavBar
        onNext={onNext}
        nextLabel="Fix This"
        nextIcon="arrow_forward"
      />
    </div>
  );
}

/* ── PAGE 2 — IDENTIFY JARGON ────────────────────────────────── */
function Page2({ onNext }) {
  const [flagged,  setFlagged]  = useState(new Set());
  const [hint,     setHint]     = useState(false);
  const [hintTick, setHintTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHintTick(h => h + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (hintTick >= 60 && flagged.size < 4) setHint(true);
  }, [hintTick, flagged.size]);

  function toggle(id) {
    setFlagged(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const canContinue = flagged.size >= 5;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      paddingBottom: 96, paddingTop: '5rem',
      animation: 'fadeInUp .45s ease-out forwards' }}>
      <div style={{ padding: '0 16px', maxWidth: 800, width: '100%', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
            Step 1 of 3 — Identify the Jargon
          </p>
          <p style={{ fontSize: 'clamp(14px,2.2vw,17px)', color: '#e5e2e1', lineHeight: 1.5, margin: 0 }}>
            Read the paragraph below. Click any phrase you think is jargon or unclear.
            There are <strong style={{ color: '#BD3939' }}>7</strong> to find.
          </p>
        </div>

        {/* Amara context */}
        <div style={{
          background: 'rgba(189,57,57,.06)', borderRadius: 10,
          padding: '12px 16px', borderLeft: '3px solid rgba(189,57,57,.4)', marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: '#BD3939', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5, fontWeight: 700 }}>
            Amara's mistake
          </div>
          <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
            After tailoring her analysis for each stakeholder, Amara wrote up her executive summary in the language she thinks in — the language of a data scientist.
            The Head of Distribution, an experienced operator with eleven years in the field, replied the next morning: <em style={{ color: '#e5e2e1' }}>"I don't understand half of this."</em>
            Find every term that would stop a non-analyst in their tracks.
          </p>
        </div>

        {/* Paragraph card */}
        <div style={{ background: '#1C1B1B', border: '1px solid rgba(89,65,63,0.2)',
          borderRadius: 12, padding: '24px', marginBottom: 24, position: 'relative' }}>
          {/* Counter badge */}
          <div style={{ position: 'absolute', top: 16, right: 16 }} aria-live="polite">
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: flagged.size === 7 ? '#9ADDBD' : flagged.size >= 5 ? '#e5e2e1' : '#555',
              letterSpacing: '0.08em',
            }}>
              {flagged.size} / 7 phrases flagged
            </span>
          </div>

          <p style={{ fontSize: 'clamp(14px,2.2vw,18px)', color: '#e5e2e1',
            lineHeight: 1.9, paddingTop: 8, margin: 0 }}>
            {PARA_PARTS.map((p, i) => {
              if (p.t === 'text') return <span key={i}>{p.s}</span>;
              const isFlagged = flagged.has(p.id);
              return (
                <span
                  key={i}
                  onClick={() => toggle(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggle(p.id)}
                  style={{
                    background: isFlagged ? 'rgba(189,57,57,0.12)' : 'transparent',
                    color:      isFlagged ? '#BD3939' : '#e5e2e1',
                    fontWeight: isFlagged ? 700 : 400,
                    borderBottom: isFlagged ? '2px solid #BD3939' : 'none',
                    cursor: 'pointer',
                    borderRadius: 2,
                    padding: '0 2px',
                    paddingBottom: isFlagged ? 1 : 0,
                    transition: 'background .15s',
                  }}>
                  {p.s}
                </span>
              );
            })}
          </p>
        </div>

        {/* Hint */}
        {hint && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            animation: 'fadeInUp .45s ease-out forwards' }}>
            <span className="material-symbols-outlined" style={{ color: '#BD3939', fontSize: 18 }}>lightbulb</span>
            <p style={{ fontSize: 13, color: '#AAAAAA', fontStyle: 'italic', margin: 0 }}>
              Hint: Look for acronyms, abbreviations, and finance-specific terms.
            </p>
          </div>
        )}

        {/* Flagged chips — appear one by one as selected */}
        {flagged.size > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '.1em',
              textTransform: 'uppercase', marginBottom: 8 }}>
              Flagged so far
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} aria-live="polite">
              {JARGON_IDS.filter(id => flagged.has(id)).map(id => (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 999,
                  background: 'rgba(189,57,57,0.12)',
                  border: '1px solid rgba(189,57,57,0.4)',
                  animation: 'fadeInUp .3s ease-out forwards',
                }}>
                  <span className="material-symbols-outlined"
                    style={{ fontSize: 12, color: '#BD3939', fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#BD3939' }}>{id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <NavBar
        onNext={() => onNext(flagged)}
        nextLabel="Continue"
        nextIcon="arrow_forward"
        nextDisabled={!canContinue}
      />
    </div>
  );
}

/* ── PAGE 3 — RANK ALTERNATIVES ──────────────────────────────── */
function isTermCorrect(id, rankings) {
  const item = JARGON_ITEMS.find(j => j.id === id);
  return item.alts.every((alt, i) => rankings[id][i] === alt);
}

function Page3({ onNext }) {
  const [rankings,    setRankings]    = useState(initRankings);
  const [dragging,    setDragging]    = useState(null); // { termId, fromIdx }
  const [dragOver,    setDragOver]    = useState(null); // { termId, toIdx }

  const correctCount = JARGON_ITEMS.filter(j => isTermCorrect(j.id, rankings)).length;
  const allCorrect   = correctCount === JARGON_ITEMS.length;

  function moveUp(id, idx) {
    if (idx === 0) return;
    setRankings(prev => {
      const arr = [...prev[id]];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return { ...prev, [id]: arr };
    });
  }

  function moveDown(id, idx) {
    setRankings(prev => {
      const arr = [...prev[id]];
      if (idx >= arr.length - 1) return prev;
      [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
      return { ...prev, [id]: arr };
    });
  }

  function onDragStart(e, termId, fromIdx) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ termId, fromIdx }));
    setDragging({ termId, fromIdx });
  }

  function onDragOver(e, termId, toIdx) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver({ termId, toIdx });
  }

  function onDrop(e, termId, toIdx) {
    e.preventDefault();
    try {
      const { termId: fromTermId, fromIdx } = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (fromTermId !== termId || fromIdx === toIdx) return;
      setRankings(prev => {
        const arr = [...prev[termId]];
        const [moved] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, moved);
        return { ...prev, [termId]: arr };
      });
    } catch {}
    setDragging(null);
    setDragOver(null);
  }

  function onDragEnd() {
    setDragging(null);
    setDragOver(null);
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      paddingBottom: 96, paddingTop: '5rem',
      animation: 'fadeInUp .45s ease-out forwards' }}>
      <div style={{ padding: '0 16px', maxWidth: 960, width: '100%', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
            Step 2 of 3 — Rank the Alternatives
          </p>
          <p style={{ fontSize: 'clamp(13px,2vw,16px)', color: '#e5e2e1', margin: 0 }}>
            For each jargon term, order its alternatives from{' '}
            <strong style={{ color: '#BD3939' }}>most complex</strong> (top) to{' '}
            <strong style={{ color: '#9ADDBD' }}>clearest</strong> (bottom).
          </p>
        </div>

        {/* Reference paragraph */}
        <div style={{ background: '#1C1B1B', border: '1px solid rgba(189,57,57,0.2)',
          borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: '#555',
            letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            Original — for reference
          </p>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7, margin: 0 }}>
            {PARA_PARTS.map((p, i) => (
              <span key={i} style={{
                color:      p.t === 'jargon' ? 'rgba(189,57,57,0.8)' : '#666',
                fontWeight: p.t === 'jargon' ? 700 : 400,
              }}>
                {p.s}
              </span>
            ))}
          </p>
        </div>

        {/* Direction row */}
        <div style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#BD3939' }}>arrow_upward</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#BD3939',
              letterSpacing: '0.12em', textTransform: 'uppercase' }}>Most Complex</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#9ADDBD',
              letterSpacing: '0.12em', textTransform: 'uppercase' }}>Clearest</span>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#9ADDBD' }}>arrow_downward</span>
          </div>
        </div>

        {/* Columns — horizontal scroll */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
          {JARGON_ITEMS.map(item => {
            const ranked   = rankings[item.id];
            const correct  = isTermCorrect(item.id, rankings);
            return (
              <div key={item.id} style={{ flexShrink: 0, display: 'flex', width: 190 }}>
                {/* Gradient bar */}
                <div style={{ flexShrink: 0, width: 4, borderRadius: 999, marginRight: 12,
                  alignSelf: 'stretch', minHeight: 160,
                  background: correct
                    ? '#9ADDBD'
                    : 'linear-gradient(to bottom, #BD3939, #399BA3, #9ADDBD)' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Column header */}
                  <div style={{
                    background: correct ? 'rgba(154,221,189,0.1)' : 'rgba(189,57,57,0.08)',
                    border: `1px solid ${correct ? 'rgba(154,221,189,0.4)' : 'rgba(189,57,57,0.25)'}`,
                    borderRadius: 8, padding: '8px 12px', marginBottom: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all .3s',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: correct ? '#9ADDBD' : '#BD3939' }}>{item.label}</span>
                    {correct && (
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#9ADDBD' }}>check_circle</span>
                    )}
                  </div>
                  {/* Chips */}
                  {ranked.map((alt, idx) => {
                    const isDraggingThis = dragging?.termId === item.id && dragging?.fromIdx === idx;
                    const isDropTarget   = dragOver?.termId === item.id && dragOver?.toIdx === idx && !isDraggingThis;
                    return (
                    <div key={alt}
                      draggable
                      onDragStart={e => onDragStart(e, item.id, idx)}
                      onDragOver={e => onDragOver(e, item.id, idx)}
                      onDrop={e => onDrop(e, item.id, idx)}
                      onDragEnd={onDragEnd}
                      style={{ display: 'flex', alignItems: 'center', gap: 6,
                        marginBottom: 6, borderRadius: 8, padding: '10px 12px',
                        background: isDropTarget ? 'rgba(57,155,163,0.1)' : '#1C1B1B',
                        border: isDropTarget ? '1px dashed rgba(57,155,163,0.6)' : '1px solid rgba(89,65,63,0.2)',
                        opacity: isDraggingThis ? 0.35 : 1,
                        cursor: 'grab',
                        transition: 'all .15s',
                      }}>
                      {/* Drag handle */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2,
                        flexShrink: 0, opacity: 0.5, marginRight: 4 }}>
                        {[0, 1, 2].map(r => (
                          <div key={r} style={{ display: 'flex', gap: 2 }}>
                            {[0, 1].map(c => (
                              <div key={c} style={{ width: 3, height: 3, borderRadius: '50%', background: '#888' }} />
                            ))}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: '#e5e2e1', lineHeight: 1.35, flex: 1 }}>{alt}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 4 }}>
                        <button
                          onClick={() => moveUp(item.id, idx)}
                          disabled={idx === 0}
                          style={{ width: 18, height: 18, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', background: 'transparent', border: 'none',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            opacity: idx === 0 ? 0.2 : 1, borderRadius: 4,
                            minHeight: 18,
                          }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#888' }}>expand_less</span>
                        </button>
                        <button
                          onClick={() => moveDown(item.id, idx)}
                          disabled={idx === ranked.length - 1}
                          style={{ width: 18, height: 18, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', background: 'transparent', border: 'none',
                            cursor: idx === ranked.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: idx === ranked.length - 1 ? 0.2 : 1, borderRadius: 4,
                            minHeight: 18,
                          }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#888' }}>expand_more</span>
                        </button>
                      </div>
                    </div>
                  );})}
                  {/* Clearest indicator */}
                  <div style={{ marginTop: 4, padding: '0 12px' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#9ADDBD',
                      letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      ↑ clearest = bottom
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress / success feedback */}
        {correctCount > 0 && !allCorrect && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10,
            background: 'rgba(57,155,163,0.08)', border: '1px solid rgba(57,155,163,0.25)',
            animation: 'fadeInUp .35s ease-out forwards' }}>
            <p style={{ fontSize: 13, color: '#399BA3', margin: 0, fontWeight: 600 }}>
              {correctCount} of {JARGON_ITEMS.length} terms ranked correctly.{' '}
              <span style={{ fontWeight: 400, color: '#888' }}>Keep going — put the clearest option at the bottom of each column.</span>
            </p>
          </div>
        )}

        {allCorrect && (
          <div style={{ marginTop: 16, padding: '16px 20px', borderRadius: 12,
            background: 'rgba(154,221,189,0.1)', border: '1px solid rgba(154,221,189,0.4)',
            animation: 'fadeInUp .35s ease-out forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#9ADDBD' }}>check_circle</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#9ADDBD' }}>All terms ranked correctly</span>
            </div>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.6 }}>
              You have identified the clarity ladder for every term — most complex at the top, plainest language at the bottom.
              Now apply these swaps to see how the paragraph transforms.
            </p>
          </div>
        )}
      </div>

      <NavBar
        onNext={() => onNext(rankings)}
        nextLabel="Use These"
        nextIcon="arrow_forward"
      />
    </div>
  );
}

/* ── PAGE 4 — SWAP + BEFORE/AFTER ────────────────────────────── */
function Page4({ rankings, onRetry, onFinish }) {
  const { goHome, markComplete, recordAttempt, recordError } = useApp();

  const initSwaps = () => {
    const s = {};
    JARGON_ITEMS.forEach(j => { s[j.id] = rankings[j.id][rankings[j.id].length - 1]; });
    return s;
  };

  const [swaps,     setSwaps]     = useState(initSwaps);
  const [openDrop,  setOpenDrop]  = useState(null);
  const [swapped,   setSwapped]   = useState(new Set());
  const [flashing,  setFlashing]  = useState(null);
  const [mintWords, setMintWords] = useState(new Set());
  const [showSplit, setShowSplit] = useState(false);
  const [barAnim,   setBarAnim]   = useState(false);
  const [lastSwap,  setLastSwap]  = useState(null); // { id, idx, alt }

  const allSwapped = swapped.size === JARGON_IDS.length;

  useEffect(() => {
    if (allSwapped) {
      markComplete(4);
      setTimeout(() => {
        setShowSplit(true);
        setTimeout(() => setBarAnim(true), 300);
      }, 400);
    }
  }, [allSwapped]);

  function confirmSwap(id) {
    setOpenDrop(null);
    setFlashing(id);
    setTimeout(() => {
      setFlashing(null);
      setSwapped(prev => new Set([...prev, id]));
      setMintWords(prev => new Set([...prev, id]));
      setTimeout(() => setMintWords(prev => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      }), 2000);
    }, 500);
  }

  function pickAlt(id, alt) {
    const item = JARGON_ITEMS.find(j => j.id === id);
    const idx  = item ? item.alts.indexOf(alt) : -1; // 0=most complex, 2=clearest
    if (idx === 2) recordAttempt(); else recordError();
    setSwaps(prev => ({ ...prev, [id]: alt }));
    setLastSwap({ id, idx, alt });
    confirmSwap(id);
  }

  function swapAll() {
    JARGON_IDS.forEach((id, i) => {
      setTimeout(() => {
        setSwapped(prev => new Set([...prev, id]));
        setMintWords(prev => new Set([...prev, id]));
        setTimeout(() => setMintWords(prev => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        }), 2000);
      }, i * 120);
    });
  }

  function buildAfterParagraph() {
    return PARA_PARTS.map(p => p.t === 'text' ? p.s : (swaps[p.id] || p.s)).join('');
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      paddingBottom: 96, paddingTop: '5rem',
      animation: 'fadeInUp .45s ease-out forwards' }}>
      <div style={{ padding: '0 16px', maxWidth: 800, width: '100%', margin: '0 auto' }}>

        {/* Amara context */}
        <div style={{ background: 'rgba(189,57,57,0.06)', border: '1px solid rgba(189,57,57,0.25)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            Amara's moment
          </p>
          <p style={{ fontSize: 14, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
            Amara has identified every piece of jargon and ranked the alternatives.
            Now comes the real test — choosing the right replacement for each term before
            the paragraph lands in front of the Head of Distribution.
            Every word she swaps is a barrier she removes between the data and the decision.
          </p>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
            Step 3 of 3 — Apply the Swaps
          </p>
          <p style={{ fontSize: 'clamp(13px,2vw,16px)', color: '#e5e2e1', margin: 0 }} aria-live="polite">
            {!allSwapped
              ? 'Click any jargon term to replace it with a clearer alternative.'
              : 'All terms replaced. See the transformation below.'}
          </p>
        </div>

        {!showSplit ? (
          <>
            {/* Interactive paragraph */}
            <div style={{ background: '#1C1B1B', border: '1px solid rgba(89,65,63,0.2)',
              borderRadius: 12, padding: '24px', marginBottom: 24, position: 'relative' }}>
              {/* Swap all shortcut */}
              {!allSwapped && (
                <button onClick={swapAll}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    color: '#555', border: '1px solid rgba(89,65,63,0.2)',
                    background: 'transparent', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', minHeight: 44, fontFamily: 'Inter',
                  }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_fix_high</span>
                  Apply all
                </button>
              )}

              <p style={{ fontSize: 'clamp(14px,2.2vw,18px)', lineHeight: 1.9,
                paddingTop: 8, margin: 0 }}>
                {PARA_PARTS.map((p, i) => {
                  if (p.t === 'text') return <span key={i} style={{ color: '#e5e2e1' }}>{p.s}</span>;

                  const isSwapped  = swapped.has(p.id);
                  const isFlashing = flashing === p.id;
                  const isMint     = mintWords.has(p.id);
                  const isOpen     = openDrop === p.id;

                  return (
                    <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
                      <span
                        onClick={() => { if (!isSwapped) setOpenDrop(isOpen ? null : p.id); }}
                        role={!isSwapped ? 'button' : undefined}
                        tabIndex={!isSwapped ? 0 : undefined}
                        onKeyDown={e => {
                          if (!isSwapped && (e.key === 'Enter' || e.key === ' '))
                            setOpenDrop(isOpen ? null : p.id);
                        }}
                        style={{
                          color:      isSwapped ? '#e5e2e1' : '#BD3939',
                          fontWeight: 700,
                          borderBottom: isSwapped && isMint ? '2px solid #9ADDBD'
                                      : isSwapped           ? 'none'
                                      :                       '2px solid rgba(189,57,57,0.6)',
                          cursor:     isSwapped ? 'default' : 'pointer',
                          padding:    '0 2px',
                          borderRadius: 2,
                          background: isFlashing ? 'rgba(189,57,57,0.2)' : 'transparent',
                          transition: 'all .15s',
                          animation:  isFlashing ? 'scaleIn .6s ease-out' : 'none',
                        }}>
                        {isSwapped ? swaps[p.id] : p.s}
                        {!isSwapped && (
                          <span className="material-symbols-outlined"
                            style={{ fontSize: 13, color: 'rgba(189,57,57,0.7)',
                              verticalAlign: 'middle', marginLeft: 2 }}>
                            swap_horiz
                          </span>
                        )}
                      </span>

                      {/* Dropdown */}
                      {isOpen && (
                        <div style={{
                          position: 'absolute', zIndex: 30, top: '100%', left: 0, marginTop: 4,
                          borderRadius: 12, overflow: 'hidden',
                          background: '#222222', border: '1px solid rgba(89,65,63,0.3)',
                          minWidth: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                          animation: 'popIn .25s ease-out forwards',
                        }}>
                          <div style={{ padding: '8px 12px',
                            borderBottom: '1px solid rgba(89,65,63,0.2)' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#BD3939',
                              letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                              Alternatives for "{p.id}"
                            </span>
                          </div>
                          {rankings[p.id].map((alt, idx) => {
                            const isClearest = idx === rankings[p.id].length - 1;
                            return (
                            <button key={alt} onClick={() => pickAlt(p.id, alt)}
                              style={{
                                width: '100%', textAlign: 'left', padding: '12px 14px',
                                display: 'flex', alignItems: 'center', gap: 12,
                                background: isClearest
                                  ? 'rgba(154,221,189,0.12)' : 'transparent',
                                borderBottom: idx < rankings[p.id].length - 1
                                  ? '1px solid rgba(89,65,63,0.1)' : 'none',
                                border: 'none', cursor: 'pointer', minHeight: 44,
                                fontFamily: 'Inter',
                                transition: 'background .15s',
                              }}>
                              <div style={{
                                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                background: idx === 0 ? '#BD3939'
                                  : isClearest ? '#9ADDBD' : '#399BA3',
                              }} />
                              <span style={{
                                fontSize: 13, lineHeight: 1.4, flex: 1,
                                color:      isClearest ? '#9ADDBD' : '#e5e2e1',
                                fontWeight: isClearest ? 700 : 400,
                              }}>{alt}</span>
                              {isClearest && (
                                <span className="material-symbols-outlined"
                                  style={{ fontSize: 15, color: '#9ADDBD', marginLeft: 4 }}>
                                  check_circle
                                </span>
                              )}
                            </button>
                            );
                          })}
                        </div>
                      )}
                    </span>
                  );
                })}
              </p>
            </div>

            {/* Swap feedback */}
            {lastSwap && (() => {
              const isClean   = lastSwap.idx === 2;
              const isMedium  = lastSwap.idx === 1;
              const msg       = (SWAP_FEEDBACK[lastSwap.id] || [])[lastSwap.idx] || '';
              const accent    = isClean ? '#9ADDBD' : isMedium ? '#399BA3' : '#a88a87';
              const bg        = isClean ? 'rgba(154,221,189,0.07)' : isMedium ? 'rgba(57,155,163,0.07)' : 'rgba(168,138,135,0.07)';
              const border    = isClean ? 'rgba(154,221,189,0.3)' : isMedium ? 'rgba(57,155,163,0.3)' : 'rgba(168,138,135,0.2)';
              const icon      = isClean ? 'check_circle' : isMedium ? 'arrow_upward' : 'info';
              return (
                <div key={lastSwap.id + lastSwap.idx} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                  background: bg, border: `1px solid ${border}`,
                  animation: 'fadeInUp .3s ease-out forwards',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: accent, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '.06em', textTransform: 'uppercase', marginRight: 6 }}>
                      {isClean ? 'Clearest' : isMedium ? 'Better' : 'Still complex'}
                    </span>
                    <span style={{ fontSize: 13, color: '#AAAAAA', lineHeight: 1.55 }}>{msg}</span>
                  </div>
                </div>
              );
            })()}

            {/* Progress chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}
              aria-live="polite">
              {JARGON_IDS.map(id => (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 999,
                  background: swapped.has(id) ? 'rgba(154,221,189,0.1)' : 'rgba(42,42,42,0.5)',
                  border: `1px solid ${swapped.has(id) ? 'rgba(154,221,189,0.35)' : 'rgba(89,65,63,0.15)'}`,
                  transition: 'all .3s',
                }}>
                  {swapped.has(id)
                    ? <span className="material-symbols-outlined"
                        style={{ fontSize: 12, color: '#9ADDBD',
                          fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    : <span style={{ fontSize: 9, color: '#555' }}>○</span>
                  }
                  <span style={{ fontSize: 11, fontWeight: 700,
                    color: swapped.has(id) ? '#9ADDBD' : '#555' }}>{id}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ── SPLIT VIEW ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            {/* BEFORE */}
            <div style={{ flex: 1, background: '#1C1B1B',
              border: '1px solid rgba(89,65,63,0.15)', borderRadius: 12, padding: 24,
              animation: 'slideUp .4s ease-out forwards' }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#BD3939',
                  letterSpacing: '0.12em', textTransform: 'uppercase' }}>Before</span>
              </div>
              <p style={{ fontSize: 'clamp(13px,1.8vw,16px)', color: '#555', lineHeight: 1.8, margin: 0 }}>
                {PARA_PARTS.map((p, i) => (
                  <span key={i} style={{
                    color:      p.t === 'jargon' ? 'rgba(189,57,57,0.55)' : '#555',
                    fontWeight: p.t === 'jargon' ? 700 : 400,
                  }}>
                    {p.s}
                  </span>
                ))}
              </p>
              {/* Readability bar */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#555',
                    letterSpacing: '0.1em', textTransform: 'uppercase' }}>Readability</span>
                  <span style={{ fontSize: 10, color: '#BD3939', fontWeight: 700 }}>Poor</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: '#222222' }}>
                  <div style={{
                    height: 4, borderRadius: 999, background: '#BD3939',
                    width: barAnim ? '20%' : '0%', transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            </div>

            {/* AFTER */}
            <div style={{ flex: 1, background: '#1C1B1B',
              border: '1px solid rgba(154,221,189,0.25)', borderRadius: 12, padding: 24,
              animation: 'slideUp .4s ease-out .12s forwards' }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9ADDBD',
                  letterSpacing: '0.12em', textTransform: 'uppercase' }}>After</span>
              </div>
              <p style={{ fontSize: 'clamp(13px,1.8vw,16px)', color: '#e5e2e1', lineHeight: 1.8, margin: 0 }}>
                {buildAfterParagraph()}
              </p>
              {/* Readability bar */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#555',
                    letterSpacing: '0.1em', textTransform: 'uppercase' }}>Readability</span>
                  <span style={{ fontSize: 10, color: '#9ADDBD', fontWeight: 700 }}>Good</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: '#222222' }}>
                  <div style={{
                    height: 4, borderRadius: 999, background: '#9ADDBD',
                    width: barAnim ? '85%' : '0%',
                    transition: 'width 1s ease .3s',
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {showSplit && (
          <>
            {/* Reference note */}
            <div style={{ background: '#1C1B1B', border: '1px solid rgba(57,155,163,0.2)',
              borderRadius: 12, padding: 20, marginBottom: 24,
              animation: 'fadeInUp .5s ease forwards' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#399BA3',
                letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                Reference version
              </p>
              <p style={{ fontSize: 14, color: '#AAAAAA', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                "{AFTER_REF}"
              </p>
              <p style={{ fontSize: 12, color: '#555', marginTop: 10, fontStyle: 'italic', marginBottom: 0 }}>
                Your version vs the reference — both reach the same level of clarity.
              </p>
            </div>

            {/* Key insight */}
            <TealCard label="Key Insight">
              The data did not change. The decisions did not change. But your audience can now
              actually read and act on this paragraph — because clarity is not simplification.
              It is respect for your reader's time.
            </TealCard>

            <div style={{ height: 32 }} />
          </>
        )}
      </div>

      {showSplit ? (
        <NavBar
          onNext={onFinish}
          nextLabel="Reflect"
          nextIcon="arrow_forward"
          leftContent={
            <button onClick={onRetry}
              style={{
                padding: '12px 18px', borderRadius: 8, border: '1px solid #2A2A2A',
                color: '#AAAAAA', background: 'transparent', fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'Inter',
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
              Try Again
            </button>
          }
        />
      ) : (
        <NavBar
          onNext={() => {}}
          nextLabel="Apply all swaps first"
          nextDisabled={true}
        />
      )}
    </div>
  );
}

/* ── COMPLETION ──────────────────────────────────────────────── */
function Completion({ onRetry }) {
  const { goHome, markComplete } = useApp();
  useEffect(() => { markComplete(4); }, []);
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: '80px 16px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 512 }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎯</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', marginBottom: 12, marginTop: 0 }}>
          Activity Complete!
        </h2>
        <p style={{ fontSize: 16, color: '#AAAAAA', lineHeight: 1.7, marginBottom: 32 }}>
          You've spotted jargon that locks people out and replaced it with language that invites them in — the mark of analysis that actually gets acted on.
        </p>
        <div style={{
          borderRadius: 12, padding: 24, marginBottom: 20,
          background: '#1A1A1A', border: '1px solid rgba(89,65,63,0.15)',
        }}>
          <p style={{ fontSize: 15, color: '#9AF1F2', fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
            "Clarity is not dumbing down. It's proof that you actually understand what you're saying."
          </p>
        </div>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.65, marginBottom: 24, fontStyle: 'italic' }}>
          Next, Amara turns to her slides — and discovers that clear language isn't enough if the chart itself hides the pattern.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onRetry} style={{
            padding: '12px 20px', borderRadius: 8, border: '1px solid #2A2A2A',
            color: '#AAAAAA', background: 'transparent', fontSize: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
            Try Again
          </button>
          <button onClick={goHome} className="bg-crimson-gradient" style={{
            padding: '13px 24px', borderRadius: 8, border: 'none',
            color: 'white', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter',
          }}>
            Next Activity
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── ACTIVITY 04 ROOT ────────────────────────────────────────── */
export default function Activity04() {
  const { goHome } = useApp();
  const [page,     setPage]     = useState(0);
  const [flagged,  setFlagged]  = useState(null);
  const [rankings, setRankings] = useState(null);

  return (
    <>
      {page === 0 && (
        <NarrativeIntro
          data={AMARA[4].intro}
          activityNumber={4}
          onStart={() => setPage(1)}
          sidebarDot={4}
          progress={37}
        />
      )}
      {page === 1 && <Page1 onNext={() => setPage(2)} />}
      {page === 2 && <Page2 onNext={f => { setFlagged(f); setPage(3); }} />}
      {page === 3 && <Page3 onNext={r => { setRankings(r); setPage(4); }} />}
      {page === 4 && (
        <Page4
          rankings={rankings ?? initRankings()}
          onRetry={() => { setFlagged(null); setRankings(null); setPage(1); }}
          onFinish={() => setPage(5)}
        />
      )}
      {page === 5 && (
        <Debrief
          data={AMARA[4].debrief}
          activityNumber={4}
          onFinish={() => setPage(6)}
          sidebarDot={4}
          progress={80}
        />
      )}
      {page === 6 && <Completion onRetry={() => { setFlagged(null); setRankings(null); setPage(1); }} />}
    </>
  );
}
