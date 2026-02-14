import React from "react";
import { motion } from "framer-motion";
import { 
  MapPin, Users, DollarSign, Phone, User, Car, Star, Route, 
  Clock, Calendar, Package, Navigation, Zap, CheckCircle, Truck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// import defaultVehicleImage from "../../../Home/GB_picture/Car.jpeg";

const VehicleCard = ({ vehicle }) => {
  const navigate = useNavigate();

  // Image URL handling
  const imageUrl = 
    !vehicle.vehicle_image || vehicle.vehicle_image === "Nill"
      ? defaultVehicleImage
      : vehicle.vehicle_image.startsWith("http")
      ? vehicle.vehicle_image
      : `http://127.0.0.1:8000${vehicle.vehicle_image}`;

  // Helper: Get pricing display
  const getPricingDisplay = () => {
    if (vehicle.is_specific_route && vehicle.fixed_fare) {
      return {
        primary: `Rs. ${parseInt(vehicle.fixed_fare).toLocaleString()}`,
        secondary: vehicle.distance ? `• ${vehicle.distance} km` : 'Fixed Route',
        icon: Route,
        color: 'text-green-600',
      };
    }
    if (vehicle.is_long_drive) {
      if (vehicle.per_day_rate) {
        return {
          primary: `Rs. ${parseInt(vehicle.per_day_rate).toLocaleString()}`,
          secondary: '/ day',
          icon: Calendar,
          color: 'text-blue-600',
        };
      }
      if (vehicle.per_hour_rate) {
        return {
          primary: `Rs. ${parseInt(vehicle.per_hour_rate).toLocaleString()}`,
          secondary: '/ hour',
          icon: Clock,
          color: 'text-purple-600',
        };
      }
    }
    if (vehicle.rate_per_km) {
      return {
        primary: `Rs. ${vehicle.rate_per_km}`,
        secondary: '/ km',
        icon: Navigation,
        color: 'text-red-600',
      };
    }
    return {
      primary: 'Contact for Price',
      secondary: 'Custom Quote',
      icon: DollarSign,
      color: 'text-gray-600',
    };
  };

  // Helper: Get service badges
  const getServiceBadges = () => {
    const badges = [];
    if (vehicle.is_specific_route) {
      badges.push({
        text: "Fixed Route",
        icon: Route,
        color: "bg-green-100 text-green-700 border border-green-200",
      });
    }
    if (vehicle.is_long_drive) {
      badges.push({
        text: "Long Drive",
        icon: Calendar,
        color: "bg-blue-100 text-blue-700 border border-blue-200",
      });
    }
    if (vehicle.is_taxi_service) {
      badges.push({
        text: "Taxi Service",
        icon: Car,
        color: "bg-orange-100 text-orange-700 border border-orange-200",
      });
    }
    return badges;
  };

  const pricing = getPricingDisplay();
  const serviceBadges = getServiceBadges();

  // **SAME AS UPPER CARD: Book Now function**
  const handleBookNow = (e) => {
    if (e) {
      e.stopPropagation();
    }
    
    const token = localStorage.getItem("accessToken");
    
    // **IMPORTANT: Use same data structure as upper card**
    const data = vehicle; // Directly use vehicle object
    
    console.log("Card data:", data);

    if (!token || token === "null" || token === "undefined" || token.trim() === "") {
      // **SAME AS UPPER CARD: Navigate to login**
      navigate("/login", {
        replace: true,
        state: {
          from: `/book-vehical/${data.id}`, // Use data.id (offer id)
          vehicleDetails: data,
          fromCard: true,
        },
      });
      return;
    }

    // **SAME AS UPPER CARD: Navigate to book-vehical with id**
    navigate(`/book-vehical/${data.id}`, {
      state: {
        vehicleDetails: data,
        fromCard: true,
      },
    });
  };

  // **SAME AS UPPER CARD: Details function**
  const handleDetails = (e) => {
    if (e) {
      e.stopPropagation();
    }
    
    const data = vehicle; // Directly use vehicle object
    
    navigate(`/book-vehical-details/${data.id}`, {
      state: {
        vehicleDetails: data,
      },
    });
  };

  // Render rating stars
  const renderRating = () => {
    if (typeof vehicle.rating === "number" && vehicle.rating > 0 && vehicle.rating <= 5) {
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

  // Render route display
  const renderRoute = () => {
    if (vehicle.is_specific_route && vehicle.route_from && vehicle.route_to) {
      return (
        <div className="flex items-center text-green-700 font-semibold text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 mb-2">
          <Route className="w-4 h-4 mr-2" />
          <span className="truncate">{vehicle.route_from} → {vehicle.route_to}</span>
        </div>
      );
    }
    if (vehicle.location_address) {
      return (
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
          <span className="truncate">{vehicle.location_address}</span>
        </div>
      );
    }
    return null;
  };

  // **REMOVED: Card click handler (same as upper card)**
  // Upper card mein bhi card pe click nahi hota, sirf buttons pe

  return (
    <motion.div
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-indigo-300 flex flex-col md:flex-row overflow-hidden transform hover:-translate-y-1"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Image Section - Landscape left side */}
      <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden">
        <img
          src={imageUrl}
          alt={vehicle.vehicle_type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultVehicleImage;
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Top Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {vehicle.is_taxi_service ? "TAXI SERVICE" : "WHOLE VEHICLE HIRE"}
          </span>
        </div>
        
        {/* Bottom Info */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          {vehicle.vehicle_number && vehicle.vehicle_number !== "N/A" && (
            <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              {vehicle.vehicle_number}
            </span>
          )}
          <div className="flex-shrink-0">
            {renderRating()}
          </div>
        </div>
      </div>

      {/* Content Section - Landscape right side */}
      <div className="md:w-3/5 p-5 flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-gray-900 leading-tight pr-2">
              {vehicle.company_name || vehicle.vehicle_type}
            </h3>
          </div>

          {/* Route Display */}
          {renderRoute()}

          {/* Driver Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1.5 text-blue-500" />
              <span className="font-medium">{vehicle.driver_name || "Driver N/A"}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1.5 text-green-500" />
              <span>{vehicle.driver_contact || "N/A"}</span>
            </div>
          </div>

          {/* Main Pricing */}
          <div className={`flex items-center ${pricing.color} font-bold text-lg mb-4 py-3 border-y border-gray-100`}>
            <pricing.icon className="w-5 h-5 mr-3" />
            <span className="text-lg">{pricing.primary}</span>
            <span className="text-sm font-semibold ml-2 text-gray-600">
              {pricing.secondary}
            </span>
          </div>

          {/* Vehicle Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-green-500" />
              <span>{vehicle.vehicle_seats || "N/A"} Seats</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Car className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-semibold capitalize">{vehicle.vehicle_type || "Vehicle"}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start pt-2 mb-4">
            <MapPin className="w-4 h-4 mr-2 text-indigo-500 mt-0.5 flex-shrink-0" />
            <span className="font-medium text-gray-700 line-clamp-2">
              {vehicle.location_address || "Location not specified"}
            </span>
          </div>

          {/* Service Badges */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {serviceBadges.map((badge, index) => (
                <span
                  key={index}
                  className={`flex items-center text-xs font-semibold px-3 py-1.5 rounded-full ${badge.color} transition-colors duration-300`}
                >
                  <badge.icon className="w-3 h-3 mr-1.5" />
                  {badge.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons - EXACTLY SAME AS UPPER CARD */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <motion.button
            onClick={handleBookNow}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center group/btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="group-hover/btn:scale-105 transition-transform">Book Now</span>
          </motion.button>
          
          <motion.button
            onClick={handleDetails}
            className="px-4 border-2 border-indigo-200 text-indigo-600 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Details</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;