#!/usr/bin/env python3
"""
Twilio WhatsApp Integration Script for CityPulse
This script handles sending WhatsApp confirmation messages when users submit issues.
"""

import os
import json
import requests
from datetime import datetime
from typing import Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('twilio_whatsapp.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TwilioWhatsAppService:
    """Service class for handling Twilio WhatsApp messaging"""
    
    def __init__(self):
        # Twilio credentials from environment variables
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID', 'your_account_sid_here')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN', 'your_auth_token_here')
        self.from_whatsapp = os.getenv('FROM_WHATSAPP', 'whatsapp:+14155238886')
        self.to_whatsapp = os.getenv('TO_WHATSAPP', 'whatsapp:+919999999999')
        
        # Twilio API base URL
        self.base_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        
        # Validate credentials
        if not all([self.account_sid, self.auth_token, self.from_whatsapp]):
            logger.error("Missing Twilio credentials. Please check environment variables.")
            raise ValueError("Missing Twilio credentials")
    
    def send_whatsapp_message(self, to_number: str, message: str) -> Dict[str, Any]:
        """
        Send WhatsApp message using Twilio API
        
        Args:
            to_number (str): Recipient's phone number (with country code)
            message (str): Message content to send
            
        Returns:
            Dict containing success status and response details
        """
        try:
            # Format the recipient number for WhatsApp
            if not to_number.startswith('whatsapp:'):
                to_number = f"whatsapp:+{to_number.replace('+', '')}"
            
            # Prepare the request payload
            payload = {
                'From': self.from_whatsapp,
                'To': to_number,
                'Body': message
            }
            
            # Make the API request
            response = requests.post(
                self.base_url,
                data=payload,
                auth=(self.account_sid, self.auth_token),
                timeout=30
            )
            
            if response.status_code == 201:
                response_data = response.json()
                logger.info(f"WhatsApp message sent successfully to {to_number}")
                return {
                    'success': True,
                    'message_sid': response_data.get('sid'),
                    'status': response_data.get('status'),
                    'to': to_number,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                logger.error(f"Failed to send WhatsApp message. Status: {response.status_code}, Response: {response.text}")
                return {
                    'success': False,
                    'error': f"HTTP {response.status_code}",
                    'response': response.text,
                    'to': to_number,
                    'timestamp': datetime.now().isoformat()
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error sending WhatsApp message: {str(e)}")
            return {
                'success': False,
                'error': f"Network error: {str(e)}",
                'to': to_number,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Unexpected error sending WhatsApp message: {str(e)}")
            return {
                'success': False,
                'error': f"Unexpected error: {str(e)}",
                'to': to_number,
                'timestamp': datetime.now().isoformat()
            }
    
    def format_issue_confirmation_message(self, issue_data: Dict[str, Any], user_data: Dict[str, Any]) -> str:
        """
        Format the issue confirmation message for WhatsApp
        
        Args:
            issue_data (Dict): Issue details
            user_data (Dict): User information
            
        Returns:
            Formatted message string
        """
        # Format the message
        message = f"""✅ *Issue Submitted Successfully!*

*Issue ID:* #{issue_data.get('id', 'N/A')}
*Location:* {issue_data.get('address', issue_data.get('area', 'N/A'))}

*Description:*
{issue_data.get('description', 'No description provided')}

*Reported by:* {user_data.get('displayName', user_data.get('email', 'Anonymous'))}
*Reported on:* {datetime.now().strftime('%d %B %Y at %I:%M %p')}

We have received your report and will review it shortly. You'll receive updates on the progress via WhatsApp.

*CityPulse Team* 🏙️"""
        
        return message
    
    def send_issue_confirmation(self, issue_data: Dict[str, Any], user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send issue confirmation message to user's WhatsApp
        
        Args:
            issue_data (Dict): Issue details
            user_data (Dict): User information including phone number
            
        Returns:
            Dict containing success status and details
        """
        try:
            # Get user's phone number
            phone_number = user_data.get('phoneNumber')
            if not phone_number:
                logger.warning("No phone number provided for WhatsApp confirmation")
                return {
                    'success': False,
                    'error': 'No phone number provided',
                    'message': 'Phone number is required for WhatsApp confirmation'
                }
            
            # Format the confirmation message
            message = self.format_issue_confirmation_message(issue_data, user_data)
            
            # Send the WhatsApp message
            result = self.send_whatsapp_message(phone_number, message)
            
            if result['success']:
                logger.info(f"Issue confirmation sent successfully to {phone_number}")
                return {
                    'success': True,
                    'message': f'Issue confirmation sent to {phone_number}',
                    'whatsapp_sent': True,
                    'details': result
                }
            else:
                logger.error(f"Failed to send issue confirmation to {phone_number}: {result.get('error')}")
                return {
                    'success': False,
                    'message': f'Failed to send WhatsApp confirmation: {result.get("error")}',
                    'whatsapp_sent': False,
                    'details': result
                }
                
        except Exception as e:
            logger.error(f"Error sending issue confirmation: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to send issue confirmation',
                'whatsapp_sent': False
            }
    
    def send_issue_alert_to_authorities(self, issue_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send alert message to municipal authorities about new issue
        
        Args:
            issue_data (Dict): Issue details
            
        Returns:
            Dict containing success status and details
        """
        try:
            # Format alert message for authorities
            alert_message = f"""🚨 *New Issue Reported*

*Issue ID:* #{issue_data.get('id', 'N/A')}
*Location:* {issue_data.get('address', issue_data.get('area', 'N/A'))}

*Description:*
{issue_data.get('description', 'No description provided')}

*Reported by:* {issue_data.get('userName', 'Anonymous')}
*Reported on:* {datetime.now().strftime('%d %B %Y at %I:%M %p')}

Please review and take appropriate action.

*CityPulse System* 🏙️"""
            
            # Send to the configured authority number
            result = self.send_whatsapp_message(self.to_whatsapp, alert_message)
            
            if result['success']:
                logger.info("Issue alert sent successfully to authorities")
                return {
                    'success': True,
                    'message': 'Alert sent to authorities',
                    'whatsapp_sent': True
                }
            else:
                logger.error(f"Failed to send alert to authorities: {result.get('error')}")
                return {
                    'success': False,
                    'message': f'Failed to send alert: {result.get("error")}',
                    'whatsapp_sent': False
                }
                
        except Exception as e:
            logger.error(f"Error sending alert to authorities: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to send alert to authorities',
                'whatsapp_sent': False
            }

def main():
    """Main function for testing the service"""
    try:
        # Initialize the service
        twilio_service = TwilioWhatsAppService()
        
        # Test data
        test_issue = {
            'id': 'TEST-001',
            'address': 'Bandra West, Mumbai, Maharashtra',
            'description': 'Broken street light on the main road near Bandra station. The light has been flickering for the past 2 days and completely stopped working today. It\'s creating safety issues for pedestrians at night.',
            'userName': 'Test User'
        }
        
        test_user = {
            'displayName': 'Test User',
            'email': 'test@example.com',
            'phoneNumber': '+919923410767'  # Your registered number
        }
        
        print("🧪 Testing Twilio WhatsApp Service...")
        print(f"Account SID: {twilio_service.account_sid}")
        print(f"From WhatsApp: {twilio_service.from_whatsapp}")
        print(f"To WhatsApp: {twilio_service.to_whatsapp}")
        print()
        
        # Test sending issue confirmation
        print("📱 Testing Issue Confirmation...")
        confirmation_result = twilio_service.send_issue_confirmation(test_issue, test_user)
        print(f"Result: {confirmation_result}")
        print()
        
        # Test sending alert to authorities
        print("🚨 Testing Authority Alert...")
        alert_result = twilio_service.send_issue_alert_to_authorities(test_issue)
        print(f"Result: {alert_result}")
        print()
        
        print("✅ Testing completed!")
        
    except Exception as e:
        print(f"❌ Error in main: {str(e)}")
        logger.error(f"Main function error: {str(e)}")

if __name__ == "__main__":
    main()
