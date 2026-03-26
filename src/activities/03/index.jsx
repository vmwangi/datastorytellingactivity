import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import ActivityHeader from '../../components/ActivityHeader';
import NavBar from '../../components/NavBar';
import TealCard from '../../components/TealCard';
import { useApp } from '../../context/AppContext';
import NarrativeIntro from '../../components/NarrativeIntro';
import Debrief from '../../components/Debrief';
import { AMARA } from '../../data/amara';

/* ── CONSTANTS ─────────────────────────────────────────────── */
const CONTEXT_CARDS = [
  { id: 1, text: 'Western Kenya has 2.3 million households — most buying household goods from informal kiosks, not registered retailers.' },
  { id: 2, text: 'Zawadi products are absent from 94% of kiosk-dominated zones in the target counties.' },
  { id: 3, text: 'Competing brands with early distributor presence in Kisumu achieved 68% household recognition within 18 months.' },
  { id: 4, text: 'This is the third consecutive year Zawadi has deprioritised Western Kenya due to "low distributor capacity".' },
  { id: 5, text: 'A field agent visited 12 kiosks in Siaya last quarter — every one of them requested Zawadi cooking oil by name.' },
];

const INIT_CHIPS = [
  { id: 'alarming',   label: 'Alarming',   color: '#BD3939', bg: 'rgba(189,57,57,0.15)' },
  { id: 'concerning', label: 'Concerning', color: '#888',    bg: 'rgba(89,65,63,0.12)'  },
  { id: 'unclear',    label: 'Unclear',    color: '#888',    bg: 'rgba(89,65,63,0.12)'  },
];

const RE_CHIPS = [
  { id: 'alarming',    label: 'Still Alarming',            color: '#BD3939', bg: 'rgba(189,57,57,0.12)'  },
  { id: 'explainable', label: 'Now Explainable',           color: '#399BA3', bg: 'rgba(57,155,163,0.12)' },
  { id: 'changes',     label: 'Context Changes Everything', color: '#9ADDBD', bg: 'rgba(154,221,189,0.12)' },
];

const REACTION_COLOR = {
  alarming: '#BD3939', concerning: '#888', unclear: '#666',
  explainable: '#399BA3', changes: '#9ADDBD',
};
const REACTION_LABEL = {
  alarming: 'Alarming', concerning: 'Concerning', unclear: 'Unclear',
  explainable: 'Explainable', changes: 'Context Changes Everything',
};

/* ── PROGRESS ───────────────────────────────────────────────── */
const PROGRESS = { 0: 25, 1: 25, 2: 55, 3: 100, 4: 100 };

/* ── AMARA SVG ILLUSTRATION ─────────────────────────────────── */
function AmaraCard() {
  return (
    <div
      style={{
        width: 160, borderRadius: 12, overflow: 'hidden',
        border: '1px solid rgba(89,65,63,0.2)', margin: '0 auto',
        animation: 'popIn .3s ease-out forwards',
      }}
    >
      <svg width="160" height="190" viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="a3bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#130D0B" />
            <stop offset="100%" stopColor="#1C1410" />
          </linearGradient>
        </defs>
        <rect width="160" height="190" fill="url(#a3bg)" />
        {/* Desk surface */}
        <rect x="20" y="130" width="120" height="50" rx="4" fill="#1A1209" />
        {/* Laptop screen */}
        <rect x="42" y="80" width="76" height="52" rx="3" fill="#0D1A1F" stroke="#399BA3" strokeWidth="1" />
        {/* Chart bars on screen */}
        <rect x="52" y="110" width="8" height="16" fill="#BD3939" opacity="0.8" />
        <rect x="64" y="102" width="8" height="24" fill="#BD3939" opacity="0.9" />
        <rect x="76" y="94" width="8" height="32" fill="#9ADDBD" opacity="0.8" />
        <rect x="88" y="105" width="8" height="21" fill="#BD3939" opacity="0.7" />
        <rect x="100" y="98" width="8" height="28" fill="#9ADDBD" opacity="0.6" />
        {/* Screen glow */}
        <ellipse cx="80" cy="106" rx="36" ry="26" fill="#399BA3" opacity="0.04" />
        {/* Laptop base */}
        <rect x="38" y="132" width="84" height="5" rx="2" fill="#2A1F10" />
        {/* Person - body */}
        <ellipse cx="80" cy="70" rx="12" ry="15" fill="#8B4513" />
        {/* Head */}
        <circle cx="80" cy="52" r="11" fill="#6B3010" />
        {/* Hair */}
        <ellipse cx="80" cy="45" rx="12" ry="6" fill="#2A1500" />
        {/* Coffee cup on desk */}
        <rect x="118" y="122" width="10" height="12" rx="2" fill="#3A2510" stroke="#555" strokeWidth="0.5" />
        <line x1="128" y1="126" x2="132" y2="124" stroke="#555" strokeWidth="1" />
      </svg>
      <div style={{ background: '#1A1A1A', padding: 8, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 500 }}>
          Amara, preparing for the board presentation.
        </span>
      </div>
    </div>
  );
}

/* ── PAGE 1 — CONCEPT INTRO ──────────────────────────────────── */
function Page1({ onNext }) {
  const [step, setStep] = useState(0);
  const [breathe, setBreathe] = useState(false);

  useEffect(() => {
    const ts = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 2500),
      setTimeout(() => setStep(3), 3800),
      setTimeout(() => setStep(4), 5000),
      setTimeout(() => setStep(5), 6200),
      setTimeout(() => setBreathe(true), 7000),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const show = (s) => ({
    opacity: step >= s ? 1 : 0,
    transform: step >= s ? 'none' : 'translateY(10px)',
    transition: 'all 0.6s ease',
  });

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '80px 16px',
      textAlign: 'center', animation: 'fadeInUp .45s ease-out forwards' }}>
      <div style={{ width: '100%', maxWidth: 600 }}>

        {/* Activity label */}
        <div style={{ marginBottom: 40 }}>
          <ActivityHeader number={3} title="Data Context" />
        </div>

        {/* 40.3% */}
        <div style={{ ...show(1), minHeight: 120, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 'clamp(56px,12vw,96px)', fontWeight: 900, color: '#e5e2e1',
            letterSpacing: '-0.04em', lineHeight: 1 }}>
            40.3%
          </div>
          {/* Question */}
          <div style={{ ...show(2), fontSize: 'clamp(22px,5vw,38px)', fontWeight: 700,
            color: '#BD3939', marginTop: 8 }}>
            What does this mean?
          </div>
        </div>

        {/* Explainer */}
        <div style={{ ...show(3), marginTop: 24 }}>
          <p style={{ fontSize: 'clamp(14px,2.2vw,17px)', color: '#AAAAAA',
            lineHeight: 1.75, maxWidth: 480, margin: '0 auto' }}>
            Without context, a number is just a number. With the right context, the same number
            becomes a story that changes how people think and act.
          </p>
        </div>

        {/* Amara card */}
        <div style={{ ...show(4), marginTop: 28 }}>
          <AmaraCard />
        </div>

        {/* Tagline */}
        <div style={{ ...show(5), marginTop: 24 }}>
          <p style={{ fontSize: 'clamp(16px,2.8vw,20px)', fontStyle: 'italic',
            color: '#e5e2e1', fontWeight: 600 }}>
            Context is not decoration. It is the story itself.
          </p>
        </div>
      </div>

      <NavBar
        onNext={onNext}
        nextLabel="Meet the Data"
        nextIcon="arrow_forward"
      />
    </div>
  );
}

/* ── PAGE 2 — STACKING INTERACTION ──────────────────────────── */
function Page2({ onNext }) {
  const [initChip, setInitChip]   = useState(null);
  const [flipped,  setFlipped]    = useState(0);
  const [reactions, setReactions] = useState([]);
  const [pendingReact, setPending] = useState(false);
  const [flipping, setFlipping]   = useState(false);

  const canFlip = initChip && !pendingReact && flipped < 5;
  const allDone = flipped === 5 && reactions.length === 5;

  function handleFlip() {
    if (!canFlip) return;
    setFlipping(true);
    setTimeout(() => { setFlipped(f => f + 1); setPending(true); setFlipping(false); }, 300);
  }

  function handleReaction(rid) {
    if (!pendingReact) return;
    setReactions(r => [...r, rid]);
    setPending(false);
  }

  function handleNext() {
    onNext({ initChip, reactions });
  }

  const timelineDots = Array(5).fill(null).map((_, i) => reactions[i] || null);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      paddingBottom: 96, paddingTop: '4.5rem',
      animation: 'fadeInUp .45s ease-out forwards' }}>
      <div style={{ padding: '0 16px', maxWidth: 900, width: '100%', margin: '0 auto' }}>

        {/* Amara intro prompt */}
        <div style={{ background: 'rgba(57,155,163,0.07)', border: '1px solid rgba(57,155,163,0.25)',
          borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: '#7DD5D5', fontStyle: 'italic', lineHeight: 1.65, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>You are Amara.</span> You have just run the household survey for Western Kenya and produced a striking number. Now you are going to watch what that number means — and what it needs to mean — before you can take it into the boardroom.
          </p>
        </div>

        {/* How this works */}
        <div style={{
          background: '#1C1B1B', borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          border: '1px solid #2A2A2A',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#a88a87' }}>info</span>
            <span style={{ fontSize: 10, color: '#a88a87', letterSpacing: '.07em', textTransform: 'uppercase', fontWeight: 600 }}>
              How this works
            </span>
          </div>
          <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Read the statistic below and select your first reaction.',
              'Press "Flip card" to reveal one piece of context at a time.',
              'After each new piece of context, tell us how your reading of the number has changed.',
              'Work through all 5 context cards, then continue to see the full picture.',
            ].map((step, i) => (
              <li key={i} style={{ fontSize: 13, color: '#AAAAAA', lineHeight: 1.55 }}>{step}</li>
            ))}
          </ol>
        </div>

        <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>

          {/* CENTRE: Base card + chips + revealed cards */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Base statistic card */}
            <div style={{ background: '#1C1B1B', border: '1px solid rgba(189,57,57,0.4)',
              borderRadius: 12, padding: '24px' }}>
              <p style={{ fontSize: 'clamp(16px,3vw,24px)', fontWeight: 700, color: '#e5e2e1',
                lineHeight: 1.4, marginBottom: 16, margin: '0 0 16px 0' }}>
                40.3% of Western Kenya households buy cooking oil from informal kiosks — not from retailers stocking Zawadi.
              </p>
              <p style={{ fontSize: 12, color: '#555', letterSpacing: '0.08em',
                textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>
                What does this tell you right now?
              </p>

              {/* Initial chips */}
              {!initChip && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
                  {INIT_CHIPS.map(c => (
                    <button key={c.id} onClick={() => setInitChip(c.id)}
                      style={{
                        background: c.bg, color: c.color,
                        border: `1px solid ${c.color}55`,
                        minHeight: 44, padding: '10px 20px',
                        borderRadius: 999, fontWeight: 700, fontSize: 14,
                        cursor: 'pointer', transition: 'all .2s',
                        fontFamily: 'Inter',
                      }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Initial chip display */}
              {initChip && (
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%',
                    background: REACTION_COLOR[initChip] }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: REACTION_COLOR[initChip] }}>
                    Initial read: {REACTION_LABEL[initChip]}
                  </span>
                </div>
              )}
            </div>

            {/* Revealed context cards */}
            {CONTEXT_CARDS.slice(0, flipped).map((c, i) => (
              <div key={c.id}
                style={{ background: '#1C1B1B', border: '1px solid rgba(57,155,163,0.3)',
                  borderRadius: 12, padding: '16px 20px',
                  animation: 'scaleIn .35s ease forwards' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                    background: 'rgba(57,155,163,0.15)', border: '1px solid rgba(57,155,163,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#399BA3' }}>{c.id}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#e5e2e1', lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                </div>
                {reactions[i] && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center',
                    gap: 8, paddingLeft: 32 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%',
                      background: REACTION_COLOR[reactions[i]] }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: REACTION_COLOR[reactions[i]],
                      textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      {REACTION_LABEL[reactions[i]]}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Re-interpret chips */}
            {pendingReact && (
              <div style={{ background: '#1C1B1B', border: '1px solid rgba(89,65,63,0.2)',
                borderRadius: 12, padding: 16, animation: 'popIn .3s ease-out forwards' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
                  letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, margin: '0 0 6px 0' }}>
                  Re-interpret — how do you read the data now?
                </p>
                <p style={{ fontSize: 12, color: '#555', lineHeight: 1.55, marginBottom: 12, margin: '0 0 12px 0' }}>
                  Does this new context change how serious or understandable the 40.3% feels?
                </p>
                {/* Chip definitions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  {[
                    { color: '#BD3939', label: 'Still Alarming', desc: 'The context makes the problem feel even more urgent or concerning.' },
                    { color: '#399BA3', label: 'Now Explainable', desc: 'The context gives a reason for the number — it makes more sense now.' },
                    { color: '#9ADDBD', label: 'Context Changes Everything', desc: 'This new information completely shifts how you would act on the finding.' },
                  ].map(({ color, label, desc }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color,
                        flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontSize: 12, color: '#AAAAAA', lineHeight: 1.5 }}>
                        <strong style={{ color: color, fontWeight: 600 }}>{label}</strong> — {desc}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {RE_CHIPS.map(c => (
                    <button key={c.id} onClick={() => handleReaction(c.id)}
                      style={{
                        background: c.bg, color: c.color,
                        border: `1px solid ${c.color}55`,
                        minHeight: 44, padding: '10px 20px',
                        borderRadius: 999, fontWeight: 700, fontSize: 14,
                        cursor: 'pointer', transition: 'all .2s',
                        fontFamily: 'Inter',
                      }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card deck + flip button — stacked below on mobile */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center',
            gap: 16, flexWrap: 'wrap' }}>

            {/* Stacked deck visual */}
            <div
              role="button"
              tabIndex={0}
              onClick={handleFlip}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleFlip()}
              style={{ position: 'relative', width: 130, height: 100,
                cursor: canFlip ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
              {/* Stack shadows */}
              {[4, 3, 2, 1].map(offset => (
                <div key={offset} style={{
                  position: 'absolute',
                  width: 130, height: 80,
                  background: '#1C1B1B',
                  border: '1px solid rgba(89,65,63,0.15)',
                  borderRadius: 12,
                  top: offset * 3, left: offset * 2,
                  opacity: flipped + offset >= 5 ? 0 : Math.max(0, 1 - (offset * 0.15)),
                  transition: 'opacity .3s ease',
                }} />
              ))}
              {/* Top card */}
              {flipped < 5 ? (
                <div style={{
                  position: 'absolute', width: 130, height: 80, top: 0, left: 0, zIndex: 10,
                  background: canFlip ? '#2A1A1A' : '#1C1B1B',
                  border: `1px solid ${canFlip ? 'rgba(189,57,57,0.5)' : 'rgba(89,65,63,0.2)'}`,
                  borderRadius: 12,
                  boxShadow: canFlip ? '0 0 16px rgba(189,57,57,0.15)' : 'none',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  animation: flipping ? 'popIn .3s ease-out' : 'none',
                }}>
                  <span style={{ fontSize: 36, fontWeight: 900,
                    color: canFlip ? '#BD3939' : '#444', lineHeight: 1 }}>?</span>
                  <span style={{ fontSize: 9, fontWeight: 700,
                    color: canFlip ? '#BD3939' : '#555',
                    letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                    {5 - flipped} left
                  </span>
                </div>
              ) : (
                <div style={{
                  position: 'absolute', width: 130, height: 80, top: 0, left: 0,
                  background: 'rgba(154,221,189,0.08)', border: '1px solid rgba(154,221,189,0.3)',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ color: '#9ADDBD', fontSize: 28 }}>check_circle</span>
                </div>
              )}
            </div>

            {/* Flip controls */}
            <div style={{ textAlign: 'left' }}>
              {flipped < 5 ? (
                <>
                  <p style={{ fontSize: 12, color: canFlip ? '#e5e2e1' : '#555', fontWeight: 600,
                    marginBottom: 4, margin: '0 0 4px 0' }}>
                    {canFlip ? 'Flip to add context' : 'Select your reaction first'}
                  </p>
                  <p style={{ fontSize: 11, color: '#555', lineHeight: 1.5, marginBottom: 8, margin: '0 0 8px 0' }}>
                    {canFlip
                      ? 'Each flip reveals one new piece of context about the 40.3% figure.'
                      : 'Choose how the latest context changed your reading, then flip again.'}
                  </p>
                  <button onClick={handleFlip} disabled={!canFlip}
                    style={{
                      background: canFlip ? 'rgba(189,57,57,0.15)' : 'rgba(42,42,42,0.5)',
                      color: canFlip ? '#BD3939' : '#444',
                      border: canFlip ? '1px solid rgba(189,57,57,0.35)' : '1px solid rgba(89,65,63,0.1)',
                      cursor: canFlip ? 'pointer' : 'not-allowed',
                      minHeight: 44, padding: '10px 16px',
                      borderRadius: 12, fontSize: 14, fontWeight: 700,
                      fontFamily: 'Inter',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>flip</span>
                    Flip card
                  </button>
                </>
              ) : (
                <p style={{ fontSize: 11, color: '#9ADDBD', fontWeight: 600, margin: 0 }}>
                  All cards revealed!
                </p>
              )}
            </div>

            {/* Mobile timeline dots */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {timelineDots.map((r, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: r ? REACTION_COLOR[r] : '#222222',
                  transition: 'background .3s',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <NavBar
        onNext={handleNext}
        nextLabel="See the Full Picture"
        nextIcon="arrow_forward"
        nextDisabled={!allDone}
      />
    </div>
  );
}

/* ── PAGE 3 — FINAL REVEAL ───────────────────────────────────── */
function Page3({ journey, onRetry, onFinish }) {
  const { goHome, markComplete } = useApp();
  const { initChip = 'alarming', reactions = [] } = journey || {};
  const allReactions = [initChip, ...reactions];

  useEffect(() => {
    markComplete(1);
  }, []);

  const changes = allReactions.reduce((acc, r, i) => {
    if (i === 0) return 0;
    const prev = allReactions[i - 1];
    const norm  = r === 'concerning' ? 'alarming' : r;
    const pnorm = prev === 'concerning' ? 'alarming' : prev;
    return acc + (norm !== pnorm ? 1 : 0);
  }, 0);

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 96, paddingTop: '5rem',
      animation: 'fadeInUp .45s ease-out forwards' }}>
      <div style={{ padding: '0 16px', maxWidth: 900, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#BD3939',
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
            Final Reveal
          </p>
          <h2 style={{ fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 700,
            color: '#e5e2e1', margin: 0 }}>
            How context transformed the data
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Context layers */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#555',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              Context layers added
            </p>

            {/* Base card */}
            <div style={{ background: '#1C1B1B', border: '1px solid rgba(189,57,57,0.5)',
              borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#BD3939',
                  letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Base statistic
                </span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#e5e2e1', lineHeight: 1.4, margin: 0 }}>
                40.3% of Western Kenya households buy cooking oil from informal kiosks — not from retailers stocking Zawadi.
              </p>
            </div>

            {/* Context cascade */}
            <div style={{ position: 'relative', paddingLeft: 32 }}>
              {/* Vertical spine */}
              <div style={{ position: 'absolute', left: 12, top: 0, bottom: 0,
                width: 2, background: 'rgba(57,155,163,0.25)' }} />

              {CONTEXT_CARDS.map((c, i) => (
                <div key={c.id} style={{ position: 'relative', marginBottom: 12 }}>
                  {/* Horizontal connector */}
                  <div style={{ position: 'absolute', left: -20, top: '50%',
                    transform: 'translateY(-50%)', width: 20, height: 1,
                    background: 'rgba(57,155,163,0.4)' }} />
                  {/* Node */}
                  <div style={{
                    position: 'absolute', left: -26, top: '50%', transform: 'translateY(-50%)',
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'rgba(57,155,163,0.15)', border: '1px solid rgba(57,155,163,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: '#399BA3' }}>{c.id}</span>
                  </div>

                  <div style={{ background: '#1C1B1B', border: '1px solid rgba(57,155,163,0.2)',
                    borderRadius: 12, padding: 16 }}>
                    <p style={{ fontSize: 13, color: '#e5e2e1', lineHeight: 1.55, margin: 0 }}>
                      {c.text}
                    </p>
                    {reactions[i] && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%',
                          background: REACTION_COLOR[reactions[i]] }} />
                        <span style={{ fontSize: 10, fontWeight: 700,
                          color: REACTION_COLOR[reactions[i]],
                          textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                          {REACTION_LABEL[reactions[i]]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journey timeline */}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#555',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              Your interpretation journey
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {allReactions.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: `${REACTION_COLOR[r]}15`,
                      border: `2px solid ${REACTION_COLOR[r]}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: REACTION_COLOR[r] }}>
                        {i === 0 ? '↓' : i}
                      </span>
                    </div>
                    {i < allReactions.length - 1 && (
                      <div style={{ width: 2, height: 28, background: `${REACTION_COLOR[r]}40`,
                        marginTop: 2, marginBottom: 2 }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600,
                      color: REACTION_COLOR[r], lineHeight: 1, margin: '0 0 2px 0' }}>
                      {REACTION_LABEL[r]}
                    </p>
                    <p style={{ fontSize: 11, color: '#AAAAAA', margin: 0 }}>
                      {i === 0 ? 'Initial reaction' : `After card ${i}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary stat */}
            <div style={{ marginTop: 32, background: '#1C1B1B',
              border: '1px solid rgba(89,65,63,0.15)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#e5e2e1',
                lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 6 }}>
                {changes}×
              </div>
              <p style={{ fontSize: 13, color: '#AAAAAA', lineHeight: 1.6, margin: 0 }}>
                You shifted your interpretation {changes} time{changes !== 1 ? 's' : ''}.
                Most people assume the worst. Data storytellers always ask:{' '}
                <em>compared to what? Under what conditions? Over what period?</em>
              </p>
            </div>
          </div>
        </div>

        {/* Amara closing card */}
        <TealCard label="Amara's story, completed">
          <p style={{ color: '#9AF1F2', lineHeight: 1.75, fontSize: 14, fontStyle: 'italic', margin: 0 }}>
            The 40.3% figure is real. But with context it becomes:{' '}
            <strong style={{ fontStyle: 'normal', color: '#e5e2e1' }}>large</strong> (2.3M households),{' '}
            <strong style={{ fontStyle: 'normal', color: '#e5e2e1' }}>persistent</strong> (third year deprioritised),{' '}
            <strong style={{ fontStyle: 'normal', color: '#e5e2e1' }}>demand-proven</strong> (kiosks requesting by name), and{' '}
            <strong style={{ fontStyle: 'normal', color: '#e5e2e1' }}>winnable</strong> (competitors achieved 68% recognition
            in 18 months with early distribution). Context does not hide the truth. It completes it.
          </p>
        </TealCard>

        <div style={{ height: 32 }} />
      </div>

      <NavBar
        onNext={onFinish}
        nextLabel="Reflect"
        nextIcon="arrow_forward"
        onBack={onRetry}
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
    </div>
  );
}

/* ── COMPLETION ──────────────────────────────────────────────── */
function Completion({ onRetry }) {
  const { goHome, markComplete } = useApp();
  useEffect(() => { markComplete(1); }, []);
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
          You've layered context onto a raw statistic to reveal the human and business significance behind the number — turning 40.3% from a proportion into a story worth telling.
        </p>
        <div style={{
          borderRadius: 12, padding: 24, marginBottom: 20,
          background: '#1A1A1A', border: '1px solid rgba(89,65,63,0.15)',
        }}>
          <p style={{ fontSize: 15, color: '#9AF1F2', fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
            "Context is not decoration. It is the difference between a data point and a data story."
          </p>
        </div>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 24, fontStyle: 'italic' }}>
          Next, Amara uses her context-rich finding to build a story arc that will carry the 40.3% all the way to the boardroom.
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

/* ── ACTIVITY 03 ROOT ────────────────────────────────────────── */
export default function Activity03() {
  const { goHome } = useApp();
  const [page,    setPage]    = useState(0);
  const [journey, setJourney] = useState(null);

  return (
    <>
      {page === 0 && (
        <NarrativeIntro
          data={AMARA[1].intro}
          activityNumber={1}
          onStart={() => setPage(1)}
          sidebarDot={1}
          progress={25}
        />
      )}
      {page === 1 && <Page1 onNext={() => setPage(2)} />}
      {page === 2 && <Page2 onNext={j => { setJourney(j); setPage(3); }} />}
      {page === 3 && (
        <Page3
          journey={journey}
          onRetry={() => { setJourney(null); setPage(1); }}
          onFinish={() => setPage(4)}
        />
      )}
      {page === 4 && (
        <Debrief
          data={AMARA[1].debrief}
          activityNumber={1}
          onFinish={() => setPage(5)}
          sidebarDot={1}
          progress={100}
        />
      )}
      {page === 5 && <Completion onRetry={() => { setJourney(null); setPage(1); }} />}
    </>
  );
}
