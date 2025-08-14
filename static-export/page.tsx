export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #fff, #f0f0f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🚀 Starweaver Productivity App
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          Your productivity tracking application has been successfully deployed!
        </p>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#fbbf24' }}>✨ Features</h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            textAlign: 'left'
          }}>
            <li style={{ marginBottom: '10px', paddingLeft: '20px' }}>📊 Role-based dashboards (Editor, Manager, Admin)</li>
            <li style={{ marginBottom: '10px', paddingLeft: '20px' }}>🎯 Video productivity tracking</li>
            <li style={{ marginBottom: '10px', paddingLeft: '20px' }}>📈 Analytics and reporting</li>
            <li style={{ marginBottom: '10px', paddingLeft: '20px' }}>👥 Team management</li>
            <li style={{ marginBottom: '10px', paddingLeft: '20px' }}>📤 Data import/export</li>
          </ul>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#fbbf24' }}>🔧 Development Status</h2>
          <p style={{ marginBottom: '15px' }}>
            This is a static deployment of the frontend. The full application with backend functionality 
            requires a running MongoDB server and Node.js backend.
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            For full functionality, run the app locally with <code>npm run dev</code>
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a 
            href="https://github.com/FrostyyOPP/starweaver-productivity" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📁 View Source Code
          </a>
          
          <button 
            onClick={() => alert('🎉 App is successfully deployed to Firebase!')}
            style={{
              background: 'linear-gradient(45deg, #10b981, #059669)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🚀 Test Deployment
          </button>
        </div>
      </div>
      
      <footer style={{
        marginTop: '40px',
        opacity: 0.7,
        fontSize: '0.9rem'
      }}>
        <p>Built with Next.js • Deployed on Firebase • Powered by MongoDB</p>
      </footer>
    </div>
  );
}
