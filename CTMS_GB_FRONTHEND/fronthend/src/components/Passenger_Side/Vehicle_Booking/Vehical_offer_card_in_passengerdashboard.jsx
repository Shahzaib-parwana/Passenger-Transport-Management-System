import React from "react";
import { Truck, Route, DollarSign, Calendar, Clock, Clock4, Users, MapPin, Car, Star, Mountain, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const VehicleCard = ({ 
  vehicle, 
  toLocation, 
  passenger,
  durationType,
  durationValue,
  calculateTotalPrice,
  getDisplayRate,
  getChargesBreakdown,
  serviceType,
  onBookNow
}) => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    const token = localStorage.getItem("accessToken");
    const filters = JSON.parse(localStorage.getItem("search_filters")) || {};
    
    // Calculate total price
    const totalPrice = calculateTotalPrice ? calculateTotalPrice(vehicle) : 0;
    
    console.log("🚗 Vehicle data for booking:", vehicle);
    
    // **GET ALL REQUIRED IDs - FIXED LOGIC**
    let vehicleId = null;
    let companyId = null;
    let driverId = null;
    
    // 1. First check direct fields
    if (vehicle.vehicle_id) {
      vehicleId = vehicle.vehicle_id;
    } else if (vehicle.vehicle) {
      // Check if vehicle is an object or just ID
      if (typeof vehicle.vehicle === 'object' && vehicle.vehicle.id) {
        vehicleId = vehicle.vehicle.id;
      } else {
        vehicleId = vehicle.vehicle; // It's already ID
      }
    } else if (vehicle.id) {
      vehicleId = vehicle.id; // Use offer ID as fallback
    }
    
    // 2. Company ID
    if (vehicle.company_id) {
      companyId = vehicle.company_id;
    } else if (vehicle.company) {
      if (typeof vehicle.company === 'object' && vehicle.company.id) {
        companyId = vehicle.company.id;
      } else {
        companyId = vehicle.company;
      }
    }
    
    // 3. Driver ID
    if (vehicle.driver_id) {
      driverId = vehicle.driver_id;
    } else if (vehicle.driver) {
      if (typeof vehicle.driver === 'object' && vehicle.driver.id) {
        driverId = vehicle.driver.id;
      } else {
        driverId = vehicle.driver;
      }
    }
    
    console.log("✅ FINAL IDs:", { 
      vehicleId, 
      companyId, 
      driverId,
      vehicleObject: vehicle 
    });
    
    // **VALIDATE REQUIRED FIELDS**
    if (!vehicleId) {
      console.error("❌ Vehicle ID is missing!");
      alert("Error: Vehicle information is incomplete. Please try again.");
      return;
    }
    
    if (!companyId) {
      console.error("❌ Company ID is missing!");
      alert("Error: Company information is missing. Please try again.");
      return;
    }

    // **COMPLETE BOOKING DATA WITH ALL PAYMENT DETAILS**
    const bookingData = {
      // =========== REQUIRED IDs ===========
      vehicle: vehicleId,
      vehicle_id: vehicleId,
      company: companyId,
      company_id: companyId,
      driver: driverId,
      driver_id: driverId,
      offer_id: vehicle.id || vehicleId,
      
      // =========== TRIP DETAILS ===========
      service_type: serviceType || "long_drive",
      arrival_date: filters.arrival_date || new Date().toISOString().split('T')[0],
      arrival_time: filters.arrival_time || "12:00",
      departure_date: filters.arrival_date || new Date().toISOString().split('T')[0],
      departure_time: filters.arrival_time || "12:00",
      duration_type: durationType,
      duration_value: durationValue,
      trip_duration: durationValue,
      trip_duration_unit: durationType,
      
      // =========== LOCATION DETAILS ===========
      from_location: vehicle.route_from || vehicle.from_location || vehicle.location_address || "Pickup Location",
      to_location: toLocation || vehicle.route_to || vehicle.to_location || "Flexible/N/A",
      pickup_location: vehicle.location_address || vehicle.route_from || vehicle.from_location || "Not specified",
      dropoff_location: toLocation || vehicle.route_to || vehicle.to_location || "Not specified",
      location_address: vehicle.location_address || "Not specified",
      route_from: vehicle.route_from,
      route_to: vehicle.route_to,
      
      // =========== VEHICLE DETAILS ===========
      vehicle_type: vehicle.vehicle_type || vehicle.vehicle_type_snapshot || "Vehicle",
      vehicle_number: vehicle.vehicle_number || vehicle.vehicle_number_snapshot || "N/A",
      vehicle_image: vehicle.vehicle_image || vehicle.vehicle_image_snapshot || "/placeholder.svg",
      vehicle_seats: vehicle.vehicle_seats || vehicle.vehicle_seats_snapshot || "N/A",
      vehicle_capacity: vehicle.vehicle_seats || vehicle.vehicle_seats_snapshot || "N/A",
      
      // =========== COMPANY DETAILS ===========
      company_name: vehicle.company_name || "Transport Service",
      company_logo_url: vehicle.company_logo_url || "",
      
      // =========== DRIVER DETAILS ===========
      driver_name: vehicle.driver_name || vehicle.driver_name_snapshot || "Driver",
      driver_contact: vehicle.driver_contact || vehicle.driver_contact_snapshot || "N/A",
      driver_image: vehicle.driver_image || vehicle.driver_image_snapshot || "/placeholder.svg",
      
      // =========== PRICING DETAILS ===========
      rate_per_km: vehicle.rate_per_km || 0,
      fixed_fare: vehicle.fixed_fare || 0,
      total_amount: totalPrice,
      calculatedFare: totalPrice,
      currency: "PKR",
      base_fare: vehicle.rate_per_km || vehicle.fixed_fare || 0,
      
      // =========== PASSENGER DETAILS ===========
      passenger_name: passenger?.name || "",
      passenger_phone: passenger?.contact || passenger?.phone || "", // CRITICAL
      passenger_contact: passenger?.contact || passenger?.phone || "",
      passenger_cnic: passenger?.cnic || "",
      passenger_email: passenger?.email || "",
      passenger_count: 1,
      
      // =========== PAYMENT DETAILS (MOST IMPORTANT) ===========
      payment_type: vehicle.payment_type || "BOTH", // CASH, BOTH, ONLINE
      payment_method: "CASH",
      payment_status: "pending",
      booking_status: "pending",
      
      // **Bank Details**
      bank_name: vehicle.bank_name || "",
      bank_account_title: vehicle.bank_account_title || "",
      bank_account_number: vehicle.bank_account_number || "",
      bank_iban: vehicle.bank_iban || "",
      
      // **Easypaisa Details**
      easypaisa_name: vehicle.easypaisa_name || "",
      easypaisa_number: vehicle.easypaisa_number || "",
      
      // **JazzCash Details**
      jazzcash_name: vehicle.jazzcash_name || "",
      jazzcash_number: vehicle.jazzcash_number || "",
      
      // =========== ADDITIONAL CHARGES ===========
      night_charge: vehicle.night_charge || 0,
      mountain_surcharge: vehicle.mountain_surcharge || 0,
      extra_charges: 0,
      
      // =========== RATES ===========
      per_hour_rate: vehicle.per_hour_rate || 0,
      per_day_rate: vehicle.per_day_rate || 0,
      weekly_rate: vehicle.weekly_rate || 0,
      price_per_seat: vehicle.price_per_seat || 0,
      
      // =========== SERVICE FLAGS ===========
      is_taxi_service: vehicle.is_taxi_service || false,
      is_long_drive: vehicle.is_long_drive || false,
      is_specific_route: vehicle.is_specific_route || false,
      offer_type: vehicle.offer_type || "whole_hire",
      is_full_vehicle: true,
      
      // =========== ADDITIONAL INFO ===========
      distance: vehicle.distance || 0,
      rating: vehicle.rating || 0,
      notes: "",
      special_requests: "",
      allow_custom_quote: vehicle.allow_custom_quote || false,
      
      // =========== GENERATED IDs ===========
      booking_id: `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      booking_reference: `REF-${Date.now()}`,
    };
    
    console.log("✅ COMPLETE BOOKING PAYLOAD:", {
      vehicleId: bookingData.vehicle,
      companyId: bookingData.company_id,
      driverId: bookingData.driver_id,
      paymentType: bookingData.payment_type,
      bankDetails: {
        bankName: bookingData.bank_name,
        easypaisa: bookingData.easypaisa_number,
        jazzcash: bookingData.jazzcash_number
      }
    });
    
    // If parent provided callback, use it
    if (onBookNow) {
      onBookNow(bookingData);
      return;
    }
    
    // Check if user is logged in
    if (!token || token === "null" || token === "undefined" || token.trim() === "") {
      localStorage.setItem("pending_booking_data", JSON.stringify(bookingData));
      navigate("/login", {
        replace: true,
        state: {
          from: `/book-vehicle/${vehicle.id}`,
          vehicleDetails: vehicle,
          fromCard: true,
          redirectTo: "/payment"
        }
      });
      return;
    }
    
    // Store in localStorage and navigate to payment
    localStorage.setItem("booking_payload", JSON.stringify(bookingData));
    localStorage.setItem("paymentData", JSON.stringify(bookingData));
    
    navigate("/payment", {
      state: {
        fromSearch: true,
        bookingData: bookingData,
        vehicleDetails: vehicle,
        fromCard: true
      }
    });
  };

  // Get filters from localStorage
  const filters = JSON.parse(localStorage.getItem("search_filters")) || {};
  const arrivalDate = filters.arrival_date || "Not selected";
  const arrivalTime = filters.arrival_time ? filters.arrival_time.slice(0, 5) : "Not selected";

  // Calculate total price
  const totalPrice = calculateTotalPrice ? calculateTotalPrice(vehicle) : 0;
  
  // Helper functions
  const getServiceTypeDisplay = () => {
    if (vehicle.is_long_drive && vehicle.is_specific_route) {
      return "Long Drive & Fixed Route";
    } else if (vehicle.is_long_drive) {
      return "Long Drive";
    } else if (vehicle.is_specific_route) {
      return "Fixed Route";
    }
    return "Standard Hire";
  };

  const getRouteDisplay = () => {
    if (serviceType === "specific_route") {
      return {
        from: vehicle.route_from || vehicle.from_location || vehicle.location_address || "Pickup",
        to: vehicle.route_to || vehicle.to_location || toLocation || "Destination"
      };
    } else if (serviceType === "long_drive") {
      return {
        from: vehicle.location_address || vehicle.route_from || vehicle.from_location || "Your Location",
        to: "Any Destination"
      };
    }
    return { from: "Flexible", to: "Flexible" };
  };

  const route = getRouteDisplay();

  // Display values
  const displayVehicleNumber = vehicle.vehicle_number || vehicle.vehicle_number_snapshot || "N/A";
  const displayVehicleType = vehicle.vehicle_type || vehicle.vehicle_type_snapshot || "Vehicle";
  const displaySeats = vehicle.vehicle_seats || vehicle.vehicle_seats_snapshot || "N/A";
  const displayRating = vehicle.rating || "New";

  // Rating display
  const renderRating = () => {
    if (typeof vehicle.rating === "number" && vehicle.rating > 0) {
      const fullStars = Math.floor(vehicle.rating);
      return (
        <div className="flex items-center">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < fullStars ? 'fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="ml-1 text-xs font-semibold text-gray-700">
            {vehicle.rating.toFixed(1)}
          </span>
        </div>
      );
    }
    return (
      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
        ⭐ New
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl hover:shadow-2xl transition-all overflow-hidden max-w-full lg:max-w-4xl mx-auto mb-6">
      <div className="flex flex-col md:flex-row">
        
        {/* Image Section */}
        <div className="md:w-[30%] relative">
          <img
            src={vehicle.vehicle_image || vehicle.vehicle_image_snapshot || "/placeholder.svg"}
            alt={vehicle.company_name || "Vehicle"}
            className="w-full h-48 md:h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder.svg";
            }}
          />
          {/* Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              WHOLE VEHICLE
            </span>
          </div>
          
          {/* Vehicle Number */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              {displayVehicleNumber}
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="md:w-[70%] p-5 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start pb-3 border-b">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900 flex-1 line-clamp-1">
                  {vehicle.company_name || "Transport Service"}
                </h3>
                {renderRating()}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  vehicle.is_long_drive && vehicle.is_specific_route 
                    ? "bg-purple-100 text-purple-800" 
                    : vehicle.is_long_drive 
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}>
                  {getServiceTypeDisplay()}
                </span>
                
                {vehicle.is_specific_route && vehicle.fixed_fare && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Fixed Fare
                  </span>
                )}
                
                {vehicle.is_long_drive && vehicle.per_hour_rate && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    Hourly Rate
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Route Display */}
          {route.from && route.to && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center text-gray-700">
                <Route className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-500">Route</div>
                  <div className="font-bold text-base">
                    <span className="text-gray-800">{route.from}</span> 
                    <span className="text-gray-400 mx-2">→</span> 
                    <span className="text-gray-800">{route.to}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Vehicle & Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Details */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Car className="w-4 h-4 text-blue-500 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Vehicle Type</div>
                  <div className="font-semibold capitalize">{displayVehicleType}</div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 text-green-500 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Seating Capacity</div>
                  <div className="font-semibold">{displaySeats} Seats</div>
                </div>
              </div>
            </div>
            
            {/* Location & Duration */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 text-red-500 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Pickup Location</div>
                  <div className="font-semibold line-clamp-1">
                    {vehicle.location_address || "Flexible"}
                  </div>
                </div>
              </div>
              
              {serviceType === "long_drive" && durationType && (
                <div className="flex items-center text-gray-600">
                  <Clock4 className="w-4 h-4 text-blue-500 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-semibold">
                      {durationValue} {durationType}{durationValue > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Date & Time */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3 pt-2 border-t">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 text-red-500 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Start Date</div>
                  <div className="font-semibold">{arrivalDate}</div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 text-red-500 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Start Time</div>
                  <div className="font-semibold">{arrivalTime}</div>
                </div>
              </div>
            </div>
            
            {/* Rate Display */}
            <div className="md:col-span-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <div>
                    <div className="text-xs text-green-600">Current Rate</div>
                    <div className="font-bold">
                      {getDisplayRate ? getDisplayRate(vehicle) : "Contact for rates"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Charges Breakdown */}
          {getChargesBreakdown && getChargesBreakdown(vehicle)}

          {/* Price and Action Section */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              {/* Price Display */}
              <div>
                <div className="text-3xl font-extrabold text-teal-700 flex items-center">
                  <DollarSign className="w-6 h-6 mr-1" /> {totalPrice.toFixed(0)} PKR
                </div>
                <p className="text-sm text-gray-500">
                  Total for {serviceType === "long_drive" ? 
                    `${durationValue} ${durationType}${durationValue > 1 ? 's' : ''}` : 
                    "this trip"}
                </p>
              </div>
              
              {/* Book Now Button */}
              <motion.button
                onClick={handleBookingClick}
                className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-teal-700 hover:to-emerald-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Now
              </motion.button>
            </div>
            
            {/* Payment Methods Info */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">Payment Options:</span>
                {vehicle.payment_type === "BOTH" && (
                  <>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Cash</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Online</span>
                  </>
                )}
                {vehicle.payment_type === "CASH" && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Cash Only</span>
                )}
                {vehicle.payment_type === "ONLINE" && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Online Only</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;