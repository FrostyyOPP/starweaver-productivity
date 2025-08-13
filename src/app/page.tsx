export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Starweaver Productivity API
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '2rem' }}>
          Backend is running successfully
        </p>
        
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #475569',
          borderRadius: '8px',
          padding: '1.5rem',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Available Endpoints
          </h2>
          <div style={{ textAlign: 'left', lineHeight: '1.8' }}>
            <div style={{ color: '#cbd5e1' }}>
              <span style={{ color: '#10b981', fontFamily: 'monospace' }}>POST</span> /api/auth/signup
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <span style={{ color: '#3b82f6', fontFamily: 'monospace' }}>POST</span> /api/auth/login
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <span style={{ color: '#3b82f6', fontFamily: 'monospace' }}>POST</span> /api/auth/logout
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <span style={{ color: '#3b82f6', fontFamily: 'monospace' }}>POST</span> /api/auth/refresh
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <span style={{ color: '#10b981', fontFamily: 'monospace' }}>GET</span> /api/entries
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <span style={{ color: '#10b981', fontFamily: 'monospace' }}>GET</span> /api/dashboard
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <span style={{ color: '#10b981', fontFamily: 'monospace' }}>GET</span> /api/analytics
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <span style={{ color: '#10b981', fontFamily: 'monospace' }}>GET</span> /api/export
            </div>
          </div>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1.5rem' }}>
          Check the README.md for detailed API documentation
        </p>
      </div>
    </div>
  )
}
