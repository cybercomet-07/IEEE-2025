# 🚀 CityPulse Quick Start Guide

Get CityPulse up and running in 10 minutes!

## ⚡ Quick Setup

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/citypulse.git
cd citypulse
npm install
```

### 2. Run Setup Wizard
```bash
npm run setup
```
This will guide you through configuring Firebase and API keys.

### 3. Start Development
```bash
npm run dev
```

Your CityPulse app will be running at `http://localhost:5173`! 🎉

## 🔥 Firebase Setup (Required)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create Project"
   - Enable Authentication, Firestore, Storage, and Functions

2. **Get Configuration**
   - Click the gear icon → Project Settings
   - Scroll down to "Your apps"
   - Click the web app icon (</>)
   - Copy the config object

3. **Run Setup Wizard**
   ```bash
   npm run setup
   ```
   Paste your Firebase config when prompted.

## 📱 WhatsApp Integration (Optional)

1. **Create Twilio Account**
   - Sign up at [Twilio](https://www.twilio.com/)
   - Get Account SID and Auth Token

2. **WhatsApp Setup**
   - Go to Twilio Console → Messaging → Try it out
   - Send a message to join WhatsApp sandbox
   - Note your WhatsApp number

3. **Configure in Setup Wizard**
   - Run `npm run setup` again
   - Enter your Twilio credentials

## 📸 Social Media (Optional)

### Instagram
1. Create [Meta Developer](https://developers.facebook.com/) account
2. Create Facebook App
3. Connect Instagram Business account
4. Get access token and page ID

### Twitter
1. Apply for [Twitter Developer](https://developer.twitter.com/) account
2. Create app
3. Get bearer token

## 🚀 Deploy

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Vercel
```bash
npm run build
vercel --prod
```

## 🎯 Test the App

1. **Create Account** - Sign up with email or Google
2. **Report Issue** - Upload photo, add description, set location
3. **View Map** - See your issue on the interactive map
4. **Admin Features** - Change user role to 'admin' in Firestore for admin access

## 🔧 Troubleshooting

### Common Issues

**"Firebase not configured"**
- Run `npm run setup` and enter Firebase credentials

**"Functions not working"**
- Deploy functions: `firebase deploy --only functions`
- Check Firebase Console → Functions for errors

**"WhatsApp not receiving messages"**
- Verify Twilio webhook URL in Firebase Functions
- Check Twilio Console for message logs

**"Social media posting failed"**
- Verify API tokens in Firebase Functions config
- Check function logs in Firebase Console

### Get Help

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/yourusername/citypulse/issues)
- 💬 [Discussions](https://github.com/yourusername/citypulse/discussions)

## 🎉 You're All Set!

CityPulse is now running with:
- ✅ User authentication
- ✅ Issue reporting and tracking
- ✅ Interactive map
- ✅ WhatsApp integration (if configured)
- ✅ Social media automation (if configured)
- ✅ PWA support
- ✅ Push notifications

**Happy civic issue reporting! 🏗️✨**
