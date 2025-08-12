# Community Discussion Feature

## Overview
The Community Discussion feature allows citizens to engage with each other by posting comments, replying to discussions, and voting on content. This creates a collaborative environment where citizens can share thoughts, ask questions, and provide feedback on civic matters.

## Features

### 1. Comment System
- **Post Comments**: Citizens can post comments up to 1000 characters
- **Real-time Updates**: Comments appear instantly using Firebase real-time listeners
- **User Verification**: Shows verification status for email-verified users

### 2. Reply System
- **Nested Replies**: Users can reply to main comments
- **Reply Limits**: Replies are limited to 500 characters
- **Visual Hierarchy**: Replies are visually distinguished from main comments

### 3. Voting System
- **Like/Dislike**: Users can like or dislike both comments and replies
- **One Vote Per User**: Users can only vote once per comment/reply
- **Toggle Voting**: Users can change their vote or remove it

### 4. Sorting Options
- **Recent**: Sort by newest comments first
- **Most Liked**: Sort by highest number of likes
- **Trending**: Sort by engagement score (likes - dislikes + replies × 2)

### 5. Engagement Scoring
- **Algorithm**: Engagement = (Likes - Dislikes) + (Replies × 2)
- **Authenticity Indicator**: Higher engagement scores indicate more authentic/helpful content
- **Real-time Updates**: Scores update automatically as users interact

## Technical Implementation

### Database Structure
```javascript
// Collection: communityComments
{
  id: "auto-generated",
  text: "comment text",
  userId: "user_uid",
  userName: "display name",
  userEmail: "email",
  timestamp: "server timestamp",
  likes: ["user_id1", "user_id2"],
  dislikes: ["user_id3"],
  replies: [
    {
      text: "reply text",
      userId: "user_uid",
      userName: "display name",
      userEmail: "email",
      timestamp: "server timestamp",
      likes: ["user_id1"],
      dislikes: ["user_id2"],
      isVerified: true/false
    }
  ],
  engagement: 5,
  isVerified: true/false
}
```

### Key Components
- **CommunityDiscussion.jsx**: Main page component
- **Firebase Integration**: Real-time data synchronization
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Toast Notifications**: User feedback for actions

### Security Features
- **User Authentication**: Only authenticated users can post
- **Input Validation**: Character limits and content validation
- **Rate Limiting**: Built-in protection against spam

## User Experience

### For Citizens
- Easy-to-use comment interface
- Real-time engagement with community
- Visual feedback for interactions
- Mobile-responsive design

### For Administrators
- Monitor community sentiment
- Identify trending topics
- Engage with citizen feedback
- Quick access from admin dashboard

## Navigation
- **Main Route**: `/community`
- **Navigation Menu**: Added to Layout component
- **Quick Access**: Available from Citizen and Admin dashboards
- **Home Page**: Featured in footer and features section

## Future Enhancements
- **Moderation Tools**: Admin controls for inappropriate content
- **Content Filtering**: Category-based discussion organization
- **Notification System**: Alerts for replies and mentions
- **Analytics Dashboard**: Community engagement metrics
- **Rich Media Support**: Image and video sharing in comments

## Usage Guidelines
1. **Be Respectful**: Maintain civil discourse
2. **Stay On Topic**: Focus on civic and community issues
3. **Provide Value**: Share helpful insights and information
4. **Engage Constructively**: Use likes/dislikes to promote quality content

## Technical Requirements
- Firebase Firestore database
- User authentication system
- Real-time listeners
- Responsive CSS framework (Tailwind CSS)
- React Router for navigation
- Toast notifications for user feedback
