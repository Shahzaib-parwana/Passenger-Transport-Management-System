import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// API Configuration
const API_KEY = "90861656712bf9b071b3713e803e332b";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cities = [
  "Gilgit", "Skardu", "Astore", "Shigar", "Khaplu", 
  "Gizar", "Hunza", "Nagar", "Islamabad", "Rawalpindi",
  "Chilas", "Kharmang", "Chorbat"
];

// Helper functions
const getDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

// Weather Card Component - Professional Design
const WeatherCard = ({ data, onClick, isCurrent, className = "" }) => {
  if (!data) return null;

  const weatherCondition = data.weather?.[0]?.main?.toLowerCase() || "clear";
  const condition = data.weather?.[0]?.description || "Clear sky";

  const getCardGradient = () => {
    if (isCurrent) {
      return "bg-gradient-to-br from-blue-50 via-blue-100 to-yellow-50 border-2 border-blue-200/60 shadow-lg";
    }
    
    switch (weatherCondition) {
      case "clear":
        return "bg-gradient-to-br from-yellow-50 via-yellow-100/80 to-blue-100/80";
      case "clouds":
        return "bg-gradient-to-br from-gray-100 via-blue-100/70 to-blue-200/50";
      case "rain":
      case "drizzle":
        return "bg-gradient-to-br from-blue-100 via-blue-150/80 to-cyan-100";
      case "snow":
        return "bg-gradient-to-br from-blue-100 via-cyan-100/80 to-white";
      case "thunderstorm":
        return "bg-gradient-to-br from-blue-200 via-indigo-100/80 to-purple-100";
      default:
        return "bg-gradient-to-br from-blue-50 via-blue-100/70 to-gray-100";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer group overflow-hidden ${getCardGradient()} ${className}`}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200/20 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-200/20 rounded-full -translate-x-4 translate-y-4"></div>
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isCurrent && (
              <span className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full">
                <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
              </span>
            )}
            <h3 className={`text-xl font-bold ${isCurrent ? 'text-blue-800' : 'text-gray-800'}`}>
              {data.name}
            </h3>
          </div>
          <p className="text-sm text-gray-600 capitalize">{condition}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-3xl font-light text-gray-800">
              {Math.round(data.main.temp)}°C
            </span>
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                alt={condition}
                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                className="w-12 h-12 filter brightness-110 drop-shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="space-y-3 mt-6 relative z-10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span>Feels like</span>
          </div>
          <span className="font-semibold text-gray-800">{Math.round(data.main.feels_like)}°C</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span>Wind</span>
          </div>
          <span className="font-semibold text-gray-800">{data.wind.speed} m/s</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
              </svg>
            </div>
            <span>Humidity</span>
          </div>
          <span className="font-semibold text-gray-800">{data.main.humidity}%</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <span>Pressure</span>
          </div>
          <span className="font-semibold text-gray-800">{data.main.pressure} hPa</span>
        </div>
      </div>

      {/* Action Button */}
      {onClick && (
        <button className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 group-hover:shadow-lg relative z-10 flex items-center justify-center gap-2">
          <span>View Forecast</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Forecast Day Card
const ForecastDayCard = ({ day }) => {
  return (
    <div className="flex-shrink-0 w-32 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm border border-blue-100/50 rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <h3 className="font-bold text-gray-800 text-sm mb-1">
        {day.dayName}
      </h3>
      <p className="text-xs text-blue-600 font-medium mb-2">{day.date.substring(5)}</p>
      
      <div className="flex justify-center mb-2">
        <img
          src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
          alt={day.desc}
          className="w-12 h-12"
        />
      </div>
      
      <p className="text-xs text-gray-600 capitalize mb-3">{day.desc}</p>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-500">H:</span>
          <span className="font-bold text-gray-800">{day.maxTemp}°</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-400">L:</span>
          <span className="font-bold text-gray-800">{day.minTemp}°</span>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState({});
  const [userWeather, setUserWeather] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchWeather, setSearchWeather] = useState(null);
  const [activeTab, setActiveTab] = useState("cities");
  const forecastRef = useRef(null);

  // Get user location weather
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await axios.get(
              `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );
            setUserWeather(res.data);
          } catch (err) {
            console.error("Error fetching user weather", err);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          // Fallback to a default city if user denies location
          fetchWeatherForCity("Islamabad");
        }
      );
    }
  }, []);

  // Fetch weather for a specific city
  const fetchWeatherForCity = async (city) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      setUserWeather(res.data);
    } catch (err) {
      console.error("Error fetching weather for city", err);
    }
  };

  // Load all cities weather
  useEffect(() => {
    const fetchWeather = async () => {
      let data = {};
      for (let city of cities) {
        try {
          const res = await axios.get(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
          data[city] = res.data;
        } catch (err) {
          console.error("Error fetching city weather", city, err);
        }
      }
      setWeatherData(data);
    };
    fetchWeather();
  }, []);

  // Fetch forecast (7-day)
  const fetchForecast = async (city) => {
    setLoading(true);
    setSearchWeather(null);
    try {
      const res = await axios.get(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      // Group by date and calculate daily averages
      const dailyData = {};
      res.data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(item);
      });

      const summary = Object.keys(dailyData).map((date) => {
        const items = dailyData[date];
        const temps = items.map((i) => i.main.temp);
        const middayItem = items.find(item => item.dt_txt.includes('12:00:00')) || items[Math.floor(items.length/2)];

        return {
          date,
          dayName: getDayName(date),
          avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
          minTemp: Math.min(...temps).toFixed(1),
          maxTemp: Math.max(...temps).toFixed(1),
          icon: middayItem.weather[0].icon,
          desc: middayItem.weather[0].description,
        };
      });

      setForecastData(summary.slice(0, 7));
      setSelectedCity(city);
      
      // Scroll to forecast section
      setTimeout(() => {
        forecastRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      console.error("Error fetching forecast", err);
    }
    setLoading(false);
  };

  // Search weather function
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/weather?q=${searchQuery}&appid=${API_KEY}&units=metric`
      );
      setSearchWeather(res.data);
      setActiveTab("search");
    } catch (err) {
      alert(`❌ City "${searchQuery}" not found. Please try again!`);
      setSearchWeather(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200ont-sans">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        {/* Header */}
        <header className="pt-8 pb-6 px-4 sm:px-8 max-w-7xl mx-auto ">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                  Gilgit-Baltistan Weather
                </span>
              </h1>
              <p className="text-gray-600">
                Good {getTimeOfDay()}! Real-time weather updates for your favorite regions
              </p>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full sm:w-auto">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g Gilgit.."
                  className="w-full sm:w-80 px-4 py-3 pl-12 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 placeholder-gray-500 shadow-sm"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "..." : "Search"}
                </button>
              </div>
            </form>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 border-b border-blue-100">
            <button
              onClick={() => setActiveTab("cities")}
              className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${
                activeTab === "cities"
                  ? "bg-white text-blue-600 border border-blue-100 border-b-0 shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
              }`}
            >
              Popular Cities
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${
                activeTab === "search"
                  ? "bg-white text-blue-600 border border-blue-100 border-b-0 shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
              }`}
            >
              Search Results
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-8 max-w-7xl mx-auto pb-16">
          {/* User Location Card */}
          <div className="mb-12" ref={forecastRef}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Your Location</h2>
              <span className="text-sm text-white bg-red-500 px-3 py-1 rounded-full">
                {userWeather ? "Live" : "Detecting..."}
              </span>
            </div>
            {userWeather ? (
              <WeatherCard
                data={userWeather}
                isCurrent={true}
                onClick={() => fetchForecast(userWeather.name)}
                className="max-w-2xl"
              />
            ) : (
              <div className="bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 backdrop-blur-sm rounded-2xl p-12 border-2 border-dashed border-blue-200 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-600">Detecting your location...</p>
                <button
                  onClick={() => fetchWeatherForCity("Islamabad")}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Or use a default city
                </button>
              </div>
            )}
          </div>

          {/* Search Results Section */}
          {activeTab === "search" && searchWeather && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <WeatherCard
                  data={searchWeather}
                  onClick={() => fetchForecast(searchWeather.name)}
                />
              </div>
            </div>
          )}

          {/* Cities Grid */}
          {activeTab === "cities" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Popular Cities in Gilgit-Baltistan
                </h2>
                <p className="text-gray-600">Click on any city to view detailed forecast</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cities.map((city) => {
                  const data = weatherData[city];
                  if (!data) return null;
                  return (
                    <WeatherCard
                      key={city}
                      data={data}
                      onClick={() => fetchForecast(city)}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* Forecast Modal */}
          {selectedCity && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        7-Day Forecast for {selectedCity}
                      </h2>
                      <p className="text-blue-100">Detailed weather outlook</p>
                    </div>
                    <button
                      onClick={() => setSelectedCity(null)}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Forecast Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Forecast Cards - Horizontal Scroll */}
                      <div className="flex space-x-4 pb-6 overflow-x-auto">
                        {forecastData.map((day, index) => (
                          <ForecastDayCard key={day.date} day={day} />
                        ))}
                      </div>

                      {/* Additional Info */}
                      <div className="mt-8 pt-6 border-t border-blue-100">
                        <h3 className="font-bold text-gray-800 mb-4">Additional Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {forecastData[0] && (
                            <>
                              <div className="bg-blue-50/50 rounded-xl p-4">
                                <p className="text-sm text-gray-600">Average Temp</p>
                                <p className="text-xl font-bold text-gray-800">{forecastData[0].avgTemp}°C</p>
                              </div>
                              <div className="bg-yellow-50/50 rounded-xl p-4">
                                <p className="text-sm text-gray-600">High / Low</p>
                                <p className="text-xl font-bold text-gray-800">
                                  {forecastData[0].maxTemp}° / {forecastData[0].minTemp}°
                                </p>
                              </div>
                              <div className="bg-blue-50/50 rounded-xl p-4">
                                <p className="text-sm text-gray-600">Humidity</p>
                                <p className="text-xl font-bold text-gray-800">{forecastData[0].avgHumidity}%</p>
                              </div>
                              <div className="bg-yellow-50/50 rounded-xl p-4">
                                <p className="text-sm text-gray-600">Wind Speed</p>
                                <p className="text-xl font-bold text-gray-800">{forecastData[0].avgWind} m/s</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default WeatherDashboard;