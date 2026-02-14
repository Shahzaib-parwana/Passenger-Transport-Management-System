import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import SeatBookingForm from "../../Passenger_Side/Set_Booking/SeatBookingForm";
import SeatSelectionPage from "../../Passenger_Side/Set_Booking/SeatSelectionPage";
import ManualPaymentModal from "../../Passenger_Side/Payment/ManualPaymentPage";
import BookingSummary from "../../Passenger_Side/Set_Booking/SeatBookingSummary";


export default function SeatBookingFormWrapper() {
const location = useLocation();
const navigate = useNavigate();
const token = localStorage.getItem("access_token");

// --- States ---
const [step, setStep] = useState("passengerCardList");
const [selectedSeats, setSelectedSeats] = useState([]);
const [passengerInfo, setPassengerInfo] = useState(null);
const [paymentType, setPaymentType] = useState(null);
const [manualModalOpen, setManualModalOpen] = useState(false);
const [manualPaymentData, setManualPaymentData] = useState(null);
const [selectedTransport, setSelectedTransport] = useState(location.state?.transport || null);
const [finalBookingPayload, setFinalBookingPayload] = useState(null);

// --- Redirect if not logged in ---
if (!token || token.trim() === "") {
return (
<Navigate
to="/login"
replace
state={{ from: location.pathname, transport: selectedTransport }}
/>
);
}

// --- Redirect if no transport is selected ---
if (!selectedTransport && step !== "passengerCardList") {
return <Navigate to="/" replace />;
}

// --- Navigation helper ---
const next = (stepData) => {
  // stepData can be string or object { step, transport }
  if (typeof stepData === "string") {
    setStep(stepData);
    return;
  }

  if (typeof stepData === "object") {
    if (stepData.passengerInfo) setPassengerInfo(stepData.passengerInfo);
    if (stepData.paymentType) setPaymentType(stepData.paymentType);
    if (stepData.transport) setSelectedTransport(stepData.transport);
    if (stepData.step) setStep(stepData.step);
  }
};


// --- Base64 to File helper ---
function base64ToFile(base64Data, filename) {
const arr = base64Data.split(",");
const mime = arr[0].match(/:(.*?);/)[1];
const bstr = atob(arr[1]);
let n = bstr.length;
const u8arr = new Uint8Array(n);
while (n--) {
u8arr[n] = bstr.charCodeAt(n);
}
return new File([u8arr], filename, { type: mime });
}

// --- Manual Payment Success ---
const handleManualPaymentSuccess = (screenshotBase64) => {
if (!selectedTransport) return;

const payload = {
  seats: selectedSeats,
  amount: selectedSeats.length * (selectedTransport?.price_per_seat || 0),
  transport: selectedTransport,
  passengerInfo,
  paymentType: "Manual Payment",
  screenshot: screenshotBase64,
};

setFinalBookingPayload(payload);
setManualModalOpen(false);
setStep("summary");


};

return (
<>
{/* Passenger Card Form */}
{step === "passengerCardList" && (
<SeatBookingForm
transports={selectedTransport ? [selectedTransport] : []}
setStep={(stepData) =>
next(stepData.step, { ...stepData, transport: stepData.transport || selectedTransport })
}
setFilteredTransports={() => {}}
setPassengerInfo={(info) => setPassengerInfo(info)}
/>
)}

  {/* Seat Selection Page */}
  {step === "seatSelection" && selectedTransport && (
    <SeatSelectionPage
      transport={selectedTransport}
      selectedSeats={selectedSeats}
      setSelectedSeats={setSelectedSeats}
      setStep={setStep}
      onSelectPayment={(method, manualData) => {
        setPaymentType(method);

        if (method === "MANUAL") {
          setManualPaymentData(manualData);
          setManualModalOpen(true);
        } else {
          // Cash or other payment: directly go to summary
          const payload = {
            seats: selectedSeats,
            amount: selectedSeats.length * (selectedTransport?.price_per_seat || 0),
            transport: selectedTransport,
            passengerInfo,
            paymentType: method,
          };
          setFinalBookingPayload(payload);
          setStep("summary");
        }
      }}
    />
  )}

  {/* Manual Payment Modal */}
  {manualModalOpen && manualPaymentData && (
    <ManualPaymentModal
      onClose={() => setManualModalOpen(false)}
      paymentData={manualPaymentData}
      onSuccess={handleManualPaymentSuccess}
    />
  )}

  {/* Booking Summary */}
{step === "summary" && finalBookingPayload && (
<BookingSummary
passengerInfo={finalBookingPayload.passengerInfo || passengerInfo}
selectedSeats={finalBookingPayload.seats || selectedSeats}
transport={finalBookingPayload.transport || selectedTransport}
paymentType={finalBookingPayload.paymentType || paymentType}
manualPaymentScreenshot={finalBookingPayload.screenshot ? base64ToFile(finalBookingPayload.screenshot, "payment.png") : null}
setStep={setStep}
/>
)}
</>
);
}
