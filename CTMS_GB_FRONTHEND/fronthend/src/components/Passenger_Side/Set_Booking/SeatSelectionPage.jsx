import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Bus, User, Star, ArrowLeft, Info, CreditCard, Wallet, 
  MapPin, Calendar, Clock, Shield, CheckCircle, X, 
  Users, Thermometer, Wifi, BatteryCharging, Coffee, Armchair,
  ChevronRight, Phone, Building, Loader, AlertCircle
} from "lucide-react"; 
import ManualPaymentModal from "../Payment/ManualPaymentPage";

export default function SeatSelectionPage({ transport: propTransport, setStep, setSelectedSeats, onSelectPayment }) {
    const location = useLocation();
    const transport = propTransport || location.state?.transport;

    // States
    const [localSelectedSeats, setLocalSeats] = useState([]); 
    const [customerBookedSeats, setCustomerBookedSeats] = useState([]);
    const [isLoadingSeats, setIsLoadingSeats] = useState(true);
    const [seatError, setSeatError] = useState(null);
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [manualPaymentData, setManualPaymentData] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [vehicleSeats, setVehicleSeats] = useState(40);
    const [isMobile, setIsMobile] = useState(false);

    // Check screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Booking ID جنریٹ کرنے کا فنکشن
    const generateBookingId = () => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 9).toUpperCase();
        return `BK-${timestamp}-${randomStr}`;
    };

    // Fetch booked seats
    useEffect(() => {
        if (!transport) {
            console.log("❌ Transport object is missing");
            setCustomerBookedSeats([]);
            setIsLoadingSeats(false);
            return;
        }

        const totalSeats = transport.vehicle_seats_snapshot || transport.seats_available || 40;
        setVehicleSeats(totalSeats);

        const vehicleId = transport.vehicle_id || transport.vehicle || transport.id;
        const arrivalDate = transport.arrival_date || transport.departure_date;
        const arrivalTime = transport.arrival_time || transport.departure_time;

        if (!vehicleId || !arrivalDate || !arrivalTime) {
            console.log("⚠️ Missing required data:", { vehicleId, arrivalDate, arrivalTime });
            setCustomerBookedSeats([]);
            setIsLoadingSeats(false);
            return;
        }

        const fetchBookedSeats = async () => {
            setIsLoadingSeats(true);
            setSeatError(null);

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

                if (!response.ok) {
                    if (response.status === 404) {
                        console.log("ℹ️ No bookings found (404)");
                        setCustomerBookedSeats([]);
                        return;
                    }
                    
                    const errorText = await response.text();
                    console.error("❌ API Error Response:", errorText);
                    throw new Error(`Failed to fetch seats: ${response.status}`);
                }

                const data = await response.json();
                
                if (Array.isArray(data)) {
                    setCustomerBookedSeats(data);
                } else {
                    setCustomerBookedSeats([]);
                }
            } catch (err) {
                console.error("❌ Fetch Error:", err);
                setSeatError(err.message);
                setCustomerBookedSeats([]);
            } finally {
                setIsLoadingSeats(false);
            }
        };

        fetchBookedSeats();
    }, [transport]);

    // Update parent selected seats
    useEffect(() => {
        setSelectedSeats && setSelectedSeats(localSelectedSeats);
    }, [localSelectedSeats, setSelectedSeats]);

    const ownerReservedSeats = transport?.reserve_seats || [];
    const unavailableSeats = [...new Set([...ownerReservedSeats, ...customerBookedSeats])];
    const totalSeats = vehicleSeats;

    const toggleSeat = (seat) => {
        if (unavailableSeats.includes(seat)) {
            console.log(`Seat ${seat} is unavailable`);
            return;
        }

        setLocalSeats((prev) => {
            const updated = prev.includes(seat)
                ? prev.filter((s) => s !== seat)
                : [...prev, seat];
            return updated;
        });
    };

    const vehicleDetails = transport?.vehicle_details || "";
    const vehicleFeatures = transport?.vehicle_features
        ? Object.keys(transport.vehicle_features).filter((key) => transport.vehicle_features[key] === true)
        : [];

    const vehicleRating = transport?.rating || 4.5;
    const totalReviews = transport?.total_reviews || 150;
    const pricePerSeat = transport?.price_per_seat || transport?.fare_per_seat || 2000;
    const totalPrice = localSelectedSeats.length * pricePerSeat;

    // Feature icons mapping
    const featureIcons = {
        AC: <Thermometer size={16} className="text-blue-600" />,
        WiFi: <Wifi size={16} className="text-purple-600" />,
        ChargingPorts: <BatteryCharging size={16} className="text-green-600" />,
        FreeWaterBottle: <Coffee size={16} className="text-red-600" />,
        RecliningSeats: <Armchair size={16} className="text-yellow-600" />
    };

    // Handle payment
    const handlePayment = (method) => {
        const newBookingId = generateBookingId();
        setBookingId(newBookingId);
        
        if (method === "CASH") {
            const bookingPayload = {
                booking_id: newBookingId,
                seats: localSelectedSeats,
                amount: totalPrice,
                transport,
                price_per_seat: pricePerSeat,
            };
            localStorage.setItem("final_booking_payload", JSON.stringify(bookingPayload));
            setStep("summary");
            onSelectPayment && onSelectPayment("CASH");
            return;
        }

        if (method === "MANUAL") {
            const paymentData = {
                booking_id: newBookingId,
                company_name: transport?.company_name || "XYZ Company",
                easypaisa_name: transport?.easypaisa_name || "",
                easypaisa_number: transport?.easypaisa_number || "",
                jazzcash_name: transport?.jazzcash_name || "",
                jazzcash_number: transport?.jazzcash_number || "",
                bank_name: transport?.bank_name || "",
                bank_account_title: transport?.bank_account_title || "",
                bank_account_number: transport?.bank_account_number || "",
                bank_iban: transport?.bank_iban || "",
                total_amount: totalPrice,
            };
            
            setManualPaymentData(paymentData);
            setManualModalOpen(true);
            onSelectPayment && onSelectPayment("MANUAL", paymentData);
        }
    };

    const handleManualPaymentSuccess = (screenshotBase64) => {
        const payload = {
            booking_id: bookingId,
            seats: localSelectedSeats, 
            amount: totalPrice,
            transport,
            price_per_seat: pricePerSeat,
            paymentType: "Manual Payment",
            screenshot: screenshotBase64,
        };

        localStorage.setItem("final_booking_payload", JSON.stringify(payload));
        setManualModalOpen(false);
        setStep("summary");
    };

    const modal = manualModalOpen && manualPaymentData && (
        <ManualPaymentModal
            onClose={() => setManualModalOpen(false)}
            paymentData={manualPaymentData}
            onSuccess={handleManualPaymentSuccess}
            bookingId={bookingId}
        />
    );

    // Mobile View Layout
    if (isMobile) {
        return (
            <>
                {modal}

                <div className="p-4 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200e min-h-screen">
                    {/* Back Button */}
                    <button
                        onClick={() => setStep && setStep("passengerCardList")}
                        className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-full shadow-md hover:bg-gray-100 transition duration-200 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                    </button>

                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 truncate">
                                    {transport?.company_name || "XYZ Company"}
                                </h2>
                                <div className="flex items-center mt-1">
                                    <div className="flex items-center text-yellow-500">
                                        <Star size={14} className="fill-current mr-1" />
                                        <span className="font-semibold text-sm text-gray-800">{vehicleRating}</span>
                                    </div>
                                    <span className="text-gray-500 text-xs ml-2">({totalReviews})</span>
                                </div>
                            </div>
                            
                            {transport?.company_logo_url ? (
                                <img
                                    src={transport.company_logo_url}
                                    alt="logo"
                                    className="w-12 h-12 object-cover rounded-full border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 border-2 border-gray-200">
                                    <Bus size={20} />
                                </div>
                            )}
                        </div>
                        
                        {/* Route */}
                        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg mb-3">
                            <div className="text-center flex-1">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {transport?.route_from || "Hunza"}
                                </p>
                                <div className="text-xs text-gray-500 mt-1">FROM</div>
                            </div>
                            
                            <ArrowLeft className="rotate-180 text-blue-500" size={16} />
                            
                            <div className="text-center flex-1">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {transport?.route_to || "Astor"}
                                </p>
                                <div className="text-xs text-gray-500 mt-1">TO</div>
                            </div>
                        </div>
                        
                        {/* Quick Info */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{transport?.arrival_date || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{transport?.arrival_time || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Journey Details */}
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                            <Info size={16} className="mr-2 text-blue-600" />
                            Journey Details
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <p className="text-xs text-gray-500">Vehicle Type</p>
                                <p className="font-semibold">{transport?.vehicle_type || "Coaster"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Vehicle Number</p>
                                <p className="font-semibold">{transport?.vehicle_number || "KHP 8906"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Seats</p>
                                <p className="font-semibold">{totalSeats}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Driver</p>
                                <p className="font-semibold">{transport?.driver_name || "Mother"}</p>
                            </div>
                        </div>
                        
                        {/* Vehicle Features */}
                        {vehicleFeatures.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">Features</p>
                                <div className="flex flex-wrap gap-1">
                                    {vehicleFeatures.slice(0, 4).map((feature, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                        >
                                            {featureIcons[feature] || <Star size={10} />}
                                            {feature.replace(/([A-Z])/g, " $1").trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Seat Selection */}
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">Select Seats</h3>
                            <div className="flex gap-2 text-xs">
                                <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> Selected</span>
                                <span className="flex items-center"><div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div> Booked</span>
                            </div>
                        </div>

                        {/* Loading/Error */}
                        {isLoadingSeats && (
                            <div className="text-center p-4">
                                <Loader className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                                <p className="text-sm text-gray-600">Loading seats...</p>
                            </div>
                        )}
                        
                        {seatError && (
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                                <p className="text-sm text-red-600">Error loading seats</p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Seat Grid */}
                        {!isLoadingSeats && !seatError && (
                            <div className="border-2 border-gray-200 rounded-lg bg-gray-50 p-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: totalSeats }, (_, i) => i + 1).map((seat) => {
                                        const isUnavailable = unavailableSeats.includes(seat); 
                                        const isSelected = localSelectedSeats.includes(seat); 
                                        return (
                                            <button
                                                key={seat}
                                                onClick={() => toggleSeat(seat)}
                                                disabled={isUnavailable} 
                                                className={`aspect-square rounded-lg text-sm font-bold transition ${
                                                    isUnavailable
                                                        ? "bg-red-100 text-red-800 cursor-not-allowed"
                                                        : isSelected
                                                        ? "bg-green-600 text-white"
                                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                                }`}
                                            >
                                                {seat}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Selected Seats Summary */}
                        {localSelectedSeats.length > 0 && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-600">Selected Seats</p>
                                        <p className="font-bold text-gray-900">{localSelectedSeats.join(", ")}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-600">Total Amount</p>
                                        <p className="text-lg font-bold text-green-700">Rs {totalPrice.toLocaleString()}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {localSelectedSeats.length} seat(s) × Rs {pricePerSeat}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Payment Options */}
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                        <h3 className="font-bold text-gray-800 mb-3">Payment Options</h3>
                        
                        <div className="space-y-3">
                            {transport?.payment_type === "BOTH" || transport?.payment_type === "ADVANCE" || transport?.payment_type === "ONLINE" ? (
                                <button
                                    onClick={() => handlePayment("MANUAL")}
                                    disabled={localSelectedSeats.length === 0}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg text-white transition ${
                                        localSelectedSeats.length === 0
                                            ? "bg-blue-400 cursor-not-allowed opacity-70"
                                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={18} />
                                        <span className="font-medium">Pay Now</span>
                                    </div>
                                    <ChevronRight size={16} />
                                </button>
                            ) : null}
                            
                            {transport?.payment_type === "BOTH" || transport?.payment_type === "CASH" ? (
                                <button
                                    onClick={() => handlePayment("CASH")}
                                    disabled={localSelectedSeats.length === 0}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition border ${
                                        localSelectedSeats.length === 0
                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                                            : "bg-white text-green-700 border-green-300 hover:bg-green-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Wallet size={18} />
                                        <span className="font-medium">Cash on Counter</span>
                                    </div>
                                    <ChevronRight size={16} />
                                </button>
                            ) : null}
                        </div>
                        
                        {!transport?.payment_type && (
                            <p className="text-center text-amber-600 text-sm mt-3">Payment type not specified</p>
                        )}
                    </div>

                    {/* Driver Info */}
                    {transport?.driver_name && (
                        <div className="bg-white rounded-xl shadow-lg p-4">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                                <User size={16} className="mr-2 text-blue-600" />
                                Driver Information
                            </h3>
                            <div className="flex items-center gap-3">
                                {transport?.driver_image ? (
                                    <img
                                        src={transport.driver_image}
                                        alt="Driver"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                        <User size={20} className="text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900">{transport.driver_name}</p>
                                    {transport.driver_contact && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Phone size={12} />
                                            <span>{transport.driver_contact}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

    // Desktop View Layout
    return (
        <>
            {modal}

            <div className="p-4 md:p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => setStep && setStep("passengerCardList")}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-full shadow-lg hover:bg-gray-50 transition duration-200 mb-6 border border-gray-200"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to List</span>
                    </button>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Journey Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header Card */}
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                            {transport?.company_name || "XYZ Company"}
                                        </h2>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center text-yellow-500">
                                                <Star size={18} className="fill-current mr-1" />
                                                <span className="font-semibold text-lg text-gray-800">{vehicleRating}</span>
                                                <span className="text-gray-500 ml-1">({totalReviews})</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Shield size={16} className="text-green-500" />
                                                <span>Verified Transport</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {transport?.company_logo_url ? (
                                        <img
                                            src={transport.company_logo_url}
                                            alt="logo"
                                            className="w-16 h-16 object-cover rounded-full border-4 border-gray-100 shadow-md"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white border-4 border-gray-100 shadow-md">
                                            <Bus size={24} />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Route Highlight */}
                                <div className="flex items-center justify-center gap-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-6">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <MapPin size={20} className="text-red-500" />
                                            <span className="text-sm font-semibold text-gray-600">FROM</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {transport?.route_from || "Hunza"}
                                        </p>
                                    </div>
                                    
                                    <ArrowLeft className="rotate-180 text-blue-500" size={24} />
                                    
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <MapPin size={20} className="text-green-500" />
                                            <span className="text-sm font-semibold text-gray-600">TO</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {transport?.route_to || "Astor"}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Journey Details */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar size={16} className="text-blue-500" />
                                            <span className="text-xs text-gray-500">Date</span>
                                        </div>
                                        <p className="font-semibold text-gray-900">{transport?.arrival_date || "N/A"}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={16} className="text-purple-500" />
                                            <span className="text-xs text-gray-500">Time</span>
                                        </div>
                                        <p className="font-semibold text-gray-900">{transport?.arrival_time || "N/A"}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Bus size={16} className="text-gray-500" />
                                            <span className="text-xs text-gray-500">Vehicle</span>
                                        </div>
                                        <p className="font-semibold text-gray-900">{transport?.vehicle_type || "Coaster"}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users size={16} className="text-green-500" />
                                            <span className="text-xs text-gray-500">Seats</span>
                                        </div>
                                        <p className="font-semibold text-gray-900">{totalSeats} Total</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle & Driver Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Vehicle Image */}
                                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                        <Bus size={20} className="mr-2 text-blue-600" />
                                        Vehicle
                                    </h3>
                                    <div className="relative">
                                        {transport?.vehicle_image ? (
                                            <img
                                                src={transport.vehicle_image}
                                                alt="Vehicle"
                                                className="w-full h-48 object-cover rounded-xl shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-full h-48 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100">
                                                <Bus size={48} className="text-blue-400" />
                                            </div>
                                        )}
                                        {transport?.vehicle_number && (
                                            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                                {transport.vehicle_number}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Driver Info */}
                                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                        <User size={20} className="mr-2 text-green-600" />
                                        Driver
                                    </h3>
                                    <div className="flex items-center gap-4 mb-4">
                                        {transport?.driver_image ? (
                                            <img
                                                src={transport.driver_image}
                                                alt="Driver"
                                                className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 shadow-md"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                                                <User size={32} className="text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xl font-bold text-gray-900">{transport?.driver_name || "Mother"}</p>
                                            {transport?.driver_contact && (
                                                <div className="flex items-center gap-2 text-gray-600 mt-1">
                                                    <Phone size={16} />
                                                    <span>{transport.driver_contact}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Professional driver with verified license and experience.
                                    </p>
                                </div>
                            </div>

                            {/* Vehicle Features */}
                            {vehicleFeatures.length > 0 && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-blue-200">
                                    <h3 className="font-bold text-blue-800 mb-4 flex items-center">
                                        <Star size={20} className="mr-2 text-blue-600" />
                                        Vehicle Features
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                        {vehicleFeatures.map((feature, index) => (
                                            <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-center mb-2">
                                                    {featureIcons[feature] || <Star size={20} className="text-blue-500" />}
                                                </div>
                                                <p className="text-center text-sm font-medium text-gray-800">
                                                    {feature.replace(/([A-Z])/g, " $1").trim()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {vehicleDetails && (
                                        <p className="text-gray-600 text-sm mt-4">{vehicleDetails}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Seat Selection */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                                {/* Seat Legend */}
                                <div className="flex justify-center gap-4 text-xs font-semibold mb-6">
                                    <span className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div> Selected</span>
                                    <span className="flex items-center"><div className="w-3 h-3 bg-red-400 rounded-full mr-1"></div> Booked</span>
                                    <span className="flex items-center"><div className="w-3 h-3 bg-gray-200 rounded-full mr-1"></div> Available</span>
                                </div>

                                {/* Loading/Error */}
                                {isLoadingSeats && (
                                    <div className="text-center p-6">
                                        <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
                                        <p className="text-gray-600">Loading seat availability...</p>
                                    </div>
                                )}
                                
                                {seatError && (
                                    <div className="text-center p-6 bg-red-50 rounded-xl">
                                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                                        <p className="text-red-600 font-semibold mb-2">Error loading seats</p>
                                        <p className="text-sm text-gray-500 mb-3">{seatError}</p>
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}

                                {/* Seat Selection */}
                                {!isLoadingSeats && !seatError && (
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                            Choose Your Seats
                                        </h3>
                                        <div className="p-4 border-4 border-gray-200 rounded-xl bg-gray-50">
                                            <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
                                                {Array.from({ length: totalSeats }, (_, i) => i + 1).map((seat) => {
                                                    const isUnavailable = unavailableSeats.includes(seat); 
                                                    const isSelected = localSelectedSeats.includes(seat); 
                                                    return (
                                                        <button
                                                            key={seat}
                                                            onClick={() => toggleSeat(seat)}
                                                            disabled={isUnavailable} 
                                                            className={`aspect-square rounded-lg text-sm font-bold transition duration-150 ${
                                                                isUnavailable
                                                                    ? "bg-red-100 text-red-800 cursor-not-allowed border border-red-200"
                                                                    : isSelected
                                                                    ? "bg-green-600 text-white shadow-md border-2 border-green-400"
                                                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-blue-300"
                                                            }`}
                                                        >
                                                            {seat}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <p className="text-sm text-gray-600">Selected Seats</p>
                                            <p className="font-bold text-gray-900 text-lg">
                                                {localSelectedSeats.join(", ") || "None"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Total Amount</p>
                                            <p className="text-2xl font-bold text-green-700">
                                                Rs {totalPrice.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Price per seat:</span>
                                            <span className="font-semibold">Rs {pricePerSeat.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-gray-600">Seats selected:</span>
                                            <span className="font-semibold">{localSelectedSeats.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Buttons */}
                                <div className="space-y-3">
                                    {transport?.payment_type === "BOTH" || transport?.payment_type === "ADVANCE" || transport?.payment_type === "ONLINE" ? (
                                        <button
                                            onClick={() => handlePayment("MANUAL")}
                                            disabled={localSelectedSeats.length === 0}
                                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-lg font-bold text-white transition duration-200 shadow-lg ${
                                                localSelectedSeats.length === 0
                                                    ? "bg-blue-400 cursor-not-allowed opacity-70"
                                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                            }`}
                                        >
                                            <CreditCard size={20} />
                                            <span>Pay Now (MANUAL)</span>
                                        </button>
                                    ) : null}
                                    
                                    {transport?.payment_type === "BOTH" || transport?.payment_type === "CASH" ? (
                                        <button
                                            onClick={() => handlePayment("CASH")}
                                            disabled={localSelectedSeats.length === 0}
                                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-lg font-bold transition duration-200 border-2 ${
                                                localSelectedSeats.length === 0
                                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                                                    : "bg-white text-green-700 border-green-600 hover:bg-green-50"
                                            }`}
                                        >
                                            <Wallet size={20} />
                                            <span>Cash On Counter</span>
                                        </button>
                                    ) : null}
                                    
                                    {!transport?.payment_type && (
                                        <p className="text-center text-amber-600 text-sm">Payment type not specified</p>
                                    )}
                                    
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-3">
                                        <Shield size={12} />
                                        <span>Secure payment • 100% refundable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}