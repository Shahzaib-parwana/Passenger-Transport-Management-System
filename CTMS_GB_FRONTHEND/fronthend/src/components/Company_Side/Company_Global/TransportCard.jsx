import React, { useState, useEffect } from "react";
import { 
  Bus, User, MapPin, DollarSign, Clock, Route, Truck, 
  Calendar, Zap, MapPinned, Package, Eye, Edit, Trash2, 
  ToggleLeft, ToggleRight, Loader, ChevronRight, Phone,
  CheckCircle, XCircle, AlertCircle, Users
} from "lucide-react";

// Delete Confirmation Modal component
const DeleteConfirmationModal = ({ onConfirm, onCancel, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all">
        <h3 className="text-xl font-bold text-red-700 mb-3">Delete Confirmation</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this offer?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const TransportCard = ({
  transport,
  t,
  setInfoVehicle,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
  offerType
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // ✅ BOOKED SEATS API STATES
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [seatError, setSeatError] = useState(null);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [totalSeats, setTotalSeats] = useState(0);

  const data = transport || t;
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // ✅ **BOOKED SEATS API FETCH - WORKING WITHOUT LOGIN**
  useEffect(() => {
    if (!data || offerType === 'hire') return;

    const fetchBookedSeats = async () => {
      setIsLoadingSeats(true);
      setSeatError(null);
      
      // Try multiple possible field names for vehicle ID
      const vehicleId = data.vehicle_id || data.vehicle || data.id || data.transport_id;
      const arrivalDate = data.arrival_date || data.departure_date;
      const arrivalTime = data.arrival_time || data.departure_time;

      if (!vehicleId || !arrivalDate || !arrivalTime) {
        console.log("Missing required parameters for seat fetch");
        setIsLoadingSeats(false);
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
            const totalSeatsValue = data.vehicle_seats || 40;
            const ownerReservedSeats = data?.reserve_seats || [];
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
      const totalSeatsValue = data.vehicle_seats || 40;
      const ownerReservedSeats = data?.reserve_seats || [];
      const reservedSeatsCount = Array.isArray(ownerReservedSeats) ? ownerReservedSeats.length : 0;
      
      const calculatedAvailable = totalSeatsValue - reservedSeatsCount;
      setAvailableSeats(calculatedAvailable >= 0 ? calculatedAvailable : 0);
      setTotalSeats(totalSeatsValue);
    };

    fetchBookedSeats();
  }, [data, offerType]);

  if (!data) {
    return (
      <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-sm">
        <div className="text-center text-gray-500 py-4">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Transport data load ho raha hai...</p>
        </div>
      </div>
    );
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(); 
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false); 
  };

  const isHireOffer = offerType === 'hire' || data.offer_type === "whole_hire";

  // ✅ **UPDATED: Available seats calculation using API data**
  const calculateAvailableSeats = () => {
    if (isHireOffer || !data.vehicle_seats) return "N/A";
    
    return availableSeats;
  };

  const currentAvailableSeats = calculateAvailableSeats();

  // ✅ **Get booked seats count from API response**
  const getBookedSeatsCount = () => {
    if (isHireOffer) return 0;
    return bookedSeatNumbers.length;
  };

  // Whole Hire Options display helper
  const getHireOptions = () => {
    const options = [];
    if (data.is_long_drive) options.push("Long Drive");
    if (data.is_specific_route) options.push("Specific Route");
    return options.length > 0 ? options.join(" + ") : "Flexible Service";
  };

  // Pricing display based on offer type
  const getPricingDisplay = () => {
    if (isHireOffer) {
      if (data.fixed_fare) {
        return `Fixed: Rs. ${data.fixed_fare}`;
      } else if (data.per_day_rate) {
        return `Daily: Rs. ${data.per_day_rate}`;
      } else if (data.rate_per_km) {
        return `Rate: Rs. ${data.rate_per_km}/km`;
      }
      return "Custom Pricing";
    } else {
      return `Rs. ${data.price_per_seat || "N/A"}/seat`;
    }
  };

  // Status badge with better styling
  const getStatusBadge = () => {
    const isActive = data.is_active !== false;
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
      }`}>
        {isActive ? (
          <>
            <CheckCircle size={12} className="mr-1.5" />
            Active
          </>
        ) : (
          <>
            <XCircle size={12} className="mr-1.5" />
            Inactive
          </>
        )}
      </div>
    );
  };

  // ✅ **UPDATED: Seats badge using API data**
  const getSeatsBadge = () => {
    if (isHireOffer) return null;
    
    const seatsLeft = currentAvailableSeats;
    let colorClass = "";
    
    if (seatsLeft === 0) {
      colorClass = "bg-red-100 text-red-800 border border-red-200";
    } else if (seatsLeft <= 5) {
      colorClass = "bg-amber-100 text-amber-800 border border-amber-200";
    } else {
      colorClass = "bg-green-100 text-green-800 border border-green-200";
    }
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        <User size={12} className="mr-1.5" />
        {isLoadingSeats ? "..." : seatsLeft} / {data.vehicle_seats} Seats
      </div>
    );
  };

  // Mobile View Layout
  if (isMobileView) {
    return (
      <div className={`bg-white rounded-2xl border-2 shadow-lg transition-all hover:shadow-xl overflow-hidden ${
        data.is_active === false ? 'opacity-80 border-gray-200' : 
        isHireOffer ? 'border-teal-200' : 'border-blue-200'
      }`}>
        
        {/* Mobile Header with Images */}
        <div className="p-4 border-b border-gray-100">
          {/* Route Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-1 flex items-center ${
                isHireOffer ? 'text-teal-700' : 'text-blue-700'
              }`}>
                {isHireOffer ? (
                  data.is_specific_route ? (
                    <>
                      <Route size={18} className="mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {data.from_location || data.route_from} → {data.to_location || data.route_to}
                      </span>
                    </>
                  ) : (
                    <>
                      <Truck size={18} className="mr-2 flex-shrink-0" />
                      <span>Vehicle Hire Service</span>
                    </>
                  )
                ) : (
                  <>
                    <Bus size={18} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{data.route_display || "Seat Booking"}</span>
                  </>
                )}
              </h3>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <span className="font-medium mr-2">{data.vehicle_number || "N/A"}</span>
                <span className="text-gray-400">•</span>
                <span className="ml-2">{data.vehicle_type || "N/A"}</span>
              </div>
            </div>
            
            {/* Status Toggle */}
            {onToggleStatus && (
              <button
                onClick={onToggleStatus}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                ) : data.is_active !== false ? (
                  <ToggleRight className="w-6 h-6 text-green-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </button>
            )}
          </div>
          
          {/* Images Row */}
          <div className="flex gap-3 mb-3">
            {/* Vehicle Image */}
            <div className="flex-1">
              <div className="relative">
                {data.vehicle_image ? (
                  <img
                    src={data.vehicle_image}
                    alt="Vehicle"
                    className="w-full h-32 object-cover rounded-xl border shadow-sm"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = "https://placehold.co/300x128/2563EB/FFFFFF?text=Vehicle"; 
                    }}
                  />
                ) : (
                  <div className={`w-full h-32 flex items-center justify-center rounded-xl border shadow-sm ${
                    isHireOffer ? 'bg-teal-50' : 'bg-blue-50'
                  }`}>
                    <Bus className={`w-10 h-10 ${isHireOffer ? 'text-teal-400' : 'text-blue-400'}`} />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Vehicle
                </div>
              </div>
            </div>
            
            {/* Driver Image */}
            <div className="flex-1">
              <div className="relative">
                {data.driver_image ? (
                  <img
                    src={data.driver_image}
                    alt="Driver"
                    className="w-full h-32 object-cover rounded-xl border shadow-sm"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = "https://placehold.co/300x128/4B5563/FFFFFF?text=Driver"; 
                    }}
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center rounded-xl border shadow-sm bg-gray-50">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Driver
                </div>
              </div>
            </div>
          </div>
          
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-3">
            {getStatusBadge()}
            {!isHireOffer && getSeatsBadge()}
          </div>
        </div>
        
        {/* Mobile Content Details */}
        <div className="p-4">
          {/* Driver Info */}
          <div className="flex items-center text-gray-700 text-sm mb-3">
            <User className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
            <span className="font-medium">{data.driver_name || "N/A"}</span>
            {data.driver_contact && (
              <a 
                href={`tel:${data.driver_contact}`}
                className="ml-auto flex items-center text-blue-600 text-xs"
              >
                <Phone size={12} className="mr-1" />
                Call
              </a>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-center font-semibold text-sm mb-3">
            <DollarSign className={`w-4 h-4 mr-2 flex-shrink-0 ${
              isHireOffer ? 'text-teal-600' : 'text-blue-600'
            }`} />
            <span className={isHireOffer ? 'text-teal-700' : 'text-blue-700'}>
              {getPricingDisplay()}
            </span>
          </div>

          {/* Service Specific Details */}
          {isHireOffer ? (
            <div className="space-y-2">
              {/* Service Types */}
              <div className="flex items-start text-sm">
                <Package className="w-4 h-4 mr-2 text-teal-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Services:</strong> {getHireOptions()}
                </span>
              </div>

              {/* Location */}
              {data.location_address && (
                <div className="flex items-start text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    {data.location_address}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Schedule */}
              {(data.arrival_date || data.arrival_time) && (
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    {data.arrival_date || "Flexible"} 
                    {data.arrival_time && (
                      <>
                        <span className="mx-1">•</span>
                        <Clock size={12} className="inline mr-1" />
                        {data.arrival_time.substring(0, 5)}
                      </>
                    )}
                  </span>
                </div>
              )}
              
              {/* ✅ UPDATED: Seat Details with API data */}
              <div className="bg-gray-50 p-2 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Seat Status:</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded border">
                    <div className="font-bold text-gray-900">{data.vehicle_seats || 0}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-bold text-red-600">
                      {Array.isArray(data.reserve_seats) ? data.reserve_seats.length : 0}
                    </div>
                    <div className="text-xs text-gray-600">Reserved</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-bold text-blue-600">
                      {isLoadingSeats ? "..." : getBookedSeatsCount()}
                    </div>
                    <div className="text-xs text-gray-600">Booked</div>
                  </div>
                </div>
                {seatError && (
                  <div className="text-xs text-red-500 mt-1 text-center">
                    {seatError}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Mobile Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setInfoVehicle(data)}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 shadow-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Details</span>
                <ChevronRight size={14} className="ml-1" />
              </button>
              
              <button
                onClick={onEdit}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 rounded-lg text-sm font-medium hover:from-yellow-500 hover:to-yellow-600 transition disabled:opacity-50 shadow-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
          
          {/* Created Date */}
          {data.created_at && (
            <div className="mt-3 text-center text-xs text-gray-500">
              Created: {new Date(data.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          )}
        </div>

        {/* Confirmation Modal Render */}
        {showDeleteConfirm && (
          <DeleteConfirmationModal 
            onConfirm={handleConfirmDelete} 
            onCancel={handleCancelDelete} 
            isLoading={isLoading}
          />
        )}
      </div>
    );
  }

  // Desktop View Layout
  return (
    <div className={`bg-white rounded-2xl p-5 border-2 shadow-lg flex flex-col transition-all hover:shadow-xl ${
      data.is_active === false ? 'opacity-80 border-gray-200' : 
      isHireOffer ? 'border-teal-200' : 'border-blue-200'
    }`}>
      
      {/* Header with Status and Toggle */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          {/* Route/Offer Heading */}
          <h3 className={`text-xl font-bold mb-2 flex items-center ${
            isHireOffer ? 'text-teal-700' : 'text-blue-700'
          }`}>
            {isHireOffer ? (
              data.is_specific_route ? (
                <>
                  <Route className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>
                    {data.from_location || data.route_from} → {data.to_location || data.route_to}
                  </span>
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>Vehicle Hire Service</span>
                </>
              )
            ) : (
              <>
                <Bus className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{data.route_display || "Seat Booking"}</span>
              </>
            )}
          </h3>
          
          {/* Status and Vehicle Info */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <span className="font-medium">{data.vehicle_number || "N/A"}</span>
              <span className="text-gray-400">•</span>
              <span>{data.vehicle_type || "N/A"}</span>
              {!isHireOffer && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="font-semibold">{data.vehicle_seats || "N/A"} seats</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        {onToggleStatus && (
          <button
            onClick={onToggleStatus}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              data.is_active !== false
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : data.is_active !== false ? (
              <>
                <ToggleRight className="w-4 h-4" />
                <span>Active</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4" />
                <span>Inactive</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex justify-between items-start mb-4 gap-6">
        
        {/* Left: Transport Details */}
        <div className="flex-1 space-y-3">
          
          {/* Driver Info */}
          <div className="flex items-center text-gray-700">
            <User className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
            <span className="font-medium">{data.driver_name || "N/A"}</span>
            {data.driver_contact && (
              <a 
                href={`tel:${data.driver_contact}`}
                className="ml-auto flex items-center text-blue-600 text-sm hover:text-blue-700"
              >
                <Phone size={14} className="mr-1" />
                {data.driver_contact}
              </a>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-center font-semibold">
            <DollarSign className={`w-4 h-4 mr-2 flex-shrink-0 ${
              isHireOffer ? 'text-teal-600' : 'text-blue-600'
            }`} />
            <span className={isHireOffer ? 'text-teal-700' : 'text-blue-700'}>
              {getPricingDisplay()}
            </span>
          </div>

          {/* Service Specific Details */}
          {isHireOffer ? (
            <div className="space-y-2">
              {/* Service Types */}
              <div className="flex items-start">
                <Package className="w-4 h-4 mr-2 text-teal-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Services:</strong> {getHireOptions()}
                </span>
              </div>

              {/* Location */}
              {data.location_address && (
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    {data.location_address}
                  </span>
                </div>
              )}

              {/* Additional Hire Details */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                {data.per_hour_rate && (
                  <span>Hourly: Rs. {data.per_hour_rate}</span>
                )}
                {data.weekly_rate && (
                  <span>Weekly: Rs. {data.weekly_rate}</span>
                )}
                {data.allow_custom_quote && (
                  <span className="text-green-600 font-medium">Custom Quotes Available</span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Schedule */}
              {(data.arrival_date || data.arrival_time) && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    {data.arrival_date || "Flexible"} 
                    {data.arrival_time && (
                      <>
                        <span className="mx-2">•</span>
                        <Clock size={14} className="inline mr-1" />
                        {data.arrival_time.substring(0, 5)}
                      </>
                    )}
                  </span>
                </div>
              )}
              
              {/* ✅ UPDATED: Seat Availability with API data */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong>Available Seats:</strong> 
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${
                    currentAvailableSeats === 0 ? 'text-red-600' :
                    currentAvailableSeats <= 5 ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {isLoadingSeats ? "Loading..." : currentAvailableSeats}
                  </span>
                </div>
                
                {/* Seat Breakdown with API data */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white p-2 rounded border">
                      <div className="font-bold text-gray-900 text-lg">{data.vehicle_seats || 0}</div>
                      <div className="text-xs text-gray-600">Total Seats</div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="font-bold text-red-600 text-lg">
                        {Array.isArray(data.reserve_seats) ? data.reserve_seats.length : 0}
                      </div>
                      <div className="text-xs text-gray-600">Reserved</div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="font-bold text-blue-600 text-lg">
                        {isLoadingSeats ? "..." : getBookedSeatsCount()}
                      </div>
                      <div className="text-xs text-gray-600">Booked</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Available = Total - (Reserved + Booked)
                  </div>
                  {seatError && (
                    <div className="mt-1 text-xs text-red-500 text-center">
                      {seatError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Images */}
        <div className="flex flex-col gap-4">
          
          {/* Vehicle Image */}
          <div className="relative">
            {data.vehicle_image ? (
              <img
                src={data.vehicle_image}
                alt="Vehicle"
                className="w-24 h-24 object-cover rounded-xl border shadow-md"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = "https://placehold.co/96x96/2563EB/FFFFFF?text=Vehicle"; 
                }}
              />
            ) : (
              <div className={`w-24 h-24 flex items-center justify-center rounded-xl border shadow-md ${
                isHireOffer ? 'bg-teal-50 text-teal-400' : 'bg-blue-50 text-blue-400'
              }`}>
                <Bus className="w-10 h-10" />
              </div>
            )}
            <div className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow-sm">
              <Bus size={12} className="text-gray-600" />
            </div>
          </div>
          
          {/* Driver Image */}
          <div className="relative">
            {data.driver_image ? (
              <img
                src={data.driver_image}
                alt="Driver"
                className="w-24 h-24 object-cover rounded-xl border shadow-md"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = "https://placehold.co/96x96/4B5563/FFFFFF?text=Driver"; 
                }}
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center rounded-xl border shadow-md bg-gray-50">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}
            <div className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow-sm">
              <User size={12} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {data.created_at && `Created: ${new Date(data.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}`}
        </div>
        
        {/* Button Group */}
        <div className="flex gap-3">
          {/* Details Button */}
          {/* // TransportCard.jsx ke andar details button ka onClick:

// Desktop view mein: */}
<button
  onClick={() => setInfoVehicle(data)} // ✅ Yehi same function hai
  disabled={isLoading}
  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 shadow-md hover:shadow-lg"
>
  <Eye className="w-4 h-4" />
  <span>Details</span>
  <ChevronRight size={16} />
</button>
          
          {/* Edit Button */}
          <button
            onClick={onEdit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 rounded-lg text-sm font-medium hover:from-yellow-500 hover:to-yellow-600 transition disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          
          {/* Delete Button */}
          <button
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal Render */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal 
          onConfirm={handleConfirmDelete} 
          onCancel={handleCancelDelete} 
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TransportCard;