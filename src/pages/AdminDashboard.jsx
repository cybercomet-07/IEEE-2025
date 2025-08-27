import { useState, useEffect } from 'react'
import { useIssues } from '../contexts/IssueContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Filter,
  Search,
  Edit,
  Building,
  MapPin,
  Shield,
  Users
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { db } from '../config/firebase'
import { collection, getDocs, updateDoc, doc as fsDoc, query, where } from 'firebase/firestore'

function AdminDashboard() {
  const { user } = useAuth()
  const { issues, filters, setFilters, getFilteredIssues, getStatistics, updateIssueStatus, getIssuesByMunicipalCorp } = useIssues()
  const [stats, setStats] = useState({})
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user?.municipalCode) {
      console.log('Admin municipalCode:', user.municipalCode)
      console.log('All issues:', issues)
      
      // Calculate statistics only for the admin's municipal corporation
      const corporationIssues = getIssuesByMunicipalCorp(user.municipalCode)
      console.log('Filtered corporation issues:', corporationIssues)
      
      const total = corporationIssues.length
      const pending = corporationIssues.filter(i => i.status === 'pending').length
      const inProgress = corporationIssues.filter(i => i.status === 'in-progress').length
      const resolved = corporationIssues.filter(i => i.status === 'resolved').length
      
      setStats({
        total,
        pending,
        inProgress,
        resolved
      })
    } else {
      console.log('No municipalCode found for admin user:', user)
      setStats({})
    }
  }, [issues, getIssuesByMunicipalCorp, user?.municipalCode])

  // One-time migration: backfill municipalCode for Pune issues
  useEffect(() => {
    const runMigration = async () => {
      try {
        const flagKey = 'migration_pune_code_100133_done'
        if (localStorage.getItem(flagKey)) return
        if (user?.municipalCode !== '100133') return

        // Fetch all issues for Pune corporation and backfill missing municipalCode
        const issuesRef = collection(db, 'issues')
        const q = query(issuesRef, where('municipalCorp', '==', 'Pune Municipal Corporation'))
        const snapshot = await getDocs(q)
        const updates = []
        snapshot.forEach(d => {
          const data = d.data()
          if (!data.municipalCode || String(data.municipalCode).trim() === '') {
            updates.push(updateDoc(fsDoc(db, 'issues', d.id), { municipalCode: '100133' }))
          }
        })
        if (updates.length > 0) {
          await Promise.allSettled(updates)
        }
        localStorage.setItem(flagKey, '1')
      } catch (e) {
        console.error('Pune municipalCode migration error:', e)
      }
    }
    runMigration()
  }, [user?.municipalCode])

  // Migration: Update user's municipal corporation information if it doesn't match the code
  useEffect(() => {
    const runUserMigration = async () => {
      try {
        if (!user?.municipalCode) return
        
        const flagKey = `migration_user_municipal_${user.municipalCode}_done`
        if (localStorage.getItem(flagKey)) return

        // Import the function dynamically to avoid circular dependencies
        const { getMunicipalNameByCode } = await import('../utils/municipalCorporations')
        const municipalCorpName = getMunicipalNameByCode(user.municipalCode)
        
        if (municipalCorpName && user.areaName !== municipalCorpName) {
          // Update user document with correct municipal corporation information
          await updateDoc(fsDoc(db, 'users', user.uid), {
            areaName: municipalCorpName,
            selectedMunicipalCorp: municipalCorpName,
            updatedAt: new Date().toISOString()
          })
          console.log('Updated user municipal corporation information')
        }
        
        localStorage.setItem(flagKey, '1')
      } catch (e) {
        console.error('User municipal corporation migration error:', e)
      }
    }
    runUserMigration()
  }, [user?.municipalCode, user?.uid, user?.areaName])

  // Get issues for the admin's municipal corporation
  const corporationIssues = user?.municipalCode ? 
    getIssuesByMunicipalCorp(user.municipalCode) : []
  
  const filteredIssues = getFilteredIssues()
  const searchFilteredIssues = corporationIssues.filter(issue =>
    issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Debug logging
  console.log('Admin user:', user)
  console.log('Admin municipalCode:', user?.municipalCode)
  console.log('Admin areaName:', user?.areaName)
  console.log('Admin selectedMunicipalCorp:', user?.selectedMunicipalCorp)
  console.log('All issues count:', issues.length)
  console.log('Corporation issues count:', corporationIssues.length)
  console.log('Search filtered issues count:', searchFilteredIssues.length)

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      await updateIssueStatus(issueId, newStatus)
      setSelectedIssue(null)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
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
    const icons = {
      'roads-transport': '🛣️',
      'waste-management': '🗑️',
      'water-drainage': '💧',
      'electricity-lighting': '💡',
      'environment-parks': '🌳',
      'public-safety-others': '🚨'
    }
    return icons[category] || '📋'
  }

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'roads-transport': 'Roads & Transport',
      'waste-management': 'Waste Management',
      'water-drainage': 'Water & Drainage',
      'electricity-lighting': 'Electricity & Lighting',
      'environment-parks': 'Environment & Parks',
      'public-safety-others': 'Public Safety & Others'
    }
    return categoryLabels[category] || category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Check if user has a municipal code (admin users should have this)
  if (!user?.municipalCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-24 w-24 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Municipal Code Not Found</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Admin users must have a valid municipal code to access the dashboard and manage civic issues.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Municipal Corporation Code Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building className="h-6 w-6 text-blue-200" />
                <span className="text-blue-100 font-medium">Municipal Code:</span>
                <span className="bg-white text-blue-600 px-3 py-1 rounded-lg font-bold text-lg">
                  {user.municipalCode}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-200" />
                <span className="text-green-100 font-medium">Area:</span>
                <span className="bg-white text-green-600 px-3 py-1 rounded-lg font-semibold">
                  {user.areaName || 'Municipal Area'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-yellow-200" />
                <span className="text-yellow-100 font-medium">Designation:</span>
                <span className="bg-white text-yellow-600 px-3 py-1 rounded-lg font-semibold">
                  {user.designation || 'Administrator'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-200" />
                <span className="text-purple-100 font-medium">Department:</span>
                <span className="bg-white text-purple-600 px-3 py-1 rounded-lg font-semibold">
                  {user.department || 'General'}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary bg-white text-blue-600 hover:bg-blue-50 inline-flex items-center mt-4 sm:mt-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Community Discussion Quick Access */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Community Discussion</h2>
            <p className="text-purple-100">Monitor and engage with citizen discussions and feedback</p>
          </div>
          <button
            onClick={() => window.location.href = '/community'}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            View Discussions
          </button>
        </div>
      </div>

      {/* Municipal Area Information Section */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Building className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Your Municipal Area Details</h2>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            Active Administrator
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Admin's Municipal Area */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-900">{user.areaName || 'Your Area'}</h3>
              <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">Primary</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Municipal Code:</span>
                <span className="text-sm font-bold text-blue-900">{user.municipalCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Designation:</span>
                <span className="text-sm font-medium text-blue-900">{user.designation || 'Admin'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Department:</span>
                <span className="text-sm font-medium text-blue-900">{user.department || 'General'}</span>
              </div>
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Total Issues</h3>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Summary</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="text-sm font-bold text-gray-900">{stats.total || 0}</span>
                <span className="text-sm text-gray-600">Connaught Place:</span>
                <span className="text-sm font-medium text-blue-600">DEL-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Chandni Chowk:</span>
                <span className="text-sm font-medium text-blue-600">DEL-002</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Karol Bagh:</span>
                <span className="text-sm font-medium text-blue-600">DEL-003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Lajpat Nagar:</span>
                <span className="text-sm font-medium text-blue-600">DEL-004</span>
              </div>
            </div>
          </div>

          {/* Bangalore Area Codes */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Bangalore</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Karnataka</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Indiranagar:</span>
                <span className="text-sm font-medium text-blue-600">BLR-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Koramangala:</span>
                <span className="text-sm font-medium text-blue-600">BLR-002</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Whitefield:</span>
                <span className="text-sm font-medium text-blue-600">BLR-003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Electronic City:</span>
                <span className="text-sm font-medium text-blue-600">BLR-004</span>
              </div>
            </div>
          </div>

          {/* Chennai Area Codes */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Chennai</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Tamil Nadu</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">T Nagar:</span>
                <span className="text-sm font-medium text-blue-600">CHE-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Anna Nagar:</span>
                <span className="text-sm font-medium text-blue-600">CHE-002</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Adyar:</span>
                <span className="text-sm font-medium text-blue-600">CHE-003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mylapore:</span>
                <span className="text-sm font-medium text-blue-600">CHE-004</span>
              </div>
            </div>
          </div>

          {/* Hyderabad Area Codes */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Hyderabad</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Telangana</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Banjara Hills:</span>
                <span className="text-sm font-medium text-blue-600">HYD-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Jubilee Hills:</span>
                <span className="text-sm font-medium text-blue-600">HYD-002</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Gachibowli:</span>
                <span className="text-sm font-medium text-blue-600">HYD-003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hitech City:</span>
                <span className="text-sm font-medium text-blue-600">HYD-004</span>
              </div>
            </div>
          </div>

          {/* Kolkata Area Codes */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Kolkata</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">West Bengal</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Park Street:</span>
                <span className="text-sm font-medium text-blue-600">KOL-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Salt Lake:</span>
                <span className="text-sm font-medium text-blue-600">KOL-002</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Town:</span>
                <span className="text-sm font-medium text-blue-600">KOL-003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Howrah:</span>
                <span className="text-sm font-medium text-blue-600">KOL-004</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-xl">ℹ️</div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">How Municipal Area Codes Work</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Format:</strong> City Code + Sequential Number (e.g., MUM-001, DEL-001)</li>
                <li>• <strong>Purpose:</strong> Unique identification for each municipal area and jurisdiction</li>
                <li>• <strong>Routing:</strong> Issues are automatically routed to the correct municipal authority</li>
                <li>• <strong>Management:</strong> Each code represents a specific administrative boundary</li>
                <li>• <strong>Registration:</strong> Admins must use their assigned area code during registration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Issues</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.resolved || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="input-field"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="input-field"
              >
                <option value="all">All Categories</option>
                {['roads-transport', 'waste-management', 'water-drainage', 'electricity-lighting', 'environment-parks', 'public-safety-others'].map(category => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <select
                value={filters.area}
                onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
                className="input-field"
              >
                <option value="all">All Areas</option>
                {Array.from(new Set(issues.map(issue => issue.area).filter(Boolean))).map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issues Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Issues</h2>
          <p className="text-sm text-gray-500">
            {searchFilteredIssues.length} of {filteredIssues.length} issues
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {searchFilteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{getCategoryIcon(issue.category)}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getCategoryLabel(issue.category)}
                        </div>
                        {issue.subcategory && (
                          <div className="text-sm text-blue-600 font-medium">
                            {issue.subcategory}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {issue.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getCategoryIcon(issue.category)} {getCategoryLabel(issue.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{issue.area}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${getStatusColor(issue.status)}`}>
                      {getStatusIcon(issue.status)}
                      <span className="ml-1 capitalize">{issue.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{issue.userName}</div>
                    <div className="text-sm text-gray-500">{issue.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.createdAt && formatDistanceToNow(
                      new Date(issue.createdAt.seconds * 1000),
                      { addSuffix: true }
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusUpdate(issue.id, 'in-progress')}
                        className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        title="Mark In Progress"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(issue.id, 'resolved')}
                        className="px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200"
                        title="Mark Resolved"
                      >
                        Resolved
                      </button>
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit status"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedIssue(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Edit className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Update Issue Status
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Update the status of "{getCategoryLabel(selectedIssue.category)}"
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    onChange={(e) => handleStatusUpdate(selectedIssue.id, e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="btn-secondary sm:ml-3 sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
