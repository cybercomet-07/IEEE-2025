# Gemini AI Integration Setup Guide

## What We've Implemented

✅ **Gemini AI Service**: Created `src/services/gemini.js` that handles API calls to Google's Gemini model
✅ **Updated Chatbot**: Modified `SaharaChatbot.jsx` to use Gemini API instead of hardcoded responses
✅ **Fallback System**: If Gemini API fails, the chatbot falls back to hardcoded responses
✅ **Status Indicator**: Shows whether the chatbot is running in "AI Powered" or "Fallback Mode"

## What You Need to Do

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Set Up Environment Variables

1. Create a `.env.local` file in your project root (same level as `package.json`)
2. Add your Gemini API key:

```bash
VITE_GEMINI_API_KEY=your-actual-api-key-here
```

**Important**: Replace `your-actual-api-key-here` with the real API key you got from Google AI Studio.

### 3. Restart Your Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## How It Works

- **With API Key**: The chatbot will use Gemini AI to generate intelligent, contextual responses
- **Without API Key**: The chatbot will fall back to hardcoded responses (still functional)
- **Status Indicator**: Green dot = "AI Powered", Yellow dot = "Fallback Mode"

## Features

- **Context Awareness**: Remembers conversation history for better responses
- **Civic Issue Focus**: Trained specifically on civic issues and CityPulse features
- **Error Handling**: Gracefully falls back if API calls fail
- **Real-time Responses**: No more simulated delays

## Testing

1. Open your app in the browser
2. Click the Sahara AI chatbot icon
3. Ask questions about civic issues
4. Check the status indicator to confirm AI mode

## Example Questions to Test

- "How do I report a pothole?"
- "What categories of issues can I report?"
- "How does the escalation system work?"
- "Can I upload photos with my report?"

## Troubleshooting

- **"Fallback Mode"**: Check if your API key is correct in `.env.local`
- **API Errors**: Check browser console for detailed error messages
- **No Response**: Ensure your internet connection is working

## Security Note

- Never commit your `.env.local` file to version control
- The API key is only used on the client side for this demo
- For production, consider using a backend proxy for API calls
