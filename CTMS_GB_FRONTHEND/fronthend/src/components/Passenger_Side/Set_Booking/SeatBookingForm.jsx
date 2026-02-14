import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
  BusFront,
  X,
  Tag,
  CheckCircle,
  Info,
  ArrowRight,
  Shield,
  Star,
  Users,
  Wifi,
  Thermometer,
  BatteryCharging,
  Coffee,
  Armchair,
  PhoneCall,
  Building,
  Loader,
  AlertCircle
} from "lucide-react";

export default function SeatBookingForm({
  setStep,
  transports = [],
  bookingType,
  setFilteredTransports,
  setPassengerInfo,
  cameFromDashboard,

  // Dashboard Props
  closeForm,
  editingId,
  routes,
  vehicles,
  drivers,
  setTransports,
}) {
  const navigate = useNavigate();
  const isDashboardMode = !!closeForm;
  const [isCardBookingMode, setIsCardBookingMode] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [vehicleFeatures, setVehicleFeatures] = useState([]);

  // ✅ BOOKED SEATS API STATES
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [totalSeats, setTotalSeats] = useState(0);
  const [seatError, setSeatError] = useState(null);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
  });

  const [passenger, setPassenger] = useState({
    name: "",
    contact: "",
    email: "",
    cnic: "",
  });

  // -------------------------
  // Vehicle Features Configuration
  // -------------------------
  const featureConfig = {
    AC: {
      label: "AC",
      icon: Thermometer,
      color: "blue",
      bgColor: "bg-blue-400",
      textColor: "text-blue-700"
    },
    WiFi: {
      label: "Free WiFi",
      icon: Wifi,
      color: "purple",
      bgColor: "bg-purple-400",
      textColor: "text-purple-700"
    },
    ChargingPorts: {
      label: "Charging Ports",
      icon: BatteryCharging,
      color: "green",
      bgColor: "bg-green-400",
      textColor: "text-green-700"
    },
    FreeWaterBottle: {
      label: "Free Water",
      icon: Coffee,
      color: "red",
      bgColor: "bg-red-400",
      textColor: "text-red-700"
    },
    RecliningSeats: {
      label: "Reclining Seats",
      icon: Armchair,
      color: "yellow",
      bgColor: "bg-yellow-400",
      textColor: "text-yellow-700"
    }
  };
  
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 1440;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const sortTransportsByTime = (transportsList, referenceTime) => {
    if (!transportsList || transportsList.length === 0) return transportsList;
    
    const refTimeInMinutes = timeToMinutes(referenceTime);
    
    return [...transportsList].sort((a, b) => {
      const timeA = a.arrival_time?.substring(0, 5) || "23:59";
      const timeB = b.arrival_time?.substring(0, 5) || "23:59";
      const diffA = Math.abs(timeToMinutes(timeA) - refTimeInMinutes);
      const diffB = Math.abs(timeToMinutes(timeB) - refTimeInMinutes);   
      return diffA - diffB;
    });
  };

  // ✅ BOOKED SEATS API FETCH - WORKING WITHOUT LOGIN
  useEffect(() => {
    if (!selectedTransport || !isCardBookingMode) return;

    const fetchBookedSeats = async () => {
      setIsLoadingSeats(true);
      setSeatError(null);
      
      // Try multiple possible field names for vehicle ID
      const vehicleId = selectedTransport.vehicle_id || selectedTransport.vehicle || selectedTransport.id || selectedTransport.transport_id;
      const arrivalDate = selectedTransport.arrival_date || selectedTransport.departure_date;
      const arrivalTime = selectedTransport.arrival_time || selectedTransport.departure_time;

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
        // const url = `http://localhost:8000/api/checkout/bookings/?vehicle_id=${vehicleId}&arrival_date=${arrivalDate}&arrival_time=${formattedTime}`;

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
            const totalSeatsValue = selectedTransport.vehicle_seats || 40;
            const ownerReservedSeats = selectedTransport?.reserve_seats || [];
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
      const totalSeatsValue = selectedTransport.vehicle_seats || 40;
      const ownerReservedSeats = selectedTransport?.reserve_seats || [];
      const reservedSeatsCount = Array.isArray(ownerReservedSeats) ? ownerReservedSeats.length : 0;
      
      const calculatedAvailable = totalSeatsValue - reservedSeatsCount;
      setAvailableSeats(calculatedAvailable >= 0 ? calculatedAvailable : 0);
      setTotalSeats(totalSeatsValue);
    };

    fetchBookedSeats();
  }, [selectedTransport, isCardBookingMode]);

  // ✅ Get booked seats count from API response
  const getBookedSeatsCount = () => {
    return bookedSeatNumbers.length;
  };

  // ✅ **UPDATED: Available seats calculation using API data**
  const getAvailableSeats = (transport) => {
    if (!transport) return 0;
    
    // If this is the selected transport and we have API data, use it
    if (isCardBookingMode && transport.id === selectedTransport?.id) {
      return availableSeats;
    }
    
    // Otherwise use static calculation
    const totalSeats = transport.vehicle_seats || 0;
    const reservedSeats = transport.reserve_seats?.length || 0;
    return totalSeats - reservedSeats;
  };

  // -------------------------
  // Extract vehicle features from transport
  // -------------------------
  const extractVehicleFeatures = (transport) => {
    if (!transport || !transport.vehicle_features) return [];
    
    const features = [];
    const vehicleFeatures = transport.vehicle_features;
    
    // Check each feature in config
    Object.keys(featureConfig).forEach(key => {
      if (vehicleFeatures[key] === true) {
        features.push({
          ...featureConfig[key],
          key: key
        });
      }
    });
    
    return features;
  };

  // -------------------------
  // Load passenger info and check single-card booking
  // -------------------------
  useEffect(() => {
    if (isDashboardMode) return;

    const storedPassenger = JSON.parse(localStorage.getItem("passenger_data") || "{}");

    if (storedPassenger && Object.keys(storedPassenger).length > 0) {
      setPassenger({
        name: storedPassenger.name || "",
        email: storedPassenger.email || "",
        contact: storedPassenger.contact || "",
        cnic: storedPassenger.cnic || "",
      });
    }

    // Check if coming from card
    if (transports.length === 1 && window.location.pathname.includes("book-seat")) {
      const t = transports[0] || {};
      setIsCardBookingMode(true);
      setSelectedTransport(t);
      setFilters({
        from: t.route_from || "",
        to: t.route_to || "",
        date: t.arrival_date || "",
        time: t.arrival_time ? t.arrival_time.substring(0, 5) : "",
      });
      
      // Extract vehicle features
      const features = extractVehicleFeatures(t);
      setVehicleFeatures(features);
    } else {
      setIsCardBookingMode(false);
      setSelectedTransport(null);
      setVehicleFeatures([]);
    }
  }, [isDashboardMode, transports]);

  // -------------------------
  // Get driver info
  // -------------------------
  const getDriverInfo = (transport) => {
    if (!transport) return null;
    return {
      name: transport.driver_name || "Not Available",
      contact: transport.driver_contact || "Not Available",
      image: transport.driver_image || null
    };
  };

  // -------------------------
  // Get payment methods - ✅ UPDATED FOR CASH ONLY
  // -------------------------
  const getPaymentMethods = (transport) => {
    if (!transport) return [];
    
    // ✅ If payment_type is "Cash", show only cash message
    if (transport.payment_type === "Cash") {
      return [{
        type: "Cash",
        message: "ONLY CASH",
        description: "Pay in cash to the driver",
        icon: CreditCard
      }];
    }
    
    const methods = [];
    
    if (transport.easypaisa_name && transport.easypaisa_number) {
      methods.push({
        type: "EasyPaisa",
        name: transport.easypaisa_name,
        number: transport.easypaisa_number,
        icon: CreditCard
      });
    }
    
    if (transport.jazzcash_name && transport.jazzcash_number) {
      methods.push({
        type: "JazzCash",
        name: transport.jazzcash_name,
        number: transport.jazzcash_number,
        icon: CreditCard
      });
    }
    
    if (transport.bank_name && transport.bank_account_number) {
      methods.push({
        type: "Bank Transfer",
        name: transport.bank_name,
        details: `${transport.bank_account_title} - ${transport.bank_account_number}`,
        icon: Building
      });
    }
    
    return methods;
  };

  // -------------------------
  // Unique dropdown values
  // -------------------------
  const uniqueFrom = useMemo(
    () => [...new Set(transports.map((t) => t.route_from).filter(Boolean))],
    [transports]
  );

  const uniqueTo = useMemo(
    () => [...new Set(transports.map((t) => t.route_to).filter(Boolean))],
    [transports]
  );

  const handleChange = (e) => {
    if (isCardBookingMode) return;
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // -------------------------
  // DATE + TIME VALIDATION
  // -------------------------
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const minDate = today;
  const currentTime = now.toTimeString().slice(0, 5);
  const minTime = filters.date === today ? currentTime : "";

  // -------------------------
  // ✅ UPDATED: Handle PREVIOUS BUTTON
  // -------------------------
  const handlePrevious = () => {
    if (isCardBookingMode) {
      // ✅ Go back to the previous page (card view)
      navigate(-1);
    } else {
      setStep("dashboard");
    }
  };

  // -------------------------
  // Handle NEXT BUTTON
  // -------------------------
  const handleNext = () => {
    // Save passenger data to localStorage
    localStorage.setItem("passenger_data", JSON.stringify(passenger));
    
    setPassengerInfo(passenger);

    if (!cameFromDashboard && isCardBookingMode && transports.length === 1) {
      setStep({ step: "seatSelection", transport: transports[0] });
      return;
    }

    let filtered = transports;

    // ------------------------------------------------------------
    // ✅ IMPORTANT: صرف لوکیشن کے لحاظ سے فلٹر کریں
    // ------------------------------------------------------------
    if (filters.from) filtered = filtered.filter((t) => t.route_from === filters.from);
    if (filters.to) filtered = filtered.filter((t) => t.route_to === filters.to);
      
    let referenceTime = filters.time || currentTime;
    filtered = sortTransportsByTime(filtered, referenceTime);

    setFilteredTransports(filtered);

    if (cameFromDashboard) {
      setStep("services");
      return;
    }

    if (filtered.length === 1) {
      setStep({ step: "seatSelection", transport: filtered[0] });
    } else {
      setStep("services");
    }
  };

  // -------------------------
  // DASHBOARD FORM
  // -------------------------
  if (isDashboardMode) {
    return (
      <div className="p-4 sm:p-6  border-2 border-amber-300 rounded-xl shadow-lg bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        <h4 className="text-lg sm:text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
          <Tag size={20} className="text-amber-600" /> Action Required: Create Seat Offer Form
        </h4>

        <div className="bg-white p-4 rounded-lg border border-amber-200 mb-4">
          <p className="font-semibold text-indigo-700 text-sm sm:text-base flex items-center gap-2">
            <Info size={16} className="text-indigo-500" />
            Dashboard Data Loaded (Routes: {routes?.length || 0}, Vehicles: {vehicles?.length || 0})
          </p>
        </div>

        <button
          type="button"
          onClick={closeForm}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
        >
          <X size={20} /> Close Form
        </button>
      </div>
    );
  }
  
  // ✅ Payment Information Component - FIXED
  const renderPaymentInfo = () => {
    if (!selectedTransport || !getPaymentMethods(selectedTransport).length) return null;
    
    const isCash = selectedTransport.payment_type === "Cash";
    
    return (
      <div className={`border-2 p-4 rounded-2xl shadow-md ${
        isCash 
          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200'
          : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
      }`}>
        <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${
          isCash ? 'border-amber-200' : 'border-green-200'
        }`}>
          <div className={`p-2 rounded-lg ${
            isCash ? 'bg-amber-100' : 'bg-green-100'
          }`}>
            <CreditCard className={isCash ? 'text-amber-600' : 'text-green-600'} size={20} />
          </div>
          <h4 className={`text-lg font-bold ${
            isCash ? 'text-amber-700' : 'text-green-700'
          }`}>
            Payment Options
          </h4>
          <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
            isCash ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
          }`}>
            {selectedTransport.payment_type}
          </span>
        </div>
      
        {isCash ? (
          // ✅ Cash Only Display
          <div className="text-center py-2">
            <div className="text-3xl font-extrabold text-amber-800 mb-2">ONLY CASH</div>
            <p className="text-sm text-amber-600">Pay in cash to the driver</p>
            <div className="mt-3 bg-white/50 p-2 rounded-lg">
              <p className="text-xs text-gray-600">No EasyPaisa or JazzCash available</p>
            </div>
          </div>
        ) : (
          // Regular Payment Methods Display
          <div className="space-y-3">
            {getPaymentMethods(selectedTransport).map((method, index) => {
              let borderColor = 'border-blue-200';
              let textColor = 'text-blue-800';
              
              if (method.type === "EasyPaisa") {
                borderColor = 'border-blue-200';
                textColor = 'text-blue-800';
              } else if (method.type === "JazzCash") {
                borderColor = 'border-purple-200';
                textColor = 'text-purple-800';
              } else {
                borderColor = 'border-green-200';
                textColor = 'text-green-800';
              }
              
              return (
                <div key={index} className={`bg-white p-2 rounded-lg border ${borderColor}`}>
                  <p className={`font-semibold text-sm ${textColor}`}>
                    {method.type}
                  </p>
                  <p className="text-xs text-gray-600">{method.name}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {method.number || method.details || method.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-2xl max-w-6xl mx-auto overflow-hidden border border-indigo-100">
      
      {/* COMPANY HEADER BANNER - ONLY IN CARD MODE */}
      {isCardBookingMode && selectedTransport && (
        <div className="relative bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 p-4 sm:p-6 text-white">
          {/* Top pattern */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            {/* Logo and Company Name */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  {selectedTransport.company_logo_url ? (
                    <img 
                      src={selectedTransport.company_logo_url} 
                      alt={selectedTransport.company_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234f46e5'%3E%3Cpath d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z'/%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <BusFront size={32} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <CheckCircle size={14} className="text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{selectedTransport.company_name}</h1>
                <p className="font-bold text-green-400">{selectedTransport.route_from} → {selectedTransport.route_to}</p>
                <p className="text-indigo-200 font-medium">{selectedTransport.vehicle_details || "Your Journey, Our Priority"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                    4.8/5 Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Company Stats */}
            <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
              <div className="text-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-green-300" />
                  <span className="font-bold text-lg">Price/Seat</span>
                </div>
                <p className="text-sm text-indigo-200">{selectedTransport.price_per_seat}</p>
              </div>
              
              <div className="text-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-blue-300" />
                  <span className="font-bold text-lg">
                    {isLoadingSeats ? "..." : getAvailableSeats(selectedTransport)}/{selectedTransport.vehicle_seats}
                  </span>
                </div>
                <p className="text-sm text-indigo-200">Available Seats</p>
                {seatError && (
                  <p className="text-xs text-red-300 mt-1">{seatError}</p>
                )}
              </div>
              
              <div className="text-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="text-sm">
                  <p className="font-medium flex items-center gap-1">
                    <PhoneCall size={14} />
                    {selectedTransport.company_contact_1}
                  </p>
                  <p className="text-indigo-200">Contact Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom ribbon - DYNAMIC VEHICLE FEATURES */}
          {vehicleFeatures.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                {vehicleFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <span key={index} className="flex items-center gap-1">
                      <div className={`w-2 h-2 ${feature.bgColor} rounded-full`}></div>
                      {feature.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MAIN FORM CONTENT */}
      <div className="p-4 sm:p-6 md:p-10">
        {/* Form Header */}
        <div className="text-center mb-8 sm:mb-10">
          {!isCardBookingMode ? (
            // Regular form header (not from card)
            <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl mb-4 shadow-lg">
              <BusFront size={32} className="animate-pulse" />
              <h2 className="text-2xl sm:text-3xl font-extrabold">Book Your Seat Now</h2>
            </div>
          ) : (
            // Card mode header
            <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-2xl mb-4 shadow-lg">
              <CheckCircle size={32} className="animate-pulse" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold">Complete Your Booking</h2>
                <p className="text-sm text-green-100 mt-1">
                  You're booking with {selectedTransport?.company_name}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Passenger Info Card */}
          <div className="bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-100 p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-indigo-200">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <User className="text-indigo-600" size={22} />
              </div>
              <h3 className="text-xl font-bold text-indigo-700">Passenger Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup 
                label="Passenger Name *" 
                icon={User} 
                value={passenger.name}
                onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                placeholder="Enter full name"
              />

              <InputGroup 
                label="Contact No *" 
                icon={Phone} 
                value={passenger.contact}
                onChange={(e) => setPassenger({ ...passenger, contact: e.target.value })}
                placeholder="03XX XXXXXXX"
              />

              <InputGroup 
                label="Email Address" 
                icon={Mail} 
                value={passenger.email} 
                type="email"
                onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                placeholder="example@email.com"
              />

              <InputGroup 
                label="CNIC/Passport No" 
                icon={CreditCard} 
                value={passenger.cnic}
                onChange={(e) => setPassenger({ ...passenger, cnic: e.target.value })}
                placeholder="XXXXX-XXXXXXX-X"
              />
            </div>
          </div>

          {/* Trip Filters Card */}
          <div className={`border-2 p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
            isCardBookingMode 
              ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-green-200' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isCardBookingMode ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <MapPin className={isCardBookingMode ? 'text-green-600' : 'text-gray-600'} size={22} />
                </div>
                <h3 className={`text-xl font-bold ${
                  isCardBookingMode ? 'text-green-800' : 'text-gray-700'
                }`}>
                  Trip Details
                </h3>
              </div>
              
              {isCardBookingMode && (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={14} /> Locked
                </span>
              )}
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SelectGroup 
                  label="Leaving From *" 
                  icon={MapPin} 
                  name="from" 
                  value={filters.from}
                  onChange={handleChange} 
                  options={uniqueFrom} 
                  readOnly={isCardBookingMode}
                  variant={isCardBookingMode ? "success" : "default"}
                />

                <SelectGroup 
                  label="Going To *" 
                  icon={MapPin} 
                  name="to" 
                  value={filters.to}
                  onChange={handleChange} 
                  options={uniqueTo} 
                  readOnly={isCardBookingMode}
                  variant={isCardBookingMode ? "success" : "default"}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputGroup
                  label="Departure Date"
                  icon={Calendar}
                  name="date"
                  type="date"
                  value={filters.date}
                  onChange={handleChange}
                  min={minDate}
                  readOnly={isCardBookingMode}
                  variant={isCardBookingMode ? "success" : "default"}
                />

                <InputGroup
                  label="Preferred Time"
                  icon={Clock}
                  name="time"
                  type="time"
                  value={filters.time}
                  onChange={handleChange}
                  min={minTime}
                  readOnly={isCardBookingMode}
                  variant={isCardBookingMode ? "success" : "default"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section - Only in card mode */}
        {isCardBookingMode && selectedTransport && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Driver Information */}
            {getDriverInfo(selectedTransport) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 p-4 rounded-2xl shadow-md">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-blue-700">Driver Information</h4>
                </div>
                <div className="flex items-center gap-3">
                  {selectedTransport.driver_image ? (
                    <img 
                      src={selectedTransport.driver_image} 
                      alt={selectedTransport.driver_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center">
                      <User size={24} className="text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{selectedTransport.driver_name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Phone size={14} />
                      {selectedTransport.driver_contact}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Information */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 p-4 rounded-2xl shadow-md">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-purple-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BusFront className="text-purple-600" size={20} />
                </div>
                <h4 className="text-lg font-bold text-purple-700">Vehicle Details</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vehicle Type:</span>
                  <span className="font-semibold text-gray-800">{selectedTransport.vehicle_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vehicle Number:</span>
                  <span className="font-semibold text-gray-800">{selectedTransport.vehicle_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Seats:</span>
                  <span className="font-semibold text-gray-800">{selectedTransport.vehicle_seats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available Seats:</span>
                  <span className={`font-semibold ${
                    getAvailableSeats(selectedTransport) === 0 ? 'text-red-600' :
                    getAvailableSeats(selectedTransport) <= 5 ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {isLoadingSeats ? "Loading..." : getAvailableSeats(selectedTransport)}
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ UPDATED: Payment Information with Cash Only Option */}
            {renderPaymentInfo()}
          </div>
        )}
        {/* Bottom Actions */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* ✅ UPDATED: Previous Button with conditional behavior */}
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
          >
            <ArrowRight className="rotate-180" size={18} />
            {isCardBookingMode ? "Go Back" : "Previous Step"}
          </button>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 hidden sm:block">
              {isCardBookingMode ? "Ready to select seats" : `${transports.length} trips available`}
            </div>
            <button
              onClick={handleNext}
              disabled={!passenger.name || !passenger.contact || (isCardBookingMode && isLoadingSeats)}
              className={`flex items-center gap-2 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] w-full sm:w-auto justify-center group ${
                !passenger.name || !passenger.contact || (isCardBookingMode && isLoadingSeats)
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              }`}
            >
              {isCardBookingMode && isLoadingSeats ? (
                <span className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <>
                  <span>Continue to {isCardBookingMode ? 'Seat Selection' : 'Services'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Note - Only in card mode */}
        {isCardBookingMode && selectedTransport && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-indigo-700">{selectedTransport.company_name}</span> • 
              Contact: {selectedTransport.company_contact_1} {selectedTransport.company_contact_2 && ` | ${selectedTransport.company_contact_2}`} • 
              <span className="mx-2">|</span> Secure Payment 
              <span className="mx-2">|</span> 24/7 Customer Support
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* -----------------------------
   IMPROVED INPUT COMPONENTS
----------------------------- */
const InputGroup = ({ 
  label, 
  icon: Icon, 
  type = "text", 
  name, 
  value, 
  onChange, 
  readOnly, 
  min, 
  placeholder,
  variant = "default" 
}) => {
  const variantClasses = {
    default: readOnly 
      ? "bg-gray-100 border-gray-300 text-gray-500" 
      : "bg-white border-indigo-200 hover:border-indigo-300 focus:border-indigo-500 text-gray-900",
    success: readOnly 
      ? "bg-green-50 border-green-300 text-green-700" 
      : "bg-white border-green-200 hover:border-green-300 focus:border-green-500 text-gray-900"
  };

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-semibold ${variant === 'success' ? 'text-green-700' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon 
          size={18} 
          className={`absolute left-3 ${variant === 'success' ? 'text-green-500' : 'text-indigo-400'}`} 
        />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          min={min}
          placeholder={placeholder}
          required={label.includes("*")}
          className={`w-full border-2 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-offset-1 transition-all text-sm ${variantClasses[variant]} ${
            readOnly ? "cursor-not-allowed" : "cursor-text"
          }`}
        />
        {readOnly && variant === 'success' && (
          <CheckCircle size={16} className="absolute right-3 text-green-500" />
        )}
      </div>
    </div>
  );
};

const SelectGroup = ({ 
  label, 
  icon: Icon, 
  name, 
  value, 
  onChange, 
  options, 
  readOnly,
  variant = "default" 
}) => {
  const variantClasses = {
    default: readOnly 
      ? "bg-gray-100 border-gray-300 text-gray-500" 
      : "bg-white border-indigo-200 hover:border-indigo-300 focus:border-indigo-500 text-gray-900",
    success: readOnly 
      ? "bg-green-50 border-green-300 text-green-700" 
      : "bg-white border-green-200 hover:border-green-300 focus:border-green-500 text-gray-900"
  };

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-semibold ${variant === 'success' ? 'text-green-700' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon
          size={18}
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            variant === 'success' ? 'text-green-500' : 'text-indigo-400'
          } pointer-events-none`}
        />
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={readOnly}
          required={label.includes("*")}
          className={`w-full border-2 p-3 pl-10 rounded-xl appearance-none focus:ring-2 focus:ring-offset-1 transition-all text-sm ${variantClasses[variant]} ${
            readOnly ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <option value="">-- Select {label.replace(' *', '')} --</option>
          {options.map((loc, idx) => (
            <option key={idx} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
          variant === 'success' ? 'text-green-500' : 'text-gray-400'
        }`}>
        </div>
        {readOnly && variant === 'success' && (
          <CheckCircle size={16} className="absolute right-8 text-green-500" />
        )}
      </div>
    </div>
  );
};