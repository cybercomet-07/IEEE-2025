import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapComponent = forwardRef(({ 
  issues = [], 
  center = [19.0760, 72.8777], 
  zoom = 13, 
  height = '400px',
  showMarkers = true,
  onMarkerClick,
  className = '',
  showCurrentLocation = false
}, ref) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // Expose map instance to parent component
  useImperativeHandle(ref, () => ({
    getMap: () => mapInstanceRef.current,
    setView: (center, zoom) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(center, zoom)
      }
    }
  }), [])

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      try {
        const map = L.map(mapRef.current).setView(center, zoom)
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map)

        mapInstanceRef.current = map
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (error) {
          console.error('Error removing map:', error)
        }
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update map view when center or zoom changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      try {
        mapInstanceRef.current.setView(center, zoom)
        
        // Add current location marker if enabled
        if (showCurrentLocation) {
          // Remove existing current location marker
          mapInstanceRef.current.eachLayer((layer) => {
            if (layer._currentLocationMarker) {
              mapInstanceRef.current.removeLayer(layer)
            }
          })
          
          // Add new current location marker
          const currentLocationIcon = L.divIcon({
            className: 'current-location-marker',
            html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px #3b82f6;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
          
          const currentLocationMarker = L.marker(center, { icon: currentLocationIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('<div class="p-2"><strong>📍 Your Location</strong><br>You are here</div>')
          
          // Mark this as current location marker
          currentLocationMarker._currentLocationMarker = true
        }
      } catch (error) {
        console.error('Error updating map view:', error)
      }
    }
  }, [center, zoom, showCurrentLocation])

  // Update map markers when issues change
  useEffect(() => {
    if (mapInstanceRef.current && showMarkers && issues.length > 0) {
      try {
        // Clear existing markers
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker && !layer._currentLocationMarker) {
            mapInstanceRef.current.removeLayer(layer)
          }
        })

        // Add new markers
        issues.forEach((issue) => {
          if (issue.coordinates && issue.coordinates.lat && issue.coordinates.lng) {
            const markerColor = getMarkerColor(issue.status)
            const customIcon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })

            const marker = L.marker([issue.coordinates.lat, issue.coordinates.lng], { icon: customIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup(createPopupContent(issue))

            if (onMarkerClick) {
              marker.on('click', () => onMarkerClick(issue))
            }
          }
        })
      } catch (error) {
        console.error('Error updating markers:', error)
      }
    }
  }, [issues, showMarkers, onMarkerClick])

  const getMarkerColor = (status) => {
    switch (status) {
      case 'pending': return '#ef4444' // red
      case 'in-progress': return '#f59e0b' // yellow
      case 'resolved': return '#10b981' // green
      default: return '#6b7280' // gray
    }
  }

  const createPopupContent = (issue) => {
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

    return `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${getCategoryLabel(issue.category) || 'Unknown Category'}</h3>
        ${issue.subcategory ? `<p class="text-blue-600 text-sm font-medium mb-2">${issue.subcategory}</p>` : ''}
        <p class="text-gray-600 mb-2">${issue.description || 'No description'}</p>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>📍 ${issue.area || 'Unknown area'}</span>
          <span>👍 ${issue.upvotes || 0}</span>
        </div>
        <div class="mt-2">
          <span class="inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(issue.status)}">
            ${issue.status || 'pending'}
          </span>
        </div>
      </div>
    `
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div 
      ref={mapRef}
      className={`w-full ${className}`}
      style={{ height }}
    />
  )
})

export default MapComponent
