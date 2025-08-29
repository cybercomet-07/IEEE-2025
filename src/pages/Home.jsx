import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MapPin,
  Camera,
  Users,
  Shield,
  TrendingUp,
  CheckCircle,
  Building,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  LogOut
} from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Remove automatic redirect - let users see the home page
  // Users can manually navigate to their dashboard using the buttons
  
  // Debug logging
  console.log('Home component rendered, user:', user);
  console.log('User role:', user?.role);
  console.log('User email:', user?.email);

  const features = [
    { icon: <Camera className="h-8 w-8 text-blue-600" />, title: "Photo & Video Reports", description: "Capture issues with photos and videos for better documentation" },
    { icon: <MapPin className="h-8 w-8 text-green-600" />, title: "GPS Location Tracking", description: "Automatically capture exact location of civic issues" },
    { icon: <Users className="h-8 w-8 text-purple-600" />, title: "Community Engagement", description: "Connect citizens with local authorities for faster resolution" },
    { icon: <MessageCircle className="h-8 w-8 text-indigo-600" />, title: "Community Discussion", description: "Share thoughts and engage with fellow citizens on civic matters" },
    { icon: <Shield className="h-8 w-8 text-red-600" />, title: "Secure & Reliable", description: "Your data is protected with enterprise-grade security" },
    { icon: <TrendingUp className="h-8 w-8 text-orange-600" />, title: "Real-time Updates", description: "Track the progress of your reported issues in real-time" },
    { icon: <CheckCircle className="h-8 w-8 text-teal-600" />, title: "Issue Resolution", description: "Streamlined process from reporting to resolution" }
  ];

  const stats = [
    { number: "1000+", label: "Issues Resolved" },
    { number: "50+", label: "Cities Covered" },
    { number: "10,000+", label: "Active Users" },
    { number: "95%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
                      {/* Full Page Spline Background */}
        <div className="relative overflow-hidden min-h-screen">
          {/* Spline Background - Full Page */}
          <div className="fixed inset-0 w-full h-full">
            <iframe
              src="https://my.spline.design/holographicearthwithdynamiclines-CMvEeRSYNFpq5rQu7PkI6E5r/"
              frameBorder="0"
              width="100%"
              height="100%"
              title="CityPulse 3D Background Animation"
              style={{ border: "none" }}
              className="absolute inset-0"
            />
          </div>
        
        {/* Dark Overlay for Text Readability */}
        <div className="fixed inset-0 bg-black bg-opacity-40"></div>
        

        
        {/* Hero Section Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            <div className="text-center animate-fadeIn">
              {/* Welcome message for logged-in users */}
              {user && (
                <div className="mb-8 p-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg border border-white border-opacity-30 max-w-md mx-auto">
                  <p className="text-white text-lg font-medium">
                    Welcome back, {user.displayName || user.email}! 👋
                  </p>
                  <p className="text-blue-100 text-sm mt-1">
                    You're logged in as a {user.role}
                  </p>
                  <button 
                    onClick={logout}
                    className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors duration-300 flex items-center gap-2 mx-auto"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Transform Your City
                <span className="text-blue-300 block drop-shadow-lg">One Issue at a Time</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto drop-shadow-lg">
                CityPulse is India's premier civic issue reporting platform that connects citizens with municipal authorities for faster, more efficient problem resolution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user ? (
                  // User is logged in - show dashboard buttons
                  <>
                    <button onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')} className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                      Go to {user.role === 'admin' ? 'Admin' : 'Citizen'} Dashboard
                    </button>
                    <button onClick={() => navigate('/role-selection?mode=register')} className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105">
                      Create New Account
                    </button>
                  </>
                ) : (
                  // User is not logged in - show regular buttons
                  <>
                    <button onClick={() => navigate('/role-selection?mode=register')} className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">Get Started</button>
                    <button onClick={() => navigate('/role-selection?mode=login')} className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105">Login</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">Why Choose CityPulse?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto drop-shadow-lg">
                Our platform provides everything you need to report and track civic issues efficiently
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 hover:bg-white hover:bg-opacity-20 transition-all duration-300">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-100">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative z-10 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 bg-black bg-opacity-60 backdrop-blur-sm text-white py-12 border-t border-white border-opacity-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Building className="h-8 w-8 text-blue-400" />
                  <span className="text-xl font-bold">CityPulse</span>
                </div>
                <p className="text-blue-100">
                  Empowering citizens to build better cities through technology and community engagement.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-blue-100">
                  <li><button onClick={() => navigate('/')} className="hover:text-white">Home</button></li>
                  <li><button onClick={() => navigate('/role-selection?mode=register')} className="hover:text-white">Register</button></li>
                  <li><button onClick={() => navigate('/role-selection?mode=login')} className="hover:text-white">Login</button></li>
                  <li><button onClick={() => navigate('/community')} className="hover:text-white">Community Discussion</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-blue-100">
                  <li className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>support@citypulse.in</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>1800-CITY-PULSE</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Connect</h3>
                <div className="flex space-x-4">
                  <Globe className="h-6 w-6 text-blue-300 hover:text-white cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="border-t border-white border-opacity-20 mt-8 pt-8 text-center text-blue-100">
              <p>&copy; 2025 CityPulse. All rights reserved. Making cities smarter, one issue at a time.</p>
            </div>
          </div>
        </footer>

        {/* Floating Background Elements */}
        <div className="floating-bg-element" style={{ top: '20%', left: '10%', width: '60px', height: '60px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div className="floating-bg-element" style={{ top: '60%', right: '15%', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div className="floating-bg-element" style={{ top: '40%', left: '80%', width: '40px', height: '40px', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>
    </div>
  );
}

export default Home;
