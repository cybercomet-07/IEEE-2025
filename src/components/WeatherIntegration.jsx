import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, AlertTriangle, Umbrella } from 'lucide-react';

const WeatherIntegration = ({ location, onWeatherUpdate }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simulate weather API call
  useEffect(() => {
    try {
      if (location && location !== 'No location set') {
        setIsLoading(true);
        setHasError(false);
        
        setTimeout(() => {
          try {
            const weather = {
              temperature: Math.floor(Math.random() * 30) + 5,
              condition: ['sunny', 'cloudy', 'rainy', 'stormy'][Math.floor(Math.random() * 4)],
              humidity: Math.floor(Math.random() * 40) + 40,
              windSpeed: Math.floor(Math.random() * 20) + 5,
              precipitation: Math.floor(Math.random() * 100),
              visibility: Math.floor(Math.random() * 20) + 5,
              forecast: [
                { day: 'Today', temp: Math.floor(Math.random() * 30) + 5, condition: 'sunny' },
                { day: 'Tomorrow', temp: Math.floor(Math.random() * 30) + 5, condition: 'rainy' },
                { day: 'Day 3', temp: Math.floor(Math.random() * 30) + 5, condition: 'cloudy' }
              ]
            };
            
            setWeatherData(weather);
            generateWeatherAlerts(weather);
            setIsLoading(false);
            
            if (onWeatherUpdate) {
              onWeatherUpdate(weather);
            }
          } catch (error) {
            console.error('Error generating weather data:', error);
            setHasError(true);
            setErrorMessage('Failed to generate weather data');
            setIsLoading(false);
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error in weather useEffect:', error);
      setHasError(true);
      setErrorMessage('Weather system error');
      setIsLoading(false);
    }
  }, [location, onWeatherUpdate]);

  const generateWeatherAlerts = (weather) => {
    try {
      if (!weather || !weather.condition) return;
      
      const alerts = [];
      
      if (weather.condition === 'stormy') {
        alerts.push({
          type: 'warning',
          message: 'Storm conditions may delay maintenance work',
          icon: AlertTriangle,
          color: 'text-orange-600'
        });
      }
      
      if (weather.precipitation > 80) {
        alerts.push({
          type: 'info',
          message: 'Heavy rain expected - drainage issues may worsen',
          icon: CloudRain,
          color: 'text-blue-600'
        });
      }
      
      if (weather.windSpeed > 15) {
        alerts.push({
          type: 'warning',
          message: 'High winds may affect outdoor maintenance',
          icon: Wind,
          color: 'text-yellow-600'
        });
      }
      
      if (weather.temperature > 30) {
        alerts.push({
          type: 'info',
          message: 'High temperatures - consider worker safety',
          icon: Thermometer,
          color: 'text-red-600'
        });
      }
      
      setWeatherAlerts(alerts);
    } catch (error) {
      console.error('Error generating alerts:', error);
      setWeatherAlerts([]);
    }
  };

  const getWeatherIcon = (condition) => {
    try {
      if (!condition) return Sun;
      const icons = {
        sunny: Sun,
        cloudy: Cloud,
        rainy: CloudRain,
        stormy: CloudRain
      };
      return icons[condition] || Sun;
    } catch (error) {
      console.error('Error getting weather icon:', error);
      return Sun;
    }
  };

  const getWeatherColor = (condition) => {
    try {
      if (!condition) return 'text-gray-500';
      const colors = {
        sunny: 'text-yellow-500',
        cloudy: 'text-gray-500',
        rainy: 'text-blue-500',
        stormy: 'text-purple-500'
      };
      return colors[condition] || 'text-gray-500';
    } catch (error) {
      console.error('Error getting weather color:', error);
      return 'text-gray-500';
    }
  };

  const getMaintenanceImpact = (weather) => {
    try {
      if (!weather || !weather.condition) {
        return ['Weather data unavailable - proceed with caution'];
      }
      
      const impacts = [];
      
      if (weather.condition === 'rainy' || weather.condition === 'stormy') {
        impacts.push('Road work may be delayed');
        impacts.push('Outdoor electrical work suspended');
        impacts.push('Drainage issues may worsen');
      }
      
      if (weather.windSpeed > 15) {
        impacts.push('Tree trimming work suspended');
        impacts.push('High-altitude work restricted');
      }
      
      if (weather.temperature > 30) {
        impacts.push('Worker breaks increased');
        impacts.push('Hydration protocols active');
      }
      
      if (weather.visibility < 10) {
        impacts.push('Traffic control enhanced');
        impacts.push('Safety measures increased');
      }
      
      return impacts.length > 0 ? impacts : ['Weather conditions suitable for all maintenance work'];
    } catch (error) {
      console.error('Error getting maintenance impact:', error);
      return ['Weather analysis error - proceed with caution'];
    }
  };

  // Show error state if there's an error
  if (hasError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Weather Integration</h3>
            <p className="text-sm text-red-600">Error occurred while loading weather data</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <p className="text-red-600 text-center py-4">
            ⚠️ {errorMessage}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setErrorMessage('');
              setWeatherData(null);
              setIsLoading(false);
            }}
            className="mt-3 w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    );
  }

  if (!location || location === 'No location set') {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Select a location to view weather conditions</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Cloud className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Weather Integration</h3>
            <p className="text-sm text-gray-600">Fetching current weather data...</p>
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

  // Don't render weather data if it's not available
  if (!weatherData || !weatherData.condition) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Cloud className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Weather Integration</h3>
            <p className="text-sm text-gray-600">Real-time weather impact on maintenance</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-500 text-center py-8">
            Loading weather data...
          </p>
        </div>
      </div>
    );
  }

  try {
    const IconComponent = getWeatherIcon(weatherData.condition);
    const maintenanceImpacts = getMaintenanceImpact(weatherData);

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Cloud className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Weather Integration</h3>
            <p className="text-sm text-gray-600">Real-time weather impact on maintenance</p>
          </div>
        </div>

        {/* Current Weather */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <IconComponent className={`w-12 h-12 ${getWeatherColor(weatherData.condition)}`} />
              <div>
                <h4 className="text-2xl font-bold text-gray-800">{weatherData.temperature}°C</h4>
                <p className="text-gray-600 capitalize">{weatherData.condition}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{location}</p>
              <p className="text-xs text-gray-400">Current Conditions</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Umbrella className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{weatherData.precipitation}%</p>
              <p className="text-xs text-gray-500">Rain</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Wind className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{weatherData.windSpeed} km/h</p>
              <p className="text-xs text-gray-500">Wind</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Thermometer className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{weatherData.humidity}%</p>
              <p className="text-xs text-gray-500">Humidity</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Cloud className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{weatherData.visibility} km</p>
              <p className="text-xs text-gray-500">Visibility</p>
            </div>
          </div>
        </div>

        {/* Weather Alerts */}
        {weatherAlerts.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Weather Alerts</h4>
            <div className="space-y-2">
              {weatherAlerts.map((alert, index) => {
                try {
                  const AlertIcon = alert.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertIcon className={`w-5 h-5 ${alert.color}`} />
                      <span className="text-sm text-gray-700">{alert.message}</span>
                    </div>
                  );
                } catch (error) {
                  console.error('Error rendering alert:', error);
                  return null;
                }
              })}
            </div>
          </div>
        )}

        {/* Maintenance Impact */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <h4 className="font-medium text-gray-800 mb-3">Maintenance Impact</h4>
          <div className="space-y-2">
            {maintenanceImpacts.map((impact, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-700">{impact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Day Forecast */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">3-Day Forecast</h4>
          <div className="grid grid-cols-3 gap-4">
            {weatherData.forecast && weatherData.forecast.map((day, index) => {
              try {
                const DayIcon = getWeatherIcon(day.condition);
                return (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 mb-2">{day.day}</p>
                    <DayIcon className={`w-8 h-8 ${getWeatherColor(day.condition)} mx-auto mb-2`} />
                    <p className="text-lg font-bold text-gray-800">{day.temp}°C</p>
                    <p className="text-xs text-gray-500 capitalize">{day.condition}</p>
                  </div>
                );
              } catch (error) {
                console.error('Error rendering forecast day:', error);
                return null;
              }
            })}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering WeatherIntegration:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Weather Integration</h3>
            <p className="text-sm text-red-600">Rendering error occurred</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <p className="text-red-600 text-center py-4">
            ⚠️ Component crashed: {error.message}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setErrorMessage('');
              setWeatherData(null);
              setIsLoading(false);
            }}
            className="mt-3 w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            🔄 Reset Component
          </button>
        </div>
      </div>
    );
  }
};

export default WeatherIntegration;
