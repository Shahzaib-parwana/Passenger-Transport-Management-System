import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  X, Calendar, Clock, MapPin, Users, DollarSign, 
  Ticket, User, Phone, Mail, CheckCircle, AlertCircle,
  Loader, ChevronRight, Bus, Truck, Route, Package,
  Download, Eye, FileText, CreditCard, Receipt, Filter, Search,
  Hash, Info, RefreshCw, Shield, BookOpen, Key, Edit, CheckSquare,
  Smartphone, Monitor, Printer, BarChart, PieChart, TrendingUp,
  CreditCard as Card, Smartphone as Mobile, Camera, Upload,
  Car, ArrowRight, ChevronLeft, Image as ImageIcon, ChevronDown, ChevronUp,
  Check, XCircle, Users as UsersIcon, Car as CarIcon, Tag,
  BarChart3, PieChart as PieChartIcon, TrendingUp as TrendingUpIcon,
  FileDown, Database, Send, MailCheck, Bell, BellRing
} from "lucide-react";

// Configuration
const API_BASE_URL = '/api';
const ADMIN_BOOKINGS_ENDPOINT = '/checkout/admin/manual-bookings/';
const TICKET_DETAIL_ENDPOINT = '/tickets/my-tickets/';
const COMPANY_TICKETS_ENDPOINT = '/tickets/company-tickets/';
const CHECKOUT_BOOKINGS_ENDPOINT = '/checkout/bookings/';
const CASH_ADMIN_UPDATE_ENDPOINT = '/checkout/admin/bookings/';
const EMAIL_NOTIFICATION_ENDPOINT = '/auth/notifications/send-status-email/';

// Utility functions
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
  if (!dateString || dateString === 'N/A') return 'Unknown Date';
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

// Helper function to get offer type display
const getOfferTypeDisplay = (offerType) => {
  if (!offerType) return 'Standard';
  
  const typeMap = {
    'whole_hire': 'Full Vehicle Hire',
    'seat_booking': 'Seat Booking',
    'special_offer': 'Special Offer',
    'discounted': 'Discounted',
    'long_drive': 'Long Drive',
    'regular': 'Regular',
    'premium': 'Premium',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
    'daily': 'Daily',
    'offer_sets': 'Offer Sets'
  };
  
  return typeMap[offerType] || offerType.replace(/_/g, ' ').toUpperCase();
};

// Status Badge Component - FIXED VERSION
const StatusBadge = React.memo(({ status, type = 'booking' }) => {
  let statusText = status?.toUpperCase() || 'UNKNOWN';
  
  // 🔥 FIX: "BOOKED" ko "CONFIRMED" ke tor pe display karna
  if (statusText === 'BOOKED') {
    statusText = 'CONFIRMED';
  }
  
  // 🔥 FIX: "BOOKING_CONFIRMED" ko bhi "CONFIRMED" display karo
  if (statusText === 'BOOKING_CONFIRMED') {
    statusText = 'CONFIRMED';
  }
  
  const getBadgeProps = () => {
    switch (statusText) {
      case 'CONFIRMED':
      case 'PAID':
      case 'COMPLETED':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200 ring-green-600/20'
        };
      case 'PENDING':
      case 'RESERVED':
      case 'UNPAID':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200 ring-yellow-600/20'
        };
      case 'CANCELLED':
      case 'FAILED':
      case 'EXPIRED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200 ring-red-600/20'
        };
      case 'REFUNDED':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200 ring-blue-600/20'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200 ring-gray-500/20'
        };
    }
  };

  const badgeProps = getBadgeProps();

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${badgeProps.bg} ${badgeProps.text} ${badgeProps.border}`}>
      {statusText}
    </span>
  );
});

// Payment Type Badge
const PaymentTypeBadge = React.memo(({ paymentType }) => {
  const type = paymentType?.toUpperCase() || 'UNKNOWN';
  
  const getBadgeProps = () => {
    switch (type) {
      case 'CASH':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: '💰'
        };
      case 'MANUAL':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: '💳'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: '❓'
        };
    }
  };

  const badgeProps = getBadgeProps();

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg ${badgeProps.bg} ${badgeProps.text} ${badgeProps.border}`}>
      <span className="mr-1">{badgeProps.icon}</span>
      {type === 'MANUAL' ? 'MANUAL' : type}
    </span>
  );
});

// Offer Type Badge
const OfferTypeBadge = React.memo(({ offerType }) => {
  const type = offerType?.toLowerCase() || 'standard';
  
  const getBadgeProps = () => {
    switch (type) {
      case 'whole_hire':
      case 'full vehicle hire':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          border: 'border-purple-200',
          icon: <Car className="w-3 h-3 mr-1" />
        };
      case 'seat_booking':
      case 'seat booking':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: <UsersIcon className="w-3 h-3 mr-1" />
        };
      case 'long_drive':
      case 'long drive':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: <Route className="w-3 h-3 mr-1" />
        };
      case 'special_offer':
      case 'special offer':
      case 'offer_sets':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: <Tag className="w-3 h-3 mr-1" />
        };
      case 'discounted':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: <Tag className="w-3 h-3 mr-1" />
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: <Tag className="w-3 h-3 mr-1" />
        };
    }
  };

  const badgeProps = getBadgeProps();

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg ${badgeProps.bg} ${badgeProps.text} ${badgeProps.border}`}>
      {badgeProps.icon}
      {getOfferTypeDisplay(type)}
    </span>
  );
});

// Update Status Modal with Email Notification Option
const UpdateStatusModal = ({ booking, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(booking?.bookingStatus || booking?.status || 'PENDING');
  const [paymentStatus, setPaymentStatus] = useState(booking?.paymentStatus || booking?.payment_status || 'PENDING');
  const [sendEmail, setSendEmail] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  
  // Check if booking has email
  const hasEmail = booking?.raw?.passenger_email || booking?.raw?.passengerEmail || 
                  booking?.raw?.manualData?.passenger_email || booking?.customerEmail;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailSent(false);
    
    try {
      const bookingId = booking.bookingId || booking.id;
      
      console.log("Submitting update for booking:", {
        bookingId,
        status,
        paymentStatus,
        sendEmail,
        hasEmail
      });
      
      await onUpdate(bookingId, { 
        status, 
        payment_status: paymentStatus 
      }, sendEmail);
      
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Update Booking Status</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium">{booking.customerName}</p>
              <p className="text-sm text-gray-600">
                {booking.vehicleNumber} • {safeDate(booking.date)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Current: {booking.bookingStatus || booking.status} / {booking.paymentStatus || booking.payment_status}
              </p>
              
              {/* Email Info */}
              {hasEmail ? (
                <div className="mt-2 p-2 bg-blue-50 rounded flex items-center">
                  <Mail className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-blue-700">
                    Email: {hasEmail}
                  </span>
                </div>
              ) : (
                <div className="mt-2 p-2 bg-yellow-50 rounded flex items-center">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-yellow-700">
                    No email found for passenger
                  </span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="RESERVED">RESERVED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PAID">PAID</option>
                <option value="UNPAID">UNPAID</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            {/* Email Notification Option */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="send-email"
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    disabled={!hasEmail}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="send-email" className={`font-medium ${hasEmail ? 'text-gray-700' : 'text-gray-400'}`}>
                    Send Email Notification to Passenger
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    {hasEmail 
                      ? "Passenger will receive an email about the status update"
                      : "Cannot send email: No email address found"}
                  </p>
                  
                  {emailSent && (
                    <div className="mt-2 p-2 bg-green-50 rounded flex items-center">
                      <MailCheck className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-700">
                        Email notification sent successfully!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckSquare className="w-4 h-4" />
                )}
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Screenshot Modal Component
const ScreenshotModal = ({ screenshotUrl, onClose }) => {
  if (!screenshotUrl) return null;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : '';
  const getFullImageUrl = (url) => {
    if (!url) return null;
    
    if (url.startsWith('http') || url.startsWith('data:image')) {
      return url;
    }
    
    if (url.startsWith('/media/')) {
    return `${API_URL}${url}`;
}
    
    return `${API_URL}/media/${url}`;
  };

  useEffect(() => {
    const fullUrl = getFullImageUrl(screenshotUrl);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 p-4" role="dialog" aria-modal="true">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden z-[10000]">
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
                <p>Screenshot could not be loaded.</p>
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

// Ticket Modal Component
const TicketModal = ({ booking, onClose, bookingType }) => {
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState(null);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const bookingId = booking.bookingId || booking.id;
      console.log("Fetching ticket for booking ID:", bookingId);

      // Try multiple endpoints
      let endpoints = [
        `${API_BASE_URL}/tickets/${bookingId}/`,
        `${API_BASE_URL}/tickets/my-tickets/${bookingId}/`,
        `${API_BASE_URL}/tickets/booking/${bookingId}/`,
        `${API_BASE_URL}checkout/tickets/${bookingId}/`,
      ];

      let ticketResponse = null;
      
      for (let endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && (data.id || data.ticket_id || data.booking_id)) {
              ticketResponse = data;
              console.log("Ticket found from endpoint:", endpoint);
              break;
            }
          }
        } catch (err) {
          console.log("Endpoint failed:", endpoint, err);
          continue;
        }
      }

      // If no ticket found, use booking data
      if (!ticketResponse) {
        console.log("Using booking data as ticket data");
        ticketResponse = {
          id: booking.id || bookingId,
          passenger_name: booking.customerName,
          vehicle_number: booking.vehicleNumber,
          arrival_date: booking.arrivalDate || booking.date,
          arrival_time: booking.arrivalTime,
          route_from: booking.routeFrom || booking.raw?.route_from,
          route_to: booking.routeTo || booking.raw?.route_to,
          seats: booking.seats || booking.seatsBooked,
          total_amount: booking.amount,
          status: booking.bookingStatus || booking.raw?.status,
          payment_status: booking.paymentStatus || booking.raw?.payment_status,
          passenger_contact: booking.raw?.passenger_contact,
          passenger_email: booking.raw?.passenger_email,
          passenger_cnic: booking.raw?.passenger_cnic,
          source: 'booking_data'
        };
      }

      if (ticketResponse) {
        setTicketData(ticketResponse);
      } else {
        setError("Ticket information could not be retrieved");
      }

    } catch (err) {
      console.error("Error fetching ticket:", err);
      setError(err.message || "Failed to load ticket information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketData();
  }, [booking]);

  const generateTicketHTML = () => {
    if (!ticketData) return '';
    
    const passengerName = ticketData.passenger_name || ticketData.customerName || 'Guest';
    const vehicleNumber = ticketData.vehicle_number || ticketData.vehicleNumber || 'N/A';
    const routeFrom = ticketData.route_from || ticketData.routeFrom || 'N/A';
    const routeTo = ticketData.route_to || ticketData.routeTo || 'N/A';
    const date = safeDate(ticketData.arrival_date || ticketData.travel_date);
    const time = safeTime(ticketData.arrival_time || ticketData.travel_time);
    const seats = ticketData.seats || ticketData.seatsBooked || 'N/A';
    const amount = ticketData.total_amount || ticketData.amount || 0;
    const bookingId = ticketData.booking_id || ticketData.bookingId || ticketData.id;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>E-Ticket - ${passengerName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .ticket-container {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .ticket {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            position: relative;
          }
          
          .ticket-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            text-align: center;
          }
          
          .ticket-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 5px;
            letter-spacing: 2px;
          }
          
          .ticket-subtitle {
            font-size: 14px;
            opacity: 0.9;
            letter-spacing: 1px;
          }
          
          .ticket-content {
            padding: 25px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #eaeaea;
          }
          
          .info-label {
            font-size: 14px;
            color: #666;
            font-weight: 500;
          }
          
          .info-value {
            font-size: 16px;
            color: #333;
            font-weight: 600;
          }
          
          .route-section {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          
          .route-from-to {
            font-size: 24px;
            font-weight: 700;
            color: #333;
            margin: 10px 0;
          }
          
          .route-arrow {
            font-size: 20px;
            color: #667eea;
            margin: 0 10px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            margin: 5px;
          }
          
          .status-confirmed {
            background: #d1fae5;
            color: #065f46;
          }
          
          .ticket-footer {
            padding: 20px 25px;
            background: #f8f9fa;
            border-top: 1px solid #eaeaea;
            text-align: center;
          }
          
          .qr-code {
            width: 120px;
            height: 120px;
            background: #f0f0f0;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #666;
          }
          
          @media print {
            body {
              background: white;
            }
            .ticket {
              box-shadow: none;
              border: 2px solid #333;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket">
            <div class="ticket-header">
              <div class="ticket-title">E-TICKET</div>
              <div class="ticket-subtitle">BOOKING CONFIRMED</div>
            </div>
            
            <div class="ticket-content">
              <div class="info-row">
                <span class="info-label">Booking ID</span>
                <span class="info-value">${bookingId}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Passenger</span>
                <span class="info-value">${passengerName}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Vehicle</span>
                <span class="info-value">${vehicleNumber}</span>
              </div>
              
              <div class="route-section">
                <div style="font-size: 14px; color: #666;">JOURNEY</div>
                <div class="route-from-to">
                  ${routeFrom}
                  <span class="route-arrow">→</span>
                  ${routeTo}
                </div>
              </div>
              
              <div class="info-row">
                <span class="info-label">Date</span>
                <span class="info-value">${date}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Time</span>
                <span class="info-value">${time}</span>
              </div>
              
              ${bookingType === 'seat' ? `
                <div class="info-row">
                  <span class="info-label">Seats</span>
                  <span class="info-value">${seats}</span>
                </div>
              ` : ''}
              
              <div class="info-row">
                <span class="info-label">Amount Paid</span>
                <span class="info-value" style="color: #059669; font-size: 18px;">Rs. ${amount}</span>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                <span class="status-badge status-confirmed">
                  ${ticketData.status === 'BOOKED' ? 'CONFIRMED' : (ticketData.status || 'CONFIRMED')}
                </span>
              </div>
            </div>
            
            <div class="ticket-footer">
              <div class="qr-code">
                SCAN FOR VERIFICATION
              </div>
              <div style="font-size: 12px; color: #666;">
                Thank you for choosing our service!
                <br>
                For assistance, contact: support@transport.com
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadTicket = () => {
    const ticketHtml = generateTicketHTML();
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    printWindow.document.write(ticketHtml);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleViewTicket = () => {
    const ticketHtml = generateTicketHTML();
    const viewWindow = window.open('', '_blank', 'width=450,height=800');
    
    viewWindow.document.write(ticketHtml);
    viewWindow.document.close();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error && !ticketData) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Ticket Not Found</h3>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (booking) {
                  const mockTicket = {
                    passenger_name: booking.customerName,
                    vehicle_number: booking.vehicleNumber,
                    arrival_date: booking.arrivalDate,
                    arrival_time: booking.arrivalTime,
                    route_from: booking.routeFrom,
                    route_to: booking.routeTo,
                    seats: booking.seats,
                    total_amount: booking.amount,
                    status: booking.bookingStatus,
                    payment_status: booking.paymentStatus
                  };
                  setTicketData(mockTicket);
                  setError(null);
                }
              }}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
            >
              Generate Ticket from Booking Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ticket = ticketData || {};

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">E-Ticket</h3>
              <p className="text-sm text-gray-600">Booking Reference: {ticket.booking_id || ticket.id || 'N/A'}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h4 className="font-bold text-lg text-gray-800 mb-4">Passenger Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold">{ticket.passenger_name || ticket.customerName || 'Guest'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-semibold">{ticket.passenger_contact || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{ticket.passenger_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CNIC</p>
                  <p className="font-semibold">{ticket.passenger_cnic || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
              <h4 className="font-bold text-lg text-gray-800 mb-4">Journey Details</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-semibold text-lg">{ticket.vehicle_number || booking.vehicleNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Booking Type</p>
                    <p className="font-semibold">{bookingType === 'fullVehicle' ? 'Full Vehicle' : 'Seat Booking'}</p>
                  </div>
                </div>
                
                <div className="text-center py-4 border-y border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">ROUTE</div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{ticket.route_from || booking.routeFrom}</div>
                      <div className="text-sm text-gray-600">From</div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-blue-500" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{ticket.route_to || booking.routeTo}</div>
                      <div className="text-sm text-gray-600">To</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{safeDate(ticket.arrival_date || booking.arrivalDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold">{safeTime(ticket.arrival_time || booking.arrivalTime)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              <h4 className="font-bold text-lg text-gray-800 mb-4">Booking Summary</h4>
              <div className="space-y-3">
                {bookingType === 'seat' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seats Booked</span>
                    <span className="font-semibold">{ticket.seats || booking.seats || booking.seatsBooked || 1}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rs. {ticket.total_amount || ticket.amount || booking.amount || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-between items-center p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Booking Status</p>
                <StatusBadge status={ticket.status === 'BOOKED' ? 'CONFIRMED' : (ticket.status || booking.bookingStatus)} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <StatusBadge status={ticket.payment_status || booking.paymentStatus} type="payment" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <PaymentTypeBadge paymentType={booking.paymentType || ticket.payment_type} />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Close
            </button>
            <button
              onClick={handleViewTicket}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              View Ticket
            </button>
            <button
              onClick={handleDownloadTicket}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Ticket
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Note: This is an electronic ticket. No physical copy is required. Present this ticket or its QR code at the boarding point.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// BookingRow Component
const BookingRow = React.memo(({ 
  booking, 
  onView, 
  onUpdate,
  onViewScreenshot,
  bookingType 
}) => {
  const paymentType = booking.paymentType?.toUpperCase() || booking.payment_method?.toUpperCase() || 'UNKNOWN';
  
  const isConfirmedAndPaid = 
    (booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID');
  
  const isManualConfirmed = 
    paymentType === 'MANUAL' && booking.bookingStatus === 'CONFIRMED';
  
  const hasScreenshot = booking.screenshotUrl && booking.screenshotUrl !== null;
  const hasTicket = booking.hasTicket !== false;

  const getSeatsText = () => {
    if (bookingType === 'fullVehicle') {
      return 'Full Vehicle';
    }
    
    if (booking.seats) {
      if (Array.isArray(booking.seats)) {
        return `${booking.seats.length} Seats: ${booking.seats.join(', ')}`;
      } else if (typeof booking.seats === 'string') {
        const seatsArray = booking.seats.split(',').map(s => s.trim());
        return `${seatsArray.length} Seats: ${seatsArray.join(', ')}`;
      }
    }
    
    return `${booking.seatsBooked || 1} Seats`;
  };

  const shouldShowTicketButton = hasTicket && (
    (paymentType === 'CASH' && isConfirmedAndPaid) ||
    (paymentType === 'MANUAL' && isManualConfirmed)
  );

  return (
    <tr className="hover:bg-gray-50 transition duration-150">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
        {booking.bookingId || booking.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
        <div className="text-xs text-gray-500">{getSeatsText()}</div>
        {bookingType === 'fullVehicle' && booking.bookingDuration && (
          <div className="text-xs text-blue-600 mt-1">
            Duration: {booking.bookingDuration}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <PaymentTypeBadge paymentType={paymentType} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <OfferTypeBadge offerType={booking.offerType || booking.raw?.offer_type} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        Rs. {booking.amount ? booking.amount.toLocaleString() : '0'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={booking.paymentStatus} type="payment" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={booking.bookingStatus} type="booking" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-end items-stretch sm:items-center">
          <button
            onClick={() => onUpdate(booking)}
            className={`px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition duration-150`}
            type="button"
          >
            Update Status
          </button>

          {hasScreenshot && (paymentType === 'CASH' || paymentType === 'MANUAL') && (
            <button
              onClick={() => onViewScreenshot(booking.screenshotUrl)}
              className={`px-3 py-1 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-md shadow-purple-500/30 transition duration-150 flex items-center justify-center gap-1`}
              type="button"
            >
              <ImageIcon className="w-4 h-4" /> View Screenshot
            </button>
          )}

          {shouldShowTicketButton && (
            <button
              onClick={() => onView(booking)}
              className={`px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/30 transition duration-150 flex items-center justify-center gap-1`}
              type="button"
            >
              <Eye className="w-4 h-4" /> View Ticket
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

// Email Notification Function
// Enhanced Email Notification Function with Debugging
const sendStatusUpdateEmail = async (booking, statusUpdate, token) => {
  try {
    console.log("🔍 Starting email notification process...");
    
    // Extract passenger email from multiple sources
    const passengerEmail = 
      booking.raw?.passenger_email || 
      booking.raw?.passengerEmail || 
      booking.raw?.manualData?.passenger_email ||
      booking.raw?.customer_email ||
      booking.passengerEmail ||
      booking.customerEmail ||
      'test@example.com';  // Fallback for testing

    console.log("📧 Email extracted:", {
      rawEmail: booking.raw?.passenger_email,
      manualEmail: booking.raw?.manualData?.passenger_email,
      finalEmail: passengerEmail
    });

    if (!passengerEmail || passengerEmail === 'N/A') {
      console.warn("⚠️ No valid email found, using test email");
      return { 
        success: true,  // Mark as success even without email for now
        message: "No email found, using test mode",
        hasEmail: false
      };
    }

    // Prepare email data
    const emailData = {
      booking_id: booking.bookingId || booking.id || 'TEST-123',
      passenger_name: booking.customerName || "Test Passenger",
      passenger_email: passengerEmail,
      vehicle_number: booking.vehicleNumber || "TEST-VEHICLE",
      route: `${booking.routeFrom || 'City A'} → ${booking.routeTo || 'City B'}`,
      date: safeDate(booking.arrivalDate || booking.date) || "15 Dec, 2024",
      time: safeTime(booking.arrivalTime) || "10:00 AM",
      previous_status: booking.bookingStatus || booking.status || 'PENDING',
      new_status: statusUpdate.status || 'CONFIRMED',
      new_payment_status: statusUpdate.payment_status || 'PAID',
      amount: booking.amount || 1000,
      booking_type: booking.service || (booking.seatsBooked ? 'Seat Booking' : 'Full Vehicle'),
      seats: booking.seats || booking.seatsBooked || 'N/A'
    };

    console.log("📤 Sending email data:", emailData);

    // Try multiple endpoints if one fails
    const endpoints = [
    //   `${API_BASE_URL}/notifications/send-status-email/`,
      `${API_BASE_URL}/auth/notifications/send-status-email/`,
      `/api/auth/notifications/send-status-email/`,
      `/api/notifications/send-status-email/`
    ];

    let lastError = null;
    
    for (let endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(emailData)
        });

        console.log(`📨 Response status: ${response.status}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log("✅ Email API response:", result);
          
          return { 
            success: true, 
            message: result.message || "Email sent successfully",
            hasEmail: true,
            emailAddress: passengerEmail
          };
        } else {
          const errorText = await response.text();
          console.warn(`❌ Endpoint failed (${response.status}):`, errorText);
          lastError = errorText;
        }
      } catch (fetchError) {
        console.warn(`❌ Fetch error for ${endpoint}:`, fetchError.message);
        lastError = fetchError.message;
      }
    }

    // If all endpoints failed, show appropriate message
    console.error("All email endpoints failed");
    
    // Check if it's a CORS or authentication issue
    const errorMessage = lastError || "Email service unavailable";
    
    if (errorMessage.includes('CORS') || errorMessage.includes('NetworkError')) {
      return { 
        success: false, 
        message: "CORS/Network issue. Check backend URL.",
        hasEmail: true
      };
    }
    
    return { 
      success: false, 
      message: errorMessage,
      hasEmail: true
    };

  } catch (error) {
    console.error("🔥 Unexpected error in email function:", error);
    return { 
      success: false, 
      message: `Unexpected error: ${error.message}`,
      hasEmail: false
    };
  }
};
// Main TransportInfo Component with Email Notification
const TransportInfo = ({ transportData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedBookingForUpdate, setSelectedBookingForUpdate] = useState(null);
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaymentType, setFilterPaymentType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notification, setNotification] = useState(null);

  const isHireOffer = useMemo(() => {
    const offerType = transportData?.offer_type;
    return (
      offerType === "whole_hire" || 
      transportData?.service_type === "long_drive" ||
      transportData?.ticket_type === "FULLVEHICLE" ||
      transportData?.is_long_drive === true
    );
  }, [transportData]);

  const offerTypeDisplay = useMemo(() => {
    return getOfferTypeDisplay(transportData?.offer_type);
  }, [transportData]);

  const bookingStats = useMemo(() => {
    const stats = {
      total: allBookings.length,
      confirmed: 0,
      pending: 0,
      reserved: 0,
      cancelled: 0,
      completed: 0,
      paid: 0,
      unpaid: 0,
      refunded: 0,
      failed: 0
    };

    allBookings.forEach(booking => {
      const bookingStatus = booking.bookingStatus?.toUpperCase();
      const paymentStatus = booking.paymentStatus?.toUpperCase();

      if (bookingStatus === 'CONFIRMED' || bookingStatus === 'BOOKED') stats.confirmed++;
      else if (bookingStatus === 'PENDING') stats.pending++;
      else if (bookingStatus === 'RESERVED') stats.reserved++;
      else if (bookingStatus === 'CANCELLED') stats.cancelled++;
      else if (bookingStatus === 'COMPLETED') stats.completed++;

      if (paymentStatus === 'PAID') stats.paid++;
      else if (paymentStatus === 'UNPAID') stats.unpaid++;
      else if (paymentStatus === 'REFUNDED') stats.refunded++;
      else if (paymentStatus === 'FAILED') stats.failed++;
    });

    return stats;
  }, [allBookings]);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
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
  }, []);

  const fetchAllBookings = useCallback(async () => {
    if (!transportData) return;

    setLoading(true);
    setError(null);
    setAllBookings([]);

    try {
      console.log("📡 Starting to fetch bookings for transport:", transportData);

      const ticketsUrl = `${API_BASE_URL}${COMPANY_TICKETS_ENDPOINT}`;
      const ticketsResponse = await fetchWithAuth(ticketsUrl);
      
      let ticketsData = [];
      if (ticketsResponse.ok) {
        const data = await ticketsResponse.json();
        
        if (data && data.success && Array.isArray(data.data)) {
          ticketsData = data.data;
        } else if (Array.isArray(data)) {
          ticketsData = data;
        } else if (data && Array.isArray(data.results)) {
          ticketsData = data.results;
        }
      }

      const manualUrl = `${API_BASE_URL}${ADMIN_BOOKINGS_ENDPOINT}`;
      const manualResponse = await fetchWithAuth(manualUrl);

      let manualData = [];
      if (manualResponse.ok) {
        const data = await manualResponse.json();

        if (Array.isArray(data)) {
          manualData = data;
        } else if (data && Array.isArray(data.results)) {
          manualData = data.results;
        } else if (data && Array.isArray(data.data)) {
          manualData = data.data;
        }
      }

      const manualMap = new Map();
      manualData.forEach(manual => {
        if (!manual) return;
        
        manualMap.set(manual.id, manual);
        
        if (manual.booking) {
          manualMap.set(manual.booking, manual);
        }
      });

      const processedTickets = ticketsData.map(ticket => {
        if (!ticket) return null;
        
        const vehicleMatch = 
          ticket.vehicle_number === transportData.vehicle_number ||
          ticket.vehicle_id == (transportData.vehicle_id || transportData.id) ||
          ticket.transport_id == (transportData.id || transportData.transport_id);
        
        if (!vehicleMatch) return null;
        
        const isTicketFullVehicle = ticket.ticket_type === "FULLVEHICLE" || 
                                  ticket.offer_type === "whole_hire" ||
                                  ticket.service_type === "long_drive" ||
                                  (ticket.vehicle_type && ticket.vehicle_type.toLowerCase().includes('hire'));
        
        if (!isHireOffer && isTicketFullVehicle) {
          return null;
        }
        
        if (isHireOffer && !isTicketFullVehicle) {
          return null;
        }
        
        if (!isHireOffer) {
          const ticketDate = ticket.arrival_date || ticket.travel_date;
          const ticketTime = ticket.arrival_time || ticket.travel_time;
          const transportDate = transportData.arrival_date;
          const transportTime = transportData.arrival_time;
          
          const normalizeTime = (time) => {
            if (!time) return '';
            return time.split(':').slice(0, 2).join(':');
          };
          
          const isDateMatch = ticketDate === transportDate;
          const isTimeMatch = normalizeTime(ticketTime) === normalizeTime(transportTime);
          
          if (!isDateMatch || !isTimeMatch) {
            return null;
          }
        }
        const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : '';
        const ticketBookingId = ticket.booking || ticket.booking_id;
        let matchingManual = null;
        
        if (ticketBookingId && manualMap.has(ticketBookingId)) {
          matchingManual = manualMap.get(ticketBookingId);
        } else if (ticket.id && manualMap.has(String(ticket.id))) {
          matchingManual = manualMap.get(String(ticket.id));
        } else if (ticket.passenger_name && ticket.vehicle_number) {
          matchingManual = manualData.find(manual => 
            manual.passenger_name === ticket.passenger_name && 
            manual.vehicle_number === ticket.vehicle_number
          );
        }
        
        let screenshotUrl = null;
        if (matchingManual?.screenshot_url) {
          const screenshot = matchingManual.screenshot_url;
          if (screenshot.startsWith('http') || screenshot.startsWith('data:image')) {
            screenshotUrl = screenshot;
          } else if (screenshot.startsWith('/media/')) {
            screenshotUrl =`${API_URL}${screenshot}`;
          } else {
           screenshotUrl = `${API_URL}/media/${screenshot}`;
          }
        }
        
        let departureDate = "N/A";
        let returnDate = "N/A";
        let bookingDuration = null;
        
        if (isTicketFullVehicle) {
          departureDate = ticket.departure_date || 
                         ticket.start_date || 
                         ticket.travel_start_date || 
                         ticket.arrival_date || 
                         "N/A";
          
          returnDate = ticket.return_date || 
                       ticket.end_date || 
                       ticket.travel_end_date || 
                       "N/A";
          
          if (ticket.duration_type && ticket.duration_value) {
            const durationValue = parseInt(ticket.duration_value) || 1;
            const durationType = ticket.duration_type.toLowerCase();
            bookingDuration = `${durationValue} ${durationType}${durationValue > 1 ? 's' : ''}`;
          }
        }
        
        let seats = [];
        if (ticket.seats) {
          if (Array.isArray(ticket.seats)) {
            seats = ticket.seats;
          } else if (typeof ticket.seats === 'string') {
            seats = ticket.seats.split(',').map(s => s.trim()).filter(s => s);
          }
        }
        
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
          amount = isTicketFullVehicle ? price : price * seatCount;
        }
        
        const bookingStatus = matchingManual?.booking_status || 
                             matchingManual?.status || 
                             ticket.status || 
                             "UNKNOWN";
        
        const paymentStatus = matchingManual?.payment_status || 
                             ticket.payment_status || 
                             "UNKNOWN";
        
        const paymentType = (ticket.payment_type || ticket.payment_method || '').toUpperCase();
        
        const offerType = ticket.offer_type || matchingManual?.offer_type || transportData.offer_type || 'seat_booking';
        
        const bookingId = ticketBookingId || `TICKET-${ticket.id}`;
        
        let serviceType = "Seat Booking";
        if (isTicketFullVehicle) {
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
          vehicleNumber: ticket.vehicle_number || matchingManual?.vehicle_number || transportData.vehicle_number,
          customerName: ticket.passenger_name || matchingManual?.passenger_name || "Guest",
          service: isTicketFullVehicle ? serviceType : `${seats.length || matchingManual?.seats_booked || 0} Seats`,
          amount: amount,
          date: safeDate(ticket.arrival_date || ticket.created_at),
          bookingStatus: bookingStatus,
          paymentStatus: paymentStatus,
          paymentType: paymentType,
          offerType: offerType,
          screenshotUrl: screenshotUrl,
          arrivalDate: ticket.arrival_date || "N/A",
          arrivalTime: ticket.arrival_time || "N/A",
          routeFrom: ticket.route_from || "N/A",
          routeTo: ticket.route_to || "N/A",
          departureDate: departureDate,
          returnDate: returnDate,
          bookingDuration: bookingDuration,
          seats: seats,
          seatsBooked: matchingManual?.seats_booked || seats.length || 0,
          hasTicket: true,
          raw: { 
            ...ticket, 
            manualData: matchingManual,
            departure_date: departureDate,
            return_date: returnDate,
            booking_duration: bookingDuration
          },
          source: matchingManual ? 'merged' : 'ticket'
        };
      }).filter(booking => booking !== null);

      const manualOnlyBookings = manualData
        .filter(manual => {
          const exists = processedTickets.some(booking => 
            booking.raw.manualData?.id === manual.id || 
            booking.bookingId === manual.id ||
            booking.bookingId === manual.booking
          );
          
          if (exists) return false;
          
          const vehicleMatch = 
            manual.vehicle_number === transportData.vehicle_number ||
            manual.vehicle_id == (transportData.vehicle_id || transportData.id);
          
          if (!vehicleMatch) return false;
          
          const isManualFullVehicle = manual.is_full_vehicle ||
            manual.offer_type === 'whole_vehicle' ||
            manual.ticket_type === 'FULLVEHICLE' ||
            (manual.vehicle_type && manual.vehicle_type.toLowerCase().includes('hire')) ||
            manual.service_type === "long_drive";
          
          if (!isHireOffer && isManualFullVehicle) {
            return false;
          }
          
          if (isHireOffer && !isManualFullVehicle) {
            return false;
          }
          
          if (!isHireOffer) {
            const manualDate = manual.arrival_date || manual.travel_date;
            const manualTime = manual.arrival_time || manual.travel_time;
            const transportDate = transportData.arrival_date;
            const transportTime = transportData.arrival_time;
            
            const normalizeTime = (time) => {
              if (!time) return '';
              return time.split(':').slice(0, 2).join(':');
            };
            
            const isDateMatch = manualDate === transportDate;
            const isTimeMatch = normalizeTime(manualTime) === normalizeTime(transportTime);
            
            if (!isDateMatch || !isTimeMatch) return false;
          }
          
          return true;
        })
        .map(manual => {
          const isManualFullVehicle = manual.is_full_vehicle ||
            manual.offer_type === 'whole_vehicle' ||
            manual.ticket_type === 'FULLVEHICLE' ||
            (manual.vehicle_type && manual.vehicle_type.toLowerCase().includes('hire')) ||
            manual.service_type === "long_drive";
          
          let seats = [];
          if (manual.seats) {
            if (Array.isArray(manual.seats)) {
              seats = manual.seats;
            } else if (typeof manual.seats === 'string') {
              seats = manual.seats.split(',').map(s => s.trim());
            }
          }
          const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : '';
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
          
          const offerType = manual.offer_type || transportData.offer_type || 'seat_booking';
          
          let serviceType = "Seat Booking";
          if (isManualFullVehicle) {
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
            vehicleNumber: manual.vehicle_number || transportData.vehicle_number,
            customerName: manual.passenger_name || "Guest",
            service: isManualFullVehicle ? serviceType : `${seats.length || manual.seats_booked || 0} Seats`,
            amount: amount,
            date: safeDate(manual.created_at),
            bookingStatus: manual.booking_status || manual.status || "UNKNOWN",
            paymentStatus: manual.payment_status || "UNKNOWN",
            paymentType: manual.payment_method || "MANUAL",
            offerType: offerType,
            screenshotUrl: screenshotUrl,
            arrivalDate: manual.arrival_date || manual.travel_date || "N/A",
            arrivalTime: manual.arrival_time || manual.travel_time || "N/A",
            routeFrom: manual.route_from || "N/A",
            routeTo: manual.route_to || "N/A",
            seats: seats,
            seatsBooked: manual.seats_booked || seats.length || 0,
            hasTicket: false,
            raw: manual,
            source: 'manual-only'
          };
        });

      const allCombinedBookings = [...processedTickets, ...manualOnlyBookings];
      
      console.log(`✅ Total combined bookings for this transport: ${allCombinedBookings.length}`);
      setAllBookings(allCombinedBookings);

    } catch (err) {
      if (err.message === 'NO_TOKEN') {
        setError('Authentication token missing. Please log in.');
        setLoading(false);
        return;
      }
      console.error('fetchAllBookings error:', err);
      setError(err.message || 'Failed to load booking data.');
    } finally {
      setLoading(false);
    }
  }, [transportData, isHireOffer, fetchWithAuth]);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const totalBookings = useMemo(() => allBookings.length, [allBookings]);

  const totalRevenue = useMemo(() => {
    return allBookings.reduce((total, booking) => total + (booking.amount || 0), 0).toLocaleString();
  }, [allBookings]);

  const bookedSeats = useMemo(() => {
    return allBookings.reduce((total, booking) => {
      return total + (booking.seatsBooked || (Array.isArray(booking.seats) ? booking.seats.length : 1) || 0);
    }, 0);
  }, [allBookings]);

  const filteredBookings = useMemo(() => {
    return allBookings.filter(booking => {
      const matchesSearch = searchTerm === "" || 
        booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.paymentType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPaymentType = filterPaymentType === "all" ||
        (filterPaymentType === "cash" && (booking.paymentType === "CASH" || booking.paymentType === "MANUAL")) ||
        (filterPaymentType === "Manual" && booking.paymentType === "MANUAL");
      
      const matchesStatus = filterStatus === "all" ||
        booking.bookingStatus?.toUpperCase() === filterStatus.toUpperCase() ||
        booking.paymentStatus?.toUpperCase() === filterStatus.toUpperCase();
      
      return matchesSearch && matchesPaymentType && matchesStatus;
    });
  }, [allBookings, searchTerm, filterPaymentType, filterStatus]);

  const handleViewBooking = useCallback((booking) => {
    setSelectedBookingForTicket(booking);
    setShowTicketModal(true);
  }, []);

  const handleUpdateBooking = useCallback((booking) => {
    setSelectedBookingForUpdate(booking);
    setShowUpdateModal(true);
  }, []);

  const handleViewScreenshot = useCallback((screenshotUrl) => {
    if (screenshotUrl) {
      setSelectedScreenshot(screenshotUrl);
      setShowScreenshotModal(true);
    }
  }, []);

  // 🔥 UPDATED: handleUpdateStatus with Email Notification
  const handleUpdateStatus = useCallback(async (bookingId, updates, sendEmail = true) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Find the booking
      const booking = allBookings.find(b => 
        b.id === bookingId || 
        b.bookingId === bookingId || 
        b.raw?.booking === bookingId ||
        b.raw?.booking_id === bookingId
      );
      
      if (!booking) {
        console.error("Booking not found for ID:", bookingId);
        alert("Booking not found!");
        return;
      }

      console.log("📤 Updating booking ID:", bookingId);
      console.log("Payment Type:", booking.paymentType);

      const apiBookingId = booking.raw?.booking || booking.bookingId || bookingId;
      
      let url, method, body;

      const paymentType = booking.paymentType || booking.payment_type || 'MANUAL';
      
      if (paymentType === 'MANUAL') {
        url = `${API_BASE_URL}${ADMIN_BOOKINGS_ENDPOINT}${apiBookingId}/status/`;
        method = 'PATCH';
        body = {
          booking_status: updates.status,
          new_payment_status: updates.payment_status,
        };
        console.log("Using MANUAL endpoint:", url);
      } else {
        url = `${API_BASE_URL}${CASH_ADMIN_UPDATE_ENDPOINT}${apiBookingId}/status/`;
        method = 'PATCH';
        body = {
          booking_status: updates.status,
          new_payment_status: updates.payment_status,
        };
        console.log("Using CASH endpoint:", url);
      }

      console.log("Request body:", body);

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Update successful:", result);

        // Update local state
        setAllBookings(prev => 
          prev.map(b => 
            (b.id === booking.id || b.bookingId === booking.bookingId || b.raw?.booking === apiBookingId)
              ? { 
                  ...b, 
                  bookingStatus: updates.status || b.bookingStatus,
                  paymentStatus: updates.payment_status || b.paymentStatus,
                  raw: {
                    ...b.raw,
                    status: updates.status,
                    payment_status: updates.payment_status,
                    booking_status: updates.status
                  }
                }
              : b
          )
        );

        // 🔥 Send Email Notification
        if (sendEmail) {
          try {
            const emailResult = await sendStatusUpdateEmail(booking, updates, token);
            
            if (emailResult.success) {
              setNotification({
                type: 'success',
                message: '✅ Status updated and email notification sent successfully!',
                show: true
              });
            } else {
              setNotification({
                type: 'warning',
                message: `✅ Status updated but email notification failed: ${emailResult.message}`,
                show: true
              });
            }
          } catch (emailError) {
            console.error("Email sending error:", emailError);
            setNotification({
              type: 'warning',
              message: '✅ Status updated but failed to send email notification.',
              show: true
            });
          }
        } else {
          setNotification({
            type: 'success',
            message: '✅ Status updated successfully!',
            show: true
          });
        }

        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
        
        // Close modal
        setShowUpdateModal(false);
        setSelectedBookingForUpdate(null);
        
      } else {
        const errorText = await response.text();
        console.error("❌ Update failed with response:", errorText);
        
        let errorMessage = "Failed to update status.";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        setNotification({
          type: 'error',
          message: `❌ ${errorMessage}`,
          show: true
        });
        
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      }

    } catch (error) {
      console.error("Update error:", error);
      setNotification({
        type: 'error',
        message: `❌ Error updating status: ${error.message}`,
        show: true
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  }, [allBookings]);

  const handleRetry = useCallback(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const downloadCSV = () => {
    const headers = ['Booking ID', 'Customer', 'Payment Type', 'Offer Type', 'Amount', 'Payment Status', 'Booking Status'];
    const csvData = filteredBookings.map(booking => [
      booking.bookingId,
      booking.customerName,
      booking.paymentType,
      booking.offerType,
      booking.amount,
      booking.paymentStatus,
      booking.bookingStatus
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + csvData.map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookings_${transportData.vehicle_number}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!transportData) return null;

  return (
    <>
      {/* Notification Banner */}
      {notification?.show && (
        <div className={`fixed top-4 right-4 z-[100] animate-slide-in`}>
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center ${notification.type === 'success' ? 'bg-green-100 border border-green-300' : notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-300' : 'bg-red-100 border border-red-300'}`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            ) : notification.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mr-3" />
            )}
            <span className={`font-medium ${notification.type === 'success' ? 'text-green-800' : notification.type === 'warning' ? 'text-yellow-800' : 'text-red-800'}`}>
              {notification.message}
            </span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-2 sm:p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-xl sm:rounded-2xl w-full max-w-full sm:max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b z-10">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                    {isHireOffer ? "Vehicle Hire Details" : "Transport Details"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <p className="text-sm sm:text-base text-gray-600 font-medium">
                      {transportData.vehicle_number} • {transportData.vehicle_type}
                    </p>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {isHireOffer ? "Full Vehicle" : "Seat Booking"}
                    </span>
                    <OfferTypeBadge offerType={transportData.offer_type} />
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b mt-4 sm:mt-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-3 sm:px-4 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${activeTab === "details" 
                    ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4" />
                    <span>Transport Details</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`px-3 sm:px-4 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${activeTab === "bookings" 
                    ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>All Bookings ({totalBookings})</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="overflow-y-auto max-h-[calc(95vh-250px)] sm:max-h-[calc(90vh-250px)]">
            {loading ? (
              <div className="p-6 text-center text-gray-500 bg-white shadow-lg rounded-xl">
                <Loader className="animate-spin h-5 w-5 mr-3 inline-block" />
                Loading bookings from backend API...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-gray-500 bg-white shadow-lg rounded-xl">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                {activeTab === "details" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                          <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                          Basic Information
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                            <Bus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500">Vehicle Number</p>
                              <p className="font-medium">{transportData.vehicle_number}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                            <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500">Offer Type</p>
                              <p className="font-medium">{offerTypeDisplay}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500">Total Seats</p>
                              <p className="font-medium">{transportData.vehicle_seats || "N/A"}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500">Driver</p>
                              <p className="font-medium">{transportData.driver_name || "N/A"}</p>
                            </div>
                          </div>
                          {transportData.driver_contact && (
                            <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                              <div>
                                <p className="text-xs sm:text-sm text-gray-500">Driver Contact</p>
                                <a 
                                  href={`tel:${transportData.driver_contact}`}
                                  className="font-medium text-blue-600 hover:text-blue-700"
                                >
                                  {transportData.driver_contact}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                          <Route className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
                          Journey Details
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {!isHireOffer ? (
                            <>
                              <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                                <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-500">Route</p>
                                  <p className="font-medium">
                                    {transportData.route_from || transportData.from_location} → 
                                    {transportData.route_to || transportData.to_location}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-500">Departure Date</p>
                                  <p className="font-medium">{safeDate(transportData.arrival_date)}</p>
                                </div>
                              </div>
                              <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-500">Departure Time</p>
                                  <p className="font-medium">{safeTime(transportData.arrival_time)}</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-500">Service Type</p>
                                  <p className="font-medium">
                                    {transportData.is_long_drive && "Long Drive"}
                                    {transportData.is_specific_route && "Specific Route"}
                                    {!transportData.is_long_drive && !transportData.is_specific_route && "General Hire"}
                                  </p>
                                </div>
                              </div>
                              {transportData.location_address && (
                                <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                                  <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Location</p>
                                    <p className="font-medium">{transportData.location_address}</p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex items-center p-2 hover:bg-gray-100 rounded">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3" />
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500">Pricing</p>
                              <p className="font-medium">
                                {isHireOffer ? (
                                  transportData.fixed_fare ? 
                                    `Fixed: Rs. ${transportData.fixed_fare}` :
                                    transportData.per_day_rate ?
                                      `Daily: Rs. ${transportData.per_day_rate}` :
                                      `Rate: Rs. ${transportData.rate_per_km}/km`
                                ) : (
                                  `Rs. ${transportData.price_per_seat}/seat`
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white shadow-xl rounded-xl p-4 sm:p-6 border border-gray-200">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                        Booking Statistics
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <p className="text-xs text-blue-600 font-medium">Total Bookings</p>
                          <p className="text-2xl font-bold text-blue-700">{bookingStats.total}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                          <p className="text-xs text-green-600 font-medium">Confirmed</p>
                          <p className="text-2xl font-bold text-green-700">{bookingStats.confirmed}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                          <p className="text-xs text-yellow-600 font-medium">Pending</p>
                          <p className="text-2xl font-bold text-yellow-700">{bookingStats.pending}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                          <p className="text-xs text-red-600 font-medium">Cancelled</p>
                          <p className="text-2xl font-bold text-red-700">{bookingStats.cancelled}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                            <PieChartIcon className="w-4 h-4 mr-2 text-purple-500" />
                            Booking Status Breakdown
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Confirmed</span>
                              <span className="font-bold text-green-600">{bookingStats.confirmed}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Pending</span>
                              <span className="font-bold text-yellow-600">{bookingStats.pending}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Reserved</span>
                              <span className="font-bold text-blue-600">{bookingStats.reserved}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Cancelled</span>
                              <span className="font-bold text-red-600">{bookingStats.cancelled}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Completed</span>
                              <span className="font-bold text-green-600">{bookingStats.completed}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                            <TrendingUpIcon className="w-4 h-4 mr-2 text-teal-500" />
                            Payment Status Breakdown
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Paid</span>
                              <span className="font-bold text-green-600">{bookingStats.paid}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Unpaid</span>
                              <span className="font-bold text-red-600">{bookingStats.unpaid}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Refunded</span>
                              <span className="font-bold text-blue-600">{bookingStats.refunded}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Failed</span>
                              <span className="font-bold text-red-600">{bookingStats.failed}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "bookings" && (
                  <div className="space-y-6">
                    <div className="bg-white shadow-xl rounded-xl p-4 border border-gray-200">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search by passenger, booking ID..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={filterPaymentType}
                            onChange={(e) => setFilterPaymentType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="all">All Payments</option>
                            <option value="Manual">Manual</option>
                            <option value="cash">Cash</option>
                          </select>
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="all">All Status</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PENDING">Pending</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="PAID">Paid</option>
                            <option value="UNPAID">Unpaid</option>
                          </select>
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setFilterPaymentType("all");
                              setFilterStatus("all");
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Reset
                          </button>
                          <button
                            onClick={downloadCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          >
                            <FileDown className="w-4 h-4" />
                            Download CSV
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white shadow-xl rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Total Bookings</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-800">
                              {totalBookings}
                            </p>
                          </div>
                          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                        </div>
                      </div>
                      <div className="bg-white shadow-xl rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
                            <p className="text-lg sm:text-2xl font-bold text-green-600">
                              Rs. {totalRevenue}
                            </p>
                          </div>
                          <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                        </div>
                      </div>
                      <div className="bg-white shadow-xl rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Booked Seats</p>
                            <p className="text-lg sm:text-2xl font-bold text-purple-600">
                              {bookedSeats}
                            </p>
                          </div>
                          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h2 className="text-xl font-bold text-gray-800">
                              <Bus className="inline-block w-5 h-5 mr-2 -mt-1 text-gray-800" />
                              Vehicle: <span className="text-indigo-600">{transportData.vehicle_number}</span>
                              <span className="ml-2 text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                {isHireOffer ? 'Full Vehicle' : 'Seat Booking'}
                              </span>
                              <OfferTypeBadge offerType={transportData.offer_type} />
                            </h2>
                            <div className="mt-2 text-sm text-gray-600">
                              <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {safeDate(transportData.arrival_date)}
                                <span className="ml-4 flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  Time: {safeTime(transportData.arrival_time)}
                                </span>
                              </p>
                              <p className="flex items-center mt-1">
                                <span className="mr-2">📍</span>
                                {transportData.route_from || transportData.from_location} → {transportData.route_to || transportData.to_location}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              <span className="font-semibold">{filteredBookings.length}</span> bookings
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Total bookings: {allBookings.length}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto max-h-[500px]">
                        {filteredBookings.length === 0 ? (
                          <div className="p-10 text-center text-gray-500 bg-white">
                            <Receipt className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No bookings found for this trip</p>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1">
                              {searchTerm || filterPaymentType !== "all" || filterStatus !== "all" 
                                ? "Try different search or filter" 
                                : "No bookings recorded yet"}
                            </p>
                          </div>
                        ) : (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer / Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredBookings.map((booking) => (
                                <BookingRow
                                  key={`${booking.id}-${booking.bookingId}`}
                                  booking={booking}
                                  bookingType={isHireOffer ? 'fullVehicle' : 'seat'}
                                  onView={handleViewBooking}
                                  onUpdate={handleUpdateBooking}
                                  onViewScreenshot={handleViewScreenshot}
                                />
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs sm:text-sm text-gray-500">
                {transportData.vehicle_number} • {safeDate(transportData.arrival_date)} • {safeTime(transportData.arrival_time)}
                {transportData.offer_type && (
                  <span className="ml-2">• Offer: {offerTypeDisplay}</span>
                )}
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  Refresh
                </button>
                <button
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-colors shadow-sm text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUpdateModal && (
        <UpdateStatusModal
          booking={selectedBookingForUpdate}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedBookingForUpdate(null);
          }}
          onUpdate={handleUpdateStatus}
        />
      )}

      {showTicketModal && (
        <TicketModal
          booking={selectedBookingForTicket}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedBookingForTicket(null);
          }}
          bookingType={isHireOffer ? 'fullVehicle' : 'seat'}
        />
      )}

      {showScreenshotModal && (
        <ScreenshotModal 
          screenshotUrl={selectedScreenshot} 
          onClose={() => {
            setShowScreenshotModal(false);
            setSelectedScreenshot(null);
          }} 
        />
      )}
    </>
  );
};

export default React.memo(TransportInfo);