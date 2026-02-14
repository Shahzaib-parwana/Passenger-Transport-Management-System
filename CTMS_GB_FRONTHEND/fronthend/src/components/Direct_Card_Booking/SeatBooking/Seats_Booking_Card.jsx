import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, Clock, User, ArrowRight, DollarSign, Tag,
  Users, Star, CheckCircle, Shield, Calendar, Bus,
  ChevronRight, Loader, AlertCircle, Sparkles,
  Thermometer, Wifi, BatteryCharging, Coffee, Armchair
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import defaultVehicleImage from "../../../Home/GB_picture/Car.jpeg";

// ✅ Helper function to build full image URL
const getAbsoluteImageUrl = (transport) => {
  const url = transport?.vehicle_image;

  // 1. Handle empty or null values
  if (!url || url === "Nill") return null;

  // 2. If it's already a full URL (like from an external S3 bucket), return it
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // 3. Dynamic Base URL: 
  // If we are on 'localhost', use the hardcoded Django port.
  // If we are on 'ngrok', use an empty string to make it a RELATIVE path.
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8000' 
    : '';

  // 4. Combine them
  // Example on mobile: "" + "/media/car.jpg" -> "/media/car.jpg" (Correct!)
  return `${API_BASE_URL}${url}`;
};

export default function SeatBookingCard({ transport }) {
  const navigate = useNavigate();
  const location = useLocation();

  // **States for seat calculation**
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [totalSeats, setTotalSeats] = useState(transport.vehicle_seats || 0);
  const [seatError, setSeatError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const imageUrl = getAbsoluteImageUrl(transport) || defaultVehicleImage;
  const companyName = transport.company_name || "Bus Service";
  const vehicleType = transport.vehicle_type_snapshot || "Standard Vehicle";
  const price = transport.price_per_seat || "N/A";

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token && token !== "null" && token !== "undefined" && token.trim() !== "");
  }, []);
  
  // **Calculate static available seats (without API call)**
  useEffect(() => {
    if (!transport) return;

    const totalSeatsValue = transport.vehicle_seats || transport.vehicle_seats_snapshot || transport.seats_available || 40;
    setTotalSeats(totalSeatsValue);
    
    const ownerReservedSeats = transport?.reserve_seats || [];
    const reservedSeatsCount = Array.isArray(ownerReservedSeats) ? ownerReservedSeats.length : 0;
    
    // If not logged in or API failed, show only reserved seats
    const calculatedAvailable = totalSeatsValue - reservedSeatsCount;
    setAvailableSeats(calculatedAvailable >= 0 ? calculatedAvailable : 0);
  }, [transport]);

  // **Fetch booked seats from API (only if logged in)**
  // **Fetch booked seats from API (now works without login)**
useEffect(() => {
  if (!transport) {
    console.log("No transport data available");
    return;
  }

  const fetchBookedSeats = async () => {
    setIsLoadingSeats(true);
    setSeatError(null);
    
    // Try multiple possible field names for vehicle ID
    const vehicleId = transport.vehicle_id || transport.vehicle || transport.id || transport.transport_id;
    const arrivalDate = transport.arrival_date || transport.departure_date;
    const arrivalTime = transport.arrival_time || transport.departure_time;

    console.log("Fetching booked seats for:", {
      vehicleId,
      arrivalDate,
      arrivalTime
    });

    if (!vehicleId || !arrivalDate || !arrivalTime) {
      console.log("Missing required parameters");
      setIsLoadingSeats(false);
      return;
    }

    try {
      let formattedTime = arrivalTime;
      
      if (formattedTime && formattedTime.split(":").length === 2) {
        formattedTime = `${formattedTime}:00`;
      }

      const url = `/api/checkout/bookings/?vehicle_id=${vehicleId}&arrival_date=${arrivalDate}&arrival_time=${formattedTime}`;

      console.log("API URL:", url);

      // No authentication headers needed for GET request anymore
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API Response Data:", data);
        
        if (Array.isArray(data)) {
          // API returns array of seat numbers like [1, 2, 3]
          setBookedSeatNumbers(data);
          
          // Recalculate available seats with API data
          const totalSeatsValue = transport.vehicle_seats || transport.vehicle_seats_snapshot || transport.seats_available || 40;
          const ownerReservedSeats = transport?.reserve_seats || [];
          const reservedSeatsCount = Array.isArray(ownerReservedSeats) ? ownerReservedSeats.length : 0;
          const bookedSeatsCount = data.length;
          
          const unavailableSeatsCount = reservedSeatsCount + bookedSeatsCount;
          const available = totalSeatsValue - unavailableSeatsCount;
          
          setAvailableSeats(available >= 0 ? available : 0);
        } else {
          console.log("Response is not an array:", data);
          setBookedSeatNumbers([]);
        }
      } else if (response.status === 404) {
        console.log("No bookings found (404)");
        setBookedSeatNumbers([]);
      } else {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        setSeatError("Could not load seat data");
      }
    } catch (error) {
      console.error("Error fetching booked seats:", error);
      setSeatError("Network error loading seats");
      setBookedSeatNumbers([]);
    } finally {
      setIsLoadingSeats(false);
    }
  };

  fetchBookedSeats();
}, [transport]);

  // ✅ Handle booking navigation
  const handleBooking = () => {
    if (availableSeats === 0) {
      alert("Sorry, no seats available for this vehicle!");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token || token === "null" || token === "undefined" || token.trim() === "") {
      navigate("/login", {
        state: { from: location.pathname, transport },
      });
      return;
    }

    navigate("/book-seat", {
      state: { fromCard: true, transport },
    });
  };

  const handleDetailsView = () => {
    navigate(`/view-seat-offer/${transport.id || transport.transport_id}`, { 
      state: { transport } 
    });
  };

  // **Vehicle features check**
  const hasVehicleFeatures = transport.vehicle_features && 
    (transport.vehicle_features.AC || 
     transport.vehicle_features.WiFi || 
     transport.vehicle_features.ChargingPorts || 
     transport.vehicle_features.FreeWaterBottle || 
     transport.vehicle_features.RecliningSeats);

  // **Render seat breakdown**
  const renderSeatBreakdown = () => {
    const ownerReservedSeats = Array.isArray(transport.reserve_seats) ? transport.reserve_seats.length : 0;
    const bookedSeatsCount = bookedSeatNumbers.length;
    
    return (
      <div className="mb-3 xs:mb-4 p-2 xs:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg xs:rounded-xl">
        <div className="flex items-center justify-between mb-1 xs:mb-2">
          <div className="flex items-center gap-1 xs:gap-2">
            <Users size={14} className="text-green-600" />
            <span className="font-semibold text-gray-900 text-xs xs:text-sm">Seat Availability</span>
          </div>
          <div className={`px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-xs font-bold ${
            availableSeats === 0 ? 'bg-red-100 text-red-800' :
            availableSeats <= 5 ? 'bg-amber-100 text-amber-800' :
            'bg-green-100 text-green-800'
          }`}>
            {isLoadingSeats ? "Loading..." : `${availableSeats} Available`}
          </div>
        </div>
        
        {/* Seat Breakdown */}
        <div className="grid grid-cols-3 gap-0.5 xs:gap-1">
          <div className="text-center">
            <div className="font-bold text-gray-900 text-sm xs:text-base">{totalSeats}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-red-600 text-sm xs:text-base">
              {ownerReservedSeats}
            </div>
            <div className="text-xs text-gray-500">Reserved</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-600 text-sm xs:text-base">
              {isLoggedIn ? bookedSeatsCount : "Login to see"}
            </div>
            <div className="text-xs text-gray-500">Booked</div>
          </div>
        </div>
        
        {seatError && (
          <div className="text-xs text-amber-500 mt-1 xs:mt-2 text-center">
            {seatError}
          </div>
        )}
        
        {!isLoggedIn && !seatError && (
          <div className="text-xs text-blue-500 mt-1 xs:mt-2 text-center">
            Login to see real-time booked seats
          </div>
        )}
      </div>
    );
  };

  // **Render vehicle rating**
  const renderRating = () => {
    const rating = transport.rating || 4.5;
    const reviews = transport.total_reviews || 120;
    
    return (
      <div className="flex items-center">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={10} 
              className={`${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <span className="ml-1 text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
        <span className="ml-1 text-xs text-gray-500 hidden xs:inline">({reviews})</span>
      </div>
    );
  };

  // **Render vehicle features**
  const renderVehicleFeatures = () => {
    if (!hasVehicleFeatures) return null;
    
    return (
      <div className="mb-3 xs:mb-4">
        <div className="text-xs font-semibold text-gray-700 mb-1 xs:mb-2">Vehicle Features:</div>
        <div className="flex flex-wrap gap-1">
          {transport.vehicle_features.AC && (
            <span className="inline-flex items-center gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              <Thermometer size={9} className="xs:size-10" />
              AC
            </span>
          )}
          {transport.vehicle_features.WiFi && (
            <span className="inline-flex items-center gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              <Wifi size={9} className="xs:size-10" />
              WiFi
            </span>
          )}
          {transport.vehicle_features.ChargingPorts && (
            <span className="inline-flex items-center gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-green-100 text-green-800 rounded-full text-xs">
              <BatteryCharging size={9} className="xs:size-10" />
              Charging
            </span>
          )}
          {transport.vehicle_features.FreeWaterBottle && (
            <span className="inline-flex items-center gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-red-100 text-red-800 rounded-full text-xs">
              <Coffee size={9} className="xs:size-10" />
              Water
            </span>
          )}
          {transport.vehicle_features.RecliningSeats && (
            <span className="inline-flex items-center gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              <Armchair size={9} className="xs:size-10" />
              Reclining
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.005 }}
    >
      {/* Vehicle Image with Badges */}
      <div className="relative h-40 xs:h-44 sm:h-48 md:h-56 overflow-hidden rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl">
        <img
          src={imageUrl}
          alt={vehicleType}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultVehicleImage;
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Top Badges */}
        <div className="absolute top-2 xs:top-3 left-2 xs:left-3 flex flex-col gap-1 xs:gap-2">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-2 xs:px-3 py-1 xs:py-1.5 rounded-full shadow-lg whitespace-nowrap">
            SEAT BOOKING
          </span>
          {transport.is_featured && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 xs:px-3 py-1 xs:py-1.5 rounded-full shadow-lg flex items-center whitespace-nowrap">
              <Sparkles size={9} className="mr-1" />
              FEATURED
            </span>
          )}
        </div>
        
        {/* Available Seats Badge */}
        <div className={`absolute top-2 xs:top-3 right-2 xs:right-3 px-2 xs:px-3 py-1 xs:py-2 rounded-full shadow-lg flex items-center gap-1 xs:gap-2 ${
          availableSeats === 0 ? 'bg-red-500' :
          availableSeats <= 5 ? 'bg-amber-500' :
          'bg-green-500'
        } text-white`}>
          <Users size={14} className="xs:size-16" />
          <div>
            <div className="text-xs font-medium">SEATS LEFT</div>
            <div className="text-base xs:text-lg font-bold">
              {isLoadingSeats ? "..." : availableSeats}
            </div>
          </div>
        </div>
        
        {/* Loading Overlay */}
        {isLoadingSeats && isLoggedIn && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-3 xs:p-4 rounded-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 xs:h-8 w-6 xs:w-8 border-b-2 border-blue-600"></div>
              <p className="text-xs xs:text-sm text-gray-700 mt-2">Loading seat data...</p>
            </div>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute bottom-2 xs:bottom-3 right-2 xs:right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 xs:px-3 py-1 xs:py-2 rounded-lg xs:rounded-xl shadow-xl">
          <div className="text-xs font-medium">PRICE PER SEAT</div>
          <div className="text-lg xs:text-xl sm:text-2xl font-bold">Rs {price}</div>
        </div>
        
        {/* Company Logo */}
        {transport.company_logo_url && (
          <div className="absolute bottom-2 xs:bottom-3 left-2 xs:left-3">
            <img
              src={transport.company_logo_url}
              alt={companyName}
              className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full border border-white shadow-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/48x48/4B5563/FFFFFF?text=Logo";
              }}
            />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 xs:p-4 sm:p-5 space-y-2 xs:space-y-3 sm:space-y-4">
        {/* Header with Rating */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 truncate pr-2">
              {companyName}
            </h3>
            <div className="flex items-center gap-1 xs:gap-2 mt-1 flex-wrap">
              {renderRating()}
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 xs:px-2 py-0.5 rounded-full whitespace-nowrap">
                {vehicleType}
              </span>
            </div>
          </div>
          <span className="flex-shrink-0 text-xs xs:text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 px-2 xs:px-3 py-0.5 xs:py-1 rounded-full shadow-md whitespace-nowrap">
            <Tag size={12} className="inline mr-1" />
            Special Offer
          </span>
        </div>

        {/* Route */}
        <div className="p-2 xs:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg xs:rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1 min-w-0 px-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin size={12} className="text-red-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">FROM</span>
              </div>
              <p className="text-xs xs:text-sm font-bold text-gray-900 truncate px-1">
                {transport.route_from}
              </p>
            </div>
            
            <ArrowRight size={16} className="text-blue-500 mx-1 xs:mx-2 flex-shrink-0" />
            
            <div className="text-center flex-1 min-w-0 px-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin size={12} className="text-green-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">TO</span>
              </div>
              <p className="text-xs xs:text-sm font-bold text-gray-900 truncate px-1">
                {transport.route_to}
              </p>
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="grid grid-cols-2 gap-2 xs:gap-3">
          <div className="bg-gray-50 p-2 xs:p-3 rounded-lg">
            <div className="flex items-center gap-1 xs:gap-2 mb-1">
              <Clock size={14} className="text-blue-500 flex-shrink-0" />
              <span className="text-xs text-gray-500 whitespace-nowrap">Departure</span>
            </div>
            <p className="font-semibold text-gray-900 text-xs xs:text-sm truncate">{transport.arrival_time || "N/A"}</p>
          </div>
          
          <div className="bg-gray-50 p-2 xs:p-3 rounded-lg">
            <div className="flex items-center gap-1 xs:gap-2 mb-1">
              <Calendar size={14} className="text-purple-500 flex-shrink-0" />
              <span className="text-xs text-gray-500 whitespace-nowrap">Date</span>
            </div>
            <p className="font-semibold text-gray-900 text-xs xs:text-sm truncate">{transport.arrival_date || "N/A"}</p>
          </div>
        </div>

        {/* Seat Availability Breakdown */}
        {renderSeatBreakdown()}

        {/* Vehicle Features */}
        {renderVehicleFeatures()}

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-1 xs:gap-2 text-xs text-gray-500 text-center px-1">
          <Shield size={10} className="text-green-500 flex-shrink-0" />
          <span className="text-xs">Secure Booking • Verified Transport • 100% Refundable</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 xs:p-4 sm:p-5 pt-0 flex gap-2 xs:gap-3">
        <motion.button
          onClick={handleBooking}
          disabled={availableSeats === 0 || (isLoggedIn && isLoadingSeats)}
          className={`flex-1 py-2.5 xs:py-3 sm:py-3.5 rounded-lg xs:rounded-xl font-bold text-sm xs:text-base shadow-md flex items-center justify-center gap-1 xs:gap-2 transition-all ${
            availableSeats === 0 || (isLoggedIn && isLoadingSeats)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
          }`}
          whileHover={availableSeats === 0 || (isLoggedIn && isLoadingSeats) ? {} : { scale: 1.02 }}
          whileTap={availableSeats === 0 || (isLoggedIn && isLoadingSeats) ? {} : { scale: 0.98 }}
        >
          <Shield size={16} className="xs:size-18" />
          <span className="truncate">{isLoggedIn && isLoadingSeats ? "Loading..." : "Book Now"}</span>
          <ChevronRight size={14} className="hidden xs:inline xs:size-16" />
        </motion.button>

        <motion.button
          onClick={handleDetailsView}
          className="px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-3.5 border border-indigo-300 text-indigo-700 bg-white rounded-lg xs:rounded-xl font-bold text-sm xs:text-base hover:bg-indigo-50 hover:border-indigo-400 transition-all flex items-center justify-center whitespace-nowrap"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Details
        </motion.button>
      </div>
    </motion.div>
  );
}