import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import NavBar from '../../components/NavBar';
import { useApp } from '../../context/AppContext';
import NarrativeIntro from '../../components/NarrativeIntro';
import Debrief from '../../components/Debrief';
import { AMARA } from '../../data/amara';

/* ── DATA ─────────────────────────────────────────────────────── */
const PHRASES = [
  { id:'p1c', pairId:1, label:'Clinical — Finding',
    text:'40.3% of Western Kenya households purchase cooking oil from informal kiosks rather than registered retail outlets stocking Zawadi.' },
  { id:'p1h', pairId:1, label:'Human — Amara',
    text:"James runs a kiosk in Kisumu. He has asked his distributor for Zawadi cooking oil three times this year. Every time, he was told it isn't available in his area." },
  { id:'p2c', pairId:2, label:'Clinical — Graduate',
    text:'Youth unemployment in emerging markets reached 24.7% in Q3, with graduate placement declining 3.2% year-on-year.' },
  { id:'p2h', pairId:2, label:'Human — Priya',
    text:"After 18 months of rejection letters, Priya finally got a call back. The job wasn't in her field. But it was a start." },
  { id:'p3c', pairId:3, label:'Clinical — Agent',
    text:'Customer service resolution times exceeded SLA thresholds by 34% during peak volume periods last quarter.' },
  { id:'p3h', pairId:3, label:'Human — Marcus',
    text:"By noon, Marcus had already handled 47 tickets. His queue wasn't shrinking. Neither was his lunch break." },
];

// Approximate cold→human reference positions [0–1]
const REF_POS = { p1c:0.07, p2c:0.18, p3c:0.28, p3h:0.60, p2h:0.76, p1h:0.93 };

const PAIRS = [
  { id:1, label:'Amara — The Data Scientist', before:'data-before', after:'data-after' },
  { id:2, label:'Priya — The Graduate', before:'grad-before',   after:'grad-after'   },
  { id:3, label:'Marcus — The Agent',   before:'agent-before',  after:'agent-after'  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── INLINE SVG ILLUSTRATIONS ─────────────────────────────────── */
function ColdChartSVG() {
  return (
    <svg viewBox="0 0 240 150" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="240" height="150" fill="#111" />
      <line x1="28" y1="16" x2="28" y2="120" stroke="#333" strokeWidth="1" />
      <line x1="28" y1="120" x2="228" y2="120" stroke="#333" strokeWidth="1" />
      {[[42,58,30],[76,82,30],[110,44,30],[144,70,30],[178,90,30],[212,52,30]].map(([x,h,w],i)=>(
        <rect key={i} x={x} y={120-h} width={w} height={h} fill="none" stroke="#4A4A4A" strokeWidth="1.5" rx="1" />
      ))}
      {[0,25,50,75,100].map((v,i)=>(
        <text key={i} x="22" y={120-v*.88+3} fontSize="7" fill="#3A3A3A" textAnchor="end">{v}</text>
      ))}
      <text x="128" y="10" fontSize="7" fill="#3A3A3A" textAnchor="middle" letterSpacing=".06em">FIGURE 3.2 — DISTRIBUTION ANALYSIS</text>
      <text x="128" y="138" fontSize="6.5" fill="#3A3A3A" textAnchor="middle">n=2,847 · p&lt;0.001 · CI 95%</text>
    </svg>
  );
}

function WarmMarketSVG() {
  return (
    <svg viewBox="0 0 240 150" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="240" height="150" fill="#1A1209" />
      {/* Market stalls */}
      {[20,80,140,200].map((x,i)=>(
        <g key={i}>
          <rect x={x} y={60} width={40} height={60} rx="2" fill="#2A1A08" stroke="#3A2510" strokeWidth="1" />
          <rect x={x-4} y={52} width={48} height={14} rx="2" fill={i%2===0?'#BD3939':'#D97706'} opacity=".7" />
          {/* Products */}
          <rect x={x+4} y={82} width={10} height={16} rx="1" fill="#F59E0B" opacity=".6" />
          <rect x={x+17} y={85} width={10} height={13} rx="1" fill="#E5E2E1" opacity=".4" />
          <rect x={x+26} y={80} width={10} height={18} rx="1" fill="#F59E0B" opacity=".5" />
        </g>
      ))}
      {/* Road */}
      <rect x="0" y="130" width="240" height="20" fill="#111" />
      {/* Amara (figure at stall) */}
      <circle cx="120" cy="48" r="7" fill="#92400E" />
      <path d="M113,55 Q111,66 112,78 L128,78 Q129,66 127,55 Z" fill="#B45309" />
      <line x1="113" y1="60" x2="103" y2="70" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
      <line x1="127" y1="60" x2="134" y2="68" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
      {/* Speech bubble — "James" */}
      <rect x="133" y="28" width="54" height="22" rx="5" fill="#1C1B1B" stroke="#BD3939" strokeWidth="1" />
      <text x="160" y="43" fontSize="9" fill="#e5e2e1" textAnchor="middle">"Any Zawadi?"</text>
    </svg>
  );
}

function Illus({ type }) {
  if (type === 'data-before') return (
    <svg viewBox="0 0 120 90" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="90" fill="#111" />
      {/* Dark office background */}
      <rect width="120" height="90" fill="#131313" />
      {/* Desk */}
      <rect x="15" y="62" width="90" height="6" rx="2" fill="#1C1B1B" />
      {/* Laptop with question mark */}
      <rect x="30" y="34" width="60" height="30" rx="3" fill="#1A1A1A" stroke="#333" strokeWidth="1" />
      <text x="60" y="55" fontSize="16" fill="#EF4444" textAnchor="middle" fontWeight="bold">?</text>
      {/* Laptop base */}
      <rect x="28" y="64" width="64" height="4" rx="2" fill="#222" />
      {/* Person */}
      <circle cx="60" cy="24" r="7" fill="#92400E" />
      <path d="M53,31 Q51,42 52,52 L68,52 Q69,42 67,31 Z" fill="#B45309" />
      <line x1="53" y1="36" x2="44" y2="46" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="67" y1="36" x2="75" y2="44" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
  if (type === 'data-after') return (
    <svg viewBox="0 0 120 90" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="90" fill="#131313" />
      {/* Desk */}
      <rect x="15" y="62" width="90" height="6" rx="2" fill="#1C1B1B" />
      {/* Laptop with chart */}
      <rect x="30" y="30" width="60" height="34" rx="3" fill="#0D1A1F" stroke="#399BA3" strokeWidth="1" />
      {/* Bar chart on screen */}
      <rect x="40" y="52" width="7" height="8" fill="#BD3939" opacity=".8" />
      <rect x="51" y="46" width="7" height="14" fill="#BD3939" />
      <rect x="62" y="40" width="7" height="20" fill="#9ADDBD" />
      <rect x="73" y="48" width="7" height="12" fill="#BD3939" opacity=".7" />
      {/* Screen glow */}
      <ellipse cx="60" cy="47" rx="30" ry="18" fill="#399BA3" opacity=".04" />
      {/* Laptop base */}
      <rect x="28" y="64" width="64" height="4" rx="2" fill="#222" />
      {/* Person */}
      <circle cx="60" cy="20" r="7" fill="#92400E" />
      <path d="M53,27 Q51,38 52,48 L68,48 Q69,38 67,27 Z" fill="#B45309" />
      <line x1="53" y1="32" x2="44" y2="42" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="67" y1="32" x2="75" y2="40" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
  if (type === 'grad-before') return (
    <svg viewBox="0 0 120 90" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="90" fill="#111" />
      <circle cx="35" cy="28" r="7" fill="#6B7280" />
      <path d="M28,35 Q26,46 27,56 L43,56 Q44,46 42,35 Z" fill="#4B5563" />
      <path d="M27,52 Q24,64 25,72 L45,72 Q46,64 43,52 Z" fill="#374151" />
      {[[65,18,-7],[78,28,5],[68,40,-3],[82,50,9]].map(([x,y,r],i)=>(
        <g key={i} transform={`rotate(${r},${x+13},${y+9})`}>
          <rect x={x} y={y} width="26" height="18" rx="2" fill="#1E2030" stroke="#374151" strokeWidth="1" />
          <line x1={x+4} y1={y+7} x2={x+22} y2={y+7} stroke="#4B5563" strokeWidth=".9" />
          <line x1={x+4} y1={y+12} x2={x+18} y2={y+12} stroke="#4B5563" strokeWidth=".9" />
          <text x={x+13} y={y+15} fontSize="8" fill="#EF4444" textAnchor="middle">✕</text>
        </g>
      ))}
    </svg>
  );
  if (type === 'grad-after') return (
    <svg viewBox="0 0 120 90" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="90" fill="#111" />
      <rect x="20" y="60" width="88" height="5" rx="2" fill="#374151" />
      <rect x="23" y="65" width="4" height="18" fill="#2D3748" />
      <rect x="101" y="65" width="4" height="18" fill="#2D3748" />
      <rect x="42" y="22" width="50" height="38" rx="3" fill="#1F2937" stroke="#399BA3" strokeWidth="1.3" />
      <rect x="47" y="27" width="40" height="28" rx="1" fill="#0A1020" />
      <text x="67" y="46" fontSize="14" fill="#22C55E" textAnchor="middle">✓</text>
      <circle cx="34" cy="48" r="6" fill="#6B7280" />
      <path d="M28,54 Q27,62 28,68 L40,68 Q41,62 40,54 Z" fill="#4B5563" />
    </svg>
  );
  if (type === 'agent-before') return (
    <svg viewBox="0 0 120 90" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="90" fill="#111" />
      <rect x="22" y="58" width="88" height="5" rx="2" fill="#374151" />
      <rect x="32" y="18" width="58" height="40" rx="3" fill="#1F2937" stroke="#4B5563" strokeWidth="1" />
      <rect x="37" y="23" width="48" height="30" rx="1" fill="#0A0F1A" />
      <rect x="40" y="36" width="42" height="6" rx="2" fill="#1F2937" />
      <rect x="40" y="36" width="38" height="6" rx="2" fill="#EF4444" opacity=".8" />
      <text x="61" y="41" fontSize="5.5" fill="white" textAnchor="middle" fontWeight="600">OVERLOAD</text>
      <text x="61" y="32" fontSize="5.5" fill="#EF4444" textAnchor="middle">47 PENDING</text>
      <circle cx="28" cy="50" r="6" fill="#6B7280" />
      <path d="M22,56 Q21,64 22,70 L34,70 Q35,64 34,56 Z" fill="#4B5563" />
      <path d="M22,50 Q16,44 16,42" stroke="#374151" strokeWidth="2.5" fill="none" />
      <path d="M34,50 Q40,44 40,42" stroke="#374151" strokeWidth="2.5" fill="none" />
      <circle cx="15" cy="41" r="4" fill="#374151" />
      <circle cx="41" cy="41" r="4" fill="#374151" />
    </svg>
  );
  if (type === 'agent-after') return (
    <svg viewBox="0 0 120 90" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="90" fill="#111" />
      <rect x="22" y="58" width="88" height="5" rx="2" fill="#374151" />
      <rect x="32" y="18" width="58" height="40" rx="3" fill="#1F2937" stroke="#399BA3" strokeWidth="1.3" />
      <rect x="37" y="23" width="48" height="30" rx="1" fill="#0A0F1A" />
      <rect x="40" y="36" width="42" height="6" rx="2" fill="#1F2937" />
      <rect x="40" y="36" width="18" height="6" rx="2" fill="#22C55E" opacity=".8" />
      <text x="61" y="41" fontSize="5.5" fill="#22C55E" textAnchor="middle" fontWeight="600">RESOLVED</text>
      <text x="61" y="32" fontSize="5.5" fill="#22C55E" textAnchor="middle">3 REMAINING</text>
      <circle cx="28" cy="50" r="6" fill="#6B7280" />
      <path d="M22,56 Q21,64 22,70 L34,70 Q35,64 34,56 Z" fill="#4B5563" />
      <path d="M22,50 Q16,44 16,42" stroke="#374151" strokeWidth="2.5" fill="none" />
      <path d="M34,50 Q40,44 40,42" stroke="#374151" strokeWidth="2.5" fill="none" />
      <circle cx="15" cy="41" r="4" fill="#374151" />
      <circle cx="41" cy="41" r="4" fill="#374151" />
    </svg>
  );
  return null;
}

/* ── PAGE 1 — CONCEPT INTRO ───────────────────────────────────── */
function Page1({ onNext }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 200);
    const t2 = setTimeout(() => setStep(2), 700);
    const t3 = setTimeout(() => setStep(3), 1400);
    const t4 = setTimeout(() => setStep(4), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'none' : 'translateY(12px)', transition: 'all .6s ease', paddingTop: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: '#BD3939', lineHeight: 1, letterSpacing: '-.04em' }}>06</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e5e2e1', marginTop: 4 }}>Emotional Connection</div>
        <div style={{ fontSize: 11, color: '#a88a87', marginTop: 6, letterSpacing: '0.12em', textTransform: 'uppercase' }}>The Emotional Impact Journey</div>
      </div>

      {/* Dual cards: cold vs warm */}
      <div style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'none' : 'translateY(16px)', transition: 'all .7s ease', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Cold card */}
          <div style={{ flex: 1, background: '#111', borderRadius: 8, overflow: 'hidden', aspectRatio: '240/150', border: '1px solid #1E1E1E', position: 'relative' }}>
            <ColdChartSVG />
            <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 9, color: '#444', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              Clinical Data
            </div>
          </div>
          {/* Arrow */}
          <div style={{ flexShrink: 0 }}>
            <svg width="36" height="14" viewBox="0 0 36 14">
              <line x1="2" y1="7" x2="28" y2="7" stroke="#BD3939" strokeWidth="2" />
              <polygon points="26,3 34,7 26,11" fill="#BD3939" />
            </svg>
          </div>
          {/* Warm card */}
          <div style={{ flex: 1, background: '#111', borderRadius: 8, overflow: 'hidden', aspectRatio: '240/150', border: '1px solid #1E1E1E', position: 'relative' }}>
            <WarmMarketSVG />
            <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 9, color: '#D97706', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              Human Story
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'none' : 'translateY(12px)', transition: 'all .7s ease', textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 19, fontStyle: 'italic', fontWeight: 600, color: '#e5e2e1', lineHeight: 1.4 }}>
          "Data becomes memorable when it becomes human."
        </div>
        <div style={{ fontSize: 14, color: '#AAAAAA', marginTop: 10, lineHeight: 1.65 }}>
          Numbers do not move people. Stories about people do.
        </div>
      </div>

      {/* Amara context card */}
      <div style={{ opacity: step >= 4 ? 1 : 0, transform: step >= 4 ? 'none' : 'translateY(12px)', transition: 'all .7s ease', background: '#1C1B1B', borderRadius: 8, padding: '14px 16px', borderLeft: '3px solid #BD3939', marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: '#a88a87', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Amara's Story Returns
        </div>
        <div style={{ fontSize: 13, color: '#AAAAAA', lineHeight: 1.65 }}>
          The researcher is back in Nairobi with a single data point: 40.3%. She has four minutes on slide 7 to move a room of investors. The same truth — told three ways — will land very differently. You will decide where each version sits on the spectrum from cold to human.
        </div>
      </div>

      <NavBar
        onNext={onNext}
        nextLabel="Feel the Difference"
        nextIcon="arrow_forward"
      />
    </div>
  );
}

/* ── PAGE 2 — IMAGE MATCH ─────────────────────────────────────── */
function Page2({ onNext }) {
  const { recordAttempt, recordError } = useApp();
  const [deck]     = useState(() => shuffle(PHRASES));
  const [selected, setSelected]  = useState(null);    // phraseId
  const [matched,  setMatched]   = useState({});      // phraseId → pairId
  const [shaking,  setShaking]   = useState(null);    // pairId
  const [flashing, setFlashing]  = useState(null);    // pairId
  const [dragging, setDragging]  = useState(null);    // phraseId being dragged

  const totalMatched = Object.keys(matched).length;
  const allDone = totalMatched === 6;

  function pickPhrase(id) {
    if (matched[id]) return;
    setSelected(s => s === id ? null : id);
  }

  function placeOnPair(phraseId, pairId) {
    const phrase = PHRASES.find(p => p.id === phraseId);
    if (phrase.pairId === pairId) {
      recordAttempt();
      setMatched(m => ({ ...m, [phraseId]: pairId }));
      setFlashing(pairId);
      setTimeout(() => setFlashing(null), 700);
    } else {
      recordError();
      setShaking(pairId);
      setTimeout(() => setShaking(null), 450);
    }
    setSelected(null);
    setDragging(null);
  }

  function dropOnPair(pairId) {
    if (!selected) return;
    placeOnPair(selected, pairId);
  }

  function onDragStart(e, phraseId) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', phraseId);
    setDragging(phraseId);
    setSelected(null);
  }

  function onDragOver(e, pairId) {
    const isComplete = PHRASES.filter(p => matched[p.id] === pairId).length === 2;
    if (isComplete) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onDrop(e, pairId) {
    e.preventDefault();
    const phraseId = e.dataTransfer.getData('text/plain');
    if (!phraseId || matched[phraseId]) return;
    placeOnPair(phraseId, pairId);
  }

  function onDragEnd() {
    setDragging(null);
  }

  const unmatched = deck.filter(p => !matched[p.id]);

  return (
    <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>

      {/* Amara intro */}
      <div style={{ background: 'rgba(189,57,57,0.06)', border: '1px solid rgba(189,57,57,0.25)',
        borderRadius: 12, padding: '16px 20px', marginTop: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
          letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
          Amara's insight
        </p>
        <p style={{ fontSize: 14, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
          Amara knows that emotional connection in data work is not about adding feelings —
          it is about showing the human reality behind the numbers.
          She has six phrases that describe real moments from Zawadi's distribution story.
          Match each phrase to the image pair it belongs to, and you will see exactly
          how Amara turns a stat into something a decision-maker cannot ignore.
        </p>
      </div>

      {/* Header */}
      <div style={{ paddingTop: 0, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: '#a88a87', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Image Match</span>
          <span style={{ fontSize: 11, color: '#a88a87' }}>{totalMatched}/6 matched</span>
        </div>
        <div style={{ height: 4, background: '#222222', borderRadius: 2 }}>
          <div style={{ height: 4, background: '#BD3939', borderRadius: 2, width: `${(totalMatched / 6) * 100}%`, transition: 'width .5s' }} />
        </div>
        <div aria-live="polite" style={{ fontSize: 13, color: '#AAAAAA', marginTop: 10 }}>
          {selected
            ? <span style={{ color: '#BD3939' }}>Now tap an image pair below to place it ↓</span>
            : dragging
            ? <span style={{ color: '#BD3939' }}>Drop onto the image pair it describes ↓</span>
            : 'Drag or tap a phrase card, then drop or tap the image pair it describes.'}
        </div>
      </div>

      {/* Phrase tray — shown first */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: '#a88a87', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Phrase Cards {unmatched.length > 0 ? `— ${unmatched.length} remaining` : '— All placed ✓'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {unmatched.map(phrase => (
            <div
              key={phrase.id}
              draggable
              onDragStart={e => onDragStart(e, phrase.id)}
              onDragEnd={onDragEnd}
              onClick={() => pickPhrase(phrase.id)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && pickPhrase(phrase.id)}
              role="button"
              tabIndex={0}
              style={{
                background: selected === phrase.id ? 'rgba(189,57,57,.15)' : '#1C1B1B',
                borderRadius: 6,
                padding: '10px 12px',
                fontSize: 13,
                color: selected === phrase.id ? '#e5e2e1' : '#AAAAAA',
                border: selected === phrase.id ? '1px solid rgba(189,57,57,.6)' : '1px solid #222222',
                cursor: 'grab',
                transition: 'all .2s',
                lineHeight: 1.55,
                minHeight: 44,
                opacity: dragging === phrase.id ? 0.4 : 1,
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}
            >
              {/* Drag handle dots */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 3, opacity: 0.4 }}>
                {[0,1,2].map(r => (
                  <div key={r} style={{ display: 'flex', gap: 2 }}>
                    {[0,1].map(c => <div key={c} style={{ width: 3, height: 3, borderRadius: '50%', background: '#888' }} />)}
                  </div>
                ))}
              </div>
              <span>{phrase.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Image pairs — drop targets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {PAIRS.map(pair => {
          const pairMatches = PHRASES.filter(p => matched[p.id] === pair.id);
          const isComplete  = pairMatches.length === 2;
          const isShaking   = shaking === pair.id;
          const isFlashing  = flashing === pair.id;
          const canDrop     = (!!selected || !!dragging) && !isComplete;

          return (
            <div
              key={pair.id}
              onClick={() => !isComplete && selected && dropOnPair(pair.id)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && !isComplete && selected && dropOnPair(pair.id)}
              onDragOver={e => onDragOver(e, pair.id)}
              onDrop={e => onDrop(e, pair.id)}
              role={canDrop ? 'button' : undefined}
              tabIndex={canDrop ? 0 : undefined}
              style={{
                background: isComplete ? 'rgba(154,221,189,.05)' : canDrop ? 'rgba(189,57,57,.05)' : '#1C1B1B',
                borderRadius: 8,
                border: isComplete ? '1px solid rgba(154,221,189,.35)' : canDrop ? '2px dashed rgba(189,57,57,.55)' : '1px solid #222222',
                padding: 10,
                cursor: canDrop ? 'pointer' : 'default',
                transition: 'border-color .2s, background .2s',
                minHeight: 44,
                animation: isShaking ? 'shake .4s ease' : isFlashing ? 'mintPulse .65s ease' : 'none',
              }}
            >
              <div style={{ fontSize: 10, color: isComplete ? '#9ADDBD' : '#a88a87', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7, display: 'flex', justifyContent: 'space-between' }}>
                <span>{pair.label}</span>
                {isComplete && <span style={{ color: '#9ADDBD' }}>✓ Matched</span>}
              </div>

              {/* Before / After thumbnails */}
              <div style={{ display: 'flex', gap: 8, marginBottom: pairMatches.length > 0 ? 8 : 0 }}>
                {[pair.before, pair.after].map((type, i) => (
                  <div key={i} style={{ flex: 1, background: '#111', borderRadius: 6, overflow: 'hidden', aspectRatio: '120/80', position: 'relative' }}>
                    <Illus type={type} />
                    <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 8, color: i === 0 ? '#555' : '#9ADDBD', letterSpacing: '.07em', textTransform: 'uppercase', fontWeight: 600 }}>
                      {i === 0 ? 'Before' : 'After'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Placed phrases */}
              {pairMatches.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {pairMatches.map(p => (
                    <div key={p.id} style={{ background: 'rgba(154,221,189,.08)', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: '#9ADDBD', borderLeft: '2px solid #9ADDBD', lineHeight: 1.5 }}>
                      {p.text}
                    </div>
                  ))}
                </div>
              )}

              {!isComplete && (
                <div style={{ border: '1px dashed rgba(189,57,57,.2)', borderRadius: 4, padding: '5px 8px', fontSize: 11, color: canDrop ? 'rgba(189,57,57,.7)' : '#59413f', textAlign: 'center', marginTop: pairMatches.length > 0 ? 6 : 0 }}>
                  {canDrop ? 'Drop or tap to place here' : 'Drag or select a phrase to match'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <NavBar
        onNext={onNext}
        nextLabel="Place on Spectrum"
        nextIcon="arrow_forward"
        nextDisabled={!allDone}
        leftContent={<span style={{ fontSize: 13, color: '#AAAAAA' }}>{totalMatched}/6</span>}
      />
    </div>
  );
}

/* ── PAGE 3 — EMOTION SPECTRUM ────────────────────────────────── */
function Page3({ onNext }) {
  const [deck]       = useState(() => shuffle(PHRASES));
  const [placements, setPlacements] = useState({});    // phraseId → 0..1
  const [selected,   setSelected]   = useState(null);
  const [showRef,    setShowRef]     = useState(false);
  const [dragging,   setDragging]   = useState(null);  // phraseId
  const specRef = useRef(null);

  const allPlaced = Object.keys(placements).length === 6;

  function placeAtX(phraseId, clientX) {
    if (!specRef.current) return;
    const rect = specRef.current.getBoundingClientRect();
    const pos = Math.max(0.02, Math.min(0.98, (clientX - rect.left) / rect.width));
    setPlacements(p => ({ ...p, [phraseId]: pos }));
  }

  function handleSpectrumTap(e) {
    if (!selected || !specRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    placeAtX(selected, clientX);
    setSelected(null);
  }

  function handleSpectrumDragOver(e) {
    if (!dragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleSpectrumDrop(e) {
    e.preventDefault();
    const phraseId = e.dataTransfer.getData('text/plain');
    if (!phraseId) return;
    placeAtX(phraseId, e.clientX);
    setDragging(null);
    setSelected(null);
  }

  const placed   = deck.filter(p => placements[p.id] !== undefined);
  const unplaced = deck.filter(p => placements[p.id] === undefined);

  function scoreLabel(actual, ref) {
    const d = Math.abs(actual - ref);
    if (d < 0.10) return { text: 'Exact match',         color: '#9ADDBD' };
    if (d < 0.20) return { text: 'Close',               color: '#399BA3' };
    return              { text: 'Off — see reference',  color: '#a88a87' };
  }

  return (
    <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
      {/* Amara intro */}
      <div style={{ background: 'rgba(189,57,57,0.06)', border: '1px solid rgba(189,57,57,0.25)',
        borderRadius: 12, padding: '16px 20px', marginTop: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
          letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
          Amara's spectrum
        </p>
        <p style={{ fontSize: 14, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
          Matching phrases to images showed Amara which story each one tells.
          Now she needs to feel where each phrase sits emotionally — from cold, clinical data
          on the left to warm, human narrative on the right.
          The further right a phrase lands, the more it moves the reader beyond the numbers.
          Place all six and see whether Amara's instinct matches the expert view.
        </p>
      </div>

      {/* Header */}
      <div style={{ paddingTop: 0, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#a88a87', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          The Emotion Spectrum
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#e5e2e1' }}>Where does each phrase land?</div>
        <div aria-live="polite" style={{ fontSize: 13, color: '#AAAAAA', marginTop: 5 }}>
          {selected
            ? <span style={{ color: '#BD3939' }}>Tap anywhere on the spectrum bar to place it →</span>
            : dragging
            ? <span style={{ color: '#BD3939' }}>Drop onto the spectrum bar to place it →</span>
            : `Drag or select a phrase (${unplaced.length} remaining), then drop or tap the bar.`}
        </div>
      </div>

      {/* Spectrum bar */}
      <div style={{ marginBottom: 6 }}>
        <div
          ref={specRef}
          onClick={handleSpectrumTap}
          onTouchEnd={handleSpectrumTap}
          onDragOver={handleSpectrumDragOver}
          onDrop={handleSpectrumDrop}
          style={{
            height: 40,
            borderRadius: 20,
            position: 'relative',
            overflow: 'visible',
            background: 'linear-gradient(to right,#333,#399BA3 50%,#9ADDBD)',
            cursor: selected ? 'crosshair' : dragging ? 'copy' : 'default',
            boxShadow: (selected || dragging) ? '0 0 0 2px rgba(189,57,57,.4)' : 'none',
            transition: 'box-shadow .2s',
          }}
        >
          {/* Placement markers */}
          {placed.map(p => (
            <div key={p.id} style={{ position: 'absolute', left: `${placements[p.id] * 100}%`, top: 0, bottom: 0, width: 2, background: '#BD3939', transform: 'translateX(-50%)', pointerEvents: 'none', boxShadow: '0 0 4px rgba(189,57,57,.6)' }} />
          ))}
          {/* Reference triangles */}
          {showRef && Object.entries(REF_POS).map(([id, pos]) => (
            <div key={id} style={{ position: 'absolute', left: `${pos * 100}%`, top: -10, transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 5 }}>
              <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '10px solid #9ADDBD', filter: 'drop-shadow(0 1px 3px rgba(154,221,189,.5))' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cold Number</span>
          <span style={{ fontSize: 11, color: '#e5e2e1', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Deeply Human</span>
        </div>
      </div>

      {/* Placed cards under spectrum */}
      {placed.length > 0 && (
        <div style={{ position: 'relative', minHeight: 60, marginBottom: 10 }}>
          <div style={{ position: 'relative', height: Math.ceil(placed.length / 2) * 42 }}>
            {placed.map((p, idx) => {
              const xPct = placements[p.id] * 100;
              const score = showRef ? scoreLabel(placements[p.id], REF_POS[p.id]) : null;
              const yOff = idx % 2 === 0 ? 0 : 22;
              return (
                <div key={p.id} style={{
                  position: 'absolute',
                  left: `${xPct}%`,
                  top: yOff,
                  transform: 'translateX(-50%)',
                  background: score ? 'rgba(154,221,189,.07)' : '#1C1B1B',
                  border: `1px solid ${score ? score.color + '55' : '#222222'}`,
                  borderRadius: 5,
                  padding: '3px 7px',
                  fontSize: 10,
                  whiteSpace: 'nowrap',
                  color: score ? score.color : '#a88a87',
                  maxWidth: 110,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {p.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unplaced phrase grid */}
      {unplaced.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#a88a87', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Phrase Cards
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {unplaced.map(phrase => (
              <div
                key={phrase.id}
                draggable
                onDragStart={e => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', phrase.id);
                  setDragging(phrase.id);
                  setSelected(null);
                }}
                onDragEnd={() => setDragging(null)}
                onClick={() => setSelected(s => s === phrase.id ? null : phrase.id)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelected(s => s === phrase.id ? null : phrase.id)}
                role="button"
                tabIndex={0}
                style={{
                  background: selected === phrase.id ? 'rgba(189,57,57,.15)' : '#1C1B1B',
                  borderRadius: 6,
                  padding: '10px 11px',
                  fontSize: 12,
                  color: selected === phrase.id ? '#e5e2e1' : '#AAAAAA',
                  border: selected === phrase.id ? '1px solid rgba(189,57,57,.6)' : '1px solid #222222',
                  cursor: 'grab',
                  transition: 'all .2s',
                  lineHeight: 1.5,
                  display: 'flex',
                  gap: 7,
                  alignItems: 'flex-start',
                  minHeight: 44,
                  opacity: dragging === phrase.id ? 0.4 : 1,
                }}
              >
                <span style={{ color: '#59413f', fontSize: 11, marginTop: 1, flexShrink: 0 }}>⠿</span>
                <span>{phrase.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placed full list */}
      {placed.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#a88a87', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Placed Phrases
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {placed.map(p => {
              const score = showRef ? scoreLabel(placements[p.id], REF_POS[p.id]) : null;
              return (
                <div key={p.id} style={{ background: '#1C1B1B', borderRadius: 6, padding: '8px 11px', fontSize: 12, color: '#AAAAAA', borderLeft: `2px solid ${score ? score.color : '#BD3939'}`, lineHeight: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span>{p.text}</span>
                  {score && <span style={{ color: score.color, fontSize: 11, whiteSpace: 'nowrap', fontWeight: 600, flexShrink: 0 }}>{score.text}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reveal reference button */}
      {allPlaced && !showRef && (
        <div style={{ marginBottom: 14 }}>
          <button
            onClick={() => setShowRef(true)}
            style={{ width: '100%', padding: 12, background: '#1C1B1B', border: '1px solid #222222', borderRadius: 8, color: '#AAAAAA', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter', minHeight: 44 }}
          >
            See Reference Positions
          </button>
        </div>
      )}

      {/* Reference breakdown */}
      {showRef && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ background: 'rgba(57,155,163,.07)', borderRadius: 8, padding: '14px 16px', borderLeft: '3px solid #399BA3' }}>
            <div style={{ fontSize: 11, color: '#399BA3', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
              Reference Positions
            </div>
            <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {PHRASES.map(p => {
                const ref    = REF_POS[p.id];
                const actual = placements[p.id];
                const score  = actual !== undefined ? scoreLabel(actual, ref) : null;
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Mini spectrum */}
                    <div style={{ width: 60, flexShrink: 0, position: 'relative', height: 8 }}>
                      <div style={{ height: 4, background: 'linear-gradient(to right,#333,#399BA3 50%,#9ADDBD)', borderRadius: 2, marginTop: 2 }} />
                      <div style={{ position: 'absolute', left: `${ref * 100}%`, top: -1, width: 3, height: 10, background: '#9ADDBD', transform: 'translateX(-50%)', borderRadius: 1 }} />
                      {actual !== undefined && (
                        <div style={{ position: 'absolute', left: `${actual * 100}%`, top: 0, width: 2, height: 8, background: '#BD3939', transform: 'translateX(-50%)' }} />
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: score ? score.color : '#AAAAAA', flex: 1 }}>{p.label}</span>
                    {score && <span style={{ fontSize: 11, color: score.color, fontWeight: 600, flexShrink: 0 }}>{score.text}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Final message */}
      {allPlaced && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ background: '#1C1B1B', borderRadius: 8, padding: '18px 16px', textAlign: 'center', border: '1px solid #222222' }}>
            <div style={{ fontSize: 16, fontStyle: 'italic', color: '#e5e2e1', lineHeight: 1.6, marginBottom: 8 }}>
              "The same truth, told three ways. None of them are wrong. But only one makes the room lean forward."
            </div>
            <div style={{ fontSize: 12, color: '#a88a87' }}>— Emotional Connection complete</div>
          </div>
        </div>
      )}

      <NavBar
        onNext={onNext}
        nextLabel="Complete Activity"
        nextIcon="check_circle"
        nextDisabled={!allPlaced}
      />
    </div>
  );
}

/* ── COMPLETION ───────────────────────────────────────────────── */
function Completion({ onGoHome }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '40px 16px' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
        <div style={{ fontSize: 64, fontWeight: 900, color: '#BD3939', letterSpacing: '-.04em', lineHeight: 1 }}>06</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e5e2e1', marginTop: 8 }}>Complete</div>
        <div style={{ width: 48, height: 3, background: 'linear-gradient(135deg,#BD3939,#8D141B)', borderRadius: 2, margin: '14px auto 20px' }} />
        <div style={{ fontSize: 14, color: '#AAAAAA', lineHeight: 1.7, marginBottom: 20 }}>
          You've explored how the same data can feel cold or profoundly human — and that choosing the right temperature for your audience is a deliberate storytelling skill.
        </div>
        <div style={{ background: 'rgba(57,155,163,.08)', borderRadius: 8, padding: '14px 16px', borderLeft: '3px solid #399BA3', textAlign: 'left', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#399BA3', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Key Insight</div>
          <div style={{ fontSize: 14, color: '#e5e2e1', lineHeight: 1.65 }}>
            Data without humanity is just numbers. Unearned emotion without data is just sentiment. The most powerful stories earn their emotional resonance through precise, truthful data — like Amara's 40.3%.
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#888', lineHeight: 1.65, marginBottom: 20, fontStyle: 'italic' }}>
          Next, Amara's presentation lands well — the CEO calls it compelling, the room nods. Then everyone leaves without making a decision.
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onGoHome}
            style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid #2A2A2A', color: '#AAAAAA', background: 'transparent', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter' }}
          >
            Back to Activities
          </button>
          <button
            onClick={onGoHome}
            style={{ padding: '14px 32px', borderRadius: 8, border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 44, background: 'linear-gradient(135deg,#BD3939,#8D141B)', fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            Next Activity
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ───────────────────────────────────────────── */
const PROGRESS = { 0: 62, 1: 62, 2: 72, 3: 85, 4: 85, 5: 100 };

export default function Activity06() {
  const [page, setPage] = useState(0);
  const { goHome, markComplete } = useApp();

  function handleComplete() {
    markComplete(6);
    setPage(4);
  }

  function handleGoHome() {
    goHome();
  }

  if (page === 0) {
    return (
      <NarrativeIntro
        data={AMARA[6].intro}
        activityNumber={6}
        onStart={() => setPage(1)}
        sidebarDot={6}
        progress={62}
      />
    );
  }

  if (page === 4) {
    return (
      <Debrief
        data={AMARA[6].debrief}
        activityNumber={6}
        onFinish={() => setPage(5)}
        sidebarDot={6}
        progress={85}
      />
    );
  }

  return (
    <Layout sidebarDot={6} progress={PROGRESS[page] || 100} bottomPad>
      {page === 1 && <Page1 onNext={() => setPage(2)} />}
      {page === 2 && <Page2 onNext={() => setPage(3)} />}
      {page === 3 && <Page3 onNext={handleComplete} />}
      {page === 5 && <Completion onGoHome={handleGoHome} />}
    </Layout>
  );
}
