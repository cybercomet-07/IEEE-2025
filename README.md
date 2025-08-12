# CityPulse - Civic Issue Tracker

A comprehensive civic issue tracking and management system with WhatsApp integration for real-time notifications.

## 🚀 Features

- **User Management**: Citizen registration and authentication
- **Issue Reporting**: Comprehensive issue submission with media support
- **WhatsApp Integration**: Real-time notifications via Twilio
- **Admin Dashboard**: Municipal authority management interface
- **Real-time Updates**: Live status tracking and notifications
- **Mobile Responsive**: Works on all devices

## 🛠️ Tech Stack

- **Frontend**: React.js with Vite
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **WhatsApp**: Twilio API integration
- **Styling**: Tailwind CSS
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3.8+ (for Twilio integration)
- Firebase project
- Twilio account with WhatsApp Business API access

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/cybercomet-07/ieeeeeeeeeeeeeee.git
cd ieeeeeeeeeeeeeee
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Python Dependencies (for Twilio integration)

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Copy the environment example file and configure your credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual credentials:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_actual_account_sid
TWILIO_AUTH_TOKEN=your_actual_auth_token
FROM_WHATSAPP=whatsapp:+14155238886
TO_WHATSAPP=whatsapp:+919999999999

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 Security Features

- **Environment Variables**: All sensitive credentials are stored in `.env` files
- **Git Ignore**: Sensitive files are automatically excluded from version control
- **No Hardcoded Secrets**: All API keys and tokens are externalized

## 📱 WhatsApp Integration

### Frontend Integration
The frontend uses a simulated Twilio service for development. In production, replace with actual API calls.

### Backend Integration
Use the Python scripts for actual Twilio WhatsApp messaging:

```bash
# Send issue confirmation
python twilio_integration.py confirm +919999999999 test_data.json

# Send authority alert
python twilio_integration.py alert test_data.json
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── pages/             # Application pages
├── services/          # External service integrations
└── config/            # Configuration files
```

## 🚨 Important Security Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use environment variables** for all API keys and tokens
3. **Regularly rotate** Twilio and Firebase credentials
4. **Monitor API usage** to prevent abuse

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue on GitHub.

## 🔄 Updates

- **v1.0.0**: Initial release with basic functionality
- **v1.1.0**: Added WhatsApp integration
- **v1.2.0**: Enhanced security and environment configuration
