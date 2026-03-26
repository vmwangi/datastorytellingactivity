import { useState, useEffect, useRef, useMemo } from 'react';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import NarrativeIntro from '../../components/NarrativeIntro';
import Debrief from '../../components/Debrief';
import { AMARA } from '../../data/amara';

/* ─── Keyframe styles injected once ───────────────────────────────────────── */
const STYLES = `
  @keyframes slideInPage08 {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes shake08 {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-7px); }
    40%     { transform: translateX(7px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
  @keyframes mintGlow08 {
    0%   { box-shadow: 0 0 0 0 rgba(154,221,189,0); }
    40%  { box-shadow: 0 0 0 6px rgba(154,221,189,.5); }
    100% { box-shadow: 0 0 0 0 rgba(154,221,189,0); }
  }
  @keyframes slideDown08 {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn08 {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulseWarn08 {
    0%,100% { opacity: 1; }
    50%     { opacity: .35; }
  }
  .page-enter-08  { animation: slideInPage08 400ms cubic-bezier(0.25,0.46,0.45,0.94) both; }
  .anim-shake-08  { animation: shake08 .4s ease; }
  .anim-mint-08   { animation: mintGlow08 .6s ease; }
  .anim-slide-08  { animation: slideDown08 .35s ease; }
  .anim-fade-08   { animation: fadeIn08 .5s ease; }
  .pulse-warn-08  { animation: pulseWarn08 1.5s ease-in-out infinite; }
  .card-hover-08  { transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease; }
  .card-hover-08:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(189,57,57,0.25); border-color: #BD3939 !important; }
`;

function injectStyles(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const CLAIMS = [
  {
    id: 'A', letter: 'A',
    title: 'Product reduces customer churn by 42%',
    full: 'Our latest product update has reduced customer churn by 42% over the past quarter, representing a significant improvement in customer retention and business performance.',
    source: 'Company Press Release',
    refCredibility: 'LOW',
    explanation: 'Press releases are promotional by design and lack independent verification or disclosed methodology. No external validation is cited.',
  },
  {
    id: 'B', letter: 'B',
    title: 'Exercise reduces heart disease risk by 35%',
    full: 'A meta-analysis of 47 peer-reviewed studies found that regular aerobic exercise reduces the risk of cardiovascular disease by 35% in adults over 40.',
    source: 'Peer-Reviewed Journal',
    refCredibility: 'HIGH',
    explanation: 'Peer-reviewed journals require rigorous independent validation, methodology disclosure, and statistical transparency before publication.',
  },
  {
    id: 'C', letter: 'C',
    title: '73% of millennials prefer sustainable brands',
    full: '73% of millennials report preferring brands with clear sustainability commitments, according to our annual consumer sentiment survey of 1,200 respondents.',
    source: 'Sponsored Industry Survey',
    refCredibility: 'MEDIUM',
    explanation: 'Surveys can be methodologically sound, but company-sponsored research introduces framing and selection bias that is not disclosed in the claim.',
  },
  {
    id: 'D', letter: 'D',
    title: 'WFH increases productivity by 22%',
    full: 'Employees working from home report 22% higher productivity, according to a new analysis published on a workplace flexibility advocacy blog.',
    source: 'Anonymous Blog',
    refCredibility: 'LOW',
    explanation: 'Anonymous sources with no traceable methodology or peer review carry very low evidential weight. Advocacy funding creates directional bias.',
  },
  {
    id: 'E', letter: 'E',
    title: 'Vaccination reduces hospitalisation by 91%',
    full: 'National surveillance data from 14 countries shows that vaccinated individuals are 91% less likely to require hospitalisation for the target illness.',
    source: 'Government Health Data',
    refCredibility: 'HIGH',
    explanation: 'Government health agencies collect data with rigorous epidemiological standards, making this a high-credibility source for clinical outcomes.',
  },
];

const CRITERIA = [
  'Source Cited',
  'Methodology Explained',
  'Limitations Acknowledged',
  'Timeframe Specified',
  'Bias Disclosed',
];

// REF_TRANSPARENCY[criteriaIdx][claimIdx(A=0..E=4)]
const REF_TRANSPARENCY = [
  [true,  true,  true,  false, true ],
  [false, true,  true,  false, true ],
  [false, true,  false, false, true ],
  [false, true,  true,  false, true ],
  [false, true,  false, false, false],
];
// Scores: A=20%, B=100%, C=60%, D=0%, E=80%
const TRANSPARENCY_SCORES = [20, 100, 60, 0, 80];

const LABELS_DATA = [
  { id: 'l1', text: 'TRUNCATED AXIS',            correctChart: 1 },
  { id: 'l2', text: 'CHERRY-PICKED TIMEFRAME',   correctChart: 2 },
  { id: 'l3', text: 'CORRELATION NOT CAUSATION', correctChart: 3 },
  { id: 'l4', text: 'MISSING SAMPLE SIZE',       correctChart: null },
  { id: 'l5', text: 'NO SOURCE CITED',           correctChart: null },
];

const CHART_ANNOTATIONS = {
  1: 'Y-axis starts at 94, not 0 — making a 0.4pt gap look dramatic',
  2: 'Only Sep–Nov shown — a carefully chosen 3-month window',
  3: 'R=0.61 is correlation only — confounders unaddressed',
};

// WRONG_ATTEMPT_FEEDBACK[labelId][chartNum] — shown when a label is dropped on the wrong chart
const WRONG_ATTEMPT_FEEDBACK = {
  l1: {
    2: 'Chart 2\'s problem is the time window, not the axis. Look at where the Y-axis starts on Chart 1 — it doesn\'t begin at zero.',
    3: 'Chart 3 presents a correlation as causation. The truncated axis is a visual trick — look for the chart where the scale makes a tiny difference look massive.',
  },
  l2: {
    1: 'Chart 1\'s issue is its Y-axis scale, not the timeframe shown. Find the chart that only displays a conveniently chosen 3-month window.',
    3: 'Chart 3 conflates correlation with causation — the cherry-picked dates are on a different chart. Look for the one that hides a longer trend.',
  },
  l3: {
    1: 'Chart 1 manipulates the visual scale — it doesn\'t make a statistical claim. The correlation/causation issue belongs on the chart that reports an R-value.',
    2: 'Chart 2 selects a misleading time window — it doesn\'t conflate variables. Find the chart that treats a statistical relationship as proof of cause.',
  },
  l4: { 1: null, 2: null, 3: null },
  l5: { 1: null, 2: null, 3: null },
};

const DISTRACTOR_FEEDBACK = {
  l4: 'Sample size is not the manipulation in any of these three charts. This label describes a different type of data problem — look at the other labels.',
  l5: 'All three charts have citation issues, but that\'s not the specific visual manipulation being tested here. Focus on how each chart distorts what the numbers show.',
};

const VERDICTS      = { A: 'NEEDS SCRUTINY', B: 'TRUSTWORTHY', C: 'NEEDS SCRUTINY', D: 'NEEDS SCRUTINY', E: 'NEEDS SCRUTINY' };
const MANIPULATIONS = { A: true, B: false, C: true, D: true, E: false };

const CRED_CONFIG = {
  LOW:    { color: '#BD3939', bg: 'rgba(189,57,57,.12)',  label: 'Low Credibility'  },
  MEDIUM: { color: '#F59E0B', bg: 'rgba(245,158,11,.12)', label: 'Medium'           },
  HIGH:   { color: '#9ADDBD', bg: 'rgba(154,221,189,.12)', label: 'High Credibility' },
};

/* ─── SVG: MockSlide (intro) ───────────────────────────────────────────────── */
function MockSlide() {
  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: 420, background: '#181818',
      borderRadius: 10, border: '1px solid #222', padding: '16px', overflow: 'hidden',
    }}>
      <svg viewBox="0 0 380 190" style={{ width: '100%', display: 'block' }}>
        <rect width="380" height="190" fill="#181818" />
        <text x="190" y="22" fontSize="13" fill="#FFFFFF" textAnchor="middle" fontWeight="700">Q3 Performance Report</text>
        <text x="190" y="36" fontSize="8" fill="#666" textAnchor="middle">Year-over-year comparison — selected metrics</text>
        {[60, 90, 120, 150].map((y, i) => (
          <line key={i} x1="38" y1={y} x2="360" y2={y} stroke="#242424" strokeWidth="1" />
        ))}
        {[[50,80],[82,108],[114,65],[146,130],[178,95],[210,115],[242,72],[274,140],[306,88]].map(([x, h], i) => (
          <rect key={i} x={x} y={165 - h} width="24" height={h} fill={i % 2 === 0 ? '#2D2D2D' : '#252525'} rx="2" />
        ))}
        <line x1="38" y1="45" x2="38" y2="165" stroke="#333" strokeWidth="1" />
        <line x1="38" y1="165" x2="362" y2="165" stroke="#333" strokeWidth="1" />
        {[0, 40, 80, 120].map((v, i) => (
          <text key={i} x="32" y={165 - i * 30 + 3} fontSize="7" fill="#444" textAnchor="end">{v}</text>
        ))}
        <text x="190" y="183" fontSize="6.5" fill="#3A3A3A" textAnchor="middle">
          Source: Internal Analytics Dashboard — Proprietary &amp; Confidential
        </text>
      </svg>
      <div className="pulse-warn-08" style={{ position: 'absolute', top: 10, right: 10 }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 2L21 19H1L11 2Z" stroke="#BD3939" strokeWidth="1.5" fill="rgba(189,57,57,.12)" strokeLinejoin="round" />
          <line x1="11" y1="9" x2="11" y2="14" stroke="#BD3939" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="11" cy="16.5" r="0.8" fill="#BD3939" />
        </svg>
      </div>
    </div>
  );
}

/* ─── SVG: Chart1 — Truncated axis ────────────────────────────────────────── */
function Chart1SVG({ annotated }) {
  const yMin = 94, yMax = 97.5, cH = 90, cT = 34, cB = 124;
  const barH = v => (v - yMin) / (yMax - yMin) * cH;
  return (
    <svg viewBox="0 0 200 155" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="200" height="155" fill="#1A1A1A" rx="6" />
      <text x="100" y="14" fontSize="9" fill="#FFFFFF" textAnchor="middle" fontWeight="600">
        Our product leads on satisfaction.
      </text>
      {[94, 95, 96, 97].map(v => {
        const y = cB - barH(v);
        return (
          <g key={v}>
            <line x1="32" y1={y} x2="180" y2={y} stroke="#242424" strokeWidth=".7" />
            <text x="28" y={y + 3} fontSize="6.5" fill="#555" textAnchor="end">{v}</text>
          </g>
        );
      })}
      <rect x="52" y={cB - barH(96.2)} width="42" height={barH(96.2)} fill="#BD3939" opacity=".8" rx="2" />
      <text x="73" y={cB - barH(96.2) - 4} fontSize="7" fill="#FFFFFF" textAnchor="middle" fontWeight="600">96.2</text>
      <text x="73" y={cB + 11} fontSize="7" fill="#888" textAnchor="middle">Our Product</text>
      <rect x="104" y={cB - barH(95.8)} width="42" height={barH(95.8)} fill="#333" rx="2" />
      <text x="125" y={cB - barH(95.8) - 4} fontSize="7" fill="#888" textAnchor="middle">95.8</text>
      <text x="125" y={cB + 11} fontSize="7" fill="#888" textAnchor="middle">Competitor</text>
      <line x1="32" y1={cT} x2="32" y2={cB} stroke="#444" strokeWidth="1" />
      <line x1="32" y1={cB} x2="182" y2={cB} stroke="#444" strokeWidth="1" />
      {annotated && (
        <g className="anim-fade-08">
          <line x1="32" y1={cT + 8} x2="48" y2={cT + 18} stroke="#BD3939" strokeWidth="1.2" />
          <rect x="0" y={cT - 2} width="32" height="14" rx="3" fill="rgba(189,57,57,.2)" />
          <text x="16" y={cT + 7} fontSize="5.5" fill="#BD3939" textAnchor="middle" fontWeight="600">STARTS</text>
          <text x="16" y={cT + 13} fontSize="5.5" fill="#BD3939" textAnchor="middle" fontWeight="600">AT 94</text>
        </g>
      )}
    </svg>
  );
}

/* ─── SVG: Chart2 — Cherry-picked timeframe ───────────────────────────────── */
function Chart2SVG({ annotated }) {
  const pts = [[30, 100], [90, 72], [150, 30]];
  const months = ['Sep', 'Oct', 'Nov'];
  return (
    <svg viewBox="0 0 200 155" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="200" height="155" fill="#1A1A1A" rx="6" />
      <text x="100" y="14" fontSize="9" fill="#FFFFFF" textAnchor="middle" fontWeight="600">
        Sales growing steadily.
      </text>
      {[40, 70, 100, 130].map((y, i) => (
        <line key={i} x1="28" y1={y} x2="178" y2={y} stroke="#242424" strokeWidth=".7" />
      ))}
      <polyline
        points={pts.map(p => p.join(',')).join(' ')}
        fill="none" stroke="#399BA3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#399BA3" />
      ))}
      <line x1="28" y1="20" x2="28" y2="130" stroke="#444" strokeWidth="1" />
      <line x1="28" y1="130" x2="178" y2="130" stroke="#444" strokeWidth="1" />
      {months.map((m, i) => (
        <text key={i} x={pts[i][0]} y="142" fontSize="7.5" fill="#888" textAnchor="middle">{m}</text>
      ))}
      <text x="8" y="75" fontSize="7" fill="#555" textAnchor="middle" transform="rotate(-90,8,75)">Sales</text>
      {annotated && (
        <g className="anim-fade-08">
          <line x1="90" y1="143" x2="90" y2="152" stroke="#BD3939" strokeWidth="1.2" />
          <rect x="50" y="143" width="82" height="12" rx="3" fill="rgba(189,57,57,.2)" />
          <text x="91" y="151" fontSize="6" fill="#BD3939" textAnchor="middle" fontWeight="600">
            3 MONTHS ONLY
          </text>
        </g>
      )}
    </svg>
  );
}

/* ─── SVG: Chart3 — Correlation not causation ────────────────────────────── */
function Chart3SVG({ annotated }) {
  const dots = [
    [35,110],[48,98],[55,88],[68,80],[75,70],[82,65],
    [92,62],[105,55],[112,48],[125,40],[140,38],[152,30],
  ];
  return (
    <svg viewBox="0 0 200 155" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="200" height="155" fill="#1A1A1A" rx="6" />
      <text x="100" y="14" fontSize="9" fill="#FFFFFF" textAnchor="middle" fontWeight="600">
        Training hours predict performance.
      </text>
      {[40, 70, 100, 130].map((y, i) => (
        <line key={i} x1="28" y1={y} x2="178" y2={y} stroke="#242424" strokeWidth=".7" />
      ))}
      <line x1="32" y1="118" x2="170" y2="28" stroke="#222222" strokeWidth="1" strokeDasharray="3,2" />
      {dots.map((d, i) => (
        <circle key={i} cx={d[0]} cy={d[1]} r="3.5" fill="#399BA3" opacity=".75" />
      ))}
      <line x1="28" y1="20" x2="28" y2="130" stroke="#444" strokeWidth="1" />
      <line x1="28" y1="130" x2="178" y2="130" stroke="#444" strokeWidth="1" />
      <text x="103" y="142" fontSize="7.5" fill="#888" textAnchor="middle">Training Hours</text>
      <text x="8" y="75" fontSize="7" fill="#555" textAnchor="middle" transform="rotate(-90,8,75)">Performance</text>
      <text x="168" y="32" fontSize="8.5" fill="#F59E0B" textAnchor="end" fontWeight="600">R=0.61</text>
      {annotated && (
        <g className="anim-fade-08">
          <line x1="90" y1="72" x2="115" y2="82" stroke="#BD3939" strokeWidth="1.2" />
          <rect x="110" y="78" width="70" height="20" rx="3" fill="rgba(189,57,57,.2)" />
          <text x="145" y="87" fontSize="6" fill="#BD3939" textAnchor="middle" fontWeight="600">CORRELATION</text>
          <text x="145" y="94" fontSize="6" fill="#BD3939" textAnchor="middle" fontWeight="600">≠ CAUSATION</text>
        </g>
      )}
    </svg>
  );
}

/* ─── Page 1 — Intro ───────────────────────────────────────────────────────── */
function Page1({ onNext }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 300);
    const t2 = setTimeout(() => setStep(2), 900);
    const t3 = setTimeout(() => setStep(3), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <Layout sidebarDot={8} progress={87}>
      <div className="page-enter-08" style={{ padding: '24px 16px 0', maxWidth: 560, margin: '0 auto' }}>

        <div style={{
          opacity: step >= 1 ? 1 : 0,
          transform: step >= 1 ? 'none' : 'translateY(12px)',
          transition: 'all .6s ease',
        }}>
          <div style={{ fontSize: 'clamp(52px,10vw,80px)', fontWeight: 900, color: '#BD3939', lineHeight: 1, letterSpacing: '-.04em' }}>08</div>
          <div style={{ fontSize: 'clamp(22px,5vw,32px)', fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>Credibility &amp; Transparency</div>
          <div style={{ fontSize: 13, color: '#a88a87', marginTop: 6, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            The Trust Audit
          </div>
        </div>

        <div style={{
          opacity: step >= 2 ? 1 : 0,
          transform: step >= 2 ? 'none' : 'translateY(14px)',
          transition: 'all .7s ease',
          display: 'flex', justifyContent: 'center', marginTop: 28,
        }}>
          <MockSlide />
        </div>

        <div style={{
          opacity: step >= 3 ? 1 : 0,
          transform: step >= 3 ? 'none' : 'translateY(12px)',
          transition: 'all .7s ease',
          marginTop: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 'clamp(17px,4vw,21px)', fontStyle: 'italic', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.35 }}>
            "Not all data is created equal. Trust is earned, not assumed."
          </div>
          <div style={{ fontSize: 14, color: '#AAAAAA', marginTop: 12, lineHeight: 1.65, maxWidth: 440, margin: '12px auto 0' }}>
            A credible data story earns its audience's trust at every level: the source it uses,
            the methodology it discloses, and the visuals it chooses. Any one of these can be
            manipulated — and audiences notice, even when they can't name what is wrong.
          </div>
        </div>
      </div>

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
          Start the Audit
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
        </button>
      </div>
    </Layout>
  );
}

/* ─── SourceCard ───────────────────────────────────────────────────────────── */
function SourceCard({ claim, rating, onRate, revealed, expanded, onToggle }) {
  const cfg     = revealed ? CRED_CONFIG[claim.refCredibility] : null;
  const correct = revealed && rating === claim.refCredibility;

  return (
    <div className="card-hover-08" style={{
      background: '#1A1A1A', borderRadius: 8, overflow: 'hidden',
      border: revealed
        ? `1px solid ${correct ? 'rgba(154,221,189,.4)' : 'rgba(189,57,57,.35)'}`
        : '1px solid #222222',
      transition: 'border-color .3s',
    }}>
      {/* header row */}
      <div
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, minHeight: 44 }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: 'rgba(189,57,57,.15)',
          border: '1px solid rgba(189,57,57,.4)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#BD3939' }}>{claim.id}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13.5, fontWeight: 600, color: '#FFFFFF',
            whiteSpace: expanded ? 'normal' : 'nowrap',
            overflow: expanded ? 'visible' : 'hidden',
            textOverflow: expanded ? 'clip' : 'ellipsis',
          }}>
            {claim.title}
          </div>
        </div>
        <div style={{
          flexShrink: 0, fontSize: 10, padding: '3px 8px', borderRadius: 4,
          background: revealed ? cfg.bg : '#222222',
          color: revealed ? cfg.color : '#888',
          fontWeight: 600, letterSpacing: '.03em', maxWidth: 100, textAlign: 'center', lineHeight: 1.3,
        }}>
          {claim.source}
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#555', flexShrink: 0 }}>
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {/* expanded content */}
      {expanded && (
        <div className="anim-slide-08" style={{ padding: '0 14px 14px' }}>
          <div style={{
            fontSize: 13, color: '#AAAAAA', lineHeight: 1.65, marginBottom: 12,
            borderTop: '1px solid #242424', paddingTop: 10,
          }}>
            {claim.full}
          </div>

          {!revealed && (
            <div>
              <div style={{ fontSize: 10, color: '#a88a87', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                Rate this source:
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['LOW', 'MEDIUM', 'HIGH'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => onRate(claim.id, lvl)}
                    aria-pressed={rating === lvl}
                    style={{
                      flex: 1, padding: '9px 6px', borderRadius: 6,
                      border: `1px solid ${CRED_CONFIG[lvl].color}`,
                      background: rating === lvl ? CRED_CONFIG[lvl].bg : 'transparent',
                      color: rating === lvl ? CRED_CONFIG[lvl].color : '#888',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '.04em',
                      transition: 'all .2s', fontFamily: 'Inter', minHeight: 44,
                    }}
                  >
                    {CRED_CONFIG[lvl].label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {revealed && (
            <div style={{
              background: correct ? 'rgba(154,221,189,.06)' : 'rgba(189,57,57,.06)',
              borderRadius: 6, padding: '10px 12px',
              borderLeft: `3px solid ${correct ? '#9ADDBD' : '#BD3939'}`,
            }}>
              <div style={{
                fontSize: 11, color: correct ? '#9ADDBD' : '#BD3939',
                letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 5, fontWeight: 600,
              }}>
                {correct ? '✓ Correct' : `Reference: ${claim.refCredibility} credibility`}
              </div>
              <div style={{ fontSize: 13, color: '#AAAAAA', lineHeight: 1.55 }}>{claim.explanation}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Page 2 — Source Rating ───────────────────────────────────────────────── */
function Page2({ onNext }) {
  const [ratings,  setRatings]  = useState({});
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const allRated     = CLAIMS.every(c => ratings[c.id]);
  const correctCount = revealed ? CLAIMS.filter(c => ratings[c.id] === c.refCredibility).length : 0;

  return (
    <Layout sidebarDot={8} progress={91}>
      <div className="page-enter-08" style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 10, color: '#BD3939', letterSpacing: '.12em', textTransform: 'uppercase',
          fontWeight: 700, marginBottom: 4 }}>Stage 1 of 3 — Rate the Sources</div>
        <div style={{ height: 4, background: '#222222', borderRadius: 2 }}>
          <div style={{
            height: 4, background: '#BD3939', borderRadius: 2,
            width: `${(Object.keys(ratings).length / 5) * 100}%`, transition: 'width .4s',
          }} />
        </div>
        <div style={{ fontSize: 13, color: '#AAAAAA', marginTop: 10 }} aria-live="polite">
          {revealed
            ? <span style={{ color: '#9ADDBD' }}>{correctCount}/5 correct — scroll to review</span>
            : 'Expand each claim and rate the credibility of its source.'}
        </div>
      </div>

      {/* Amara intro */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ background: 'rgba(189,57,57,0.06)', border: '1px solid rgba(189,57,57,0.25)',
          borderRadius: 12, padding: '14px 18px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 7px 0' }}>
            Amara's verification step
          </p>
          <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
            Before Amara presents her findings to leadership, she needs to know which claims
            will hold up under scrutiny. A single weak source can unravel an entire argument.
            Five claims are in front of her — each backed by a different type of source.
            Expand each one, judge how credible the source is, and help Amara decide
            what she can stand behind with confidence.
          </p>
        </div>
      </div>

      <div style={{ padding: '12px 16px 0', paddingBottom: 120, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CLAIMS.map(claim => (
          <SourceCard
            key={claim.id}
            claim={claim}
            rating={ratings[claim.id]}
            onRate={(id, lvl) => setRatings(r => ({ ...r, [id]: lvl }))}
            revealed={revealed}
            expanded={expanded === claim.id}
            onToggle={() => setExpanded(e => e === claim.id ? null : claim.id)}
          />
        ))}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, #131313 55%)',
        padding: '32px 20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 60,
      }}>
        <span style={{ fontSize: 13, color: '#AAAAAA' }}>
          {revealed ? `${correctCount}/5 correct` : `${Object.keys(ratings).length}/5 rated`}
        </span>
        {!revealed ? (
          <button
            onClick={() => { setRevealed(true); setExpanded(null); }}
            disabled={!allRated}
            className={allRated ? 'bg-crimson-gradient' : ''}
            style={{
              padding: '14px 28px', borderRadius: 8, border: 'none',
              color: allRated ? 'white' : '#555', fontSize: 16, fontWeight: 700,
              cursor: allRated ? 'pointer' : 'not-allowed',
              background: allRated ? undefined : '#1A1A1A',
              display: 'flex', alignItems: 'center', gap: 8, minHeight: 44,
              fontFamily: 'Inter',
            }}
          >
            Check Ratings
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>fact_check</span>
          </button>
        ) : (
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
            Stage 2: Transparency
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </button>
        )}
      </div>
    </Layout>
  );
}

// Feedback for wrong checks (user ticks a cell where ref=false)
const WRONG_CELL_FEEDBACK = {
  '0-3': 'Claim D comes from an anonymous blog — no named source is cited anywhere in the post.',
  '1-0': 'The press release states the churn figure but explains no methodology for how it was calculated.',
  '1-3': 'The anonymous blog names no author and provides no methodology for the productivity study.',
  '2-0': 'Press releases are promotional by design — they do not acknowledge limitations.',
  '2-2': 'Claim C does not disclose that the survey was sponsor-funded, which is itself a limitation.',
  '2-3': 'The blog post lists no limitations, caveats, or confounders.',
  '3-0': '"Past quarter" is vague — no specific quarter or date range is stated.',
  '3-3': 'The blog post gives no timeframe for when the productivity analysis was conducted.',
  '4-0': 'The press release has obvious promotional bias — none of it is declared.',
  '4-2': 'Claim C is funded by the company being measured — this conflict of interest is not declared.',
  '4-3': 'An advocacy blog carries strong directional bias — this is never acknowledged.',
  '4-4': 'Government health data may carry institutional framing — no bias disclosure is present.',
};


/* ─── Page 3 — Transparency Checklist ─────────────────────────────────────── */
function Page3({ onNext }) {
  const [grid,       setGrid]       = useState(() => Array(5).fill(null).map(() => Array(5).fill(false)));
  const [revealed,   setRevealed]   = useState(false);
  const [lastToggle, setLastToggle] = useState(null); // { ci, cj, nowChecked, isCorrect }

  const toggleCell = (ci, cj) => {
    if (revealed) return;
    const nowChecked = !grid[ci][cj];
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[ci][cj] = nowChecked;
      return next;
    });
    if (nowChecked && !REF_TRANSPARENCY[ci][cj]) {
      setLastToggle({ ci, cj });
    } else {
      setLastToggle(null);
    }
  };

  const toggledCount = grid.flat().filter(Boolean).length;
  const canCheck     = toggledCount >= 10;

  const userTransScores = CLAIMS.map((_, j) => {
    const count = CRITERIA.filter((_, i) => grid[i][j]).length;
    return Math.round((count / 5) * 100);
  });

  return (
    <Layout sidebarDot={8} progress={94}>
      <div className="page-enter-08" style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 10, color: '#BD3939', letterSpacing: '.12em', textTransform: 'uppercase',
          fontWeight: 700, marginBottom: 4 }}>Stage 2 of 3 — Transparency Checklist</div>
        <div style={{ height: 4, background: '#222222', borderRadius: 2 }}>
          <div style={{
            height: 4, background: '#BD3939', borderRadius: 2,
            width: `${Math.min((toggledCount / 15) * 100, 100)}%`, transition: 'width .3s',
          }} />
        </div>
        <div style={{ fontSize: 13, color: '#AAAAAA', marginTop: 9, lineHeight: 1.5 }} aria-live="polite">
          {revealed
            ? 'Reference grid revealed — mint = correct, crimson = incorrect.'
            : 'Check each box if you believe that criterion is present in that claim.'}
        </div>
      </div>

      {/* Amara intro */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ background: 'rgba(189,57,57,0.06)', border: '1px solid rgba(189,57,57,0.25)',
          borderRadius: 12, padding: '14px 18px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 7px 0' }}>
            Amara's transparency test
          </p>
          <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
            Rating sources told Amara which claims are credible. Now she needs to go deeper —
            does each claim actually show its working? Transparent data names its source,
            states the sample size, declares any limitations, and can be verified independently.
            Work through the grid and mark which transparency criteria each claim meets.
            This is the standard Amara will hold herself to when she presents her own findings.
          </p>
        </div>
      </div>

      {/* Claims reference */}
      <div style={{ padding: '10px 16px 0' }}>
        <div style={{ fontSize: 10, color: '#a88a87', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
          Claims Reference
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CLAIMS.map(c => (
            <div key={c.id} style={{ background: '#1A1A1A', border: '1px solid rgba(89,65,63,0.2)',
              borderLeft: '3px solid rgba(189,57,57,0.5)', borderRadius: 7, padding: '9px 12px',
              display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(189,57,57,0.12)', border: '1px solid rgba(189,57,57,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#BD3939' }}>{c.id}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#e5e2e1', margin: '0 0 2px' }}>{c.title}</p>
                <span style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>Source: {c.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid — horizontal scroll allowed here for table */}
      <div style={{ padding: '12px 16px 0', overflowX: 'auto', paddingBottom: 0 }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 5, minWidth: 380 }}>
          <thead>
            <tr>
              <th style={{ width: 130, paddingRight: 8 }} />
              {CLAIMS.map((c, j) => (
                <th key={j} style={{ width: 52 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', margin: '0 auto',
                    background: 'rgba(189,57,57,.12)', border: '1px solid rgba(189,57,57,.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#BD3939' }}>{c.id}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((crit, ci) => (
              <tr key={ci}>
                <td style={{ paddingRight: 8, paddingTop: 3, paddingBottom: 3 }}>
                  <div style={{
                    background: '#1A1A1A', borderRadius: 5, padding: '7px 10px',
                    borderLeft: '2px solid #399BA3', fontSize: 11.5, color: '#AAAAAA', lineHeight: 1.3,
                  }}>
                    {crit}
                  </div>
                </td>
                {CLAIMS.map((_, cj) => {
                  const checked = grid[ci][cj];
                  const ref     = REF_TRANSPARENCY[ci][cj];
                  let bg      = '#1E1E1E';
                  let content = null;
                  if (!revealed && checked) { bg = 'rgba(189,57,57,.2)'; content = '✓'; }
                  if (revealed) {
                    if (checked && ref)   { bg = 'rgba(154,221,189,.15)'; content = '✓'; }
                    if (checked && !ref)  { bg = 'rgba(189,57,57,.2)';   content = '✕'; }
                    if (!checked && ref)  { bg = 'rgba(245,158,11,.1)';  content = '·'; }
                    if (!checked && !ref) { bg = '#1A1A1A'; content = ''; }
                  }
                  return (
                    <td key={cj} style={{ paddingTop: 3, paddingBottom: 3 }}>
                      <div
                        onClick={() => toggleCell(ci, cj)}
                        className="card-hover-08"
                        role="button"
                        tabIndex={revealed ? -1 : 0}
                        onKeyDown={e => { if (!revealed && (e.key === 'Enter' || e.key === ' ')) toggleCell(ci, cj); }}
                        aria-pressed={checked}
                        style={{
                          width: 46, height: 44, borderRadius: 5, background: bg,
                          border: revealed
                            ? `1px solid ${checked === ref ? 'rgba(154,221,189,.3)' : 'rgba(189,57,57,.3)'}`
                            : `1px solid ${checked ? 'rgba(189,57,57,.4)' : '#222222'}`,
                          cursor: revealed ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16,
                          color: revealed
                            ? (checked && ref ? '#9ADDBD' : checked && !ref ? '#BD3939' : !checked && ref ? '#F59E0B' : '#333')
                            : '#BD3939',
                          transition: 'all .2s', fontWeight: 600, minHeight: 44,
                        }}
                      >
                        {content}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Column score bars */}
        <div style={{ display: 'flex', marginTop: 10, minWidth: 380 }}>
          <div style={{ width: 138 }}>
            <div style={{
              fontSize: 10, color: '#555', letterSpacing: '.04em', textTransform: 'uppercase',
              paddingRight: 8, paddingTop: 6, textAlign: 'right',
            }}>Transparency</div>
          </div>
          {CLAIMS.map((c, j) => {
            const score = revealed ? TRANSPARENCY_SCORES[j] : userTransScores[j];
            const color = score >= 80 ? '#9ADDBD' : score >= 50 ? '#399BA3' : '#BD3939';
            return (
              <div key={j} style={{ width: 51, paddingLeft: 3 }}>
                <div style={{
                  fontSize: 10, color: revealed ? color : '#555', textAlign: 'center',
                  marginBottom: 3, fontWeight: 600, transition: 'color .5s',
                }}>
                  {score}%
                </div>
                <div style={{ height: 4, background: '#222222', borderRadius: 2 }}>
                  <div style={{
                    height: 4, background: revealed ? color : '#333', borderRadius: 2,
                    width: `${score}%`, transition: 'width .8s ease, background .3s',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {revealed && (
          <div className="anim-fade-08" style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              ['✓', 'rgba(154,221,189,.15)', '#9ADDBD', 'Correct'],
              ['✕', 'rgba(189,57,57,.2)',    '#BD3939', 'Wrong'],
              ['·', 'rgba(245,158,11,.1)',   '#F59E0B', 'Should be checked'],
            ].map(([sym, bg, col, lbl]) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#888' }}>
                <div style={{
                  width: 18, height: 16, background: bg, borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: col, fontWeight: 600,
                }}>{sym}</div>
                {lbl}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wrong-tick feedback */}
      {!revealed && lastToggle && (() => {
        const key = `${lastToggle.ci}-${lastToggle.cj}`;
        const msg = WRONG_CELL_FEEDBACK[key];
        if (!msg) return null;
        const claim = CLAIMS[lastToggle.cj];
        const crit  = CRITERIA[lastToggle.ci];
        return (
          <div key={key} style={{ padding: '10px 16px 0' }}>
            <div style={{ background: 'rgba(189,57,57,0.08)', border: '1px solid rgba(189,57,57,0.35)',
              borderLeft: '3px solid #BD3939', borderRadius: 8, padding: '10px 14px',
              animation: 'fadeIn08 .3s ease-out forwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#BD3939', flexShrink: 0 }}>close</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#BD3939', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Claim {claim.id} — {crit}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.55 }}>{msg}</p>
            </div>
          </div>
        );
      })()}

      {/* Bottom spacing */}
      <div style={{ height: 120 }} />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, #131313 55%)',
        padding: '32px 20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 60,
      }}>
        <span style={{ fontSize: 13, color: '#AAAAAA' }}>
          {revealed ? 'Stage 2 complete' : `${toggledCount} cells selected`}
        </span>
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            disabled={!canCheck}
            className={canCheck ? 'bg-crimson-gradient' : ''}
            style={{
              padding: '14px 28px', borderRadius: 8, border: 'none',
              color: canCheck ? 'white' : '#555', fontSize: 16, fontWeight: 700,
              cursor: canCheck ? 'pointer' : 'not-allowed',
              background: canCheck ? undefined : '#1A1A1A',
              display: 'flex', alignItems: 'center', gap: 8, minHeight: 44,
              fontFamily: 'Inter',
            }}
          >
            Check Transparency
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>checklist</span>
          </button>
        ) : (
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
            Stage 3: Spot Manipulation
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </button>
        )}
      </div>
    </Layout>
  );
}

/* ─── Final Report ─────────────────────────────────────────────────────────── */
function FinalReport({ chartMatches }) {
  const credColor = { HIGH: '#9ADDBD', MEDIUM: '#F59E0B', LOW: '#BD3939' };

  return (
    <div className="anim-fade-08" style={{
      background: '#1A1A1A', borderRadius: 10,
      border: '1px solid #399BA3', padding: '16px', marginTop: 16,
    }}>
      <div style={{ fontSize: 11, color: '#399BA3', letterSpacing: '.12em', textTransform: 'uppercase',
        fontWeight: 700, marginBottom: 12 }}>
        Final Audit Report — All 5 Claims
      </div>
      {/* Header row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 70px 56px 80px 80px',
        gap: 6, marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid #242424',
      }}>
        {['Claim', 'Credibility', 'Transp.', 'Manipulation', 'Verdict'].map(h => (
          <div key={h} style={{ fontSize: 9.5, color: '#555', letterSpacing: '.05em',
            textTransform: 'uppercase', fontWeight: 600 }}>{h}</div>
        ))}
      </div>
      {CLAIMS.map((c, i) => {
        const verdict = VERDICTS[c.id];
        const manip   = MANIPULATIONS[c.id];
        const transp  = TRANSPARENCY_SCORES[i];
        const isGood  = verdict === 'TRUSTWORTHY';
        return (
          <div key={c.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 70px 56px 80px 80px',
            gap: 6, padding: '8px 0', borderBottom: '1px solid #1E1E1E', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 10, color: '#a88a87', fontWeight: 700, marginBottom: 2 }}>{c.id}</div>
              <div style={{ fontSize: 11, color: '#AAAAAA', lineHeight: 1.4 }}>{c.title}</div>
            </div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: credColor[c.refCredibility],
              background: `${credColor[c.refCredibility]}18`, padding: '3px 6px', borderRadius: 4,
              textAlign: 'center', lineHeight: 1.3,
            }}>
              {c.refCredibility}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3,
                color: transp >= 80 ? '#9ADDBD' : transp >= 50 ? '#F59E0B' : '#BD3939' }}>
                {transp}%
              </div>
              <div style={{ height: 3, background: '#222222', borderRadius: 1 }}>
                <div style={{
                  height: 3, borderRadius: 1, width: `${transp}%`,
                  background: transp >= 80 ? '#9ADDBD' : transp >= 50 ? '#F59E0B' : '#BD3939',
                  transition: 'width .8s',
                }} />
              </div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, textAlign: 'center',
              color: manip ? '#BD3939' : '#9ADDBD' }}>
              {manip ? 'DETECTED' : 'NONE'}
            </div>
            <div style={{
              padding: '4px 6px', borderRadius: 5, textAlign: 'center', fontSize: 9.5,
              fontWeight: 700, letterSpacing: '.04em',
              background: isGood ? 'rgba(154,221,189,.12)' : 'rgba(189,57,57,.1)',
              color: isGood ? '#9ADDBD' : '#BD3939',
              border: `1px solid ${isGood ? 'rgba(154,221,189,.3)' : 'rgba(189,57,57,.25)'}`,
            }}>
              {verdict}
            </div>
          </div>
        );
      })}
      <div style={{
        marginTop: 14, padding: '12px 14px', background: 'rgba(189,57,57,.06)',
        borderRadius: 6, borderLeft: '3px solid #BD3939',
      }}>
        <div style={{ fontSize: 14, fontStyle: 'italic', color: '#FFFFFF', lineHeight: 1.65 }}>
          Only 1 of 5 claims is fully trustworthy. In a real boardroom, the other 4 would lead to bad decisions.
        </div>
      </div>
    </div>
  );
}

/* ─── Page 4 — Manipulation Spotter ───────────────────────────────────────── */
function Page4({ onNext }) {
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [chartLabels,   setChartLabels]   = useState({});
  const [shakingChart,  setShakingChart]  = useState(null);
  const [showReport,    setShowReport]    = useState(false);
  const reportRef = useRef(null);

  const CHARTS = [
    { num: 1, Comp: Chart1SVG },
    { num: 2, Comp: Chart2SVG },
    { num: 3, Comp: Chart3SVG },
  ];

  const [draggingLabel, setDraggingLabel] = useState(null);
  const [wrongAttempt,  setWrongAttempt]  = useState(null); // { labelId, chartNum, msg }

  const placedLabelIds = new Set(Object.values(chartLabels));
  const poolLabels     = LABELS_DATA.filter(l => !placedLabelIds.has(l.id));
  const allMatched     = Object.keys(chartLabels).length === 3;

  function pickLabel(id) { setSelectedLabel(s => s === id ? null : id); }

  function placeLabel(labelId, chartNum) {
    const label = LABELS_DATA.find(l => l.id === labelId);
    if (label.correctChart === chartNum) {
      setChartLabels(prev => ({ ...prev, [chartNum]: labelId }));
      setWrongAttempt(null);
    } else {
      setShakingChart(chartNum);
      setTimeout(() => setShakingChart(null), 450);
      const isDistractor = label.correctChart === null;
      const msg = isDistractor
        ? DISTRACTOR_FEEDBACK[labelId]
        : (WRONG_ATTEMPT_FEEDBACK[labelId]?.[chartNum] || 'That label doesn\'t match this chart — re-read the chart carefully and try another.');
      setWrongAttempt({ labelId, chartNum, msg, labelText: label.text });
    }
    setSelectedLabel(null);
    setDraggingLabel(null);
  }

  function dropOnChart(chartNum) {
    if (!selectedLabel) return;
    placeLabel(selectedLabel, chartNum);
  }

  function onLabelDragStart(e, labelId) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', labelId);
    setDraggingLabel(labelId);
    setSelectedLabel(null);
  }

  function onChartDragOver(e, chartNum) {
    if (chartLabels[chartNum]) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onChartDrop(e, chartNum) {
    e.preventDefault();
    const labelId = e.dataTransfer.getData('text/plain');
    if (!labelId) return;
    placeLabel(labelId, chartNum);
  }

  useEffect(() => {
    if (allMatched && !showReport) {
      setTimeout(() => {
        setShowReport(true);
        setTimeout(() => { reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200);
      }, 600);
    }
  }, [allMatched]);

  return (
    <Layout sidebarDot={8} progress={97}>
      <div className="page-enter-08" style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 10, color: '#BD3939', letterSpacing: '.12em', textTransform: 'uppercase',
          fontWeight: 700, marginBottom: 4 }}>Stage 3 of 3 — Spot the Manipulation</div>
        <div style={{ height: 4, background: '#222222', borderRadius: 2 }}>
          <div style={{
            height: 4, background: '#BD3939', borderRadius: 2,
            width: `${(Object.keys(chartLabels).length / 3) * 100}%`, transition: 'width .5s',
          }} />
        </div>
        <div style={{ fontSize: 13, color: '#AAAAAA', marginTop: 9 }} aria-live="polite">
          {selectedLabel
            ? <span style={{ color: '#BD3939' }}>Tap the chart this label describes ↓</span>
            : draggingLabel
            ? <span style={{ color: '#BD3939' }}>Drop onto the chart it describes ↓</span>
            : allMatched
            ? <span style={{ color: '#9ADDBD' }}>All three matched — see the full audit report below</span>
            : 'Drag or select a label, then drop or tap the chart it describes.'}
        </div>
      </div>

      {/* Amara intro */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ background: 'rgba(189,57,57,0.06)', border: '1px solid rgba(189,57,57,0.25)',
          borderRadius: 12, padding: '14px 18px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 7px 0' }}>
            Amara's final check
          </p>
          <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.65 }}>
            Credible sources and transparent methodology are necessary — but not sufficient.
            Data can still be presented in ways that mislead even when the underlying numbers are real.
            Amara has spotted three charts that use visual tricks to distort the story.
            Match each manipulation label to the chart it describes, and she will have the full picture
            before she walks into that boardroom.
          </p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CHARTS.map(({ num, Comp }) => {
          const matched    = !!chartLabels[num];
          const isShake    = shakingChart === num;
          const canDrop    = (!!selectedLabel || !!draggingLabel) && !matched;
          const annotation = matched ? CHART_ANNOTATIONS[num] : null;
          return (
            <div
              key={num}
              onClick={() => !matched && selectedLabel && dropOnChart(num)}
              onKeyDown={e => { if (canDrop && (e.key === 'Enter' || e.key === ' ')) dropOnChart(num); }}
              onDragOver={e => onChartDragOver(e, num)}
              onDrop={e => onChartDrop(e, num)}
              role={canDrop ? 'button' : undefined}
              tabIndex={canDrop ? 0 : undefined}
              aria-label={`Chart ${num} drop zone`}
              className={isShake ? 'anim-shake-08' : ''}
              style={{
                background: '#1A1A1A', borderRadius: 8,
                border: matched
                  ? '1px solid rgba(154,221,189,.4)'
                  : canDrop ? '2px dashed rgba(189,57,57,.55)' : '1px solid #222222',
                overflow: 'hidden',
                cursor: canDrop ? 'pointer' : 'default',
                transition: 'border-color .25s',
              }}
            >
              <div style={{ aspectRatio: '200/155', maxWidth: '100%' }}>
                <Comp annotated={matched} />
              </div>
              {matched && (
                <div className="anim-slide-08" style={{
                  padding: '8px 12px', background: 'rgba(154,221,189,.05)',
                  borderTop: '1px solid rgba(154,221,189,.2)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{
                    background: 'rgba(189,57,57,.15)', borderRadius: 4, padding: '3px 8px',
                    fontSize: 10, color: '#BD3939', fontWeight: 700, letterSpacing: '.04em', flexShrink: 0,
                  }}>
                    {LABELS_DATA.find(l => l.id === chartLabels[num])?.text}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ADDBD', lineHeight: 1.4 }}>{annotation}</div>
                </div>
              )}
              {canDrop && !matched && (
                <div style={{ padding: '6px 12px', fontSize: 11, color: 'rgba(189,57,57,.5)', textAlign: 'center' }}>
                  Tap to place label here
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Wrong-attempt feedback */}
      {wrongAttempt && (
        <div style={{ padding: '10px 16px 0' }}>
          <div style={{ background: 'rgba(189,57,57,0.08)', border: '1px solid rgba(189,57,57,0.35)',
            borderLeft: '3px solid #BD3939', borderRadius: 8, padding: '10px 14px',
            animation: 'fadeIn08 .3s ease-out forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#BD3939', flexShrink: 0 }}>close</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#BD3939', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                "{wrongAttempt.labelText}" doesn't fit Chart {wrongAttempt.chartNum}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0, lineHeight: 1.6 }}>{wrongAttempt.msg}</p>
          </div>
        </div>
      )}

      {/* Label pool */}
      {poolLabels.length > 0 && (
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ fontSize: 10, color: '#a88a87', letterSpacing: '.12em',
            textTransform: 'uppercase', marginBottom: 8 }}>
            Manipulation Labels
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {poolLabels.map(label => (
              <div
                key={label.id}
                draggable
                onDragStart={e => onLabelDragStart(e, label.id)}
                onDragEnd={() => setDraggingLabel(null)}
                onClick={() => pickLabel(label.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && pickLabel(label.id)}
                className="card-hover-08"
                style={{
                  background: selectedLabel === label.id ? 'rgba(189,57,57,.15)' : '#1A1A1A',
                  border: selectedLabel === label.id
                    ? '1px solid rgba(189,57,57,.6)'
                    : '1px solid rgba(189,57,57,.25)',
                  borderRadius: 7, padding: '11px 14px', fontSize: 13, fontWeight: 700,
                  color: selectedLabel === label.id ? '#FFFFFF' : '#AAAAAA',
                  cursor: 'grab', transition: 'all .2s', letterSpacing: '.03em',
                  display: 'flex', alignItems: 'center', gap: 8, minHeight: 44,
                  opacity: draggingLabel === label.id ? 0.35 : 1,
                }}
              >
                <span style={{ color: 'rgba(189,57,57,.5)', fontSize: 11, flexShrink: 0 }}>⠿</span>
                {label.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Report */}
      {showReport && (
        <div ref={reportRef} style={{ padding: '16px 16px 0' }}>
          <FinalReport chartMatches={chartLabels} />
        </div>
      )}

      {/* Bottom spacing */}
      <div style={{ height: 100 }} />

      {/* CTA — always visible; enabled only after report */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, #131313 55%)',
        padding: '32px 20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 60,
      }}>
        <span style={{ fontSize: 13, color: '#AAAAAA' }}>
          {allMatched ? 'All matched ✓' : `${Object.keys(chartLabels).length}/3 matched`}
        </span>
        <button
          onClick={allMatched ? onNext : undefined}
          disabled={!allMatched}
          className={allMatched ? 'bg-crimson-gradient' : ''}
          style={{
            padding: '14px 28px', borderRadius: 8, border: 'none',
            color: allMatched ? 'white' : '#444',
            background: allMatched ? undefined : '#1A1A1A',
            fontSize: 16, fontWeight: 700,
            cursor: allMatched ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: 8, minHeight: 44,
            fontFamily: 'Inter', transition: 'all .3s',
          }}
        >
          Complete Activity
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
        </button>
      </div>
    </Layout>
  );
}

/* ─── Completion ───────────────────────────────────────────────────────────── */
function CompletionPage() {
  const { goHome } = useApp();

  const ALL_ACTIVITIES = [
    ['01', 'Data Context'],
    ['02', 'Narrative Structure'],
    ['03', 'Audience-Centric Thinking'],
    ['04', 'Clarity Over Complexity'],
    ['05', 'Visual Encoding'],
    ['06', 'Emotional Connection'],
    ['07', 'Actionability'],
    ['08', 'Credibility & Transparency'],
  ];

  return (
    <Layout sidebarDot={8} progress={100} bottomPad={false}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: 500, width: '100%' }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#BD3939', letterSpacing: '-.04em', lineHeight: 1 }}>08</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', marginTop: 8 }}>Complete</div>
          <div style={{ width: 48, height: 3, background: 'linear-gradient(135deg,#BD3939,#8D141B)',
            borderRadius: 2, margin: '14px auto 20px' }} />

          <div style={{
            background: 'rgba(57,155,163,.08)', borderRadius: 8, padding: '16px 18px',
            borderLeft: '3px solid #399BA3', textAlign: 'left', marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, color: '#399BA3', letterSpacing: '.12em',
              textTransform: 'uppercase', marginBottom: 6 }}>All 8 Activities Complete</div>
            <div style={{ fontSize: 14, color: '#FFFFFF', lineHeight: 1.65 }}>
              You can now identify untrustworthy sources, spot missing transparency, and catch
              visual manipulation — three skills that protect your audience from bad decisions.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, textAlign: 'left' }}>
            {ALL_ACTIVITIES.map(([n, label]) => (
              <div key={n} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#1A1A1A', borderRadius: 6, padding: '9px 12px',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'rgba(154,221,189,.12)',
                  border: '1px solid rgba(154,221,189,.3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#9ADDBD' }}>{n}</span>
                </div>
                <span style={{ fontSize: 13, color: '#9ADDBD', flex: 1 }}>{label}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#9ADDBD', marginLeft: 'auto' }}>
                  check_circle
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 14, fontStyle: 'italic', color: '#AAAAAA', lineHeight: 1.7, marginBottom: 24 }}>
            "The goal was never to make perfect data stories. The goal was to make honest ones."
          </div>

          <button
            onClick={goHome}
            className="bg-crimson-gradient"
            style={{
              padding: '14px 32px', borderRadius: 8, border: 'none',
              color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', minHeight: 44,
              fontFamily: 'Inter',
            }}
          >
            Back to Home →
          </button>
        </div>
      </div>
    </Layout>
  );
}

/* ─── Activity 08 Root ─────────────────────────────────────────────────────── */
export default function Activity08() {
  injectStyles('activity-08-styles', STYLES);
  const { markComplete } = useApp();
  const [page, setPage] = useState(0);

  function handleComplete() {
    markComplete(8);
    setPage(5);
  }

  return (
    <>
      {page === 0 && (
        <NarrativeIntro
          data={AMARA[8].intro}
          activityNumber={8}
          onStart={() => setPage(1)}
          sidebarDot={8}
          progress={87}
        />
      )}
      {page === 1 && <Page1 onNext={() => setPage(2)} />}
      {page === 2 && <Page2 onNext={() => setPage(3)} />}
      {page === 3 && <Page3 onNext={() => setPage(4)} />}
      {page === 4 && <Page4 onNext={() => handleComplete()} />}
      {page === 5 && (
        <Debrief
          data={AMARA[8].debrief}
          epilogue={AMARA[8].epilogue}
          activityNumber={8}
          onFinish={() => setPage(6)}
          sidebarDot={8}
          progress={100}
        />
      )}
      {page === 6 && <CompletionPage />}
    </>
  );
}
