# CityPulse Project Structure

## Overview
CityPulse is a smart civic issue reporting and tracking platform built with React, Firebase, and modern web technologies.

## Project Structure

```
CityPlus-main/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   ├── MapComponent.jsx # Interactive map component
│   │   ├── SocialMediaEscalation.jsx
│   │   └── WhatsAppIntegration.jsx
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.jsx  # Authentication state management
│   │   ├── IssueContext.jsx # Issues data management
│   │   └── ThemeContext.jsx # Dark/light theme management
│   ├── pages/               # Main application pages
│   │   ├── AdminDashboard.jsx    # Admin interface
│   │   ├── CitizenDashboard.jsx  # Citizen dashboard
│   │   ├── Home.jsx              # Landing page
│   │   ├── IssueDetail.jsx       # Issue details view
│   │   ├── IssueForm.jsx         # Issue reporting form
│   │   ├── Login.jsx             # User login
│   │   ├── MapView.jsx           # Map view of issues
│   │   ├── Profile.jsx           # User profile
│   │   ├── Register.jsx          # User registration
│   │   └── RoleSelection.jsx     # Role selection page
│   ├── config/              # Configuration files
│   │   └── firebase.js      # Firebase configuration
│   ├── services/            # External service integrations
│   │   └── messaging.js     # Messaging services
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles and animations
├── public/                  # Static assets
├── functions/               # Firebase Cloud Functions
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.js           # Vite build configuration
└── README.md                # Project documentation
```

## Key Features

### 1. Issue Management
- **IssueForm**: Allows citizens to report new civic issues with location, photos, and descriptions
- **IssueContext**: Centralized state management for all issues data
- **Real-time Updates**: Firebase integration for live issue tracking

### 2. Interactive Map
- **MapComponent**: Reusable Leaflet-based map component
- **Google Maps-like Styling**: Professional map appearance
- **Issue Markers**: Color-coded markers based on issue status
- **Interactive Popups**: Click markers to view issue details

### 3. User Roles
- **Citizen Dashboard**: Personal issue tracking and reporting
- **Admin Dashboard**: Issue management and status updates
- **Role-based Access**: Secure access control

### 4. Modern UI/UX
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Theme switching capability
- **Smooth Animations**: CSS animations and transitions
- **Tailwind CSS**: Utility-first styling

## Technical Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Maps**: Leaflet.js with OpenStreetMap
- **Backend**: Firebase (Firestore, Authentication)
- **State Management**: React Context API
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project setup

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd CityPlus-main

# Install dependencies
npm install

# Set up environment variables
cp env.local.example env.local
# Edit env.local with your Firebase config

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file with:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Usage

### For Citizens
1. **Register/Login**: Create an account or sign in
2. **Report Issues**: Use the IssueForm to report civic problems
3. **Track Progress**: Monitor issue status in the dashboard
4. **View Map**: See all issues on an interactive map

### For Admins
1. **Access Dashboard**: Login with admin credentials
2. **Manage Issues**: Update status and add notes
3. **Monitor Statistics**: View issue analytics and trends
4. **Coordinate Response**: Manage issue resolution workflow

## Map Features

### Interactive Elements
- **Zoom Controls**: Standard map zoom in/out
- **Pan Navigation**: Click and drag to move around
- **Marker Clustering**: Groups nearby issues
- **Status-based Colors**: 
  - 🔴 Red: Pending issues
  - 🟡 Yellow: In progress
  - 🟢 Green: Resolved

### Map Styling
- **Google Maps-like**: Professional appearance
- **Custom Markers**: Status-indicating colors
- **Responsive Design**: Works on all screen sizes
- **Performance Optimized**: Efficient rendering

## Issue Workflow

1. **Report**: Citizen submits issue with details and location
2. **Review**: Admin reviews and categorizes issue
3. **Assign**: Issue assigned to appropriate department
4. **Progress**: Status updated as work progresses
5. **Resolution**: Issue marked as resolved
6. **Feedback**: Citizen can provide feedback

## Contributing

### Code Style
- Use functional components with hooks
- Follow React best practices
- Maintain consistent naming conventions
- Add proper error handling

### Testing
- Test issue submission flow
- Verify map functionality
- Check responsive design
- Validate form inputs

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase
```bash
npm run firebase:deploy
```

### Environment Setup
Ensure all environment variables are properly configured for production.

## Troubleshooting

### Common Issues
1. **Map not loading**: Check Leaflet CSS imports
2. **Firebase errors**: Verify environment variables
3. **Build failures**: Clear node_modules and reinstall

### Performance Tips
- Optimize image uploads
- Implement lazy loading for large lists
- Use React.memo for expensive components
- Monitor Firebase usage

## Future Enhancements

- **Real-time Notifications**: Push notifications for issue updates
- **Social Media Integration**: Automatic posting to social platforms
- **Advanced Analytics**: Detailed reporting and insights
- **Mobile App**: Native mobile applications
- **AI Integration**: Smart issue categorization and routing

## Support

For technical support or questions:
- Check the documentation
- Review Firebase console logs
- Test in different browsers
- Verify network connectivity

---

**CityPulse** - Making cities smarter, one issue at a time! 🏙️✨
