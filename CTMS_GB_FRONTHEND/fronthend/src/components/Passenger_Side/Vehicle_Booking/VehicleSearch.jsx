"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Loader2,
  Calendar,
  Clock,
  CarFront,
  User,
  Phone,
  Mail,
  CreditCard,
  ArrowUpDown,
  ArrowRight,
  Filter,
  Tag,
  Route,
  DollarSign,
  Clock4,
  CalendarDays,
  Mountain,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import apiPrivate from "../../../api/apiprivate";
import VehicleCard from "./Vehical_offer_card_in_passengerdashboard";

const VEHICLE_TYPES = ["Car", "Coaster", "Hiace", "Bus", "Jeep", "Carry Daba"];

const DURATION_TYPES = [
  { value: "hourly", label: "Hourly", description: "Rent by hours" },
  { value: "daily", label: "Daily", description: "Rent by days" },
  { value: "weekly", label: "Weekly", description: "Rent by weeks" },
];

const SERVICE_TYPES = [
  { value: "long_drive", label: "Long Drive", description: "Duration-based rental with flexible pricing" },
  { value: "specific_route", label: "Specific Route", description: "Fixed fare for predefined routes" },
];

const InputGroup = ({ label, icon: Icon, type, value, onChange, placeholder, options, disabled = false, name, min, max }) => (
  <div className="flex-1 w-full">
    <label className="text-sm font-semibold text-gray-700 flex items-center mb-1">
      <Icon className="w-4 h-4 mr-1 text-indigo-500" /> {label}
    </label>
    {options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-3 border border-gray-300 rounded-lg transition-all duration-200 text-base md:text-sm ${
          disabled 
            ? "bg-gray-100 cursor-not-allowed text-gray-500" 
            : "bg-white hover:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        }`}
      >
        <option value="">-- Select {label} --</option>
        {options.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
    ) : (
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-full p-3 border border-gray-300 rounded-lg transition-all duration-200 text-base md:text-sm ${
          disabled 
            ? "bg-gray-100 cursor-not-allowed text-gray-500" 
            : "bg-white hover:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        }`}
      />
    )}
  </div>
);

const ServiceTypeCard = ({ type, label, description, isSelected, onClick }) => (
  <div
    onClick={() => onClick(type)}
    className={`p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
      isSelected
        ? "border-indigo-500 bg-indigo-50 shadow-md"
        : "border-gray-200 bg-white hover:border-indigo-300"
    }`}
  >
    <div className="flex items-start space-x-2 md:space-x-3">
      <div className={`p-2 rounded-lg flex-shrink-0 ${
        isSelected ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"
      }`}>
        <CarFront className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base">{label}</h3>
        <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
      </div>
      {isSelected && (
        <div className="w-2 h-2 md:w-3 md:h-3 bg-indigo-500 rounded-full flex-shrink-0 mt-1"></div>
      )}
    </div>
  </div>
);

const DurationTypeCard = ({ type, label, description, isSelected, onClick }) => (
  <div
    onClick={() => onClick(type)}
    className={`p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
      isSelected
        ? "border-teal-500 bg-teal-50 shadow-md"
        : "border-gray-200 bg-white hover:border-teal-300"
    }`}
  >
    <div className="flex items-center space-x-2 md:space-x-3">
      <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${
        isSelected ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-600"
      }`}>
        <Clock4 className="w-3 h-3 md:w-4 md:h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base">{label}</h3>
        <p className="text-xs md:text-sm text-gray-600 line-clamp-1">{description}</p>
      </div>
    </div>
  </div>
);

const VehicleSearch = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from props (wrapper) OR location state
  const vehicleDataFromCard = props.vehicleDataFromCard || location.state?.vehicleDetails;
  const isDirectBooking = props.isDirectBooking || location.state?.fromCard || false;

  const [passenger, setPassenger] = useState({ name: "", contact: "", email: "", cnic: "" });
  const [filters, setFilters] = useState({ 
    service_type: "", 
    location_address: "",
    to_location: "", 
    arrival_date: "", 
    arrival_time: "", 
    vehicle_type: "",
    duration_type: "",
    duration_value: "",
    pickup_location: ""
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // New states for dynamic locations
  const [longDriveLocations, setLongDriveLocations] = useState([]);
  const [specificRouteFromOptions, setSpecificRouteFromOptions] = useState([]);
  const [specificRouteToOptions, setSpecificRouteToOptions] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Get current date and time for validation
  const getCurrentDateTime = () => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5);
    return { currentDate, currentTime };
  };

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await apiPrivate.get("/search/", {
        params: {
          offer_type: "whole_hire",
          limit: 100
        }
      });

      if (response.data && Array.isArray(response.data)) {
        const longDriveLocs = [...new Set(response.data
          .filter(vehicle => vehicle.is_long_drive && vehicle.location_address)
          .map(vehicle => vehicle.location_address)
        )].sort();

        const routeFromLocs = [...new Set(response.data
          .filter(vehicle => vehicle.is_specific_route && vehicle.route_from)
          .map(vehicle => vehicle.route_from)
        )].sort();

        const routeToLocs = [...new Set(response.data
          .filter(vehicle => vehicle.is_specific_route && vehicle.route_to)
          .map(vehicle => vehicle.route_to)
        )].sort();

        setLongDriveLocations(longDriveLocs);
        setSpecificRouteFromOptions(routeFromLocs);
        setSpecificRouteToOptions(routeToLocs);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoadingLocations(false);
    }
  };

  // ENHANCED INITIALIZATION FOR DIRECT BOOKING
  useEffect(() => {
    const storedPassenger = JSON.parse(localStorage.getItem("passenger_data") || "{}");

    if (storedPassenger && Object.keys(storedPassenger).length > 0) {
      setPassenger({
        name: storedPassenger.name || "",
        email: storedPassenger.email || "",
        contact: storedPassenger.contact || "",
        cnic: storedPassenger.cnic || "",
      });
    }

    const { currentDate, currentTime } = getCurrentDateTime();

    console.log("🔄 Initializing VehicleSearch with:", {
      isDirectBooking,
      vehicleDataFromCard,
      locationState: location.state
    });

    // FIXED DIRECT BOOKING INITIALIZATION
    if (isDirectBooking && vehicleDataFromCard) {
      console.log("🚗 Processing direct booking data:", vehicleDataFromCard);
      
      // Determine service type
      let serviceType = "";
      if (vehicleDataFromCard.is_long_drive) serviceType = "long_drive";
      else if (vehicleDataFromCard.is_specific_route) serviceType = "specific_route";
      else serviceType = "one_way";

      // Set default duration for long drive
      const defaultDuration = serviceType === "long_drive" ? {
        duration_type: vehicleDataFromCard.duration_type,
        duration_value: vehicleDataFromCard.duration_value,
      } : {};

      // Set filters
      const newFilters = {
        service_type: serviceType,
        location_address: vehicleDataFromCard.location_address || 
                         vehicleDataFromCard.route_from || 
                         vehicleDataFromCard.from_location || "",
        to_location: vehicleDataFromCard.route_to || 
                    vehicleDataFromCard.to_location || "",
        arrival_date: currentDate,
        arrival_time: currentTime,
        vehicle_type: vehicleDataFromCard.vehicle_type || "",
        pickup_location: vehicleDataFromCard.location_address || 
                        vehicleDataFromCard.route_from || 
                        vehicleDataFromCard.from_location || "",
        ...defaultDuration
      };

      console.log("🎯 Setting filters for direct booking:", newFilters);
      setFilters(newFilters);

      // Create comprehensive offer object
      const directBookingOffer = {
        id: vehicleDataFromCard.id || vehicleDataFromCard.vehicle_id,
        vehicle_id: vehicleDataFromCard.vehicle || vehicleDataFromCard.id,
        vehicle_type: vehicleDataFromCard.vehicle_type,
        company_name: vehicleDataFromCard.company_name,
        company_id: vehicleDataFromCard.company,
        
        // Images - ensure correct fields
        vehicle_image: vehicleDataFromCard.vehicle_image || 
                      vehicleDataFromCard.image || 
                      "https://placehold.co/400x220/82D8CC/ffffff?text=Vehicle+Image",
        driver_image: vehicleDataFromCard.driver_image || 
                     vehicleDataFromCard.driver_picture || 
                     (vehicleDataFromCard.driver && vehicleDataFromCard.driver.image) || 
                     "https://placehold.co/400x220/55D6C2/ffffff?text=Driver+Image",
        
        // Driver info
        driver_name: vehicleDataFromCard.driver_name || 
                    (vehicleDataFromCard.driver && vehicleDataFromCard.driver.name) || 
                    "Driver N/A",
        driver_contact: vehicleDataFromCard.driver_contact || 
                       (vehicleDataFromCard.driver && vehicleDataFromCard.driver.phone) || 
                       vehicleDataFromCard.driver_phone ||
                       "N/A",
        
        // Driver snapshot for consistency
        driver_name_snapshot: vehicleDataFromCard.driver_name || 
                             (vehicleDataFromCard.driver && vehicleDataFromCard.driver.name) || 
                             "Driver N/A",
        driver_contact_snapshot: vehicleDataFromCard.driver_contact || 
                                (vehicleDataFromCard.driver && vehicleDataFromCard.driver.phone) || 
                                vehicleDataFromCard.driver_phone ||
                                "N/A",
        
        // Vehicle numbers
        vehicle_number: vehicleDataFromCard.vehicle_number || 
                       vehicleDataFromCard.registration_number || 
                       "N/A",
        
        // Routes
        route_from: vehicleDataFromCard.route_from,
        route_to: vehicleDataFromCard.route_to,
        location_address: vehicleDataFromCard.location_address,
        from_location: vehicleDataFromCard.from_location,
        to_location: vehicleDataFromCard.to_location,
        
        // Rates
        fare: vehicleDataFromCard.rate_per_km,
        fixed_fare: vehicleDataFromCard.fixed_fare,
        per_hour_rate: vehicleDataFromCard.per_hour_rate,
        per_day_rate: vehicleDataFromCard.per_day_rate,
        weekly_rate: vehicleDataFromCard.weekly_rate,
        rate_per_km: vehicleDataFromCard.rate_per_km,
        
        // Service types
        is_long_drive: vehicleDataFromCard.is_long_drive,
        is_specific_route: vehicleDataFromCard.is_specific_route,
        
        // Additional charges
        night_charge: vehicleDataFromCard.night_charge,
        mountain_surcharge: vehicleDataFromCard.mountain_surcharge,
        
        // Metadata
        offer_name: vehicleDataFromCard.offer_name || "Direct Booking",
        offer_type: vehicleDataFromCard.offer_type || "whole_hire",
        
        // IDs for payment page
        company: vehicleDataFromCard.company,
        vehicle: vehicleDataFromCard.vehicle || vehicleDataFromCard.id,
        driver: vehicleDataFromCard.driver_id || 
               (vehicleDataFromCard.driver && vehicleDataFromCard.driver.id),
        
        // Additional fields that might be needed
        distance_km: vehicleDataFromCard.distance_km,
        vehicle_image_snapshot: vehicleDataFromCard.vehicle_image || vehicleDataFromCard.image,
        driver_image_snapshot: vehicleDataFromCard.driver_image || vehicleDataFromCard.driver_picture,
      };

      console.log("🎯 Created direct booking offer:", directBookingOffer);
      setSelectedOffer(directBookingOffer);

      // Store in localStorage for PaymentPage (MUST DO THIS)
      localStorage.setItem("selectedVehicle", JSON.stringify(directBookingOffer));
      localStorage.setItem("directBookingOffer", JSON.stringify(directBookingOffer));
      localStorage.setItem("search_filters", JSON.stringify(newFilters));
      
      console.log("✅ Direct booking data stored in localStorage");
      
    } else {
      // Normal flow (not direct booking)
      setFilters(prev => ({
        ...prev,
        arrival_date: prev.arrival_date || currentDate,
        arrival_time: prev.arrival_time || currentTime,
      }));
    }

    // Fetch locations
    fetchLocations();
  }, [isDirectBooking, vehicleDataFromCard]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceTypeSelect = (type) => {
    setFilters(prev => ({ 
      ...prev, 
      service_type: type,
      location_address: "",
      to_location: "",
      duration_type: "",
      duration_value: "",
      pickup_location: ""
    }));
    setSelectedOffer(null);
  };

  const handleDurationTypeSelect = (type) => {
    setFilters(prev => ({ 
      ...prev, 
      duration_type: type,
      duration_value: ""
    }));
  };

  const handleFilterChange = (type) => {
    setFilters(prev => ({
      ...prev,
      vehicle_type: prev.vehicle_type === type ? "" : type,
    }));
  };

  const validateDateTime = () => {
    const { currentDate, currentTime } = getCurrentDateTime();
    
    if (!filters.arrival_date) {
      return "Please select arrival date";
    }
    
    if (filters.arrival_date < currentDate) {
      return "Arrival date cannot be in the past";
    }
    
    if (filters.arrival_date === currentDate && filters.arrival_time < currentTime) {
      return "Arrival time cannot be in the past for today";
    }
    
    return null;
  };

  const isSimilar = (a, b) => {
    if (!a || !b) return false;
    
    const cleanA = a.toString().toLowerCase().trim().replace(/\s+/g, ' ');
    const cleanB = b.toString().toLowerCase().trim().replace(/\s+/g, ' ');
    
    if (cleanA === cleanB) return true;
    
    if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) return true;
    
    const variations = {
      'islamabad': ['isb'],
      'gilgit': ['gilgit city', 'gilgit baltistan'],
      'baltistan': ['skardu', 'gilgit baltistan'],
    };
    
    for (const [key, values] of Object.entries(variations)) {
      if ((cleanA === key && values.includes(cleanB)) || 
          (cleanB === key && values.includes(cleanA))) {
        return true;
      }
    }
    
    return false;
  };

  const filterVehiclesByService = (vehicles, serviceType, filters) => {
    if (!vehicles || !Array.isArray(vehicles)) return [];

    const filtered = vehicles.filter(vehicle => {
      if (serviceType === "specific_route") {
        if (!vehicle.is_specific_route) return false;
      } else if (serviceType === "long_drive") {
        if (!vehicle.is_long_drive) return false;
      }

      if (serviceType === "specific_route") {
        let fromMatch = false;
        let toMatch = false;

        if (filters.location_address) {
          fromMatch = 
            isSimilar(vehicle.route_from, filters.location_address) || 
            isSimilar(vehicle.from_location, filters.location_address);
          
          if (!fromMatch) return false;
        } else {
          fromMatch = true;
        }

        if (filters.to_location) {
          toMatch = 
            isSimilar(vehicle.route_to, filters.to_location) ||
            isSimilar(vehicle.to_location, filters.to_location);
          
          if (!toMatch) return false;
        } else {
          toMatch = true;
        }

        return fromMatch && toMatch;
      } 
      
      if (serviceType === "long_drive") {
        let pickupMatch = true;

        if (filters.pickup_location) {
          pickupMatch = isSimilar(vehicle.location_address, filters.pickup_location);
          if (!pickupMatch) return false;
        }

        return pickupMatch;
      }
      
      return true;
    });

    return filtered;
  };

  const handleSearch = async () => {
    setError("");
    
    const dateTimeError = validateDateTime();
    if (dateTimeError) {
      setError(dateTimeError);
      return;
    }

    if (filters.service_type === "specific_route") {
      if (!filters.location_address && !filters.to_location) {
        setError("Please select at least one location (from or to) for specific route");
        return;
      }
    } else if (filters.service_type === "long_drive") {
      if (!filters.duration_type || !filters.duration_value || !filters.pickup_location) {
        setError("Please select duration type, duration value, and pickup location for long drive");
        return;
      }
    }

    setLoading(true);
    setVehicles([]);
    setSelectedOffer(null);

    try {
      let queryParams = {
        offer_type: "whole_hire",
        arrival_date: filters.arrival_date,
        arrival_time: filters.arrival_time,
      };

      const response = await apiPrivate.get("/search/", { params: queryParams });
      
      if (!response.data) {
        throw new Error("No data received from server");
      }

      localStorage.setItem("search_filters", JSON.stringify({
        arrival_date: filters.arrival_date,
        arrival_time: filters.arrival_time,
        service_type: filters.service_type,
        ...(filters.service_type === "specific_route" && {
          location_address: filters.location_address,
          to_location: filters.to_location,
        }),
        ...(filters.service_type === "long_drive" && {
          duration_type: filters.duration_type,
          duration_value: filters.duration_value,
          pickup_location: filters.pickup_location,
        }),
      }));

      const filtered = filterVehiclesByService(response.data, filters.service_type, filters);
      setVehicles(filtered);

      if (filtered.length === 0) {
        if (filters.service_type === "specific_route") {
          setError(`No vehicles found for ${filters.location_address || ""} ${filters.to_location ? `to ${filters.to_location}` : ""}. Try adjusting your search locations.`);
        } else {
          setError("No vehicles found matching your criteria. Please try different search parameters.");
        }
      }

    } catch (err) {
      console.error("❌ Error fetching transports:", err);
      if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Please try again later.'}`);
      } else if (err.request) {
        setError("Network error: Please check your internet connection and try again.");
      } else {
        setError("Failed to fetch vehicles. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (offer) => {
    if (!offer) return 0;

    let basePrice = 0;

    if (filters.service_type === "specific_route") {
      basePrice = parseFloat(offer.fixed_fare) || 0;
    } else if (filters.service_type === "long_drive") {
      const duration = parseInt(filters.duration_value) || 1;
      
      if (filters.duration_type === "hourly" && offer.per_hour_rate) {
        basePrice = (parseFloat(offer.per_hour_rate) || 0) * duration;
      } else if (filters.duration_type === "daily" && offer.per_day_rate) {
        basePrice = (parseFloat(offer.per_day_rate) || 0) * duration;
      } else if (filters.duration_type === "weekly" && offer.weekly_rate) {
        basePrice = (parseFloat(offer.weekly_rate) || 0) * duration;
      } else {
        basePrice = (parseFloat(offer.per_hour_rate) || parseFloat(offer.fare) || 0) * duration;
      }
    }
    
    const nightCharge = parseFloat(offer.night_charge) || 0;
    const mountainSurcharge = parseFloat(offer.mountain_surcharge) || 0;
    
    const totalPrice = basePrice + nightCharge + mountainSurcharge;

    return totalPrice;
  };

  const getDurationLabel = () => {
    if (!filters.duration_type || !filters.duration_value) return "";
    
    const value = parseInt(filters.duration_value);
    const type = filters.duration_type;
    
    if (type === "hourly") return `${value} hour${value > 1 ? 's' : ''}`;
    if (type === "daily") return `${value} day${value > 1 ? 's' : ''}`;
    if (type === "weekly") return `${value} week${value > 1 ? 's' : ''}`;
    
    return "";
  };

  const getDisplayRate = (offer) => {
    if (!offer) return "N/A";

    if (filters.service_type === "specific_route") {
      return `Rs. ${offer.fixed_fare || offer.fare || "0"} (Fixed)`;
    } else if (filters.service_type === "long_drive") {
      switch (filters.duration_type) {
        case "hourly":
          return `Rs. ${offer.per_hour_rate || offer.fare || "0"} / hour`;
        case "daily":
          return `Rs. ${offer.per_day_rate || "0"} / day`;
        case "weekly":
          return `Rs. ${offer.weekly_rate || "0"} / week`;
        default:
          return `Rs. ${offer.per_hour_rate || offer.fare || "0"} / hour`;
      }
    }
    return "N/A";
  };

  const getChargesBreakdown = (offer) => {
    if (!offer) return null;

    const nightCharge = parseFloat(offer.night_charge) || 0;
    const mountainSurcharge = parseFloat(offer.mountain_surcharge) || 0;

    if (nightCharge === 0 && mountainSurcharge === 0) return null;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <h5 className="font-semibold text-gray-700 mb-2 text-sm md:text-base">Additional Charges</h5>
        <div className="space-y-1 text-sm">
          {nightCharge > 0 && (
            <div className="flex justify-between">
              <span className="flex items-center text-gray-600 text-xs md:text-sm">
                <Moon className="w-3 h-3 md:w-4 md:h-4 mr-1 text-blue-500" />
                Night Charge:
              </span>
              <span className="font-medium text-xs md:text-sm">Rs. {nightCharge.toLocaleString()}</span>
            </div>
          )}
          {mountainSurcharge > 0 && (
            <div className="flex justify-between">
              <span className="flex items-center text-gray-600 text-xs md:text-sm">
                <Mountain className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-500" />
                Mountain Surcharge:
              </span>
              <span className="font-medium text-xs md:text-sm">Rs. {mountainSurcharge.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

const handleProceedToBooking = (offer = null) => {
  const finalOffer = offer || selectedOffer;
  
  if (!passenger.name || !passenger.contact) {
    alert("برائے مہربانی مسافر کی تفصیلات مکمل کریں");
    return;
  }

  if (!finalOffer) {
    alert("Please select an offer to proceed with booking");
    return;
  }

  if (finalOffer.is_long_drive && (!filters.duration_type || !filters.duration_value)) {
    alert("Please set the duration for long drive booking");
    return;
  }

  const totalPrice = calculateTotalPrice(finalOffer);
  
  const finalBookingData = {
    // Basic IDs
    company_id: finalOffer.company_id || finalOffer.company,
    vehicle_id: finalOffer.vehicle_id || finalOffer.vehicle || finalOffer.id,
    driver_id: finalOffer.driver_id || finalOffer.driver,
    
    // Trip details
    from_location: filters.location_address || finalOffer.route_from || finalOffer.location_address,
    to_location: filters.to_location || finalOffer.route_to || finalOffer.to_location,
    arrival_date: filters.arrival_date,
    arrival_time: filters.arrival_time,
    service_type: filters.service_type,
    
    // Booking type
    is_full_vehicle: true,
    seats_booked: 0,
    
    // Payment details
    total_amount: totalPrice,
    calculatedFare: totalPrice,
    currency: "PKR",
    
    // Passenger details
    passenger_name: passenger.name,
    passenger_phone: passenger.contact,
    passenger_contact: passenger.contact,
    passenger_cnic: passenger.cnic,
    passenger_email: passenger.email,
    
    // Snapshot details
    company_name: finalOffer.company_name,
    driver_name: finalOffer.driver_name || finalOffer.driver_name_snapshot,
    driver_contact: finalOffer.driver_contact || finalOffer.driver_contact_snapshot,
    vehicle_type: finalOffer.vehicle_type,
    vehicle_number: finalOffer.vehicle_number,
    vehicle_image: finalOffer.vehicle_image,
    driver_image: finalOffer.driver_image,
    
    // Payment method
    payment_method: "CASH",
    
    // Additional fields for PaymentPage
    duration_type: filters.duration_type,
    duration_value: filters.duration_value,
    rate_per_km: finalOffer.rate_per_km,
    fixed_fare: finalOffer.fixed_fare,
    per_hour_rate: finalOffer.per_hour_rate,
    per_day_rate: finalOffer.per_day_rate,
    weekly_rate: finalOffer.weekly_rate,
    night_charge: finalOffer.night_charge || 0,
    mountain_surcharge: finalOffer.mountain_surcharge || 0,
    
    // CRITICAL: Payment-related data that's missing
    payment_type: finalOffer.payment_type || "BOTH",
    easypaisa_name: finalOffer.easypaisa_name || "",
    easypaisa_number: finalOffer.easypaisa_number || "",
    jazzcash_name: finalOffer.jazzcash_name || "",
    jazzcash_number: finalOffer.jazzcash_number || "",
    bank_name: finalOffer.bank_name || "",
    bank_account_title: finalOffer.bank_account_title || "",
    bank_account_number: finalOffer.bank_account_number || "",
    bank_iban: finalOffer.bank_iban || "",
    
    // Generate a temporary ID
    booking_id: `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  console.log("Final booking data with payment info:", finalBookingData);
  
  // Store in localStorage for PaymentPage
  localStorage.setItem("booking_payload", JSON.stringify(finalBookingData));
  localStorage.setItem("paymentData", JSON.stringify(finalBookingData));
  
  // Call the onProceedToPayment prop if it exists (from wrapper)
  if (props.onProceedToPayment) {
    props.onProceedToPayment(finalBookingData);
  } else {
    // Fallback to navigation
    navigate("/payment", { 
      state: { 
        fromSearch: true, 
        bookingData: finalBookingData,
        vehicleDetails: vehicleDataFromCard,
        fromCard: isDirectBooking
      } 
    });
  }
};

  const handleOfferSelect = (offer) => {
    setSelectedOffer(offer);
  };

const handleCardBookNow = (vehicleData) => {
  console.log("VehicleCard book now clicked:", vehicleData);
  
  // Calculate total price for this vehicle
  const totalPrice = calculateTotalPrice(vehicleData);
  
  // Prepare booking data with ALL payment information
  const bookingData = {
    // Basic IDs
    company_id: vehicleData.company_id || vehicleData.company,
    vehicle_id: vehicleData.vehicle_id || vehicleData.vehicle || vehicleData.id,
    driver_id: vehicleData.driver_id || vehicleData.driver,
    
    // Trip details
    from_location: filters.location_address || 
                   vehicleData.route_from || 
                   vehicleData.location_address,
    to_location: filters.to_location || 
                 vehicleData.route_to || 
                 vehicleData.to_location,
    arrival_date: filters.arrival_date,
    arrival_time: filters.arrival_time,
    service_type: filters.service_type,
    
    // Booking type
    is_full_vehicle: true,
    seats_booked: 0,
    
    // Payment details
    total_amount: totalPrice,
    calculatedFare: totalPrice,
    currency: "PKR",
    
    // Passenger details
    passenger_name: passenger.name,
    passenger_phone: passenger.contact,
    passenger_contact: passenger.contact,
    passenger_cnic: passenger.cnic,
    passenger_email: passenger.email,
    
    // Snapshot details
    company_name: vehicleData.company_name,
    driver_name: vehicleData.driver_name || vehicleData.driver_name_snapshot,
    driver_contact: vehicleData.driver_contact || vehicleData.driver_contact_snapshot,
    vehicle_type: vehicleData.vehicle_type,
    vehicle_number: vehicleData.vehicle_number,
    vehicle_image: vehicleData.vehicle_image,
    driver_image: vehicleData.driver_image,
    
    // Payment method
    payment_method: "CASH",
    
    // Additional fields for PaymentPage
    duration_type: filters.duration_type,
    duration_value: filters.duration_value,
    rate_per_km: vehicleData.rate_per_km,
    fixed_fare: vehicleData.fixed_fare,
    per_hour_rate: vehicleData.per_hour_rate,
    per_day_rate: vehicleData.per_day_rate,
    weekly_rate: vehicleData.weekly_rate,
    night_charge: vehicleData.night_charge || 0,
    mountain_surcharge: vehicleData.mountain_surcharge || 0,
    
    // CRITICAL: Payment-related data
    payment_type: vehicleData.payment_type || "BOTH",
    easypaisa_name: vehicleData.easypaisa_name || "",
    easypaisa_number: vehicleData.easypaisa_number || "",
    jazzcash_name: vehicleData.jazzcash_name || "",
    jazzcash_number: vehicleData.jazzcash_number || "",
    bank_name: vehicleData.bank_name || "",
    bank_account_title: vehicleData.bank_account_title || "",
    bank_account_number: vehicleData.bank_account_number || "",
    bank_iban: vehicleData.bank_iban || "",
    
    // Additional fields from complete_offer
    offer_name: vehicleData.offer_name,
    offer_type: vehicleData.offer_type || "whole_hire",
    
    // Generate a temporary ID
    booking_id: `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  console.log("🎯 Complete Booking Data with Payment Info:", {
    hasPaymentType: !!bookingData.payment_type,
    paymentType: bookingData.payment_type,
    easypaisaNumber: bookingData.easypaisa_number,
    jazzcashNumber: bookingData.jazzcash_number,
    bankName: bookingData.bank_name,
    allKeys: Object.keys(bookingData)
  });
  
  // Store in localStorage as backup
  localStorage.setItem("selectedVehicle", JSON.stringify(vehicleData));
  localStorage.setItem("booking_payload", JSON.stringify(bookingData));
  
  // Call the wrapper's onProceedToPayment function
  if (props.onProceedToPayment) {
    props.onProceedToPayment(bookingData);
  } else {
    // Fallback navigation
    navigate("/payment", { 
      state: { 
        bookingData: bookingData,
        fromCard: true 
      } 
    });
  }
};
  const { currentDate, currentTime } = getCurrentDateTime();

  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (sortOrder === "low-high") {
      const priceA = calculateTotalPrice(a);
      const priceB = calculateTotalPrice(b);
      return priceA - priceB;
    }
    if (sortOrder === "high-low") {
      const priceA = calculateTotalPrice(a);
      const priceB = calculateTotalPrice(b);
      return priceB - priceA;
    }
    return 0;
  });
  
  const filteredVehicles = sortedVehicles.filter(v => {
    if (!filters.vehicle_type) return true;
    const vehicleTypeToMatch = v.vehicle_type_snapshot || v.vehicle_type || "";
    return vehicleTypeToMatch.toLowerCase().includes(filters.vehicle_type.toLowerCase());
  });

  // Debug helper
  const debugCurrentState = () => {
    console.log("=== VehicleSearch Debug ===");
    console.log("Props:", { vehicleDataFromCard, isDirectBooking });
    console.log("Selected Offer:", selectedOffer);
    console.log("Filters:", filters);
    console.log("Passenger:", passenger);
    console.log("LocalStorage selectedVehicle:", JSON.parse(localStorage.getItem("selectedVehicle") || "null"));
    console.log("=== End Debug ===");
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 space-y-6 md:space-y-8">
      
      {/* Debug button (remove in production) */}
      <button 
        onClick={debugCurrentState}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-lg text-xs z-50 opacity-50 hover:opacity-100 hidden md:block"
        title="Debug State"
      >
        Debug
      </button>
      
      {/* Direct Booking Confirmation - Mobile Responsive */}
      {isDirectBooking && vehicleDataFromCard && selectedOffer && (
        <div className="mb-6 md:mb-8 border-2 border-green-400 p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
          <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-4 flex items-center">
            <CarFront className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" /> 
            <span className="text-base md:text-2xl">Selected Vehicle Offer</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-2 md:p-3 rounded-lg border border-green-200">
              <p className="font-semibold text-green-700 text-sm md:text-base">Vehicle</p>
              <p className="text-sm md:text-lg truncate">{selectedOffer.company_name}</p>
              <p className="text-xs md:text-sm text-gray-600 truncate">No: {selectedOffer.vehicle_number}</p>
            </div>
            <div className="bg-white p-2 md:p-3 rounded-lg border border-green-200">
              <p className="font-semibold text-green-700 text-sm md:text-base">Service Type</p>
              <p className="text-sm md:text-lg capitalize truncate">{filters.service_type?.replace('_', ' ')}</p>
              {filters.service_type === "long_drive" && filters.duration_type && (
                <p className="text-xs md:text-sm text-gray-600 truncate">{getDurationLabel()}</p>
              )}
            </div>
            <div className="bg-white p-2 md:p-3 rounded-lg border border-green-200">
              <p className="font-semibold text-green-700 text-sm md:text-base">Current Rate</p>
              <p className="text-sm md:text-lg text-red-600 font-bold truncate">
                {getDisplayRate(selectedOffer)}
              </p>
            </div>
            <div className="bg-white p-2 md:p-3 rounded-lg border border-green-200">
              <p className="font-semibold text-green-700 text-sm md:text-base">Total Price</p>
              <p className="text-sm md:text-lg text-green-600 font-bold truncate">
                Rs. {calculateTotalPrice(selectedOffer).toLocaleString()}
              </p>
            </div>
          </div>
          
          {getChargesBreakdown(selectedOffer)}
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleProceedToBooking()}
              className="w-full md:w-auto px-4 py-2 md:px-6 md:py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-sm md:text-base"
            >
              Proceed to Payment →
            </button>
          </div>
        </div>
      )}

      {/* Passenger Details - Mobile Responsive */}
      <div className="mb-6 md:mb-8 border border-indigo-100 p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg">
        <h3 className="text-xl md:text-2xl font-bold text-indigo-700 mb-4 md:mb-6 border-b border-indigo-200 pb-3 flex items-center">
          <User className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" /> 
          <span className="text-base md:text-2xl">Passenger Details</span>
          <span className="text-xs md:text-sm font-normal text-gray-500 ml-2 md:ml-3 hidden sm:inline">(Please verify your details)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <InputGroup 
            label="Full Name" 
            icon={User} 
            name="name" 
            type="text" 
            value={passenger.name} 
            onChange={(e) => setPassenger({ ...passenger, name: e.target.value })} 
            placeholder="Enter full name"
          />
          <InputGroup 
            label="Contact Number" 
            icon={Phone} 
            name="contact" 
            type="text" 
            value={passenger.contact} 
            onChange={(e) => setPassenger({ ...passenger, contact: e.target.value })} 
            placeholder="03XX-XXXXXXX"
          />
          <InputGroup 
            label="Email Address" 
            icon={Mail} 
            name="email" 
            type="email" 
            value={passenger.email} 
            onChange={(e) => setPassenger({ ...passenger, email: e.target.value })} 
            placeholder="email@example.com"
          />
          <InputGroup 
            label="CNIC/Passport" 
            icon={CreditCard} 
            name="cnic" 
            type="text" 
            value={passenger.cnic} 
            onChange={(e) => setPassenger({ ...passenger, cnic: e.target.value })} 
            placeholder="XXXXX-XXXXXXX-X"
          />
        </div>
      </div>

      {/* Main Search Form - Mobile Responsive */}
      <div className="p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-100 mb-6 md:mb-8">
        {isDirectBooking && vehicleDataFromCard ? (
          // Direct Booking Mode - Show read-only details
          <>
            <h2 className="text-xl md:text-3xl font-bold text-teal-700 mb-4 md:mb-6 border-b border-teal-200 pb-3 md:pb-4 flex items-center">
              <Route className="w-5 h-5 md:w-7 md:h-7 mr-2 md:mr-3" /> 
              <span className="text-base md:text-3xl">Confirm Booking Details</span>
            </h2>

            <div className="space-y-4 md:space-y-6">
              {/* Service Specific Details */}
              {filters.service_type === "specific_route" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg md:rounded-xl">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                      <MapPin className="w-4 h-4 mr-1 text-indigo-500" /> From (Pickup)
                    </label>
                    <input
                      type="text"
                      value={filters.location_address}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                      <MapPin className="w-4 h-4 mr-1 text-indigo-500" /> To (Destination)
                    </label>
                    <input
                      type="text"
                      value={filters.to_location}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm md:text-base"
                    />
                  </div>
                </div>
              ) : filters.service_type === "long_drive" ? (
                <div className="space-y-4 md:space-y-6 p-4 md:p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg md:rounded-xl">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                      <MapPin className="w-4 h-4 mr-1 text-indigo-500" /> Pickup Location
                    </label>
                    <input
                      type="text"
                      value={filters.pickup_location}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm md:text-base"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                        <Clock4 className="w-4 h-4 mr-1 text-indigo-500" /> Duration Type
                      </label>
                      <select name="duration_type" value={filters.duration_type} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm md:text-base">
                        <option value=""></option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                      <InputGroup 
                          label={filters.duration_type ? `${filters.duration_type.charAt(0).toLocaleUpperCase() + filters.duration_type.slice(1)} Duration` : "Duration"}
                          icon={CalendarDays} 
                          name="duration_value" 
                          type="number" 
                          value={filters.duration_value} 
                          onChange={handleChange} 
                          placeholder={`Enter ${filters.duration_type === "hourly" ? "Hours" : filters.duration_type === "daily" ? "Days" : "Weeks"}`}
                          min="1"
                      />
                    
                  </div>
                </div>
              ) : null}

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <InputGroup 
                  label="Start Date" 
                  icon={Calendar} 
                  name="arrival_date" 
                  type="date" 
                  value={filters.arrival_date} 
                  onChange={handleChange} 
                  min={currentDate}
                />
                <InputGroup 
                  label="Start Time" 
                  icon={Clock} 
                  name="arrival_time" 
                  type="time" 
                  value={filters.arrival_time} 
                  onChange={handleChange} 
                  min={filters.arrival_date === currentDate ? currentTime : undefined}
                />
              </div>

              {/* Price Summary */}
              {selectedOffer && (
                <div className="p-4 md:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg md:rounded-xl">
                  <h4 className="text-base md:text-lg font-bold text-amber-800 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Booking Summary
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white/50 p-2 md:p-3 rounded-lg">
                      <p className="font-semibold text-amber-800 text-xs md:text-sm">Service Type:</p>
                      <p className="capitalize text-sm md:text-base">{filters.service_type?.replace('_', ' ')}</p>
                    </div>
                    {filters.service_type === "long_drive" && (
                      <div className="bg-white/50 p-2 md:p-3 rounded-lg">
                        <p className="font-semibold text-amber-800 text-xs md:text-sm">Duration:</p>
                        <p className="text-sm md:text-base">{getDurationLabel() || "Not set"}</p>
                      </div>
                    )}
                    <div className="bg-white/50 p-2 md:p-3 rounded-lg">
                      <p className="font-semibold text-amber-800 text-xs md:text-sm">Current Rate:</p>
                      <p className="text-sm md:text-base font-bold text-blue-600">{getDisplayRate(selectedOffer)}</p>
                    </div>
                    <div className="bg-white/50 p-2 md:p-3 rounded-lg">
                      <p className="font-semibold text-amber-800 text-xs md:text-sm">Total Amount:</p>
                      <p className="text-lg md:text-2xl font-bold text-green-600">
                        Rs. {calculateTotalPrice(selectedOffer).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {getChargesBreakdown(selectedOffer)}
                </div>
              )}

              <div className="flex justify-center md:justify-end mt-6 md:mt-8">
                <button 
                  onClick={() => handleProceedToBooking()} 
                  disabled={!selectedOffer || (filters.service_type === "long_drive" && (!filters.duration_type || !filters.duration_value))}
                  className={`w-full md:w-auto px-6 py-3 md:px-10 md:py-4 rounded-lg md:rounded-full font-bold flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 shadow-lg transform hover:scale-105 text-sm md:text-base ${
                    !selectedOffer || (filters.service_type === "long_drive" && (!filters.duration_type || !filters.duration_value))
                      ? "bg-gray-400 cursor-not-allowed text-gray-200"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                  }`}
                >
                  Proceed to Booking <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Default Search Mode
          <>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 md:mb-6 border-b border-teal-200 pb-3 md:pb-4 gap-3 md:gap-4">
              <h2 className="text-xl md:text-3xl font-bold text-teal-700 flex items-center">
                <Search className="w-5 h-5 md:w-7 md:h-7 mr-2 md:mr-3" /> 
                <span className="text-base md:text-3xl">Find Your Perfect Ride</span>
              </h2>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-teal-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                <Tag className="w-3 h-3 md:w-4 md:h-4" />
                <span>Choose your service type and requirements</span>
              </div>
            </div>
            
            {/* Service Type Selection */}
            <div className="mb-6 md:mb-8">
              <label className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 block">Select Service Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {SERVICE_TYPES.map((service) => (
                  <ServiceTypeCard
                    key={service.value}
                    type={service.value}
                    label={service.label}
                    description={service.description}
                    isSelected={filters.service_type === service.value}
                    onClick={handleServiceTypeSelect}
                  />
                ))}
              </div>
            </div>

            {/* Service Specific Forms */}
            {filters.service_type && (
              <div className="space-y-4 md:space-y-6">
                {/* Specific Route Form */}
                {filters.service_type === "specific_route" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg md:rounded-xl shadow-inner">
                    <InputGroup
                      label="From (Pickup Location) *"
                      icon={MapPin}
                      name="location_address"
                      type="text"
                      options={specificRouteFromOptions}
                      value={filters.location_address}
                      onChange={handleChange}
                    />
                    <InputGroup
                      label="To (Destination) (Optional Filter)"
                      icon={MapPin}
                      name="to_location"
                      type="text"
                      options={specificRouteToOptions}
                      value={filters.to_location}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* Long Drive Form */}
                {filters.service_type === "long_drive" && (
                  <div className="space-y-4 md:space-y-6 p-4 md:p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg md:rounded-xl shadow-inner">
                    <InputGroup 
                      label="Pickup Location *" 
                      icon={MapPin} 
                      name="pickup_location" 
                      type="text" 
                      options={longDriveLocations}
                      value={filters.pickup_location} 
                      onChange={handleChange} 
                    />
                    
                    <div>
                      <label className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 block">Select Rental Duration *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                        {DURATION_TYPES.map((duration) => (
                          <DurationTypeCard
                            key={duration.value}
                            type={duration.value}
                            label={duration.label}
                            description={duration.description}
                            isSelected={filters.duration_type === duration.value}
                            onClick={handleDurationTypeSelect}
                          />
                        ))}
                      </div>
                    </div>

                    {filters.duration_type && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <InputGroup 
                          label={`Number of ${filters.duration_type === "hourly" ? "Hours" : filters.duration_type === "daily" ? "Days" : "Weeks"} *`} 
                          icon={CalendarDays} 
                          name="duration_value" 
                          type="number" 
                          value={filters.duration_value} 
                          onChange={handleChange} 
                          placeholder={`Enter ${filters.duration_type === "hourly" ? "hours" : filters.duration_type === "daily" ? "days" : "weeks"}`}
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Date and Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <InputGroup 
                    label="Start Date *" 
                    icon={Calendar} 
                    name="arrival_date" 
                    type="date" 
                    value={filters.arrival_date} 
                    onChange={handleChange} 
                    min={currentDate}
                  />
                  <InputGroup 
                    label="Start Time *" 
                    icon={Clock} 
                    name="arrival_time" 
                    type="time" 
                    value={filters.arrival_time} 
                    onChange={handleChange} 
                    min={filters.arrival_date === currentDate ? currentTime : undefined}
                  />
                </div>

                {error && (
                  <div className="p-3 md:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm md:text-base">
                    {error}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleSearch}
                    disabled={loading || 
                      (filters.service_type === "specific_route" && (!filters.location_address && !filters.to_location)) ||
                      (filters.service_type === "long_drive" && (!filters.duration_type || !filters.duration_value || !filters.pickup_location))
                    }
                    className={`w-full md:w-auto px-6 py-3 md:px-8 md:py-3 rounded-lg md:rounded-full font-bold flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 transform hover:scale-105 text-sm md:text-base ${
                      loading || 
                      (filters.service_type === "specific_route" && !filters.location_address) ||
                      (filters.service_type === "long_drive" && (!filters.duration_type || !filters.duration_value || !filters.pickup_location))
                        ? "bg-gray-400 cursor-not-allowed text-gray-200"
                        : "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> 
                        <span className="text-xs md:text-base">Searching Vehicles...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 md:w-5 md:h-5" /> 
                        <span className="text-xs md:text-base">Search Available Vehicles</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Sidebar AND Results - Mobile Responsive */}
      {!isDirectBooking && (vehicles.length > 0 || loading) && (
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 w-full mt-6 md:mt-8">
          
          {/* Filters Sidebar - Mobile Responsive */}
          {/* Filters Sidebar - Mobile Responsive */}
{vehicles.length > 0 && (
  <div className="lg:w-1/4">
    {/* Mobile Filter Toggle Button */}
    <div className="lg:hidden mb-4">
      <button
        onClick={() => setIsFiltersOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-5 h-5" /> Filters & Sorting
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {filteredVehicles.length} results
          </span>
        </span>
        <span>▼</span>
      </button>
    </div>

    {/* Filters Panel - Desktop */}
    <div className="hidden lg:block p-6 bg-white rounded-2xl shadow-xl border border-gray-200 h-fit sticky top-6">
      <h3 className="text-xl font-bold text-indigo-700 mb-6 flex items-center border-b border-indigo-200 pb-3">
        <Filter className="w-5 h-5 mr-2" /> Filters & Sorting
      </h3>
      
      {/* Price Sort */}
                <div className="mb-6 md:mb-8">
                  <label className="text-sm md:text-md font-semibold text-gray-800 block mb-2 md:mb-3">Sort by Price</label>
                  <div className="flex items-center gap-2 md:gap-3">
                    <ArrowUpDown className="w-4 h-4 md:w-5 md:h-5 text-teal-600" />
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 md:px-4 md:py-3 focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all duration-200 bg-white text-sm md:text-base"
                    >
                      <option value="default">Default Order</option>
                      <option value="low-high">Price: Low to High</option>
                      <option value="high-low">Price: High to Low</option>
                    </select>
                  </div>
                </div>
                {/* Vehicle Type Filter */}
                <div className="mb-4 md:mb-6">
                  <h4 className="text-sm md:text-md font-semibold text-gray-800 block mb-3 md:mb-4">Vehicle Type</h4>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {VEHICLE_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          handleFilterChange(type);
                          // On mobile, close filters after selection
                          if (window.innerWidth < 1024) {
                            setTimeout(() => setIsFiltersOpen(false), 300);
                          }
                        }}
                        className={`px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm rounded-lg md:rounded-xl border transition-all duration-200 font-medium ${
                          filters.vehicle_type === type 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-700 shadow-lg transform scale-105' 
                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-indigo-300 hover:scale-[1.02]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
    </div>

    {/* Mobile Filters Modal */}
    {isFiltersOpen && (
      <>
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsFiltersOpen(false)}></div>
        <div className="fixed inset-y-0 right-0 w-5/6 max-w-sm bg-white z-50 overflow-y-auto lg:hidden transform transition-transform duration-300">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b">
              <h3 className="text-xl font-bold text-indigo-700 flex items-center">
                <Filter className="w-5 h-5 mr-2" /> Filters & Sorting
              </h3>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition"
              >
                ✕
              </button>
            </div>
            
            {/* Filter content here */}
            <div className="mb-8">
              <label className="text-md font-semibold text-gray-800 block mb-3">Sort by Price</label>
              <div className="flex items-center gap-3">
                <ArrowUpDown className="w-5 h-5 text-teal-600" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all duration-200 bg-white"
                >
                  <option value="default">Default Order</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            {/* Vehicle Type Filter */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 block mb-4">Vehicle Type</h4>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      handleFilterChange(type);
                      setIsFiltersOpen(false);
                    }}
                    className={`px-4 py-3 text-sm rounded-xl border transition-all duration-200 font-medium ${
                      filters.vehicle_type === type 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-700 shadow-lg' 
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-indigo-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
)}
          
          {/* Search Results */}
          <div className={`${vehicles.length === 0 ? 'w-full' : 'lg:w-3/4'} space-y-4 md:space-y-6`}>
            {loading ? (
              <div className="text-center py-12 md:py-16 bg-white rounded-xl md:rounded-2xl shadow-md border border-gray-100">
                <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-teal-600 animate-spin mx-auto mb-3 md:mb-4" />
                <p className="text-gray-600 text-base md:text-lg">Searching for available vehicles...</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Please wait while we find the best options for you</p>
              </div>
            ) : filteredVehicles.length > 0 ? (
              <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                    Available Offers <span className="text-indigo-600">({filteredVehicles.length})</span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-gray-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                    <Tag className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Click on Book Now to proceed directly</span>
                  </div>
                </div>
        
                {/* Vehicle Cards */}
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id || vehicle.vehicle_id}>
                    <VehicleCard 
                      vehicle={vehicle} 
                      toLocation={filters.service_type === "specific_route" ? filters.to_location : undefined}
                      passenger={passenger}
                      durationType={filters.duration_type}
                      durationValue={filters.duration_value}
                      serviceType={filters.service_type}
                      calculateTotalPrice={calculateTotalPrice}
                      getDisplayRate={getDisplayRate}
                      getChargesBreakdown={getChargesBreakdown}
                      onBookNow={handleCardBookNow}
                    />
                  </div>
                ))}
              </div>
            ) : (
              !error && vehicles.length > 0 && (
                <div className="text-center py-8 md:py-12 text-gray-600 bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
                  <CarFront className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-3 md:mb-4" />
                  <p className="text-base md:text-lg font-medium">No vehicles match your filters</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Try adjusting your filters to see more results</p>
                </div>
              )
            )}
            
            {/* No Results Message */}
            {!error && vehicles.length === 0 && !loading && (
              <div className="text-center py-8 md:py-12 text-gray-600 bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
                <Route className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-3 md:mb-4" />
                <p className="text-base md:text-lg font-medium">No vehicles found for your search criteria</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Try adjusting your search parameters or check back later</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSearch;