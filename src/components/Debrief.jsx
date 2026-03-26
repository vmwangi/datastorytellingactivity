import NavBar from './NavBar';

// Debrief — shown after last interactive page, before completion
// epilogue prop is only used by Activity 8
export default function Debrief({ data, epilogue, activityNumber, onFinish }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#131313', paddingBottom: 32 }}>
      <div style={{ height: 56 }} />
      <div style={{ padding: '0 16px 8px', maxWidth: 540, margin: '0 auto' }}>

        {/* header badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(154,221,189,.07)', border: '1px solid rgba(154,221,189,.18)',
          borderRadius: 6, padding: '4px 10px', marginBottom: 16,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#9ADDBD' }}>
            restart_alt
          </span>
          <span style={{ fontSize: 10, color: '#9ADDBD', letterSpacing: '.07em',
            textTransform: 'uppercase', fontWeight: 600 }}>
            Debrief — Activity {String(activityNumber).padStart(2, '0')}
          </span>
        </div>

        <h2 style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 700, color: '#e5e2e1',
          marginBottom: 16, lineHeight: 1.3 }}>
          {data.title}
        </h2>

        {/* back to Amara */}
        <div style={{
          background: '#1C1B1B', borderRadius: 10, padding: '14px 16px',
          marginBottom: 12, borderLeft: '2px solid #BD3939',
        }}>
          <div style={{ fontSize: 10, color: '#a88a87', letterSpacing: '.07em',
            textTransform: 'uppercase', marginBottom: 8 }}>
            Back to Amara
          </div>
          <p style={{ fontSize: 14, color: '#AAAAAA', lineHeight: 1.7, margin: 0 }}>
            {data.what}
          </p>
        </div>

        {/* key insight */}
        <div style={{
          background: 'rgba(57,155,163,.06)', borderRadius: 8,
          padding: '12px 14px', borderLeft: '2px solid #399BA3', marginBottom: 12,
        }}>
          <div style={{ fontSize: 10, color: '#399BA3', letterSpacing: '.07em',
            textTransform: 'uppercase', marginBottom: 5 }}>
            Key Insight
          </div>
          <p style={{ fontSize: 14, color: '#e5e2e1', lineHeight: 1.65, margin: 0 }}>
            {data.insight}
          </p>
        </div>

        {/* epilogue — Activity 8 only */}
        {epilogue && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(189,57,57,.05), rgba(57,155,163,.05))',
            borderRadius: 10, padding: '16px',
            border: '1px solid rgba(189,57,57,.12)', marginBottom: 12,
          }}>
            <div style={{ fontSize: 10, color: '#BD3939', letterSpacing: '.07em',
              textTransform: 'uppercase', marginBottom: 10 }}>
              {epilogue.title}
            </div>
            {epilogue.body.split('\n\n').map((para, i, arr) => (
              <p key={i} style={{
                fontSize: 14, color: '#e5e2e1', lineHeight: 1.75,
                margin: 0, marginBottom: i < arr.length - 1 ? 12 : 0,
                fontStyle: i === 1 ? 'italic' : 'normal',
              }}>
                {para}
              </p>
            ))}
            {epilogue.footnote && (
              <p style={{
                fontSize: 12, color: '#a88a87', lineHeight: 1.6, margin: '14px 0 0',
                paddingTop: 14, borderTop: '1px solid rgba(189,57,57,.12)',
              }}>
                {epilogue.footnote}
              </p>
            )}
          </div>
        )}

        {/* reflection — question only, no input */}
        <div style={{
          background: '#1C1B1B', borderRadius: 10,
          padding: '14px 16px', border: '1px solid #2A2A2A',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#BD3939' }}>
              help
            </span>
            <span style={{ fontSize: 10, color: '#a88a87', letterSpacing: '.07em',
              textTransform: 'uppercase', fontWeight: 600 }}>
              Reflect
            </span>
          </div>
          <p style={{ fontSize: 15, color: '#e5e2e1', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
            {data.reflection}
          </p>
        </div>

        <NavBar
          onNext={onFinish}
          nextLabel={epilogue ? 'Complete the Journey' : 'Complete Activity'}
          nextIcon={epilogue ? 'celebration' : 'check_circle'}
        />
      </div>
    </div>
  );
}
