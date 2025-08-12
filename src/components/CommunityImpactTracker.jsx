import React, { useState, useEffect } from 'react';
import { Users, MapPin, TrendingUp, Heart, MessageCircle, Share2 } from 'lucide-react';

const CommunityImpactTracker = ({ issueLocation, issueType }) => {
  const [impactData, setImpactData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate fetching community impact data
  useEffect(() => {
    try {
      if (issueLocation && issueType && issueLocation !== 'No location set' && issueType !== 'No category set') {
        setIsLoading(true);
        setTimeout(() => {
          try {
            setImpactData({
              populationDensity: Math.floor(Math.random() * 5000) + 1000,
              affectedRadius: Math.floor(Math.random() * 2) + 0.5,
              nearbySchools: Math.floor(Math.random() * 5) + 1,
              nearbyHospitals: Math.floor(Math.random() * 3) + 0,
              publicTransportRoutes: Math.floor(Math.random() * 8) + 2,
              communityEngagement: Math.floor(Math.random() * 40) + 60,
              estimatedAffected: Math.floor(Math.random() * 500) + 100,
              priorityScore: Math.floor(Math.random() * 30) + 70
            });
            setIsLoading(false);
          } catch (error) {
            console.error('Error generating impact data:', error);
            setImpactData(null);
            setIsLoading(false);
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error in impact useEffect:', error);
      setImpactData(null);
      setIsLoading(false);
    }
  }, [issueLocation, issueType]);

  const getImpactLevel = (score) => {
    try {
      if (!score || typeof score !== 'number') return { level: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' };
      if (score >= 80) return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
      if (score >= 60) return { level: 'Medium', color: 'text-orange-600', bg: 'bg-orange-100' };
      return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    } catch (error) {
      console.error('Error getting impact level:', error);
      return { level: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getPriorityColor = (score) => {
    try {
      if (!score || typeof score !== 'number') return 'bg-gray-500';
      if (score >= 85) return 'bg-red-500';
      if (score >= 70) return 'bg-orange-500';
      return 'bg-yellow-500';
    } catch (error) {
      console.error('Error getting priority color:', error);
      return 'bg-gray-500';
    }
  };

  if (!issueLocation || !issueType) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Select an issue location to analyze community impact</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Community Impact Analysis</h3>
            <p className="text-sm text-gray-600">Calculating population and infrastructure impact...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-blue-200 rounded"></div>
          <div className="h-4 bg-blue-200 rounded w-3/4"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Don't render if impactData is not available
  if (!impactData) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Community Impact Tracker</h3>
            <p className="text-sm text-gray-600">Population density and infrastructure analysis</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-500 text-center py-8">
            Loading community impact data...
          </p>
        </div>
      </div>
    );
  }

  const impactLevel = getImpactLevel(impactData.priorityScore);
  
  try {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Community Impact Tracker</h3>
          <p className="text-sm text-gray-600">Population density and infrastructure analysis</p>
        </div>
      </div>

      {/* Priority Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Priority Score</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(impactData.priorityScore)}`}>
            {impactData.priorityScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getPriorityColor(impactData.priorityScore)}`}
            style={{ width: `${impactData.priorityScore}%` }}
          ></div>
        </div>
      </div>

      {/* Impact Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Population Density</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{impactData.populationDensity.toLocaleString()}</p>
          <p className="text-xs text-gray-500">people/km²</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Affected Radius</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{impactData.affectedRadius}</p>
          <p className="text-xs text-gray-500">kilometers</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Estimated Affected</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{impactData.estimatedAffected.toLocaleString()}</p>
          <p className="text-xs text-gray-500">citizens</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Engagement</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{impactData.communityEngagement}%</p>
          <p className="text-xs text-gray-500">community response</p>
        </div>
      </div>

      {/* Infrastructure Impact */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
        <h4 className="font-medium text-gray-800 mb-3">Infrastructure Impact</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-semibold">{impactData.nearbySchools}</span>
            </div>
            <p className="text-gray-600">Nearby Schools</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-red-600 font-semibold">{impactData.nearbyHospitals}</span>
            </div>
            <p className="text-gray-600">Hospitals</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-semibold">{impactData.publicTransportRoutes}</span>
            </div>
            <p className="text-gray-600">Transport Routes</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
          <MessageCircle className="w-4 h-4" />
          <span>Notify Community</span>
        </button>
        <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
          <Share2 className="w-4 h-4" />
          <span>Share Alert</span>
        </button>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Error rendering CommunityImpactTracker:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Users className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Community Impact Tracker</h3>
            <p className="text-sm text-red-600">Rendering error occurred</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <p className="text-red-600 text-center py-4">
            ⚠️ Component crashed: {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            🔄 Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default CommunityImpactTracker;
