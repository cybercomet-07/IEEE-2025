import React from 'react'

function AppTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>
          🏙️ CityPulse Test
        </h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          If you can see this, React is working!
        </p>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          Deployment successful ✅
        </p>
      </div>
    </div>
  )
}

export default AppTest
