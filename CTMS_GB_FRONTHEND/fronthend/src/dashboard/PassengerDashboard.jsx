// Dashboard

import React, { useState, useEffect } from "react";
import {
  Ticket, Bus, History, CloudSun, User, Car, LayoutDashboard, LogOut,
  ChevronRight, ClipboardList, Menu, X, Settings, Home, MapPin,
  Calendar, Clock, CreditCard, Shield, Star, TrendingUp
} from "lucide-react";
import AvailableServices from "../components/Passenger_Side/Set_Booking/AvailableServices";
import SeatBookingForm from "../components/Passenger_Side/Set_Booking/SeatBookingForm";
import PassengerCardList from "../components/Passenger_Side/Set_Booking/PassengerCardList";
import SeatSelectionPage from "../components/Passenger_Side/Set_Booking/SeatSelectionPage";
import ManualPaymentModal from "../components/Passenger_Side/Payment/ManualPaymentPage";
import BookingSummary from "../components/Passenger_Side/Set_Booking/SeatBookingSummary";
import ProfileModal from "../components/Passenger_Side/PassengerProfile/PassengerProfileModel";
import TicketHistory from "../components/Passenger_Side/Ticket_History/TicketHistory";
import CustomerDashboard from "../components/Passenger_Side/Vehicle_Booking/CostomerVehicleBookingManager";
import { parseJwt } from "../utils/getUserInfo";
import apiPrivate from "../api/apiprivate";

// --- Helper Component: Stat Card ---
const StatCard = ({ title, count, icon: Icon, color }) => {
  const colorClasses = {
    green: { border: 'border-green-500', text: 'text-green-500', bg: 'bg-green-50' },
    blue: { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-50' },
    orange: { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-50' },
    indigo: { border: 'border-indigo-500', text: 'text-indigo-500', bg: 'bg-indigo-50' },
    pink: { border: 'border-pink-500', text: 'text-pink-500', bg: 'bg-pink-50' },
    teal: { border: 'border-teal-500', text: 'text-teal-500', bg: 'bg-teal-50' }
  };
  const colors = colorClasses[color] || colorClasses.teal;

  return (
    <div className={`p-4 sm:p-5 ${colors.bg} rounded-xl shadow-lg border-l-4 ${colors.border} transform hover:scale-[1.02] transition duration-300`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{count}</h2>
        </div>
        <Icon size={28} className={`${colors.text} opacity-70`} />
      </div>
    </div>
  );
};

// --- Booking Progress Card ---
const BookingProgressCard = ({ step }) => {
  const steps = [
    { key: "dashboard", label: "Start" },
    { key: "bookingForm", label: "Search" },
    { key: "services", label: "Service Type" },
    { key: "passengerCardList", label: "Choose Transport" },
    { key: "seatSelection", label: "Select Seats" },
    { key: "payment", label: "Payment" },
    { key: "summary", label: "Summary" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="bg-white shadow-lg p-3 sm:p-6 rounded-xl border border-gray-100 mb-6 sm:mb-8">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
        <ClipboardList className="w-5 h-5 mr-2 text-teal-500" />
        Booking Progress
      </h3>
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2 mx-4 sm:mx-10" />
        {steps.map((s, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          return (
            <div key={s.key} className="flex flex-col items-center z-10 w-auto">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-teal-600 text-white shadow-xl shadow-teal-200"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              <p
                className={`mt-2 text-xs text-center font-medium ${
                  isCurrent ? "text-teal-600 font-bold" : "text-gray-500"
                } hidden sm:block`}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Step Title Helper
const getStepTitle = (step) => {
  switch (step) {
    case "dashboard":
      return "Start Booking";
    case "bookingForm":
      return "Search Routes";
    case "services":
      return "Select Service Type";
    case "passengerCardList":
      return "Choose Transport";
    case "seatSelection":
      return "Select Seats";
    case "payment":
      return "Payment Method";
    case "summary":
      return "Booking Summary";
    default:
      return "Seat Booking Flow";
  }
};

// --- Sidebar Component ---
const SidebarContent = ({ onClose, username, handleLogout, setShowProfile, activeTab, setActiveTab, setStep, fetchTransports, setCameFromDashboard }) => {
  return (
    <>
      {/* Logo Section - Glass morphism */}
      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-blue-600/90 to-purple-700/90 backdrop-blur-sm">
        <h1 className="text-xl font-extrabold text-white tracking-widest flex items-center">
          <LayoutDashboard className="w-5 h-5 mr-2" /> PTMS_GB
        </h1>
        <p className="text-xs text-white/80 mt-1">Passenger Transport System</p>
      </div>

      {/* Navigation - Glass morphism */}
      <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto bg-gradient-to-br from-gray-100 via-blue-50 to-sky-100 backdrop-blur-sm border border-gray-400 ml-3">
        {[
          {
            id: "seatBooking",
            label: "Seat Booking",
            icon: Ticket,
            gradient: "from-blue-500 to-indigo-500",
            action: () => {
              setActiveTab("seatBooking");
              setCameFromDashboard(true);
              fetchTransports("offer_sets");
              onClose && onClose();
            }
          },
          {
            id: "vehicleBooking",
            label: "Vehicle Booking",
            icon: Car,
            gradient: "from-indigo-500 to-purple-500",
            action: () => {
              setActiveTab("vehicleBooking");
              setStep("dashboard");
              onClose && onClose();
            }
          },
          {
            id: "history",
            label: "Booking History",
            icon: History,
            gradient: "from-purple-500 to-pink-500",
            action: () => {
              setActiveTab("history");
              setStep("dashboard");
              onClose && onClose();
            }
          }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={tab.action}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group border relative overflow-hidden ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.gradient} text-white border-transparent shadow-lg`
                : "text-gray-700 hover:bg-white/60 border-gray-300/50 hover:border-blue-300/50 hover:text-blue-600"
            }`}
          >
            {/* Active tab indicator */}
            {activeTab === tab.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
            )}
            
            <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
            <span className="font-medium">{tab.label}</span>
            
            {activeTab === tab.id && (
              <ChevronRight className="w-4 h-4 ml-auto transform group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        ))}
      </nav>
    </>
  );
};

export default function PassengerDashboard() {
  const [activeTab, setActiveTab] = useState("seatBooking");
  const [step, setStep] = useState("dashboard");
  const [transports, setTransports] = useState([]);
  const [bookingType, setBookingType] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerInfo, setPassengerInfo] = useState(null);
  const [paymentType, setPaymentType] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState(null);
  const [finalBookingPayload, setFinalBookingPayload] = useState(null);
  const [cameFromDashboard, setCameFromDashboard] = useState(false);

  // Decode user info and fetch profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        const decoded = parseJwt(token);
        
        // Set username
        if (decoded?.username) setUsername(decoded.username);
        else if (decoded?.email) setUsername(decoded.email);
        else if (decoded?.user_id) setUsername("User-" + decoded.user_id);

        // Fetch passenger profile to get profile image
        try {
          const response = await apiPrivate.get("auth/passenger/profile/");
          if (response.data?.profile_picture) {
            setProfileImage(response.data.profile_picture);
            // Also store in localStorage for quick access
            localStorage.setItem("passenger_profile_image", response.data.profile_picture);
          }
        } catch (error) {
          console.log("Error fetching profile:", error);
          // Try to get from localStorage if API fails
          const storedImage = localStorage.getItem("passenger_profile_image");
          if (storedImage) {
            setProfileImage(storedImage);
          }
        }
      }
    };

    fetchUserProfile();
  }, []);

  // Refresh token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;
    try {
      // http://127.0.0.1:8000/api/token/refresh/
      const response = await fetch("/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.access) localStorage.setItem("access_token", data.access);
      return data.access || null;
    } catch {
      return null;
    }
  };

  // Fetch Transports
  const fetchTransports = async (offerType) => {
    try {
      let token = localStorage.getItem("access_token");
      if (!token || !offerType) return;
      let response = await fetch(
        // http://127.0.0.1:8000/api/search/?offer_type=${offerType}
        `/api/search/?offer_type=${offerType}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) return;
        token = newToken;
        response = await fetch(
          // http://127.0.0.1:8000/api/search/?offer_type=${offerType}
          `/api/search/?offer_type=${offerType}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      if (!response.ok) return;
      const data = await response.json();
      setTransports(Array.isArray(data) ? data : []);
      setBookingType(offerType);
      setStep("bookingForm");
    } catch (err) {
      console.error("Error fetching transports:", err);
    }
  };

  function base64ToFile(base64Data, filename) {
    const arr = base64Data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // Manual Payment Success Handler
  const handleManualPaymentSuccess = (screenshotBase64) => {
    const screenshotFile = base64ToFile(screenshotBase64, 'manual_payment.png');

    const payload = {
      seats: selectedSeats,
      amount: selectedSeats.length * (selectedTransport?.price_per_seat || 0),
      transport: selectedTransport,
      paymentType: "Manual Payment",
      screenshot: screenshotFile,
    };

    setFinalBookingPayload(payload);
    setManualModalOpen(false);
    setStep("summary");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("company_status");
    localStorage.removeItem("passenger_profile_image");
    window.location.href = "/";
  };

  return (
    <div className="bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 min-h-screen">
      {/* 💥 LAYOUT FIX: Flex container for Sidebar and Content */}
      <div className="lg:flex">
        {/* 1. Desktop Sidebar (Left Column - Sticky) - Hidden on mobile */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="w-72 lg:sticky lg:top-0 h-screen bg-white shadow-xl z-30 flex flex-col overflow-y-auto">
            <SidebarContent 
              username={username}
              handleLogout={handleLogout}
              setShowProfile={setShowProfile}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setStep={setStep}
              fetchTransports={fetchTransports}
              setCameFromDashboard={setCameFromDashboard}
            />
          </div>
        </div>

        {/* --- Main Content Layout (Right Side) --- */}
        <div className="flex-1 min-w-0">
  {/* Fixed Sidebar Button for Mobile */}
  <button
  onClick={() => setIsSidebarOpen(true)}
  className="lg:hidden fixed top-6 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition-all"
  style={{ marginTop: '2.5rem' }}
>
  {/* Chevron right symbol */}
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-5 h-5"
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
</button>

  {/* --- Top Bar & Header (Banner) --- */}
  <div
    className="w-full h-[25vh] sm:h-[30vh] relative flex items-center justify-center bg-cover bg-center shadow-lg lg:mt-0 mt-16"
    style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/passenger-banner.jpg')`
    }}
  >
    {/* Center Profile Image + Name */}
    <div className="relative z-10 text-center px-4">
      {/* Profile Image Container - Changed from User icon to actual profile image */}
      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/90 flex items-center justify-center mx-auto shadow-xl border-4 border-white overflow-hidden">
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
        ) : (
          <User className="w-10 h-10 sm:w-16 sm:h-16 text-teal-600" />
        )}
      </div>
      <h1 className="text-white text-2xl sm:text-4xl mt-3 font-extrabold drop-shadow-lg">
        Welcome, {username || "Passenger"}
      </h1>
      <p className="text-gray-200 text-sm sm:text-base font-medium mt-1">
        Book your journey with ease
      </p>
    </div>
  </div>

  {/* 💥 INTERNAL PADDING WRAPPER */}
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Main Content Area */}
    <main className="flex-1 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
      <div className="w-full">
        {activeTab === "seatBooking" && step !== "dashboard" && (
          <BookingProgressCard step={step} />
        )}
        
        <div className="mb-6 sm:mb-8 border-b pb-4 ">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            <span className="text-blue-600">
              {activeTab === "seatBooking" ? getStepTitle(step) :
               activeTab === "vehicleBooking" ? "Private Vehicle Booking" :
               activeTab === "history" ? "My Booking History" :
               "Live Update"}
            </span>
          </h3>
        </div>

        {/* --- Seat Booking --- */}
        {activeTab === "seatBooking" && (
          <div>
            {step === "dashboard" && (
              <div className="text-center py-8 sm:py-12 lg:py-20 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200 shadow-inner">
                <div className="max-w-2xl mx-auto px-4">
                  <Bus className="w-16 h-16 sm:w-20 sm:h-20 text-teal-600 mx-auto mb-6 opacity-70" />
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800 mb-3">
                    Start Your Seamless Seat Booking
                  </h3>
                  <p className="text-gray-600 mb-8 sm:mb-10 text-sm sm:text-base">
                    Search and compare available transport offers to plan your journey with ease.
                  </p>
                  <button
                    onClick={() => {
                      setCameFromDashboard(true);
                      fetchTransports("offer_sets");
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 sm:px-12 py-3 sm:py-4 text-sm sm:text-base rounded-full shadow-lg transition transform hover:scale-105 flex items-center justify-center mx-auto"
                  >
                    <Ticket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 
                    <span>Find Available Seats</span>
                  </button>
                </div>
              </div>
            )}

            {step === "bookingForm" && (
              <SeatBookingForm
                transports={transports}
                bookingType={bookingType}
                setStep={setStep}
                setFilteredTransports={(data) => setTransports(data)}
                setPassengerInfo={setPassengerInfo}
                cameFromDashboard={cameFromDashboard}
              />
            )}

            {step === "services" && (
              <AvailableServices
                setStep={setStep}
                setSelectedService={setSelectedService}
                transports={transports}
              />
            )}

            {step === "passengerCardList" && (
              <PassengerCardList
                setStep={setStep}
                selectedService={selectedService}
                transports={
                  selectedService === "ALL"
                    ? transports
                    : transports.filter(
                        (t) =>
                          (t.vehicle_type || t.vehicle_type_snapshot || "")
                            .toLowerCase() ===
                          (selectedService || "").toLowerCase()
                      )
                }
                setSelectedTransport={(t) => {
                  setSelectedTransport(t);
                  setSelectedSeats([]);
                  setFinalBookingPayload(null);
                  setStep("seatSelection");
                }}
              />
            )}

            {step === "seatSelection" && selectedTransport && (
              <SeatSelectionPage
                transport={selectedTransport}
                selectedSeats={selectedSeats}
                setSelectedSeats={setSelectedSeats}
                setStep={setStep}
                onSelectPayment={(paymentType, manualData) => {
                  setPaymentType(paymentType);
                  if (paymentType === "MANUAL") {
                    setManualPaymentData(manualData);
                    setManualModalOpen(true);
                  } else {
                    setFinalBookingPayload({
                      seats: selectedSeats,
                      amount: selectedTransport?.fare || 0,
                      transport: selectedTransport,
                      passengerInfo,
                      paymentType,
                    });
                    setStep("summary");
                  }
                }}
              />
            )}

            {manualModalOpen && manualPaymentData && (
              <ManualPaymentModal
                onClose={() => setManualModalOpen(false)}
                paymentData={manualPaymentData}
                onSuccess={handleManualPaymentSuccess}
              />
            )}

            {step === "summary" && (
              <BookingSummary
                passengerInfo={finalBookingPayload?.passengerInfo || passengerInfo}
                selectedSeats={finalBookingPayload?.seats || selectedSeats}
                transport={finalBookingPayload?.transport || selectedTransport}
                paymentType={finalBookingPayload?.paymentType || paymentType}
                manualPaymentScreenshot={finalBookingPayload?.screenshot || null}
                setStep={setStep}
              />
            )}
          </div>
        )}

        {/* Vehicle Booking */}
        {activeTab === "vehicleBooking" && (
          <div>
            <CustomerDashboard />
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div>
            <TicketHistory />
          </div>
        )}
      </div>
    </main>
  </div>
</div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col animate-slide-in">
            {/* Close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <SidebarContent 
              onClose={() => setIsSidebarOpen(false)}
              username={username}
              handleLogout={handleLogout}
              setShowProfile={setShowProfile}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setStep={setStep}
              fetchTransports={fetchTransports}
              setCameFromDashboard={setCameFromDashboard}
            />
          </div>
        </div>
      )}

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* Add animation style */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}