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

function App() {
  return (
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
  )
}

export default App
