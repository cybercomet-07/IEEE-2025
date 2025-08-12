import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Building, 
  MapPin, 
  Search,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import toast from 'react-hot-toast'

function MunicipalCorpSelection() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [selectedCorporation, setSelectedCorporation] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add debugging and error handling
  useEffect(() => {
    console.log('MunicipalCorpSelection mounted')
    console.log('User object:', user)
    console.log('Loading state:', loading)
    console.log('User UID:', user?.uid)
    console.log('User email:', user?.email)
    console.log('User role:', user?.role)
    
    if (!loading && !user) {
      console.log('No user found, redirecting to login')
      toast.error('Please log in to continue')
      navigate('/login')
      return
    }
  }, [user, loading, navigate])

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your information</p>
        </div>
      </div>
    )
  }

  // Show error state if no user is found
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-full mx-auto mb-6">
            <Building className="h-16 w-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-red-700 mb-4">Authentication Required</h2>
          <p className="text-red-600 mb-6">Please log in to select your Municipal Corporation</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const municipalCorporations = [
    'Abohar Municipal Corporation',
    'Adityapur Municipal Corporation',
    'Agartala Municipal Corporation',
    'Agra Municipal Corporation',
    'Ahmedabad Municipal Corporation',
    'Ahmednagar Municipal Corporation',
    'Aizawl Municipal Corporation',
    'Ajmer Municipal Corporation',
    'Akola Municipal Corporation',
    'Aligarh Municipal Corporation',
    'Alwar Municipal Corporation',
    'Ambala Municipal Corporation',
    'Ambikapur Municipal Corporation',
    'Amravati Municipal Corporation',
    'Amritsar Municipal Corporation',
    'Anantapur Municipal Corporation',
    'Anuppur Nagar Nigam',
    'Arrah Municipal Corporation',
    'Asansol Municipal Corporation',
    'Ashoknagar Nagar Nigam',
    'Aurangabad Municipal Corporation',
    'Avadi Municipal Corporation',
    'Ayodhya Municipal Corporation',
    'Badangpet Municipal Corporation',
    'Baddi Municipal Corporation',
    'Ballari Municipal Corporation',
    'Bandlaguda Jagir Municipal Corporation',
    'Bareilly Municipal Corporation',
    'Batala Municipal Corporation',
    'Bathinda Municipal Corporation',
    'Begusarai Municipal Corporation',
    'Belagavi Municipal Corporation',
    'Berhampur Municipal Corporation',
    'Betul Nagar Nigam',
    'Bhagalpur Municipal Corporation',
    'Bharatpur Municipal Corporation',
    'Bhavnagar Municipal Corporation',
    'Bhilai Charoda Municipal Corporation',
    'Bhilai Municipal Corporation',
    'Bhind Nagar Nigam',
    'Bhiwandi-Nizampur Municipal Corporation',
    'Bhopal Nagar Nigam',
    'Bhubaneswar Municipal Corporation',
    'Bidhannagar Municipal Corporation',
    'Bihar Sharif Municipal Corporation',
    'Bikaner Municipal Corporation',
    'Birgaon Municipal Corporation',
    'Boduppal Municipal Corporation',
    'Brihanmumbai Municipal Corporation',
    'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    'Burhanpur Nagar Nigam',
    'Chandernagore Municipal Corporation',
    'Chandigarh Municipal Corporation',
    'Chandrapur City Municipal Corporation',
    'Chas Municipal Corporation',
    'Chhindwara Nagar Nigam',
    'Chirmiri Municipal Corporation',
    'Chittoor Municipal Corporation',
    'Coimbatore Municipal Corporation',
    'Corporation of the City of Panaji',
    'Cuddalore Municipal Corporation',
    'Cuttack Municipal Corporation',
    'Darbhanga Municipal Corporation',
    'Datia Nagar Nigam',
    'Davangere Municipal Corporation',
    'Dehradun Municipal Corporation',
    'Deoghar Municipal Corporation',
    'Dewas Nagar Nigam',
    'Dhamtari Municipal Corporation',
    'Dharamshala Municipal Corporation',
    'Dhule Municipal Corporation',
    'Dimapur Municipal Council',
    'Dindigul Municipal Corporation',
    'Durg Municipal Corporation',
    'Durgapur Municipal Corporation',
    'Eluru Municipal Corporation',
    'Erode Municipal Corporation',
    'Faridabad Municipal Corporation',
    'Firozabad Municipal Corporation',
    'Gandhinagar Municipal Corporation',
    'Gangtok Municipal Corporation',
    'Gaya Municipal Corporation',
    'Ghaziabad Municipal Corporation',
    'Giridih Municipal Corporation',
    'Gorakhpur Municipal Corporation',
    'Greater Chennai Corporation',
    'Greater Hyderabad Municipal Corporation (GHMC)',
    'Greater Warangal Municipal Corporation (GWMC)',
    'Guna Nagar Nigam',
    'Guntur Municipal Corporation',
    'Gurugram (Gurgaon) Municipal Corporation',
    'Guwahati Municipal Corporation',
    'Gwalior Nagar Nigam',
    'Haldwani Municipal Corporation',
    'Hamirpur Municipal Corporation',
    'Harda Nagar Nigam',
    'Haridwar Municipal Corporation',
    'Hazaribagh Municipal Corporation',
    'Hisar Municipal Corporation',
    'Hoshangabad Nagar Nigam',
    'Hoshiarpur Municipal Corporation',
    'Hosur Municipal Corporation',
    'Howrah Municipal Corporation',
    'Hubli-Dharwad Municipal Corporation',
    'Ichalkaranji Municipal Corporation',
    'Imphal Municipal Corporation',
    'Indore Nagar Nigam',
    'Itanagar Municipal Corporation',
    'Jabalpur Nagar Nigam',
    'Jagdalpur Municipal Corporation',
    'Jaipur Municipal Corporation Greater',
    'Jaipur Municipal Corporation Heritage',
    'Jalandhar Municipal Corporation',
    'Jalgaon City Municipal Corporation',
    'Jalna Municipal Corporation',
    'Jamalpur Municipal Corporation',
    'Jammu Municipal Corporation',
    'Jamnagar Municipal Corporation',
    'Jawaharnagar Municipal Corporation',
    'Jhansi Municipal Corporation',
    'Jodhpur Municipal Corporation North',
    'Jodhpur Municipal Corporation South',
    'Junagadh Municipal Corporation',
    'Kadapa Municipal Corporation',
    'Kakinada Municipal Corporation',
    'Kalaburagi Municipal Corporation',
    'Kalyan-Dombivli Municipal Corporation',
    'Kancheepuram Municipal Corporation',
    'Kannur Municipal Corporation',
    'Kanpur Municipal Corporation',
    'Kapurthala Municipal Corporation',
    'Karaikudi Municipal Corporation',
    'Karimnagar Municipal Corporation',
    'Karnal Municipal Corporation',
    'Karur Municipal Corporation',
    'Kashipur Municipal Corporation',
    'Katihar Municipal Corporation',
    'Katni Nagar Nigam',
    'Khammam Municipal Corporation',
    'Khandwa Nagar Nigam',
    'Kochi Municipal Corporation',
    'Kohima Municipal Council',
    'Kolhapur Municipal Corporation',
    'Kolkata Municipal Corporation',
    'Kollam Municipal Corporation',
    'Korba Municipal Corporation',
    'Kota Municipal Corporation North',
    'Kota Municipal Corporation South',
    'Kotdwar Municipal Corporation',
    'Kothagudem Municipal Corporation',
    'Kozhikode Municipal Corporation',
    'Kumbakonam Municipal Corporation',
    'Kurnool Municipal Corporation',
    'Latur City Municipal Corporation',
    'Lucknow Municipal Corporation',
    'Ludhiana Municipal Corporation',
    'Machilipatnam Municipal Corporation',
    'Madurai Municipal Corporation',
    'Mahabubnagar Municipal Corporation',
    'Malegaon Municipal Corporation',
    'Mancherial Municipal Corporation',
    'Mandi Municipal Corporation',
    'Mandsaur Nagar Nigam',
    'Manesar Municipal Corporation',
    'Mangalagiri Tadepalli Municipal Corporation',
    'Mathura-Vrindavan Municipal Corporation',
    'Meerpet–Jillelguda Municipal Corporation',
    'Meerut Municipal Corporation',
    'Mira-Bhayandar Municipal Corporation',
    'Moga Municipal Corporation',
    'Mohali Municipal Corporation',
    'Mokokchung Municipal Council',
    'Moradabad Municipal Corporation',
    'Morena Nagar Nigam',
    'Munger Municipal Corporation',
    'Municipal Corporation of Delhi',
    'Muzaffarpur Municipal Corporation',
    'Nagercoil Municipal Corporation',
    'Nagpur Municipal Corporation',
    'Namakkal Municipal Corporation',
    'Nanded-Waghala City Municipal Corporation',
    'Nashik Municipal Corporation',
    'Navi Mumbai Municipal Corporation',
    'Nellore Municipal Corporation',
    'Nizamabad Municipal Corporation',
    'Nizampet Municipal Corporation',
    'Ongole Municipal Corporation',
    'Palampur Municipal Corporation',
    'Panchkula Municipal Corporation',
    'Panipat Municipal Corporation',
    'Panvel Municipal Corporation',
    'Parbhani Municipal Corporation',
    'Pathankot Municipal Corporation',
    'Patiala Municipal Corporation',
    'Patna Municipal Corporation',
    'Peerzadiguda Municipal Corporation',
    'Phagwara Municipal Corporation',
    'Pimpri-Chinchwad Municipal Corporation',
    'Prayagraj Municipal Corporation',
    'Pudukottai Municipal Corporation',
    'Pune Municipal Corporation',
    'Purnia Municipal Corporation',
    'Raichur Municipal Corporation',
    'Raigarh Municipal Corporation',
    'Raipur Municipal Corporation',
    'Rajahmundry Municipal Corporation',
    'Rajgarh Nagar Nigam',
    'Rajkot Municipal Corporation',
    'Rajnandgaon Municipal Corporation',
    'Ramagundam Municipal Corporation',
    'Ranchi Municipal Corporation',
    'Ratlam Nagar Nigam',
    'Rewa Nagar Nigam',
    'Risali Municipal Corporation',
    'Rishikesh Municipal Corporation',
    'Rohtak Municipal Corporation',
    'Roorkee Municipal Corporation',
    'Rourkela Municipal Corporation',
    'Rudrapur Municipal Corporation',
    'Sagar Nagar Nigam',
    'Saharanpur Municipal Corporation',
    'Salem Municipal Corporation',
    'Sambalpur Municipal Corporation',
    'Sangli-Miraj-Kupwad Municipal Corporation',
    'Satna Nagar Nigam',
    'Shahdol Nagar Nigam',
    'Shahjahanpur Municipal Corporation',
    'Shillong Municipal Corporation',
    'Sidhi Nagar Nigam',
    'Siliguri Municipal Corporation',
    'Singrauli Nagar Nigam',
    'Sivakasi Municipal Corporation',
    'Solan Municipal Corporation',
    'Solapur Municipal Corporation',
    'Sonipat Municipal Corporation',
    'Srikakulam Municipal Corporation',
    'Srinagar Municipal Corporation',
    'Surat Municipal Corporation',
    'Tambaram Municipal Corporation',
    'Thane Municipal Corporation',
    'Thanjavur Municipal Corporation',
    'Thiruvananthapuram Municipal Corporation',
    'Thoothukudi Municipal Corporation',
    'Thrissur Municipal Corporation',
    'Tiruchirappalli Municipal Corporation',
    'Tirunelveli Municipal Corporation',
    'Tirupati Municipal Corporation',
    'Tiruppur Municipal Corporation',
    'Tiruvannamalai Municipal Corporation',
    'Tura Municipal Corporation',
    'Udaipur Municipal Corporation',
    'Ujjain Nagar Nigam',
    'Ulhasnagar Municipal Corporation',
    'Umaria Nagar Nigam',
    'Una Municipal Corporation',
    'Vadodara Municipal Corporation',
    'Varanasi Municipal Corporation',
    'Vasai-Virar City Municipal Corporation',
    'Vellore Municipal Corporation',
    'Vijayawada Municipal Corporation',
    'Visakhapatnam Municipal Corporation',
    'Vizianagaram Municipal Corporation',
    'Yamunanagar Municipal Corporation'
  ]

  const filteredCorporations = municipalCorporations.filter(corp =>
    corp.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCorporationSelection = async () => {
    if (!selectedCorporation) {
      toast.error('Please select a Municipal Corporation')
      return
    }

    if (!user || !user.uid) {
      console.error('No user or user.uid found:', user)
      toast.error('User authentication error. Please log in again.')
      navigate('/login')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Updating user document for:', user.uid)
      console.log('Selected corporation:', selectedCorporation)
      
      // Update user document with selected corporation
      await updateDoc(doc(db, 'users', user.uid), {
        selectedMunicipalCorp: selectedCorporation,
        updatedAt: new Date().toISOString()
      })

      console.log('Successfully updated user document')
      toast.success(`Welcome to ${selectedCorporation}!`)
      
      // Small delay to ensure the toast is visible
      setTimeout(() => {
        navigate('/admin')
      }, 1000)
      
    } catch (error) {
      console.error('Error updating corporation selection:', error)
      console.error('Error details:', error.message)
      console.error('Error code:', error.code)
      
      let errorMessage = 'Failed to set corporation. Please try again.'
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication.'
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again.'
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Please log in again to continue.'
        navigate('/login')
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">CityPulse</span>
            </div>
            <button
              onClick={() => navigate('/role-selection')}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Back to Role Selection
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <Building className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Select Your Municipal Corporation
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the specific Municipal Corporation you represent to access issues and complaints 
          under your jurisdiction
        </p>
        
        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info:</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>User ID: {user?.uid || 'Not available'}</p>
              <p>Email: {user?.email || 'Not available'}</p>
              <p>Role: {user?.role || 'Not available'}</p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Corporation Selection */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for your Municipal Corporation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {filteredCorporations.length} of {municipalCorporations.length} corporations found
            </p>
          </div>

          {/* Corporation List */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredCorporations.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredCorporations.map((corporation, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCorporation(corporation)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedCorporation === corporation ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">{corporation}</span>
                      </div>
                      {selectedCorporation === corporation && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No corporations found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            )}
          </div>

          {/* Selection Display */}
          {selectedCorporation && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Selected Corporation:</p>
                  <p className="text-green-900 text-lg">{selectedCorporation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleCorporationSelection}
              disabled={!selectedCorporation || isSubmitting}
              className={`inline-flex items-center px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ${
                selectedCorporation
                  ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Setting Corporation...' : 'Continue to Admin Dashboard'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            <Building className="h-5 w-5 inline mr-2" />
            About Municipal Corporation Selection
          </h3>
          <p className="text-blue-800 mb-3">
            This selection determines which civic issues and complaints you'll be able to view and manage 
            in your admin dashboard. Only issues reported within your selected corporation's jurisdiction 
            will be visible to you.
          </p>
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> You can change your selected corporation later from your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MunicipalCorpSelection
