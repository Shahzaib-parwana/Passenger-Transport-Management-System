import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import ManualPaymentModal from "../Payment/ManualPaymentPage";

// PDF Utilities Fix
import * as HTML2CanvasModule from "html2canvas";
const html2canvas = HTML2CanvasModule.default || HTML2CanvasModule;

import * as JSPDFModule from "jspdf";
const jsPDF = JSPDFModule.default || JSPDFModule;

// ------------------- UI PILL COMPONENT -------------------
const InfoPill = ({ label, value, icon }) => (
  <div className="flex items-center space-x-2 p-2 bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-150 hover:shadow-md">
    <span className="text-xl text-teal-500">{icon}</span>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value || "N/A"}</p>
    </div>
  </div>
);

// ------------------- PDF DOWNLOAD UTILITY -------------------
const generatePDF = (element, filename = "booking-receipt.pdf") => {
  html2canvas(element, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(filename);
  });
};

// ------------------- RECEIPT PAGE COMPONENT -------------------
const ReceiptPage = ({ bookingData, onDownloadPDF }) => {
  const qrCodeValue = JSON.stringify({ 
    bookingId: bookingData.booking_id, 
    amount: bookingData.total_amount, 
    passenger: bookingData.passenger_name 
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-inter">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-extrabold text-green-600 mb-8 text-center">
          ✅ Booking Confirmed!
        </h1>
        <p className="text-center text-lg text-gray-600 mb-10">
          Your journey is booked. Please find your receipt below.
        </p>

        {/* ------------------- RECEIPT CARD ------------------- */}
        <div id="receipt-content" className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-teal-500 space-y-6">
          
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-teal-700">Official Receipt</h2>
            <p className="text-sm text-gray-500">Booking ID: <span className="font-mono font-semibold">{bookingData.booking_id || "N/A"}</span></p>
          </div>

          {/* TRIP SUMMARY */}
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-teal-600">Trip Summary</h3>
            <p className="text-gray-700 font-medium">From: <span className="font-semibold">{bookingData.from_location}</span></p>
            <p className="text-gray-700 font-medium">To: <span className="font-semibold">{bookingData.to_location}</span></p>
            <p className="text-gray-700 font-medium">Date & Time: <span className="font-semibold">{bookingData.arrival_date} at {bookingData.arrival_time}</span></p>
            <p className="text-gray-700 font-medium">Vehicle Type: <span className="font-semibold">{bookingData.vehicle_type}</span></p>
            {bookingData.service_type === "long_drive" && (
              <p className="text-gray-700 font-medium">Duration: <span className="font-semibold capitalize">
                {bookingData.duration_value} {bookingData.duration_type}{bookingData.duration_value > 1 ? 's' : ''}
              </span></p>
            )}
          </div>
          
          <hr />

          {/* PASSENGER & CONTACT INFO */}
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-teal-600">Passenger & Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium text-gray-500">Name:</span> <span className="font-semibold">{bookingData.passenger_name}</span></p>
                <p><span className="font-medium text-gray-500">Phone:</span> <span className="font-semibold">{bookingData.passenger_phone}</span></p>
                <p><span className="font-medium text-gray-500">CNIC:</span> <span className="font-semibold">{bookingData.passenger_cnic || "N/A"}</span></p>
                <p><span className="font-medium text-gray-500">Email:</span> <span className="font-semibold">{bookingData.passenger_email || "N/A"}</span></p>
            </div>
          </div>
          
          <hr />

          {/* DRIVER INFO */}
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-teal-600">Driver Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium text-gray-500">Driver Name:</span> <span className="font-semibold">{bookingData.driver_name}</span></p>
                <p><span className="font-medium text-gray-500">Driver Contact:</span> <span className="font-semibold">{bookingData.driver_contact}</span></p>
            </div>
          </div>
          
          <hr />

          {/* PRICE AND PAYMENT */}
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-teal-600">Payment Details</h3>
            <p className="text-2xl font-extrabold text-gray-800">Total Paid: <span className="text-red-600">{bookingData.total_amount} {bookingData.currency}</span></p>
            <p className="text-gray-700 font-medium">Payment Method: <span className="font-semibold">{bookingData.payment_method}</span></p>
            <p className="text-gray-700 font-medium">Company: <span className="font-semibold">{bookingData.company_name}</span></p>
          </div>

          <hr />

          {/* QR CODE */}
          <div className="flex justify-center items-center flex-col pt-4">
            <h3 className="font-bold text-lg text-gray-700 mb-2">Scan for Verification</h3>
            <QRCodeCanvas value={qrCodeValue} size={128} />
            <p className="mt-2 text-xs text-gray-500">This QR code contains your booking details.</p>
          </div>

        </div>

        {/* ------------------- DOWNLOAD BUTTON ------------------- */}
        <div className="text-center mt-8">
          <button
            onClick={onDownloadPDF}
            className="px-6 py-3 sm:px-10 sm:py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-base sm:text-lg rounded-xl shadow-xl transition duration-150"
          >
            ⬇️ Download Receipt (PDF)
          </button>
        </div>

      </div>
    </div>
  );
};

// ------------------- DATA LOADING UTILITIES -------------------
const loadPassengerData = () => {
  const passengerData = localStorage.getItem("passengerData");
  return passengerData ? JSON.parse(passengerData) : { name: "", contact: "", cnic: "", email: "" };
};

const loadSearchFilters = () => {
  const filters = localStorage.getItem("search_filters");
  return filters ? JSON.parse(filters) : null;
};

const loadBookingPayload = () => {
  const payload = localStorage.getItem("booking_payload");
  return payload ? JSON.parse(payload) : null;
};

const loadFromLocation = () => {
  return localStorage.getItem("selectedToLocation") || "";
};

const loadVehicleData = () => {
  const vehicle = localStorage.getItem("selectedVehicle");
  return vehicle ? JSON.parse(vehicle) : null;
};

const loadServiceDetails = () => {
  return {
    durationType: localStorage.getItem("durationType"),
    durationValue: localStorage.getItem("durationValue"),
    serviceType: localStorage.getItem("serviceType"),
    calculatedFare: localStorage.getItem("calculatedFare")
  };
};

// Helper function to convert base64 to File
const base64ToFile = (base64String, filename) => {
  try {
    // Remove the data URL prefix if present
    const base64Data = base64String.split(',')[1] || base64String;
    
    // Decode base64
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: 'image/png' });
    return new File([blob], filename, { type: 'image/png' });
  } catch (error) {
    console.error("Error converting base64 to file:", error);
    return null;
  }
};

// ------------------- MAIN COMPONENT -------------------
export default function PaymentPage(props) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get props from wrapper
  const vehicleDataFromCard = props.vehicleDataFromCard;
  const isDirectBooking = props.isDirectBooking;
  const bookingDataFromProps = props.bookingData;
  const onBack = props.onBack;
  
  const [transport, setTransport] = useState(null);
  const [toLocation, setToLocation] = useState("");
  const [passenger, setPassenger] = useState({ name: "", contact: "", cnic: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState(0);
  
  // MANUAL PAYMENT STATES
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState(null);
  
  const receiptRef = useRef(null);

  // ------------------- ENHANCED DATA LOADING -------------------
  useEffect(() => {
    const loadAllData = () => {
      console.log("🔄 Loading data in PaymentPage...");
      console.log("Props received:", { bookingDataFromProps, vehicleDataFromCard, isDirectBooking });
      console.log("Location state:", location.state);
      
      // Load all possible data sources
      const storedVehicle = JSON.parse(localStorage.getItem("selectedVehicle") || "null");
      const directBookingOffer = JSON.parse(localStorage.getItem("directBookingOffer") || "null");
      const bookingPayload = JSON.parse(localStorage.getItem("booking_payload") || "null");
      const searchFilters = loadSearchFilters();
      const passengerData = loadPassengerData();
      
      console.log("📊 All Data Sources:", {
        storedVehicle,
        directBookingOffer,
        bookingPayload,
        searchFilters,
        passengerData,
        bookingDataFromProps
      });

      // **CRITICAL: Get the booking data from the highest priority source**
      let finalBookingData = null;
      
      if (bookingDataFromProps) {
        finalBookingData = bookingDataFromProps;
      } else if (location.state?.bookingData) {
        console.log("🎯 Using booking data from LOCATION STATE");
        finalBookingData = location.state.bookingData;
      } else if (bookingPayload) {
        console.log("🎯 Using booking data from LOCALSTORAGE");
        finalBookingData = bookingPayload;
      } else if (storedVehicle) {
        console.log("🎯 Using stored vehicle data");
        finalBookingData = storedVehicle;
      }
      
      console.log("🎯 FINAL BOOKING DATA (before processing):", finalBookingData);
      
      if (!finalBookingData) {
        console.error("❌ No booking data found!");
        alert("No booking data found. Please start over.");
        navigate("/");
        return;
      }

      // **SPECIAL HANDLING FOR OLD CARD (VehicalBookingCard) DATA**
      let paymentDataFromOldCard = null;
      
      // Check if this is from the old card by looking for specific fields
      if (finalBookingData._original_data || finalBookingData._fromVehicalBookingCard) {
        console.log("🔄 Detected data from OLD CARD (VehicalBookingCard)");
        
        const originalData = finalBookingData._original_data || finalBookingData;
        
        paymentDataFromOldCard = {
          payment_type: originalData.payment_type || vehicleDataFromCard.payment_type || "BOTH",
          easypaisa_name: originalData.easypaisa_name || "",
          easypaisa_number: originalData.easypaisa_number || "",
          jazzcash_name: originalData.jazzcash_name || "",
          jazzcash_number: originalData.jazzcash_number || "",
          bank_name: originalData.bank_name || "",
          bank_account_title: originalData.bank_account_title || "",
          bank_account_number: originalData.bank_account_number || "",
          bank_iban: originalData.bank_iban || "",
        };
        
        console.log("💰 Payment data from old card:", paymentDataFromOldCard);
      }

      // Set passenger data
      setPassenger({
        name: finalBookingData.passenger_name || passengerData.name || "",
        contact: finalBookingData.passenger_contact || finalBookingData.passenger_phone || passengerData.contact || "",
        cnic: finalBookingData.passenger_cnic || passengerData.cnic || "",
        email: finalBookingData.passenger_email || passengerData.email || ""
      });

      // **BUILD TRANSPORT OBJECT WITH ALL REQUIRED FIELDS**
      const transportData = {
        // **CRITICAL: Vehicle ID (MUST BE PRESENT)**
        vehicle: finalBookingData.vehicle || 
                finalBookingData.vehicle_id || 
                storedVehicle?.vehicle ||
                storedVehicle?.id,
        
        vehicle_id: finalBookingData.vehicle_id || 
                   finalBookingData.vehicle || 
                   storedVehicle?.vehicle_id ||
                   storedVehicle?.id,
        
        // Company ID
        company: finalBookingData.company || 
                finalBookingData.company_id || 
                storedVehicle?.company,
        
        company_id: finalBookingData.company_id || 
                   finalBookingData.company || 
                   storedVehicle?.company_id,
        
        // Driver ID
        driver: finalBookingData.driver || 
               finalBookingData.driver_id || 
               storedVehicle?.driver,
        
        driver_id: finalBookingData.driver_id || 
                  finalBookingData.driver || 
                  storedVehicle?.driver_id,
        
        // Vehicle details
        vehicle_image: finalBookingData.vehicle_image || 
                      storedVehicle?.vehicle_image || 
                      "https://placehold.co/400x220/82D8CC/ffffff?text=Vehicle+Image",
        
        vehicle_number: finalBookingData.vehicle_number || 
                       storedVehicle?.vehicle_number || 
                       "N/A",
        
        vehicle_type: finalBookingData.vehicle_type || 
                     storedVehicle?.vehicle_type || 
                     "N/A",
        
        // Driver details
        driver_image: finalBookingData.driver_image || 
                     storedVehicle?.driver_image || 
                     "https://placehold.co/400x220/55D6C2/ffffff?text=Driver+Image",
        
        driver_name: finalBookingData.driver_name || 
                    storedVehicle?.driver_name || 
                    "Driver N/A",
        
        driver_contact: finalBookingData.driver_contact || 
                       storedVehicle?.driver_contact || 
                       "N/A",
        
        // Company details
        company_name: finalBookingData.company_name || 
                     storedVehicle?.company_name || 
                     "Transport Company",
        
        // Trip details
        arrival_date: finalBookingData.arrival_date || 
                     searchFilters?.arrival_date ||
                     new Date().toISOString().split('T')[0],
        
        arrival_time: finalBookingData.arrival_time || 
                     searchFilters?.arrival_time || 
                     "12:00",
        
        service_type: finalBookingData.service_type || "long_drive",
        duration_type: finalBookingData.duration_type || 
                      finalBookingData.durationType ||
                      "hourly",
        
        duration_value: finalBookingData.duration_value || 
                       finalBookingData.durationValue ||
                       1,
        
        // Location details
        to_location: finalBookingData.to_location || 
                    loadFromLocation() || 
                    "Destination",
        
        from_location: finalBookingData.from_location || 
                      finalBookingData.pickup_location || 
                      "Pickup Location",
        
        // Fare details
        rate_per_km: finalBookingData.rate_per_km || 0,
        fixed_fare: finalBookingData.fixed_fare || 0,
        per_hour_rate: finalBookingData.per_hour_rate || 0,
        per_day_rate: finalBookingData.per_day_rate || 0,
        weekly_rate: finalBookingData.weekly_rate || 0,
        
        // Additional charges
        night_charge: finalBookingData.night_charge || 0,
        mountain_surcharge: finalBookingData.mountain_surcharge || 0,
        
        // **PAYMENT DETAILS - FIXED: Use paymentDataFromOldCard if available, then fallback**
        payment_type: paymentDataFromOldCard?.payment_type || 
                     finalBookingData.payment_type ||
                     vehicleDataFromCard.payment_type ||
                     "BOTH",
        
        easypaisa_name: paymentDataFromOldCard?.easypaisa_name || 
                       finalBookingData.easypaisa_name || 
                       vehicleDataFromCard.easypaisa_name || 
                       "",
        
        easypaisa_number: paymentDataFromOldCard?.easypaisa_number || 
                         finalBookingData.easypaisa_number || 
                         vehicleDataFromCard.easypaisa_number || 
                         "",
        
        jazzcash_name: paymentDataFromOldCard?.jazzcash_name || 
                      finalBookingData.jazzcash_name || 
                      vehicleDataFromCard.jazzcash_name || 
                      "",
        
        jazzcash_number: paymentDataFromOldCard?.jazzcash_number || 
                        finalBookingData.jazzcash_number || 
                        vehicleDataFromCard.jazzcash_number || 
                        "",
        
        bank_name: paymentDataFromOldCard?.bank_name || 
                  finalBookingData.bank_name || 
                  vehicleDataFromCard.bank_name || 
                  "",
        
        bank_account_title: paymentDataFromOldCard?.bank_account_title || 
                           finalBookingData.bank_account_title || 
                           vehicleDataFromCard.bank_account_title || 
                           "",
        
        bank_account_number: paymentDataFromOldCard?.bank_account_number || 
                            finalBookingData.bank_account_number || 
                            vehicleDataFromCard.bank_account_number || 
                            "",
        
        bank_iban: paymentDataFromOldCard?.bank_iban || 
                  finalBookingData.bank_iban || 
                  vehicleDataFromCard.bank_iban || 
                  "",
        
        // Offer type
        offer_type: finalBookingData.offer_type || "whole_hire",
      };
      
      console.log("🚗 TRANSPORT DATA (with payment info):", {
        vehicleId: transportData.vehicle_id,
        vehicle: transportData.vehicle,
        companyId: transportData.company_id,
        driverId: transportData.driver_id,
        paymentType: transportData.payment_type,
        hasEasypaisa: !!transportData.easypaisa_number,
        hasJazzcash: !!transportData.jazzcash_number,
        hasBank: !!transportData.bank_name
      });
      
      setTransport(transportData);
      
      // Set calculated fare
      const fare = finalBookingData.total_amount || 
                  finalBookingData.calculatedFare || 
                  finalBookingData.fixed_fare ||
                  finalBookingData.rate_per_km ||
                  0;
      
      setCalculatedFare(fare);
      setToLocation(transportData.to_location);
      
      setIsLoading(false);
    };
    
    loadAllData();
  }, [location, vehicleDataFromCard, isDirectBooking, bookingDataFromProps, navigate]);

  // ------------------- PAYMENT HANDLER (FIXED VERSION) -------------------
  const handlePayment = (method) => {
    if (!transport || !passenger.name || !passenger.contact) {
      alert("Please ensure trip details and passenger info are loaded.");
      return;
    }

    // **CRITICAL: Check if vehicle_id exists**
    if (!transport.vehicle_id && !transport.vehicle) {
      console.error("❌ ERROR: Vehicle ID is missing in transport data!");
      console.error("Transport object:", transport);
      alert("Error: Vehicle information is incomplete. Please try again.");
      return;
    }

    const finalFare = calculatedFare > 0 ? calculatedFare : (transport?.rate_per_km || transport?.fixed_fare || 0);
    const isFull = transport.offer_type === "whole_hire";

    // **FIXED: Prepare booking payload with ALL required fields**
    const bookingPayload = {
      // **REQUIRED IDs - Use vehicle_id for backend**
      vehicle_id: transport.vehicle_id || transport.vehicle,
      vehicle: transport.vehicle_id || transport.vehicle,
      
      company_id: transport.company_id || transport.company,
      company: transport.company_id || transport.company,
      
      driver_id: transport.driver_id || transport.driver,
      driver: transport.driver_id || transport.driver,
      
      // **Trip details**
      from_location: transport.from_location || transport.location_address || transport.route_from,
      to_location: toLocation || transport.to_location || transport.route_to,
      arrival_date: transport.arrival_date,
      arrival_time: transport.arrival_time,
      
      // **Booking type**
      is_full_vehicle: isFull,
      seats_booked: isFull ? 0 : 1,
      
      // **Payment details**
      total_amount: finalFare,
      calculatedFare: finalFare,
      currency: "PKR",
      
      // **Passenger details**
      passenger_name: passenger.name,
      passenger_phone: passenger.contact,
      passenger_contact: passenger.contact,
      passenger_cnic: passenger.cnic,
      passenger_email: passenger.email,
      
      // **Snapshot details**
      company_name: transport.company_name,
      driver_name: transport.driver_name,
      driver_contact: transport.driver_contact,
      vehicle_type: transport.vehicle_type,
      vehicle_number: transport.vehicle_number,
      vehicle_image: transport.vehicle_image,
      driver_image: transport.driver_image,
      
      // **Payment method**
      payment_method: method,
      payment_type: transport.payment_type || vehicleDataFromCard.payment_type || "BOTH",
      service_type: transport.service_type,
      
      // **Additional fields**
      duration_type: transport.duration_type,
      duration_value: transport.duration_value,
      rate_per_km: transport.rate_per_km,
      fixed_fare: transport.fixed_fare,
      per_hour_rate: transport.per_hour_rate,
      per_day_rate: transport.per_day_rate,
      weekly_rate: transport.weekly_rate,
      night_charge: transport.night_charge,
      mountain_surcharge: transport.mountain_surcharge,
      
      // **Payment info - FIXED: Always include these (even if empty)**
      easypaisa_name: transport.easypaisa_name || "",
      easypaisa_number: transport.easypaisa_number || "",
      jazzcash_name: transport.jazzcash_name || "",
      jazzcash_number: transport.jazzcash_number || "",
      bank_name: transport.bank_name || "",
      bank_account_title: transport.bank_account_title || "",
      bank_account_number: transport.bank_account_number || "",
      bank_iban: transport.bank_iban || "",
      
      // **Generate a temporary ID**
      booking_id: `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      booking_reference: `REF-${Date.now()}`,
    };

    console.log("📦 BOOKING PAYLOAD for", method, ":", {
      vehicle_id: bookingPayload.vehicle_id,
      company_id: bookingPayload.company_id,
      driver_id: bookingPayload.driver_id,
      total_amount: bookingPayload.total_amount,
      payment_type: bookingPayload.payment_type,
      hasEasypaisa: !!bookingPayload.easypaisa_number,
      hasJazzcash: !!bookingPayload.jazzcash_number,
      hasBank: !!bookingPayload.bank_name
    });

    if (method === "CASH") {
      console.log("💰 CASH payment selected. Making booking...");
      makeBookingWithJSON(bookingPayload);
    }

    if (method === "MANUAL") {
      const paymentData = {
        company_name: transport.company_name,
        payment_type: transport.payment_type || vehicleDataFromCard.payment_type || "BOTH",
        easypaisa_name: transport.easypaisa_name || "",
        easypaisa_number: transport.easypaisa_number || "",
        jazzcash_name: transport.jazzcash_name || "",
        jazzcash_number: transport.jazzcash_number || "",
        bank_name: transport.bank_name || "",
        bank_account_title: transport.bank_account_title || "",
        bank_account_number: transport.bank_account_number || "",
        bank_iban: transport.bank_iban || "",
        total_amount: finalFare,
      };
      
      console.log("💳 Manual payment data:", paymentData);
      
      // Store the booking payload temporarily
      localStorage.setItem("temp_booking_payload", JSON.stringify(bookingPayload));
      
      // Open the modal
      setManualPaymentData(paymentData);
      setManualModalOpen(true);
    }

    console.log("✅ Payment method selected:", method);
  };

  // ------------------- CASH PAYMENT (JSON) -------------------
  const makeBookingWithJSON = async (payload) => {
    if (isConfirming) return;
    
    setIsConfirming(true);
    
    try {
      console.log("🚀 Sending JSON booking request with payload:", {
        vehicle_id: payload.vehicle_id,
        company_id: payload.company_id,
        driver_id: payload.driver_id
      });
      
      const token = localStorage.getItem("access_token");
      
      const res = await axios.post(
        "/api/checkout/full-vehicle-booking/",
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const finalBookingData = { 
        ...payload, 
        ...res.data, 
        booking_id: res.data.booking_id || payload.booking_id 
      };
      setBookingSuccessData(finalBookingData);

      console.log("✅ Booking Success Response:", res.data);

      // Clear localStorage after successful booking
      localStorage.removeItem("booking_payload");
      localStorage.removeItem("directBookingOffer");
      localStorage.removeItem("selectedVehicle");
      localStorage.removeItem("temp_booking_payload");

    } catch (error) {
      console.error("❌ Booking API Error:", error.response?.data || error);
      
      let errorMessage = "Booking Failed! ";
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage += error.response.data.detail;
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 404) {
        errorMessage = "API endpoint not found. Check the URL.";
      } else {
        errorMessage += "Could not connect to server or an unknown error occurred.";
      }
      
      alert(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  // ------------------- MANUAL PAYMENT (FormData) -------------------
  const handleManualPaymentSuccess = (screenshotBase64) => {
    // 1. Retrieve the temporary booking payload
    const tempPayload = JSON.parse(localStorage.getItem("temp_booking_payload") || "{}");
    
    console.log("📸 Processing manual payment with screenshot...");
    
    // 2. Create FormData for the request
    const formData = new FormData();
    
    // Append all booking data as fields
    Object.keys(tempPayload).forEach(key => {
      // Skip screenshot field as we'll add it separately
      if (key !== 'screenshot') {
        formData.append(key, String(tempPayload[key]));
      }
    });
    
    // 3. Convert base64 to File and append
    const screenshotFile = base64ToFile(screenshotBase64, "payment_screenshot.png");
    if (screenshotFile) {
      formData.append('screenshot', screenshotFile);
    }
    
    // Ensure payment method is MANUAL
    formData.append('payment_method', 'MANUAL');
    
    console.log("📤 Manual payment form data created");
    
    // 4. Make the booking API call with FormData
    makeBookingWithFormData(formData);
    
    // 5. Close modal
    setManualModalOpen(false);
  };

  const makeBookingWithFormData = async (formData) => {
    if (isConfirming) return;
    
    setIsConfirming(true);
    
    try {
      console.log("🚀 Sending FormData booking request...");
      
      // Get auth token
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert("Please login to continue");
        setIsConfirming(false);
        return;
      }
      
      // Log form data for debugging
      console.log("📋 FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Use fetch instead of axios for better FormData handling
      const response = await fetch(
        "/api/checkout/full-vehicle-booking/",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData, browser sets it automatically
          },
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Booking successful:", data);
      
      const finalBookingData = { 
        ...Object.fromEntries(formData), // Convert FormData to object
        ...data, 
        booking_id: data.booking_id || data.booking_reference || `TEMP-${Date.now()}`,
        ticket_id: data.ticket_id || null
      };
      
      setBookingSuccessData(finalBookingData);
      
      // Clear localStorage
      localStorage.removeItem("temp_booking_payload");
      localStorage.removeItem("booking_payload");
      localStorage.removeItem("directBookingOffer");
      localStorage.removeItem("selectedVehicle");

    } catch (error) {
      console.error("❌ Booking API Error:", error);
      
      let errorMessage = "Booking Failed! ";
      if (error.message.includes("Server error")) {
        errorMessage = error.message;
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error.";
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };
  
  const handleDownloadPDF = () => {
    const receiptElement = document.getElementById('receipt-content');
    if (receiptElement) {
        generatePDF(receiptElement, `booking-receipt-${bookingSuccessData.booking_id}.pdf`);
    } else {
        alert("Receipt content not found for download.");
    }
  };

  // ------------------- CONDITIONAL RENDERING ----------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading booking details...</p>
        </div>
      </div>
    );
  }
  
  if (bookingSuccessData) {
      return <ReceiptPage bookingData={bookingSuccessData} onDownloadPDF={handleDownloadPDF} />;
  }

  // Calculate display fare
  const displayFare = calculatedFare > 0 ? calculatedFare : (transport?.rate_per_km || transport?.fixed_fare || 0);

  // Get image URLs with fallbacks
  const vehicleImageUrl = transport?.vehicle_image || 
                         "https://placehold.co/400x220/82D8CC/ffffff?text=Vehicle+Image";
  
  const driverImageUrl = transport?.driver_image || 
                        "https://placehold.co/400x220/55D6C2/ffffff?text=Driver+Image";

  // ------------------- PAYMENT PAGE UI ----------------------
  return (
    <>
      {/* MANUAL PAYMENT MODAL */}
      {manualModalOpen && manualPaymentData && (
        <ManualPaymentModal
          onClose={() => setManualModalOpen(false)}
          paymentData={manualPaymentData}
          onSuccess={handleManualPaymentSuccess}
        />
      )}

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-inter">
        {/* Back Button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </button>
        )}

        <div className="max-w-4xl mx-auto pt-12">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2 text-center border-b-4 border-teal-500 pb-2 inline-block">
            Confirm Your Booking & Payment
          </h1>
          <p className="text-center text-gray-600 mb-6 sm:mb-10 text-sm sm:text-base">
            Review the trip summary before finalizing your payment.
          </p>
          
          {/* ------------------- MAIN SUMMARY CARD ------------------- */}
          {transport && (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-4 sm:p-6 bg-teal-600 text-white">
                <h2 className="text-lg sm:text-xl font-bold mb-1 flex items-center flex-wrap">
                  {transport.company_name || "Transport Company"}
                  {transport.offer_type === "whole_hire" && (
                    <span className="ml-2 sm:ml-3 text-xs font-semibold px-2 sm:px-3 py-1 bg-white bg-opacity-20 rounded-full">
                      WHOLE HIRE
                    </span>
                  )}
                  {isDirectBooking && (
                    <span className="ml-2 sm:ml-3 text-xs font-semibold px-2 sm:px-3 py-1 bg-blue-500 bg-opacity-20 rounded-full">
                      DIRECT BOOKING
                    </span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm opacity-90">
                  <strong>{transport.from_location || transport.location_address || transport.route_from || "Pickup Location"}</strong> 
                  {" to "}
                  <strong>{toLocation || transport.to_location || transport.route_to || "Destination"}</strong>
                </p>
              </div>

              <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                
                {/* ------------------- Vehicle + Driver Media ------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                  {/* VEHICLE */}
                  <div className="flex flex-col items-center bg-gray-50 p-3 sm:p-4 rounded-xl shadow-inner">
                    <h3 className="font-bold text-base sm:text-lg text-gray-700 mb-2 sm:mb-3">Vehicle Details</h3>
                    <img
                      src={vehicleImageUrl}
                      className="w-full h-40 sm:h-48 object-cover rounded-xl border-4 border-white shadow-lg"
                      alt="Vehicle"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x220/82D8CC/ffffff?text=Vehicle+Image";
                      }}
                    />
                    <div className="mt-2 sm:mt-3 text-center">
                      <p className="text-sm sm:text-base font-semibold text-gray-700">
                        No: {transport.vehicle_number || "N/A"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 capitalize">
                        Type: {transport.vehicle_type || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {transport.vehicle_id || transport.vehicle || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* DRIVER */}
                  <div className="flex flex-col items-center bg-gray-50 p-3 sm:p-4 rounded-xl shadow-inner">
                    <h3 className="font-bold text-base sm:text-lg text-gray-700 mb-2 sm:mb-3">Driver Details</h3>
                    <img
                      src={driverImageUrl}
                      className="w-full h-40 sm:h-48 object-cover rounded-xl border-4 border-white shadow-lg"
                      alt="Driver"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x220/55D6C2/ffffff?text=Driver+Image";
                      }}
                    />
                    <div className="mt-2 sm:mt-3 text-center">
                      <p className="text-sm sm:text-base font-semibold text-gray-700">
                        {transport.driver_name || transport.driver_name_snapshot || "Driver N/A"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Contact: {transport.driver_contact || transport.driver_contact_snapshot || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ------------------- Trip Details ------------------- */}
                <div className="bg-teal-50 p-3 sm:p-4 rounded-xl border border-teal-100">
                  <h3 className="font-bold text-base sm:text-lg text-teal-800 mb-2 sm:mb-3 border-b border-teal-200 pb-2">
                    Trip & Rate Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <InfoPill label="Arrival Date" value={transport.arrival_date} icon="📅" />
                    <InfoPill label="Arrival Time" value={transport.arrival_time} icon="⏰" />
                    <InfoPill 
                      label="Service Type" 
                      value={transport.service_type ? transport.service_type.replace('_', ' ') : "N/A"} 
                      icon="🚗" 
                    />
                    {transport.service_type === "long_drive" && transport.duration_type && (
                      <InfoPill 
                        label="Duration" 
                        value={`${transport.duration_value} ${transport.duration_type}`} 
                        icon="⏱️" 
                      />
                    )}
                  </div>
                  {transport.night_charge > 0 && (
                    <div className="mt-3 text-sm text-blue-600">
                      Includes night charge: Rs. {transport.night_charge}
                    </div>
                  )}
                  {transport.mountain_surcharge > 0 && (
                    <div className="mt-1 text-sm text-green-600">
                      Includes mountain surcharge: Rs. {transport.mountain_surcharge}
                    </div>
                  )}
                </div>

                {/* ------------------- Fare Details ------------------- */}
                <div className="bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100">
                  <h3 className="font-bold text-base sm:text-lg text-amber-800 mb-2 sm:mb-3 border-b border-amber-200 pb-2">
                    Fare Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InfoPill 
                      label="Total Amount" 
                      value={`${displayFare.toLocaleString()} PKR`} 
                      icon="💰" 
                    />
                    <InfoPill 
                      label="Rate Type" 
                      value={transport.service_type === "long_drive" ? `Per ${transport.duration_type}` : "Fixed Fare"} 
                      icon="📊" 
                    />
                  </div>
                  {transport.service_type === "long_drive" && (
                    <p className="text-xs text-amber-700 mt-2 text-center">
                      Calculated for {transport.duration_value} {transport.duration_type}{transport.duration_value > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* ------------------- Passenger Info ------------------- */}
                <div className="bg-sky-50 p-3 sm:p-4 rounded-xl border border-sky-100">
                  <h3 className="font-bold text-base sm:text-lg text-sky-800 mb-2 sm:mb-3 border-b border-sky-200 pb-2">
                    Passenger Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <InfoPill label="Name" value={passenger.name} icon="👤" />
                    <InfoPill label="Phone" value={passenger.contact} icon="📱" />
                    <InfoPill label="CNIC" value={passenger.cnic} icon="💳" />
                    <InfoPill label="Email" value={passenger.email} icon="📧" />
                  </div>
                </div>

                {/* ------------------- Payment Info ------------------- */}
                <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-100">
                  <h3 className="font-bold text-base sm:text-lg text-green-800 mb-2 sm:mb-3 border-b border-green-200 pb-2">
                    Payment Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {transport.payment_type === "BOTH" && (
                      <>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Cash Payment</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Online Payment</span>
                      </>
                    )}
                    {transport.payment_type === "CASH" && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Cash Only</span>
                    )}
                    {transport.payment_type === "ADVANCE" && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Online Only</span>
                    )}
                  </div>
                  
                  {/* Show available payment methods */}
                  <div className="mt-3 text-xs text-gray-600">
                    {transport.easypaisa_number && (
                      <p>Easypaisa: {transport.easypaisa_number}</p>
                    )}
                    {transport.jazzcash_number && (
                      <p>JazzCash: {transport.jazzcash_number}</p>
                    )}
                    {transport.bank_account_number && (
                      <p>Bank: {transport.bank_name} - {transport.bank_account_number}</p>
                    )}
                  </div>
                </div>

                <p className="text-center pt-3 sm:pt-4 text-xs sm:text-sm font-medium text-red-500">
                  ⚠️ Please double-check all details before confirming.
                </p>

              </div>
            </div>
          )}

          {/* ------------------- PAYMENT BUTTONS ------------------- */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
              Choose Payment Method
            </h2>
            
            {/* Priority: vehicleDataFromCard > transport */}
            {(() => {
              // Get payment types from both sources
              const transportPaymentType = transport?.payment_type;
              const cardPaymentType = vehicleDataFromCard?.payment_type;
              
              // FIX: Give priority to vehicleDataFromCard if it exists
              const finalPaymentType = cardPaymentType || transportPaymentType;
              
              console.log("💰 Payment Types:", {
                transport: transportPaymentType,
                card: cardPaymentType,
                final: finalPaymentType
              });
              
              return (
                <div className="space-y-3">
                  {/* CASH PAYMENT BUTTON */}
                  {finalPaymentType === "BOTH" || finalPaymentType === "CASH" ? (
                    <button
                      onClick={() => handlePayment("CASH")}
                      disabled={isConfirming}
                      className={`w-full flex items-center justify-center py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition duration-200 border-2 ${
                        isConfirming
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-70 border-gray-400"
                          : "bg-white text-green-700 border-green-700 hover:bg-green-50 shadow-md"
                      }`}
                    >
                      <Wallet className="h-6 w-6 mr-2" /> Cash On Counter
                    </button>
                  ) : null}
                  
                  {/* MANUAL PAYMENT BUTTON */}
                  {finalPaymentType === "BOTH" || finalPaymentType === "ADVANCE" || finalPaymentType === "ONLINE" ? (
                    <button
                      onClick={() => handlePayment("MANUAL")}
                      disabled={isConfirming}
                      className={`w-full flex items-center justify-center py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold text-white transition duration-200 shadow-xl ${
                        isConfirming
                          ? "bg-blue-400 cursor-not-allowed opacity-70"
                          : "bg-blue-700 hover:bg-blue-800"
                      }`}
                    >
                      <CreditCard className="h-6 w-6 mr-2" /> Pay Now (Manual)
                    </button>
                  ) : null}
                  
                  {/* Loading indicator */}
                  {isConfirming && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Processing booking...</p>
                    </div>
                  )}
                  
                  {/* If no payment methods available */}
                  {!["BOTH", "CASH", "ADVANCE", "ONLINE"].includes(finalPaymentType) && (
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-700">No payment methods available for this booking.</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  );
}