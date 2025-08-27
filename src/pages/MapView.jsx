import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Filter, Layers, Search, AlertTriangle, CheckCircle, Clock, Plus, Navigation } from 'lucide-react'
import { useIssues } from '../contexts/IssueContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import MapComponent from '../components/MapComponent'

function MapView() {
  const navigate = useNavigate()
  const { issues, filters, setFilters } = useIssues()
  const { user } = useAuth()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState(null)
  const mapRef = useRef(null)

  const filterOptions = [
    { value: 'all', label: 'All Issues', icon: '🔵' },
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

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (coord1, coord2) => {
    const [lat1, lon1] = coord1
    const [lat2, lon2] = coord2
    
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    
    return distance
  }

  const filteredIssues = issues.filter(issue => {
    // If admin, restrict to their municipalCode
    if (user?.role === 'admin' && user?.municipalCode) {
      if (issue.municipalCode !== user.municipalCode) return false
    }
    const matchesFilter = selectedFilter === 'all' || issue.status === selectedFilter
    const matchesSearch = issue.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  }).sort((a, b) => {
    // Sort by distance if user location is available
    if (currentLocation && a.coordinates && b.coordinates) {
      const distanceA = calculateDistance(currentLocation, [a.coordinates.lat, a.coordinates.lng])
      const distanceB = calculateDistance(currentLocation, [b.coordinates.lat, b.coordinates.lng])
      return distanceA - distanceB
    }
    // Otherwise sort by date (newest first)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  // Get user's current location when component mounts
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        setLocationLoading(true)
        setLocationError(null)
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setCurrentLocation([latitude, longitude])
            setLocationLoading(false)
          },
          (error) => {
            console.error('Error getting location:', error)
            setLocationError('Unable to get your location. Using default location.')
            // Fallback to Mumbai coordinates if location access is denied
            setCurrentLocation([19.0760, 72.8777])
            setLocationLoading(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      } else {
        setLocationError('Geolocation is not supported by this browser.')
        setCurrentLocation([19.0760, 72.8777])
        setLocationLoading(false)
      }
    }

    getCurrentLocation()
  }, [])

  const handleMarkerClick = (issue) => {
    navigate(`/issues/${issue.id}`)
  }

  const handleRefreshLocation = () => {
    setLocationLoading(true)
    setLocationError(null)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation([latitude, longitude])
          setLocationLoading(false)
        },
        (error) => {
          console.error('Error refreshing location:', error)
          setLocationError('Unable to refresh location.')
          setLocationLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Location Permission Notice */}
      {!currentLocation && !locationLoading && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Navigation className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Enable Location Access</strong> to see issues near your current location.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Click the refresh button in the controls above to try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Location Success Notice */}
      {currentLocation && !locationLoading && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Navigation className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>Location Found!</strong> The map is now centered on your current location.
              </p>
              <p className="text-xs text-green-600 mt-1">
                You can see issues near you and report new ones in your area.
              </p>
            </div>
          </div>
        </div>
      )}

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

          {/* Location Status */}
          <div className="flex items-center gap-3">
            {locationLoading ? (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Getting location...</span>
              </div>
            ) : currentLocation ? (
              <div className="flex items-center gap-2 text-green-600">
                <Navigation className="h-4 w-4" />
                <span className="text-sm">
                  📍 {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
                </span>
                <button
                  onClick={handleRefreshLocation}
                  className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  title="Refresh location"
                >
                  🔄
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <Navigation className="h-4 w-4" />
                <span className="text-sm">Location unavailable</span>
              </div>
            )}
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
            <div className="flex gap-2">
              {currentLocation && (
                <button
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.setView(currentLocation, 15)
                    }
                  }}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  title="Center on my location"
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  My Location
                </button>
              )}
              {/* Hide report button for admins */}
              {user?.role !== 'admin' && (
                <button
                  onClick={() => navigate('/report')}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Location Error Message */}
        {locationError && (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <Navigation className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm">{locationError}</p>
                <p className="text-xs mt-1">The map will show Mumbai as the default location.</p>
              </div>
            </div>
          </div>
        )}

        {/* Map Component */}
        {locationLoading ? (
          <div className="h-[400px] bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Getting your location...</p>
              <p className="text-sm text-gray-500">Please allow location access to see issues near you</p>
            </div>
          </div>
        ) : (
          <MapComponent
            ref={mapRef}
            issues={filteredIssues}
            center={currentLocation || [19.0760, 72.8777]}
            zoom={currentLocation ? 15 : 13}
            height="400px"
            showMarkers={true}
            showCurrentLocation={!!currentLocation}
            onMarkerClick={handleMarkerClick}
            className="w-full"
          />
        )}
      </div>

      {/* Issue List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Issues in View</h2>
              <p className="text-gray-600">
                {filteredIssues.length} issues found
                {currentLocation && (
                  <span className="ml-2 text-blue-600">
                    • {filteredIssues.filter(issue => 
                      issue.coordinates && 
                      calculateDistance(currentLocation, [issue.coordinates.lat, issue.coordinates.lng]) <= 5
                    ).length} within 5km of you
                  </span>
                )}
              </p>
            </div>
            {currentLocation && (
              <div className="text-sm text-gray-500">
                📍 Your location: {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
              </div>
            )}
          </div>
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
                      {issue.coordinates && currentLocation && (
                        <span>📏 {calculateDistance(currentLocation, [issue.coordinates.lat, issue.coordinates.lng]).toFixed(1)} km away</span>
                      )}
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
      {user?.role !== 'admin' && (
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
      )}
    </div>
  )
}

export default MapView
