import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import VehicleSearch from "../../Passenger_Side/Vehicle_Booking/VehicleSearch";
import PaymentPage from "../../Passenger_Side/Vehicle_Booking/VehicleBookingSummary";


export default function VehicleBookingFormWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get state from navigation or use localStorage as fallback
  const vehicleDetails = location.state?.vehicleDetails || 
                         JSON.parse(localStorage.getItem("selectedVehicleForBooking") || "null");
  
  const isDirectBooking = location.state?.fromCard || false;
  
  // State to control which page to show
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  
  // Check authentication - use consistent token key
  const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");

  // Clean up old data on mount
  useEffect(() => {
    // Clear any previous booking data when starting fresh
    if (!location.state?.preserveData) {
      localStorage.removeItem("paymentData");
      localStorage.removeItem("booking_payload");
      localStorage.removeItem("selectedVehicleForBooking");
    }
    
    // Check if we have pending payment data from previous session
    const storedPaymentData = localStorage.getItem("paymentData");
    if (storedPaymentData && !location.state?.fromCard) {
      try {
        const data = JSON.parse(storedPaymentData);
        setBookingData(data);
        setShowPaymentPage(true);
      } catch (error) {
        console.error("Error parsing stored payment data:", error);
        localStorage.removeItem("paymentData");
      }
    }
  }, [location]);
const handleProceedToPayment = (data) => {
  // Store the booking data
  setBookingData(data);
  
  // Also store in localStorage for persistence
  localStorage.setItem("paymentData", JSON.stringify(data));
  localStorage.setItem("booking_payload", JSON.stringify(data));
  localStorage.setItem("selectedVehicleForBooking", JSON.stringify(data));
  
  // Switch to payment page
  setShowPaymentPage(true);
  
  // Update URL to reflect payment state
  window.history.replaceState({}, "", "/booking/payment");
};

  // Function to go back to search
  const handleBackToSearch = () => {
    setShowPaymentPage(false);
    setBookingData(null);
    
    // Clear payment data but keep vehicle selection
    localStorage.removeItem("paymentData");
    localStorage.removeItem("booking_payload");
    
    // Go back in history
    navigate(-1);
  };

  // If no token, redirect to login
  if (!token || token.trim() === "" || token === "undefined" || token === "null") {
    // Store current location for redirect after login
    localStorage.setItem("redirectAfterLogin", JSON.stringify({
      path: location.pathname,
      state: {
        vehicleDetails,
        fromCard: isDirectBooking
      }
    }));
    
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          vehicleDetails,
          fromCard: isDirectBooking,
        }}
      />
    );
  }

  // If coming from card but no vehicle details, redirect home
  if (isDirectBooking && !vehicleDetails) {
    return <Navigate to="/" replace />;
  }

  // Show PaymentPage if we have booking data
  if (showPaymentPage && bookingData) {
    return (
      <PaymentPage
        bookingData={bookingData}
        isDirectBooking={isDirectBooking}
        vehicleDataFromCard={vehicleDetails}
        onBack={handleBackToSearch}
      />
    );
  }

  // Otherwise show VehicleSearch form
  return (
    <VehicleSearch
      vehicleDataFromCard={vehicleDetails}
      isDirectBooking={isDirectBooking}
      onProceedToPayment={handleProceedToPayment}
    />
  );
}