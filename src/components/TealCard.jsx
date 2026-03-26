// Reusable teal "key insight" card used in results pages
export default function TealCard({ label = 'Key Insight', children }) {
  return (
    <div style={{
      background: 'rgba(57,155,163,.08)', borderRadius: 8,
      padding: '14px 16px', borderLeft: '3px solid #399BA3',
    }}>
      <div style={{ fontSize: 11, color: '#399BA3', letterSpacing: '.06em',
        textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#e5e2e1', lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  );
}
