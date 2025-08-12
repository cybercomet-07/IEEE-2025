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
  Building
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function AdminDashboard() {
  const { user } = useAuth()
  const { issues, filters, setFilters, getFilteredIssues, getStatistics, updateIssueStatus, getIssuesByMunicipalCorp } = useIssues()
  const [stats, setStats] = useState({})
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user?.selectedMunicipalCorp) {
      // Calculate statistics only for the selected corporation
      const corporationIssues = getIssuesByMunicipalCorp(user.selectedMunicipalCorp)
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
      setStats({})
    }
  }, [issues, getIssuesByMunicipalCorp, user?.selectedMunicipalCorp])

  // Get issues for the user's selected municipal corporation
  const corporationIssues = user?.selectedMunicipalCorp ? 
    getIssuesByMunicipalCorp(user.selectedMunicipalCorp) : []
  
  const filteredIssues = getFilteredIssues()
  const searchFilteredIssues = corporationIssues.filter(issue =>
    issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  // Check if user has selected a municipal corporation
  if (!user?.selectedMunicipalCorp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-24 w-24 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Municipal Corporation Not Selected</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Please select your Municipal Corporation to access the admin dashboard and manage civic issues.
          </p>
          <button
            onClick={() => window.location.href = '/municipal-corp-selection'}
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Select Municipal Corporation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          {user?.selectedMunicipalCorp ? (
            <div className="flex items-center space-x-2 mt-2">
              <Building className="h-5 w-5 text-green-600" />
              <p className="text-green-600 font-medium">{user.selectedMunicipalCorp}</p>
            </div>
          ) : (
            <p className="text-gray-600 mt-2">Manage and monitor civic issues across the city</p>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary inline-flex items-center mt-4 sm:mt-0"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
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

      {/* Municipal Area Codes Section */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Building className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Municipal Area Codes</h2>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {user?.municipalCode || 'No Code Set'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Mumbai Area Codes */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Mumbai</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Maharashtra</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Andheri West:</span>
                <span className="text-sm font-medium text-blue-600">MUM-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bandra East:</span>
                <span className="text-sm font-medium text-blue-600">MUM-002</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Colaba:</span>
                <span className="text-sm font-medium text-blue-600">MUM-003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Dadar:</span>
                <span className="text-sm font-medium text-blue-600">MUM-004</span>
              </div>
            </div>
          </div>

          {/* Delhi Area Codes */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Delhi</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Delhi</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
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
                    <button
                      onClick={() => setSelectedIssue(issue)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
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
