// Layout — page background + padding only
// Hamburger & Sidebar are in AppShell (App.jsx) so they persist on every screen
export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#131313' }}>
      {/* spacer clears the persistent hamburger button */}
      <div style={{ height: 72 }} />
      <div style={{ paddingBottom: 32 }}>
        {children}
      </div>
    </div>
  );
}
