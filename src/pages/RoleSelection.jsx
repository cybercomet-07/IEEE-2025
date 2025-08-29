import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'
import { 
  Users, 
  Shield, 
  ArrowRight,
  Building,
  MapPin,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

function RoleSelection() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // If user is already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }, [user, navigate])

  const roles = [
    {
      type: 'citizen',
      title: 'Citizen',
      icon: <Users className="h-16 w-16 text-blue-600" />,
      description: 'Report civic issues in your area and track their resolution',
      features: [
        'Report issues with photos and location',
        'Track issue progress in real-time',
        'Get notifications on resolution',
        'View all reported issues in your area',
        'Rate and comment on resolved issues'
      ],
      buttonText: 'Go to Citizen Dashboard',
      color: 'blue'
    },
    {
      type: 'admin',
      title: 'Municipal Admin',
      icon: <Shield className="h-16 w-16 text-green-600" />,
      description: 'Manage and resolve civic issues in your municipal area',
      features: [
        'Review and prioritize reported issues',
        'Assign issues to staff members',
        'Update issue status and progress',
        'Manage municipal area codes',
        'Generate reports and analytics',
        'Communicate with citizens'
      ],
      buttonText: 'Go to Admin Dashboard',
      color: 'green'
    }
  ]

  const handleRoleSelection = (roleType) => {
    console.log('Role selection clicked:', roleType)
    console.log('Current user:', user)
    const params = new URLSearchParams(location.search)
    const mode = params.get('mode') || 'login'
    
    // Store the selected role for subsequent pages
    localStorage.setItem('selectedRole', roleType)

    // Mode-based routing
    if (mode === 'register') {
      // New user registration flows
      if (roleType === 'citizen') {
        navigate('/register/citizen')
      } else if (roleType === 'admin') {
        navigate('/register/admin')
      }
      return
    }

    // Login flows
    if (mode === 'login') {
      navigate('/login')
      return
    }

    // Default behaviour: if already authenticated, go to respective dashboards
    if (user) {
      if (roleType === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
                      {/* Full Page Spline Background */}
        <div className="relative overflow-hidden min-h-screen">
          {/* Spline Background - Full Page */}
          <div className="fixed inset-0 w-full h-full">
            <iframe
              src="https://my.spline.design/holographicearthwithdynamiclines-CMvEeRSYNFpq5rQu7PkI6E5r/"
              frameBorder="0"
              width="100%"
              height="100%"
              title="CityPulse 3D Background Animation"
              style={{ border: "none" }}
              className="absolute inset-0"
            />
          </div>
        
        {/* Dark Overlay for Text Readability */}
        <div className="fixed inset-0 bg-black bg-opacity-40"></div>
        
        {/* Navigation */}
        <nav className="relative z-10 bg-white bg-opacity-10 backdrop-blur-sm border-b border-white border-opacity-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Building className="h-8 w-8 text-white" />
                <span className="text-xl font-bold text-white">CityPulse</span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="relative z-10 text-center py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Choose Your Role
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto drop-shadow-lg">
            Select whether you want to report issues as a citizen or manage issues as a municipal administrator
          </p>
        </div>

        {/* Role Cards */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {roles.map((role) => (
              <div 
                key={role.type}
                className={`bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white border-opacity-20 p-8 hover:bg-white hover:bg-opacity-20 ${
                  role.color === 'blue' ? 'hover:border-blue-300' : 'hover:border-green-300'
                }`}
              >
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {role.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">{role.title}</h2>
                  <p className="text-lg text-blue-100">{role.description}</p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
                    What you can do:
                  </h3>
                  <ul className="space-y-3">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-300 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-blue-100">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleRoleSelection(role.type)}
                  className={`w-full text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    role.color === 'blue' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <span>{role.buttonText}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">
                <MapPin className="h-5 w-5 inline mr-2" />
                Municipal Area Codes
              </h3>
              <p className="text-blue-100">
                Municipal administrators will need their unique area code (similar to pincodes) to register. 
                This ensures proper jurisdiction management and issue routing.
              </p>
            </div>
          </div>
        </div>
        
        {/* Floating Background Elements */}
        <div className="floating-bg-element" style={{ top: '20%', left: '10%', width: '60px', height: '60px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div className="floating-bg-element" style={{ top: '60%', right: '15%', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div className="floating-bg-element" style={{ top: '40%', left: '80%', width: '40px', height: '40px', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>
    </div>
  )
}

export default RoleSelection
