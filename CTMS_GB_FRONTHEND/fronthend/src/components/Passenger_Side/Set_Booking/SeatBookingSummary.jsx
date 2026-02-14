import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";

export default function BookingSummary({
  passengerInfo,
  selectedSeats,
  transport,
  paymentType,
  setStep,
  manualPaymentScreenshot,
}) {
  const [showTicket, setShowTicket] = useState(false);
  const [qrData, setQrData] = useState("");
  const [bookingData, setBookingData] = useState(null);
  const [savedScreenshot, setSavedScreenshot] = useState(manualPaymentScreenshot || null);
  const ticketRef = useRef();

  useEffect(() => {
    if (manualPaymentScreenshot && !savedScreenshot) {
      setSavedScreenshot(manualPaymentScreenshot);
    }
  }, [manualPaymentScreenshot]);
  // ---------------- PDF DOWNLOAD ----------------
const handleDownload = async () => {
  const element = ticketRef.current;
  if (!element) return;

  try {
    // Reset element's width for consistent PDF generation
    const originalWidth = element.style.width;
    const originalOverflow = element.style.overflow;
    
    // Set fixed width for PDF generation
    element.style.width = '100%';
    element.style.overflow = 'visible';

    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 3, // Higher quality
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure cloned element also has correct styles
        const clonedElement = clonedDoc.getElementById('receipt-content');
        if (clonedElement) {
          clonedElement.style.width = '100%';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.border = 'none';
          clonedElement.style.boxShadow = 'none';
        }
      }
    });

    // Restore original styles
    element.style.width = originalWidth;
    element.style.overflow = originalOverflow;

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10; // Top margin
    
    // Add image to PDF
    pdf.addImage(
      imgData, 
      "PNG", 
      imgX, 
      imgY, 
      imgWidth * ratio, 
      imgHeight * ratio,
      undefined,
      "FAST"
    );

    // Save the PDF
    pdf.save(`ticket_${passengerInfo?.name || "passenger"}_${new Date().getTime()}.pdf`);
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please try again.");
  }
};

  // ---------------- CONFIRM BOOKING ----------------
  const handleConfirm = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in!");
      return;
    }

    const isManual = paymentType.toLowerCase().includes("manual");
    let bodyToSend;
    let headersToSend = {
      Authorization: `Bearer ${token}`,
    };

    if (isManual && savedScreenshot) {
      bodyToSend = new FormData();
      bodyToSend.append("vehicle_id", transport.vehicle);
      bodyToSend.append("company_id", transport.company);
      selectedSeats.forEach((seat) => {
        bodyToSend.append("seat_numbers", Number(seat));
      });
      bodyToSend.append("screenshot", savedScreenshot);
      bodyToSend.append("passenger_name", passengerInfo.name);
      bodyToSend.append("passenger_phone", passengerInfo.contact);
      bodyToSend.append("passenger_email", passengerInfo.email);
      bodyToSend.append("passenger_cnic", passengerInfo.cnic);
      bodyToSend.append("from_location", transport.route_from);
      bodyToSend.append("to_location", transport.route_to);
      bodyToSend.append("arrival_date", transport.arrival_date);
      bodyToSend.append("arrival_time", transport.arrival_time);
      bodyToSend.append("total_amount", selectedSeats.length * transport.price_per_seat);
      bodyToSend.append("currency", "PKR");
      bodyToSend.append("method", "MANUAL");
    } else {
      headersToSend["Content-Type"] = "application/json";
      bodyToSend = JSON.stringify({
        vehicle_id: transport.vehicle,
        company_id: transport.company,
        seat_numbers: selectedSeats,
        passenger_name: passengerInfo.name,
        passenger_phone: passengerInfo.contact,
        passenger_email: passengerInfo.email,
        passenger_cnic: passengerInfo.cnic,
        from_location: transport.route_from,
        to_location: transport.route_to,
        arrival_date: transport.arrival_date,
        arrival_time: transport.arrival_time,
        total_amount: selectedSeats.length * transport.price_per_seat,
        currency: "PKR",
        method: "CASH",
      });
    }

    try {
      // "http://localhost:8000/api/checkout/bookings/"
      const response = await fetch("/api/checkout/bookings/", {
        method: "POST",
        headers: headersToSend,
        body: bodyToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(errorText);
        alert("Booking failed!");
        return;
      }

      const booking = await response.json();
      const paymentStatus = isManual ? "Pending Verification" : "Paid";
      const bookingStatus = isManual ? "Reserved" : "Confirmed";

      setBookingData({ ...booking, paymentStatus, bookingStatus });
      
      // FIXED: Only store essential data in QR code
      const qrPayload = {
        id: booking.id,
        p: passengerInfo.name.substring(0, 10), // Short name
        s: selectedSeats.join(","),
        a: selectedSeats.length * transport.price_per_seat,
        d: transport.arrival_date.replace(/-/g, ""), // Remove dashes
        t: transport.arrival_time.replace(/:/g, ""), // Remove colons
        f: transport.route_from.substring(0, 3), // First 3 letters
        to: transport.route_to.substring(0, 3) // First 3 letters
      };
      
      setQrData(JSON.stringify(qrPayload));
      setShowTicket(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  // -------------- TICKET VIEW (RECEIPT PAGE) -----------------
  if (showTicket && bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 sm:p-6 font-sans">
        <div className="max-w-md mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-3xl font-extrabold text-green-700 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              Your journey is booked. Please find your receipt below.
            </p>
          </div>

          {/* RECEIPT CARD */}
          <div 
            id="receipt-content" 
            ref={ticketRef}
            className="bg-white rounded-3xl shadow-2xl border-4 border-teal-500 overflow-hidden"
            style={{ width: '100%', minHeight: 'auto' }}
          >
            
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                {/* Left side - Receipt Info */}
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <h4 className="text-2xl font-bold">OFFICIAL RECEIPT</h4>
                  <p className="text-sm opacity-90 mt-1">
                    Booking ID: <span className="font-mono font-bold">{bookingData.id || "N/A"}</span>
                  </p>
                  <p className="text-xs mt-2">{transport?.company_name || "Travel Company"}</p>
                </div>

                {/* Right side - Payment Instructions */}
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg max-w-xs">
                  <h3 className="font-bold text-xs mb-1 text-amber-300">📌 Payment Instructions:</h3>
                  <ul className="text-xs text-white/90 space-y-1">
                    <li className="flex items-start gap-1">
                      <span className="text-green-300 mt-0.5">1.</span>
                      <span>Ticket verification: 10-30 minutes via email</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-red-300 mt-0.5">2.</span>
                      <span>Cash payment must be made 5 hours before departure</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              
              {/* Trip Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-teal-700">📍 TRIP SUMMARY</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-lg">📍</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-semibold">{transport.route_from}</p>
                    </div>
                  {/* </div> */}
                  {/* <div className="flex items-center gap-3"> */}
                    <span className="text-green-500 text-lg">📍</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-semibold">{transport.route_to}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">📅</span>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold">{transport.arrival_date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">🕒</span>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold">{transport.arrival_time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-dashed border-gray-300" />

              {/* Passenger Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-teal-700">👤 PASSENGER DETAILS</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">👤</span>
                      <p className="text-sm text-gray-500">Name</p>
                    </div>
                    <p className="font-semibold">{passengerInfo?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">📞</span>
                      <p className="text-sm text-gray-500">Phone</p>
                    </div>
                    <p className="font-semibold">{passengerInfo?.contact}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">🪪</span>
                      <p className="text-sm text-gray-500">CNIC</p>
                    </div>
                    <p className="font-semibold">{passengerInfo?.cnic || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">✉️</span>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                    <p className="font-semibold">{passengerInfo?.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              <hr className="border-dashed border-gray-300" />

              {/* Booking Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-teal-700">🎫 BOOKING DETAILS</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-teal-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-teal-600">💺</span>
                      <p className="text-sm text-gray-500">Seats</p>
                    </div>
                    <p className="text-xl font-bold text-teal-700">{selectedSeats.join(", ")}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-600">💰</span>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                    <p className="text-xl font-bold text-blue-700">
                      {selectedSeats.length * transport.price_per_seat} PKR
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-semibold">{paymentType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-semibold ${bookingData.paymentStatus === "Pending Verification" ? "text-amber-600" : "text-green-600"}`}>
                      {bookingData.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Proof (Manual Payment Only) */}
              {savedScreenshot && (
                <>
                  <hr className="border-dashed border-gray-300" />
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-amber-700">📸 PAYMENT PROOF</h3>
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
                      <img
                        src={URL.createObjectURL(savedScreenshot)}
                        className="w-full rounded-lg border-2 border-amber-300"
                        alt="Payment Proof"
                      />
                      <p className="text-center text-sm text-amber-700 font-medium mt-2">
                        ⚠️ Payment verification pending
                      </p>
                    </div>
                  </div>
                </>
              )}
              <hr className="border-dashed border-gray-300" />

              {/* QR Code */}
              <div className="text-center space-y-3">
                {/* <h3 className="text-lg font-bold text-gray-700">🔐 VERIFICATION CODE</h3> */}
                <div className="flex justify-center">
                  <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-300">
                    {/* FIXED: Add error boundary and smaller data */}
                    {qrData && (
                      <QRCodeCanvas 
                        value={qrData} 
                        size={140}
                        bgColor="#ffffff"
                        fgColor="#0f766e"
                        level="L" // Lower error correction = more data capacity
                        includeMargin={true}
                      />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Scan this code at boarding time for verification
                </p>
              </div>

              {/* Receipt Footer */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <p>📅 Generated on: {new Date().toLocaleDateString()}</p>
                  <p>👥 Total Passengers: {selectedSeats.length}</p>
                </div>
                <p className="text-center text-xs text-gray-400 mt-3">
                  🙏 Thank you for choosing {transport?.company_name || "our service"}!
                </p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleDownload}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 w-full"
            >
              ⬇️
              Download Receipt (PDF)
            </button>
            <button
              onClick={() => window.print()}
              className="mt-4 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl shadow transition duration-300 w-full"
            >
              🖨️ Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------- BEFORE CONFIRMATION UI --------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 font-sans">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-2">
            {transport?.company_name}
          </h2>
          <p className="text-gray-600">Booking Summary</p>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-teal-100">
          
          {/* Passenger Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-teal-700 mb-4 flex items-center gap-2">
              👤
              Passenger Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold">{passengerInfo?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">CNIC</p>
                <p className="font-semibold">{passengerInfo?.cnic}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-semibold">{passengerInfo?.contact}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">{passengerInfo?.email}</p>
              </div>
            </div>
          </div>

          {/* Journey Details */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-teal-700 mb-4 flex items-center gap-2">
              🚌
              Journey Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-gray-600">Route</span>
                <span className="font-bold text-teal-700">
                  {transport.route_from} → {transport.route_to}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{transport.arrival_date}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold">{transport.arrival_time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Seats */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-teal-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Selected Seats</p>
                <p className="text-2xl font-bold text-teal-700">
                  {selectedSeats.join(", ")}
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-amber-700">
                  {selectedSeats.length * transport.price_per_seat} PKR
                </p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-600">Payment Method</p>
              <p className="font-bold text-lg">{paymentType}</p>
            </div>
          </div>

          {/* Manual Payment Screenshot */}
          {savedScreenshot && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <h4 className="font-bold text-green-700 mb-2">📸 Payment Screenshot Uploaded</h4>
              <img
                src={URL.createObjectURL(savedScreenshot)}
                className="w-full rounded-lg border-2 border-green-300"
                alt="Payment Proof"
              />
              <p className="text-center text-amber-600 font-medium mt-2">
                ⚠️ Will be verified manually
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold text-lg rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            ✅
            Confirm & Generate Ticket
          </button>
          
          <button
            onClick={() => setStep("seatSelection")}
            className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-xl shadow transition duration-300 flex items-center justify-center gap-3"
          >
            ↩️
            Back to Seat Selection
          </button>
        </div>

        {/* Terms Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By confirming, you agree to our terms and conditions. Ticket will be generated immediately.
        </p>
      </div>
    </div>
  );
}