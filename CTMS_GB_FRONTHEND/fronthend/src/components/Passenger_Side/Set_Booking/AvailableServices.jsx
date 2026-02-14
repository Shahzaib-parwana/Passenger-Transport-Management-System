import React from "react";
import coasterIcon from "./icons/coaster.png";
import busIcon from "./icons/bus.png";
import carIcon from "./icons/car.png";
import hiaceIcon from "./icons/hiace.png";

export default function AvailableServices({ setStep, setSelectedService }) {
  const services = [
    { name: "Coaster", icon: coasterIcon, color: "bg-gradient-to-br from-blue-400 to-cyan-500" },
    { name: "Bus", icon: busIcon, color: "bg-gradient-to-br from-green-400 to-emerald-500" },
    { name: "Car", icon: carIcon, color: "bg-gradient-to-br from-purple-400 to-pink-500" },
    { name: "Hiace", icon: hiaceIcon, color: "bg-gradient-to-br from-orange-400 to-red-500" },
  ];

  const handleSelect = (service) => {
    setSelectedService(service);
    setStep("passengerCardList");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-slate-800 to-gray-900 p-6 md:p-8 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">🚌 Available Services</h2>
            <p className="text-slate-300 text-lg">Select your preferred travel option</p>
          </div>

          {/* Services Grid */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {services.map((s) => (
                <div
                  key={s.name}
                  onClick={() => handleSelect(s.name)}
                  className="group bg-gradient-to-br from-white to-gray-50 border border-gray-300 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:border-transparent"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Icon Container */}
                    <div className={`${s.color} w-20 h-20 rounded-2xl p-4 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
                      <img 
                        src={s.icon} 
                        alt={s.name}
                        className="w-12 h-12 object-contain filter drop-shadow-lg"
                      />
                    </div>
                    
                    {/* Service Name */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{s.name}</h3>
                    
                    {/* Hover Indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-full shadow-md">
                        Select ✓
                      </span>
                    </div>
                    
                    {/* Default Indicator */}
                    <div className="opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                      <span className="text-gray-500 text-sm">Click to select</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-gray-200">
              {/* Previous Button */}
              <button
                onClick={() => setStep("bookingForm")}
                className="group flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-x-1 min-w-[180px] justify-center"
              >
                <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                <span>Back to Booking</span>
              </button>

              {/* ALL Button */}
              <div className="text-center">
                <button
                  onClick={() => handleSelect("ALL")}
                  className="group relative px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-lg">🌟</span>
                    <span>View All Services</span>
                    <span className="text-lg">🌟</span>
                  </span>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </button>
                <p className="text-gray-500 text-xs mt-2">
                  See complete list of all available vehicles
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}