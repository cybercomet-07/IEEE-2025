import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Plus, 
  Map, 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Settings,
  Sun,
  Moon,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path) => {
    if (path === '/dashboard' || path === '/admin') {
      return location.pathname === path || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')
    }
    return location.pathname === path
  }

  const getDashboardPath = () => {
    return user?.role === 'admin' ? '/admin' : '/dashboard'
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: getDashboardPath(),
      icon: Home,
      current: isActive('/dashboard') || isActive('/admin')
    },
    // Hide Report Issue for admins
    ...(user?.role === 'admin' ? [] : [{
      name: 'Report Issue',
      href: '/report',
      icon: Plus,
      current: isActive('/report')
    }]),
    {
      name: 'Map View',
      href: '/map',
      icon: Map,
      current: isActive('/map')
    },
    {
      name: 'Community',
      href: '/community',
      icon: MessageCircle,
      current: isActive('/community')
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: isActive('/profile')
    }
  ]

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gray-50'
    }`}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
        sidebarOpen ? 'block' : 'hidden'
      }`}>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`fixed inset-y-0 left-0 flex w-64 flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark 
            ? 'bg-gradient-to-b from-slate-800 via-purple-800 to-slate-800 border-r border-purple-600/30' 
            : 'bg-white border-r border-gray-200'
        }`}>
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className={`text-xl font-bold transition-colors duration-300 ${
              isDark ? 'text-purple-300' : 'text-blue-600'
            }`}>CityPulse</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`transition-colors duration-300 ${
                isDark ? 'text-gray-400 hover:text-purple-300' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 ${
                  item.current
                    ? isDark 
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/20' 
                      : 'bg-blue-100 text-blue-900 border border-blue-300 shadow-lg'
                    : isDark
                      ? 'text-gray-300 hover:bg-purple-600/10 hover:text-purple-200 hover:border border-purple-500/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border border-gray-300'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className={`border-t transition-colors duration-300 p-4 ${
            isDark ? 'border-purple-600/30' : 'border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
                    : 'bg-blue-500'
                }`}>
                  <span className="text-sm font-medium text-white">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {user?.displayName || 'User'}
                </p>
                <p className={`text-xs transition-colors duration-300 ${
                  isDark ? 'text-purple-300' : 'text-gray-500'
                } capitalize`}>
                  {user?.role || 'Citizen'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`mt-3 w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 ${
                isDark 
                  ? 'text-gray-300 hover:bg-red-600/20 hover:text-red-300 hover:border border-red-500/30' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border border-gray-300'
              }`}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex flex-col flex-grow transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-b from-slate-800 via-purple-800 to-slate-800 border-r border-purple-600/30' 
            : 'bg-white border-r border-gray-200'
        }`}>
          <div className="flex items-center h-16 px-4">
            <h1 className={`text-xl font-bold transition-colors duration-300 ${
              isDark ? 'text-purple-300' : 'text-blue-600'
            }`}>CityPulse</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 ${
                  item.current
                    ? isDark 
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/20' 
                      : 'bg-blue-100 text-blue-900 border border-blue-300 shadow-lg'
                    : isDark
                      ? 'text-gray-300 hover:bg-purple-600/10 hover:text-purple-200 hover:border border-purple-500/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border border-gray-300'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className={`border-t transition-colors duration-300 p-4 ${
            isDark ? 'border-purple-600/30' : 'border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
                    : 'bg-blue-500'
                }`}>
                  <span className="text-sm font-medium text-white">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {user?.displayName || 'User'}
                </p>
                <p className={`text-xs transition-colors duration-300 ${
                  isDark ? 'text-purple-300' : 'text-gray-500'
                } capitalize`}>
                  {user?.role || 'Citizen'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`mt-3 w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 ${
                isDark 
                  ? 'text-gray-300 hover:bg-red-600/20 hover:text-red-300 hover:border border-red-500/30' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border border-gray-300'
              }`}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b shadow-sm backdrop-blur-sm transition-all duration-500 ${
          isDark 
            ? 'border-purple-600/30 bg-slate-800/80' 
            : 'border-gray-200 bg-white/80'
        } sm:gap-x-6 sm:px-6 lg:px-8`}>
          <button
            type="button"
            className={`-m-2.5 p-2.5 transition-colors duration-300 lg:hidden ${
              isDark ? 'text-gray-300 hover:text-purple-300' : 'text-gray-700 hover:text-gray-900'
            }`}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12 ${
                  isDark 
                    ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button 
                onClick={() => navigate('/profile?tab=notifications')}
                className={`transition-colors duration-300 ${
                  isDark ? 'text-gray-400 hover:text-purple-300' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Notification Preferences"
              >
                <Bell className="h-6 w-6" />
              </button>
              <button 
                onClick={() => navigate('/profile?tab=settings')}
                className={`transition-colors duration-300 ${
                  isDark ? 'text-gray-400 hover:text-purple-300' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Account Settings"
              >
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

