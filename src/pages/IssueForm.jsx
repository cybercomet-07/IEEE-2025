import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIssues } from '../contexts/IssueContext'
import { useAuth } from '../contexts/AuthContext'
import AISeverityPredictor from '../components/AISeverityPredictor'
import CommunityImpactTracker from '../components/CommunityImpactTracker'
import SmartRouteOptimizer from '../components/SmartRouteOptimizer'
import WeatherIntegration from '../components/WeatherIntegration'
import { sendIssueConfirmationWhatsApp, sendIssueAlertToAuthorities } from '../services/twilio'
import { getMunicipalCodeByName } from '../utils/municipalCorporations'
import { 
  Camera, 
  MapPin, 
  Upload, 
  X, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Send,
  Mic,
  MicOff
} from 'lucide-react'

function IssueForm() {
  const navigate = useNavigate()
  const { addIssue, loading } = useIssues()
  const { user } = useAuth()
  
  // Add error boundary state
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    subcategory: '',
    municipalCorp: '',
    municipalCode: '',
    area: '',
    address: '',
    coordinates: null,
    whatsappNumber: ''
  })
  const [media, setMedia] = useState([])
  const [errors, setErrors] = useState({})
  const [predictedSeverity, setPredictedSeverity] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [locationStatus, setLocationStatus] = useState(null)

  // Voice-to-text state
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState(null)

  // Cleanup effect for speech recognition
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [recognition])

  // Keyboard event handling for voice recording
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isListening) {
        stopListening()
      }
    }

    if (isListening) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isListening])

  const categories = [
    {
      value: 'roads-transport',
      label: '🛣️ Roads & Infrastructure',
      icon: '🛣️',
      subcategories: [
        'Potholes or road damage',
        'Broken or missing streetlights',
        'Damaged or uneven footpaths',
        'Broken traffic signals',
        'Faded or missing road markings',
        'Damaged bridges or flyovers',
        'Poor road drainage / waterlogging',
        'Other'
      ]
    },
    {
      value: 'water-drainage',
      label: '💧 Water & Drainage',
      icon: '💧',
      subcategories: [
        'Leaking water pipelines',
        'Blocked or clogged drains',
        'Water contamination (smell, color, or taste)',
        'Low water pressure / no water supply',
        'Overflowing manholes',
        'Illegal water connections',
        'Stormwater drain blockage'
      ]
    },
    {
      value: 'waste-management',
      label: '🗑️ Waste Management',
      icon: '🗑️',
      subcategories: [
        'Garbage bin overflow',
        'Illegal dumping of waste',
        'Delay in garbage collection',
        'Dead animal carcass removal',
        'Improper disposal of medical waste',
        'Burning of garbage causing air pollution'
      ]
    },
    {
      value: 'public-safety-others',
      label: '🚨 Public Safety & Law Enforcement',
      icon: '🚨',
      subcategories: [
        'Traffic signal violations',
        'Illegal parking blocking public space',
        'Rash driving or overspeeding zones',
        'Unsafe or poorly lit public areas',
        'Suspicious or anti-social activities',
        'Encroachment on public property',
        'Broken CCTV cameras in public areas'
      ]
    },
    {
      value: 'environment-parks',
      label: '🌳 Environment & Green Spaces',
      icon: '🌳',
      subcategories: [
        'Unauthorized tree cutting',
        'Poor maintenance of public parks',
        'Damaged park benches/play equipment',
        'Encroachment into green spaces',
        'Lack of greenery / tree plantation requests',
        'Uncontrolled stray animals in parks'
      ]
    },
    {
      value: 'electricity-lighting',
      label: '💡 Electricity & Utilities',
      icon: '💡',
      subcategories: [
        'Power outages / frequent load shedding',
        'Exposed or hanging electrical wires',
        'Damaged electric poles or transformers',
        'Faulty public charging points',
        'Streetlights not working',
        'Voltage fluctuation issues'
      ]
    }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Reset subcategory when category changes
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        subcategory: ''
      }))
    }
    
    // If municipal corporation is selected, automatically set the municipal code
    if (name === 'municipalCorp' && value) {
      const municipalCode = getMunicipalCodeByName(value)
      setFormData(prev => ({
        ...prev,
        municipalCode: municipalCode || ''
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Voice-to-text functions
  const startListening = () => {
    try {
      // Check if browser supports speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
        return
      }

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'

      recognitionInstance.onstart = () => {
        setIsListening(true)
        setTranscript('')
        console.log('Voice recognition started')
      }

      recognitionInstance.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript + interimTranscript)
      }

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        
        let errorMessage = 'Voice recognition error occurred.'
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.'
            break
          case 'audio-capture':
            errorMessage = 'Microphone access denied. Please allow microphone access.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.'
            break
          case 'aborted':
            errorMessage = 'Voice recognition was aborted.'
            break
          case 'service-not-allowed':
            errorMessage = 'Voice recognition service not allowed. Please try again.'
            break
          default:
            errorMessage = `Voice recognition error: ${event.error}`
        }
        
        // Show error as toast instead of alert for better UX
        toast.error(errorMessage)
        
        // Clear any partial transcript
        setTranscript('')
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
        console.log('Voice recognition ended')
        
        // Don't automatically add transcript - let user decide
        // The transcript will remain visible for manual addition
      }

      setRecognition(recognitionInstance)
      recognitionInstance.start()
      
    } catch (error) {
      console.error('Error starting voice recognition:', error)
      alert('Failed to start voice recognition. Please try again.')
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const clearTranscript = () => {
    setTranscript('')
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }))
    setMedia(prev => [...prev, ...newMedia])
  }

  const removeMedia = (id) => {
    setMedia(prev => prev.filter(item => item.id !== id))
  }

  const clearLocation = () => {
    setFormData(prev => ({
      ...prev,
      coordinates: null,
      address: '',
      area: ''
    }))
    setLocationStatus(null)
  }



  const getCurrentLocation = () => {
    try {
      console.log('getCurrentLocation called')
      setHasError(false) // Clear any previous errors
      
      if (navigator.geolocation) {
        console.log('Geolocation supported')
        // Show loading state
        setLocationStatus({ type: 'loading', message: '🔍 Getting your current location...' })
        const button = document.getElementById('location-button');
        const buttonText = document.getElementById('location-button-text');
        if (button && buttonText) {
          button.disabled = true;
          buttonText.textContent = 'Getting Location...';
        }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          // For now, just use coordinates without reverse geocoding to avoid API issues
          try {
            setFormData(prev => ({
              ...prev,
              coordinates: { lat, lng },
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              area: 'Current Location'
            }))
            
            setLocationStatus({ 
              type: 'success', 
              message: `✅ Location captured successfully! Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)} | Area: Current Location` 
            })
            
            // Reset button
            if (button && buttonText) {
              button.disabled = false;
              buttonText.textContent = 'Use Current Location';
            }
          } catch (error) {
            console.error('Error setting location data:', error)
            setLocationStatus({ 
              type: 'error', 
              message: '❌ Error saving location data. Please try again.' 
            })
            
            // Reset button
            if (button && buttonText) {
              button.disabled = false;
              buttonText.textContent = 'Use Current Location';
            }
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          let errorMessage = 'Unable to get your current location. Please enter the address manually.'
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '❌ Location access denied. Please allow location access in your browser settings or enter address manually.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = '❌ Location information unavailable. Please enter address manually.'
              break
            case error.TIMEOUT:
              errorMessage = '⏰ Location request timed out. Please try again or enter address manually.'
              break
          }
          
          setLocationStatus({ type: 'error', message: errorMessage })
          
          // Reset button
          if (button && buttonText) {
            button.disabled = false;
            buttonText.textContent = 'Use Current Location';
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
              )
      } else {
        setLocationStatus({ 
          type: 'error', 
          message: '❌ Geolocation is not supported by this browser. Please enter the address manually.' 
        })
      }
    } catch (error) {
      console.error('Unexpected error in getCurrentLocation:', error)
      setHasError(true)
      setErrorMessage(`Location error: ${error.message}`)
      
      setLocationStatus({ 
        type: 'error', 
        message: '❌ Unexpected error occurred. Please try again or enter address manually.' 
      })
      
      // Reset button
      const button = document.getElementById('location-button');
      const buttonText = document.getElementById('location-button-text');
      if (button && buttonText) {
        button.disabled = false;
        buttonText.textContent = 'Use Current Location';
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    if (!formData.subcategory) {
      newErrors.subcategory = 'Subcategory is required'
    }
    
    if (!formData.municipalCorp) {
      newErrors.municipalCorp = 'Municipal Corporation is required'
    }
    
    if (!formData.municipalCode) {
      newErrors.municipalCode = 'Municipal Code is required'
    }
    
    if (!formData.area.trim()) {
      newErrors.area = 'Area is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!user) {
      alert('Please log in to report an issue')
      return
    }

    try {
      const issueData = {
        ...formData,
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        media: media,
        status: 'pending',
        upvotes: 0,
        comments: []
      }

      // Debug: Log the issue data being sent
      console.log('📋 Issue Data being sent:', issueData)
      console.log('📍 Location fields:', { area: formData.area, address: formData.address })
      console.log('👤 User info:', { userName: user.displayName, userEmail: user.email })
      
      // Submit the issue first
      const submittedIssue = await addIssue(issueData)
      
      // Send WhatsApp confirmation to user (if WhatsApp number provided)
      if (formData.whatsappNumber && formData.whatsappNumber.trim()) {
        try {
          const whatsappResult = await sendIssueConfirmationWhatsApp(issueData, {
            displayName: user.displayName,
            email: user.email,
            phoneNumber: formData.whatsappNumber.trim()
          })
          
          if (whatsappResult.success) {
            // Show success message with WhatsApp confirmation
            alert(`✅ ${whatsappResult.message}\n\n📱 WhatsApp confirmation sent to ${formData.whatsappNumber}!`)
          } else {
            // Show success message without WhatsApp
            alert(`✅ Issue submitted successfully!\n\n⚠️ ${whatsappResult.message}`)
          }
        } catch (whatsappError) {
          console.error('WhatsApp error:', whatsappError)
          // Issue submitted but WhatsApp failed
          alert('✅ Issue submitted successfully!\n\n⚠️ WhatsApp notification failed, but you will receive email confirmation.')
        }
      } else {
        // No WhatsApp number provided
        alert('✅ Issue submitted successfully!\n\n📧 You will receive email confirmation only.')
      }

      // Send alert to municipal authorities (optional)
      try {
        await sendIssueAlertToAuthorities(issueData)
        console.log('🚨 Alert sent to municipal authorities')
      } catch (alertError) {
        console.error('Failed to send alert to authorities:', alertError)
        // Don't block the user flow if this fails
      }

      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Error submitting issue:', error)
      alert('Failed to submit issue. Please try again.')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Report a Civic Issue 🏙️</h1>
        <p className="text-xl mt-2">Help make your city better by reporting problems that need attention</p>
        

      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        {/* Error Display */}
        {hasError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">❌</span>
              <p className="text-red-700 font-medium">Something went wrong:</p>
            </div>
            <p className="text-red-600 mt-1">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setHasError(false)}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Issue Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      📂 Category *
                    </span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      🏷️ Subcategory *
                    </span>
                  </label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    disabled={!formData.category}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.subcategory ? 'border-red-500' : 'border-gray-300'
                    } ${!formData.category ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">{formData.category ? 'Select a subcategory' : 'Please select a category first'}</option>
                    {formData.category && categories.find(cat => cat.value === formData.category)?.subcategories.map((subcat, index) => (
                      <option key={index} value={subcat}>
                        {subcat}
                      </option>
                    ))}
                  </select>
                  {errors.subcategory && (
                    <p className="mt-1 text-sm text-red-600">{errors.subcategory}</p>
                  )}
                  {!errors.subcategory && formData.category && (
                    <p className="mt-1 text-xs text-gray-500">
                      Choose the most specific type of issue for better routing to the right department
                    </p>
                  )}
                </div>
              </div>

              {/* Municipal Corporation Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    🏛️ Municipal Corporation *
                  </span>
                </label>
                <select
                  name="municipalCorp"
                  value={formData.municipalCorp}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.municipalCorp ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your Municipal Corporation</option>
                  <option value="Abohar Municipal Corporation">Abohar Municipal Corporation</option>
                  <option value="Adityapur Municipal Corporation">Adityapur Municipal Corporation</option>
                  <option value="Agartala Municipal Corporation">Agartala Municipal Corporation</option>
                  <option value="Agra Municipal Corporation">Agra Municipal Corporation</option>
                  <option value="Ahmedabad Municipal Corporation">Ahmedabad Municipal Corporation</option>
                  <option value="Ahmednagar Municipal Corporation">Ahmednagar Municipal Corporation</option>
                  <option value="Aizawl Municipal Corporation">Aizawl Municipal Corporation</option>
                  <option value="Ajmer Municipal Corporation">Ajmer Municipal Corporation</option>
                  <option value="Akola Municipal Corporation">Akola Municipal Corporation</option>
                  <option value="Aligarh Municipal Corporation">Aligarh Municipal Corporation</option>
                  <option value="Alwar Municipal Corporation">Alwar Municipal Corporation</option>
                  <option value="Ambala Municipal Corporation">Ambala Municipal Corporation</option>
                  <option value="Ambikapur Municipal Corporation">Ambikapur Municipal Corporation</option>
                  <option value="Amravati Municipal Corporation">Amravati Municipal Corporation</option>
                  <option value="Amritsar Municipal Corporation">Amritsar Municipal Corporation</option>
                  <option value="Anantapur Municipal Corporation">Anantapur Municipal Corporation</option>
                  <option value="Anuppur Nagar Nigam">Anuppur Nagar Nigam</option>
                  <option value="Arrah Municipal Corporation">Arrah Municipal Corporation</option>
                  <option value="Asansol Municipal Corporation">Asansol Municipal Corporation</option>
                  <option value="Ashoknagar Nagar Nigam">Ashoknagar Nagar Nigam</option>
                  <option value="Aurangabad Municipal Corporation">Aurangabad Municipal Corporation</option>
                  <option value="Avadi Municipal Corporation">Avadi Municipal Corporation</option>
                  <option value="Ayodhya Municipal Corporation">Ayodhya Municipal Corporation</option>
                  <option value="Badangpet Municipal Corporation">Badangpet Municipal Corporation</option>
                  <option value="Baddi Municipal Corporation">Baddi Municipal Corporation</option>
                  <option value="Ballari Municipal Corporation">Ballari Municipal Corporation</option>
                  <option value="Bandlaguda Jagir Municipal Corporation">Bandlaguda Jagir Municipal Corporation</option>
                  <option value="Bareilly Municipal Corporation">Bareilly Municipal Corporation</option>
                  <option value="Batala Municipal Corporation">Batala Municipal Corporation</option>
                  <option value="Bathinda Municipal Corporation">Bathinda Municipal Corporation</option>
                  <option value="Begusarai Municipal Corporation">Begusarai Municipal Corporation</option>
                  <option value="Belagavi Municipal Corporation">Belagavi Municipal Corporation</option>
                  <option value="Berhampur Municipal Corporation">Berhampur Municipal Corporation</option>
                  <option value="Betul Nagar Nigam">Betul Nagar Nigam</option>
                  <option value="Bhagalpur Municipal Corporation">Bhagalpur Municipal Corporation</option>
                  <option value="Bharatpur Municipal Corporation">Bharatpur Municipal Corporation</option>
                  <option value="Bhavnagar Municipal Corporation">Bhavnagar Municipal Corporation</option>
                  <option value="Bhilai Charoda Municipal Corporation">Bhilai Charoda Municipal Corporation</option>
                  <option value="Bhilai Municipal Corporation">Bhilai Municipal Corporation</option>
                  <option value="Bhind Nagar Nigam">Bhind Nagar Nigam</option>
                  <option value="Bhiwandi-Nizampur Municipal Corporation">Bhiwandi-Nizampur Municipal Corporation</option>
                  <option value="Bhopal Nagar Nigam">Bhopal Nagar Nigam</option>
                  <option value="Bhubaneswar Municipal Corporation">Bhubaneswar Municipal Corporation</option>
                  <option value="Bidhannagar Municipal Corporation">Bidhannagar Municipal Corporation</option>
                  <option value="Bihar Sharif Municipal Corporation">Bihar Sharif Municipal Corporation</option>
                  <option value="Bikaner Municipal Corporation">Bikaner Municipal Corporation</option>
                  <option value="Birgaon Municipal Corporation">Birgaon Municipal Corporation</option>
                  <option value="Boduppal Municipal Corporation">Boduppal Municipal Corporation</option>
                  <option value="Brihanmumbai Municipal Corporation">Brihanmumbai Municipal Corporation</option>
                  <option value="Bruhat Bengaluru Mahanagara Palike (BBMP)">Bruhat Bengaluru Mahanagara Palike (BBMP)</option>
                  <option value="Burhanpur Nagar Nigam">Burhanpur Nagar Nigam</option>
                  <option value="Chandernagore Municipal Corporation">Chandernagore Municipal Corporation</option>
                  <option value="Chandigarh Municipal Corporation">Chandigarh Municipal Corporation</option>
                  <option value="Chandrapur City Municipal Corporation">Chandrapur City Municipal Corporation</option>
                  <option value="Chas Municipal Corporation">Chas Municipal Corporation</option>
                  <option value="Chhindwara Nagar Nigam">Chhindwara Nagar Nigam</option>
                  <option value="Chirmiri Municipal Corporation">Chirmiri Municipal Corporation</option>
                  <option value="Chittoor Municipal Corporation">Chittoor Municipal Corporation</option>
                  <option value="Coimbatore Municipal Corporation">Coimbatore Municipal Corporation</option>
                  <option value="Corporation of the City of Panaji">Corporation of the City of Panaji</option>
                  <option value="Cuddalore Municipal Corporation">Cuddalore Municipal Corporation</option>
                  <option value="Cuttack Municipal Corporation">Cuttack Municipal Corporation</option>
                  <option value="Darbhanga Municipal Corporation">Darbhanga Municipal Corporation</option>
                  <option value="Datia Nagar Nigam">Datia Nagar Nigam</option>
                  <option value="Davangere Municipal Corporation">Davangere Municipal Corporation</option>
                  <option value="Dehradun Municipal Corporation">Dehradun Municipal Corporation</option>
                  <option value="Deoghar Municipal Corporation">Deoghar Municipal Corporation</option>
                  <option value="Dewas Nagar Nigam">Dewas Nagar Nigam</option>
                  <option value="Dhamtari Municipal Corporation">Dhamtari Municipal Corporation</option>
                  <option value="Dharamshala Municipal Corporation">Dharamshala Municipal Corporation</option>
                  <option value="Dhule Municipal Corporation">Dhule Municipal Corporation</option>
                  <option value="Dimapur Municipal Council">Dimapur Municipal Council</option>
                  <option value="Dindigul Municipal Corporation">Dindigul Municipal Corporation</option>
                  <option value="Durg Municipal Corporation">Durg Municipal Corporation</option>
                  <option value="Durgapur Municipal Corporation">Durgapur Municipal Corporation</option>
                  <option value="Eluru Municipal Corporation">Eluru Municipal Corporation</option>
                  <option value="Erode Municipal Corporation">Erode Municipal Corporation</option>
                  <option value="Faridabad Municipal Corporation">Faridabad Municipal Corporation</option>
                  <option value="Firozabad Municipal Corporation">Firozabad Municipal Corporation</option>
                  <option value="Gandhinagar Municipal Corporation">Gandhinagar Municipal Corporation</option>
                  <option value="Gangtok Municipal Corporation">Gangtok Municipal Corporation</option>
                  <option value="Gaya Municipal Corporation">Gaya Municipal Corporation</option>
                  <option value="Ghaziabad Municipal Corporation">Ghaziabad Municipal Corporation</option>
                  <option value="Giridih Municipal Corporation">Giridih Municipal Corporation</option>
                  <option value="Gorakhpur Municipal Corporation">Gorakhpur Municipal Corporation</option>
                  <option value="Greater Chennai Corporation">Greater Chennai Corporation</option>
                  <option value="Greater Hyderabad Municipal Corporation (GHMC)">Greater Hyderabad Municipal Corporation (GHMC)</option>
                  <option value="Greater Warangal Municipal Corporation (GWMC)">Greater Warangal Municipal Corporation (GWMC)</option>
                  <option value="Guna Nagar Nigam">Guna Nagar Nigam</option>
                  <option value="Guntur Municipal Corporation">Guntur Municipal Corporation</option>
                  <option value="Gurugram (Gurgaon) Municipal Corporation">Gurugram (Gurgaon) Municipal Corporation</option>
                  <option value="Guwahati Municipal Corporation">Guwahati Municipal Corporation</option>
                  <option value="Gwalior Nagar Nigam">Gwalior Nagar Nigam</option>
                  <option value="Haldwani Municipal Corporation">Haldwani Municipal Corporation</option>
                  <option value="Hamirpur Municipal Corporation">Hamirpur Municipal Corporation</option>
                  <option value="Harda Nagar Nigam">Harda Nagar Nigam</option>
                  <option value="Haridwar Municipal Corporation">Haridwar Municipal Corporation</option>
                  <option value="Hazaribagh Municipal Corporation">Hazaribagh Municipal Corporation</option>
                  <option value="Hisar Municipal Corporation">Hisar Municipal Corporation</option>
                  <option value="Hoshangabad Nagar Nigam">Hoshangabad Nagar Nigam</option>
                  <option value="Hoshiarpur Municipal Corporation">Hoshiarpur Municipal Corporation</option>
                  <option value="Hosur Municipal Corporation">Hosur Municipal Corporation</option>
                  <option value="Howrah Municipal Corporation">Howrah Municipal Corporation</option>
                  <option value="Hubli-Dharwad Municipal Corporation">Hubli-Dharwad Municipal Corporation</option>
                  <option value="Ichalkaranji Municipal Corporation">Ichalkaranji Municipal Corporation</option>
                  <option value="Imphal Municipal Corporation">Imphal Municipal Corporation</option>
                  <option value="Indore Nagar Nigam">Indore Nagar Nigam</option>
                  <option value="Itanagar Municipal Corporation">Itanagar Municipal Corporation</option>
                  <option value="Jabalpur Nagar Nigam">Jabalpur Nagar Nigam</option>
                  <option value="Jagdalpur Municipal Corporation">Jagdalpur Municipal Corporation</option>
                  <option value="Jaipur Municipal Corporation Greater">Jaipur Municipal Corporation Greater</option>
                  <option value="Jaipur Municipal Corporation Heritage">Jaipur Municipal Corporation Heritage</option>
                  <option value="Jalandhar Municipal Corporation">Jalandhar Municipal Corporation</option>
                  <option value="Jalgaon City Municipal Corporation">Jalgaon City Municipal Corporation</option>
                  <option value="Jalna Municipal Corporation">Jalna Municipal Corporation</option>
                  <option value="Jamalpur Municipal Corporation">Jamalpur Municipal Corporation</option>
                  <option value="Jammu Municipal Corporation">Jammu Municipal Corporation</option>
                  <option value="Jamnagar Municipal Corporation">Jamnagar Municipal Corporation</option>
                  <option value="Jawaharnagar Municipal Corporation">Jawaharnagar Municipal Corporation</option>
                  <option value="Jhansi Municipal Corporation">Jhansi Municipal Corporation</option>
                  <option value="Jodhpur Municipal Corporation North">Jodhpur Municipal Corporation North</option>
                  <option value="Jodhpur Municipal Corporation South">Jodhpur Municipal Corporation South</option>
                  <option value="Junagadh Municipal Corporation">Junagadh Municipal Corporation</option>
                  <option value="Kadapa Municipal Corporation">Kadapa Municipal Corporation</option>
                  <option value="Kakinada Municipal Corporation">Kakinada Municipal Corporation</option>
                  <option value="Kalaburagi Municipal Corporation">Kalaburagi Municipal Corporation</option>
                  <option value="Kalyan-Dombivli Municipal Corporation">Kalyan-Dombivli Municipal Corporation</option>
                  <option value="Kancheepuram Municipal Corporation">Kancheepuram Municipal Corporation</option>
                  <option value="Kannur Municipal Corporation">Kannur Municipal Corporation</option>
                  <option value="Kanpur Municipal Corporation">Kanpur Municipal Corporation</option>
                  <option value="Kapurthala Municipal Corporation">Kapurthala Municipal Corporation</option>
                  <option value="Karaikudi Municipal Corporation">Karaikudi Municipal Corporation</option>
                  <option value="Karimnagar Municipal Corporation">Karimnagar Municipal Corporation</option>
                  <option value="Karnal Municipal Corporation">Karnal Municipal Corporation</option>
                  <option value="Karur Municipal Corporation">Karur Municipal Corporation</option>
                  <option value="Kashipur Municipal Corporation">Kashipur Municipal Corporation</option>
                  <option value="Katihar Municipal Corporation">Katihar Municipal Corporation</option>
                  <option value="Katni Nagar Nigam">Katni Nagar Nigam</option>
                  <option value="Khammam Municipal Corporation">Khammam Municipal Corporation</option>
                  <option value="Khandwa Nagar Nigam">Khandwa Nagar Nigam</option>
                  <option value="Kochi Municipal Corporation">Kochi Municipal Corporation</option>
                  <option value="Kohima Municipal Council">Kohima Municipal Council</option>
                  <option value="Kolhapur Municipal Corporation">Kolhapur Municipal Corporation</option>
                  <option value="Kolkata Municipal Corporation">Kolkata Municipal Corporation</option>
                  <option value="Kollam Municipal Corporation">Kollam Municipal Corporation</option>
                  <option value="Korba Municipal Corporation">Korba Municipal Corporation</option>
                  <option value="Kota Municipal Corporation North">Kota Municipal Corporation North</option>
                  <option value="Kota Municipal Corporation South">Kota Municipal Corporation South</option>
                  <option value="Kotdwar Municipal Corporation">Kotdwar Municipal Corporation</option>
                  <option value="Kothagudem Municipal Corporation">Kothagudem Municipal Corporation</option>
                  <option value="Kozhikode Municipal Corporation">Kozhikode Municipal Corporation</option>
                  <option value="Kumbakonam Municipal Corporation">Kumbakonam Municipal Corporation</option>
                  <option value="Kurnool Municipal Corporation">Kurnool Municipal Corporation</option>
                  <option value="Latur City Municipal Corporation">Latur City Municipal Corporation</option>
                  <option value="Lucknow Municipal Corporation">Lucknow Municipal Corporation</option>
                  <option value="Ludhiana Municipal Corporation">Ludhiana Municipal Corporation</option>
                  <option value="Machilipatnam Municipal Corporation">Machilipatnam Municipal Corporation</option>
                  <option value="Madurai Municipal Corporation">Madurai Municipal Corporation</option>
                  <option value="Mahabubnagar Municipal Corporation">Mahabubnagar Municipal Corporation</option>
                  <option value="Malegaon Municipal Corporation">Malegaon Municipal Corporation</option>
                  <option value="Mancherial Municipal Corporation">Mancherial Municipal Corporation</option>
                  <option value="Mandi Municipal Corporation">Mandi Municipal Corporation</option>
                  <option value="Mandsaur Nagar Nigam">Mandsaur Nagar Nigam</option>
                  <option value="Manesar Municipal Corporation">Manesar Municipal Corporation</option>
                  <option value="Mangalagiri Tadepalli Municipal Corporation">Mangalagiri Tadepalli Municipal Corporation</option>
                  <option value="Mathura-Vrindavan Municipal Corporation">Mathura-Vrindavan Municipal Corporation</option>
                  <option value="Meerpet–Jillelguda Municipal Corporation">Meerpet–Jillelguda Municipal Corporation</option>
                  <option value="Meerut Municipal Corporation">Meerut Municipal Corporation</option>
                  <option value="Mira-Bhayandar Municipal Corporation">Mira-Bhayandar Municipal Corporation</option>
                  <option value="Moga Municipal Corporation">Moga Municipal Corporation</option>
                  <option value="Mohali Municipal Corporation">Mohali Municipal Corporation</option>
                  <option value="Mokokchung Municipal Council">Mokokchung Municipal Council</option>
                  <option value="Moradabad Municipal Corporation">Moradabad Municipal Corporation</option>
                  <option value="Morena Nagar Nigam">Morena Nagar Nigam</option>
                  <option value="Munger Municipal Corporation">Munger Municipal Corporation</option>
                  <option value="Municipal Corporation of Delhi">Municipal Corporation of Delhi</option>
                  <option value="Muzaffarpur Municipal Corporation">Muzaffarpur Municipal Corporation</option>
                  <option value="Nagercoil Municipal Corporation">Nagercoil Municipal Corporation</option>
                  <option value="Nagpur Municipal Corporation">Nagpur Municipal Corporation</option>
                  <option value="Namakkal Municipal Corporation">Namakkal Municipal Corporation</option>
                  <option value="Nanded-Waghala City Municipal Corporation">Nanded-Waghala City Municipal Corporation</option>
                  <option value="Nashik Municipal Corporation">Nashik Municipal Corporation</option>
                  <option value="Navi Mumbai Municipal Corporation">Navi Mumbai Municipal Corporation</option>
                  <option value="Nellore Municipal Corporation">Nellore Municipal Corporation</option>
                  <option value="Nizamabad Municipal Corporation">Nizamabad Municipal Corporation</option>
                  <option value="Nizampet Municipal Corporation">Nizampet Municipal Corporation</option>
                  <option value="Ongole Municipal Corporation">Ongole Municipal Corporation</option>
                  <option value="Palampur Municipal Corporation">Palampur Municipal Corporation</option>
                  <option value="Panchkula Municipal Corporation">Panchkula Municipal Corporation</option>
                  <option value="Panipat Municipal Corporation">Panipat Municipal Corporation</option>
                  <option value="Panvel Municipal Corporation">Panvel Municipal Corporation</option>
                  <option value="Parbhani Municipal Corporation">Parbhani Municipal Corporation</option>
                  <option value="Pathankot Municipal Corporation">Pathankot Municipal Corporation</option>
                  <option value="Patiala Municipal Corporation">Patiala Municipal Corporation</option>
                  <option value="Patna Municipal Corporation">Patna Municipal Corporation</option>
                  <option value="Peerzadiguda Municipal Corporation">Peerzadiguda Municipal Corporation</option>
                  <option value="Phagwara Municipal Corporation">Phagwara Municipal Corporation</option>
                  <option value="Pimpri-Chinchwad Municipal Corporation">Pimpri-Chinchwad Municipal Corporation</option>
                  <option value="Prayagraj Municipal Corporation">Prayagraj Municipal Corporation</option>
                  <option value="Pudukottai Municipal Corporation">Pudukottai Municipal Corporation</option>
                  <option value="Pune Municipal Corporation">Pune Municipal Corporation</option>
                  <option value="Purnia Municipal Corporation">Purnia Municipal Corporation</option>
                  <option value="Raichur Municipal Corporation">Raichur Municipal Corporation</option>
                  <option value="Raigarh Municipal Corporation">Raigarh Municipal Corporation</option>
                  <option value="Raipur Municipal Corporation">Raipur Municipal Corporation</option>
                  <option value="Rajahmundry Municipal Corporation">Rajahmundry Municipal Corporation</option>
                  <option value="Rajgarh Nagar Nigam">Rajgarh Nagar Nigam</option>
                  <option value="Rajkot Municipal Corporation">Rajkot Municipal Corporation</option>
                  <option value="Rajnandgaon Municipal Corporation">Rajnandgaon Municipal Corporation</option>
                  <option value="Ramagundam Municipal Corporation">Ramagundam Municipal Corporation</option>
                  <option value="Ranchi Municipal Corporation">Ranchi Municipal Corporation</option>
                  <option value="Ratlam Nagar Nigam">Ratlam Nagar Nigam</option>
                  <option value="Rewa Nagar Nigam">Rewa Nagar Nigam</option>
                  <option value="Risali Municipal Corporation">Risali Municipal Corporation</option>
                  <option value="Rishikesh Municipal Corporation">Rishikesh Municipal Corporation</option>
                  <option value="Rohtak Municipal Corporation">Rohtak Municipal Corporation</option>
                  <option value="Roorkee Municipal Corporation">Roorkee Municipal Corporation</option>
                  <option value="Rourkela Municipal Corporation">Rourkela Municipal Corporation</option>
                  <option value="Rudrapur Municipal Corporation">Rudrapur Municipal Corporation</option>
                  <option value="Sagar Nagar Nigam">Sagar Nagar Nigam</option>
                  <option value="Saharanpur Municipal Corporation">Saharanpur Municipal Corporation</option>
                  <option value="Salem Municipal Corporation">Salem Municipal Corporation</option>
                  <option value="Sambalpur Municipal Corporation">Sambalpur Municipal Corporation</option>
                  <option value="Sangli-Miraj-Kupwad Municipal Corporation">Sangli-Miraj-Kupwad Municipal Corporation</option>
                  <option value="Satna Nagar Nigam">Satna Nagar Nigam</option>
                  <option value="Shahdol Nagar Nigam">Shahdol Nagar Nigam</option>
                  <option value="Shahjahanpur Municipal Corporation">Shahjahanpur Municipal Corporation</option>
                  <option value="Shillong Municipal Corporation">Shillong Municipal Corporation</option>
                  <option value="Sidhi Nagar Nigam">Sidhi Nagar Nigam</option>
                  <option value="Siliguri Municipal Corporation">Siliguri Municipal Corporation</option>
                  <option value="Singrauli Nagar Nigam">Singrauli Nagar Nigam</option>
                  <option value="Sivakasi Municipal Corporation">Sivakasi Municipal Corporation</option>
                  <option value="Solan Municipal Corporation">Solan Municipal Corporation</option>
                  <option value="Solapur Municipal Corporation">Solapur Municipal Corporation</option>
                  <option value="Sonipat Municipal Corporation">Sonipat Municipal Corporation</option>
                  <option value="Srikakulam Municipal Corporation">Srikakulam Municipal Corporation</option>
                  <option value="Srinagar Municipal Corporation">Srinagar Municipal Corporation</option>
                  <option value="Surat Municipal Corporation">Surat Municipal Corporation</option>
                  <option value="Tambaram Municipal Corporation">Tambaram Municipal Corporation</option>
                  <option value="Thane Municipal Corporation">Thane Municipal Corporation</option>
                  <option value="Thanjavur Municipal Corporation">Thanjavur Municipal Corporation</option>
                  <option value="Thiruvananthapuram Municipal Corporation">Thiruvananthapuram Municipal Corporation</option>
                  <option value="Thoothukudi Municipal Corporation">Thoothukudi Municipal Corporation</option>
                  <option value="Thrissur Municipal Corporation">Thrissur Municipal Corporation</option>
                  <option value="Tiruchirappalli Municipal Corporation">Tiruchirappalli Municipal Corporation</option>
                  <option value="Tirunelveli Municipal Corporation">Tirunelveli Municipal Corporation</option>
                  <option value="Tirupati Municipal Corporation">Tirupati Municipal Corporation</option>
                  <option value="Tiruppur Municipal Corporation">Tiruppur Municipal Corporation</option>
                  <option value="Tiruvannamalai Municipal Corporation">Tiruvannamalai Municipal Corporation</option>
                  <option value="Tura Municipal Corporation">Tura Municipal Corporation</option>
                  <option value="Udaipur Municipal Corporation">Udaipur Municipal Corporation</option>
                  <option value="Ujjain Nagar Nigam">Ujjain Nagar Nigam</option>
                  <option value="Ulhasnagar Municipal Corporation">Ulhasnagar Municipal Corporation</option>
                  <option value="Umaria Nagar Nigam">Umaria Nagar Nigam</option>
                  <option value="Una Municipal Corporation">Una Municipal Corporation</option>
                  <option value="Vadodara Municipal Corporation">Vadodara Municipal Corporation</option>
                  <option value="Varanasi Municipal Corporation">Varanasi Municipal Corporation</option>
                  <option value="Vasai-Virar City Municipal Corporation">Vasai-Virar City Municipal Corporation</option>
                  <option value="Vellore Municipal Corporation">Vellore Municipal Corporation</option>
                  <option value="Vijayawada Municipal Corporation">Vijayawada Municipal Corporation</option>
                  <option value="Visakhapatnam Municipal Corporation">Visakhapatnam Municipal Corporation</option>
                  <option value="Vizianagaram Municipal Corporation">Vizianagaram Municipal Corporation</option>
                  <option value="Yamunanagar Municipal Corporation">Yamunanagar Municipal Corporation</option>
                </select>
                {errors.municipalCorp && (
                  <p className="mt-1 text-sm text-red-600">{errors.municipalCorp}</p>
                )}
              </div>
              
              {/* Selected Category Display */}
              {formData.category && formData.subcategory && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Selected:</span> {categories.find(cat => cat.value === formData.category)?.label} → {formData.subcategory}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area/Neighborhood *
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.area ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Downtown, Westside, etc."
              />
              {errors.area && (
                <p className="mt-1 text-sm text-red-600">{errors.area}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              
              {/* Voice-to-text controls */}
              <div className="flex items-center space-x-2 mb-2">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                  }`}
                  title={isListening ? 'Stop recording (Esc)' : 'Start voice recording'}
                  aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
                  disabled={isListening && !recognition}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Input
                    </>
                  )}
                </button>
                
                {transcript && (
                  <button
                    type="button"
                    onClick={clearTranscript}
                    className="inline-flex items-center px-2 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    title="Clear transcript"
                    aria-label="Clear voice transcript"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                
                {isListening && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-600 font-medium">Recording...</span>
                  </div>
                )}
              </div>
              
              {/* Voice-to-text instructions */}
              <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600">
                  💡 <strong>Voice Input Tip:</strong> Click the microphone button, speak clearly about your issue, then click "Stop Recording" to add your voice to the description. 
                  Works best in Chrome and Edge browsers.
                </p>
              </div>
              
              {/* Transcript display */}
              {transcript && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Voice Transcript:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            description: prev.description + (prev.description ? ' ' : '') + transcript.trim()
                          }))
                          setTranscript('')
                        }}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Add to Description
                      </button>
                      <button
                        type="button"
                        onClick={clearTranscript}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-blue-900 italic">"{transcript}"</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Click "Add to Description" to include this text in your issue description, or "Clear" to remove it.
                  </p>
                </div>
              )}
              
              {/* Phone Number Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    📱 Phone Number
                  </span>
                </label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+91 99234 10767"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your phone number to receive issue updates and confirmations
                </p>
              </div>
              
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Provide detailed information about the issue, including any relevant details that might help authorities understand and resolve it quickly. You can also use the voice input button above to speak your description."
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
                <p className={`text-xs ml-auto ${
                  formData.description.length > 500 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {formData.description.length}/1000 characters
                </p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Location Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full street address or coordinates"
                />
              </div>

              <div className="flex items-end space-x-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  id="location-button"
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <span id="location-button-text">Use Current Location</span>
                </button>
              </div>
            </div>

            {locationStatus && (
              <div className={`mt-3 p-3 rounded-lg border ${
                locationStatus.type === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : locationStatus.type === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${
                    locationStatus.type === 'success' 
                      ? 'text-green-700' 
                      : locationStatus.type === 'error'
                      ? 'text-red-700'
                      : 'text-blue-700'
                  }`}>
                    {locationStatus.message}
                  </p>
                  {locationStatus.type === 'success' && (
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Photos & Videos</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload photos or videos to help describe the issue</p>
              <p className="text-sm text-gray-500 mb-4">Supports JPG, PNG, GIF, MP4 (max 10MB each)</p>
              
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </label>
            </div>

            {media.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Media:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">{item.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedia(item.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1">{formatFileSize(item.size)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI-Powered Features Section */}
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 AI-Powered Smart Features</h2>
          
          {/* Error Boundary for AI Features */}
          {hasError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-red-600">❌</span>
                <p className="text-red-700 font-medium">AI Features Error:</p>
              </div>
              <p className="text-red-600 mt-1">{errorMessage}</p>
              <button
                type="button"
                onClick={() => setHasError(false)}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Severity Predictor */}
            <AISeverityPredictor 
              issueData={{ 
                description: formData.description || 'No description', 
                category: formData.category || 'No category', 
                media: media || [] 
              }}
              onSeverityUpdate={(severity, confidence) => {
                setPredictedSeverity({ severity, confidence });
                console.log(`AI predicted severity: ${severity} with ${confidence}% confidence`);
              }}
            />

            {/* Community Impact Tracker */}
            <CommunityImpactTracker 
              issueLocation={formData.address || formData.area || 'No location set'}
              issueType={formData.category || 'No category set'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather Integration */}
            <div className="relative">
              <WeatherIntegration 
                location={formData.address || formData.area || 'No location set'}
                onWeatherUpdate={setWeatherData}
              />
            </div>

            {/* Smart Route Optimizer */}
            <SmartRouteOptimizer 
              issues={[
                {
                  id: 'current',
                  title: formData.description || 'New Issue',
                  location: formData.address || formData.area || 'No location set',
                  severity: predictedSeverity?.severity || 'medium',
                  category: formData.category || 'No category set'
                }
              ]}
              crewLocation="Maintenance Depot"
            />
          </div>


        </div>



        {/* Submit Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Issue Report
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">💡 Tips for Better Reports</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• 📸 Take clear, well-lit photos of the issue</li>
          <li>• 📍 Provide specific location details to help authorities</li>
          <li>• 🏛️ Select your Municipal Corporation for proper issue routing</li>
          <li>• 🏷️ Select the most specific category and subcategory for better routing</li>
          <li>• ✍️ Use descriptive titles to categorize issues properly</li>
          <li>• 🔍 Include relevant details in description</li>
          <li>• 📱 You can upload multiple photos/videos for better understanding</li>
        </ul>
      </div>
    </div>
  )
}

export default IssueForm
