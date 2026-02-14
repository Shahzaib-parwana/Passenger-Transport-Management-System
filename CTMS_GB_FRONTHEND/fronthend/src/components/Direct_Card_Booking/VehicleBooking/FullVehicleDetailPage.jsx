import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Car,
  MapPin,
  DollarSign,
  Route,
  Clock,
  Calendar,
  Package,
  Users,
  Navigation,
  Zap,
  CheckCircle,
  ArrowLeft,
  Phone,
  MessageCircle,
  Shield,
  Fuel,
  Cog,
  Wifi,
  Airplay,
  User,
  PhoneCall,
  AlertCircle
} from "lucide-react";
import defaultVehicleImage from "../../../Home/GB_picture/Car.jpeg";

// Helper functions
const getPricingDisplay = (data) => {
  if (!data) {
    return {
      type: 'custom',
      primary: 'Contact for Price',
      secondary: '',
      icon: DollarSign,
      color: 'text-gray-600',
      description: 'Price available on request'
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

const getVehicleFeatures = (vehicleData) => {
  if (!vehicleData || !vehicleData.vehicle_features) return [];
  
  const features = [];
  const vehicleFeatures = vehicleData.vehicle_features;
  
  if (vehicleFeatures.AC) features.push({ name: "Air Conditioning", icon: Airplay, color: "text-blue-500" });
  if (vehicleFeatures.WiFi) features.push({ name: "WiFi", icon: Wifi, color: "text-green-500" });
  if (vehicleFeatures.RecliningSeats) features.push({ name: "Reclining Seats", icon: Users, color: "text-purple-500" });
  if (vehicleFeatures.ChargingPorts) features.push({ name: "Charging Ports", icon: Zap, color: "text-yellow-500" });
  if (vehicleFeatures.FreeWaterBottle) features.push({ name: "Free Water", icon: MessageCircle, color: "text-cyan-500" });
  
  return features;
};

export default function VehicleDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Location state:", location.state);
    
    if (location.state?.vehicleDetails) {
      setVehicleData(location.state.vehicleDetails);
      setLoading(false);
    } else {
      // Agar data nahi mila toh error show karein
      setLoading(false);
    }
  }, [location.state, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-6">The vehicle details could not be loaded.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayRating = vehicleData.rating || "New";
  const displayAddress = vehicleData.location_address || "Location not specified";
  const displayVehicleType = vehicleData.vehicle_type || "Premium Vehicle";
  const displayImage = vehicleData.vehicle_image || defaultVehicleImage;
  const vehicleSeats = vehicleData.vehicle_seats || "N/A";
  const vehicleDetail = vehicleData.vehicle_details || "N/A";
  const vehicleNumber = vehicleData.vehicle_number || "Not Available";
  const driverName = vehicleData.driver_name || "Professional Driver";
  const driverContact = vehicleData.driver_contact || "Contact not available";
  const driverImage = vehicleData.driver_image || defaultVehicleImage;

  const pricing = getPricingDisplay(vehicleData);
  const vehicleFeatures = getVehicleFeatures(vehicleData);
console.log("Vehicle data:",vehicleData)
  const handleBookNow = () => {
    const token = localStorage.getItem("accessToken");

    if (!token || token === "null" || token === "undefined" || token.trim() === "") {
      navigate("/login", {
        replace: true,
        state: {
          from: `/book-vehical/${id}`,
          vehicleDetails: vehicleData,
        },
      });
      return;
    }

    navigate(`/book-vehical/${id}`, {
      state: {
        vehicleDetails: vehicleData,
      },
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const renderRatingStars = () => {
    if (typeof vehicleData.rating === "number" && vehicleData.rating > 0 && vehicleData.rating <= 5) {
      const fullStars = Math.floor(vehicleData.rating);
      return (
        <div className="flex items-center">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < fullStars ? 'fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="ml-2 text-lg font-semibold text-gray-700">
            {vehicleData.rating.toFixed(1)}
          </span>
        </div>
      );
    }
    return (
      <span className="text-lg font-semibold text-green-600 bg-green-100 px-4 py-2 rounded-full">
        ⭐ New Service
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 mr-2" />
              <span className="font-semibold">Back</span>
            </button>
            
            <h1 className="text-xl font-bold text-gray-900">Vehicle Details</h1>
            
            <div className="w-6"></div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-6">
            {/* Vehicle Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <img
                src={displayImage}
                alt={vehicleData.company_name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultVehicleImage;
                }}
              />
            </motion.div>

            {/* Driver Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Driver Information</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={driverImage}
                  alt={driverName}
                  className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultVehicleImage;
                  }}
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{driverName}</h4>
                  <div className="flex items-center mt-2 text-gray-600">
                    <PhoneCall className="w-4 h-4 mr-2" />
                    <span className="font-medium">{driverContact}</span>
                  </div>
                  <div className="mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <User className="w-3 h-3 mr-1" />
                      Professional Driver
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vehicle Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Vehicle Specifications</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <Car className="w-8 h-8 text-blue-500 mr-4" />
                  <div>
                    <div className="text-sm text-gray-500">Vehicle Type</div>
                    <div className="font-semibold text-gray-900">{displayVehicleType}</div>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <Users className="w-8 h-8 text-green-500 mr-4" />
                  <div>
                    <div className="text-sm text-gray-500">Seating Capacity</div>
                    <div className="font-semibold text-gray-900">{vehicleSeats} Seats</div>
                  </div>
                </div>

                {vehicleNumber && vehicleNumber !== "Not Available" && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <Shield className="w-8 h-8 text-indigo-500 mr-4" />
                    <div>
                      <div className="text-sm text-gray-500">Vehicle Number</div>
                      <div className="font-semibold text-gray-900">{vehicleNumber}</div>
                    </div>
                  </div>
                )}

                {vehicleData.allow_custom_quote && (
                  <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                    <Zap className="w-8 h-8 text-purple-500 mr-4" />
                    <div>
                      <div className="text-sm text-gray-500">Custom Quote</div>
                      <div className="font-semibold text-purple-700">Available</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Vehicle Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Vehicle Specifications</h3>
              
              <div className="grid grid-cols-2 gap-6">
                {/* <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <Car className="w-8 h-8 text-blue-500 mr-4" />
                  <div>
                    <div className="text-sm text-gray-500">Vehicle Type</div>
                    <div className="font-semibold text-gray-900">{displayVehicleType}</div>
                  </div>
                </div> */}

                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <Users className="w-8 h-8 text-green-500 mr-4" />
                  <div>
                    <div className="text-sm text-gray-500">Details Explain</div>
                    <div className="font-semibold text-gray-900">{vehicleDetail} Details Explain</div>
                  </div>
                </div>

          
              </div>
            </motion.div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Vehicle Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {vehicleData.company_name}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{displayAddress}</span>
                  </div>
                </div>
                {vehicleData.company_logo_url && (
                  <img 
                    src={vehicleData.company_logo_url} 
                    alt={vehicleData.company_name}
                    className="w-16 h-16 rounded-full border-2 border-gray-200"
                  />
                )}
              </div>

              {renderRatingStars()}
            </motion.div>

            {/* Route Information */}
            {vehicleData.route_from && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Route Information</h3>
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <Route className="w-6 h-6 text-blue-600 mr-3" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-700">
                      {vehicleData.route_from} → {vehicleData.route_to}
                    </div>
                    {vehicleData.is_long_drive && (
                      <div className="text-blue-600 mt-1">Long Drive Service Available</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Pricing Details</h3>
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Best Price
                </span>
              </div>

              {/* Main Pricing */}
              <div className={`flex items-center ${pricing.color} font-bold text-3xl mb-6 py-4 border-y border-gray-100`}>
                <pricing.icon className="w-8 h-8 mr-4" />
                <span>{pricing.primary}</span>
                <span className="text-xl font-semibold ml-3 text-gray-600">
                  {pricing.secondary}
                </span>
              </div>

              {/* All Pricing Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {vehicleData.per_hour_rate && (
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-700">Rs. {parseInt(vehicleData.per_hour_rate).toLocaleString()}</div>
                    <div className="text-sm text-blue-600">Per Hour</div>
                  </div>
                )}
                {vehicleData.per_day_rate && (
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-700">Rs. {parseInt(vehicleData.per_day_rate).toLocaleString()}</div>
                    <div className="text-sm text-green-600">Per Day</div>
                  </div>
                )}
                {vehicleData.weekly_rate && (
                  <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <Package className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-orange-700">Rs. {parseInt(vehicleData.weekly_rate).toLocaleString()}</div>
                    <div className="text-sm text-orange-600">Weekly Package</div>
                  </div>
                )}

                
              </div>

              {/* Additional Charges */}
              {(vehicleData.night_charge || vehicleData.mountain_surcharge) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Additional Charges</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {vehicleData.night_charge && (
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-700 font-medium">Night Charge</span>
                        <span className="font-bold text-purple-700">+Rs. {parseInt(vehicleData.night_charge).toLocaleString()}</span>
                      </div>
                    )}
                    {vehicleData.mountain_surcharge && (
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-orange-700 font-medium">Mountain Surcharge</span>
                        <span className="font-bold text-orange-700">+Rs. {parseInt(vehicleData.mountain_surcharge).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            

            {/* Features & Amenities */}
            {vehicleFeatures.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vehicleFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <feature.icon className={`w-5 h-5 mr-3 ${feature.color}`} />
                      <span className="font-medium text-gray-700">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Booking Bar */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{pricing.primary}</div>
              <div className="text-gray-600">{pricing.description}</div>
            </div>
            
            <div className="flex gap-4">
              <a 
                href={`tel:${driverContact}`}
                className="flex items-center px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Driver
              </a>
              
              <button
                onClick={handleBookNow}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Book Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}