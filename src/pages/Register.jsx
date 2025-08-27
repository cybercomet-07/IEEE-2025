import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building, 
  MapPin,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

function Register() {
  const navigate = useNavigate()
  const { role } = useParams() // Get role from URL params
  const { signUp, signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: role || 'citizen',
    // Admin-specific fields
    municipalCode: '',
    designation: '',
    department: '',
    areaName: ''
  })
  const [errors, setErrors] = useState({})

  // Redirect to role selection if no role specified
  useEffect(() => {
    if (!role || (role !== 'citizen' && role !== 'admin')) {
      navigate('/role-selection')
    } else {
      // Store the selected role for Google sign-in
      localStorage.setItem('selectedRole', role)
    }
  }, [role, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Admin-specific validation
    if (role === 'admin') {
      if (!formData.municipalCode.trim()) {
        newErrors.municipalCode = 'Municipal code is required'
      } else if (!/^\d{6}$/.test(formData.municipalCode)) {
        newErrors.municipalCode = 'Municipal code must be 6 digits'
      }
      
      if (!formData.designation.trim()) {
        newErrors.designation = 'Designation is required'
      }
      
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required'
      }
      
      if (!formData.areaName.trim()) {
        newErrors.areaName = 'Area name is required'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const result = await signInWithGoogle()
      
      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      const userRole = userDoc.data()?.role || 'citizen'
      
      // Check if user had selected a role before login
      const selectedRole = localStorage.getItem('selectedRole')
      
      // Redirect based on selected role or user's actual role
      if (selectedRole === 'admin' && userRole === 'admin') {
        // Check if admin user has a municipal code
        if (userDoc.data()?.municipalCode) {
          navigate('/admin')
        } else {
          navigate('/municipal-corp-selection')
        }
        localStorage.removeItem('selectedRole')
      } else if (selectedRole === 'citizen' || userRole === 'citizen') {
        navigate('/dashboard')
        localStorage.removeItem('selectedRole')
      } else {
        // Fallback to role-based navigation
        if (userRole === 'admin') {
          // Check if admin user has a municipal code
          if (userDoc.data()?.municipalCode) {
            navigate('/admin')
          } else {
            navigate('/municipal-corp-selection')
          }
        } else {
          navigate('/dashboard')
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast.error(error.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      const userData = {
        email: formData.email,
        password: formData.password,
        displayName: formData.fullName,
        phoneNumber: formData.phone,
        role: formData.role
      }

      // Add admin-specific data
      if (role === 'admin') {
        userData.municipalCode = formData.municipalCode
        userData.designation = formData.designation
        userData.department = formData.department
        userData.areaName = formData.areaName
      }

      await signUp(userData)
      toast.success(`${role === 'admin' ? 'Admin' : 'Citizen'} account created successfully!`)
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const getRoleTitle = () => {
    return role === 'admin' ? 'Municipal Administrator' : 'Citizen'
  }

  const getRoleDescription = () => {
    return role === 'admin' 
      ? 'Create your municipal administrator account to manage civic issues'
      : 'Create your citizen account to report civic issues'
  }

  if (!role || (role !== 'citizen' && role !== 'admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={() => navigate('/role-selection')}
            className="absolute top-8 left-8 text-gray-600 hover:text-gray-900 flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            {role === 'admin' ? (
              <Building className="h-6 w-6 text-white" />
            ) : (
              <User className="h-6 w-6 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join CityPulse</h2>
          <p className="mt-2 text-sm text-gray-600">
            {getRoleDescription()}
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {getRoleTitle()}
          </div>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`pl-10 pr-3 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 pr-3 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`pl-10 pr-3 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Admin-specific fields */}
            {role === 'admin' && (
              <>
                {/* Municipal Code */}
                <div>
                  <label htmlFor="municipalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Municipal Area Code * (6 digits)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="municipalCode"
                      name="municipalCode"
                      value={formData.municipalCode}
                      onChange={handleChange}
                      maxLength={6}
                      className={`pl-10 pr-3 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.municipalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 411001"
                    />
                  </div>
                  {errors.municipalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.municipalCode}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    This is your unique municipal area identifier (similar to pincode)
                  </p>
                </div>

                {/* Designation */}
                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                    Designation *
                  </label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={`px-3 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.designation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Municipal Commissioner, Engineer"
                  />
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`px-3 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Public Works, Sanitation"
                  />
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                  )}
                </div>

                {/* Area Name */}
                <div>
                  <label htmlFor="areaName" className="block text-sm font-medium text-gray-700 mb-2">
                    Municipal Area Name *
                  </label>
                  <input
                    type="text"
                    id="areaName"
                    name="areaName"
                    value={formData.areaName}
                    onChange={handleChange}
                    className={`px-3 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.areaName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Pune Municipal Corporation"
                  />
                  {errors.areaName && (
                    <p className="mt-1 text-sm text-red-600">{errors.areaName}</p>
                  )}
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-12 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-12 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Account...' : `Create ${role === 'admin' ? 'Admin' : 'Citizen'} Account`}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
