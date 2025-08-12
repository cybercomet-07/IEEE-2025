import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    console.log('=== Gemini Service Constructor ===');
    console.log('Environment variable:', import.meta.env.VITE_GEMINI_API_KEY);
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('Stored API key:', this.apiKey);
    this.genAI = null;
    this.model = null;
    this.initializeGemini();
  }

  initializeGemini() {
    console.log('Initializing Gemini service...');
    console.log('API Key found:', !!this.apiKey);
    console.log('API Key length:', this.apiKey ? this.apiKey.length : 0);
    
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env.local file');
      return;
    }

    try {
      console.log('Creating GoogleGenerativeAI instance...');
      console.log('API Key being used:', this.apiKey);
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      console.log('GoogleGenerativeAI instance created successfully');
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('Gemini model initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
  }

  async generateResponse(userMessage, conversationHistory = []) {
    console.log('generateResponse called with:', userMessage);
    console.log('Model available:', !!this.model);
    
    if (!this.model) {
      console.log('No model available, using fallback response');
      return this.getFallbackResponse(userMessage);
    }

    try {
      // Create context for civic issues
      const systemPrompt = `You are Sahara, an AI assistant for CityPulse - a smart civic issue reporting platform. You help citizens with:

1. Reporting civic issues (roads, waste, water, electricity, environment, safety)
2. Understanding the platform features
3. Tracking issue status
4. Using location services and media uploads
5. Understanding escalation processes
6. General civic issue guidance

Keep responses helpful, concise, and focused on civic issues. If someone asks about non-civic topics, politely redirect them to civic issues.`;

      // Build conversation context
      let conversationText = systemPrompt + '\n\n';
      
      if (conversationHistory.length > 0) {
        conversationText += 'Previous conversation:\n';
        conversationHistory.forEach(msg => {
          conversationText += `${msg.sender === 'user' ? 'User' : 'Sahara'}: ${msg.text}\n`;
        });
        conversationText += '\n';
      }
      
      conversationText += `User: ${userMessage}\nSahara:`;

      const result = await this.model.generateContent(conversationText);
      const response = await result.response;
      return response.text().trim();

    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  getFallbackResponse(userInput) {
    const input = userInput.toLowerCase();
    
    if (input.includes('report') || input.includes('issue') || input.includes('problem')) {
      return "To report a civic issue, click on 'Report Issue' in your dashboard. You can upload photos, describe the problem, and use your current location for accurate reporting.";
    }
    
    if (input.includes('status') || input.includes('track') || input.includes('update')) {
      return "You can track your reported issues in your dashboard. Each issue shows its current status: Pending, In Progress, or Resolved. You'll also get notifications when status changes.";
    }
    
    if (input.includes('category') || input.includes('type')) {
      return "We have 6 main categories: Roads & Transport, Waste Management, Water & Drainage, Electricity & Lighting, Environment & Parks, and Public Safety & Others.";
    }
    
    if (input.includes('location') || input.includes('gps') || input.includes('coordinates')) {
      return "When reporting an issue, you can use the 'Use Current Location' button to automatically capture your GPS coordinates, or manually enter the address.";
    }
    
    if (input.includes('photo') || input.includes('image') || input.includes('media')) {
      return "Yes, you can upload photos and videos when reporting issues. This helps authorities better understand the problem. Supported formats include JPG, PNG, GIF, and MP4.";
    }
    
    if (input.includes('escalate') || input.includes('social media')) {
      return "Issues that remain unresolved for 3 days are automatically escalated to social media platforms like Instagram and Twitter to get more attention from authorities.";
    }
    
    if (input.includes('admin') || input.includes('authority')) {
      return "Admins can update issue statuses, add notes, and manage all reported issues. They also handle social media escalations and WhatsApp integrations.";
    }
    
    if (input.includes('whatsapp')) {
      return "You can report issues via WhatsApp by sending photos/videos with descriptions. Our bot will automatically process these and create issue reports in the system.";
    }
    
    if (input.includes('help') || input.includes('support')) {
      return "I'm here to help! You can ask me about reporting issues, tracking status, categories, location services, media uploads, or any other civic issue related questions.";
    }
    
    return "I understand you're asking about civic issues. Could you please be more specific? I can help with reporting, tracking, categories, location services, and more.";
  }

  isAvailable() {
    return !!this.model;
  }
}

// Create a singleton instance
const geminiService = new GeminiService();
export default geminiService;
