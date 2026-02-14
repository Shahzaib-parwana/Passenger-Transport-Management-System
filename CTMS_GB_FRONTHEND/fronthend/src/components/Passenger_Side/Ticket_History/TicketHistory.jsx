import React, { useEffect, useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import { 
  History, Download, ArrowLeft, Ticket, Car, Clock, 
  DollarSign, User, Calendar, Search, Filter, X, 
  Users, Truck, MapPin, ChevronDown, ChevronUp 
} from "lucide-react";

// --- Custom Ticket Detail Component ---
const TicketDetailCard = ({ selectedTicket, transport, ticketRef, handleDownload, setSelectedTicket }) => {
  
  const totalPrice = (selectedTicket.seats?.length || 0) * (selectedTicket.price_per_seat || 0);
  const companyName = selectedTicket.transport_company || "PTMS Transport Service";
  const logoUrl = transport?.company_logo_url;

  // Check if it's full vehicle
  const isFullVehicle = selectedTicket.ticket_type === "FULLVEHICLE" || 
                       selectedTicket.offer_type === "whole_hire" ||
                       selectedTicket.service_type === "long_drive";

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setSelectedTicket(null)}
          className="flex items-center text-gray-700 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to History
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center bg-teal-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-teal-700 transition-all"
        >
          <Download className="w-5 h-5 mr-2" />
          Download PDF
        </button>
      </div>

      {/* Actual Ticket Design (Printable Area) */}
      <div ref={ticketRef} className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-dashed border-teal-300/80">
        
        {/* Header and Company Info */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <div className="flex flex-col">
            <h2 className="text-3xl font-extrabold text-teal-700 flex items-center">
              <Ticket className="w-7 h-7 mr-2 text-teal-500" /> E-TICKET
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isFullVehicle ? 'Full Vehicle Booking' : 'Seat Booking'}
            </p>
          </div>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Company Logo"
              className="w-16 h-16 object-contain rounded-full border border-gray-200 shadow-md"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="text-xl font-semibold text-gray-600">{companyName}</div>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-2">
          Booking ID: <span className="font-mono text-gray-700 font-bold">{selectedTicket.booking || selectedTicket.booking_id}</span>
        </p>

        {/* Route Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">FROM</p>
                <p className="text-xl font-bold text-gray-800">{selectedTicket.route_from}</p>
            </div>
            <div className="text-center flex flex-col items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-teal-600 rotate-180" />
                <p className="text-xs text-teal-600 font-bold">ROUTE</p>
            </div>
            <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">TO</p>
                <p className="text-xl font-bold text-gray-800">{selectedTicket.route_to}</p>
            </div>
        </div>

        {/* Key Information Grid */}
        <div className={`grid ${isFullVehicle ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} gap-4 mb-6`}>
            {/* Passenger */}
            <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center">
                  <User className="w-4 h-4 mr-1 text-teal-500"/> PASSENGER
                </p>
                <p className="font-semibold text-gray-800 truncate">{selectedTicket.passenger_name}</p>
            </div>
            
            {/* Date - Show departure and return for full vehicle */}
            {isFullVehicle ? (
              <>
                <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-teal-500"/> FROM DATE
                    </p>
                    <p className="font-semibold text-gray-800">
                      {selectedTicket.departure_date || selectedTicket.arrival_date}
                    </p>
                </div>
                
                {selectedTicket.return_date && (
                  <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-teal-500"/> TO DATE
                      </p>
                      <p className="font-semibold text-gray-800">{selectedTicket.return_date}</p>
                  </div>
                )}
                
                {/* Duration for full vehicle */}
                {selectedTicket.duration_type && selectedTicket.duration_value && (
                  <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-teal-500"/> DURATION
                      </p>
                      <p className="font-semibold text-gray-800">
                        {selectedTicket.duration_value} {selectedTicket.duration_type}
                        {parseInt(selectedTicket.duration_value) > 1 ? 's' : ''}
                      </p>
                  </div>
                )}
                
                {/* Departure Time */}
                <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-teal-500"/> DEPARTURE
                    </p>
                    <p className="font-semibold text-gray-800">{selectedTicket.arrival_time}</p>
                </div>
              </>
            ) : (
              <>
                {/* For seat bookings */}
                <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-teal-500"/> DATE
                    </p>
                    <p className="font-semibold text-gray-800">{selectedTicket.arrival_date}</p>
                </div>
                
                <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-teal-500"/> DEPARTURE
                    </p>
                    <p className="font-semibold text-gray-800">{selectedTicket.arrival_time}</p>
                </div>
              </>
            )}
            
            {/* Seats/Vehicle Type */}
            <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center">
                  {isFullVehicle ? <Truck className="w-4 h-4 mr-1 text-teal-500"/> : <Ticket className="w-4 h-4 mr-1 text-teal-500"/>}
                  {isFullVehicle ? 'VEHICLE TYPE' : 'SEATS'}
                </p>
                <p className="font-semibold text-gray-800">
                  {isFullVehicle
                    ? selectedTicket.vehicle_type || "Full Vehicle Reserved"
                    : selectedTicket.seats?.length > 0
                      ? selectedTicket.seats.join(", ")
                      : "—"}
                </p>
            </div>
        </div>

        {/* Detailed Info */}
        <div className="p-4 border-t border-b border-gray-200 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Vehicle No/Type:</span>
                <span className="font-bold text-gray-800 flex items-center">
                  <Car className="w-4 h-4 mr-1"/> {selectedTicket.vehicle_number}
                </span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Driver Name:</span>
                <span className="font-bold text-gray-800">{selectedTicket.driver_name}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-dashed border-gray-200">
                <span className="text-gray-600 font-medium">Total Amount Paid:</span>
                <span className="font-bold text-teal-700 text-lg flex items-center">
                  <DollarSign className="w-5 h-5 mr-1"/>
                  {isFullVehicle
                    ? Number(selectedTicket.price_per_seat || selectedTicket.total_amount || 0).toLocaleString()
                    : totalPrice.toLocaleString()
                  } Rs
                </span>
            </div>
        </div>

        {/* Footer: QR Code & Validation */}
        <div className="flex justify-between items-end">
            <div className="text-center">
                <QRCodeCanvas
                  value={JSON.stringify({
                      booking_id: selectedTicket.booking || selectedTicket.booking_id,
                      booking_type: isFullVehicle ? 'full_vehicle' : 'seat',
                      seats: selectedTicket.seats?.join(','),
                      cnic: selectedTicket.passenger_cnic
                  })}
                  size={120}
                  className="p-1 border border-gray-200 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-2">Scan for Validation</p>
            </div>
            <div className="text-right">
                <p className="text-xl font-extrabold text-red-600/90">{selectedTicket.status?.toUpperCase()}</p>
                <p className="text-xl font-extrabold text-red-600/90">{selectedTicket.payment_status?.toUpperCase()}</p>
                <p className="text-xs text-gray-500">Thank you for traveling with us!</p>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Search and Filter Component ---
const SearchFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  setActiveTab,
  showFilters,
  setShowFilters,
  dateFilter,
  setDateFilter,
  fromFilter,
  setFromFilter,
  toFilter,
  setToFilter,
  allTickets 
}) => {
  
  // Get unique routes for dropdown suggestions
  const uniqueFromLocations = useMemo(() => {
    const locations = allTickets.map(ticket => ticket.route_from).filter(Boolean);
    return [...new Set(locations)];
  }, [allTickets]);

  const uniqueToLocations = useMemo(() => {
    const locations = allTickets.map(ticket => ticket.route_to).filter(Boolean);
    return [...new Set(locations)];
  }, [allTickets]);

  const uniqueDates = useMemo(() => {
    const dates = allTickets.map(ticket => ticket.arrival_date).filter(Boolean);
    return [...new Set(dates)];
  }, [allTickets]);

  return (
    <div className="space-y-4 mb-6">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by booking ID, passenger name, vehicle number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs and Filter Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Tabs */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setActiveTab('seat')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center ${
              activeTab === 'seat'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Seat Bookings
          </button>
          <button
            onClick={() => setActiveTab('fullVehicle')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center ${
              activeTab === 'fullVehicle'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Truck className="w-4 h-4 mr-2" />
            Full Vehicle
          </button>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
          {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* From Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Location
              </label>
              <select
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Locations</option>
                {uniqueFromLocations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* To Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Location
              </label>
              <select
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Locations</option>
                {uniqueToLocations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Dates</option>
                {uniqueDates.map((date, index) => (
                  <option key={index} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(fromFilter || toFilter || dateFilter) && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setFromFilter('');
                  setToFilter('');
                  setDateFilter('');
                }}
                className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
export default function TicketHistory({ setStep, transport }) {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'seat', 'fullVehicle'
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  
  const ticketRef = useRef();

  // --- Fetch Tickets ---
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("access_token");
        // "http://127.0.0.1:8000/api/tickets/my-tickets/"
        const response = await fetch("/api/tickets/my-tickets/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        const ticketsArray = Array.isArray(data) ? data : (data.data || []);
        
        // Sort by date (newest first)
        const sortedTickets = ticketsArray.sort((a, b) => {
          const dateA = new Date(a.created_at || a.booking_date || 0);
          const dateB = new Date(b.created_at || b.booking_date || 0);
          return dateB - dateA;
        });
        
        setTickets(sortedTickets);
        setFilteredTickets(sortedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // --- Filter Tickets ---
  useEffect(() => {
    let filtered = tickets;

    // Filter by type
    if (activeTab === 'seat') {
      filtered = filtered.filter(ticket => 
        !(ticket.ticket_type === "FULLVEHICLE" || 
          ticket.offer_type === "whole_hire" ||
          ticket.service_type === "long_drive")
      );
    } else if (activeTab === 'fullVehicle') {
      filtered = filtered.filter(ticket => 
        ticket.ticket_type === "FULLVEHICLE" || 
        ticket.offer_type === "whole_hire" ||
        ticket.service_type === "long_drive"
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => 
        (ticket.booking && ticket.booking.toLowerCase().includes(query)) ||
        (ticket.passenger_name && ticket.passenger_name.toLowerCase().includes(query)) ||
        (ticket.vehicle_number && ticket.vehicle_number.toLowerCase().includes(query)) ||
        (ticket.route_from && ticket.route_from.toLowerCase().includes(query)) ||
        (ticket.route_to && ticket.route_to.toLowerCase().includes(query))
      );
    }

    // Filter by from location
    if (fromFilter) {
      filtered = filtered.filter(ticket => 
        ticket.route_from === fromFilter
      );
    }

    // Filter by to location
    if (toFilter) {
      filtered = filtered.filter(ticket => 
        ticket.route_to === toFilter
      );
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(ticket => 
        ticket.arrival_date === dateFilter
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, activeTab, searchQuery, fromFilter, toFilter, dateFilter]);

  // --- Download function ---
  const handleDownload = async () => {
    const element = ticketRef.current;
    if (!element) return;

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
    
    const fileName = `ticket_${selectedTicket?.passenger_name?.replace(/\s/g, '_') || "passenger"}_${selectedTicket?.booking || selectedTicket?.booking_id}.pdf`;
    pdf.save(fileName);
  };

  // --- Stats ---
  const seatBookingsCount = tickets.filter(ticket => 
    !(ticket.ticket_type === "FULLVEHICLE" || 
      ticket.offer_type === "whole_hire" ||
      ticket.service_type === "long_drive")
  ).length;

  const fullVehicleCount = tickets.filter(ticket => 
    ticket.ticket_type === "FULLVEHICLE" || 
    ticket.offer_type === "whole_hire" ||
    ticket.service_type === "long_drive"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your booking history...</p>
        </div>
      </div>
    );
  }

  // 2. Ticket Detail View
  if (selectedTicket) {
    return (
      <TicketDetailCard 
        selectedTicket={selectedTicket} 
        transport={transport} 
        ticketRef={ticketRef} 
        handleDownload={handleDownload} 
        setSelectedTicket={setSelectedTicket} 
      />
    );
  }

  // 1. Default View: List of Tickets with Filters
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Booking History</h1>
        <p className="text-gray-600">View and manage all your past and upcoming bookings</p>
        
        {/* Stats */}
        <div className="flex space-x-4 mt-4">
          <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-600">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-700">{tickets.length}</p>
          </div>
          <div className="px-4 py-2 bg-green-50 rounded-lg border border-green-100">
            <p className="text-sm text-green-600">Seat Bookings</p>
            <p className="text-2xl font-bold text-green-700">{seatBookingsCount}</p>
          </div>
          <div className="px-4 py-2 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-600">Full Vehicle</p>
            <p className="text-2xl font-bold text-purple-700">{fullVehicleCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        fromFilter={fromFilter}
        setFromFilter={setFromFilter}
        toFilter={toFilter}
        setToFilter={setToFilter}
        allTickets={tickets}
      />

      {/* Results Count */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Showing <span className="font-bold">{filteredTickets.length}</span> of <span className="font-bold">{tickets.length}</span> bookings
        </p>
        {filteredTickets.length === 0 && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFromFilter('');
              setToFilter('');
              setDateFilter('');
            }}
            className="text-sm text-teal-600 hover:text-teal-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Ticket className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No bookings found</p>
          <p className="text-gray-500 mt-2">
            {searchQuery || fromFilter || toFilter || dateFilter 
              ? "Try adjusting your filters"
              : "You haven't made any bookings yet"}
          </p>
          {(searchQuery || fromFilter || toFilter || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFromFilter('');
                setToFilter('');
                setDateFilter('');
              }}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket, idx) => {
            const isFullVehicle = ticket.ticket_type === "FULLVEHICLE" || 
                                 ticket.offer_type === "whole_hire" ||
                                 ticket.service_type === "long_drive";
            
            return (
              <div
                key={idx}
                onClick={() => setSelectedTicket(ticket)}
                className={`grid grid-cols-1 md:grid-cols-5 items-center p-4 rounded-xl shadow-md bg-white border-l-4 ${
                  isFullVehicle ? 'border-purple-500 hover:bg-purple-50' : 'border-teal-500 hover:bg-teal-50'
                } cursor-pointer hover:shadow-lg transition-all duration-300`}
              >
                {/* Route and Booking Info */}
                <div className="col-span-2">
                  <div className="flex items-center">
                    {isFullVehicle ? (
                      <Truck className="w-5 h-5 mr-2 text-purple-500" />
                    ) : (
                      <Users className="w-5 h-5 mr-2 text-teal-500" />
                    )}
                    <div>
                      <p className="text-lg font-bold text-gray-800">
                        {ticket.route_from} → {ticket.route_to}
                      </p>
                      <p className="text-sm text-gray-500">
                        Booking: <span className="font-mono">{ticket.booking || ticket.booking_id}</span>
                      </p>
                    </div>
                  </div>
                  {isFullVehicle && ticket.duration_type && ticket.duration_value && (
                    <div className="mt-2 flex items-center text-sm text-purple-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {ticket.duration_value} {ticket.duration_type}
                      {parseInt(ticket.duration_value) > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Date and Time */}
                <div className="text-sm text-gray-600 md:text-center mt-2 md:mt-0">
                  <div className="flex items-center justify-center md:justify-start">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {ticket.arrival_date}
                  </div>
                  <div className="flex items-center justify-center md:justify-start mt-1">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    {ticket.arrival_time}
                  </div>
                </div>

                {/* Seats/Type */}
                <div className="text-sm text-gray-600 md:text-center mt-2 md:mt-0">
                  {isFullVehicle ? (
                    <div className="flex flex-col items-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Full Vehicle
                      </span>
                      {ticket.vehicle_number && (
                        <span className="text-xs text-gray-500 mt-1">{ticket.vehicle_number}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Ticket className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="font-bold">
                        {ticket.seats?.length || 0} Seat{ticket.seats?.length !== 1 ? 's' : ''}
                      </span>
                      {ticket.seats?.length > 0 && (
                        <span className="ml-2 text-gray-500">({ticket.seats?.join(", ")})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status and Amount */}
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.payment_status === 'PAID' 
                      ? 'bg-green-100 text-green-700'
                      : ticket.payment_status === 'UNPAID'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {ticket.payment_status || 'Unknown'}
                  </div>
                  <p className="text-lg font-bold text-gray-800 mt-2">
                    Rs {isFullVehicle 
                      ? Number(ticket.price_per_seat || ticket.total_amount || 0).toLocaleString()
                      : ((ticket.seats?.length || 0) * (ticket.price_per_seat || 0)).toLocaleString()
                    }
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Back to Dashboard Button */}
      {setStep && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setStep("dashboard")}
            className="flex items-center mx-auto bg-gray-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}