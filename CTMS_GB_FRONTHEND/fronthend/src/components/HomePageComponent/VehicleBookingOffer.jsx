import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Car, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import VehicalBookingCard from "./Card/Vehical_Booking_Card";
import VehicalBookingCard from "../Direct_Card_Booking/VehicleBooking/Vehical_Booking_Card";

export default function VehicleBookingOffers() {
  const navigate = useNavigate();
  const [vehicleOffers, setVehicleOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "/api/search/?offer_type=whole_hire";
  // const API_URL = "http://127.0.0.1:8000/api/search/?offer_type=whole_hire";

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        
        
        // ✅ Pass complete data objects without filtering or heavy mapping
        const formatted = data
          .filter((item) => item.offer_type === "whole_hire")
          .map((item) => ({
            // Keep existing fields for backward compatibility
            id: item.id,
            company_name: item.company_name || "Vehicle Rental",
            route: item.vehicle_type,
            fare: item.fare || item.rate_per_km || null,
            rating: item.rating || null,
            image: item.vehicle_image,
            vehicle_details: item.vehicle_details,
            location_address: item.location_address || null,
            is_long_drive: !!item.is_long_drive,
            is_specific_route: !!item.is_specific_route,
            type: "whole-hire",
            
            // ✅ NEW: Pass all additional data from backend
            complete_offer: item // Pass the entire object for detailed display
          }));

        setVehicleOffers(formatted);
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const displayedOffers = useMemo(() => {
    if (vehicleOffers.length <= 6) return vehicleOffers;
    const shuffled = [...vehicleOffers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6); // Show 6 cards (2 rows of 3)
  }, [vehicleOffers]);

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Premium Whole Vehicle Hire
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Discover Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Ride</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Book entire vehicles for customized trips. Perfect for long drives, specific routes, and personalized journeys.
        </p>
      </motion.div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-indigo-600 font-semibold">Loading amazing vehicle offers...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Offers</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : displayedOffers.length > 0 ? (
        <>
          {/* Vehicle Grid - CHANGED TO 3 CARDS PER ROW */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {displayedOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <VehicalBookingCard 
                  {...offer} 
                  type="whole-hire" 
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-indigo-600">{vehicleOffers.length}</div>
              <div className="text-sm text-gray-600">Total Vehicles</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-green-600">
                {vehicleOffers.filter(v => v.is_long_drive).length}
              </div>
              <div className="text-sm text-gray-600">Long Drive</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">
                {vehicleOffers.filter(v => v.is_specific_route).length}
              </div>
              <div className="text-sm text-gray-600">Fixed Routes</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-purple-600">
                {vehicleOffers.filter(v => v.complete_offer?.allow_custom_quote).length}
              </div>
              <div className="text-sm text-gray-600">Custom Quotes</div>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Vehicles Available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We're currently updating our fleet. Please check back later for amazing vehicle offers.
          </p>
        </motion.div>
      )}

      {/* View All Button */}
      {vehicleOffers.length > 6 && (
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            onClick={() => navigate("/AllVehiclesPage", { state: { onlyVehicles: true } })}
            className="
              group relative
              inline-flex items-center
              px-8 py-4
              bg-gradient-to-r from-indigo-600 to-purple-600 
              text-white font-semibold text-lg
              rounded-2xl shadow-2xl
              hover:shadow-3xl
              transition-all duration-300
              transform hover:scale-105
              overflow-hidden
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            <span className="relative z-10">
              Explore All {vehicleOffers.length} Vehicles
            </span>
            <ArrowRight className="w-5 h-5 ml-3 relative z-10 transform group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      )}
    </section>
  );
}