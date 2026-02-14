import React, { useState, useEffect } from "react";
import { 
  ArrowRight, Clock, MapPin, BusFront, Calendar, 
  Users, CheckCircle, Phone, Star, Shield, User,
  ChevronRight, Tag, BatteryCharging, Wifi,
  Thermometer, Coffee, Armchair
} from "lucide-react";

const PassengerCard = ({ transport, onSelect }) => {
  const [customerBookedSeats, setCustomerBookedSeats] = useState([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [totalSeats, setTotalSeats] = useState(transport.vehicle_seats || 0);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch booked seats API se (same as SeatSelectionPage)
  useEffect(() => {
    if (!transport) return;

    const fetchBookedSeats = async () => {
      setIsLoadingSeats(true);
      
      const vehicleId = transport.vehicle_id || transport.vehicle || transport.id;
      const arrivalDate = transport.arrival_date || transport.departure_date;
      const arrivalTime = transport.arrival_time || transport.departure_time;

      if (!vehicleId || !arrivalDate || !arrivalTime) {
        setIsLoadingSeats(false);
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        let formattedTime = arrivalTime;
        
        if (formattedTime && formattedTime.split(":").length === 2) {
          formattedTime = `${formattedTime}:00`;
        }

        const url = `/api/checkout/bookings/?vehicle_id=${vehicleId}&arrival_date=${arrivalDate}&arrival_time=${formattedTime}`;
        // const url = `http://localhost:8000/api/checkout/bookings/?vehicle_id=${vehicleId}&arrival_date=${arrivalDate}&arrival_time=${formattedTime}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setCustomerBookedSeats(data);
          } else {
            setCustomerBookedSeats([]);
          }
        } else if (response.status === 404) {
          setCustomerBookedSeats([]);
        }
      } catch (error) {
        console.error("Error fetching booked seats:", error);
        setCustomerBookedSeats([]);
      } finally {
        setIsLoadingSeats(false);
      }
    };

    fetchBookedSeats();
  }, [transport]);

  // ✅ CORRECTED Available Seats Calculation (Same as SeatSelectionPage)
  useEffect(() => {
    if (!transport) return;

    const totalSeatsValue = transport.vehicle_seats || transport.vehicle_seats_snapshot || transport.seats_available || 40;
    setTotalSeats(totalSeatsValue);
    
    const ownerReservedSeats = transport?.reserve_seats || [];
    
    // Combine owner reserved seats + customer booked seats (from API)
    const unavailableSeats = [...new Set([...ownerReservedSeats, ...customerBookedSeats])];
    
    // Correct formula: total seats - (reserved + booked)
    const available = totalSeatsValue - unavailableSeats.length;
    
    // Ensure non-negative value
    setAvailableSeats(available >= 0 ? available : 0);
  }, [transport, customerBookedSeats]);

  // Vehicle features check
  const hasVehicleFeatures = transport.vehicle_features && 
    (transport.vehicle_features.AC || 
     transport.vehicle_features.WiFi || 
     transport.vehicle_features.ChargingPorts || 
     transport.vehicle_features.FreeWaterBottle || 
     transport.vehicle_features.RecliningSeats);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Mobile View Layout
  if (isMobile) {
    return (
      <div
        onClick={() => onSelect(transport)}
        className="w-full bg-white rounded-2xl overflow-hidden shadow-lg 
                   cursor-pointer hover:shadow-xl transition-all duration-300 
                   border border-gray-200 hover:border-blue-300 active:scale-[0.99]"
      >
        {/* Top Image Section */}
        <div className="relative h-48 w-full overflow-hidden">
          {transport.vehicle_image ? (
            <img
              src={transport.vehicle_image}
              alt="Vehicle"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x192/2563EB/FFFFFF?text=Vehicle";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <BusFront className="w-16 h-16 text-blue-400" />
            </div>
          )}
          
          {/* Price Badge on Image */}
          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full shadow-lg">
            <div className="text-xs font-medium">PRICE</div>
            <div className="text-lg font-bold">Rs {transport.price_per_seat || "N/A"}</div>
          </div>
          
          {/* Company Logo on Image */}
          <div className="absolute top-3 left-3">
            {transport.company_logo_url ? (
              <img
                src={transport.company_logo_url}
                alt={transport.company_name}
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/48x48/4B5563/FFFFFF?text=Logo";
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-300 flex items-center justify-center shadow-md">
                <BusFront className="w-6 h-6 text-blue-600" />
              </div>
            )}
          </div>

          {/* Loading Indicator for Seats */}
          {isLoadingSeats && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="bg-white p-2 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-xs text-gray-700 mt-1">Loading seats...</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Company Name */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {transport.company_name || "Elite Transport"}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">4.8/5</span>
            </div>
          </div>

          {/* Route Info */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin size={14} className="text-red-500" />
                <span className="text-xs font-semibold text-gray-600">FROM</span>
              </div>
              <p className="text-sm font-bold text-gray-900 truncate">
                {transport.route_from}
              </p>
            </div>
            
            <ArrowRight size={20} className="text-blue-500 mx-2 flex-shrink-0" />
            
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin size={14} className="text-green-500" />
                <span className="text-xs font-semibold text-gray-600">TO</span>
              </div>
              <p className="text-sm font-bold text-gray-900 truncate">
                {transport.route_to}
              </p>
            </div>
          </div>

          {/* Time and Date */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <Clock size={16} className="text-blue-500 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">Time</div>
                <div className="text-sm font-semibold text-gray-900">
                  {transport.arrival_time?.substring(0, 5) || "N/A"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <Calendar size={16} className="text-purple-500 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="text-sm font-semibold text-gray-900">
                  {transport.arrival_date || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Seat Info with Breakdown */}
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-600" />
                <span className="font-semibold text-gray-900">Seat Availability</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                availableSeats === 0 ? 'bg-red-100 text-red-800' :
                availableSeats <= 5 ? 'bg-amber-100 text-amber-800' :
                'bg-green-100 text-green-800'
              }`}>
                {isLoadingSeats ? "Loading..." : `${availableSeats} Available`}
              </div>
            </div>
            
            {/* Seat Breakdown */}
            <div className="grid grid-cols-3 gap-1">
              <div className="text-center">
                <div className="font-bold text-gray-900">{totalSeats}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600">
                  {Array.isArray(transport.reserve_seats) ? transport.reserve_seats.length : 0}
                </div>
                <div className="text-xs text-gray-500">Reserved</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">
                  {customerBookedSeats.length}
                </div>
                <div className="text-xs text-gray-500">Booked</div>
              </div>
            </div>
          </div>

          {/* Vehicle Features (if available) */}
          {hasVehicleFeatures && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">Vehicle Features:</div>
              <div className="flex flex-wrap gap-1">
                {transport.vehicle_features.AC && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    <Thermometer size={10} />
                    AC
                  </span>
                )}
                {transport.vehicle_features.WiFi && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    <Wifi size={10} />
                    WiFi
                  </span>
                )}
                {transport.vehicle_features.ChargingPorts && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    <BatteryCharging size={10} />
                    Charging
                  </span>
                )}
                {transport.vehicle_features.FreeWaterBottle && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                    <Coffee size={10} />
                    Water
                  </span>
                )}
                {transport.vehicle_features.RecliningSeats && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    <Armchair size={10} />
                    Reclining
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(transport);
            }}
            disabled={availableSeats === 0 || isLoadingSeats}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                     rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 
                     transition-all duration-300 shadow-lg hover:shadow-xl 
                     flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield size={16} />
            <span>{isLoadingSeats ? "Loading..." : "Book Now"}</span>
            <ChevronRight size={16} />
          </button>
          
          {/* Footer Note */}
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500">
              {isLoadingSeats ? "Checking availability..." : 
               availableSeats === 0 ? "No seats available" : 
               `${availableSeats} seats left`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop View Layout
  return (
    <div
      onClick={() => onSelect(transport)}
      className="w-full bg-white rounded-2xl overflow-hidden shadow-lg 
                 cursor-pointer hover:shadow-2xl hover:ring-2 hover:ring-blue-300
                 transition-all duration-300 transform hover:scale-[1.005] 
                 border border-gray-200 flex flex-col lg:flex-row mx-auto"
    >
      {/* LEFT SIDE: VEHICLE IMAGE (Desktop) */}
      <div className="lg:w-[40%] relative min-h-[280px]">
        {transport.vehicle_image ? (
          <img
            src={transport.vehicle_image}
            alt="Vehicle"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x280/2563EB/FFFFFF?text=Vehicle";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <BusFront className="w-20 h-20 text-blue-400" />
          </div>
        )}
        
        {/* Company Logo Badge */}
        <div className="absolute top-4 left-4">
          {transport.company_logo_url ? (
            <img
              src={transport.company_logo_url}
              alt={transport.company_name}
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/64x64/4B5563/FFFFFF?text=Logo";
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white border-4 border-blue-300 flex items-center justify-center shadow-lg">
              <BusFront className="w-8 h-8 text-blue-600" />
            </div>
          )}
        </div>
        
        {/* Available Seats Badge */}
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 ${
          availableSeats === 0 ? 'bg-red-500' :
          availableSeats <= 5 ? 'bg-amber-500' :
          'bg-green-500'
        } text-white`}>
          <Users size={16} />
          <div>
            <div className="text-xs font-medium">SEATS LEFT</div>
            <div className="text-lg font-bold">
              {isLoadingSeats ? "..." : availableSeats}
            </div>
          </div>
        </div>
        
        {/* Loading Overlay */}
        {isLoadingSeats && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-700 mt-2">Loading seat data...</p>
            </div>
          </div>
        )}
        
        {/* Vehicle Features Indicator */}
        {hasVehicleFeatures && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex justify-center gap-3">
              {transport.vehicle_features.AC && (
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-xs">
                  <Thermometer size={12} className="text-blue-600" />
                  <span className="font-medium">AC</span>
                </div>
              )}
              {transport.vehicle_features.WiFi && (
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-xs">
                  <Wifi size={12} className="text-purple-600" />
                  <span className="font-medium">WiFi</span>
                </div>
              )}
              {transport.vehicle_features.ChargingPorts && (
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-xs">
                  <BatteryCharging size={12} className="text-green-600" />
                  <span className="font-medium">Charging</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: DETAILS (Desktop) */}
      <div className="flex-1 flex flex-col justify-between p-6">
        {/* TOP SECTION */}
        <div>
          {/* Company and Rating */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {transport.company_name || "Elite Transport"}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">4.8/5 Rating</span>
                <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                  {transport.vehicle_type || "Luxury Coach"}
                </span>
              </div>
            </div>
            
            {/* Price */}
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Price Per Seat</div>
              <div className="text-3xl font-bold text-green-600">
                Rs {transport.price_per_seat || "N/A"}
              </div>
              <div className="text-xs text-gray-500 mt-1">Inclusive of all taxes</div>
            </div>
          </div>

          {/* Route Info */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin size={20} className="text-red-500" />
                <span className="text-sm font-semibold text-gray-600">DEPARTURE</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {transport.route_from}
              </p>
            </div>
            
            <div className="mx-6 flex flex-col items-center">
              <ArrowRight size={24} className="text-blue-500 mb-1" />
              <div className="text-xs text-gray-500 font-medium">DIRECT</div>
            </div>
            
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin size={20} className="text-green-500" />
                <span className="text-sm font-semibold text-gray-600">DESTINATION</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {transport.route_to}
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="mb-6">
          {/* Time and Date */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Departure Time</div>
                <div className="text-lg font-semibold text-gray-900">
                  {transport.arrival_time?.substring(0, 5) || "N/A"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Journey Date</div>
                <div className="text-lg font-semibold text-gray-900">
                  {transport.arrival_date || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Seat Info */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-gray-700" />
                <span className="font-semibold text-gray-900">Seat Details</span>
              </div>
              <div className="text-sm text-gray-600">
                Available: <span className={`font-bold ${
                  availableSeats === 0 ? 'text-red-600' :
                  availableSeats <= 5 ? 'text-amber-600' :
                  'text-green-600'
                }`}>
                  {isLoadingSeats ? "..." : availableSeats}
                </span> of {totalSeats}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border text-center">
                <div className="text-2xl font-bold text-gray-900">{totalSeats}</div>
                <div className="text-xs text-gray-500 mt-1">Total Seats</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Array.isArray(transport.reserve_seats) ? transport.reserve_seats.length : 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Reserved</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {customerBookedSeats.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Booked</div>
              </div>
              
              <div className={`p-3 rounded-lg text-center ${
                availableSeats === 0 ? 'bg-red-50' :
                availableSeats <= 5 ? 'bg-amber-50' :
                'bg-green-50'
              }`}>
                <div className={`text-2xl font-bold ${
                  availableSeats === 0 ? 'text-red-700' :
                  availableSeats <= 5 ? 'text-amber-700' :
                  'text-green-700'
                }`}>
                  {isLoadingSeats ? "..." : availableSeats}
                </div>
                <div className="text-xs text-gray-600 mt-1">Available</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-3 text-center">
              Available = Total - (Reserved + Booked)
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle size={16} className="text-green-500" />
            <span>Secure Booking</span>
            <span className="mx-2">•</span>
            <Shield size={16} className="text-blue-500" />
            <span>Verified Transport</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(transport);
            }}
            disabled={availableSeats === 0 || isLoadingSeats}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                     rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 
                     transition-all duration-300 shadow-lg hover:shadow-xl 
                     flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoadingSeats ? "Loading..." : "Book Now"}</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerCard;