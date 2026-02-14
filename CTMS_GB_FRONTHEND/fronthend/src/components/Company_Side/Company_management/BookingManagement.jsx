import React, { useEffect, useState, useCallback } from "react";
import apiPrivate from "../../../api/apiprivate";
const BookingManagement = () => {
  const [seatBookingsByOffer, setSeatBookingsByOffer] = useState({});
  const [vehicleBookingsByOffer, setVehicleBookingsByOffer] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("seat"); // "seat" or "vehicle"
  
  const [stats, setStats] = useState({
    seat: {
      totalGroups: 0,
      totalBookings: 0,
      totalReserved: 0,
      totalBooked: 0,
      totalRevenue: 0
    },
    vehicle: {
      totalGroups: 0,
      totalBookings: 0,
      totalReserved: 0,
      totalBooked: 0,
      totalRevenue: 0
    }
  });

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching company tickets...");
      
      const res = await apiPrivate.get("/tickets/company-tickets/");
      
      console.log("✅ API Response:", {
        status: res.status,
        data: res.data
      });

      // Handle different response structures
      let bookingsData = [];
      
      if (res.data && Array.isArray(res.data)) {
        bookingsData = res.data;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        bookingsData = res.data.data;
      } else if (res.data && res.data.tickets && Array.isArray(res.data.tickets)) {
        bookingsData = res.data.tickets;
      } else {
        console.error("❌ Unexpected response structure:", res.data);
        setError("Unexpected data format from server");
        return;
      }

      console.log(`📊 Processing ${bookingsData.length} bookings...`);

      if (bookingsData.length === 0) {
        console.log("ℹ️ No bookings found");
        setSeatBookingsByOffer({});
        setVehicleBookingsByOffer({});
        setStats({
          seat: { 
            totalGroups: 0, 
            totalBookings: 0, 
            totalReserved: 0,
            totalBooked: 0,
            totalRevenue: 0 
          },
          vehicle: { 
            totalGroups: 0, 
            totalBookings: 0, 
            totalReserved: 0,
            totalBooked: 0,
            totalRevenue: 0 
          }
        });
        return;
      }

      // Separate seat bookings and vehicle bookings
      const seatBookings = [];
      const vehicleBookings = [];

      bookingsData.forEach(booking => {
        // Check if this is a vehicle booking (whole_hire offer type OR ticket_type === 'full_vehicle')
        const isVehicleBooking = 
          booking.offer_type === 'whole_hire' || 
          booking.transport?.offer_type === 'whole_hire' ||
          booking.ticket_type === 'FULLVEHICLE' ||
          booking.ticket_type === 'vehicle' ||
          (booking.total_price && booking.total_price > 10000) || // Heuristic: vehicle bookings have higher total
          (booking.vehicle_type && booking.vehicle_type.toLowerCase().includes('hire'));
        
        if (isVehicleBooking) {
          vehicleBookings.push(booking);
        } else {
          seatBookings.push(booking);
        }
      });

      console.log(`🚌 Seat Bookings: ${seatBookings.length}, 🚗 Vehicle Bookings: ${vehicleBookings.length}`);

      // Process seat bookings (group by vehicle and date)
      const processedSeatBookings = processSeatBookings(seatBookings);
      setSeatBookingsByOffer(processedSeatBookings);

      // Process vehicle bookings (group by vehicle and date)
      const processedVehicleBookings = processVehicleBookings(vehicleBookings);
      setVehicleBookingsByOffer(processedVehicleBookings);

      // Calculate stats for seat bookings
      const seatGroups = Object.keys(processedSeatBookings).length;
      const seatTotalBookings = Object.values(processedSeatBookings)
        .reduce((sum, group) => sum + group.bookings.length, 0);
      
      const seatTotalReserved = Object.values(processedSeatBookings)
        .reduce((sum, group) => {
          const reserved = group.bookings.filter(b => 
            b.status?.toLowerCase() === 'reserved' || 
            b.booking_status?.toLowerCase() === 'reserved'
          ).length;
          return sum + reserved;
        }, 0);
      
      const seatTotalBooked = Object.values(processedSeatBookings)
        .reduce((sum, group) => {
          const booked = group.bookings.filter(b => 
            b.status?.toLowerCase() === 'booked' || 
            b.status?.toLowerCase() === 'confirmed' ||
            b.booking_status?.toLowerCase() === 'booked' ||
            b.booking_status?.toLowerCase() === 'confirmed'
          ).length;
          return sum + booked;
        }, 0);
      
      const seatTotalRevenue = Object.values(processedSeatBookings)
        .reduce((sum, group) => sum + group.totalRevenue, 0);

      // Calculate stats for vehicle bookings
      const vehicleGroups = Object.keys(processedVehicleBookings).length;
      const vehicleTotalBookings = Object.values(processedVehicleBookings)
        .reduce((sum, group) => sum + group.bookings.length, 0);
      
      const vehicleTotalReserved = Object.values(processedVehicleBookings)
        .reduce((sum, group) => {
          const reserved = group.bookings.filter(b => 
            b.status?.toLowerCase() === 'reserved' || 
            b.booking_status?.toLowerCase() === 'reserved'
          ).length;
          return sum + reserved;
        }, 0);
      
      const vehicleTotalBooked = Object.values(processedVehicleBookings)
        .reduce((sum, group) => {
          const booked = group.bookings.filter(b => 
            b.status?.toLowerCase() === 'booked' || 
            b.status?.toLowerCase() === 'confirmed' ||
            b.booking_status?.toLowerCase() === 'booked' ||
            b.booking_status?.toLowerCase() === 'confirmed'
          ).length;
          return sum + booked;
        }, 0);
      
      const vehicleTotalRevenue = Object.values(processedVehicleBookings)
        .reduce((sum, group) => sum + group.totalRevenue, 0);

      setStats({
        seat: {
          totalGroups: seatGroups,
          totalBookings: seatTotalBookings,
          totalReserved: seatTotalReserved,
          totalBooked: seatTotalBooked,
          totalRevenue: seatTotalRevenue
        },
        vehicle: {
          totalGroups: vehicleGroups,
          totalBookings: vehicleTotalBookings,
          totalReserved: vehicleTotalReserved,
          totalBooked: vehicleTotalBooked,
          totalRevenue: vehicleTotalRevenue
        }
      });

      setError(null);

    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  // Process seat bookings (original logic)
  const processSeatBookings = (bookingsData) => {
    if (bookingsData.length === 0) return {};

    return bookingsData.reduce((acc, booking) => {
      try {
        const vehicleNumber = booking.vehicle_number || 
                            booking.transport?.vehicle_number || 
                            "Unknown Vehicle";
        
        const arrivalDate = booking.arrival_date || 
                          booking.transport?.arrival_date || 
                          "Unknown Date";
        
        const routeFrom = booking.route_from || 
                        booking.transport?.route_from || 
                        "Unknown";
        
        const routeTo = booking.route_to || 
                      booking.transport?.route_to || 
                      "Unknown";
        
        const arrivalTime = booking.arrival_time || 
                          booking.transport?.arrival_time || 
                          "Unknown";

        const groupKey = `${vehicleNumber}_${arrivalDate}_seat`;
        
        if (!acc[groupKey]) {
          acc[groupKey] = {
            offerId: groupKey,
            vehicle_number: vehicleNumber,
            date: arrivalDate,
            route_from: routeFrom,
            route_to: routeTo,
            bookings: [],
            times: new Set(),
            totalRevenue: 0,
            totalReserved: 0,
            totalBooked: 0,
            bookingType: "seat"
          };
        }
        
        // Determine payment type
        const paymentType = booking.payment_type || 
                          booking.payment_method || 
                          (booking.is_manual_payment ? "Manual (Advance)" : 
                          (booking.is_cash_payment ? "Cash" : "Unknown"));
        
        // Determine status
        const status = booking.status || booking.booking_status || "Pending";
        
        acc[groupKey].bookings.push({
          ...booking,
          vehicle_number: vehicleNumber,
          arrival_date: arrivalDate,
          arrival_time: arrivalTime,
          route_from: routeFrom,
          route_to: routeTo,
          passenger_name: booking.passenger_name || 
                        booking.user?.name || 
                        booking.user?.username || 
                        "Unknown",
          passenger_contact: booking.passenger_contact || 
                           booking.user?.phone || 
                           booking.user?.contact || 
                           "N/A",
          seats: booking.seats || [booking.seat_number || "N/A"],
          price_per_seat: booking.price_per_seat || 
                        booking.total_price || 
                        booking.fare || 
                        0,
          booking: booking.booking || 
                 booking.booking_number || 
                 booking.id || 
                 "N/A",
          status: status,
          payment_type: paymentType
        });
        
        if (arrivalTime && arrivalTime !== "Unknown") {
          acc[groupKey].times.add(arrivalTime);
        }
        
        const price = parseFloat(booking.price_per_seat || 
                               booking.total_price || 
                               booking.fare || 0);
        const seats = Array.isArray(booking.seats) ? 
                     booking.seats.length : 
                     (booking.seat_number ? 1 : 1);
        
        acc[groupKey].totalRevenue += price * seats;
        
        // Update reserved and booked counts
        if (status.toLowerCase() === 'reserved') {
          acc[groupKey].totalReserved += 1;
        } else if (status.toLowerCase() === 'booked' || status.toLowerCase() === 'confirmed') {
          acc[groupKey].totalBooked += 1;
        }
        
        return acc;
      } catch (err) {
        console.error("❌ Error processing seat booking:", err, booking);
        return acc;
      }
    }, {});
  };

  // Process vehicle bookings
  const processVehicleBookings = (bookingsData) => {
    if (bookingsData.length === 0) return {};

    return bookingsData.reduce((acc, booking) => {
      try {
        const vehicleNumber = booking.vehicle_number || 
                            booking.transport?.vehicle_number || 
                            booking.vehicle_type || 
                            "Vehicle Hire";
        
        const startDate = booking.start_date || 
                        booking.arrival_date || 
                        booking.transport?.arrival_date || 
                        "Unknown Date";
        
        const endDate = booking.end_date || 
                      booking.departure_date || 
                      booking.transport?.departure_date || 
                      "Unknown";
        
        const routeFrom = booking.route_from || 
                        booking.transport?.route_from || 
                        booking.from_location || 
                        "Unknown";
        
        const routeTo = booking.route_to || 
                      booking.transport?.route_to || 
                      booking.to_location || 
                      "Unknown";

        const groupKey = `${vehicleNumber}_${startDate}_vehicle`;
        
        if (!acc[groupKey]) {
          acc[groupKey] = {
            offerId: groupKey,
            vehicle_number: vehicleNumber,
            start_date: startDate,
            end_date: endDate,
            route_from: routeFrom,
            route_to: routeTo,
            bookings: [],
            totalRevenue: 0,
            totalReserved: 0,
            totalBooked: 0,
            bookingType: "vehicle"
          };
        }
        
        // Determine payment type
        const paymentType = booking.payment_type || 
                          booking.payment_method || 
                          (booking.is_manual_payment ? "Manual (Advance)" : 
                          (booking.is_cash_payment ? "Cash" : "Unknown"));
        
        // Determine status
        const status = booking.status || booking.booking_status || "Pending";
        
        acc[groupKey].bookings.push({
          ...booking,
          vehicle_number: vehicleNumber,
          start_date: startDate,
          end_date: endDate,
          route_from: routeFrom,
          route_to: routeTo,
          passenger_name: booking.passenger_name || 
                        booking.user?.name || 
                        booking.user?.username || 
                        booking.customer_name || 
                        "Unknown",
          passenger_contact: booking.passenger_contact || 
                           booking.user?.phone || 
                           booking.user?.contact || 
                           booking.customer_phone || 
                           "N/A",
          total_fare: booking.total_price || 
                     booking.total_fare || 
                     booking.fixed_fare || 
                     booking.fare || 
                     0,
          booking: booking.booking || 
                 booking.booking_number || 
                 booking.id || 
                 "N/A",
          status: status,
          payment_type: paymentType,
          rental_days: booking.rental_days || booking.duration || "N/A",
          vehicle_type: booking.vehicle_type || booking.transport?.vehicle_type || "N/A",
          ticket_type: booking.ticket_type || "vehicle"
        });
        
        const fare = parseFloat(booking.total_price || 
                              booking.total_fare || 
                              booking.fixed_fare || 
                              booking.fare || 0);
        
        acc[groupKey].totalRevenue += fare;
        
        // Update reserved and booked counts
        if (status.toLowerCase() === 'reserved') {
          acc[groupKey].totalReserved += 1;
        } else if (status.toLowerCase() === 'booked' || status.toLowerCase() === 'confirmed') {
          acc[groupKey].totalBooked += 1;
        }
        
        return acc;
      } catch (err) {
        console.error("❌ Error processing vehicle booking:", err, booking);
        return acc;
      }
    }, {});
  };

  // Initial fetch
  useEffect(() => {
    fetchBookings();
    
    const interval = setInterval(fetchBookings, 60000);
    return () => clearInterval(interval);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString || dateString === "Unknown Date") return "Date not set";
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

  // CSV Download
  const downloadCSV = (groupKey, bookings, type) => {
    const headers = type === "seat" ? [
      "Booking ID", "Passenger Name", "CNIC", "Phone", 
      "Seats", "Fare per Seat", "Total Fare", "Payment Type", "Status",
      "Vehicle", "Date", "Time", "From", "To"
    ] : [
      "Booking ID", "Customer Name", "Phone", 
      "Vehicle Type", "Total Fare", "Rental Days", "Payment Type", "Status",
      "Vehicle", "Start Date", "End Date", "From", "To", "Ticket Type", "Notes"
    ];

    const rows = bookings.map(b => {
      if (type === "seat") {
        return [
          b.booking,
          b.passenger_name,
          b.passenger_cnic || "N/A",
          b.passenger_contact,
          Array.isArray(b.seats) ? b.seats.join(", ") : b.seats,
          b.price_per_seat,
          (Array.isArray(b.seats) ? b.seats.length : 1) * parseFloat(b.price_per_seat),
          b.payment_type || "N/A",
          b.status,
          b.vehicle_number,
          b.arrival_date,
          b.arrival_time,
          b.route_from,
          b.route_to
        ];
      } else {
        return [
          b.booking,
          b.passenger_name,
          b.passenger_contact,
          b.vehicle_type,
          b.total_fare,
          b.rental_days,
          b.payment_type || "N/A",
          b.status,
          b.vehicle_number,
          b.start_date,
          b.end_date,
          b.route_from,
          b.route_to,
          b.ticket_type || "vehicle",
          b.notes || b.comments || "N/A"
        ];
      }
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}_bookings_${groupKey.replace(/[^a-z0-9]/gi, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-lg text-gray-600">Loading bookings...</p>
            <p className="text-sm text-gray-400">Fetching data from server</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 text-red-500">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.771-.833-2.542 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Bookings</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchBookings}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if any bookings exist
  const hasSeatBookings = Object.keys(seatBookingsByOffer).length > 0;
  const hasVehicleBookings = Object.keys(vehicleBookingsByOffer).length > 0;

  // Empty state for both types
  if (!hasSeatBookings && !hasVehicleBookings) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center mt-8">
            <div className="w-24 h-24 mx-auto mb-8 text-gray-300">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Bookings Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't received any bookings yet. Bookings will appear here as passengers book tickets for your vehicles.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={fetchBookings}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-6">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">View and manage all ticket and vehicle bookings</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("seat")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "seat"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Seat Bookings
                {hasSeatBookings && (
                  <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {stats.seat.totalBookings}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("vehicle")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "vehicle"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Vehicle Bookings
                {hasVehicleBookings && (
                  <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {stats.vehicle.totalBookings}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Stats - Updated with Reserved and Booked */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-xl font-bold text-blue-600">
                  {activeTab === "seat" ? stats.seat.totalGroups : stats.vehicle.totalGroups}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total {activeTab === "seat" ? "Trips" : "Vehicle Hires"}</p>
                <p className="text-lg font-bold text-gray-900">
                  {activeTab === "seat" ? stats.seat.totalGroups : stats.vehicle.totalGroups}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                <span className="text-xl font-bold text-green-600">
                  {activeTab === "seat" ? stats.seat.totalBookings : stats.vehicle.totalBookings}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-lg font-bold text-gray-900">
                  {activeTab === "seat" ? stats.seat.totalBookings : stats.vehicle.totalBookings}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mr-4">
                <span className="text-xl font-bold text-yellow-600">
                  {activeTab === "seat" ? stats.seat.totalReserved : stats.vehicle.totalReserved}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Reserved</p>
                <p className="text-lg font-bold text-gray-900">
                  {activeTab === "seat" ? stats.seat.totalReserved : stats.vehicle.totalReserved}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
                <span className="text-xl font-bold text-purple-600">
                  {activeTab === "seat" ? stats.seat.totalBooked : stats.vehicle.totalBooked}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Booked</p>
                <p className="text-lg font-bold text-gray-900">
                  {activeTab === "seat" ? stats.seat.totalBooked : stats.vehicle.totalBooked}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mr-4">
                <span className="text-xl font-bold text-indigo-600">PKR</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold text-gray-900">
                  {activeTab === "seat" 
                    ? stats.seat.totalRevenue.toLocaleString()
                    : stats.vehicle.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "seat" ? (
          // Seat Bookings Section
          hasSeatBookings ? (
            <div className="space-y-6">
              {Object.values(seatBookingsByOffer).map((group) => (
                <SeatBookingGroup 
                  key={group.offerId} 
                  group={group} 
                  formatDate={formatDate} 
                  downloadCSV={downloadCSV} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Seat Bookings</h3>
              <p className="text-gray-600">No seat bookings have been made yet.</p>
            </div>
          )
        ) : (
          // Vehicle Bookings Section
          hasVehicleBookings ? (
            <div className="space-y-6">
              {Object.values(vehicleBookingsByOffer).map((group) => (
                <VehicleBookingGroup 
                  key={group.offerId} 
                  group={group} 
                  formatDate={formatDate} 
                  downloadCSV={downloadCSV} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Vehicle Bookings</h3>
              <p className="text-gray-600">No vehicle hire bookings have been made yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Seat Booking Group Component - Updated with Payment Type
const SeatBookingGroup = ({ group, formatDate, downloadCSV }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">🚌</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {group.vehicle_number}
              </h2>
              <p className="text-gray-600">
                {group.route_from} → {group.route_to}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-gray-700">
            <div className="flex items-center">
              <span className="font-semibold mr-2">Date:</span>
              {formatDate(group.date)}
            </div>
            {group.times && group.times.size > 0 && (
              <div className="flex items-center">
                <span className="font-semibold mr-2">Time:</span>
                {Array.from(group.times).join(", ")}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-wrap gap-3 mb-2">
            <div className="flex items-center">
              <span className="font-semibold mr-2">Reserved:</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                {group.totalReserved}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Booked:</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                {group.totalBooked}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Total:</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">
                {group.bookings.length}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => downloadCSV(group.offerId, group.bookings, "seat")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            
            <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
              PKR {group.totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Seat Bookings Table - Updated with Payment Type */}
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Booking ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Passenger
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CNIC
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Seats
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Fare
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {group.bookings.map((booking, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-mono text-sm font-medium text-gray-900">
                  {booking.booking}
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">
                    {booking.passenger_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.passenger_contact}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-mono text-sm font-medium text-gray-900">
                  {booking.passenger_cnic || "N/A"}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(booking.seats) ? (
                    booking.seats.map((seat, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                      >
                        {seat}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-900">{booking.seats}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  PKR {
                    (
                      (Array.isArray(booking.seats) ? booking.seats.length : 1) *
                      parseFloat(booking.price_per_seat)
                    ).toFixed(2)
                  }
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${booking.payment_type?.toLowerCase().includes('cash') ? 
                    'bg-green-100 text-green-800' : 
                    booking.payment_type?.toLowerCase().includes('manual') ? 
                    'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {booking.payment_type || "Unknown"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${booking.status === 'Reserved' ? 
                    'bg-yellow-100 text-yellow-800' : 
                    booking.status === 'Confirmed' || booking.status === 'Booked' ? 
                    'bg-green-100 text-green-800' : 
                    booking.status === 'Cancelled' ? 
                    'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {booking.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {booking.arrival_time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Vehicle Booking Group Component - Updated with Payment Type and Ticket Type
const VehicleBookingGroup = ({ group, formatDate, downloadCSV }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">🚗</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {group.vehicle_number}
                <span className="ml-3 text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {group.bookings[0]?.ticket_type === 'full_vehicle' ? 'Full Vehicle' : 'Vehicle Hire'}
                </span>
              </h2>
              <p className="text-gray-600">
                {group.route_from} → {group.route_to}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-gray-700">
            <div className="flex items-center">
              <span className="font-semibold mr-2">Start:</span>
              {formatDate(group.start_date)}
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">End:</span>
              {formatDate(group.end_date)}
            </div>
            {group.bookings[0]?.ticket_type && (
              <div className="flex items-center">
                <span className="font-semibold mr-2">Type:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {group.bookings[0]?.ticket_type === 'FULLVEHICLE' ? 'Full Vehicle' : group.bookings[0]?.ticket_type}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-wrap gap-3 mb-2">
            <div className="flex items-center">
              <span className="font-semibold mr-2">Reserved:</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                {group.totalReserved}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Booked:</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                {group.totalBooked}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Total:</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">
                {group.bookings.length}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => downloadCSV(group.offerId, group.bookings, "vehicle")}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            
            <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
              PKR {group.totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Vehicle Bookings Table - Updated with Payment Type */}
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Booking ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Fare
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ticket Type
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {group.bookings.map((booking, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-mono text-sm font-medium text-gray-900">
                  {booking.booking}
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">
                    {booking.passenger_name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {booking.passenger_contact}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  PKR {parseFloat(booking.price_per_seat).toFixed(2)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${booking.payment_type?.toLowerCase().includes('cash') ? 
                    'bg-green-100 text-green-800' : 
                    booking.payment_type?.toLowerCase().includes('manual') ? 
                    'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {booking.payment_type || "Unknown"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${booking.status === 'Reserved' ? 
                    'bg-yellow-100 text-yellow-800' : 
                    booking.status === 'Confirmed' || booking.status === 'Booked' ? 
                    'bg-green-100 text-green-800' : 
                    booking.status === 'Cancelled' ? 
                    'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {booking.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${booking.ticket_type === 'full_vehicle' ? 
                    'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {booking.ticket_type === 'full_vehicle' ? 'Full Vehicle' : booking.ticket_type || 'Vehicle'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default BookingManagement;