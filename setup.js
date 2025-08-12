#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🏗️  CityPulse Setup Wizard');
console.log('==========================\n');

const questions = [
  {
    name: 'firebaseApiKey',
    question: 'Enter your Firebase API Key: ',
    required: true
  },
  {
    name: 'firebaseAuthDomain',
    question: 'Enter your Firebase Auth Domain: ',
    required: true
  },
  {
    name: 'firebaseProjectId',
    question: 'Enter your Firebase Project ID: ',
    required: true
  },
  {
    name: 'firebaseStorageBucket',
    question: 'Enter your Firebase Storage Bucket: ',
    required: true
  },
  {
    name: 'firebaseMessagingSenderId',
    question: 'Enter your Firebase Messaging Sender ID: ',
    required: true
  },
  {
    name: 'firebaseAppId',
    question: 'Enter your Firebase App ID: ',
    required: true
  },
  {
    name: 'twilioAccountSid',
    question: 'Enter your Twilio Account SID (optional): ',
    required: false
  },
  {
    name: 'twilioAuthToken',
    question: 'Enter your Twilio Auth Token (optional): ',
    required: false
  },
  {
    name: 'twilioWhatsappNumber',
    question: 'Enter your Twilio WhatsApp Number (optional): ',
    required: false
  },
  {
    name: 'metaAccessToken',
    question: 'Enter your Meta Graph API Access Token (optional): ',
    required: false
  },
  {
    name: 'metaPageId',
    question: 'Enter your Instagram Page ID (optional): ',
    required: false
  },
  {
    name: 'twitterBearerToken',
    question: 'Enter your Twitter Bearer Token (optional): ',
    required: false
  }
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    finishSetup();
    return;
  }

  const question = questions[index];
  
  rl.question(question.question, (answer) => {
    if (question.required && !answer.trim()) {
      console.log('❌ This field is required. Please try again.\n');
      askQuestion(index);
    } else {
      answers[question.name] = answer.trim();
      askQuestion(index + 1);
    }
  });
}

function finishSetup() {
  rl.close();
  
  console.log('\n🔧 Configuring CityPulse...\n');
  
  try {
    // Update Firebase config
    updateFirebaseConfig();
    
    // Update Firebase functions config
    updateFirebaseFunctionsConfig();
    
    // Create environment file
    createEnvFile();
    
    console.log('✅ Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: cd functions && npm install && cd ..');
    console.log('3. Run: firebase login');
    console.log('4. Run: firebase use --add');
    console.log('5. Run: firebase deploy --only firestore:rules,storage');
    console.log('6. Run: firebase deploy --only functions');
    console.log('7. Run: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

function updateFirebaseConfig() {
  const firebaseConfigPath = path.join(__dirname, 'src', 'config', 'firebase.js');
  
  if (!fs.existsSync(firebaseConfigPath)) {
    console.log('⚠️  Firebase config file not found. Please create it manually.');
    return;
  }
  
  let content = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  content = content.replace(/apiKey: ".*?"/, `apiKey: "${answers.firebaseApiKey}"`);
  content = content.replace(/authDomain: ".*?"/, `authDomain: "${answers.firebaseAuthDomain}"`);
  content = content.replace(/projectId: ".*?"/, `projectId: "${answers.firebaseProjectId}"`);
  content = content.replace(/storageBucket: ".*?"/, `storageBucket: "${answers.firebaseStorageBucket}"`);
  content = content.replace(/messagingSenderId: ".*?"/, `messagingSenderId: "${answers.firebaseMessagingSenderId}"`);
  content = content.replace(/appId: ".*?"/, `appId: "${answers.firebaseAppId}"`);
  
  fs.writeFileSync(firebaseConfigPath, content);
  console.log('✅ Firebase config updated');
}

function updateFirebaseFunctionsConfig() {
  console.log('📝 Firebase Functions configuration commands:');
  console.log('Run these commands after deploying functions:');
  console.log('');
  
  if (answers.twilioAccountSid) {
    console.log(`firebase functions:config:set twilio.account_sid="${answers.twilioAccountSid}"`);
  }
  if (answers.twilioAuthToken) {
    console.log(`firebase functions:config:set twilio.auth_token="${answers.twilioAuthToken}"`);
  }
  if (answers.twilioWhatsappNumber) {
    console.log(`firebase functions:config:set twilio.whatsapp_number="${answers.twilioWhatsappNumber}"`);
  }
  if (answers.metaAccessToken) {
    console.log(`firebase functions:config:set meta.access_token="${answers.metaAccessToken}"`);
  }
  if (answers.metaPageId) {
    console.log(`firebase functions:config:set meta.page_id="${answers.metaPageId}"`);
  }
  if (answers.twitterBearerToken) {
    console.log(`firebase functions:config:set twitter.bearer_token="${answers.twitterBearerToken}"`);
  }
  
  console.log('');
}

function createEnvFile() {
  const envContent = `# CityPulse Environment Variables
REACT_APP_FIREBASE_API_KEY=${answers.firebaseApiKey}
REACT_APP_FIREBASE_AUTH_DOMAIN=${answers.firebaseAuthDomain}
REACT_APP_FIREBASE_PROJECT_ID=${answers.firebaseProjectId}
REACT_APP_FIREBASE_STORAGE_BUCKET=${answers.firebaseStorageBucket}
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${answers.firebaseMessagingSenderId}
REACT_APP_FIREBASE_APP_ID=${answers.firebaseAppId}

# Optional: Social Media APIs
REACT_APP_TWILIO_ACCOUNT_SID=${answers.twilioAccountSid || ''}
REACT_APP_TWILIO_AUTH_TOKEN=${answers.twilioAuthToken || ''}
REACT_APP_TWILIO_WHATSAPP_NUMBER=${answers.twilioWhatsappNumber || ''}
REACT_APP_META_ACCESS_TOKEN=${answers.metaAccessToken || ''}
REACT_APP_META_PAGE_ID=${answers.metaPageId || ''}
REACT_APP_TWITTER_BEARER_TOKEN=${answers.twitterBearerToken || ''}
`;
  
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Environment file created (.env.local)');
}

// Start the setup process
askQuestion(0);
