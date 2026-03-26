import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import ActivityHeader from '../../components/ActivityHeader';
import NavBar from '../../components/NavBar';
import { useApp } from '../../context/AppContext';
import NarrativeIntro from '../../components/NarrativeIntro';
import Debrief from '../../components/Debrief';
import { AMARA } from '../../data/amara';

/* ── CONSTANTS ─────────────────────────────────────────────────── */
const INSIGHTS = [
  { id:'i1', text:'Western Kenya accounts for 0% of current revenue — zero distributor coverage',       icon:'trending_down'  },
  { id:'i2', text:'Pilot stores in Kisumu show 34% repeat purchase rate after first stocking',          icon:'star'           },
  { id:'i3', text:'Nairobi Central territory grew 18% YoY — strongest performing region',              icon:'trending_up'    },
  { id:'i4', text:'Coast region distributor margin is eroding — risk of losing the contract',           icon:'warning'        },
  { id:'i5', text:'Two regions show opposite growth trajectories in the same product line',             icon:'compare_arrows' },
  { id:'i6', text:'Total addressable Western Kenya market: KES 340M annually — currently zero revenue',icon:'bar_chart'      },
];

const VIZ = [
  { id: 'bar',     label: 'Bar Chart',    icon: 'bar_chart'  },
  { id: 'line',    label: 'Line Chart',   icon: 'show_chart' },
  { id: 'pie',     label: 'Pie Chart',    icon: 'pie_chart'  },
  { id: 'heatmap', label: 'Heatmap',      icon: 'grid_on'    },
  { id: 'stat',    label: 'Stat Callout', icon: 'data_usage' },
];

const AUDIENCES = ['CEO', 'Manager', 'Customer'];

const ANSWER_KEY = {
  'CEO':      { insights: ['i5', 'i6'], viz: 'bar'     },
  'Manager':  { insights: ['i3', 'i4'], viz: 'heatmap' },
  'Customer': { insights: ['i1', 'i2'], viz: 'stat'    },
};

const AUDIENCE_ICONS = {
  'CEO':      'person_celebrate',
  'Manager':  'badge',
  'Customer': 'storefront',
};

const VIZ_LABELS = {
  bar: 'Bar Chart', line: 'Line Chart', pie: 'Pie Chart',
  heatmap: 'Heatmap', stat: 'Stat Callout',
};

const TABLE_DATA = [
  { region:'Nairobi Central', dept:'Cooking Oil', score:74, up:true  },
  { region:'Nairobi Central', dept:'Flour',       score:61, up:false },
  { region:'Coast Region',    dept:'Cooking Oil', score:58, up:false },
  { region:'Coast Region',    dept:'Soap',        score:82, up:true  },
];

const HINTS = {
  'CEO':      'CEOs need strategic market gaps and total revenue opportunity — the "so what" in 10 seconds.',
  'Manager':  'Managers need specific territory performance details and at-risk accounts that require immediate action.',
  'Customer': 'Customers connect with impact and availability — what can they actually find on shelves and why it matters to them.',
};

const TAB_GUIDE = {
  'CEO': {
    role: 'CEO — Chief Executive Officer',
    focus: 'Strategic direction, market opportunity, competitive position, and total revenue potential.',
    tip: 'Think at the highest level. What does this executive need to decide — and what single number or trend would make that decision easy?',
  },
  'Manager': {
    role: 'Regional Sales Manager',
    focus: 'Territory performance, at-risk accounts, field team priorities, and quarterly targets.',
    tip: 'Think operationally. What does this manager need to act on this week — and which data points tell them where to focus their team?',
  },
  'Customer': {
    role: 'Customer — Retail Outlet Owner',
    focus: 'Product availability, what sells, and how stocking Zawadi benefits their shop.',
    tip: 'Think from the shop floor. Strip away all internal metrics — what does this person actually care about as a business owner?',
  },
};

const HEADLINE_OPTIONS = {
  'CEO': [
    { id:'h1a', text:'Western Kenya: a KES 340M market opportunity with zero current Zawadi presence.' },
    { id:'h1b', text:'Kisumu customers are already buying cooking oil — just not from us.' },
    { id:'h1c', text:'Our cooking oil ranked highly in taste tests across surveyed households.' },
  ],
  'Manager': [
    { id:'h2a', text:'Coast distributor margin has dropped 3 points — intervention needed before contract renewal.' },
    { id:'h2b', text:'Overall company revenue grew 18% — strong year for the business.' },
    { id:'h2c', text:'Customers prefer Zawadi flour over competitor brands in blind tests.' },
  ],
  'Customer': [
    { id:'h3a', text:'Zawadi products are now available at your local shop — no more travelling to find them.' },
    { id:'h3b', text:'Our market share in Western Kenya increased by 12 percentage points this quarter.' },
    { id:'h3c', text:'We are investing KES 18M to expand our distribution network into new territories.' },
  ],
};

const CORRECT_HEADLINE = { 'CEO':'h1a', 'Manager':'h2a', 'Customer':'h3a' };

const INSIGHT_FEEDBACK = {
  'CEO': {
    i1:'Consider: is this an operational detail or a strategic signal? What level does a CEO make decisions at?',
    i2:'Think about scale. Does this finding reflect a company-wide pattern — or a single data point?',
    i3:'Ask yourself: does this give the CEO a complete picture, or does it only show part of the story?',
    i4:'Who in the organisation would act on this finding directly? Is that the CEO?',
    i5:'Think about what this reveals across the full portfolio. Is this the kind of pattern a CEO needs to see?',
    i6:'Consider the magnitude. How does this number relate to where the company could go next?',
  },
  'Manager': {
    i1:'Think about whether this is actionable at territory level — or is it a strategic headline?',
    i2:'Ask: would a sales manager use this to direct their team, or is it more about customer experience?',
    i3:'Does this tell the Manager where to focus this quarter? Is the specificity right?',
    i4:'Think about urgency and accountability. Who is responsible for acting on this immediately?',
    i5:'Is this the right level of detail for territory planning, or is it a higher-level signal?',
    i6:'Consider: is this a field-level insight, or is it board-level strategy?',
  },
  'Customer': {
    i1:'Think from the shop floor. Does this finding change what a retail owner stocks or recommends?',
    i2:'Consider: does this reflect what this customer actually experiences day to day?',
    i3:'Would a shopkeeper in Kisumu care about this number? What does it mean for their shop?',
    i4:'Think about whose problem this is. Is a retail owner affected by this directly?',
    i5:'Is this relevant to an individual customer — or is it an internal business signal?',
    i6:'Consider the audience. Would this number mean anything to someone running a small shop?',
  },
};

const VIZ_FEEDBACK = {
  'CEO': {
    bar:    'Think about comparisons. Does a bar chart show the competitive and geographic scope a CEO needs?',
    heatmap:'Consider the complexity. Does a CEO need a matrix view, or a cleaner strategic overview?',
    stat:   'A single number can be powerful — but does one stat give enough context for a strategic decision?',
    line:   'Trends over time are useful — but is the CEO\'s question about change over time, or about scale right now?',
    scatter:'Think about who reads this. Is a correlation chart the right level of analysis for a board presentation?',
    pie:    'Consider what a pie chart communicates. Does proportional breakdown give a CEO the strategic signal they need?',
  },
  'Manager': {
    bar:    'Consider what dimensions matter. Does a bar chart show the cross-territory, cross-product detail a Manager needs?',
    heatmap:'Think about the grid. Can a heatmap show performance across two dimensions simultaneously — and is that what the Manager needs?',
    stat:   'A single metric is clean — but would it give a Sales Manager enough to direct their team across multiple territories?',
    line:   'Time trends matter — but is the Manager\'s primary question about momentum, or about where to focus right now?',
    scatter:'Think about operational use. Would a scatter plot help a Manager brief their regional team on priorities?',
    pie:    'Think about what a pie chart shows. Does proportional share help a Manager take action across territories?',
  },
  'Customer': {
    bar:    'Consider simplicity. A bar chart compares multiple items — is that what a retail customer needs to act on?',
    heatmap:'Think about complexity. Would a heatmap communicate clearly to someone running a local shop?',
    stat:   'A single, clear number can be very powerful for this audience. Does it convey the core message simply enough?',
    line:   'Time trends can be compelling — but is change over time the key message for a retail customer?',
    scatter:'Think about your audience. Would a correlation chart resonate with someone focused on their shop\'s daily needs?',
    pie:    'Consider whether proportional data means anything to a retail owner making a stocking decision.',
  },
};

const VIZ_CORRECT_REASON = {
  'CEO':      'A bar chart lets the CEO compare the Western Kenya opportunity (KES 340M, zero current revenue) against existing regions in a single scan. The side-by-side scale makes the gap impossible to miss — and that is exactly the strategic signal a CEO needs before backing a pilot.',
  'Manager':  'A heatmap shows performance across two dimensions at once — region and product line. The Manager can immediately see which territory/product cell is at risk (Coast Cooking Oil, score 58 and falling) and which is strong (Nairobi Central), directing their team without reading a table.',
  'Customer': 'A stat callout strips everything away except the one number that matters to a retail owner: what is available in their shop. No chart axes, no legend, no internal metrics — just a clear, bold figure that answers the question "what does this mean for me today?"',
};

const PROGRESS = { 0: 0, 1: 0, 2: 12, 3: 60, 4: 100, 5: 100 };

/* ── SCORING ─────────────────────────────────────────────────── */
function calcScore(choices) {
  let total = 0;
  const detail = {};
  AUDIENCES.forEach(a => {
    const u = choices[a] || {};
    const key = ANSWER_KEY[a];
    const insightHits = key.insights.filter(id => (u.insights || []).includes(id)).length;
    const vizHit = u.viz === key.viz ? 1 : 0;
    const headlineHit = u.headline === CORRECT_HEADLINE[a] ? 1 : 0;
    const pts = insightHits + vizHit + headlineHit;
    detail[a] = { pts, insightHits, vizHit, headlineHit };
    total += pts;
  });
  return { total, detail };
}

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
        background: disabled ? '#222222' : 'linear-gradient(135deg, #BD3939 0%, #8D141B 100%)',
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

function MiniDataTable({ compact = false }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {(compact ? ['Reg', 'Category', '%'] : ['Region', 'Product Category', 'Market Share', 'Trend']).map(h => (
            <th
              key={h}
              style={{
                fontSize: '10px', fontWeight: 700, color: '#399BA3',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '8px', paddingRight: '8px', textAlign: 'left',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TABLE_DATA.map((r, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? '#1A1A1A' : '#222' }}>
            <td style={{ fontSize: compact ? '12px' : '14px', fontWeight: 600, color: '#FFF', padding: compact ? '6px 8px 6px 0' : '10px 12px 10px 0' }}>{r.region}</td>
            <td style={{ fontSize: compact ? '12px' : '14px', color: '#AAAAAA', padding: compact ? '6px 8px 6px 0' : '10px 12px 10px 0' }}>{r.dept}</td>
            <td style={{ fontSize: compact ? '12px' : '14px', fontWeight: 700, color: r.up ? '#9ADDBD' : '#BD3939', padding: compact ? '6px 8px 6px 0' : '10px 12px 10px 0' }}>{r.score}%</td>
            {!compact && (
              <td style={{ textAlign: 'center', padding: '10px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: r.up ? '#9ADDBD' : '#BD3939' }}>
                  {r.up ? 'north_east' : 'south_east'}
                </span>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── PAGE 1 — CONCEPT INTRO ───────────────────────────────────── */
function Page1({ onNext }) {
  const [step, setStep] = useState(0);
  const [breathe, setBreathe] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 250);
    const t2 = setTimeout(() => setStep(2), 550);
    const t3 = setTimeout(() => setStep(3), 850);
    const t4 = setTimeout(() => setBreathe(true), 1600);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  const personas = [
    { icon: 'person_celebrate', label: 'CEO' },
    { icon: 'badge', label: 'Manager' },
    { icon: 'storefront', label: 'Customer' },
  ];

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '80px 16px',
      animation: 'slideInPage 400ms cubic-bezier(0.25,0.46,0.45,0.94) both',
    }}>
      <div style={{ width: '100%', maxWidth: '680px' }}>

        {/* Headline */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{
            fontSize: '80px', fontWeight: 900, color: '#BD3939',
            lineHeight: 1, letterSpacing: '-0.04em', userSelect: 'none', marginBottom: '12px',
          }}>
            01
          </div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, margin: 0 }}>
            Audience-Centric Thinking
          </h1>
        </div>

        {/* DATA chip */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', minHeight: '48px' }}>
          <div style={{
            opacity: step >= 1 ? 1 : 0,
            transform: step >= 1 ? 'none' : 'translateY(8px)',
            transition: 'all 0.5s ease',
          }}>
            <div style={{
              padding: '10px 32px', borderRadius: '999px',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#1A1A1A', border: '1px solid rgba(89,65,63,0.25)',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#BD3939' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#BD3939', letterSpacing: '0.12em' }}>DATA</span>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#BD3939' }} />
            </div>
          </div>
        </div>

        {/* Dashed arrows SVG */}
        <div style={{
          opacity: step >= 2 ? 0.45 : 0,
          transition: 'opacity 0.5s ease',
          marginBottom: '-12px',
          pointerEvents: 'none',
        }}>
          <svg width="100%" height="50" viewBox="0 0 600 50" fill="none">
            <line x1="300" y1="0" x2="90"  y2="45" stroke="#BD3939" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="300" y1="0" x2="300" y2="45" stroke="#BD3939" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="300" y1="0" x2="510" y2="45" stroke="#BD3939" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="300" cy="0" r="3.5" fill="#BD3939" />
          </svg>
        </div>

        {/* Persona cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: '12px',
          marginBottom: '48px',
        }}>
          {personas.map((p, i) => (
            <div
              key={p.label}
              style={{
                opacity: step >= 3 ? 1 : 0,
                transform: step >= 3 ? 'none' : 'translateY(14px)',
                transition: `all 0.5s ease ${i * 90}ms`,
              }}
            >
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px', padding: '16px',
                aspectRatio: '1 / 1',
                background: '#1A1A1A', border: '1px solid rgba(89,65,63,0.15)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 'clamp(28px,5vw,40px)', color: '#BD3939', marginBottom: '8px' }}>{p.icon}</span>
                <span style={{ fontSize: 'clamp(12px,2vw,15px)', fontWeight: 500, color: '#FFFFFF', textAlign: 'center' }}>{p.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div style={{ textAlign: 'center', maxWidth: '512px', margin: '0 auto' }}>
          <p style={{
            fontSize: 'clamp(15px,2.5vw,18px)', lineHeight: 1.75,
            color: '#AAAAAA', fontStyle: 'italic', margin: 0,
          }}>
            "The same data can tell three completely different stories. It all depends on who is in the room when you tell it."
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: 'fixed', bottom: '40px', right: '24px' }}>
        <CTABtn onClick={onNext} breathe={breathe}>
          <span>Start Activity</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </CTABtn>
      </div>
    </div>
  );
}

/* ── PAGE 2 — THE DATASET ─────────────────────────────────────── */
function Page2({ onNext }) {
  const [secs, setSecs] = useState(4);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const slots = [
    { icon: 'newspaper',  label: 'CEO Brief'        },
    { icon: 'grid_view',  label: 'Manager Dashboard' },
    { icon: 'storefront', label: 'Customer Update'   },
  ];

  return (
    <div style={{
      minHeight: '100dvh',
      paddingTop: '64px',
      paddingBottom: '112px',
      padding: '64px 16px 112px',
      animation: 'slideInPage 400ms cubic-bezier(0.25,0.46,0.45,0.94) both',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '40px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Data table */}
          <div style={{ width: '100%' }}>
            <div style={{ borderRadius: '12px', padding: '24px', background: '#1A1A1A' }}>
              <div style={{ marginBottom: '24px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: '#399BA3',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  display: 'block', marginBottom: '8px',
                }}>
                  Your Data — Zawadi Consumer Goods Sales Report
                </span>
                <div style={{ height: '2px', width: '40px', background: 'rgba(57,155,163,0.35)' }} />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Region', 'Product Category', 'Market Share', 'Trend'].map(h => (
                        <th key={h} style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontSize: '11px', fontWeight: 700, color: '#399BA3',
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TABLE_DATA.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#1A1A1A' : '#222' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#FFF', fontSize: '14px' }}>{r.region}</td>
                        <td style={{ padding: '12px', color: '#AAAAAA', fontSize: '14px' }}>{r.dept}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#FFF', fontSize: '14px' }}>{r.score}%</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: r.up ? '#9ADDBD' : '#BD3939' }}>
                            {r.up ? 'north_east' : 'south_east'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ marginTop: '24px', fontSize: '12px', color: '#555', fontStyle: 'italic' }}>
                Reference this data for all three audiences throughout the activity.
              </p>
            </div>
          </div>

          {/* Deliverable slots — read-only preview */}
          <div style={{ width: '100%' }}>
            {/* Info note */}
            <div style={{
              background:'rgba(57,155,163,.07)', borderRadius:8, padding:'10px 14px',
              border:'1px solid rgba(57,155,163,.2)', marginBottom:14,
              display:'flex', alignItems:'flex-start', gap:10,
            }}>
              <span className="material-symbols-outlined" style={{fontSize:16,color:'#399BA3',marginTop:2,flexShrink:0}}>info</span>
              <div>
                <div style={{fontSize:11,color:'#399BA3',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:4}}>Just take a look</div>
                <p style={{fontSize:13,color:'#AAAAAA',margin:0,lineHeight:1.6}}>
                  These are the three report types for this scenario — one for each audience. You don't need to do anything here.
                  You will fill each of these in the next step.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {slots.map(s => (
                <div
                  key={s.label}
                  style={{
                    height: '120px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '12px',
                    borderRadius: '12px',
                    border: '2px dashed rgba(189,57,57,0.20)',
                    background: 'transparent',
                    opacity: 0.65,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#444' }}>{s.icon}</span>
                  <span style={{ fontWeight: 600, color: '#AAAAAA', fontSize: '15px' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: 'fixed', bottom: '40px', right: '24px' }}>
        <CTABtn onClick={onNext} disabled={secs > 0}>
          <span>I have reviewed the data{secs > 0 ? ` (${secs})` : ''}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </CTABtn>
      </div>
    </div>
  );
}

/* ── PAGE 3 — THE CHALLENGE ───────────────────────────────────── */
function Page3({ onNext }) {
  const { recordAttempt, recordError } = useApp();
  const [tab, setTab] = useState(0);
  const [refOpen, setRefOpen] = useState(false);
  const [choices, setChoices] = useState({
    'CEO':      { insights: [], viz: null, headline: null },
    'Manager':  { insights: [], viz: null, headline: null },
    'Customer': { insights: [], viz: null, headline: null },
  });

  const aud  = AUDIENCES[tab];
  const cur  = choices[aud];
  const done = a => choices[a].insights.length === 2 && choices[a].viz !== null && choices[a].headline !== null;
  const canGo = done(aud);

  function toggleInsight(id) {
    const cur2 = choices[aud].insights;
    let next;
    if (cur2.includes(id))       next = cur2.filter(x => x !== id);
    else if (cur2.length < 2)    next = [...cur2, id];
    else                         return;
    setChoices(p => ({ ...p, [aud]: { ...p[aud], insights: next } }));
  }

  function pickViz(id) {
    setChoices(p => ({ ...p, [aud]: { ...p[aud], viz: id } }));
  }

  function pickHeadline(id) {
    setChoices(p => ({ ...p, [aud]: { ...p[aud], headline: id } }));
  }

  function handleNext() {
    const key = ANSWER_KEY[aud];
    const insightsMatch = key.insights.length === cur.insights.length &&
      key.insights.every(id => cur.insights.includes(id));
    const vizMatch = cur.viz === key.viz;
    if (insightsMatch && vizMatch) recordAttempt(); else recordError();
    if (tab < 2) setTab(t => t + 1);
    else onNext(choices);
  }

  // Derive inline feedback for currently selected insights
  const insightFeedbackItems = cur.insights.map(id => {
    const fb = INSIGHT_FEEDBACK[aud]?.[id] || '';
    const isCorrect = ANSWER_KEY[aud].insights.includes(id);
    return { id, fb, isCorrect };
  });

  // Derive inline feedback for selected viz
  const vizFeedback = cur.viz ? (VIZ_FEEDBACK[aud]?.[cur.viz] || null) : null;
  const vizIsCorrect = cur.viz === ANSWER_KEY[aud].viz;

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      animation: 'slideInPage 400ms cubic-bezier(0.25,0.46,0.45,0.94) both',
    }}>
      {/* LEFT REFERENCE PANEL — desktop only */}
      <div style={{
        display: 'none',
        flexShrink: 0,
        width: '260px',
        paddingTop: '80px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
        className="ref-panel-desktop"
      >
        <div style={{
          borderRadius: '12px', padding: '20px', margin: '0 16px',
          background: '#1A1A1A', borderLeft: '2px solid rgba(57,155,163,0.4)',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: '#399BA3',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            display: 'block', marginBottom: '12px',
          }}>Reference Data</span>
          <MiniDataTable compact />
        </div>
      </div>

      {/* RIGHT WORKSPACE */}
      <div style={{
        flex: 1,
        padding: '80px 16px 128px',
        overflowY: 'auto',
      }}>

        {/* Amara context + how to */}
        <div style={{
          background: 'rgba(189,57,57,.06)', borderRadius: 10,
          padding: '14px 16px', borderLeft: '3px solid rgba(189,57,57,.4)', marginBottom: 14,
        }}>
          <div style={{ fontSize: 11, color: '#BD3939', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
            Amara's challenge
          </div>
          <p style={{ fontSize: 13, color: '#AAAAAA', margin: '0 0 12px', lineHeight: 1.65 }}>
            With her story structured, Amara now faces the boardroom itself — three people who all need something different from the same data.
            The CEO wants to know if this is a strategic opportunity worth backing. The Sales Manager needs territory-level proof that the gap is real.
            The Head of Distribution needs to understand what the last-mile problem actually looks like.
            One dataset. Three completely different lenses. Amara must tailor her presentation for each — or risk losing at least two of them.
          </p>
          <div style={{ fontSize: 11, color: '#BD3939', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
            How to complete this step
          </div>
          <ol style={{ fontSize: 13, color: '#AAAAAA', lineHeight: 1.75, paddingLeft: 18, margin: 0 }}>
            <li>Select the tab for the audience you are working on (CEO, Manager, or Customer).</li>
            <li>Pick the <strong style={{ color: '#e5e2e1' }}>2 insights</strong> from the list that matter most to that audience.</li>
            <li>Choose the <strong style={{ color: '#e5e2e1' }}>visualisation type</strong> that best presents those insights.</li>
            <li>Select the <strong style={{ color: '#e5e2e1' }}>headline</strong> that fits that audience best.</li>
            <li>Repeat for all three audiences, then submit.</li>
          </ol>
        </div>

        {/* Mobile reference toggle */}
        <button
          onClick={() => setRefOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '20px',
            fontSize: '13px', fontWeight: 700, color: '#399BA3',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>table_chart</span>
          Reference Data
          <span className="material-symbols-outlined" style={{
            fontSize: '18px',
            transform: refOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}>expand_more</span>
        </button>
        {refOpen && (
          <div style={{
            borderRadius: '12px', padding: '20px', marginBottom: '24px',
            background: '#1A1A1A', borderLeft: '2px solid rgba(57,155,163,0.4)',
          }}>
            <MiniDataTable compact />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {AUDIENCES.map((a, i) => (
            <button
              key={a}
              onClick={() => setTab(i)}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '13px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                border: 'none', cursor: 'pointer',
                minHeight: '44px',
                background: tab === i ? '#BD3939' : '#1A1A1A',
                color: tab === i ? '#FFF' : '#555',
                transition: 'all 0.2s ease',
              }}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Completion dots */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {AUDIENCES.map(a => (
            <div
              key={a}
              style={{
                width: done(a) ? '8px' : '6px',
                height: done(a) ? '8px' : '6px',
                borderRadius: '50%',
                background: done(a) ? '#BD3939' : '#222222',
                boxShadow: done(a) ? '0 0 6px rgba(189,57,57,0.5)' : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Per-tab audience guide */}
        {TAB_GUIDE[aud] && (
          <div style={{
            background:'rgba(57,155,163,.06)', borderRadius:8,
            padding:'12px 14px', borderLeft:'2px solid #399BA3', marginBottom:14,
          }}>
            <div style={{fontSize:10,color:'#399BA3',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:6}}>
              {TAB_GUIDE[aud].role}
            </div>
            <div style={{fontSize:13,color:'#e5e2e1',fontWeight:600,marginBottom:4}}>
              Cares about: <span style={{fontWeight:400,color:'#AAAAAA'}}>{TAB_GUIDE[aud].focus}</span>
            </div>
            <div style={{fontSize:12,color:'#a88a87',lineHeight:1.55,fontStyle:'italic'}}>
              {TAB_GUIDE[aud].tip}
            </div>
          </div>
        )}

        {/* ZONE 1 — Insights */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#BD3939',
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>Which Insights Matter?</span>
            <span style={{ fontSize: '11px', color: '#555' }}>Select 2</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {INSIGHTS.map(ins => {
              const sel       = cur.insights.includes(ins.id);
              const isCorrect = ANSWER_KEY[aud].insights.includes(ins.id);
              const correct   = sel && isCorrect;
              const wrong     = sel && !isCorrect;
              const maxd      = !sel && cur.insights.length >= 2;
              return (
                <button
                  key={ins.id}
                  disabled={maxd}
                  onClick={() => toggleInsight(ins.id)}
                  aria-pressed={sel}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '16px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    background: correct ? 'rgba(154,221,189,0.12)' : sel ? '#BD3939' : '#1A1A1A',
                    border: correct ? '2px solid rgba(154,221,189,0.6)' : sel ? '1px solid rgba(189,57,57,0.6)' : '1px solid rgba(89,65,63,0.15)',
                    opacity: maxd ? 0.4 : 1,
                    cursor: maxd ? 'not-allowed' : 'pointer',
                    boxShadow: correct ? '0 4px 16px rgba(154,221,189,0.15)' : sel ? '0 4px 16px rgba(189,57,57,0.2)' : 'none',
                    minHeight: '44px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: correct ? '#9ADDBD' : sel ? 'rgba(255,255,255,0.75)' : '#BD3939', flexShrink: 0, marginTop: '2px' }}>
                    {correct ? 'check_circle' : ins.icon}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: sel ? 600 : 400, color: correct ? '#9ADDBD' : '#FFF', lineHeight: 1.45 }}>
                    {ins.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Inline insight feedback */}
          {insightFeedbackItems.length > 0 && (() => {
            const allCorrect = insightFeedbackItems.length === 2 && insightFeedbackItems.every(x => x.isCorrect);
            if (allCorrect) return (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginTop: 12, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(154,221,189,0.08)', border: '1px solid rgba(154,221,189,0.3)',
              }}>
                <span className="material-symbols-outlined icon-filled" style={{ fontSize: 18, color: '#9ADDBD', flexShrink: 0 }}>check_circle</span>
                <span style={{ fontSize: 13, color: '#9ADDBD', lineHeight: 1.5 }}>
                  Both insights are the right fit for the <strong>{aud}</strong> — these are exactly what this audience needs to hear.
                </span>
              </div>
            );
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                {insightFeedbackItems.filter(x => !x.isCorrect).map(({ id, fb }) => (
                  <div key={id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(168,138,135,0.07)', border: '1px solid rgba(168,138,135,0.2)',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#a88a87', flexShrink: 0, marginTop: '1px' }}>info</span>
                    <span style={{ fontSize: '12px', color: '#a88a87', lineHeight: 1.5 }}>{fb}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ZONE 2 — Viz Picker */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#BD3939',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: '16px', display: 'block',
          }}>
            Choose Your Visualisation
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {VIZ.map(v => {
              const sel     = cur.viz === v.id;
              const correct = sel && v.id === ANSWER_KEY[aud].viz;
              return (
                <button
                  key={v.id}
                  onClick={() => pickViz(v.id)}
                  aria-pressed={sel}
                  style={{
                    width: '82px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    padding: '16px 8px',
                    borderRadius: '12px',
                    border: correct ? '2px solid rgba(154,221,189,0.6)' : sel ? '2px solid rgba(189,57,57,0.65)' : '1px solid rgba(89,65,63,0.15)',
                    background: correct ? 'rgba(154,221,189,0.1)' : sel ? 'rgba(189,57,57,0.1)' : '#1A1A1A',
                    cursor: 'pointer',
                    minHeight: '44px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: correct ? '#9ADDBD' : sel ? '#BD3939' : '#666' }}>{correct ? 'check_circle' : v.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, textAlign: 'center', lineHeight: 1.3, color: correct ? '#9ADDBD' : sel ? '#BD3939' : '#555' }}>{v.label}</span>
                </button>
              );
            })}
          </div>

          {/* Inline viz feedback */}
          {cur.viz && (
            vizIsCorrect ? (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                marginTop: 12, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(154,221,189,0.08)', border: '1px solid rgba(154,221,189,0.3)',
              }}>
                <span className="material-symbols-outlined icon-filled" style={{ fontSize: 18, color: '#9ADDBD', flexShrink: 0, marginTop: 1 }}>check_circle</span>
                <span style={{ fontSize: 13, color: '#9ADDBD', lineHeight: 1.55 }}>
                  <strong>Right choice.</strong> {VIZ_CORRECT_REASON[aud]}
                </span>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                marginTop: '12px', padding: '8px 12px', borderRadius: '8px',
                background: 'rgba(168,138,135,0.07)', border: '1px solid rgba(168,138,135,0.2)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#a88a87', flexShrink: 0, marginTop: '1px' }}>info</span>
                <span style={{ fontSize: '12px', color: '#a88a87', lineHeight: 1.5 }}>{vizFeedback}</span>
              </div>
            )
          )}
        </div>

        {/* ZONE 3 — Headline Selection */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#BD3939',
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>Choose Your Headline</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {HEADLINE_OPTIONS[aud].map(opt => {
              const sel     = cur.headline === opt.id;
              const correct = sel && opt.id === CORRECT_HEADLINE[aud];
              return (
                <button
                  key={opt.id}
                  onClick={() => pickHeadline(opt.id)}
                  aria-pressed={sel}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    background: correct ? 'rgba(154,221,189,0.08)' : sel ? 'rgba(189,57,57,0.08)' : '#1A1A1A',
                    border: correct ? '2px solid rgba(154,221,189,0.6)' : sel ? '2px solid rgba(189,57,57,0.65)' : '1px solid rgba(89,65,63,0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    minHeight: '44px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{
                    fontSize: '18px',
                    color: correct ? '#9ADDBD' : sel ? '#BD3939' : '#555',
                    flexShrink: 0, marginTop: '2px',
                  }}>
                    {correct ? 'check_circle' : sel ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: sel ? 600 : 400, color: correct ? '#9ADDBD' : sel ? '#FFFFFF' : '#AAAAAA', lineHeight: 1.5 }}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
          {cur.headline === CORRECT_HEADLINE[aud] && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(154,221,189,0.08)', border: '1px solid rgba(154,221,189,0.3)',
            }}>
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: 18, color: '#9ADDBD', flexShrink: 0 }}>check_circle</span>
              <span style={{ fontSize: 13, color: '#9ADDBD', lineHeight: 1.5 }}>
                That's the headline the <strong>{aud}</strong> needs — it speaks directly to their priority, not the organisation's.
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CTABtn onClick={handleNext} disabled={!canGo}>
            <span>{tab < 2 ? 'Next Audience' : 'See Results'}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </CTABtn>
        </div>
      </div>
    </div>
  );
}

/* ── PAGE 4 — FEEDBACK & RESULTS ─────────────────────────────── */
function Page4({ choices, onRetry, onNext }) {
  const { goHome, markComplete } = useApp();
  const [open, setOpen] = useState(null);
  const { total, detail } = calcScore(choices);

  useEffect(() => {
    markComplete(3);
  }, []);

  const R    = 88;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC - (total / 12) * CIRC;

  return (
    <div style={{
      minHeight: '100dvh',
      paddingBottom: '128px',
      animation: 'slideInPage 400ms cubic-bezier(0.25,0.46,0.45,0.94) both',
    }}>

      {/* Header */}
      <div style={{ padding: '40px 16px 32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFF', letterSpacing: '-0.02em', margin: 0 }}>
          Activity Results
        </h1>
      </div>

      <div style={{ padding: '0 16px', maxWidth: '720px' }}>

        {/* Score ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '56px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '192px', height: '192px' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="96" cy="96" r={R} fill="transparent" stroke="#222222" strokeWidth="8" />
              <circle
                cx="96" cy="96" r={R} fill="transparent"
                stroke="#BD3939" strokeWidth="8"
                strokeDasharray={CIRC} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out', animation: 'ringFill 1.5s ease-out' }}
              />
            </svg>
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '54px', fontWeight: 700, color: '#FFF', lineHeight: 1, letterSpacing: '-0.04em' }}>
                {total}<span style={{ fontSize: '28px', color: '#555' }}>/12</span>
              </div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#AAAAAA', marginTop: '6px', fontWeight: 600 }}>
                Correct Choices
              </div>
            </div>
          </div>
        </div>

        {/* Result cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          {AUDIENCES.map(a => {
            const d       = detail[a];
            const isOpen  = open === a;
            const perfect = d.pts === 4;
            const ui      = choices[a] || {};
            const userIns = ui.insights || [];
            const correctIns = ANSWER_KEY[a].insights;
            const vizOk   = ui.viz === ANSWER_KEY[a].viz;
            const headlineOk = ui.headline === CORRECT_HEADLINE[a];
            const userHeadlineObj = HEADLINE_OPTIONS[a].find(h => h.id === ui.headline);
            const correctHeadlineObj = HEADLINE_OPTIONS[a].find(h => h.id === CORRECT_HEADLINE[a]);

            return (
              <div
                key={a}
                style={{
                  background: '#1A1A1A',
                  border: isOpen ? '1px solid rgba(189,57,57,0.3)' : '1px solid #222222',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Card header */}
                <button
                  onClick={() => setOpen(isOpen ? null : a)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#222222', flexShrink: 0,
                    }}>
                      <span className="material-symbols-outlined" style={{ color: '#BD3939' }}>{AUDIENCE_ICONS[a]}</span>
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFF' }}>{a}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '999px',
                      fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: perfect ? 'rgba(125,213,213,0.15)' : 'rgba(189,57,57,0.15)',
                      color: perfect ? '#7DD5D5' : '#BD3939',
                      border: perfect ? '1px solid rgba(125,213,213,0.3)' : '1px solid rgba(189,57,57,0.3)',
                    }}>
                      {d.pts}/4{perfect ? ' · Perfect' : ''}
                    </span>
                    <span className="material-symbols-outlined" style={{
                      color: '#555',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}>expand_more</span>
                  </div>
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div style={{
                    padding: '0 20px 24px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '24px',
                    animation: 'scaleIn 0.3s ease-out forwards',
                  }}>
                    {/* Your selections */}
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#AAAAAA', fontWeight: 700, marginBottom: '12px' }}>
                        Your Selections
                      </div>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {INSIGHTS.map(ins => {
                          if (!userIns.includes(ins.id)) return null;
                          const ok = correctIns.includes(ins.id);
                          return (
                            <li key={ins.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#AAAAAA', opacity: ok ? 1 : 0.6 }}>
                              <span className="material-symbols-outlined icon-filled" style={{ fontSize: '18px', color: ok ? '#7DD5D5' : '#BD3939', flexShrink: 0, marginTop: '2px' }}>
                                {ok ? 'check_circle' : 'cancel'}
                              </span>
                              {ins.text}
                            </li>
                          );
                        })}

                        {/* Missed correct insights */}
                        {correctIns.filter(id => !userIns.includes(id)).map(id => {
                          const ins = INSIGHTS.find(i => i.id === id);
                          return (
                            <li key={id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#555' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#444', flexShrink: 0, marginTop: '2px' }}>
                                radio_button_unchecked
                              </span>
                              {ins?.text}
                              <span style={{ color: '#444', fontStyle: 'italic', fontSize: '12px' }}>missed</span>
                            </li>
                          );
                        })}

                        {/* Viz row */}
                        <li style={{
                          display: 'flex', alignItems: 'flex-start', gap: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '14px', color: '#AAAAAA',
                        }}>
                          <span className="material-symbols-outlined icon-filled" style={{ fontSize: '18px', color: vizOk ? '#7DD5D5' : '#BD3939', flexShrink: 0, marginTop: '2px' }}>
                            {vizOk ? 'check_circle' : 'cancel'}
                          </span>
                          Viz: {VIZ_LABELS[ui.viz] || 'Not selected'}
                        </li>

                        {/* Headline row */}
                        <li style={{
                          display: 'flex', alignItems: 'flex-start', gap: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '14px', color: '#AAAAAA',
                        }}>
                          <span className="material-symbols-outlined icon-filled" style={{ fontSize: '18px', color: headlineOk ? '#7DD5D5' : '#BD3939', flexShrink: 0, marginTop: '2px' }}>
                            {headlineOk ? 'check_circle' : 'cancel'}
                          </span>
                          <div>
                            <div style={{ marginBottom: headlineOk ? 0 : 4 }}>
                              Headline: {userHeadlineObj ? `"${userHeadlineObj.text}"` : 'Not selected'}
                            </div>
                            {!headlineOk && correctHeadlineObj && (
                              <div style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>
                                Best: "{correctHeadlineObj.text}"
                              </div>
                            )}
                          </div>
                        </li>
                      </ul>
                    </div>

                    {/* Hint / Recommended */}
                    <div>
                      <div style={{
                        fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em',
                        color: d.pts < 4 ? '#BD3939' : '#AAAAAA',
                        fontWeight: 700, marginBottom: '12px',
                      }}>
                        {d.pts < 4 ? 'Insight Hint' : 'Well Done'}
                      </div>
                      <div style={{
                        padding: '16px', borderRadius: '8px', marginBottom: '12px',
                        background: d.pts < 4 ? 'rgba(189,57,57,0.05)' : '#0D0D0D',
                        border: d.pts < 4 ? '1px solid rgba(189,57,57,0.2)' : '1px solid rgba(89,65,63,0.1)',
                      }}>
                        <p style={{ fontSize: '14px', color: '#FFFFFF', fontStyle: 'italic', lineHeight: 1.65, margin: 0 }}>
                          {HINTS[a]}
                        </p>
                      </div>
                      <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444' }}>Best viz: </span>
                        {VIZ_LABELS[ANSWER_KEY[a].viz]}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key takeaway */}
        <div style={{
          borderRadius: '12px', padding: '32px',
          position: 'relative', overflow: 'hidden',
          background: '#0F5560', marginBottom: '24px',
        }}>
          <div style={{
            position: 'absolute', right: '-40px', top: '-40px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', filter: 'blur(40px)',
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative', zIndex: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#7DD5D5', flexShrink: 0 }}>lightbulb</span>
            <div>
              <h4 style={{ fontWeight: 700, color: '#FFF', fontSize: '17px', marginBottom: '8px', marginTop: 0 }}>
                The Key Takeaway
              </h4>
              <p style={{ color: '#9AF1F2', lineHeight: 1.7, fontSize: '16px', margin: 0 }}>
                The same data becomes three different stories when you design for your audience.
                Audience shapes everything — from the headline to the chart type.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 16px 24px',
        display: 'flex', gap: '12px',
        background: 'rgba(17,17,17,0.97)',
        boxShadow: '0 -4px 24px rgba(189,57,57,0.07)',
      }}>
        <GhostBtn onClick={onRetry}>
          <span className="material-symbols-outlined">refresh</span>
          Try Again
        </GhostBtn>
        <button
          onClick={onNext}
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            padding: '14px 28px',
            borderRadius: '12px',
            fontWeight: 700, fontSize: '15px',
            border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #BD3939 0%, #8D141B 100%)',
            color: '#FFFFFF',
            minHeight: '44px',
          }}
        >
          <span>Next Concept</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </nav>
    </div>
  );
}

/* ── COMPLETION ──────────────────────────────────────────────── */
function Completion({ onRetry }) {
  const { goHome, markComplete } = useApp();
  useEffect(() => { markComplete(3); }, []);
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
          You've tailored a single dataset into three distinct views for a CEO, a Manager, and a Customer — matching insights, charts, and language to what each audience actually needs.
        </p>
        <div style={{
          borderRadius: 12, padding: 24, marginBottom: 20,
          background: '#1A1A1A', border: '1px solid rgba(89,65,63,0.15)',
        }}>
          <p style={{ fontSize: 15, color: '#9AF1F2', fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
            "The data never changed. The framing did. And that is the skill."
          </p>
        </div>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 24, fontStyle: 'italic' }}>
          Next, Amara emails her executive summary — and receives a reply that changes everything: "I don't understand half of this."
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

/* ── MAIN COMPONENT ──────────────────────────────────────────── */
export default function Activity01() {
  const { goHome } = useApp();
  const [page, setPage] = useState(0);
  const [finalChoices, setFinalChoices] = useState(null);

  function finish(c) { setFinalChoices(c); setPage(4); }
  function retry()   { setPage(1); setFinalChoices(null); }

  const progress = PROGRESS[page] ?? 0;

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
        @keyframes ringFill {
          from { stroke-dashoffset: 553; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.15); }
        }
        @media (min-width: 768px) {
          .ref-panel-desktop { display: block !important; }
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
          data={AMARA[3].intro}
          activityNumber={3}
          onStart={() => setPage(1)}
          sidebarDot={3}
          progress={0}
        />
      )}
      {page === 1 && <Page1 onNext={() => setPage(2)} />}
      {page === 2 && <Page2 onNext={() => setPage(3)} />}
      {page === 3 && <Page3 onNext={finish} />}
      {page === 4 && <Page4 choices={finalChoices || {}} onRetry={retry} onNext={() => setPage(5)} />}
      {page === 5 && (
        <Debrief
          data={AMARA[3].debrief}
          activityNumber={3}
          onFinish={() => setPage(6)}
          sidebarDot={3}
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
