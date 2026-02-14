import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  DollarSign,
  BusFront,
  ArrowLeft,
  Calendar,
  Users,
  Building,
  User,
  Phone,
  Car,
  Wifi,
  Zap,
  Coffee,
  Snowflake,
  Loader,
  AlertCircle
} from "lucide-react";
import defaultVehicleImage from "../../../Home/GB_picture/Car.jpeg";

export default function SeatBookingDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const transport = location.state?.transport;

  // ✅ BOOKED SEATS API STATES
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [totalSeats, setTotalSeats] = useState(0);
  const [seatError, setSeatError] = useState(null);

  if (!transport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg mb-4">No transport details found.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

// 1. First, define a smart base URL at the top of your component
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8000' 
    : ''; 

// 2. Use this logic for the image URL
const imageUrl = transport.vehicle_image
    ? transport.vehicle_image.startsWith("http")
        ? transport.vehicle_image
        : `${API_BASE_URL}${transport.vehicle_image}`
    : defaultVehicleImage;

  // ✅ BOOKED SEATS API FETCH - WORKING WITHOUT LOGIN
  useEffect(() => {
    const fetchBookedSeats = async () => {
      setIsLoadingSeats(true);
      setSeatError(null);
      
      // Try multiple possible field names for vehicle ID
      const vehicleId = transport.vehicle_id || transport.vehicle || transport.id || transport.transport_id;
      const arrivalDate = transport.arrival_date || transport.departure_date;
      const arrivalTime = transport.arrival_time || transport.departure_time;

      if (!vehicleId || !arrivalDate || !arrivalTime) {
        console.log("Missing required parameters for seat fetch");
        setIsLoadingSeats(false);
        calculateStaticSeats();
        return;
      }

      try {
        let formattedTime = arrivalTime;
        
        if (formattedTime && formattedTime.split(":").length === 2) {
          formattedTime = `${formattedTime}:00`;
        }

        const url = `/api/checkout/bookings/?vehicle_id=${vehicleId}&arrival_date=${arrivalDate}&arrival_time=${formattedTime}`;

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const apiData = await response.json();
          
          if (Array.isArray(apiData)) {
            setBookedSeatNumbers(apiData);
            
            // Recalculate available seats with API data
            const totalSeatsValue = transport.vehicle_seats || 40;
            const ownerReservedSeats = transport?.reserve_seats || [];
            const reservedSeatsCount = Array.isArray(ownerReservedSeats) ? ownerReservedSeats.length : 0;
            const bookedSeatsCount = apiData.length;
            
            const unavailableSeatsCount = reservedSeatsCount + bookedSeatsCount;
            const available = totalSeatsValue - unavailableSeatsCount;
            
            setAvailableSeats(available >= 0 ? available : 0);
            setTotalSeats(totalSeatsValue);
          } else {
            setBookedSeatNumbers([]);
            calculateStaticSeats();
          }
        } else if (response.status === 404) {
          setBookedSeatNumbers([]);
          calculateStaticSeats();
        } else {
          setSeatError("Could not load seat data");
          calculateStaticSeats();
        }
      } catch (error) {
        console.error("Error fetching booked seats:", error);
        setSeatError("Network error loading seats");
        setBookedSeatNumbers([]);
        calculateStaticSeats();
      } finally {
        setIsLoadingSeats(false);
      }
    };

    // Static calculation fallback function
    const calculateStaticSeats = () => {
      const totalSeatsValue = transport.vehicle_seats || 40;
      const ownerReservedSeats = transport?.reserve_seats || [];
      const reservedSeatsCount = Array.isArray(ownerReservedSeats) ? ownerReservedSeats.length : 0;
      
      const calculatedAvailable = totalSeatsValue - reservedSeatsCount;
      setAvailableSeats(calculatedAvailable >= 0 ? calculatedAvailable : 0);
      setTotalSeats(totalSeatsValue);
    };

    fetchBookedSeats();
  }, [transport]);

  // ✅ Get booked seats count from API response
  const getBookedSeatsCount = () => {
    return bookedSeatNumbers.length;
  };

  const handleBookNow = () => {
    const token = localStorage.getItem("accessToken");

    if (!token || token.trim() === "" || token === "null" || token === "undefined") {
      navigate("/login", {
        state: { from: location.pathname, transport },
      });
      return;
    }

    navigate("/book-seat", {
      state: { fromCard: true, transport },
    });
  };

  // 🔥 Working icon mapping
  const featureIcons = {
    AC: { label: "AC", icon: Snowflake },
    WiFi: { label: "WiFi", icon: Wifi },
    RecliningSeats: { label: "Reclining Seats", icon: Zap },
    ChargingPorts: { label: "Charging Ports", icon: Zap },
    FreeWaterBottle: { label: "Free Water Bottle", icon: Coffee },
  };

  const renderFeatures = (features) => {
    if (!features || Object.keys(features).length === 0)
      return <p className="text-gray-500">No features listed</p>;

    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(features)
          .filter(([_, value]) => value === true)
          .map(([key]) => {
            const FeatureIcon = featureIcons[key]?.icon || Car;
            return (
              <span
                key={key}
                className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-100 text-green-700"
              >
                <FeatureIcon className="w-4 h-4" /> {featureIcons[key]?.label || key}
              </span>
            );
          })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Top Image */}
        <div className="relative">
          <img
            src={imageUrl}
            alt="Vehicle"
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultVehicleImage;
            }}
          />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="absolute bottom-4 left-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md">
            {transport.vehicle_type_snapshot || "Vehicle"}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8 space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <BusFront className="text-indigo-600" /> {transport.company_name || "Transport Company"}
          </h1>

          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div className="flex items-center gap-3">
              <MapPin className="text-blue-500" />
              <div>
                <p className="font-semibold">Route</p>
                <p>
                  {transport.route_from} → {transport.route_to}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-red-500" />
              <div>
                <p className="font-semibold">Departure Time</p>
                <p>{transport.arrival_time || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-purple-500" />
              <div>
                <p className="font-semibold">Departure Date</p>
                <p>{transport.arrival_date || "N/A"}</p>
              </div>
            </div>

            {/* ✅ UPDATED: Seats Left with API data */}
            <div className="flex items-center gap-3">
              <Users className="text-green-500" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Seats Left</p>
                  {isLoadingSeats && (
                    <Loader className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                </div>
                <div className="flex flex-col">
                  <p className={`font-bold text-lg ${
                    availableSeats === 0 ? 'text-red-600' :
                    availableSeats <= 5 ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {isLoadingSeats ? "Loading..." : availableSeats}
                  </p>
                  {seatError && (
                    <p className="text-xs text-red-500 mt-1">{seatError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="text-amber-500" />
              <div>
                <p className="font-semibold">Price per Seat</p>
                <p>Rs. {transport.price_per_seat || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building className="text-indigo-500" />
              <div>
                <p className="font-semibold">Company Status</p>
                <p>{transport.status || "Active"}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="border-t pt-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3 text-gray-700">
              <div className="flex items-center gap-3">
                <Phone className="text-indigo-500" />
                <div>
                  <p className="font-semibold">Company Contact 1</p>
                  <p>{transport.company_contact_1 || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-indigo-500" />
                <div>
                  <p className="font-semibold">Company Contact 2</p>
                  <p>{transport.company_contact_2|| "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Car className="text-indigo-500" />
                <div>
                  <p className="font-semibold">Vehicle Info</p>
                  <p>{transport.vehicle_details || "N/A"}</p>
                </div>
              </div>
            </div>

            
          </div>

           {/* ✅ Seat Breakdown Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users className="text-blue-500" /> Seat Breakdown
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">{transport.vehicle_seats || 0}</div>
                <div className="text-sm text-gray-600">Total Seats</div>
              </div>
              
              <div className="text-center bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-red-600">
                  {Array.isArray(transport.reserve_seats) ? transport.reserve_seats.length : 0}
                </div>
                <div className="text-sm text-gray-600">Reserved</div>
              </div>
              
              <div className="text-center bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  {isLoadingSeats ? "..." : getBookedSeatsCount()}
                </div>
                <div className="text-sm text-gray-600">Booked (API)</div>
              </div>
              
              <div className="text-center bg-white p-3 rounded-lg border">
                <div className={`text-2xl font-bold ${
                  availableSeats === 0 ? 'text-red-600' :
                  availableSeats <= 5 ? 'text-amber-600' :
                  'text-green-600'
                }`}>
                  {isLoadingSeats ? "..." : availableSeats}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 text-center">
              Available = Total - (Reserved + Booked)
            </div>
            
            {seatError && (
              <div className="mt-2 text-xs text-red-500 text-center flex items-center justify-center gap-1">
                <AlertCircle size={12} />
                {seatError}
              </div>
            )}
          </div>

          {/* 🔥 Vehicle Features */}
            <div className="pt-3">
              <h3 className="font-semibold text-gray-800 mb-2">Features</h3>
              {renderFeatures(transport.vehicle_features)}
            </div>

          {/* Book Now Button */}
          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBookNow}
              disabled={isLoadingSeats || availableSeats === 0}
              className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold shadow-md transition ${
                isLoadingSeats || availableSeats === 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isLoadingSeats ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Loading Seats...
                </span>
              ) : availableSeats === 0 ? (
                "No Seats Available"
              ) : (
                "Book Now"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}