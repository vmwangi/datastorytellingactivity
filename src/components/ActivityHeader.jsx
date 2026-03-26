// ActivityHeader — display number + title + subtitle + optional progress bar
export default function ActivityHeader({ number, title, subtitle, progress, label }) {
  return (
    <div style={{ paddingBottom: 4 }}>
      {/* top progress bar */}
      {progress !== undefined && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: '#a88a87', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              {label ?? title}
            </span>
            <span style={{ fontSize: 11, color: '#a88a87' }}>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <div style={{ fontSize: 'clamp(52px,10vw,80px)', fontWeight: 900, color: '#BD3939',
        lineHeight: 1, letterSpacing: '-.04em' }}>
        {String(number).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 'clamp(22px,5vw,32px)', fontWeight: 700, color: '#e5e2e1', marginTop: 4 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: '#a88a87', marginTop: 6,
          letterSpacing: '.06em', textTransform: 'uppercase' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
