import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { IssueProvider } from './contexts/IssueContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RoleSelection from './pages/RoleSelection'
import MunicipalCorpSelection from './pages/MunicipalCorpSelection'
import CitizenDashboard from './pages/CitizenDashboard'
import AdminDashboard from './pages/AdminDashboard'
import IssueForm from './pages/IssueForm'
import IssueDetail from './pages/IssueDetail'
import Profile from './pages/Profile'
import MapView from './pages/MapView'
import CommunityDiscussion from './pages/CommunityDiscussion'
import { useAuth } from './contexts/AuthContext'
import { useState, useEffect } from 'react'

// Protected Route Component
function ProtectedRoute({ children, requireAuth = true }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    )
  }
  
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Error Boundary Component
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleError = (error) => {
      console.error('App Error:', error)
      setHasError(true)
      setError(error)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleError)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleError)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">We're working to fix this issue. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
          {error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
              <pre className="text-xs text-gray-400 mt-2 overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  return children
}

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Loading CityPulse...</h2>
          <p className="text-gray-500 mt-2">Initializing your civic platform</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <IssueProvider>
              <div className="App">
                <Toaster position="top-right" />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/role-selection" element={<RoleSelection />} />
                  <Route path="/register/:role" element={<Register />} />
                  
                  {/* Protected routes */}
                  <Route path="/municipal-corp-selection" element={
                    <ProtectedRoute>
                      <MunicipalCorpSelection />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={<Layout><CitizenDashboard /></Layout>} />
                  <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
                  <Route path="/report" element={<Layout><IssueForm /></Layout>} />
                  <Route path="/issues/:id" element={<Layout><IssueDetail /></Layout>} />
                  <Route path="/profile" element={<Layout><Profile /></Layout>} />
                  <Route path="/map" element={<Layout><MapView /></Layout>} />
                  <Route path="/community" element={<Layout><CommunityDiscussion /></Layout>} />
                </Routes>
              </div>
            </IssueProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
