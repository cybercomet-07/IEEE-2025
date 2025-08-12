#!/usr/bin/env python3
"""
Simplified Twilio Integration for CityPulse Frontend
This script can be called directly to send WhatsApp messages
"""

import sys
import json
from twilio_whatsapp import TwilioWhatsAppService

def send_issue_confirmation(phone_number, issue_data_input):
    """
    Send issue confirmation to user's WhatsApp
    
    Args:
        phone_number (str): User's phone number
        issue_data_input (str): JSON string or file path of issue data
    
    Returns:
        JSON string with result
    """
    try:
        # Try to parse as JSON first, then as file path
        try:
            issue_data = json.loads(issue_data_input)
        except json.JSONDecodeError:
            # If not JSON, try to read from file
            try:
                with open(issue_data_input, 'r') as f:
                    issue_data = json.load(f)
            except FileNotFoundError:
                raise ValueError(f"File not found: {issue_data_input}")
            except Exception as e:
                raise ValueError(f"Error reading file: {str(e)}")
        
        # Create user data
        user_data = {
            'phoneNumber': phone_number,
            'displayName': issue_data.get('userName', 'Anonymous'),
            'email': issue_data.get('userEmail', '')
        }
        
        # Initialize Twilio service
        twilio_service = TwilioWhatsAppService()
        
        # Send confirmation
        result = twilio_service.send_issue_confirmation(issue_data, user_data)
        
        # Return JSON result
        return json.dumps(result, indent=2)
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'message': 'Failed to send WhatsApp confirmation'
        }
        return json.dumps(error_result, indent=2)

def send_authority_alert(issue_data_input):
    """
    Send alert to authorities about new issue
    
    Args:
        issue_data_input (str): JSON string or file path of issue data
    
    Returns:
        JSON string with result
    """
    try:
        # Try to parse as JSON first, then as file path
        try:
            issue_data = json.loads(issue_data_input)
        except json.JSONDecodeError:
            # If not JSON, try to read from file
            try:
                with open(issue_data_input, 'r') as f:
                    issue_data = json.load(f)
            except FileNotFoundError:
                raise ValueError(f"File not found: {issue_data_input}")
            except Exception as e:
                raise ValueError(f"Error reading file: {str(e)}")
        
        # Initialize Twilio service
        twilio_service = TwilioWhatsAppService()
        
        # Send alert
        result = twilio_service.send_issue_alert_to_authorities(issue_data)
        
        # Return JSON result
        return json.dumps(result, indent=2)
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'message': 'Failed to send authority alert'
        }
        return json.dumps(error_result, indent=2)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python twilio_integration.py <action> <phone_number> [issue_data_json]")
        print("Actions: confirm, alert")
        print("Example: python twilio_integration.py confirm +919923410767 '{\"id\":\"TEST-001\",\"category\":\"roads-transport\"}'")
        sys.exit(1)
    
    action = sys.argv[1]
    
    if action == "confirm":
        if len(sys.argv) < 4:
            print("Error: Phone number and issue data required for confirmation")
            sys.exit(1)
        
        phone_number = sys.argv[2]
        issue_data_json = sys.argv[3]
        
        result = send_issue_confirmation(phone_number, issue_data_json)
        print(result)
        
    elif action == "alert":
        if len(sys.argv) < 3:
            print("Error: Issue data required for authority alert")
            sys.exit(1)
        
        issue_data_json = sys.argv[2]
        
        result = send_authority_alert(issue_data_json)
        print(result)
        
    else:
        print(f"Unknown action: {action}")
        print("Available actions: confirm, alert")
        sys.exit(1)
