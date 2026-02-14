import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { QRCodeCanvas } from "qrcode.react";
import { History, Download, ArrowLeft, Ticket, Car, Clock, DollarSign, User, Calendar, Mail, Phone, Lock, Eye, Image as ImageIcon, X, Users, Truck, MapPin, Clock as ClockIcon, ChevronLeft, ChevronRight, Bus, CheckCircle, AlertCircle } from "lucide-react";

/* --- CONFIGURATION --- */
const API_BASE_URL = '/api';
const ADMIN_BOOKINGS_ENDPOINT = '/checkout/admin/manual-bookings/';
const TICKET_DETAIL_ENDPOINT = '/tickets/my-tickets/';
const COMPANY_TICKETS_ENDPOINT = '/tickets/company-tickets/';
const COMPANY_NAME = "PTMS";

/* --- CONSTANTS --- */
const BOOKING_STATUSES = {
  PENDING: 'PENDING',
  RESERVED: 'RESERVED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
};

const PAYMENT_STATUSES = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
};

/* --- UTILS --- */
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const safeDate = (d) => {
  if (!d) return '—';
  const t = Date.parse(d);
  if (Number.isNaN(t)) return '—';
  return new Date(t).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const safeTime = (t) => {
  if (!t) return '—';
  try {
    const [hours, minutes] = t.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
};

const formatDateForGroup = (dateString) => {
  if (!dateString || dateString === 'N/E') return 'Unknown Date';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate || startDate === 'N/A') return 'N/A';
  if (!endDate || endDate === 'N/A') return safeDate(startDate);
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return safeDate(startDate);
    }
    
    return `${safeDate(startDate)} - ${safeDate(endDate)}`;
  } catch (e) {
    return `${startDate} - ${endDate}`;
  }
};

const calculateReturnDate = (startDate, durationType, durationValue) => {
  if (!startDate || !durationType || !durationValue) return "N/A";
  
  try {
    const start = new Date(startDate);
    let end = new Date(start);
    const value = parseInt(durationValue) || 1;
    
    switch (durationType.toLowerCase()) {
      case 'hourly':
        end.setHours(end.getHours() + value);
        break;
      case 'daily':
        end.setDate(end.getDate() + value);
        break;
      case 'weekly':
        end.setDate(end.getDate() + (value * 7));
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + value);
        break;
      default:
        return "N/A";
    }
    
    return end.toISOString().split('T')[0];
  } catch (e) {
    console.error("Error calculating return date:", e);
    return "N/A";
  }
};

const getStatusClasses = (status, type = 'booking') => {
  switch (status) {
    case BOOKING_STATUSES.CONFIRMED:
    case PAYMENT_STATUSES.PAID:
      return 'bg-green-100 text-green-800 ring-green-600/20';
    case BOOKING_STATUSES.PENDING:
    case BOOKING_STATUSES.RESERVED:
    case PAYMENT_STATUSES.UNPAID:
      return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
    case BOOKING_STATUSES.CANCELLED:
    case BOOKING_STATUSES.FAILED:
    case BOOKING_STATUSES.EXPIRED:
      return 'bg-red-100 text-red-800 ring-red-600/20';
    case PAYMENT_STATUSES.REFUNDED:
      return 'bg-blue-100 text-blue-800 ring-blue-600/20';
    default:
      return 'bg-gray-100 text-gray-700 ring-gray-500/20';
  }
};

/* --- AUTH FETCH WRAPPER --- */
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('NO_TOKEN');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('Unauthorized. Redirecting to login.');
  }

  return response;
}

/* --- BookingRow Component --- */
const BookingRow = React.memo(function BookingRow({ booking, onOpenStatusModal, onHandleTicket, isActionDisabled, onViewScreenshot, bookingType }) {
  const isConfirmedAndPaid = booking.bookingStatus === BOOKING_STATUSES.CONFIRMED && booking.paymentStatus === PAYMENT_STATUSES.PAID;
  const hasScreenshot = booking.screenshotUrl && booking.screenshotUrl !== null;

  return (
    <tr className="hover:bg-gray-50 transition duration-150">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
        {booking.bookingId || booking.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
        <div className="text-xs text-gray-500">{booking.service}</div>
        {bookingType === 'fullVehicle' && booking.bookingDuration && (
          <div className="text-xs text-blue-600 mt-1">
            Duration: {booking.bookingDuration}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {booking.amount !== null ? currencyFormatter.format(booking.amount) : currencyFormatter.format(0)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClasses(booking.paymentStatus, 'payment')}`}>
          {booking.paymentStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClasses(booking.bookingStatus, 'booking')}`}>
          {booking.bookingStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-end items-stretch sm:items-center">
          <button
            onClick={() => onOpenStatusModal(booking)}
            className={`px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition duration-150 ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isActionDisabled}
            type="button"
          >
            Update Status
          </button>

          {hasScreenshot && (
            <button
              onClick={() => onViewScreenshot(booking.screenshotUrl)}
              className={`px-3 py-1 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-md shadow-purple-500/30 transition duration-150 flex items-center justify-center gap-1 ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isActionDisabled}
              type="button"
            >
              <ImageIcon className="w-4 h-4" /> View Screenshot
            </button>
          )}

          {isConfirmedAndPaid && (
            <button
              onClick={() => onHandleTicket(booking, 'view', bookingType)}
              className={`px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/30 transition duration-150 flex items-center justify-center gap-1 ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isActionDisabled}
              type="button"
            >
              <Eye className="w-4 h-4" /> View/Download Ticket
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

/* --- AdminTicketDetail Component --- */
const AdminTicketDetail = React.memo(({ ticket, ticketRef, handleDownload, closeTicketModal, bookingType }) => {
  const totalPrice = (ticket.seats?.length || 0) * (parseFloat(ticket.price_per_seat) || 0);
  const companyName = ticket.transport_company || COMPANY_NAME;
  const logoUrl = null;

  // Calculate duration for full vehicle
  let duration = null;
  if (bookingType === 'fullVehicle') {
    if (ticket.booking_duration) {
      duration = ticket.booking_duration;
    } else if (ticket.duration_type && ticket.duration_value) {
      const durationValue = parseInt(ticket.duration_value) || 1;
      const durationType = ticket.duration_type.toLowerCase();
      duration = `${durationValue} ${durationType}${durationValue > 1 ? 's' : ''}`;
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={closeTicketModal}
          className="flex items-center text-gray-700 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Bookings
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center bg-teal-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-teal-700 transition-all"
        >
          <Download className="w-5 h-5 mr-2" />
          Download PDF
        </button>
      </div>

      <div
        ref={ticketRef}
        className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-dashed border-teal-300/80 overflow-x-auto min-w-full md:min-w-0"
      >
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <div className="flex flex-col">
            <h2 className="text-3xl font-extrabold text-teal-700 flex items-center">
              <Ticket className="w-7 h-7 mr-2 text-teal-500" /> E-TICKET
            </h2>
            <p className="text-sm font-mono text-gray-700 font-bold mt-1">
              Booking ID: {ticket.booking || ticket.booking_id}
            </p>
            <p className="text-xs font-medium text-gray-500 mt-1">
              {bookingType === 'fullVehicle' ? 'Full Vehicle Booking' : 'Seat Booking'}
            </p>
          </div>
          {logoUrl ? (
            <img src={logoUrl} alt="Company Logo" className="w-16 h-16 object-contain rounded-full border border-gray-200 shadow-md" />
          ) : (
            <div className="text-xl font-semibold text-gray-600 text-right">{companyName}</div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200 min-w-[500px]">
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium">FROM</p>
            <p className="text-xl font-bold text-gray-800">{ticket.route_from}</p>
          </div>
          <div className="text-center flex flex-col items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-teal-600 rotate-180" />
            <p className="text-xs text-teal-600 font-bold">ROUTE</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium">TO</p>
            <p className="text-xl font-bold text-gray-800">{ticket.route_to}</p>
          </div>
        </div>

        <div className={`grid ${bookingType === 'fullVehicle' ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} gap-4 mb-6 min-w-[600px]`}>
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center"><User className="w-4 h-4 mr-1 text-teal-500" /> PASSENGER</p>
            <p className="font-semibold text-gray-800 truncate">{ticket.passenger_name}</p>
          </div>
          
          {bookingType === 'fullVehicle' ? (
            <>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-1 text-teal-500" /> FROM DATE</p>
                <p className="font-semibold text-gray-800">{safeDate(ticket.departure_date || ticket.arrival_date)}</p>
              </div>
              
              {ticket.return_date && ticket.return_date !== "N/A" && (
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-1 text-teal-500" /> TO DATE</p>
                  <p className="font-semibold text-gray-800">{safeDate(ticket.return_date)}</p>
                </div>
              )}
              
              {duration && (
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 flex items-center"><Clock className="w-4 h-4 mr-1 text-teal-500" /> DURATION</p>
                  <p className="font-semibold text-gray-800">{duration}</p>
                </div>
              )}
              
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center"><Clock className="w-4 h-4 mr-1 text-teal-500" /> DEPARTURE</p>
                <p className="font-semibold text-gray-800">{safeTime(ticket.arrival_time)}</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-1 text-teal-500" /> DATE</p>
                <p className="font-semibold text-gray-800">{safeDate(ticket.arrival_date)}</p>
              </div>
              
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center"><Clock className="w-4 h-4 mr-1 text-teal-500" /> DEPARTURE</p>
                <p className="font-semibold text-gray-800">{safeTime(ticket.arrival_time)}</p>
              </div>
            </>
          )}
          
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center">
              {bookingType === 'fullVehicle' ? <Car className="w-4 h-4 mr-1 text-teal-500" /> : <Users className="w-4 h-4 mr-1 text-teal-500" />}
              {bookingType === 'fullVehicle' ? 'VEHICLE TYPE' : 'SEATS'}
            </p>
            <p className="font-semibold text-gray-800">
              {bookingType === 'fullVehicle'
                ? ticket.vehicle_type || "Full Vehicle Reserved"
                : ticket.seats?.length > 0
                  ? ticket.seats.join(", ")
                  : "—"}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-b border-gray-200 mb-6 space-y-3 min-w-[500px]">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium flex items-center"><Lock className="w-4 h-4 mr-1" /> CNIC:</span>
            <span className="font-bold text-gray-800">{ticket.passenger_cnic}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium flex items-center"><Mail className="w-4 h-4 mr-1" /> Email:</span>
            <span className="font-bold text-gray-800 truncate">{ticket.passenger_email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium flex items-center"><Phone className="w-4 h-4 mr-1" /> Contact:</span>
            <span className="font-bold text-gray-800">{ticket.passenger_contact}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium flex items-center"><Car className="w-4 h-4 mr-1" /> Vehicle/Driver:</span>
            <span className="font-bold text-gray-800">{ticket.vehicle_number} ({ticket.driver_name})</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-dashed border-gray-200">
            <span className="text-gray-600 font-medium">Total Amount Paid:</span>
            <span className="font-bold text-teal-700 text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-1" />
              {bookingType === 'fullVehicle'
                ? Number(ticket.price_per_seat || 0).toLocaleString()
                : totalPrice.toLocaleString()
              } Rs
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end min-w-[500px]">
          <div className="text-center">
            <QRCodeCanvas
              value={JSON.stringify({
                booking_id: ticket.booking || ticket.booking_id,
                booking_type: bookingType,
                seats: ticket.seats?.join(','),
                cnic: ticket.passenger_cnic
              })}
              size={120}
              className="p-1 border border-gray-200 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-2">Scan for Validation</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold text-red-600/90">{ticket.status?.toUpperCase()}</p>
            <p className="text-xl font-extrabold text-red-600/90">{ticket.payment_status?.toUpperCase()}</p>
            <p className="text-xs text-gray-500">Confirmed by Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
});

/* --- Screenshot Modal Component --- */
const ScreenshotModal = ({ screenshotUrl, onClose }) => {
  if (!screenshotUrl) return null;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  // Check if URL is relative or absolute
  const getFullImageUrl = (url) => {
    if (!url) return null;
    
    // If it's already a full URL or base64
    if (url.startsWith('http') || url.startsWith('data:image')) {
      return url;
    }
    const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : '';
    // If it's a relative URL starting with /media/
    if (url.startsWith('/media/')) {
      return `${API_URL}${url}`;
    }
    
    // If it's just a filename, assume it's in /media/
    return `${API_BASE_URL}/media//media/${url}`;
  };

  useEffect(() => {
    const fullUrl = getFullImageUrl(screenshotUrl);
    console.log("Screenshot URL:", screenshotUrl);
    console.log("Full URL:", fullUrl);
    setImageSrc(fullUrl);
    setIsLoading(true);
    setHasError(false);
  }, [screenshotUrl]);

  const handleOpenInNewTab = () => {
    if (imageSrc) {
      window.open(imageSrc, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4" role="dialog" aria-modal="true">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Payment Screenshot</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Close screenshot viewer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[80vh] flex flex-col items-center">
          <div className="relative w-full max-w-3xl mb-4 min-h-[300px] flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading screenshot...</span>
              </div>
            )}
            
            {hasError && (
              <div className="text-center p-4 text-red-600">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Screenshot could not be loaded. It may have been deleted or the URL is incorrect.</p>
                <p className="text-xs mt-2 text-gray-500">URL: {screenshotUrl}</p>
              </div>
            )}
            
            {imageSrc && !hasError && (
              <img
                src={imageSrc}
                alt="Payment screenshot"
                className={`w-full h-auto rounded-lg shadow-lg transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                onError={(e) => {
                  setIsLoading(false);
                  setHasError(true);
                  console.error('Image failed to load:', imageSrc);
                  e.target.onerror = null;
                }}
              />
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            {!hasError && (
              <>
                <button
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Open in New Tab
                </button>
                <button
                  onClick={() => {
                    if (imageSrc) {
                      const link = document.createElement('a');
                      link.href = imageSrc;
                      link.download = `payment_screenshot_${Date.now()}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- MAIN COMPONENT --- */
const OnlinePayment = () => {
  const [allBookings, setAllBookings] = useState({
    fullVehicle: [],
    seat: []
  });
  const [activeTab, setActiveTab] = useState('fullVehicle'); // 'fullVehicle' or 'seat'
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingType, setSelectedBookingType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const ticketRef = useRef(null);

  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);

  const fetchCtrlRef = useRef(null);
  const updateCtrlRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const fetchBookings = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);

    try {
      // Pehle tickets endpoint se FULL DATA lao (time/date/route ke liye)
      const ticketsUrl = `${API_BASE_URL}${COMPANY_TICKETS_ENDPOINT}`;
      console.log("📡 Fetching tickets with time/date/route:", ticketsUrl);

      const ticketsResponse = await fetchWithAuth(ticketsUrl, { method: 'GET', signal });
      
      let ticketsData = [];
      if (ticketsResponse.ok) {
        const data = await ticketsResponse.json();
        console.log("✅ Tickets API Response:", data);
        
        if (data && data.success && Array.isArray(data.data)) {
          ticketsData = data.data;
        } else if (Array.isArray(data)) {
          ticketsData = data;
        } else if (data && Array.isArray(data.results)) {
          ticketsData = data.results;
        }
      }

      // Phir manual bookings endpoint se data lao (screenshot ke liye)
      const manualUrl = `${API_BASE_URL}${ADMIN_BOOKINGS_ENDPOINT}`;
      console.log("📡 Fetching manual bookings for screenshots:", manualUrl);

      const manualResponse = await fetchWithAuth(manualUrl, { method: 'GET', signal });

      let manualData = [];
      if (manualResponse.ok) {
        const data = await manualResponse.json();
        console.log("✅ Manual Bookings Response:", data);

        if (Array.isArray(data)) {
          manualData = data;
        } else if (data && Array.isArray(data.results)) {
          manualData = data.results;
        } else if (data && Array.isArray(data.data)) {
          manualData = data.data;
        }
      }

      // Create a map of manual data by ID
      const manualMap = new Map();
      manualData.forEach(manual => {
        if (!manual) return;
        
        // Store by ID for easy lookup
        manualMap.set(manual.id, manual);
        
        // Also store by booking field if it exists
        if (manual.booking) {
          manualMap.set(manual.booking, manual);
        }
      });

      console.log("Manual Map size:", manualMap.size);
      console.log("Manual IDs:", Array.from(manualMap.keys()));

      // Now process tickets and merge with manual data
      const processedBookings = ticketsData.map(ticket => {
        if (!ticket) return null;
        
        // Sirf ONLINE/MANUAL payments filter karo
        const paymentType = (ticket.payment_type || ticket.payment_method || '').toUpperCase();
        if (!['ONLINE', 'MANUAL'].includes(paymentType)) return null;
        
        // Find matching manual booking
        const ticketBookingId = ticket.booking || ticket.booking_id;
        let matchingManual = null;
        
        if (ticketBookingId && manualMap.has(ticketBookingId)) {
          matchingManual = manualMap.get(ticketBookingId);
        } else if (ticket.id && manualMap.has(String(ticket.id))) {
          matchingManual = manualMap.get(String(ticket.id));
        } else if (ticket.passenger_name && ticket.vehicle_number) {
          // Try to match by passenger name and vehicle
          matchingManual = manualData.find(manual => 
            manual.passenger_name === ticket.passenger_name && 
            manual.vehicle_number === ticket.vehicle_number
          );
        }
        
        console.log(`Ticket ${ticket.id} - Manual match:`, matchingManual?.id);
        
        // Screenshot URL handle karo
        let screenshotUrl = null;
        const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : '';
        if (matchingManual?.screenshot_url) {
          const screenshot = matchingManual.screenshot_url;
          if (screenshot.startsWith('http') || screenshot.startsWith('data:image')) {
            screenshotUrl = screenshot;
          } else if (screenshot.startsWith('/media/')) {
            screenshotUrl = `${API_URL}${screenshot}`
          } else {
            screenshotUrl = `${API_URL}/media/${screenshot}`;
          }
        }
        
        // Determine booking type - Aapke backend ke hisab se
        const isFullVehicle = ticket.ticket_type === "FULLVEHICLE" || 
                            ticket.offer_type === "whole_hire" ||
                            ticket.service_type === "long_drive" ||
                            (ticket.vehicle_type && ticket.vehicle_type.toLowerCase().includes('hire'));
        
        // FULL VEHICLE DATE RANGE HANDLING - Aapke backend se data structure
        let departureDate = "N/A";
        let returnDate = "N/A";
        let bookingDuration = null;
        
        if (isFullVehicle) {
          // Aapke backend code ke hisab se data fields
          departureDate = ticket.departure_date || 
                         ticket.start_date || 
                         ticket.travel_start_date || 
                         ticket.arrival_date || 
                         "N/A";
          
          returnDate = ticket.return_date || 
                       ticket.end_date || 
                       ticket.travel_end_date || 
                       "N/A";
          
          // Agar returnDate nahi hai, lekin duration hai toh calculate karo
          if (returnDate === "N/A" && ticket.duration_type && ticket.duration_value && departureDate !== "N/A") {
            returnDate = calculateReturnDate(departureDate, ticket.duration_type, ticket.duration_value);
          }
          
          // Duration string banayein
          if (ticket.duration_type && ticket.duration_value) {
            const durationValue = parseInt(ticket.duration_value) || 1;
            const durationType = ticket.duration_type.toLowerCase();
            bookingDuration = `${durationValue} ${durationType}${durationValue > 1 ? 's' : ''}`;
          }
          
          // Manual data mein bhi check karo
          if (matchingManual?.duration_type && matchingManual?.duration_value && !bookingDuration) {
            const durationValue = parseInt(matchingManual.duration_value) || 1;
            const durationType = matchingManual.duration_type.toLowerCase();
            bookingDuration = `${durationValue} ${durationType}${durationValue > 1 ? 's' : ''}`;
          }
        }
        
        // Seats handling
        let seats = [];
        if (ticket.seats) {
          if (Array.isArray(ticket.seats)) {
            seats = ticket.seats;
          } else if (typeof ticket.seats === 'string') {
            seats = ticket.seats.split(',').map(s => s.trim()).filter(s => s);
          }
        }
        
        // Amount calculation - priority to manual data
        let amount = 0;
        if (matchingManual?.total_amount) {
          amount = parseFloat(matchingManual.total_amount) || 0;
        } else if (matchingManual?.amount) {
          amount = parseFloat(matchingManual.amount) || 0;
        } else if (ticket.total_amount) {
          amount = parseFloat(ticket.total_amount) || 0;
        } else if (ticket.price_per_seat) {
          const price = parseFloat(ticket.price_per_seat) || 0;
          const seatCount = seats.length || 1;
          amount = isFullVehicle ? price : price * seatCount;
        }
        
        // Status priority: manual > ticket
        const bookingStatus = matchingManual?.booking_status || 
                             matchingManual?.status || 
                             ticket.status || 
                             "UNKNOWN";
        
        const paymentStatus = matchingManual?.payment_status || 
                             ticket.payment_status || 
                             "UNKNOWN";
        
        // Generate booking ID
        const bookingId = ticketBookingId || `TICKET-${ticket.id}`;
        
        // Service type determine karo
        let serviceType = "Seat Booking";
        if (isFullVehicle) {
          if (ticket.service_type === "long_drive") {
            serviceType = "Long Drive";
          } else if (ticket.offer_type === "whole_hire") {
            serviceType = "Full Vehicle Hire";
          } else {
            serviceType = "Full Vehicle";
          }
        }
        
        return {
          id: ticket.id,
          bookingId: bookingId,
          vehicleNumber: ticket.vehicle_number || matchingManual?.vehicle_number || "UNKNOWN",
          customerName: ticket.passenger_name || matchingManual?.passenger_name || "Guest",
          service: isFullVehicle ? serviceType : `${seats.length || matchingManual?.seats_booked || 0} Seats`,
          amount: amount,
          date: safeDate(ticket.arrival_date || ticket.created_at),
          bookingStatus: bookingStatus,
          paymentStatus: paymentStatus,
          paymentType: paymentType,
          screenshotUrl: screenshotUrl,
          arrivalDate: ticket.arrival_date || "N/A",
          arrivalTime: ticket.arrival_time || "N/A",
          routeFrom: ticket.route_from || "N/A",
          routeTo: ticket.route_to || "N/A",
          // NEW FIELDS FOR FULL VEHICLE
          departureDate: departureDate,
          returnDate: returnDate,
          bookingDuration: bookingDuration,
          serviceType: ticket.service_type || (isFullVehicle ? "long_drive" : "seat"),
          durationType: ticket.duration_type || matchingManual?.duration_type,
          durationValue: ticket.duration_value || matchingManual?.duration_value,
          hasTicket: true,
          raw: { 
            ...ticket, 
            manualData: matchingManual,
            departure_date: departureDate,
            return_date: returnDate,
            booking_duration: bookingDuration,
            duration_type: ticket.duration_type || matchingManual?.duration_type,
            duration_value: ticket.duration_value || matchingManual?.duration_value
          },
          source: matchingManual ? 'merged' : 'ticket'
        };
      }).filter(booking => booking !== null);

      console.log(`✅ Processed bookings: ${processedBookings.length}`);
      
      // ALSO include manual bookings that don't have tickets
      const manualOnlyBookings = manualData
        .filter(manual => {
          // Check if this manual booking already exists in processedBookings
          const exists = processedBookings.some(booking => 
            booking.raw.manualData?.id === manual.id || 
            booking.bookingId === manual.id ||
            booking.bookingId === manual.booking
          );
          return !exists;
        })
        .map(manual => {
          const isFullVehicle = manual.is_full_vehicle ||
            manual.offer_type === 'whole_vehicle' ||
            manual.ticket_type === 'FULLVEHICLE' ||
            (manual.vehicle_type && manual.vehicle_type.toLowerCase().includes('hire')) ||
            manual.service_type === "long_drive";  // 🔥 Aapke backend se check
          
          let seats = [];
          if (manual.seats) {
            if (Array.isArray(manual.seats)) {
              seats = manual.seats;
            } else if (typeof manual.seats === 'string') {
              seats = manual.seats.split(',').map(s => s.trim());
            }
          }
          
          // FULL VEHICLE DATE RANGE for manual only bookings
          let departureDate = "N/A";
          let returnDate = "N/A";
          let bookingDuration = null;
          
          if (isFullVehicle) {
            departureDate = manual.departure_date || 
                           manual.start_date || 
                           manual.travel_date || 
                           manual.arrival_date || 
                           "N/A";
            
            returnDate = manual.return_date || 
                         manual.end_date || 
                         "N/A";
            
            // Agar returnDate nahi hai, lekin duration hai toh calculate karo
            if (returnDate === "N/A" && manual.duration_type && manual.duration_value && departureDate !== "N/A") {
              returnDate = calculateReturnDate(departureDate, manual.duration_type, manual.duration_value);
            }
            
            // Duration string banayein
            if (manual.duration_type && manual.duration_value) {
              const durationValue = parseInt(manual.duration_value) || 1;
              const durationType = manual.duration_type.toLowerCase();
              bookingDuration = `${durationValue} ${durationType}${durationValue > 1 ? 's' : ''}`;
            }
          }
          const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : '';
          // Screenshot URL
          let screenshotUrl = null;
          if (manual.screenshot_url) {
            const screenshot = manual.screenshot_url;
            if (screenshot.startsWith('http') || screenshot.startsWith('data:image')) {
              screenshotUrl = screenshot;
            } else if (screenshot.startsWith('/media/')) {
              screenshotUrl = `${API_URL}${screenshot}`
            } else {
              screenshotUrl = `${API_URL}/media/${screenshot}`;
            }
          }
          
          let amount = 0;
          if (manual.total_amount) {
            amount = parseFloat(manual.total_amount) || 0;
          } else if (manual.amount) {
            amount = parseFloat(manual.amount) || 0;
          }
          
          const bookingId = manual.booking || `MANUAL-${manual.id}`;
          
          // Service type determine karo
          let serviceType = "Seat Booking";
          if (isFullVehicle) {
            if (manual.service_type === "long_drive") {
              serviceType = "Long Drive";
            } else if (manual.offer_type === "whole_hire") {
              serviceType = "Full Vehicle Hire";
            } else {
              serviceType = "Full Vehicle";
            }
          }
          
          return {
            id: manual.id,
            bookingId: bookingId,
            vehicleNumber: manual.vehicle_number || "UNKNOWN",
            customerName: manual.passenger_name || "Guest",
            service: isFullVehicle ? serviceType : `${seats.length || manual.seats_booked || 0} Seats`,
            amount: amount,
            date: safeDate(manual.created_at),
            bookingStatus: manual.booking_status || manual.status || "UNKNOWN",
            paymentStatus: manual.payment_status || "UNKNOWN",
            paymentType: manual.payment_method || "MANUAL",
            screenshotUrl: screenshotUrl,
            arrivalDate: manual.arrival_date || manual.travel_date || "N/A",
            arrivalTime: manual.arrival_time || manual.travel_time || "N/A",
            routeFrom: manual.route_from || "N/A",
            routeTo: manual.route_to || "N/A",
            // NEW FIELDS FOR FULL VEHICLE
            departureDate: departureDate,
            returnDate: returnDate,
            bookingDuration: bookingDuration,
            serviceType: manual.service_type || (isFullVehicle ? "long_drive" : "seat"),
            durationType: manual.duration_type,
            durationValue: manual.duration_value,
            hasTicket: false,
            raw: manual,
            source: 'manual-only'
          };
        });

      // Combine both arrays
      const allCombinedBookings = [...processedBookings, ...manualOnlyBookings];
      console.log(`✅ Total combined bookings: ${allCombinedBookings.length}`);
      
      // Debug first few bookings
      if (allCombinedBookings.length > 0) {
        console.log("📋 Sample bookings:", allCombinedBookings.slice(0, 3));
      }

      // Separate full vehicle and seat bookings
      const fullVehicleBookings = [];
      const seatBookings = [];

      allCombinedBookings.forEach(booking => {
        const isFullVehicle = booking.service.includes('Full Vehicle') ||
                            booking.service.includes('Long Drive') ||
                            booking.service.includes('Hire') ||
                            booking.raw.service_type === "long_drive" ||
                            booking.raw.offer_type === 'whole_vehicle';

        if (isFullVehicle) {
          fullVehicleBookings.push(booking);
        } else {
          seatBookings.push(booking);
        }
      });

      setAllBookings({
        fullVehicle: fullVehicleBookings,
        seat: seatBookings
      });

      console.log(`✅ Final - Full Vehicle: ${fullVehicleBookings.length}, Seat: ${seatBookings.length}`);

    } catch (err) {
      if (err.name === 'AbortError') { return; }
      if (err.message === 'NO_TOKEN') {
        setError('Authentication token missing. Please log in.');
        setIsLoading(false);
        return;
      }
      console.error('fetchBookings error:', err);
      setError(err.message || 'Failed to load booking data from backend API.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchCtrlRef.current = ctrl;
    fetchBookings(ctrl.signal);

    return () => {
      ctrl.abort();
      fetchCtrlRef.current = null;
    };
  }, [fetchBookings]);

  // Group Bookings by type
  const groupedFullVehicleBookings = useMemo(() => {
    return groupBookings(allBookings.fullVehicle);
  }, [allBookings.fullVehicle]);

  const groupedSeatBookings = useMemo(() => {
    return groupBookings(allBookings.seat);
  }, [allBookings.seat]);

  // Get current active grouped bookings
  const groupedBookings = activeTab === 'fullVehicle' ? groupedFullVehicleBookings : groupedSeatBookings;

  // Grouping function - Shows time/date/route in groups
  function groupBookings(bookings) {
    const grouped = bookings.reduce((acc, booking) => {
      let groupKey;
      
      if (booking.service.includes('Full Vehicle') || booking.service.includes('Long Drive') || booking.service.includes('Hire')) {
        // FULL VEHICLE: Group by vehicle and date range
        groupKey = `${booking.vehicleNumber}_${booking.departureDate}_${booking.returnDate}_${booking.bookingDuration}`;
      } else {
        // SEAT: Group by vehicle and arrival date
        groupKey = `${booking.vehicleNumber}_${booking.arrivalDate}`;
      }

      if (!acc[groupKey]) {
        if (booking.service.includes('Full Vehicle') || booking.service.includes('Long Drive') || booking.service.includes('Hire')) {
          // FULL VEHICLE GROUP
          acc[groupKey] = {
            vehicleNumber: booking.vehicleNumber,
            arrivalDate: booking.departureDate, // Use departure date as primary
            returnDate: booking.returnDate,
            bookingDuration: booking.bookingDuration,
            routeFrom: booking.routeFrom,
            routeTo: booking.routeTo,
            bookings: [],
            times: new Set(),
            isFullVehicle: true,
            serviceType: booking.serviceType || 'long_drive'
          };
        } else {
          // SEAT GROUP
          acc[groupKey] = {
            vehicleNumber: booking.vehicleNumber,
            arrivalDate: booking.arrivalDate,
            routeFrom: booking.routeFrom,
            routeTo: booking.routeTo,
            bookings: [],
            times: new Set(),
            isFullVehicle: false
          };
        }
      }

      acc[groupKey].bookings.push(booking);
      if (booking.arrivalTime && booking.arrivalTime !== 'N/A') {
        acc[groupKey].times.add(booking.arrivalTime);
      }

      return acc;
    }, {});

    const groupedArray = Object.values(grouped);

    // Sorting logic
    groupedArray.sort((a, b) => {
      const dateA = new Date(a.arrivalDate);
      const dateB = new Date(b.arrivalDate);
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
      return dateB - dateA;
    });

    groupedArray.forEach(group => {
      group.bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
      group.times = Array.from(group.times).sort();
    });

    return groupedArray;
  }

  // Pagination
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return groupedBookings.slice(startIndex, endIndex);
  }, [groupedBookings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(groupedBookings.length / itemsPerPage);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Modal Functions
  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setSelectedBookingType(activeTab);
    setIsModalOpen(true);
  };

  const closeStatusModal = () => {
    setSelectedBooking(null);
    setSelectedBookingType(null);
    setIsModalOpen(false);
  };

  // Screenshot Functions
  const handleViewScreenshot = (screenshotUrl) => {
    if (screenshotUrl) {
      console.log("Opening screenshot:", screenshotUrl);
      setSelectedScreenshot(screenshotUrl);
      setIsScreenshotModalOpen(true);
    } else {
      alert('No screenshot available for this payment.');
    }
  };

  const closeScreenshotModal = () => {
    setIsScreenshotModalOpen(false);
    setSelectedScreenshot(null);
  };

  // Status Update Function
  const updateBookingStatus = useCallback(async (bookingData, newBookingStatus, newPaymentStatus) => {
    if (!bookingData) return;

    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    const bookingId = bookingData.raw?.booking || bookingData.bookingId;

    if (!bookingId) {
      setError("Booking ID not found. Cannot update status.");
      setIsUpdating(false);
      return;
    }

    console.log("📤 Updating booking ID:", bookingId);
    console.log("New status:", newBookingStatus);
    console.log("New payment status:", newPaymentStatus);

    if (updateCtrlRef.current) {
      updateCtrlRef.current.abort();
    }
    const ctrl = new AbortController();
    updateCtrlRef.current = ctrl;

    try {
      const url = `${API_BASE_URL}${ADMIN_BOOKINGS_ENDPOINT}${bookingId}/status/`;
      console.log("API URL:", url);

      const response = await fetchWithAuth(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_status: newBookingStatus,
          new_payment_status: newPaymentStatus,
        }),
        signal: ctrl.signal,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Update successful:", result);

      // Update local state based on booking type
      const bookingType = selectedBookingType || activeTab;

      setAllBookings(prev => {
        const updatedFullVehicle = bookingType === 'fullVehicle'
          ? prev.fullVehicle.map(booking => {
            if (booking.id === bookingData.id || booking.bookingId === bookingId) {
              return {
                ...booking,
                bookingStatus: newBookingStatus,
                paymentStatus: newPaymentStatus,
                raw: {
                  ...booking.raw,
                  status: newBookingStatus,
                  payment_status: newPaymentStatus
                }
              };
            }
            return booking;
          })
          : prev.fullVehicle;

        const updatedSeat = bookingType === 'seat'
          ? prev.seat.map(booking => {
            if (booking.id === bookingData.id || booking.bookingId === bookingId) {
              return {
                ...booking,
                bookingStatus: newBookingStatus,
                paymentStatus: newPaymentStatus,
                raw: {
                  ...booking.raw,
                  status: newBookingStatus,
                  payment_status: newPaymentStatus
                }
              };
            }
            return booking;
          })
          : prev.seat;

        return {
          fullVehicle: updatedFullVehicle,
          seat: updatedSeat
        };
      });

      setSuccessMessage(`✅ Status updated successfully! Booking is now ${newBookingStatus} with payment ${newPaymentStatus}.`);
      closeStatusModal();

    } catch (err) {
      if (err.name === 'AbortError') { return; }
      console.error('updateBookingStatus error:', err);
      setError(`Could not update booking status: ${err.message}`);
    } finally {
      setIsUpdating(false);
      updateCtrlRef.current = null;
    }
  }, [selectedBookingType, activeTab]);

  // Fetch Ticket Details
  const fetchTicketDetails = useCallback(async (bookingId, bookingType) => {
    // Find the booking in our local state
    const bookings = bookingType === 'fullVehicle' ? allBookings.fullVehicle : allBookings.seat;
    const booking = bookings.find(b => b.bookingId === bookingId || b.id === bookingId);

    if (booking && booking.raw) {
      console.log("✅ Found ticket data locally");
      return booking.raw;
    }

    // If not found locally, try to fetch from API
    try {
      const url = `${API_BASE_URL}${TICKET_DETAIL_ENDPOINT}?booking_id=${bookingId}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const ticket = data.find(t => String(t.booking_id) === String(bookingId));
        if (ticket) return ticket;
      } else if (data && data.booking_id) {
        return data;
      }

      throw new Error("Ticket not found in API response");
    } catch (err) {
      console.error("fetchTicketDetails error:", err);
      throw err;
    }
  }, [allBookings]);

  // Download Ticket
  const handleDownloadTicket = async () => {
    const element = ticketRef.current;
    if (!element || !ticketData) return;

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 3,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);

      const imgRatio = imgProps.height / imgProps.width;
      const pdfRatio = pdfHeight / pdfWidth;

      let finalWidth, finalHeight;
      if (imgRatio > pdfRatio) {
        finalHeight = pdfHeight * 0.9;
        finalWidth = finalHeight / imgRatio;
      } else {
        finalWidth = pdfWidth * 0.9;
        finalHeight = finalWidth * imgRatio;
      }

      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

      const fileName = `ticket_${ticketData?.passenger_name?.replace(/\s/g, '_') || "passenger"}_${ticketData?.booking || ticketData?.id}.pdf`;
      pdf.save(fileName);

      setSuccessMessage(`✅ Ticket downloaded successfully!`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setError("❌ PDF generation failed. Check console for error details.");
    }
  };

  const handleTicket = async (booking, action, bookingType) => {
    setSelectedBooking(booking);
    setSelectedBookingType(bookingType || activeTab);
    setIsTicketModalOpen(true);

    try {
      if (booking.raw) {
        setTicketData(booking.raw);
      } else {
        const ticket = await fetchTicketDetails(booking.bookingId || booking.id, bookingType || activeTab);
        setTicketData(ticket);
      }
    } catch (err) {
      console.error("Error loading ticket:", err);
      setError("Failed to load ticket details. Please try again.");
    }
  };

  const closeTicketModal = () => {
    setIsTicketModalOpen(false);
    setTicketData(null);
    setSelectedBooking(null);
    setSelectedBookingType(null);
  };

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (isModalOpen) closeStatusModal();
        if (isTicketModalOpen) closeTicketModal();
        if (isScreenshotModalOpen) closeScreenshotModal();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen, isTicketModalOpen, isScreenshotModalOpen]);

  // Reset page when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const totalFullVehicleBookings = allBookings.fullVehicle.length;
  const totalSeatBookings = allBookings.seat.length;

  /* --- MODAL COMPONENTS --- */
  const UpdateStatusModal = () => {
    if (!selectedBooking) return null;

    const [newBookingStatus, setNewBookingStatus] = useState(selectedBooking.bookingStatus || '');
    const [newPaymentStatus, setNewPaymentStatus] = useState(selectedBooking.paymentStatus || '');

    useEffect(() => {
      setNewBookingStatus(selectedBooking.bookingStatus || '');
      setNewPaymentStatus(selectedBooking.paymentStatus || '');
    }, [selectedBooking]);

    const handleSubmit = (e) => {
      e.preventDefault();

      if (newBookingStatus === BOOKING_STATUSES.CONFIRMED && newPaymentStatus === PAYMENT_STATUSES.UNPAID) {
        if (!window.confirm("Are you sure you want to CONFIRM the booking while the payment status is still 'UNPAID'? Ticket generation requires both CONFIRMED and PAID statuses.")) {
          return;
        }
      }

      updateBookingStatus(selectedBooking, newBookingStatus, newPaymentStatus);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Update {selectedBookingType === 'fullVehicle' ? 'Full Vehicle' : 'Seat'} Booking:
            <span className="text-indigo-600 ml-2">{selectedBooking.bookingId || selectedBooking.id}</span>
          </h2>
          <div className="mb-6 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Vehicle:</span> {selectedBooking.vehicleNumber}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Customer:</span> {selectedBooking.customerName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Route:</span> {selectedBooking.routeFrom} → {selectedBooking.routeTo}
            </p>
            
            {selectedBookingType === 'fullVehicle' ? (
              // FULL VEHICLE DATE RANGE
              <>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">From Date:</span> {safeDate(selectedBooking.departureDate || selectedBooking.arrivalDate)}
                </p>
                {selectedBooking.returnDate && selectedBooking.returnDate !== "N/A" && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">To Date:</span> {safeDate(selectedBooking.returnDate)}
                  </p>
                )}
                {selectedBooking.bookingDuration && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Duration:</span> {selectedBooking.bookingDuration}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Time:</span> {safeTime(selectedBooking.arrivalTime)}
                </p>
              </>
            ) : (
              // SEAT BOOKING
              <p className="text-sm text-gray-600">
                <span className="font-medium">Date/Time:</span> {safeDate(selectedBooking.arrivalDate)} at {safeTime(selectedBooking.arrivalTime)}
              </p>
            )}
            
            <p className="text-sm text-gray-600">
              <span className="font-medium">Current Status:</span> {selectedBooking.bookingStatus} / {selectedBooking.paymentStatus}
            </p>
          </div>

          {selectedBooking?.screenshotUrl && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Payment Screenshot:</p>
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <img
                    src={selectedBooking.screenshotUrl}
                    alt="Payment screenshot thumbnail"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90"
                    onClick={() => handleViewScreenshot(selectedBooking.screenshotUrl)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleViewScreenshot(selectedBooking.screenshotUrl)}
                  className="px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200"
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  View Full Size
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
              <select
                value={newBookingStatus}
                onChange={(e) => setNewBookingStatus(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border"
              >
                {Object.values(BOOKING_STATUSES).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border"
              >
                {Object.values(PAYMENT_STATUSES).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Ticket will be available for download only when status is <span className="font-bold">CONFIRMED</span> and payment is <span className="font-bold">PAID</span>.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={closeStatusModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TicketDetailModal = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 bg-gray-100 rounded-xl shadow-2xl">
          {!ticketData ? (
            <div className="flex items-center justify-center p-10 space-x-3 text-indigo-500 bg-white rounded-xl shadow-md">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
              <span>Loading Ticket Data...</span>
            </div>
          ) : (
            <AdminTicketDetail
              ticket={ticketData}
              ticketRef={ticketRef}
              handleDownload={handleDownloadTicket}
              closeTicketModal={closeTicketModal}
              bookingType={selectedBookingType || activeTab}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Online Payment Bookings Management</h1>
        <p className="mt-1 text-lg text-gray-500">Manage all ONLINE PAYMENT vehicle and seat bookings</p>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Updating Indicator */}
        {isUpdating && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-lg flex items-center">
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>
            Updating booking status...
          </div>
        )}
      </header>

      {/* Online Payment Only Notice */}
      <div className="bg-white shadow-xl rounded-xl mb-8 overflow-hidden border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Showing Only Online Payment Bookings</span>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
              ONLINE PAYMENT
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Total: <span className="font-bold text-gray-700">{totalFullVehicleBookings + totalSeatBookings}</span>
          </div>
        </div>
      </div>

      {/* Tabs for Full Vehicle vs Seat Bookings */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('fullVehicle')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fullVehicle'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Full Vehicle Bookings
                {totalFullVehicleBookings > 0 && (
                  <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {totalFullVehicleBookings}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('seat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'seat'
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Seat Bookings
                {totalSeatBookings > 0 && (
                  <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {totalSeatBookings}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {isLoading && (
        <div className="p-6 text-center text-gray-500 bg-white shadow-lg rounded-xl">
          <svg className="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
          </svg>
          Loading online payment bookings from backend API...
        </div>
      )}

      {!isLoading && (
        <div className="space-y-8">
          {paginatedBookings.length === 0 ? (
            <div className="p-10 text-center text-gray-500 bg-white shadow-lg rounded-xl">
              {activeTab === 'fullVehicle' ? 'No full vehicle online payment bookings found.' : 'No seat online payment bookings found.'}
            </div>
          ) : (
            <>
              {/* Vehicle-Date Groups */}
              {paginatedBookings.map((groupData) => (
                <div key={groupData.vehicleNumber + groupData.arrivalDate} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                  {/* Group Header */}
                  <div className={`px-6 py-4 border-b ${
                    activeTab === 'fullVehicle'
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50'
                      : 'bg-gradient-to-r from-green-50 to-teal-50'
                  }`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {activeTab === 'fullVehicle' ? (
                            <Car className="inline-block w-5 h-5 mr-2 -mt-1 text-gray-800" />
                          ) : (
                            <Bus className="inline-block w-5 h-5 mr-2 -mt-1 text-gray-800" />
                          )}
                          Vehicle: <span className="text-indigo-600">{groupData.vehicleNumber}</span>
                          <span className="ml-2 text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            {groupData.isFullVehicle ? (groupData.serviceType === 'long_drive' ? 'Long Drive' : 'Full Vehicle') : 'Seat Booking'}
                          </span>
                          {groupData.isFullVehicle && groupData.bookingDuration && (
                            <span className="ml-2 text-sm font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                              {groupData.bookingDuration}
                            </span>
                          )}
                        </h2>
                        <div className="mt-2 text-sm text-gray-600">
                          {groupData.isFullVehicle ? (
                            // FULL VEHICLE DATE RANGE DISPLAY
                            <div className="space-y-1">
                              <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span className="font-medium">From:</span> 
                                <span className="ml-1">{formatDateForGroup(groupData.arrivalDate)}</span>
                                {groupData.returnDate && groupData.returnDate !== "N/A" && (
                                  <>
                                    <span className="mx-2">→</span>
                                    <span className="font-medium">To:</span> 
                                    <span className="ml-1">{formatDateForGroup(groupData.returnDate)}</span>
                                  </>
                                )}
                              </p>
                              {groupData.times.length > 0 && (
                                <p className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span className="font-medium">Times:</span>
                                  <span className="ml-1">{groupData.times.join(', ')}</span>
                                </p>
                              )}
                              <p className="flex items-center mt-1">
                                <span className="mr-2">📍</span>
                                {groupData.routeFrom} → {groupData.routeTo}
                              </p>
                            </div>
                          ) : (
                            // SEAT BOOKING DISPLAY (existing)
                            <>
                              <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {formatDateForGroup(groupData.arrivalDate)}
                                {groupData.times.length > 0 && (
                                  <span className="ml-4 flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Times: {groupData.times.join(', ')}
                                  </span>
                                )}
                              </p>
                              <p className="flex items-center mt-1">
                                <span className="mr-2">📍</span>
                                {groupData.routeFrom} → {groupData.routeTo}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">{groupData.bookings.length}</span> {activeTab === 'fullVehicle' ? 'vehicle bookings' : 'seat bookings'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {groupData.isFullVehicle ? (
                            <>
                              {groupData.arrivalDate} {groupData.returnDate && groupData.returnDate !== "N/A" ? `to ${groupData.returnDate}` : ''}
                            </>
                          ) : (
                            groupData.arrivalDate
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bookings Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer / Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupData.bookings.map((booking) => (
                          <BookingRow
                            key={`${booking.id}-${booking.bookingId}`}
                            booking={booking}
                            onOpenStatusModal={openStatusModal}
                            onHandleTicket={handleTicket}
                            onViewScreenshot={handleViewScreenshot}
                            isActionDisabled={isUpdating || isLoading}
                            bookingType={activeTab}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-white shadow-lg rounded-xl border border-gray-200 gap-4">
                  <span className="text-sm text-gray-700">
                    Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                    <span className="ml-4">Total {activeTab === 'fullVehicle' ? 'full vehicle' : 'seat'} groups: <span className="font-semibold">{groupedBookings.length}</span></span>
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </button>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isModalOpen && <UpdateStatusModal />}
      {isTicketModalOpen && <TicketDetailModal />}
      {isScreenshotModalOpen && <ScreenshotModal screenshotUrl={selectedScreenshot} onClose={closeScreenshotModal} />}
    </div>
  );
};

export default OnlinePayment;