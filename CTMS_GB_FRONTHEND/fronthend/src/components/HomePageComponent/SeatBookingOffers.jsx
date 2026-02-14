import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BusFront, ArrowRight, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SeatBookingCard from "../Direct_Card_Booking/SeatBooking/Seats_Booking_Card";

export default function SeatBookingOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "/api/search/?offer_type=offer_sets";
  // const API_URL = "http://127.0.0.1:8000/api/search/?offer_type=offer_sets";

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(API_URL, {
          headers: { Accept: "application/json" },
        });
        setOffers(res.data);
      } catch (err) {
        setError(`Failed to load seat offers: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const displayOffers = useMemo(() => {
    if (offers.length <= 6) return offers;
    const shuffled = [...offers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6); // Show 6 cards (2 rows of 3)
  }, [offers]);

  if (loading)
    return (
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-indigo-600 font-semibold">Loading amazing seat offers...</p>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center py-10 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BusFront className="w-8 h-8 text-red-600" />
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
      </section>
    );

  if (displayOffers.length === 0)
    return (
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BusFront className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Seat Offers Available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We're currently updating our seat offers. Please check back later for amazing travel deals.
          </p>
        </motion.div>
      </section>
    );

  return (
    <section className="py-16 px-4 sm:px-6  from-gray-200 via-blue-200 to-sky-200">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Premium Seat Booking
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Seat</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Book individual seats on comfortable buses for your journey. Affordable, reliable, and convenient travel options.
          </p>
        </motion.div>

        {/* Seat Offers Grid - CHANGED TO 3 CARDS PER ROW */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {displayOffers.map((offer, index) => (
            <motion.div
              key={offer.transport_id || offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <SeatBookingCard transport={offer} />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Bar */}
        {offers.length > 0 && (
          <motion.div 
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">{offers.length}</div>
              <div className="text-sm text-gray-600">Total Routes</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-green-600">
                {offers.length}
              </div>
              <div className="text-sm text-gray-600">Available Vehicles</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(offers.map(offer => offer.company_name)).size}
              </div>
              <div className="text-sm text-gray-600">Bus Companies</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(offers.map(offer => offer.route_from)).size}
              </div>
              <div className="text-sm text-gray-600">Departure Cities</div>
            </div>
          </motion.div>
        )}

        {/* View All Button */}
        {offers.length > 6 && (
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={() => navigate("/AllVehiclesPage", { state: { onlySeatOffers: true } })}
              className="
                group relative
                inline-flex items-center
                px-8 py-4
                bg-gradient-to-r from-blue-600 to-indigo-600 
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
                View All {offers.length} Seat Bookings
              </span>
              <ArrowRight className="w-5 h-5 ml-3 relative z-10 transform group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <p className="text-gray-500 mt-4 text-sm">
              Discover our complete collection of seat booking options
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}