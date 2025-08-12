import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { 
  MessageCircle, 
  Reply, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  User, 
  Clock,
  TrendingUp,
  Heart,
  Bell,
  Share2,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const CommunityDiscussion = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, trending
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const commentsRef = collection(db, 'communityComments');
    let q;

    switch (sortBy) {
      case 'popular':
        q = query(commentsRef, orderBy('likes', 'desc'), orderBy('timestamp', 'desc'));
        break;
      case 'trending':
        q = query(commentsRef, orderBy('engagement', 'desc'), orderBy('timestamp', 'desc'));
        break;
      default: // recent
        q = query(commentsRef, orderBy('timestamp', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, sortBy]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData = {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        timestamp: serverTimestamp(),
        likes: [],
        dislikes: [],
        replies: [],
        engagement: 0,
        isVerified: user.emailVerified || false
      };

      await addDoc(collection(db, 'communityComments'), commentData);
      setNewComment('');
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment. Please try again.');
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const replyData = {
        text: replyText.trim(),
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        timestamp: new Date(),
        likes: [],
        dislikes: [],
        replies: [],
        isVerified: user.emailVerified || false
      };

      const commentRef = doc(db, 'communityComments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (commentDoc.exists()) {
        console.log('Comment exists, current data:', commentDoc.data());
        const existingReplies = commentDoc.data().replies || [];
        console.log('Existing replies:', existingReplies);
        const updatedReplies = [...existingReplies, replyData];
        console.log('Updated replies:', updatedReplies);
        
        await updateDoc(commentRef, {
          replies: updatedReplies,
          engagement: (commentDoc.data().engagement || 0) + 1
        });
        
        console.log('Reply saved successfully');
        setReplyText('');
        setReplyTo(null);
        toast.success('Reply posted successfully!');
      } else {
        console.log('Comment does not exist');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply. Please try again.');
    }
  };

  const handleLike = async (commentId, isReply = false, replyIndex = null) => {
    if (!user) return;

    try {
      const commentRef = doc(db, 'communityComments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) return;

      const commentData = commentDoc.data();
      let updatedLikes, updatedDislikes, updatedEngagement;

      if (isReply && replyIndex !== null) {
        // Handle reply like
        const replies = [...commentData.replies];
        const reply = replies[replyIndex];
        
        if (reply.likes.includes(user.uid)) {
          reply.likes = reply.likes.filter(id => id !== user.uid);
        } else {
          reply.likes = [...reply.likes, user.uid];
          reply.dislikes = reply.dislikes.filter(id => id !== user.uid);
        }
        
        updatedReplies = replies;
        updatedEngagement = commentData.engagement + (reply.likes.includes(user.uid) ? 1 : -1);
        
        await updateDoc(commentRef, { 
          replies: updatedReplies,
          engagement: updatedEngagement
        });
      } else {
        // Handle main comment like
        if (commentData.likes.includes(user.uid)) {
          updatedLikes = commentData.likes.filter(id => id !== user.uid);
          updatedEngagement = commentData.engagement - 1;
        } else {
          updatedLikes = [...commentData.likes, user.uid];
          updatedDislikes = commentData.dislikes.filter(id => id !== user.uid);
          updatedEngagement = commentData.engagement + 1;
        }
        
        await updateDoc(commentRef, { 
          likes: updatedLikes,
          dislikes: updatedDislikes,
          engagement: updatedEngagement
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like. Please try again.');
    }
  };

  const handleDislike = async (commentId, isReply = false, replyIndex = null) => {
    if (!user) return;

    try {
      const commentRef = doc(db, 'communityComments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) return;

      const commentData = commentDoc.data();
      let updatedLikes, updatedDislikes, updatedEngagement;

      if (isReply && replyIndex !== null) {
        // Handle reply dislike
        const replies = [...commentData.replies];
        const reply = replies[replyIndex];
        
        if (reply.dislikes.includes(user.uid)) {
          reply.dislikes = reply.dislikes.filter(id => id !== user.uid);
        } else {
          reply.dislikes = [...reply.dislikes, user.uid];
          reply.likes = reply.likes.filter(id => id !== user.uid);
        }
        
        updatedReplies = replies;
        updatedEngagement = commentData.engagement + (reply.dislikes.includes(user.uid) ? -1 : 1);
        
        await updateDoc(commentRef, { 
          replies: updatedReplies,
          engagement: updatedEngagement
        });
      } else {
        // Handle main comment dislike
        if (commentData.dislikes.includes(user.uid)) {
          updatedDislikes = commentData.dislikes.filter(id => id !== user.uid);
          updatedEngagement = commentData.engagement + 1;
        } else {
          updatedDislikes = [...commentData.dislikes, user.uid];
          updatedLikes = commentData.likes.filter(id => id !== user.uid);
          updatedEngagement = commentData.engagement - 1;
        }
        
        await updateDoc(commentRef, { 
          likes: updatedLikes,
          dislikes: updatedDislikes,
          engagement: updatedEngagement
        });
      }
    } catch (error) {
      console.error('Error updating dislike:', error);
      toast.error('Failed to update dislike. Please try again.');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const commentTime = timestamp.toDate();
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getEngagementScore = (comment) => {
    const likes = comment.likes?.length || 0;
    const dislikes = comment.dislikes?.length || 0;
    const replies = comment.replies?.length || 0;
    return likes - dislikes + (replies * 2);
  };

  const handleNotifyCommunity = () => {
    // Create a community alert post
    const alertData = {
      text: "🚨 COMMUNITY ALERT: New civic issue reported that requires community attention. Please review and provide feedback.",
      userId: user.uid,
      userName: user.displayName || user.email,
      userEmail: user.email,
      timestamp: serverTimestamp(),
      likes: [],
      dislikes: [],
      replies: [],
      engagement: 0,
      isVerified: user.emailVerified || false,
      isCommunityAlert: true,
      alertType: "civic_issue"
    };

    // Add the alert to community comments
    addDoc(collection(db, 'communityComments'), alertData)
      .then(() => {
        toast.success('Community notification sent successfully!');
      })
      .catch((error) => {
        console.error('Error sending community notification:', error);
        toast.error('Failed to send community notification. Please try again.');
      });
  };

  const handleShareReport = () => {
    // Generate shareable link
    const shareableLink = `${window.location.origin}/community`;
    
    // Create share data
    const shareData = {
      title: 'CityPulse Community Discussion',
      text: 'Join the community discussion on civic issues and community matters.',
      url: shareableLink
    };

    // Try to use native sharing if available
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          toast.success('Report shared successfully!');
        })
        .catch((error) => {
          console.log('Error sharing:', error);
          // Fallback to copying link
          copyToClipboard(shareableLink);
        });
    } else {
      // Fallback: copy link to clipboard
      copyToClipboard(shareableLink);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
    });
  };

  const downloadAsPDF = () => {
    // Create a simple PDF content
    const content = `
      CityPulse Community Discussion Report
      
      Generated on: ${new Date().toLocaleDateString()}
      User: ${user.displayName || user.email}
      
      This report contains community discussion data and civic issue information.
      
      Total Comments: ${comments.length}
      Total Engagement: ${comments.reduce((sum, comment) => sum + getEngagementScore(comment), 0)}
      
      ---
      Generated by CityPulse Community Platform
    `;

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citypulse-community-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success('Report downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Loading Community Discussion...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <MessageCircle className="inline-block mr-3 text-blue-600" />
            Community Discussion
          </h1>
          <p className="text-lg text-gray-600">
            Share your thoughts, ask questions, and engage with fellow citizens
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={() => handleNotifyCommunity()}
              className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Bell className="w-5 h-5" />
              <span>Notify Community</span>
            </button>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleShareReport()}
                className="flex items-center space-x-3 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Alert</span>
              </button>
              
              <button
                onClick={() => downloadAsPDF()}
                className="flex items-center space-x-3 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock className="inline-block w-4 h-4 mr-2" />
                Recent
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp className="inline-block w-4 h-4 mr-2" />
                Most Liked
              </button>
              <button
                onClick={() => setSortBy('trending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'trending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="inline-block w-4 h-4 mr-2" />
                Trending
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {comments.length} comments
            </div>
          </div>
        </div>

        {/* New Comment Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Share Your Thoughts</h3>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What's on your mind? Share your thoughts, questions, or suggestions..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              maxLength="1000"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {newComment.length}/1000 characters
              </span>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="inline-block w-4 h-4 mr-2" />
                Post Comment
              </button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Main Comment */}
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-800">
                      {comment.userName}
                    </span>
                    {comment.isVerified && (
                      <span className="text-blue-600 text-sm">✓ Verified</span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{comment.text}</p>
                  
                  {/* Engagement Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>Engagement Score: {getEngagementScore(comment)}</span>
                    <span>{comment.replies?.length || 0} replies</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                        comment.likes?.includes(user?.uid)
                          ? 'text-green-600 bg-green-100'
                          : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.likes?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => handleDislike(comment.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                        comment.dislikes?.includes(user?.uid)
                          ? 'text-red-600 bg-red-100'
                          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>{comment.dislikes?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              {replyTo === comment.id && (
                <div className="ml-12 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="3"
                      maxLength="500"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-500">
                        {replyText.length}/500 characters
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => setReplyTo(null)}
                          className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyText.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 space-y-4">
                  {comment.replies.map((reply, replyIndex) => (
                    <div key={replyIndex} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-800">
                              {reply.userName}
                            </span>
                            {reply.isVerified && (
                              <span className="text-blue-600 text-xs">✓ Verified</span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(reply.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{reply.text}</p>
                          
                          {/* Reply Action Buttons */}
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleLike(comment.id, true, replyIndex)}
                              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                                reply.likes?.includes(user?.uid)
                                  ? 'text-green-600 bg-green-100'
                                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{reply.likes?.length || 0}</span>
                            </button>
                            <button
                              onClick={() => handleDislike(comment.id, true, replyIndex)}
                              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                                reply.dislikes?.includes(user?.uid)
                                  ? 'text-red-600 bg-red-100'
                                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              }`}
                            >
                              <ThumbsDown className="w-3 h-3" />
                              <span>{reply.dislikes?.length || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {comments.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No comments yet</h3>
            <p className="text-gray-500">Be the first to start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDiscussion;
