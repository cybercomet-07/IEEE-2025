import React, { useState, useEffect } from 'react';
import { useIssues } from '../contexts/IssueContext';
import { Instagram, Twitter, AlertTriangle, ExternalLink, Calendar, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';

const SocialMediaEscalation = () => {
  const { issues } = useIssues();
  const [escalatedIssues, setEscalatedIssues] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Filter escalated issues
    const escalated = issues.filter(issue => issue.escalated);
    setEscalatedIssues(escalated);
  }, [issues]);

  const getFilteredIssues = () => {
    let filtered = escalatedIssues;

    // Filter by platform
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(issue => 
        issue.socialMediaPosts && issue.socialMediaPosts[selectedPlatform]
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.area?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'instagram':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'twitter':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const handleManualEscalation = async (issueId) => {
    try {
      // This would call the Firebase function to manually escalate
      toast.success('Issue manually escalated to social media');
    } catch (error) {
      toast.error('Failed to escalate issue');
    }
  };

  const filteredIssues = getFilteredIssues();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Social Media Escalation</h2>
            <p className="text-orange-100">
              Monitor and manage issues escalated to social media platforms
            </p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{escalatedIssues.length}</div>
            <div className="text-orange-100">Total Escalated</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {escalatedIssues.filter(i => i.socialMediaPosts?.instagram).length}
            </div>
            <div className="text-orange-100">Instagram Posts</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {escalatedIssues.filter(i => i.socialMediaPosts?.twitter).length}
            </div>
            <div className="text-orange-100">Twitter Posts</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {escalatedIssues.filter(i => i.status === 'resolved').length}
            </div>
            <div className="text-orange-100">Resolved After Escalation</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedPlatform === 'all'
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Platforms
            </button>
            <button
              onClick={() => setSelectedPlatform('instagram')}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
                selectedPlatform === 'instagram'
                  ? 'bg-pink-600 text-white border-pink-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('twitter')}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
                selectedPlatform === 'twitter'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-blue-300 hover:bg-blue-50'
              }`}
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Escalated Issues List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Escalated Issues</h3>
          <p className="text-sm text-gray-600">
            {filteredIssues.length} issue(s) found
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredIssues.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No escalated issues found</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div key={issue.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {issue.description.substring(0, 60)}...
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlatformColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>Reporter: {issue.userName || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>Location: {issue.area || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Escalated: {formatDate(issue.escalatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Social Media Posts:</div>
                        <div className="space-y-2">
                          {issue.socialMediaPosts?.instagram && (
                            <div className="flex items-center space-x-2">
                              {getPlatformIcon('instagram')}
                              <a
                                href={issue.socialMediaPosts.instagram.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:underline text-sm flex items-center space-x-1"
                              >
                                <span>Instagram Post</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {issue.socialMediaPosts?.twitter && (
                            <div className="flex items-center space-x-2">
                              {getPlatformIcon('twitter')}
                              <a
                                href={issue.socialMediaPosts.twitter.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center space-x-1"
                              >
                                <span>Twitter Post</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {issue.mediaUrls && issue.mediaUrls.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Attached Media:</div>
                        <div className="grid grid-cols-3 gap-2">
                          {issue.mediaUrls.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => handleManualEscalation(issue.id)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      Re-escalate
                    </button>
                    <button
                      onClick={() => window.open(`/issue/${issue.id}`, '_blank')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaEscalation;
