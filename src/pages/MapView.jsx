import React, { useState } from 'react'
import { MapPin, Filter, Layers, Search, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react'
import { useIssues } from '../contexts/IssueContext'
import { useNavigate } from 'react-router-dom'
import MapComponent from '../components/MapComponent'

function MapView() {
  const navigate = useNavigate()
  const { issues, filters, setFilters } = useIssues()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filterOptions = [
    { value: 'all', label: 'All Issues', icon: '��' },
    { value: 'pending', label: 'Pending', icon: '🔴' },
    { value: 'in-progress', label: 'In Progress', icon: '🟡' },
    { value: 'resolved', label: 'Resolved', icon: '🟢' }
  ]

  const categories = [
    { value: 'roads-transport', label: '🛣️ Roads & Infrastructure', icon: '🛣️' },
    { value: 'waste-management', label: '🗑️ Waste Management', icon: '🗑️' },
    { value: 'water-drainage', label: '💧 Water & Drainage', icon: '💧' },
    { value: 'electricity-lighting', label: '💡 Electricity & Utilities', icon: '💡' },
    { value: 'environment-parks', label: '🌳 Environment & Green Spaces', icon: '🌳' },
    { value: 'public-safety-others', label: '🚨 Public Safety & Law Enforcement', icon: '🚨' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800 border-red-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const filteredIssues = issues.filter(issue => {
    const matchesFilter = selectedFilter === 'all' || issue.status === selectedFilter
    const matchesSearch = issue.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleMarkerClick = (issue) => {
    navigate(`/issues/${issue.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Map View 🗺️</h1>
        <p className="text-xl mt-2">Visualize civic issues across your city</p>
        <p className="text-green-100 mt-1">See where problems are and track their resolution</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by area or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedFilter === filter.value
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">City Issue Map</h2>
              <p className="text-gray-600">Interactive map showing all reported civic issues</p>
            </div>
            <button
              onClick={() => navigate('/report')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </button>
          </div>
        </div>
        
        {/* Map Component */}
        <MapComponent
          issues={filteredIssues}
          center={[19.0760, 72.8777]}
          zoom={13}
          height="400px"
          showMarkers={true}
          onMarkerClick={handleMarkerClick}
          className="w-full"
        />
      </div>

      {/* Issue List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Issues in View</h2>
          <p className="text-gray-600">{filteredIssues.length} issues found</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <div key={issue.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {categories.find(cat => cat.value === issue.category)?.label || 'Unknown Category'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                        {getStatusIcon(issue.status)}
                        <span className="ml-1 capitalize">{issue.status || 'pending'}</span>
                      </span>
                    </div>
                    {issue.subcategory && (
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        {issue.subcategory}
                      </p>
                    )}
                    <p className="text-gray-600 mb-2">{issue.description || 'No description available'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📍 {issue.area || 'Unknown area'}</span>
                      <span>👍 {issue.upvotes || 0} upvotes</span>
                      {issue.coordinates && (
                        <span>🗺️ {issue.coordinates.lat.toFixed(4)}, {issue.coordinates.lng.toFixed(4)}</span>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No issues found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Legend */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Map Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Pending Issues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Resolved</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <div key={cat.value} className="flex items-center gap-2 text-sm text-gray-600">
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Need to Report an Issue? 🚨</h2>
        <p className="text-xl mb-6">Help improve your city by reporting problems you see</p>
        <button 
          onClick={() => navigate('/report')}
          className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors"
        >
          <MapPin className="h-5 w-5 mr-2" />
          Report New Issue
        </button>
      </div>
    </div>
  )
}

export default MapView
