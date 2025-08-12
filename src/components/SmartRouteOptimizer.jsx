import React, { useState, useEffect } from 'react';
import { Route, Navigation, Clock, MapPin, Truck, Zap, Target } from 'lucide-react';

const SmartRouteOptimizer = ({ issues, crewLocation }) => {
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [crewType, setCrewType] = useState('general');

  const crewTypes = {
    general: { name: 'General Maintenance', color: 'bg-blue-500', icon: Truck },
    roads: { name: 'Roads & Transport', color: 'bg-orange-500', icon: Route },
    water: { name: 'Water & Drainage', color: 'bg-blue-600', icon: Navigation },
    electrical: { name: 'Electrical', color: 'bg-yellow-500', icon: Zap }
  };

  const optimizeRoute = async () => {
    if (selectedIssues.length < 2) return;
    
    setIsOptimizing(true);
    
    // Simulate route optimization algorithm
    setTimeout(() => {
      const route = {
        totalDistance: Math.floor(Math.random() * 50) + 20,
        estimatedTime: Math.floor(Math.random() * 8) + 4,
        fuelEfficiency: Math.floor(Math.random() * 20) + 80,
        stops: selectedIssues.map((issue, index) => ({
          ...issue,
          order: index + 1,
          estimatedDuration: Math.floor(Math.random() * 2) + 1,
          priority: issue.severity || 'medium'
        })),
        optimization: {
          timeSaved: Math.floor(Math.random() * 3) + 1,
          fuelSaved: Math.floor(Math.random() * 5) + 2,
          efficiency: Math.floor(Math.random() * 15) + 85
        }
      };
      
      setOptimizedRoute(route);
      setIsOptimizing(false);
    }, 3000);
  };

  const handleIssueToggle = (issue) => {
    setSelectedIssues(prev => 
      prev.find(i => i.id === issue.id)
        ? prev.filter(i => i.id !== issue.id)
        : [...prev, issue]
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Route className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Smart Route Optimizer</h3>
          <p className="text-sm text-gray-600">AI-powered route planning for maintenance crews</p>
        </div>
      </div>

      {/* Crew Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Crew Type</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(crewTypes).map(([key, crew]) => {
            const IconComponent = crew.icon;
            return (
              <button
                key={key}
                onClick={() => setCrewType(key)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  crewType === key
                    ? `${crew.color} border-transparent text-white`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-5 h-5" />
                  <span className="text-sm font-medium">{crew.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Issue Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Issues to Include in Route ({selectedIssues.length} selected)
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {issues?.map((issue) => (
            <div
              key={issue.id}
              onClick={() => handleIssueToggle(issue)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedIssues.find(i => i.id === issue.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.severity)}`}></div>
                  <span className="text-sm font-medium text-gray-800">{issue.title}</span>
                  <span className="text-xs text-gray-500">#{issue.id}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{issue.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Button */}
      <button
        onClick={optimizeRoute}
        disabled={selectedIssues.length < 2 || isOptimizing}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          selectedIssues.length < 2 || isOptimizing
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {isOptimizing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Optimizing Route...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Optimize Route ({selectedIssues.length} issues)</span>
          </div>
        )}
      </button>

      {/* Optimized Route Display */}
      {optimizedRoute && (
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">Route Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Route className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-lg font-bold text-gray-800">{optimizedRoute.totalDistance} km</p>
                <p className="text-xs text-gray-500">Total Distance</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-lg font-bold text-gray-800">{optimizedRoute.estimatedTime}h</p>
                <p className="text-xs text-gray-500">Estimated Time</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-lg font-bold text-gray-800">{optimizedRoute.fuelEfficiency}%</p>
                <p className="text-xs text-gray-500">Fuel Efficiency</p>
              </div>
            </div>
          </div>

          {/* Route Stops */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">Optimized Route Order</h4>
            <div className="space-y-3">
              {optimizedRoute.stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {stop.order}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">{stop.title}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(stop.priority)}`}>
                        {stop.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{stop.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{stop.estimatedDuration}h</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Benefits */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-gray-800 mb-3">Optimization Benefits</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{optimizedRoute.optimization.timeSaved}h</p>
                <p className="text-xs text-gray-600">Time Saved</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{optimizedRoute.optimization.fuelSaved}L</p>
                <p className="text-xs text-gray-600">Fuel Saved</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{optimizedRoute.optimization.efficiency}%</p>
                <p className="text-xs text-gray-600">Efficiency</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
              Download Route
            </button>
            <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200">
              Send to Crew
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartRouteOptimizer;
