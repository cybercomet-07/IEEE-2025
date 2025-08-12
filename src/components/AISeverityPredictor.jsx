import React, { useState } from 'react';
import { AlertTriangle, Clock, Shield, TrendingUp, Camera, Brain } from 'lucide-react';

const AISeverityPredictor = ({ issueData, onSeverityUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictedSeverity, setPredictedSeverity] = useState(null);
  const [confidence, setConfidence] = useState(0);

  const severityLevels = {
    critical: { label: 'Critical', color: 'bg-red-500', icon: AlertTriangle, priority: 1 },
    high: { label: 'High', color: 'bg-orange-500', icon: Clock, priority: 2 },
    medium: { label: 'Medium', color: 'bg-yellow-500', icon: TrendingUp, priority: 3 },
    low: { label: 'Low', color: 'bg-green-500', icon: Shield, priority: 4 }
  };

  const analyzeIssue = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with realistic delays
    setTimeout(() => {
      const severity = Math.random() > 0.7 ? 'critical' : 
                      Math.random() > 0.5 ? 'high' : 
                      Math.random() > 0.3 ? 'medium' : 'low';
      
      const conf = Math.floor(Math.random() * 30) + 70; // 70-100% confidence
      
      setPredictedSeverity(severity);
      setConfidence(conf);
      setIsAnalyzing(false);
      
      if (onSeverityUpdate) {
        onSeverityUpdate(severity, conf);
      }
    }, 2000);
  };

  const getSeverityIcon = (level) => {
    const IconComponent = severityLevels[level]?.icon || Shield;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">AI Severity Predictor</h3>
          <p className="text-sm text-gray-600">Advanced ML analysis for issue prioritization</p>
        </div>
      </div>

      {!predictedSeverity ? (
        <div className="text-center">
          <button
            onClick={analyzeIssue}
            disabled={isAnalyzing}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isAnalyzing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isAnalyzing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Analyze Issue Severity</span>
              </div>
            )}
          </button>
          
          {isAnalyzing && (
            <div className="mt-4 text-sm text-gray-600">
              <p>🔍 Analyzing photos and description...</p>
              <p>🤖 Running ML models...</p>
              <p>📊 Calculating risk factors...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${severityLevels[predictedSeverity].color} border-opacity-20`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getSeverityIcon(predictedSeverity)}
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Predicted Severity: {severityLevels[predictedSeverity].label}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Confidence: {confidence}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${severityLevels[predictedSeverity].color}`}>
                  Priority #{severityLevels[predictedSeverity].priority}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-3">AI Analysis Factors:</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Photo Quality: High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Location Risk: Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Description Detail: High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Public Safety: Critical</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setPredictedSeverity(null);
              setConfidence(0);
            }}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
          >
            Re-analyze Issue
          </button>
        </div>
      )}
    </div>
  );
};

export default AISeverityPredictor;
