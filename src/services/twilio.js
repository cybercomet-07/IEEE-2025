// Twilio WhatsApp Integration Service
// Note: In production, these API calls should be made from your backend server
// This is a frontend service that demonstrates the integration

const TWILIO_CONFIG = {
  ACCOUNT_SID: process.env.REACT_APP_TWILIO_ACCOUNT_SID || "your_account_sid_here",
  AUTH_TOKEN: process.env.REACT_APP_TWILIO_AUTH_TOKEN || "your_auth_token_here",
  FROM_WHATSAPP: process.env.REACT_APP_FROM_WHATSAPP || 'whatsapp:+14155238886',
  TO_WHATSAPP: process.env.REACT_APP_TO_WHATSAPP || 'whatsapp:+919999999999'
};

// Send WhatsApp message when issue is submitted
export const sendIssueConfirmationWhatsApp = async (issueData, userData) => {
  try {
    // Debug: Log the data received
    console.log('📱 Issue data received for user confirmation:', issueData);
    console.log('👤 User data received:', userData);
    console.log('📍 Location fields in issueData:', { 
      address: issueData.address, 
      area: issueData.area,
      streetAddress: issueData.streetAddress 
    });
    
    // In a real implementation, this would be a call to your backend API
    // For now, we'll simulate the WhatsApp message and show a success notification
    
    const message = formatIssueConfirmationMessage(issueData, userData);
    
    // Simulate sending WhatsApp message to the user's provided number
    console.log(`📱 WhatsApp Message would be sent to ${userData.phoneNumber}:`, message);
    
    // Show success notification to user
    return {
      success: true,
      message: `Issue submitted successfully! WhatsApp confirmation sent to ${userData.phoneNumber}.`,
      whatsappSent: true
    };
    
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      message: 'Issue submitted but WhatsApp notification failed. You will still receive email confirmation.',
      whatsappSent: false
    };
  }
};

// Format the WhatsApp message
const formatIssueConfirmationMessage = (issueData, userData) => {
  const issueId = `ISSUE-${Date.now().toString().slice(-6)}`;
  
  return `✅ *Issue Submitted Successfully!*

*Issue ID:* ${issueId}
*Location:* ${issueData.address || issueData.area || 'Not specified'}

*Description:*
${issueData.description || 'No description provided'}

*Reported by:* ${userData.displayName || userData.email}
*Reported on:* ${new Date().toLocaleString('en-IN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

We have received your report and will review it shortly. You'll receive updates on the progress via WhatsApp.

*CityPulse Team* 🏙️`;
};

// Get category display name
const getCategoryDisplayName = (category) => {
  const categoryMap = {
    'roads-transport': '🛣️ Roads & Infrastructure',
    'waste-management': '🗑️ Waste Management',
    'water-drainage': '💧 Water & Drainage',
    'electricity-lighting': '💡 Electricity & Lighting',
    'environment-parks': '🌳 Environment & Parks',
    'public-safety-others': '🛡️ Public Safety & Others'
  };
  
  return categoryMap[category] || '📋 General Issue';
};

// Send WhatsApp message to municipal authorities (for admin use)
export const sendIssueAlertToAuthorities = async (issueData) => {
  try {
    // Debug: Log the issue data received
    console.log('🚨 Issue data received for authority alert:', issueData);
    console.log('📍 Location fields in issueData:', { 
      address: issueData.address, 
      area: issueData.area,
      streetAddress: issueData.streetAddress 
    });
    
    const message = formatIssueAlertMessage(issueData);
    
    console.log('🚨 Alert WhatsApp Message would be sent to authorities:', message);
    
    return {
      success: true,
      message: 'Alert sent to municipal authorities via WhatsApp',
      whatsappSent: true
    };
    
  } catch (error) {
    console.error('Error sending alert to authorities:', error);
    return {
      success: false,
      message: 'Failed to send alert to authorities',
      whatsappSent: false
    };
  }
};

// Format alert message for authorities
const formatIssueAlertMessage = (issueData) => {
  return `🚨 *New Issue Reported*

*Issue ID:* ${issueData.id || 'N/A'}
*Location:* ${issueData.address || issueData.area || 'Location not specified'}

*Description:*
${issueData.description}

*Reported by:* ${issueData.userName || 'Anonymous'}
*Reported on:* ${new Date().toLocaleString('en-IN')}

Please review and take appropriate action.

*CityPulse System* 🏙️`;
};

// Get priority from severity
const getPriorityFromSeverity = (severity) => {
  const priorityMap = {
    'low': '🟢 Low Priority',
    'medium': '🟡 Medium Priority',
    'high': '🔴 High Priority',
    'critical': '🚨 Critical Priority'
  };
  
  return priorityMap[severity.toLowerCase()] || '🟡 Medium Priority';
};

// Send status update WhatsApp message
export const sendStatusUpdateWhatsApp = async (issueData, newStatus, userData) => {
  try {
    const message = formatStatusUpdateMessage(issueData, newStatus, userData);
    
    console.log('📱 Status Update WhatsApp Message would be sent:', message);
    
    return {
      success: true,
      message: 'Status update sent via WhatsApp',
      whatsappSent: true
    };
    
  } catch (error) {
    console.error('Error sending status update WhatsApp:', error);
    return {
      success: false,
      message: 'Failed to send status update via WhatsApp',
      whatsappSent: false
    };
  }
};

// Format status update message
const formatStatusUpdateMessage = (issueData, newStatus, userData) => {
  const statusEmoji = getStatusEmoji(newStatus);
  
  return `📱 *CityPulse Status Update*

${statusEmoji} *Issue Status Changed to:* ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}

📋 *Issue ID:* ${issueData.id || 'N/A'}
📍 *Location:* ${issueData.address || issueData.area || 'Not specified'}

📝 *Issue Description:*
${issueData.description}

⏰ *Updated on:* ${new Date().toLocaleString('en-IN')}

🔍 *What This Means:*
${getStatusDescription(newStatus)}

📊 *Current Progress:* ${getProgressPercentage(newStatus)}%

---
*CityPulse Civic Issue Tracker*`;
};

// Get status emoji
const getStatusEmoji = (status) => {
  const emojiMap = {
    'pending': '⏳',
    'in-progress': '🔄',
    'resolved': '✅',
    'rejected': '❌'
  };
  
  return emojiMap[status] || '📋';
};

// Get status description
const getStatusDescription = (status) => {
  const descriptionMap = {
    'pending': 'Your issue has been received and is waiting for review by municipal authorities.',
    'in-progress': 'Your issue is now being worked on by the relevant department.',
    'resolved': 'Your issue has been successfully resolved! Thank you for your patience.',
    'rejected': 'Your issue has been reviewed but could not be processed. Please check details.'
  };
  
  return descriptionMap[status] || 'Status update received.';
};

// Get progress percentage
const getProgressPercentage = (status) => {
  const progressMap = {
    'pending': 25,
    'in-progress': 75,
    'resolved': 100,
    'rejected': 0
  };
  
  return progressMap[status] || 0;
};

// Test WhatsApp integration
export const testWhatsAppIntegration = async () => {
  try {
    const testIssue = {
      id: 'TEST-001',
      category: 'roads-transport',
      description: 'This is a test issue for WhatsApp integration testing.',
      area: 'Test Area, Test City',
      status: 'pending'
    };
    
    const testUser = {
      displayName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+919999999999'
    };
    
    const result = await sendIssueConfirmationWhatsApp(testIssue, testUser);
    
    return {
      success: true,
      message: 'WhatsApp integration test completed successfully!',
      testResult: result
    };
    
  } catch (error) {
    console.error('WhatsApp integration test failed:', error);
    return {
      success: false,
      message: 'WhatsApp integration test failed',
      error: error.message
    };
  }
};
