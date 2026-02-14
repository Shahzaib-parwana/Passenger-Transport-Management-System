import React from "react";
import { motion } from "framer-motion";
import { 
  Star, Car, MapPin, DollarSign, Route, Clock,Calendar,Package,Users,Navigation,Zap,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultVehicleImage from "../../../Home/GB_picture/Car.jpeg";

// 🔑 Helper: Get pricing display based on offer type
const getPricingDisplay = (offer, complete_offer) => {
  const data = complete_offer || offer;

  if (data.is_specific_route && data.fixed_fare) {
    return {
      type: 'fixed_route',
      primary: `Rs. ${parseInt(data.fixed_fare).toLocaleString()}`,
      secondary: data.distance ? `• ${data.distance} km` : 'Fixed Route',
      icon: Route,
      color: 'text-green-600',
      description: 'Complete route package'
    };
  }

  if (data.is_long_drive) {
    if (data.per_day_rate) {
      return {
        type: 'daily',
        primary: `Rs. ${parseInt(data.per_day_rate).toLocaleString()}`,
        secondary: '/ day',
        icon: Calendar,
        color: 'text-blue-600',
        description: 'Per day rental'
      };
    }
    if (data.per_hour_rate) {
      return {
        type: 'hourly',
        primary: `Rs. ${parseInt(data.per_hour_rate).toLocaleString()}`,
        secondary: '/ hour',
        icon: Clock,
        color: 'text-purple-600',
        description: 'Hourly rental'
      };
    }
    if (data.weekly_rate) {
      return {
        type: 'weekly',
        primary: `Rs. ${parseInt(data.weekly_rate).toLocaleString()}`,
        secondary: '/ week',
        icon: Package,
        color: 'text-orange-600',
        description: 'Weekly package'
      };
    }
  }

  if (data.rate_per_km) {
    return {
      type: 'rate_km',
      primary: `Rs. ${data.rate_per_km}`,
      secondary: '/ km',
      icon: Navigation,
      color: 'text-red-600',
      description: 'Per kilometer rate'
    };
  }

  return {
    type: 'custom',
    primary: 'Custom Price',
    secondary: 'Contact for details',
    icon: DollarSign,
    color: 'text-gray-600',
    description: 'Custom pricing available'
  };
};

// 🔑 Helper: Get service badges
const getServiceBadges = (offer, complete_offer) => {
  const data = complete_offer || offer;
  const badges = [];
  
  if (data?.is_specific_route) {
    badges.push({
      text: "Fixed Route",
      icon: Route,
      color: "bg-green-100 text-green-700 border border-green-200",
    });
  }
  
  if (data?.is_long_drive) {
    badges.push({
      text: "Long Drive",
      icon: Calendar,
      color: "bg-blue-100 text-blue-700 border border-blue-200",
    });
  }
  
  if (data?.allow_custom_quote) {
    badges.push({
      text: "Custom Quote",
      icon: Zap,
      color: "bg-purple-100 text-purple-700 border border-purple-200",
    });
  }

  return badges;
};

// 🔑 Helper: Get additional pricing details
const getAdditionalPricing = (offer, complete_offer) => {
  const data = complete_offer || offer;
  if (!data) return [];
  
  const details = [];
  
  if (data.is_long_drive) {
    if (data.per_hour_rate) {
      details.push({ label: "Hourly", value: `Rs. ${parseInt(data.per_hour_rate).toLocaleString()}` });
    }
    if (data.per_day_rate) {
      details.push({ label: "Daily", value: `Rs. ${parseInt(data.per_day_rate).toLocaleString()}` });
    }
    if (data.weekly_rate) {
      details.push({ label: "Weekly", value: `Rs. ${parseInt(data.weekly_rate).toLocaleString()}` });
    }
  }

  if (data.is_specific_route && data.fixed_fare) {
    details.push({ label: "Fixed Fare", value: `Rs. ${parseInt(data.fixed_fare).toLocaleString()}` });
    if (data.distance) {
      details.push({ label: "Distance", value: `${data.distance} km` });
    }
  }

  if (data.night_charge) {
    details.push({ label: "Night Charge", value: `+Rs. ${parseInt(data.night_charge).toLocaleString()}` });
  }
  if (data.mountain_surcharge) {
    details.push({ label: "Mountain", value: `+Rs. ${parseInt(data.mountain_surcharge).toLocaleString()}` });
  }
  
  return details.slice(0, 4);
};

export default function VehicalBookingCard({
  id,
  company_name,
  route,
  fare,
  rating,
  image,
  is_long_drive,
  is_specific_route,
  location_address,
  vehicle_details,
  type = "rental",
  complete_offer
}) {
  const navigate = useNavigate();

  const data = complete_offer || {
    id, company_name, route, fare, rating, image, 
     is_long_drive, is_specific_route, location_address,vehicle_details
  };

  const displayRating = data.rating || "New";
  const displayAddress = data.location_address || "Location not specified";
  const displayVehicleType = !data.vehicle_type || data.route || "Premium Vehicle";
  const img =
    data.vehicle_image ||
    data.image ||
    null;
  
  const displayImage =
  !img || img === "Nill"
    ? defaultVehicleImage
    : img.startsWith("http")
        ? img
        : `${BASE_URL}${img}`;

  const vehicleSeats = data.vehicle_seats || data.vehicle_seats_snapshot;
  const vehicleNumber = data.vehicle_number || data.vehicle_number_snapshot;
  const vehicleDetail = data.vehicle_details || "NULLL";
  const pricing = getPricingDisplay(data, complete_offer);
  const serviceBadges = getServiceBadges(data, complete_offer);
  const additionalPricing = getAdditionalPricing(data, complete_offer);
  
  const handleViewDetails = () => navigate(`/book-vehical-details/${id}`, {
  state: {
    vehicleDetails: data,
  },
});

  const handleBookNow = () => {
    const token = localStorage.getItem("accessToken");
    if (!token || token === "null" || token === "undefined" || token.trim() === "") {
      navigate("/login", {
        replace: true,
        state: {
          from: `/book-vehical/${id}`,
          vehicleDetails: data,
          fromCard: true,
        },
      });
      return;
    }

    navigate(`/book-vehical/${id}`, {
      state: {
        vehicleDetails: data,
        fromCard: true,
      },
    });
  };

  const renderRating = () => {
    if (typeof data.rating === "number" && data.rating > 0 && data.rating <= 5) {
      const fullStars = Math.floor(data.rating);
      return (
        <div className="flex items-center">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 ${i < fullStars ? 'fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="ml-1 sm:ml-2 text-xs font-semibold text-gray-700">
            {data.rating.toFixed(1)}
          </span>
        </div>
      );
    }
    return (
      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 sm:px-2 sm:py-1 rounded-full whitespace-nowrap">
        ⭐ New
      </span>
    );
  };

  const renderRoute = () => {
    if (data.is_specific_route && data.route_from && data.route_to) {
      return (
        <div className="flex items-center text-green-700 font-semibold text-xs sm:text-sm bg-green-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-green-200 mb-3">
          <Route className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate text-xs sm:text-sm">{data.route_from} → {data.route_to}</span>
        </div>
      );
    }
    return null;
  };

  const renderVehicleInfo = () => {
    const info = [];
    
    if (displayVehicleType && displayVehicleType !== "Unknown Vehicle") {
      info.push(
        <div key="type" className="flex items-center">
          <Car className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-500 flex-shrink-0" />
          <span className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{displayVehicleType}</span>
        </div>
      );
    }
    
    if (vehicleSeats && vehicleSeats !== "N/A") {
      info.push(
        <div key="seats" className="flex items-center text-gray-600">
          <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm">{vehicleSeats} Seats</span>
        </div>
      );
    }

    return info;
  };

  return (
    <motion.div
      className="group bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-200 hover:border-indigo-300 flex flex-col h-full transform hover:-translate-y-1 sm:hover:-translate-y-2"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Image Section - Responsive Height */}
      <div className="relative h-36 xs:h-40 sm:h-44 md:h-48 overflow-hidden rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl">
        <img
          src={displayImage}
          alt={company_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultVehicleImage;
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Top Badges - Responsive Text */}
        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex justify-between items-start">
          <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] xs:text-xs font-bold px-2 xs:px-3 py-0.5 xs:py-1 sm:py-1.5 rounded-full shadow-lg whitespace-nowrap">
            WHOLE VEHICLE HIRE
          </span>
          {data.company_logo_url && (
            <img 
              src={data.company_logo_url} 
              alt={company_name}
              className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full border border-white shadow-lg"
            />
          )}
        </div>
        
        {/* Bottom Info */}
        {vehicleNumber && vehicleNumber !== "N/A" && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
            <span className="bg-black/70 text-white text-[10px] xs:text-xs px-2 xs:px-3 py-0.5 xs:py-1.5 rounded-full backdrop-blur-sm truncate max-w-[120px] xs:max-w-none">
              {vehicleNumber}
            </span>
          </div>
        )}
      </div>

      {/* Content Section - Responsive Padding */}
      <div className="p-3 xs:p-4 sm:p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <h3 className="text-sm xs:text-base sm:text-lg font-bold text-gray-900 leading-tight pr-2 flex-1 line-clamp-2">
            {company_name}
          </h3>
          <div className="flex-shrink-0">
            {renderRating()}
          </div>
        </div>

        {/* Route Display */}
        {renderRoute()}

        {/* Main Pricing - Responsive Text */}
        <div className={`flex items-center ${pricing.color} font-bold text-base xs:text-lg sm:text-xl md:text-2xl my-3 sm:my-4 py-2 sm:py-3 border-y border-gray-100`}>
          <pricing.icon className="w-4 h-4 xs:w-5 xs:h-5 mr-2 xs:mr-3" />
          <span>{pricing.primary}</span>
          <span className="text-xs xs:text-sm sm:text-base font-semibold ml-1 xs:ml-2 text-gray-600">
            {pricing.secondary}
          </span>
        </div>

        {/* Vehicle & Location Info */}
        <div className="space-y-2 xs:space-y-3 text-xs xs:text-sm text-gray-600 mb-3 xs:mb-4 flex-1">
          {renderVehicleInfo().length > 0 && (
            <div className="space-y-1 xs:space-y-2">
              {renderVehicleInfo()}
            </div>
          )}
          
          <div className="flex items-start pt-1 xs:pt-2">
            <MapPin className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2 text-indigo-500 mt-0.5 flex-shrink-0" />
            <span className="font-medium text-gray-700 line-clamp-2 text-xs xs:text-sm">{displayAddress}</span>
          </div>
        </div>

        {/* Additional Pricing Details */}
        {additionalPricing.length > 0 && (
          <div className="mb-3 xs:mb-4 p-2 xs:p-3 bg-gray-50 rounded-lg xs:rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 xs:gap-2">
              {additionalPricing.map((detail, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-gray-600 truncate">{detail.label}:</span>
                  <span className="font-semibold text-gray-800 whitespace-nowrap ml-1">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Badges */}
        <div className="mt-auto pt-3 xs:pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-1 xs:gap-2">
            {serviceBadges.length > 0 ? (
              serviceBadges.map((badge, index) => (
                <span
                  key={index}
                  className={`flex items-center text-[10px] xs:text-xs font-semibold px-2 xs:px-3 py-1 xs:py-1.5 rounded-full ${badge.color} transition-colors duration-300 whitespace-nowrap`}
                >
                  <badge.icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1 xs:mr-1.5" />
                  {badge.text}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500 italic">
                Flexible booking options
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Responsive Sizing */}
      <div className="p-3 xs:p-4 sm:p-5 pt-0">
        <div className="flex gap-2 xs:gap-3">
          <motion.button
            onClick={handleBookNow}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl font-semibold text-xs xs:text-sm hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center group/btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="group-hover/btn:scale-105 transition-transform">Book Now</span>
          </motion.button>
          
          <motion.button
            onClick={handleViewDetails}
            className="px-3 xs:px-4 border border-indigo-200 text-indigo-600 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl font-semibold text-xs xs:text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Details</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}