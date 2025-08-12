# Twilio WhatsApp Integration Setup Guide

This guide explains how to set up and use the Twilio WhatsApp integration for CityPulse issue confirmations.

## 🚀 Quick Start

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables (Optional)
Create a `.env` file in the project root:
```env
TWILIO_ACCOUNT_SID=ACfe5bbaff2d85ae7d367acab4d479e654
TWILIO_AUTH_TOKEN=86acd73e8033dc0856f1fb18123414b5
FROM_WHATSAPP=whatsapp:+14155238886
TO_WHATSAPP=whatsapp:+919923410767
```

### 3. Test the Integration
```bash
python twilio_whatsapp.py
```

## 📱 How It Works

### Frontend Integration
The React frontend (`IssueForm.jsx`) collects the user's phone number and sends it to the backend when an issue is submitted.

### Backend Processing
The Python script (`twilio_whatsapp.py`) handles:
- ✅ **Issue Confirmation**: Sends confirmation to the user's WhatsApp
- 🚨 **Authority Alerts**: Notifies municipal authorities about new issues
- 📊 **Message Formatting**: Creates professional WhatsApp messages with emojis
- 🔄 **Error Handling**: Graceful fallbacks if WhatsApp sending fails

## 🎯 Message Format

### User Confirmation Message
```
✅ Issue Submitted Successfully!

Issue ID: #ISSUE-001
Category: 🚧 Roads & Transport
Priority: 🔴 High
Location: 123 Main Street, Mumbai

Description:
Large pothole in the middle of the road...

Reported by: John Doe
Reported on: 12 August 2025 at 10:30 AM

We have received your report and will review it shortly...
```

### Authority Alert Message
```
🚨 New Issue Reported

Issue ID: #ISSUE-001
Category: Roads Transport
Severity: High
Location: 123 Main Street, Mumbai

Description:
Large pothole in the middle of the road...

Reported by: John Doe
Reported on: 12 August 2025 at 10:30 AM

Please review and take appropriate action.
```

## 🔧 Configuration

### Twilio Credentials
- **Account SID**: `ACfe5bbaff2d85ae7d367acab4d479e654`
- **Auth Token**: `86acd73e8033dc0856f1fb18123414b5`
- **From WhatsApp**: `+14155238886` (Twilio Sandbox)
- **To WhatsApp**: `+919923410767` (Your registered number)

### Environment Variables
| Variable | Description | Default Value |
|----------|-------------|---------------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | `ACfe5bbaff2d85ae7d367acab4d479e654` |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | `86acd73e8033dc0856f1fb18123414b5` |
| `FROM_WHATSAPP` | Twilio WhatsApp number | `whatsapp:+14155238886` |
| `TO_WHATSAPP` | Authority notification number | `whatsapp:+919923410767` |

## 🚀 Production Deployment

### 1. Backend Integration
Integrate the Python script with your backend API:
```python
from twilio_whatsapp import TwilioWhatsAppService

# Initialize service
twilio_service = TwilioWhatsAppService()

# Send confirmation when issue is submitted
result = twilio_service.send_issue_confirmation(issue_data, user_data)
```

### 2. Error Handling
The script includes comprehensive error handling:
- Network failures
- Invalid phone numbers
- Twilio API errors
- Authentication issues

### 3. Logging
All activities are logged to `twilio_whatsapp.log`:
```
2025-08-12 10:30:15 - INFO - WhatsApp message sent successfully to whatsapp:+919923410767
2025-08-12 10:30:16 - INFO - Issue confirmation sent successfully to +919923410767
```

## 🧪 Testing

### Test the Script
```bash
python twilio_whatsapp.py
```

### Expected Output
```
🧪 Testing Twilio WhatsApp Service...
Account SID: ACfe5bbaff2d85ae7d367acab4d479e654
From WhatsApp: whatsapp:+14155238886
To WhatsApp: whatsapp:+919923410767

📱 Testing Issue Confirmation...
Result: {'success': True, 'message_sid': 'SM...', ...}

🚨 Testing Authority Alert...
Result: {'success': True, 'message': 'Alert sent to authorities', ...}

✅ Testing completed!
```

## 🔒 Security Notes

- ✅ Credentials are loaded from environment variables
- ✅ Phone numbers are validated before sending
- ✅ All API calls use HTTPS
- ✅ Error messages don't expose sensitive information
- ✅ Logging excludes personal data

## 📞 Support

If you encounter issues:
1. Check the `twilio_whatsapp.log` file
2. Verify your Twilio credentials
3. Ensure the phone number format is correct (+91XXXXXXXXXX)
4. Check your Twilio account balance and sandbox status

## 🎉 Success!

Once configured, users will automatically receive WhatsApp confirmations when they submit issues, and authorities will be notified about new reports in real-time!
