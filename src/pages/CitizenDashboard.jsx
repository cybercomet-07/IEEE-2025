import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useIssues } from '../contexts/IssueContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  Plus, 
  Map, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Camera,
  Users,
  Star,
  MessageSquare
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

function CitizenDashboard() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { issues, getIssuesByUser } = useIssues()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedStatus, setSelectedStatus] = useState(null)

  // Get user's issues
  const userIssues = user ? getIssuesByUser(user.uid) : []
  
  // Use real issues data instead of mock data
  const stats = {
    total: userIssues.length,
    pending: userIssues.filter(i => i.status === 'pending').length,
    inProgress: userIssues.filter(i => i.status === 'in-progress').length,
    resolved: userIssues.filter(i => i.status === 'resolved').length
  }

  // Filter issues based on selected status
  const filteredIssues = selectedStatus 
    ? userIssues.filter(issue => issue.status === selectedStatus)
    : userIssues

  // Handle status card click
  const handleStatusClick = (status) => {
    if (selectedStatus === status) {
      setSelectedStatus(null) // Clear filter if same status clicked
    } else {
      setSelectedStatus(status) // Set new filter
    }
  }

  // Get status label for display
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending Issues'
      case 'in-progress': return 'In Progress Issues'
      case 'resolved': return 'Resolved Issues'
      case null: return 'Your Recent Issues'
      default: return 'Your Recent Issues'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return isDark ? 'bg-red-900/30 text-red-300 border-red-500/30' : 'bg-red-100 text-red-800'
      case 'in-progress': return isDark ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800'
      case 'resolved': return isDark ? 'bg-green-900/30 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800'
      default: return isDark ? 'bg-gray-900/30 text-gray-300 border-gray-500/30' : 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="h-4 w-4" />
      case 'in-progress': return <Clock className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'roads-transport': return '🛣️'
      case 'waste-management': return '🗑️'
      case 'water-drainage': return '💧'
      case 'electricity-lighting': return '💡'
      case 'environment-parks': return '🌳'
      case 'public-safety-others': return '🚨'
      default: return '📋'
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'roads-transport': return 'Roads & Transport'
      case 'waste-management': return 'Waste Management'
      case 'water-drainage': return 'Water & Drainage'
      case 'electricity-lighting': return 'Electricity & Lighting'
      case 'environment-parks': return 'Environment & Parks'
      case 'public-safety-others': return 'Public Safety & Others'
      default: return 'Other'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className={`rounded-lg p-6 text-white transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 shadow-2xl shadow-purple-500/25' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl'
      } animate-fadeIn`}>
        <h1 className="text-3xl font-bold animate-slideInUp">Welcome to CityPulse! 🏙️</h1>
        <p className="text-xl mt-2 animate-slideInUp stagger-1">Your civic issue reporting dashboard</p>
        <p className={`mt-1 animate-slideInUp stagger-2 ${
          isDark ? 'text-purple-200' : 'text-blue-100'
        }`}>Make your city better, one issue at a time</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/report')}
          className={`rounded-lg shadow-lg border transition-all duration-300 transform hover:scale-105 hover-lift ${
            isDark 
              ? 'bg-slate-800 border-purple-500/30 text-white hover:border-purple-400/50 hover:shadow-purple-500/25' 
              : 'bg-white border-gray-200 text-gray-900 hover:shadow-xl'
          } p-6 animate-scaleIn stagger-1`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-all duration-300 ${
              isDark ? 'bg-purple-600/20' : 'bg-blue-100'
            }`}>
              <Plus className={`h-8 w-8 transition-colors duration-300 ${
                isDark ? 'text-purple-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold">Report Issue</h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Report a new civic issue</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/map')}
          className={`rounded-lg shadow-lg border transition-all duration-300 transform hover:scale-105 hover-lift ${
            isDark 
              ? 'bg-slate-800 border-green-500/30 text-white hover:border-green-400/50 hover:shadow-green-500/25' 
              : 'bg-white border-gray-200 text-gray-900 hover:shadow-xl'
          } p-6 animate-scaleIn stagger-2`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-all duration-300 ${
              isDark ? 'bg-green-600/20' : 'bg-green-100'
            }`}>
              <Map className={`h-8 w-8 transition-colors duration-300 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold">Map View</h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>View issues on map</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`rounded-lg shadow-lg border transition-all duration-300 transform hover:scale-105 hover-lift ${
            isDark 
              ? 'bg-slate-800 border-pink-500/30 text-white hover:border-pink-400/50 hover:shadow-pink-500/25' 
              : 'bg-white border-gray-200 text-gray-900 hover:shadow-xl'
          } p-6 animate-scaleIn stagger-3`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-all duration-300 ${
              isDark ? 'bg-pink-600/20' : 'bg-purple-100'
            }`}>
              <Camera className={`h-8 w-8 transition-colors duration-300 ${
                isDark ? 'text-pink-400' : 'text-purple-600'
              }`} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold">Profile</h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Manage your account</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/community')}
          className={`rounded-lg p-6 text-white transition-all duration-300 transform hover:scale-105 hover-lift ${
            isDark 
              ? 'bg-gradient-to-r from-orange-600 to-red-600 shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/35' 
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-xl'
          } animate-scaleIn stagger-4`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold">Community</h3>
              <p className="text-orange-100">Join discussions</p>
            </div>
          </div>
        </button>
      </div>

      {/* Active Filter Indicator */}
      {selectedStatus && (
        <div className="col-span-full mb-2">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            isDark 
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
              : 'bg-purple-100 text-purple-700 border border-purple-300'
          }`}>
            <span className="mr-2">🔍</span>
            Currently showing: <span className="ml-1 font-bold capitalize">{selectedStatus}</span> issues
            <button
              onClick={() => setSelectedStatus(null)}
              className="ml-3 p-1 hover:bg-purple-200 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => handleStatusClick('pending')}
          className={`rounded-lg shadow-lg border transition-all duration-300 hover-lift cursor-pointer ${
            isDark 
              ? `bg-slate-800 border-red-500/30 text-white ${selectedStatus === 'pending' ? 'ring-2 ring-red-400 ring-opacity-50' : ''}` 
              : `bg-white border-gray-200 text-gray-900 ${selectedStatus === 'pending' ? 'ring-2 ring-red-500 ring-opacity-30' : ''}`
          } p-6 animate-slideInUp stagger-1 hover:scale-105`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-all duration-300 ${
              isDark ? 'bg-red-600/20' : 'bg-red-100'
            }`}>
              <AlertTriangle className={`h-8 w-8 transition-colors duration-300 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Pending Issues</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatusClick('in-progress')}
          className={`rounded-lg shadow-lg border transition-all duration-300 hover-lift cursor-pointer ${
            isDark 
              ? `bg-slate-800 border-yellow-500/30 text-white ${selectedStatus === 'in-progress' ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}` 
              : `bg-white border-gray-200 text-gray-900 ${selectedStatus === 'in-progress' ? 'ring-2 ring-yellow-500 ring-opacity-30' : ''}`
          } p-6 animate-slideInUp stagger-2 hover:scale-105`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-all duration-300 ${
              isDark ? 'bg-yellow-600/20' : 'bg-yellow-100'
            }`}>
              <Clock className={`h-8 w-8 transition-colors duration-300 ${
                isDark ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>In Progress</p>
              <p className="text-3xl font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatusClick('resolved')}
          className={`rounded-lg shadow-lg border transition-all duration-300 hover-lift cursor-pointer ${
            isDark 
              ? `bg-slate-800 border-green-500/30 text-white ${selectedStatus === 'resolved' ? 'ring-2 ring-green-400 ring-opacity-50' : ''}` 
              : `bg-white border-gray-200 text-gray-900 ${selectedStatus === 'resolved' ? 'ring-2 ring-green-500 ring-opacity-30' : ''}`
          } p-6 animate-slideInUp stagger-3 hover:scale-105`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-all duration-300 ${
              isDark ? 'bg-green-600/20' : 'bg-green-100'
            }`}>
              <CheckCircle className={`h-8 w-8 transition-colors duration-300 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Resolved</p>
              <p className="text-3xl font-bold">{stats.resolved}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatusClick(null)}
          className={`rounded-lg shadow-lg border transition-all duration-300 hover-lift cursor-pointer ${
            isDark 
              ? `bg-slate-800 border-blue-500/30 text-white ${selectedStatus === null ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}` 
              : `bg-white border-gray-200 text-gray-900 ${selectedStatus === null ? 'ring-2 ring-blue-500 ring-opacity-30' : ''}`
          } p-6 animate-slideInUp stagger-4 hover:scale-105`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-all duration-300 ${
              isDark ? 'bg-blue-600/20' : 'bg-blue-100'
            }`}>
              <TrendingUp className={`h-8 w-8 transition-colors duration-300 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Issues</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Issues */}
      <div className={`rounded-lg shadow-lg border transition-all duration-300 ${
        isDark 
          ? 'bg-slate-800 border-purple-500/30' 
          : 'bg-white border-gray-200'
      } animate-slideInUp stagger-5`}>
        <div className={`px-6 py-4 border-b transition-colors duration-300 ${
          isDark ? 'border-purple-600/30' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{getStatusLabel(selectedStatus)}</h2>
            {selectedStatus && (
              <button
                onClick={() => setSelectedStatus(null)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors duration-300 ${
                  isDark 
                    ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300'
                }`}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
        
        <div className={`divide-y transition-colors duration-300 ${
          isDark ? 'divide-purple-600/30' : 'divide-gray-200'
        }`}>
          {filteredIssues.length > 0 ? (
            filteredIssues.slice(0, 10).map((issue, index) => (
              <div key={issue.id} className={`px-6 py-4 transition-all duration-300 hover:scale-[1.02] ${
                isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
              } animate-fadeIn`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl animate-bounceIn" style={{ animationDelay: `${index * 0.2}s` }}>
                      {getCategoryIcon(issue.category)}
                    </span>
                    <div>
                      <h3 className={`text-lg font-medium transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{getCategoryLabel(issue.category) || 'Unknown Category'}</h3>
                      {issue.subcategory && (
                        <p className={`text-sm font-medium transition-colors duration-300 ${
                          isDark ? 'text-blue-300' : 'text-blue-600'
                        }`}>{issue.subcategory}</p>
                      )}
                      <p className={`text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>{issue.area || 'Unknown area'} • {issue.createdAt ? new Date(issue.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-300 ${getStatusColor(issue.status)}`}>
                      {getStatusIcon(issue.status)}
                      <span className="ml-1 capitalize">{issue.status || 'pending'}</span>
                    </span>
                    
                    <div className={`flex items-center space-x-3 text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {issue.upvotes || 0}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {issue.comments ? issue.comments.length : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <div className={`text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                {selectedStatus ? '🔍' : '📋'}
              </div>
              <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {selectedStatus ? `No ${selectedStatus} issues found` : 'No issues reported yet'}
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {selectedStatus ? 'Try selecting a different status or report a new issue!' : 'Start by reporting your first civic issue!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className={`text-white rounded-lg p-8 text-center transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 shadow-2xl shadow-green-500/25' 
          : 'bg-gradient-to-r from-green-500 to-blue-500 shadow-xl'
      } animate-fadeIn`}>
        <h2 className="text-3xl font-bold mb-4 animate-slideInUp">Ready to Make a Difference? 🚀</h2>
        <p className="text-xl mb-6 animate-slideInUp stagger-1">Report your first civic issue and help improve your city!</p>
        <button
          onClick={() => navigate('/report')}
          className={`inline-flex items-center px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 hover-lift hover-glow ${
            isDark 
              ? 'bg-white text-green-600 hover:bg-gray-100 shadow-lg' 
              : 'bg-white text-green-600 hover:bg-gray-100'
          }`}
        >
          <Plus className="h-6 w-6 mr-2" />
          Report Your First Issue
        </button>
      </div>

      {/* Quick Tips */}
      <div className={`border rounded-lg p-6 transition-all duration-300 ${
        isDark 
          ? 'bg-slate-800/50 border-purple-500/30' 
          : 'bg-blue-50 border-blue-200'
      } animate-fadeIn`}>
        <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
          isDark ? 'text-purple-300' : 'text-blue-900'
        }`}>💡 Quick Tips for Reporting Issues</h3>
        <ul className={`space-y-3 text-lg transition-colors duration-300 ${
          isDark ? 'text-purple-200' : 'text-blue-800'
        }`}>
          <li className="animate-slideInLeft stagger-1">• 📸 Take clear photos of the issue for better understanding</li>
          <li className="animate-slideInLeft stagger-2">• 📍 Provide specific location details to help authorities</li>
          <li className="animate-slideInLeft stagger-3">• ✍️ Use descriptive titles to categorize issues properly</li>
          <li className="animate-slideInLeft stagger-4">• 🔄 Check back regularly for status updates</li>
          <li className="animate-slideInLeft stagger-5">• ⭐ Upvote other important issues in your area</li>
        </ul>
      </div>
    </div>
  )
}

export default CitizenDashboard
