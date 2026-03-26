// NavBar — inline bottom bar (not fixed/floating), appears at end of content
// Always scrolls to top when navigating forward or back
export default function NavBar({ onNext, onBack, nextLabel = 'Continue', nextIcon = 'arrow_forward',
  nextDisabled = false, leftContent = null }) {

  function handleNext() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    onNext?.();
  }
  function handleBack() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    onBack?.();
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '24px 0 8px', marginTop: 24,
      borderTop: '1px solid #1C1B1B',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onBack && (
          <button
            onClick={handleBack}
            style={{
              padding: '12px 18px', borderRadius: 8, border: '1px solid #2A2A2A',
              color: '#AAAAAA', background: 'transparent', fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'Inter',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Back
          </button>
        )}
        {leftContent}
      </div>
      <button
        onClick={handleNext}
        disabled={nextDisabled}
        className={!nextDisabled ? 'bg-crimson-gradient' : ''}
        style={{
          padding: '13px 24px', borderRadius: 8, border: 'none',
          color: nextDisabled ? '#555' : 'white',
          background: nextDisabled ? '#1C1B1B' : undefined,
          fontSize: 15, fontWeight: 700,
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Inter',
          opacity: nextDisabled ? 0.7 : 1,
          transition: 'opacity .2s',
          whiteSpace: 'nowrap',
        }}
      >
        {nextLabel}
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{nextIcon}</span>
      </button>
    </div>
  );
}
