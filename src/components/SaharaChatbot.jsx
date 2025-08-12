import React, { useState } from 'react'
import { MessageCircle, X, Send, Bot, Maximize2, Minimize2 } from 'lucide-react'
import cohereService from '../services/cohere'

const SaharaChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Sahara, your AI assistant. How can I help you with civic issues today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Get conversation history for context (last 5 messages)
      const conversationHistory = messages.slice(-5);
      
      // Call Cohere API
      const botResponse = await cohereService.generateResponse(inputMessage, conversationHistory);
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to hardcoded response if API fails
      const botResponse = generateBotResponse(inputMessage);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase()
    
    if (input.includes('report') || input.includes('issue') || input.includes('problem')) {
      return "To report a civic issue, click on 'Report Issue' in your dashboard. You can upload photos, describe the problem, and use your current location for accurate reporting."
    }
    
    if (input.includes('status') || input.includes('track') || input.includes('update')) {
      return "You can track your reported issues in your dashboard. Each issue shows its current status: Pending, In Progress, or Resolved. You'll also get notifications when status changes."
    }
    
    if (input.includes('category') || input.includes('type')) {
      return "We have 6 main categories: Roads & Transport, Waste Management, Water & Drainage, Electricity & Lighting, Environment & Parks, and Public Safety & Others."
    }
    
    if (input.includes('location') || input.includes('gps') || input.includes('coordinates')) {
      return "When reporting an issue, you can use the 'Use Current Location' button to automatically capture your GPS coordinates, or manually enter the address."
    }
    
    if (input.includes('photo') || input.includes('image') || input.includes('media')) {
      return "Yes, you can upload photos and videos when reporting issues. This helps authorities better understand the problem. Supported formats include JPG, PNG, GIF, and MP4."
    }
    
    if (input.includes('escalate') || input.includes('social media')) {
      return "Issues that remain unresolved for 3 days are automatically escalated to social media platforms like Instagram and Twitter to get more attention from authorities."
    }
    
    if (input.includes('admin') || input.includes('authority')) {
      return "Admins can update issue statuses, add notes, and manage all reported issues. They also handle social media escalations and WhatsApp integrations."
    }
    
    if (input.includes('whatsapp')) {
      return "You can report issues via WhatsApp by sending photos/videos with descriptions. Our bot will automatically process these and create issue reports in the system."
    }
    
    if (input.includes('help') || input.includes('support')) {
      return "I'm here to help! You can ask me about reporting issues, tracking status, categories, location services, media uploads, or any other civic issue related questions."
    }
    
    return "I understand you're asking about civic issues. Could you please be more specific? I can help with reporting, tracking, categories, location services, and more."
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          title="Chat with Sahara AI"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            {/* Sahara Logo - Cartoon-style robot with turban */}
            <svg viewBox="0 0 40 40" className="w-5 h-5">
              {/* Robot head - light blue */}
              <circle cx="20" cy="16" r="10" fill="#87CEEB" stroke="#5F9EA0" strokeWidth="1" />
              
              {/* Dark blue visor/eyes area */}
              <rect x="12" y="12" width="16" height="8" fill="#1E3A8A" rx="3" />
              
              {/* White eyes */}
              <ellipse cx="16" cy="16" rx="2" ry="1.5" fill="white" />
              <ellipse cx="24" cy="16" rx="2" ry="1.5" fill="white" />
              
              {/* Eye pupils */}
              <circle cx="16" cy="16" r="0.8" fill="#1E3A8A" />
              <circle cx="24" cy="16" r="0.8" fill="#1E3A8A" />
              
              {/* Friendly smile */}
              <path d="M 14 20 Q 20 22 26 20" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              
              {/* Orange turban */}
              <path d="M 8 8 Q 20 2 32 8 Q 30 12 28 14 Q 26 12 20 12 Q 14 12 12 14 Q 10 12 8 8" fill="#FF8C00" stroke="#E67E00" strokeWidth="0.5" />
              
              {/* Turban details */}
              <path d="M 12 10 Q 20 6 28 10" stroke="#E67E00" strokeWidth="1" fill="none" />
              
              {/* Dark blue headset components */}
              <circle cx="12" cy="16" r="2.5" fill="#1E3A8A" stroke="#0F172A" strokeWidth="0.5" />
              <circle cx="28" cy="16" r="2.5" fill="#1E3A8A" stroke="#0F172A" strokeWidth="0.5" />
              
              {/* Microphone arm */}
              <rect x="30" y="14" width="6" height="3" fill="#1E3A8A" rx="1.5" stroke="#0F172A" strokeWidth="0.5" />
              <circle cx="33" cy="15.5" r="1" fill="#0F172A" />
              
              {/* Orange body */}
              <rect x="14" y="24" width="12" height="12" fill="#FF8C00" rx="3" stroke="#E67E00" strokeWidth="0.5" />
              
              {/* Collar line */}
              <line x1="14" y1="26" x2="26" y2="26" stroke="#1E3A8A" strokeWidth="1" />
              
              {/* Body details */}
              <rect x="16" y="28" width="8" height="2" fill="#E67E00" rx="1" />
              <rect x="16" y="31" width="8" height="2" fill="#E67E00" rx="1" />
              <rect x="16" y="34" width="8" height="2" fill="#E67E00" rx="1" />
            </svg>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 ${
          isFullScreen 
            ? 'fixed inset-4 z-50 w-auto h-auto' 
            : 'w-72 h-80'
        }`}>
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-5 h-5">
                  <circle cx="20" cy="16" r="10" fill="#87CEEB" stroke="#5F9EA0" strokeWidth="1" />
                  <rect x="12" y="12" width="16" height="8" fill="#1E3A8A" rx="3" />
                  <ellipse cx="16" cy="16" rx="2" ry="1.5" fill="white" />
                  <ellipse cx="24" cy="16" rx="2" ry="1.5" fill="white" />
                  <circle cx="16" cy="16" r="0.8" fill="#1E3A8A" />
                  <circle cx="24" cy="16" r="0.8" fill="#1E3A8A" />
                  <path d="M 14 20 Q 20 22 26 20" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M 8 8 Q 20 2 32 8 Q 30 12 28 14 Q 26 12 20 12 Q 14 12 12 14 Q 10 12 8 8" fill="#FF8C00" stroke="#E67E00" strokeWidth="0.5" />
                  <path d="M 12 10 Q 20 6 28 10" stroke="#E67E00" strokeWidth="1" fill="none" />
                  <circle cx="12" cy="16" r="2.5" fill="#1E3A8A" stroke="#0F172A" strokeWidth="0.5" />
                  <circle cx="28" cy="16" r="2.5" fill="#1E3A8A" stroke="#0F172A" strokeWidth="0.5" />
                  <rect x="30" y="14" width="6" height="3" fill="#1E3A8A" rx="1.5" stroke="#0F172A" strokeWidth="0.5" />
                  <circle cx="33" cy="15.5" r="1" fill="#0F172A" />
                  <rect x="14" y="24" width="12" height="12" fill="#FF8C00" rx="3" stroke="#E67E00" strokeWidth="0.5" />
                  <line x1="14" y1="26" x2="26" y2="26" stroke="#1E3A8A" strokeWidth="1" />
                  <rect x="16" y="28" width="8" height="2" fill="#E67E00" rx="1" />
                  <rect x="16" y="31" width="8" height="2" fill="#E67E00" rx="1" />
                  <rect x="16" y="34" width="8" height="2" fill="#E67E00" rx="1" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Sahara AI</h3>
                                  <p className="text-xs text-blue-100">Your Cohere AI Civic Issue Assistant</p>
                <div className="flex items-center space-x-1 mt-1">
                  <div className={`w-2 h-2 rounded-full ${cohereService.isAvailable() ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <span className="text-xs text-blue-100">
                    {cohereService.isAvailable() ? 'Cohere AI Powered' : 'Fallback Mode'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Full Screen Toggle */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="text-white hover:text-gray-200 transition-colors p-1"
                title={isFullScreen ? "Minimize" : "Full Screen"}
              >
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsFullScreen(false)
                }}
                className="text-white hover:text-gray-200 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className={`flex-1 overflow-y-auto p-3 space-y-2 ${
            isFullScreen ? 'p-6 space-y-4' : 'p-3 space-y-2'
          }`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-2 py-1.5 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  } ${
                    isFullScreen ? 'max-w-2xl px-4 py-3 text-base' : 'max-w-xs px-2 py-1.5 text-sm'
                  }`}
                >
                  <p className={isFullScreen ? 'text-base' : 'text-xs'}>{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className={`bg-gray-100 text-gray-800 px-2 py-1.5 rounded-lg ${
                  isFullScreen ? 'px-4 py-3' : 'px-2 py-1.5'
                }`}>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className={`border-t border-gray-200 ${
            isFullScreen ? 'p-6' : 'p-3'
          }`}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about civic issues..."
                className={`flex-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isFullScreen 
                    ? 'px-4 py-3 text-base' 
                    : 'px-2 py-1.5 text-xs'
                }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className={`bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isFullScreen ? 'p-3' : 'p-1.5'
                }`}
              >
                <Send className={isFullScreen ? 'h-5 w-5' : 'h-3 w-3'} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SaharaChatbot
