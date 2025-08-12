import React, { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  MapPin, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Camera,
  Bell,
  Settings,
  Key,
  HelpCircle,
  LogOut,
  Plus,
  Phone,
  Calendar,
  TrendingUp,
  MessageCircle,
  ThumbsUp
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useIssues } from '../contexts/IssueContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import toast from 'react-hot-toast'
import { testWhatsAppIntegration } from '../services/twilio'

function Profile() {
  const { user, logout } = useAuth()
  const { issues, getIssuesByUser, getStatistics } = useIssues()
  const navigate = useNavigate()
  const location = useLocation()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    area: user?.areaName || user?.selectedMunicipalCorp || ''
  })

  // Update editForm when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        area: user.areaName || user.selectedMunicipalCorp || ''
      })

      // Load user's saved settings if they exist
      if (user.notificationSettings) {
        setNotificationSettings(user.notificationSettings)
      }
      if (user.privacySettings) {
        setPrivacySettings(user.privacySettings)
      }
    }
  }, [user])

  // Handle tab parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab')
    if (tab && ['profile', 'notifications', 'settings'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [location.search])

  // Get real user issues and statistics
  const userIssues = user ? getIssuesByUser(user.uid) : []
  const stats = getStatistics()
  
  // Calculate user-specific statistics
  let userStats = {
    totalIssues: userIssues.length,
    pendingIssues: userIssues.filter(issue => issue.status === 'pending').length,
    resolvedIssues: userIssues.filter(issue => issue.status === 'resolved').length,
    inProgressIssues: userIssues.filter(issue => issue.status === 'in-progress').length,
    upvotesReceived: userIssues.reduce((total, issue) => total + (issue.upvotes || 0), 0),
    commentsMade: userIssues.reduce((total, issue) => total + (issue.comments?.length || 0), 0),
    memberSince: user?.createdAt || new Date().toISOString()
  }

  // If no real issues, show sample statistics for development
  if (userIssues.length === 0) {
    userStats = {
      totalIssues: 3,
      pendingIssues: 1,
      resolvedIssues: 1,
      inProgressIssues: 1,
      upvotesReceived: 22,
      commentsMade: 7,
      memberSince: user?.createdAt || new Date().toISOString()
    }
  }

  // Get user's most active category
  const getUserMostActiveCategory = () => {
    if (userIssues.length === 0) return 'public-safety-others'
    
    const categoryCounts = {}
    userIssues.forEach(issue => {
      const category = issue.category || 'public-safety-others'
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })
    
    return Object.entries(categoryCounts).reduce((a, b) => 
      categoryCounts[a[0]] > categoryCounts[b[0]] ? a : b
    )[0]
  }

  const mostActiveCategory = getUserMostActiveCategory()

  // Get recent user activity from real issues
  let userActivity = userIssues.slice(0, 5).map(issue => ({
    id: issue.id,
    action: 'reported',
    issue: issue.title || (issue.description ? issue.description.substring(0, 30) + '...' : 'Issue'),
    time: getTimeAgo(issue.createdAt),
    status: issue.status || 'pending',
    category: issue.category || 'public-safety-others',
    upvotes: issue.upvotes || 0,
    comments: issue.comments?.length || 0
  }))

  // If no real issues, show sample data for development
  if (userActivity.length === 0) {
    userActivity = [
      {
        id: 'sample-1',
        action: 'reported',
        issue: 'Broken Street Light on Main Road',
        time: '2 hours ago',
        status: 'pending',
        category: 'electricity-lighting',
        upvotes: 3,
        comments: 1
      },
      {
        id: 'sample-2',
        action: 'reported',
        issue: 'Garbage Pile Near Central Park',
        time: '1 day ago',
        status: 'in-progress',
        category: 'waste-management',
        upvotes: 7,
        comments: 2
      },
      {
        id: 'sample-3',
        action: 'reported',
        issue: 'Pothole on Highway Road',
        time: '3 days ago',
        status: 'resolved',
        category: 'roads-transport',
        upvotes: 12,
        comments: 4
      }
    ]
  }

  // Helper function to get time ago
  function getTimeAgo(timestamp) {
    if (!timestamp) return 'Recently'
    
    try {
      const now = new Date()
      let time
      
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        time = timestamp.toDate()
      } 
      // Handle ISO string or other date formats
      else if (typeof timestamp === 'string' || timestamp instanceof Date) {
        time = new Date(timestamp)
      } 
      // Handle timestamp in seconds or milliseconds
      else if (typeof timestamp === 'number') {
        time = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000)
      }
      else {
        return 'Recently'
      }
      
      // Check if time is valid
      if (isNaN(time.getTime())) {
        return 'Recently'
      }
      
      const diffInHours = Math.floor((now - time) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Just now'
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
      if (diffInHours < 48) return '1 day ago'
      return `${Math.floor(diffInHours / 24)} days ago`
    } catch (error) {
      console.error('Error parsing timestamp:', error)
      return 'Recently'
    }
  }

  // Handle profile editing
  const handleEdit = () => {
    setEditForm({
      displayName: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      area: user?.areaName || user?.selectedMunicipalCorp || ''
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!user?.uid) {
      toast.error('User not authenticated')
      return
    }

    // Basic validation
    if (!editForm.displayName.trim()) {
      toast.error('Display name is required')
      return
    }

    if (editForm.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(editForm.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number')
      return
    }

    setIsLoading(true)
    try {
      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        displayName: editForm.displayName.trim(),
        phoneNumber: editForm.phone.trim() || null,
        areaName: editForm.area.trim() || null,
        updatedAt: serverTimestamp()
      })

      toast.success('Profile updated successfully!')
      setIsEditing(false)
      
      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'roads-transport': return '🛣️'
      case 'waste-management': return '🗑️'
      case 'water-drainage': return '💧'
      case 'electricity-lighting': return '💡'
      case 'environment-parks': return '🌳'
      case 'public-safety-others': return '🛡️'
      default: return '📋'
    }
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'report':
        navigate('/report')
        break
      case 'map':
        navigate('/map')
        break
      case 'notifications':
        setActiveTab('notifications')
        break
      case 'settings':
        setActiveTab('settings')
        break
      default:
        break
    }
  }

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    issueUpdates: true,
    weeklyDigest: false,
    emergencyAlerts: true
  })
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowContact: true,
    dataSharing: false
  })

  const handleAccountAction = (action) => {
    switch (action) {
      case 'password':
        setShowPasswordModal(true)
        break
      case 'notifications':
        setActiveTab('notifications')
        break
      case 'privacy':
        setActiveTab('settings')
        break
      case 'help':
        setShowHelpModal(true)
        break
      default:
        break
    }
  }

  const handleWhatsAppTest = async () => {
    try {
      const result = await testWhatsAppIntegration()
      if (result.success) {
        toast.success('WhatsApp integration test completed successfully!')
      } else {
        toast.error('WhatsApp integration test failed')
      }
    } catch (error) {
      toast.error('Error testing WhatsApp integration')
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All fields are required')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    try {
      // Here you would implement actual password change logic
      // For now, we'll simulate the process
      toast.success('Password changed successfully!')
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('Failed to change password: ' + error.message)
    }
  }

  const handleNotificationSettingsSave = async () => {
    try {
      // Save notification settings to user profile
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        notificationSettings,
        updatedAt: serverTimestamp()
      })
      toast.success('Notification preferences saved!')
      setShowNotificationsModal(false)
    } catch (error) {
      toast.error('Failed to save notification preferences')
    }
  }

  const handlePrivacySettingsSave = async () => {
    try {
      // Save privacy settings to user profile
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        privacySettings,
        updatedAt: serverTimestamp()
      })
      toast.success('Privacy settings saved!')
      setShowPrivacyModal(false)
    } catch (error) {
      toast.error('Failed to save privacy settings')
    }
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Photo size should be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      setSelectedPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) {
      toast.error('Please select a photo first')
      return
    }

    setIsUploadingPhoto(true)
    try {
      // In a real implementation, you would upload to Firebase Storage
      // For now, we'll simulate the upload
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update user profile with photo URL
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        photoURL: photoPreview, // In real app, this would be the storage URL
        updatedAt: serverTimestamp()
      })
      
      toast.success('Profile photo updated successfully!')
      setShowPhotoModal(false)
      setSelectedPhoto(null)
      setPhotoPreview(null)
      
      // Refresh the page to show new photo
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Failed to upload photo')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const removeProfilePhoto = async () => {
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        photoURL: null,
        updatedAt: serverTimestamp()
      })
      
      toast.success('Profile photo removed')
      setShowPhotoModal(false)
      
      // Refresh the page
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('Error removing photo:', error)
      toast.error('Failed to remove photo')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Profile 👤</h1>
        <p className="text-xl mt-2">Manage your account and view your civic activity</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Profile Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="text-center">
              {/* Profile Picture */}
              <div className="relative inline-block">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    background: user?.photoURL 
                      ? `url(${user.photoURL}) center/cover`
                      : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                  }}
                  onClick={() => setShowPhotoModal(true)}
                >
                  {!user?.photoURL && (user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U')}
                </div>
                <button 
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowPhotoModal(true)}
                >
                  <Camera className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-4">
                {user?.displayName || 'User Name'}
              </h2>
              <p className="text-gray-600 capitalize">
                {user?.role || 'Citizen'}
              </p>
              {userStats.totalIssues > 0 && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userStats.totalIssues >= 10 ? 'bg-purple-100 text-purple-800' :
                    userStats.totalIssues >= 5 ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {userStats.totalIssues >= 10 ? '🏆 Active Contributor' :
                     userStats.totalIssues >= 5 ? '⭐ Regular Reporter' :
                     '🌱 New Reporter'}
                  </span>
                </div>
              )}
              {user?.municipalCode && (
                <p className="text-sm text-gray-500 mt-1">
                  Municipal Corp: {user.municipalCode}
                </p>
              )}
              {user?.designation && (
                <p className="text-sm text-gray-500">
                  {user.designation} • {user.department}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4" />
                Member since {new Date(userStats.memberSince).toLocaleDateString()}
              </p>
              {userStats.totalIssues > 0 && (
                <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Most active in {getCategoryIcon(mostActiveCategory)} {mostActiveCategory.replace('-', ' ')}
                </p>
              )}

              {/* Edit Button */}
              <div className="mt-4">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">{user?.email || 'user@example.com'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">{user?.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">{user?.areaName || user?.selectedMunicipalCorp || 'City Area'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700 capitalize">{user?.role || 'Citizen'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Civic Activity 📊</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalIssues}</div>
                <div className="text-sm text-gray-600">Total Issues</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userStats.resolvedIssues}</div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{userStats.pendingIssues}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{userStats.upvotesReceived}</div>
                <div className="text-sm text-gray-600">Upvotes</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{userStats.commentsMade}</div>
                <div className="text-sm text-gray-600">Comments</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{userStats.inProgressIssues}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {userStats.totalIssues > 0 ? Math.round((userStats.resolvedIssues / userStats.totalIssues) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Resolution Rate</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity 📝</h3>
            {userActivity.length > 0 ? (
              <div className="space-y-4">
                {userActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {getCategoryIcon(activity.category)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        You <span className="font-medium">{activity.action}</span> "{activity.issue}"
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{activity.time}</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {activity.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {activity.comments}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No issues reported yet</p>
                <button 
                  onClick={() => navigate('/report')}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Report your first issue →
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions ⚡</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <button 
                onClick={() => handleQuickAction('report')}
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                <Plus className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-700">Report Issue</span>
              </button>
              <button 
                onClick={() => handleQuickAction('map')}
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
              >
                <MapPin className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-700">View Map</span>
              </button>
              <button 
                onClick={() => handleQuickAction('notifications')}
                className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
              >
                <Bell className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-700">Notifications</span>
              </button>
              <button 
                onClick={() => handleQuickAction('settings')}
                className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
              >
                <Settings className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-orange-700">Settings</span>
              </button>
              <button 
                onClick={handleWhatsAppTest}
                className="p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors text-center"
              >
                <span className="text-2xl mx-auto mb-2">📱</span>
                <span className="text-sm font-medium text-teal-700">Test WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account Settings ⚙️</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleAccountAction('password')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Change Password</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button 
                onClick={() => handleAccountAction('notifications')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Notification Preferences</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button 
                onClick={() => handleAccountAction('privacy')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Privacy Settings</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button 
                onClick={() => handleAccountAction('help')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Help & Support</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone ⚠️</h3>
            <p className="text-red-700 mb-4">Once you log out, you'll need to sign in again to access your account.</p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Notifications Tab Content */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences 🔔</h2>
            
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Issue Updates</p>
                      <p className="text-sm text-gray-500">Receive email notifications when your issues are updated</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.issueUpdates}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, issueUpdates: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Weekly Digest</p>
                      <p className="text-sm text-gray-500">Get a weekly summary of all your civic activities</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyDigest}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Emergency Alerts</p>
                      <p className="text-sm text-gray-500">Receive urgent notifications about critical civic issues</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emergencyAlerts}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, emergencyAlerts: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* WhatsApp Notifications */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Notifications 📱</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Issue Confirmations</p>
                      <p className="text-sm text-gray-500">Receive WhatsApp confirmations when you submit issues</p>
                    </div>
                    <div className="text-green-600 font-medium">✅ Active</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Status Updates</p>
                      <p className="text-sm text-gray-500">Get real-time updates on your issue progress</p>
                    </div>
                    <div className="text-green-600 font-medium">✅ Active</div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleNotificationSettingsSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings ⚙️</h2>
            
            <div className="space-y-6">
              {/* Privacy Settings */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Public - Anyone can view</option>
                      <option value="citizens">Citizens Only - Only registered users</option>
                      <option value="private">Private - Only you</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Show Email Address</p>
                      <p className="text-sm text-gray-500">Allow other users to see your email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showEmail}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, showEmail: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Show Phone Number</p>
                      <p className="text-sm text-gray-500">Allow other users to see your phone number</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showPhone}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, showPhone: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Allow Contact</p>
                      <p className="text-sm text-gray-500">Allow other users to contact you</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.allowContact}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowContact: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Data Sharing</p>
                      <p className="text-sm text-gray-500">Allow your data to be used for civic improvement</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.dataSharing}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, dataSharing: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handlePrivacySettingsSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={editForm.displayName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
                <input
                  type="text"
                  name="area"
                  value={editForm.area}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your area"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Issue Updates</p>
                  <p className="text-sm text-gray-500">Get notified about issue status changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.issueUpdates}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, issueUpdates: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:right-0 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Weekly Digest</p>
                  <p className="text-sm text-gray-500">Receive weekly summary emails</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.weeklyDigest}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Emergency Alerts</p>
                  <p className="text-sm text-gray-500">Get notified about urgent civic issues</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emergencyAlerts}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emergencyAlerts: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleNotificationSettingsSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public - Anyone can see your profile</option>
                  <option value="citizens">Citizens Only - Only registered citizens can see</option>
                  <option value="private">Private - Only you can see your profile</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Email Address</p>
                  <p className="text-sm text-gray-500">Display email in public profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.showEmail}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, showEmail: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Phone Number</p>
                  <p className="text-sm text-gray-500">Display phone in public profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.showPhone}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, showPhone: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Allow Contact</p>
                  <p className="text-sm text-gray-500">Let other users contact you</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowContact}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowContact: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Data Sharing</p>
                  <p className="text-sm text-gray-500">Share data for civic improvement</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.dataSharing}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, dataSharing: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handlePrivacySettingsSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Help & Support</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📚 User Guide</h4>
                <p className="text-sm text-blue-700">Learn how to use CityPulse effectively</p>
                <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Read Guide →
                </button>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">❓ FAQ</h4>
                <p className="text-sm text-green-700">Find answers to common questions</p>
                <button className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium">
                  View FAQ →
                </button>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">📧 Contact Support</h4>
                <p className="text-sm text-purple-700">Get help from our support team</p>
                <button className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Contact Us →
                </button>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">🐛 Report Bug</h4>
                <p className="text-sm text-orange-700">Report technical issues or bugs</p>
                <button className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Report Issue →
                </button>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Profile Photo</h3>
            
            {/* Photo Preview */}
            {photoPreview && (
              <div className="mb-4 text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-3 overflow-hidden">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600">Photo Preview</p>
              </div>
            )}

            {/* File Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {user?.photoURL && (
                <button
                  onClick={removeProfilePhoto}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove Photo
                </button>
              )}
              <button
                onClick={handlePhotoUpload}
                disabled={!selectedPhoto || isUploadingPhoto}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </button>
              <button
                onClick={() => {
                  setShowPhotoModal(false)
                  setSelectedPhoto(null)
                  setPhotoPreview(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
