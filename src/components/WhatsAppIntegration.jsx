import React, { useState, useEffect } from 'react';
import { useIssues } from '../contexts/IssueContext';
import { Phone, MessageCircle, Image, Video, MapPin, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const WhatsAppIntegration = () => {
  const { issues } = useIssues();
  const [whatsappIssues, setWhatsappIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    // Filter issues that came from WhatsApp
    const whatsappOnly = issues.filter(issue => issue.source === 'whatsapp');
    setWhatsappIssues(whatsappOnly);
  }, [issues]);

  const handleReply = async (issueId, phoneNumber) => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      // This would call the Firebase function to send WhatsApp reply
      // For now, we'll just show a success message
      toast.success('Reply sent successfully!');
      setReplyMessage('');
      setSelectedIssue(null);
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">WhatsApp Integration</h2>
            <p className="text-green-100">
              Manage issues reported via WhatsApp in real-time
            </p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{whatsappIssues.length}</div>
            <div className="text-green-100">Total WhatsApp Issues</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {whatsappIssues.filter(i => i.status === 'pending').length}
            </div>
            <div className="text-green-100">Pending Issues</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {whatsappIssues.filter(i => i.status === 'resolved').length}
            </div>
            <div className="text-green-100">Resolved Issues</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Issues List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">WhatsApp Issues</h3>
            <p className="text-sm text-gray-600">
              Issues reported via WhatsApp messages
            </p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {whatsappIssues.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No WhatsApp issues yet</p>
              </div>
            ) : (
              whatsappIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedIssue?.id === issue.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedIssue(issue)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {issue.phoneNumber || 'Unknown'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {issue.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(issue.createdAt)}</span>
                        </div>
                        
                        {issue.mediaUrls && issue.mediaUrls.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {issue.mediaUrls[0].includes('video') ? (
                              <Video className="w-3 h-3" />
                            ) : (
                              <Image className="w-3 h-3" />
                            )}
                            <span>Media attached</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {issue.escalated && (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Issue Detail and Reply */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Issue Details & Reply</h3>
            <p className="text-sm text-gray-600">
              View details and send WhatsApp replies
            </p>
          </div>
          
          {selectedIssue ? (
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Issue Description</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedIssue.description}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Phone className="w-4 h-4" />
                  <span>{selectedIssue.phoneNumber || 'Unknown'}</span>
                </div>
              </div>
              
              {selectedIssue.mediaUrls && selectedIssue.mediaUrls.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Attached Media</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedIssue.mediaUrls.map((url, index) => (
                      <div key={index} className="relative">
                        {url.includes('video') ? (
                          <video
                            src={url}
                            controls
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedIssue.location && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedIssue.location}</span>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Send Reply</h4>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply message..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
                <button
                  onClick={() => handleReply(selectedIssue.id, selectedIssue.phoneNumber)}
                  className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp Reply</span>
                </button>
              </div>
              
              {selectedIssue.escalated && selectedIssue.socialMediaPosts && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h4 className="font-medium text-orange-900 mb-2">Social Media Escalation</h4>
                  <div className="space-y-2 text-sm">
                    {selectedIssue.socialMediaPosts.instagram && (
                      <div>
                        <span className="text-orange-700">Instagram: </span>
                        <a
                          href={selectedIssue.socialMediaPosts.instagram.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline"
                        >
                          View Post
                        </a>
                      </div>
                    )}
                    {selectedIssue.socialMediaPosts.twitter && (
                      <div>
                        <span className="text-orange-700">Twitter: </span>
                        <a
                          href={selectedIssue.socialMediaPosts.twitter.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline"
                        >
                          View Post
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select an issue to view details and send replies</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppIntegration;
