import { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import NavBar from '../../components/NavBar';
import { useApp } from '../../context/AppContext';
import NarrativeIntro from '../../components/NarrativeIntro';
import Debrief from '../../components/Debrief';
import { AMARA } from '../../data/amara';

/* ── CHART SVG ICONS ──────────────────────────────────────────── */
const BarIcon = ({ accent = false }) => (
  <svg viewBox="0 0 64 44" fill="none" style={{ width: '100%', height: '100%' }}>
    <line x1="4" y1="42" x2="60" y2="42" stroke="#444" strokeWidth="1" />
    <rect x="6"  y="26" width="9" height="16" fill={accent ? '#BD3939' : '#555'} rx="1" />
    <rect x="18" y="14" width="9" height="28" fill="#FFFFFF" rx="1" opacity="0.9" />
    <rect x="30" y="20" width="9" height="22" fill="#FFFFFF" rx="1" opacity="0.9" />
    <rect x="42" y="8"  width="9" height="34" fill={accent ? '#BD3939' : '#888'} rx="1" />
  </svg>
);

const LineIcon = ({ accent = false }) => (
  <svg viewBox="0 0 64 44" fill="none" style={{ width: '100%', height: '100%' }}>
    <line x1="4" y1="42" x2="60" y2="42" stroke="#444" strokeWidth="1" />
    <line x1="4" y1="42" x2="4" y2="4"  stroke="#444" strokeWidth="1" />
    <polyline points="8,34 20,22 32,28 44,12 58,8" stroke={accent ? '#BD3939' : '#FFFFFF'} strokeWidth="2" fill="none" />
    {[8, 20, 32, 44, 58].map((x, i) => {
      const y = [34, 22, 28, 12, 8][i];
      return <circle key={i} cx={x} cy={y} r="3" fill="#BD3939" />;
    })}
  </svg>
);

const ScatterIcon = ({ accent = false }) => {
  const pts = [[12,34],[20,22],[30,30],[18,14],[44,10],[52,18],[38,26],[50,32],[24,38]];
  return (
    <svg viewBox="0 0 64 44" fill="none" style={{ width: '100%', height: '100%' }}>
      <line x1="4" y1="42" x2="60" y2="42" stroke="#444" strokeWidth="1" />
      <line x1="4" y1="42" x2="4" y2="4"  stroke="#444" strokeWidth="1" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={accent ? '#BD3939' : '#FFFFFF'} opacity="0.85" />
      ))}
    </svg>
  );
};

const PieIcon = ({ accent = false }) => (
  <svg viewBox="0 0 64 44" fill="none" style={{ width: '100%', height: '100%' }}>
    <circle cx="32" cy="22" r="18" stroke="#333" strokeWidth="1" fill="#1A1A1A" />
    <path d="M32 22 L32 4 A18 18 0 0 1 47 31 Z" fill={accent ? '#BD3939' : '#FFFFFF'} opacity="0.9" />
    <path d="M32 22 L47 31 A18 18 0 0 1 14 31 Z" fill="#555" />
    <path d="M32 22 L14 31 A18 18 0 0 1 32 4 Z"  fill="#888" opacity="0.7" />
  </svg>
);

const HeatmapIcon = ({ accent = false }) => {
  const data = [[0.9,0.3,0.7],[0.2,0.8,0.5],[0.6,0.4,1.0],[0.1,0.9,0.3]];
  return (
    <svg viewBox="0 0 64 44" fill="none" style={{ width: '100%', height: '100%' }}>
      {data.map((row, r) =>
        row.map((v, c) => (
          <rect
            key={`${r}${c}`}
            x={8 + c * 16} y={4 + r * 9} width="14" height="8" rx="1"
            fill={accent && v > 0.7 ? '#BD3939' : `rgba(189,57,57,${v})`}
            opacity="0.9"
          />
        ))
      )}
    </svg>
  );
};

const WaterfallIcon = ({ accent = false }) => (
  <svg viewBox="0 0 64 44" fill="none" style={{ width: '100%', height: '100%' }}>
    <line x1="4" y1="42" x2="60" y2="42" stroke="#444" strokeWidth="1" />
    <rect x="6"  y="22" width="7" height="20" fill="#555"    rx="1" />
    <rect x="16" y="16" width="7" height="6"  fill="#9ADDBD" rx="1" opacity="0.85" />
    <rect x="26" y="24" width="7" height="8"  fill="#BD3939" rx="1" opacity="0.85" />
    <rect x="36" y="14" width="7" height="10" fill="#9ADDBD" rx="1" opacity="0.85" />
    <rect x="46" y="20" width="7" height="6"  fill="#BD3939" rx="1" opacity="0.85" />
    <line x1="13" y1="22" x2="16" y2="22" stroke="#555" strokeWidth="1" strokeDasharray="2 1" />
    <line x1="23" y1="16" x2="26" y2="16" stroke="#555" strokeWidth="1" strokeDasharray="2 1" />
    <line x1="33" y1="24" x2="36" y2="24" stroke="#555" strokeWidth="1" strokeDasharray="2 1" />
    <line x1="43" y1="14" x2="46" y2="14" stroke="#555" strokeWidth="1" strokeDasharray="2 1" />
  </svg>
);

const CHART_ICONS = {
  bar: BarIcon,
  line: LineIcon,
  scatter: ScatterIcon,
  pie: PieIcon,
  heatmap: HeatmapIcon,
  waterfall: WaterfallIcon,
};

/* ── DATA ─────────────────────────────────────────────────────── */
const CHARTS = [
  { id: 'bar',       name: 'Bar Chart',    desc: 'Compare values across categories'           },
  { id: 'line',      name: 'Line Chart',   desc: 'Show trends and changes over time'          },
  { id: 'scatter',   name: 'Scatter Plot', desc: 'Reveal relationships between two variables' },
  { id: 'pie',       name: 'Pie Chart',    desc: 'Show parts of a whole (≤5 categories)'      },
  { id: 'heatmap',   name: 'Heatmap',      desc: 'Patterns across two categorical dimensions' },
  { id: 'waterfall', name: 'Waterfall',    desc: 'Sequential additions and subtractions'      },
];

const SCENARIOS = [
  { id:1, text:'Compare Zawadi product reorder rates across 5 Western Kenya distribution districts.',                    correct:'bar',       hint:'Comparing discrete categories side by side — what shows ranked values clearly?' },
  { id:2, text:'Track monthly informal kiosk conversions to registered retail over 36 months to spot growth trends.',    correct:'line',      hint:'You need continuity — how a value moves across time.' },
  { id:3, text:'Explore whether proximity to a Zawadi distributor hub correlates with outlet reorder frequency.',         correct:'scatter',   hint:'Two continuous variables — is there a relationship between them?' },
  { id:4, text:'Show how four product lines split the annual Western Kenya sales revenue.',                               correct:'pie',       hint:'Four parts of a whole — what shows proportions simply?' },
  { id:5, text:'Show reorder rates for 3 product lines (cooking oil, flour, soap) across 6 county clusters.',            correct:'heatmap',   hint:'Two dimensions (product × county) — think about a grid.' },
  { id:6, text:'Show how a KES 18M pilot budget breaks down into 5 cost categories and a projected surplus.',             correct:'waterfall', hint:'Sequential additions and subtractions building to a final value.' },
  { id:7, text:'Compare Q1 vs Q2 outlet sign-ups across 7 Zawadi distribution zones.',                                   correct:'bar',       hint:'Grouped comparison across discrete categories.' },
  { id:8, text:'Show delivery success rates by day of week and region to optimise distribution routing.',                 correct:'heatmap',   hint:'Day × region — two categorical dimensions forming a grid.' },
];

const CONSEQUENCES = [
  {
    id: 1,
    scenario: 'Zawadi distribution budget split across 12 cost line items',
    wrongChart: 'pie',
    wrongLabel: 'Pie Chart',
    options: [
      { id:'a', text:'The chart auto-converts to percentages, distorting the absolute budget values.' },
      { id:'b', text:'12 slices become unreadable — the smallest line items vanish and comparison is impossible.', correct: true },
      { id:'c', text:'Pie charts display data over time, so the budget becomes a trend line.' },
    ],
    explanation: 'A pie chart breaks down after 5–6 slices. At 12, the human eye cannot distinguish arc sizes — the chart fails its core job.',
  },
  {
    id: 2,
    scenario: 'Monthly outlet reorders tracked over 3 sales cycles',
    wrongChart: 'bar',
    wrongLabel: 'Bar Chart',
    options: [
      { id:'a', text:'Bars cannot display seasonal variation, so the data flattens to an annual average.' },
      { id:'b', text:'The bars group automatically by cycle, compressing monthly detail into quarters.' },
      { id:'c', text:'Disconnected bars break visual continuity — the growth trend and seasonal pattern disappear.', correct: true },
    ],
    explanation: 'Line charts encode continuity. Bars encode discrete comparison. For a time series like outlet reorders, bars hide whether momentum is building or stalling.',
  },
  {
    id: 3,
    scenario: 'Correlation between distributor hub proximity and outlet reorder frequency',
    wrongChart: 'pie',
    wrongLabel: 'Pie Chart',
    options: [
      { id:'a', text:'Pie shows parts of a whole — it cannot represent any relationship between two variables.', correct: true },
      { id:'b', text:'Individual data points get averaged into slices, losing all variation and outliers.' },
      { id:'c', text:'The axis labels are inverted automatically, reversing the apparent direction of the correlation.' },
    ],
    explanation: 'Scatter plots exist to show correlation. A pie chart has no axes — it is structurally incapable of answering "as X increases, does Y increase?"',
  },
];

/* ── PAGE 1 — CONCEPT INTRO ───────────────────────────────────── */
function Page1({ onNext }) {
  const [visible, setVisible] = useState([]);
  const [textStep, setTextStep] = useState(0);
  const [breathe, setBreathe] = useState(false);

  useEffect(() => {
    const ts = CHARTS.map((_, i) => setTimeout(() => setVisible(v => [...v, i]), 300 + i * 220));
    const t1 = setTimeout(() => setTextStep(1), 300 + CHARTS.length * 220 + 200);
    const t2 = setTimeout(() => setTextStep(2), 300 + CHARTS.length * 220 + 900);
    const t3 = setTimeout(() => setBreathe(true), 300 + CHARTS.length * 220 + 1400);
    return () => [...ts, t1, t2, t3].forEach(clearTimeout);
  }, []);

  const showText = s => ({
    opacity: textStep >= s ? 1 : 0,
    transform: textStep >= s ? 'none' : 'translateY(8px)',
    transition: 'all 0.55s ease',
  });

  return (
    <div style={{ padding: '0 16px', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, paddingTop: 16 }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: '#BD3939', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 4 }}>
          05
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e5e2e1', margin: 0 }}>Visual Encoding</h1>
      </div>

      {/* 2×3 chart grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 32 }}>
        {CHARTS.map((c, i) => {
          const Icon = CHART_ICONS[c.id];
          const shown = visible.includes(i);
          return (
            <div
              key={c.id}
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? 'none' : 'scale(0.88) translateY(8px)',
                transition: 'all 0.4s ease',
                background: '#1C1B1B',
                border: '1px solid rgba(89,65,63,0.2)',
                borderRadius: 10,
                padding: '14px 10px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <div style={{ width: '100%', height: 40 }}>
                <Icon />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#e5e2e1', letterSpacing: '0.04em', textAlign: 'center' }}>
                {c.name}
              </span>
            </div>
          );
        })}
      </div>

      <div style={showText(1)}>
        <p style={{ fontSize: 18, fontStyle: 'italic', color: '#e5e2e1', fontWeight: 600, lineHeight: 1.4, marginBottom: 12 }}>
          Every chart tells a different story. Choosing the wrong one tells the wrong story.
        </p>
      </div>

      <div style={showText(2)}>
        <p style={{ fontSize: 14, color: '#AAAAAA', lineHeight: 1.75 }}>
          The chart type you choose is not aesthetic. It is functional. It determines whether your audience understands the message in 5 seconds or misreads it entirely.
        </p>
      </div>

      <NavBar
        onNext={onNext}
        nextLabel="Become a Chart Detective"
        nextIcon="arrow_forward"
      />
    </div>
  );
}

/* ── PAGE 2 — MATCH ROUND ─────────────────────────────────────── */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Page2({ onNext }) {
  const { recordAttempt, recordError } = useApp();
  const [current, setCurrent]   = useState(0);
  const [matched, setMatched]   = useState({});     // { chartId: [scenarioIds] }
  const [feedback, setFeedback] = useState(null);   // { chartId, correct }
  const [shaking, setShaking]   = useState(false);
  const [done, setDone]         = useState(false);

  // One independent shuffle per scenario so chart position changes every round
  const scenarioShuffles = useMemo(
    () => SCENARIOS.map(() => shuffleArray(CHARTS)),
    []
  );
  const shuffledCharts = scenarioShuffles[current] ?? scenarioShuffles[0];

  const scenario = SCENARIOS[current];
  const matchedCount = Object.values(matched).flat().length;

  function attempt(chartId) {
    if (feedback) return;
    const correct = chartId === scenario.correct;
    if (correct) recordAttempt(); else recordError();
    setFeedback({ chartId, correct });

    if (correct) {
      setMatched(prev => {
        const existing = prev[chartId] || [];
        return { ...prev, [chartId]: [...existing, scenario.id] };
      });
      setTimeout(() => {
        setFeedback(null);
        if (current < SCENARIOS.length - 1) {
          setCurrent(c => c + 1);
        } else {
          setDone(true);
        }
      }, 900);
    } else {
      setShaking(true);
      setTimeout(() => { setShaking(false); setFeedback(null); }, 700);
    }
  }

  const ORDINALS = ['1st','2nd','3rd','4th','5th','6th','7th','8th'];

  return (
    <div style={{ padding: '0 16px', maxWidth: 960, margin: '0 auto' }}>

      {/* Amara intro */}
      <div style={{ background: 'rgba(189,57,57,0.06)', border: '1px solid rgba(189,57,57,0.25)',
        borderRadius: 12, padding: '16px 20px', marginTop: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
          letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
          Amara's challenge
        </p>
        <p style={{ fontSize: 14, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
          Amara has the data. Now she has to choose how to show it.
          She knows that picking the wrong chart type does not just look bad —
          it actively misleads the people who need to act on her findings.
          Eight real scenarios from the Zawadi distribution project are waiting.
          For each one, help Amara pick the chart that tells the truth.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
          The Match Round
        </p>
        <p style={{ fontSize: 14, color: '#e5e2e1', margin: 0 }}>
          Read the scenario, then click the chart type that best fits it.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Chart type cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {shuffledCharts.map(c => {
            const Icon = CHART_ICONS[c.id];
            const fb = feedback?.chartId === c.id;
            const isCorrect = fb && feedback.correct;
            const isWrong   = fb && !feedback.correct;
            const badges = matched[c.id] || [];

            return (
              <button
                key={c.id}
                onClick={() => !done && attempt(c.id)}
                tabIndex={0}
                style={{
                  background: isCorrect ? 'rgba(154,221,189,0.08)' : isWrong ? 'rgba(189,57,57,0.08)' : '#1C1B1B',
                  border: isCorrect ? '1px solid rgba(154,221,189,0.5)' : isWrong ? '1px solid rgba(189,57,57,0.5)' : '1px solid rgba(89,65,63,0.15)',
                  borderLeft: isCorrect ? '4px solid #9ADDBD' : isWrong ? '4px solid #BD3939' : '4px solid rgba(189,57,57,0.4)',
                  borderRadius: 10,
                  padding: '14px 12px',
                  cursor: done ? 'default' : 'pointer',
                  textAlign: 'left',
                  minHeight: 44,
                  animation: isWrong ? 'shake 0.38s ease-out' : isCorrect ? 'mintFlash 0.8s ease-out' : 'none',
                }}
              >
                <div style={{ height: 40, marginBottom: 8 }}>
                  <Icon accent={isCorrect} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? '#9ADDBD' : isWrong ? '#BD3939' : '#e5e2e1', marginBottom: 2 }}>
                  {c.name}
                </p>
                <p style={{ fontSize: 10, color: '#555', lineHeight: 1.3, margin: 0 }}>{c.desc}</p>

                {badges.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {badges.map(sid => (
                      <span key={sid} style={{ fontSize: 9, fontWeight: 700, color: '#9ADDBD', background: 'rgba(154,221,189,0.12)', border: '1px solid rgba(154,221,189,0.25)', borderRadius: 4, padding: '1px 5px' }}>
                        #{sid}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Scenario panel */}
        <div>
          {!done ? (
            <>
              {/* Stack visual */}
              <div style={{ position: 'relative', minHeight: 180 }}>
                {[2, 1].map(offset =>
                  current + offset < SCENARIOS.length ? (
                    <div
                      key={offset}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        top: offset * 6,
                        left: offset * 4,
                        right: -(offset * 4),
                        background: '#1C1B1B',
                        border: '1px solid rgba(89,65,63,0.1)',
                        borderRadius: 10,
                        zIndex: 3 - offset,
                      }}
                    />
                  ) : null
                )}

                {/* Current scenario card */}
                <div
                  style={{
                    position: 'relative',
                    background: '#1C1B1B',
                    border: '1px solid rgba(89,65,63,0.3)',
                    borderRadius: 10,
                    padding: '18px 16px',
                    zIndex: 5,
                    animation: shaking ? 'shake 0.38s ease-out' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#BD3939', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      Scenario {current + 1} of 8
                    </span>
                    <span style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {ORDINALS[current]}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, color: '#e5e2e1', lineHeight: 1.65, fontWeight: 500, margin: 0 }}>
                    {scenario.text}
                  </p>

                  {feedback && !feedback.correct && (
                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }} aria-live="polite">
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#BD3939', flexShrink: 0 }}>tips_and_updates</span>
                      <p style={{ fontSize: 12, color: '#AAAAAA', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{scenario.hint}</p>
                    </div>
                  )}
                  {feedback && feedback.correct && (
                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }} aria-live="polite">
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#9ADDBD' }}>check_circle</span>
                      <p style={{ fontSize: 13, color: '#9ADDBD', fontWeight: 600, margin: 0 }}>Correct! Well matched.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>{matchedCount} of 8 matched</span>
                  <span style={{ fontSize: 11, color: '#555' }}>{8 - current} remaining</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: '#222222' }}>
                  <div style={{ height: '100%', borderRadius: 2, transition: 'width 0.5s', width: `${(matchedCount / 8) * 100}%`, background: '#9ADDBD' }} />
                </div>
              </div>
            </>
          ) : (
            <div style={{ background: 'rgba(154,221,189,0.06)', border: '1px solid rgba(154,221,189,0.3)', borderRadius: 10, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#9ADDBD', marginBottom: 10 }}>verified</span>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#e5e2e1', marginBottom: 8 }}>All 8 matched!</p>
              <p style={{ fontSize: 14, color: '#AAAAAA', lineHeight: 1.6, margin: 0 }}>
                You understand which chart fits which scenario. Now let's see what happens when the wrong chart is chosen.
              </p>
            </div>
          )}
        </div>
      </div>

      <NavBar
        onNext={onNext}
        nextLabel="The Consequence Round"
        nextIcon="arrow_forward"
        nextDisabled={!done}
      />
    </div>
  );
}

/* ── PAGE 3 — CONSEQUENCE ROUND ───────────────────────────────── */
function Page3({ onComplete, onRetry }) {
  const { recordAttempt, recordError } = useApp();
  const [answers, setAnswers] = useState({});
  const allAnswered = CONSEQUENCES.every(c => answers[c.id]);

  function pick(panelId, optionId) {
    if (answers[panelId]) return;
    const panel = CONSEQUENCES.find(c => c.id === panelId);
    const option = panel?.options.find(o => o.id === optionId);
    if (option?.correct) recordAttempt(); else recordError();
    setAnswers(prev => ({ ...prev, [panelId]: optionId }));
  }

  const WrongChartDisplay = ({ chartId }) => {
    const Icon = CHART_ICONS[chartId];
    return (
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 28 }}>
        <Icon />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, color: '#BD3939', fontWeight: 900, lineHeight: 1, textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>✕</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '0 16px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, paddingTop: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7 }}>
          The Consequence Round
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e5e2e1', lineHeight: 1.3, margin: '0 0 12px 0' }}>
          What happens when the wrong chart is used?
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
          background: 'rgba(57,155,163,0.07)', border: '1px solid rgba(57,155,163,0.25)',
          borderRadius: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#399BA3', flexShrink: 0 }}>info</span>
          <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.5 }}>
            For each scenario, select the correct consequence to continue to the next one.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
        {CONSEQUENCES.map(panel => {
          const chosen = answers[panel.id];
          const isAnswered = !!chosen;

          return (
            <div key={panel.id} style={{ background: '#1C1B1B', border: '1px solid rgba(89,65,63,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              {/* Panel header */}
              <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(89,65,63,0.1)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: 15, color: '#e5e2e1', fontWeight: 500, lineHeight: 1.4, margin: 0 }}>
                    {panel.scenario}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(189,57,57,0.1)', border: '1px solid rgba(189,57,57,0.25)', borderRadius: 8, padding: '6px 12px', alignSelf: 'flex-start' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#BD3939', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Wrong chart:</span>
                    <WrongChartDisplay chartId={panel.wrongChart} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#BD3939' }}>{panel.wrongLabel}</span>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {panel.options.map(opt => {
                  const isChosen  = chosen === opt.id;
                  const isCorrect = opt.correct;
                  const showResult = isAnswered;
                  const correct = isChosen && isCorrect;
                  const wrong   = isChosen && !isCorrect;
                  const missed  = !isChosen && isCorrect && showResult;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => pick(panel.id, opt.id)}
                      tabIndex={0}
                      style={{
                        background: correct ? 'rgba(154,221,189,0.08)' : wrong ? 'rgba(189,57,57,0.08)' : missed ? 'rgba(154,221,189,0.04)' : '#131313',
                        border: correct ? '1px solid rgba(154,221,189,0.45)' : wrong ? '1px solid rgba(189,57,57,0.45)' : missed ? '1px solid rgba(154,221,189,0.2)' : '1px solid rgba(89,65,63,0.2)',
                        borderRadius: 10,
                        padding: '14px 14px',
                        cursor: isAnswered ? 'default' : 'pointer',
                        textAlign: 'left',
                        minHeight: 44,
                        width: '100%',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 14, color: correct ? '#9ADDBD' : wrong ? '#BD3939' : '#BD3939', opacity: showResult ? 1 : 0.5, flexShrink: 0, marginTop: 2 }}
                        >
                          {showResult ? (correct || missed ? 'check_circle' : 'cancel') : 'warning'}
                        </span>
                        <p style={{ fontSize: 13, color: correct ? '#9ADDBD' : wrong ? 'rgba(189,57,57,0.8)' : '#e5e2e1', lineHeight: 1.5, fontWeight: isChosen ? 600 : 400, margin: 0 }}>
                          {opt.text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isAnswered && (
                <div style={{ padding: '0 16px 16px' }} aria-live="polite">
                  <div style={{ background: 'rgba(57,155,163,0.06)', border: '1px solid rgba(57,155,163,0.2)', borderRadius: 10, padding: '14px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#399BA3', flexShrink: 0 }}>lightbulb</span>
                    <p style={{ fontSize: 13, color: '#AAAAAA', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>{panel.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion card */}
      {allAnswered && (
        <div style={{ background: '#0F5560', borderLeft: '3px solid #399BA3', borderRadius: 10, padding: '24px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span className="material-symbols-outlined" style={{ color: '#7DD5D5', fontSize: 28, flexShrink: 0 }}>verified</span>
            <div>
              <h4 style={{ fontWeight: 700, color: '#e5e2e1', fontSize: 17, marginBottom: 8, marginTop: 0 }}>Chart Detective — Case Closed</h4>
              <p style={{ color: '#9AF1F2', lineHeight: 1.7, fontSize: 15, margin: 0 }}>
                You now understand not just <em>which</em> chart to choose, but <em>what happens</em> when you choose wrong. Visual encoding is the difference between an insight your audience acts on and a chart they stare at in confusion.
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 }}>
        <button
          onClick={onRetry}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 10,
            border: '1px solid rgba(89,65,63,0.25)',
            color: '#e5e2e1', background: 'transparent',
            fontSize: 14, fontWeight: 700,
            cursor: 'pointer', textTransform: 'uppercase',
            letterSpacing: '0.06em', minHeight: 44,
            fontFamily: 'Inter',
          }}
        >
          <span className="material-symbols-outlined">refresh</span>
          Try Again
        </button>

        {allAnswered && (
          <NavBar
            onNext={onComplete}
            nextLabel="Next Concept"
            nextIcon="arrow_forward"
          />
        )}
      </div>
    </div>
  );
}

/* ── COMPLETION ──────────────────────────────────────────────── */
function Completion({ onRetry }) {
  const { goHome, markComplete } = useApp();
  useEffect(() => { markComplete(5); }, []);
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: '80px 16px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 512 }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>📊</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', marginBottom: 12, marginTop: 0 }}>
          Activity Complete!
        </h2>
        <p style={{ fontSize: 16, color: '#AAAAAA', lineHeight: 1.7, marginBottom: 32 }}>
          You've matched data questions to the visual forms that make patterns immediately legible — the instinct that separates a confusing table from a chart that speaks for itself.
        </p>
        <div style={{
          borderRadius: 12, padding: 24, marginBottom: 20,
          background: '#1A1A1A', border: '1px solid rgba(89,65,63,0.15)',
        }}>
          <p style={{ fontSize: 15, color: '#9AF1F2', fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
            "The right chart doesn't just show data. It shows the shape of the opportunity."
          </p>
        </div>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.65, marginBottom: 24, fontStyle: 'italic' }}>
          Next, Amara faces a harder question: her data is clear, but should she open with a statistic or a human story? She has one night to decide how human to go.
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

/* ── MAIN COMPONENT ───────────────────────────────────────────── */
const PROGRESS = { 0: 50, 1: 50, 2: 65, 3: 80, 4: 80, 5: 100 };

export default function Activity05() {
  const [page, setPage] = useState(0);
  const { goHome, markComplete } = useApp();

  function handleComplete() {
    markComplete(5);
    setPage(4);
  }

  if (page === 0) {
    return (
      <NarrativeIntro
        data={AMARA[5].intro}
        activityNumber={5}
        onStart={() => setPage(1)}
        sidebarDot={5}
        progress={50}
      />
    );
  }

  if (page === 4) {
    return (
      <Debrief
        data={AMARA[5].debrief}
        activityNumber={5}
        onFinish={() => setPage(5)}
        sidebarDot={5}
        progress={80}
      />
    );
  }

  if (page === 5) {
    return <Completion onRetry={() => setPage(1)} />;
  }

  return (
    <Layout sidebarDot={5} progress={PROGRESS[page] || 80} bottomPad>
      {page === 1 && <Page1 onNext={() => setPage(2)} />}
      {page === 2 && <Page2 onNext={() => setPage(3)} />}
      {page === 3 && <Page3 onComplete={handleComplete} onRetry={() => setPage(1)} />}
    </Layout>
  );
}
