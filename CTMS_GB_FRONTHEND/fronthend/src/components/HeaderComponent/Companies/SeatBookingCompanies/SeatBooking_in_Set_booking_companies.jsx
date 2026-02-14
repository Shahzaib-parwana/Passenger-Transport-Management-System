import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import apiPublic from "../../../../api/axiosConfig";
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  DollarSign,
  Star,
  Filter,
  ArrowLeft,
  Mail,
  Phone,
  Info,
  Briefcase,
  Loader,
  AlertCircle
} from "lucide-react";
import { User, Bus } from "lucide-react";

const CompanyTransportsList = () => {
  const { company_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Company data passed via navigate state from the previous page
  const company = location.state?.company;

  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [routeFilter, setRouteFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // Modal for company details (Toggled by the button)
  const [showDetail, setShowDetail] = useState(false);

  // **ADDED: States for seat tracking per transport**
  const [customerBookedSeats, setCustomerBookedSeats] = useState({});
  const [loadingSeats, setLoadingSeats] = useState({});
  const [seatErrors, setSeatErrors] = useState({});

  const isSeatBooking = location.pathname.includes("/transports");
  const offerType = isSeatBooking ? "offer_sets" : "offer_vehicle";
  const pageTitle = isSeatBooking
    ? "Available Seat Bookings"
    : "Available Vehicle Rentals";

  useEffect(() => {
    const fetchTransports = async () => {
      try {
        const response = await apiPublic.get(
          `/companies/${company_id}/transports/?type=${offerType}`
        );
        setTransports(response.data);
        setLoading(false);
        
        // **ADDED: Fetch booked seats for each transport**
        if (isSeatBooking) {
          fetchBookedSeatsForAllTransports(response.data);
        }
      } catch (err) {
        setError(`Failed to load ${pageTitle}.`);
        setLoading(false);
      }
    };
    fetchTransports();
  }, [company_id, offerType, pageTitle]);

  // **ADDED: Fetch booked seats for all transports (same as PassengerCard)**
  const fetchBookedSeatsForAllTransports = async (transportsList) => {
    const newCustomerBookedSeats = {};
    const newLoadingSeats = {};
    const newSeatErrors = {};

    transportsList.forEach(transport => {
      newLoadingSeats[transport.id] = true;
    });

    setLoadingSeats(newLoadingSeats);

    for (const transport of transportsList) {
      const vehicleId = transport.vehicle_id || transport.vehicle || transport.id;
      const arrivalDate = transport.arrival_date || transport.departure_date;
      const arrivalTime = transport.arrival_time || transport.departure_time;

      if (!vehicleId || !arrivalDate || !arrivalTime) {
        newLoadingSeats[transport.id] = false;
        setLoadingSeats(prev => ({ ...prev, [transport.id]: false }));
        continue;
      }

      try {
        const token = localStorage.getItem("access_token");
        let formattedTime = arrivalTime;
        
        if (formattedTime && formattedTime.split(":").length === 2) {
          formattedTime = `${formattedTime}:00`;
        }

        const url = `http://localhost:8000/api/checkout/bookings/?vehicle_id=${vehicleId}&arrival_date=${arrivalDate}&arrival_time=${formattedTime}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          newCustomerBookedSeats[transport.id] = Array.isArray(data) ? data : [];
          newSeatErrors[transport.id] = null;
        } else if (response.status === 404) {
          newCustomerBookedSeats[transport.id] = [];
          newSeatErrors[transport.id] = null;
        } else {
          throw new Error(`Failed to fetch seats: ${response.status}`);
        }
      } catch (err) {
        console.error(`Error fetching booked seats for transport ${transport.id}:`, err);
        newCustomerBookedSeats[transport.id] = [];
        newSeatErrors[transport.id] = err.message;
      } finally {
        newLoadingSeats[transport.id] = false;
      }
    }

    setCustomerBookedSeats(newCustomerBookedSeats);
    setLoadingSeats(newLoadingSeats);
    setSeatErrors(newSeatErrors);
  };

  // **ADDED: Calculate available seats for a transport (same as PassengerCard)**
  const calculateAvailableSeats = (transport) => {
    const totalSeatsValue = transport.vehicle_seats || transport.vehicle_seats_snapshot || transport.seats_available || 40;
    const ownerReservedSeats = transport?.reserve_seats || [];
    const bookedSeats = customerBookedSeats[transport.id] || [];
    
    // Combine owner reserved seats + customer booked seats (from API)
    const unavailableSeats = [...new Set([...ownerReservedSeats, ...bookedSeats])];
    
    // Correct formula: total seats - (reserved + booked)
    const available = totalSeatsValue - unavailableSeats.length;
    
    // Ensure non-negative value
    return available >= 0 ? available : 0;
  };

  if (loading)
    return (
      <div className="p-10 text-center text-xl font-bold">
        Loading {pageTitle}...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-xl font-bold text-red-600">
        {error}
      </div>
    );

  // ==========================
  // FILTER LOGIC (FIXED)
  // ==========================
  const filteredTransports = transports.filter((t) => {
    return (
      (routeFilter
        ? t.route_display?.toLowerCase().includes(routeFilter.toLowerCase())
        : true) &&
      (vehicleTypeFilter
        ? t.vehicle_type?.toLowerCase() === vehicleTypeFilter.toLowerCase()
        : true) &&
      (ratingFilter
        ? Number(t.rating || 0) >= Number(ratingFilter)
        : true)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
      {/* ========================== */}
      {/* COMPANY BANNER */}
      {/* ========================== */}
      {company && (
        <div className="relative w-full h-64 md:h-72 bg-gray-200 shadow-md flex items-center justify-center mt-4">
          <img
            src={company.company_banner_url}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            alt="Company Banner"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>

          <div className="relative text-center flex flex-col items-center">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl mb-3">
              <img
                src={company.company_logo_url}
                className="w-full h-full object-cover"
                alt="Company logo"
              />
            </div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
              {company.company_name}
            </h1>
            <p className="text-gray-200 text-sm">{company.services_offered}</p>
            <p className="text-gray-300 text-sm flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {company.main_office_city}
            </p>

            <button
              className="mt-3 px-4 py-2 bg-white text-indigo-700 rounded-lg shadow font-semibold hover:bg-indigo-100 transition"
              onClick={() => setShowDetail(true)}
            >
              View Company Details
            </button>
          </div>
        </div>
      )}
      {/* ========================== */}
      {/* PAGE TITLE + BACK BUTTON  */}
      {/* ========================== */}
      <div className="flex items-center justify-between mt-8 px-4">
        {/* BACK BUTTON (Improved Design) */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-indigo-200 
                     rounded-lg shadow-sm hover:shadow-md hover:bg-indigo-50 
                     text-indigo-600 font-semibold transition"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        {/* CENTER TITLE */}
        <h2
          className={`text-3xl md:text-4xl font-extrabold text-center flex-1 ${
            isSeatBooking ? "text-indigo-600" : "text-green-600"
          }`}
        >
          {pageTitle}
        </h2>

        {/* Spacer (Same width as button for perfect centering) */}
        <div className="w-[95px]"></div>
      </div>

      {/* ============================= */}
      {/* 2-COLUMN LAYOUT */}
      {/* ============================= */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4 pb-10 mt-10">
        {/* FILTERS LEFT COLUMN */}
        <div className="bg-white shadow-lg rounded-xl p-5 md:sticky md:top-5 h-fit">
          <h3 className="text-xl font-bold flex items-center mb-4">
            <Filter className="w-5 h-5 mr-2" /> Filters
          </h3>

          <div className="mb-3">
            <label className="font-semibold">Route</label>
            <input
              type="text"
              placeholder="Search route..."
              className="w-full mt-1 p-2 border rounded"
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="font-semibold">Vehicle Type</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Hiace">Hiace</option>
              <option value="Coaster">Coaster</option>
              <option value="Car">Car</option>
              <option value="APV">APV</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="font-semibold">Rating</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
        </div>

        {/* =============================== */}
        {/* VEHICLE CARDS RIGHT COLUMN */}
        {/* =============================== */}
        <div className="md:col-span-3 space-y-6">
          {filteredTransports.length === 0 && (
            <p className="text-center text-gray-600 font-semibold py-8 bg-white rounded-xl shadow-sm">
              No transports match your filter.
            </p>
          )}

          {filteredTransports.map((t) => {
            // Helper function for image URL
            const getImageUrl = () => {
              if (!t.vehicle_image || t.vehicle_image === "Nill") {
                return defaultVehicleImage;
              }
              if (t.vehicle_image.startsWith("http")) {
                return t.vehicle_image;
              }
              return `http://127.0.0.1:8000${t.vehicle_image}`;
            };

            // **UPDATED: Calculate available seats with API data**
            const isLoading = loadingSeats[t.id] || false;
            const seatError = seatErrors[t.id];
            const totalSeatsValue = t.vehicle_seats || t.vehicle_seats_snapshot || t.seats_available || 40;
            
            let availableSeats;
            if (isLoading) {
              availableSeats = "Loading...";
            } else if (seatError) {
              availableSeats = totalSeatsValue;
            } else {
              availableSeats = calculateAvailableSeats(t);
            }

            // **ADDED: Seat badge styling (same as PassengerCard)**
            const getSeatBadgeClass = () => {
              if (isLoading) return 'bg-gray-100 text-gray-700 border-gray-200';
              if (seatError) return 'bg-amber-100 text-amber-700 border-amber-200';
              if (availableSeats === 0) return 'bg-red-500 text-white';
              if (availableSeats <= 5) return 'bg-amber-500 text-white';
              return 'bg-green-500 text-white';
            };

            const getSeatDisplay = () => {
              if (isLoading) return "Loading...";
              if (seatError) return `${totalSeatsValue}`;
              return availableSeats;
            };

            return (
              <div
                key={t.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-indigo-300 flex flex-col md:flex-row overflow-hidden"
              >
                {/* Image Section - Left Side (40%) */}
                <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden">
                  <img
                    src={getImageUrl()}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="Vehicle"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultVehicleImage;
                    }}
                  />
                  
                  {/* **ADDED: SEATS LEFT Badge on Image (same as PassengerCard) */}
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 ${getSeatBadgeClass()}`}>
                    <Users size={14} />
                    <div>
                      <div className="text-xs font-medium">SEATS LEFT</div>
                      <div className="text-base font-bold">{getSeatDisplay()}</div>
                    </div>
                  </div>
                  
                  {/* Top Badge */}
                  <div className="absolute top-4 left-3">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      SEAT BOOKING
                    </span>
                  </div>
                  
                  {/* Loading Overlay for seats */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-white p-2 rounded-lg flex flex-col items-center">
                        <Loader className="w-5 h-5 animate-spin text-blue-600 mb-1" />
                        <p className="text-xs text-gray-700">Loading seats...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Bottom Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    {t.vehicle_number && (
                      <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                        {t.vehicle_number}
                      </span>
                    )}
                    {t.rating && (
                      <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="ml-1 text-xs font-bold text-gray-700">
                          {t.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section - Right Side (60%) */}
                <div className="md:w-3/5 p-5 flex flex-col justify-between">
                  {/* Header */}
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight pr-2">
                        {t.company_name || t.vehicle_type}
                        {t.vehicle_number && ` (${t.vehicle_number})`}
                      </h3>
                      {t.is_ac && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                          AC
                        </span>
                      )}
                    </div>

                    {/* Route Display */}
                    {t.route_display && (
                      <div className="flex items-center text-green-700 font-semibold text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 mb-3">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{t.route_display}</span>
                      </div>
                    )}

                    {/* Driver Info if available */}
                    {t.driver_name && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1.5 text-blue-500" />
                          <span className="font-medium">{t.driver_name}</span>
                        </div>
                        {t.driver_contact && (
                          <div className="flex items-center text-gray-500">
                            <Phone className="w-4 h-4 mr-1.5 text-green-500" />
                            <span>{t.driver_contact}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Main Pricing */}
                    <div className="flex items-center text-red-700 font-bold text-xl mb-4 py-3 border-y border-gray-100">
                      <DollarSign className="w-5 h-5 mr-3 text-red-600" />
                      <span className="text-xl">
                        {t.price_per_seat ? `Rs. ${t.price_per_seat}` : "Contact for Price"}
                      </span>
                      <span className="text-base font-semibold ml-2">/ Seat</span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                      <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 mr-2 text-red-500" />
                        <div>
                          <div className="text-xs text-gray-500">Date</div>
                          <div className="font-semibold">{t.arrival_date || "N/A"}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                        <Clock className="w-4 h-4 mr-2 text-red-500" />
                        <div>
                          <div className="text-xs text-gray-500">Time</div>
                          <div className="font-semibold">{t.arrival_time || "N/A"}</div>
                        </div>
                      </div>

                      <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                        <Users className="w-4 h-4 mr-2 text-green-500" />
                        <div>
                          <div className="text-xs text-gray-500">Seats Left</div>
                          <div className={`font-semibold ${
                            isLoading ? 'text-gray-600' :
                            seatError ? 'text-amber-600' :
                            availableSeats === 0 ? 'text-red-600' :
                            availableSeats <= 5 ? 'text-amber-600' :
                            'text-green-600'
                          }`}>
                            {getSeatDisplay()}
                          </div>
                          {seatError && (
                            <div className="text-xs text-amber-500">(Showing total seats)</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                        <Bus className="w-4 h-4 mr-2 text-blue-500" />
                        <div>
                          <div className="text-xs text-gray-500">Vehicle Type</div>
                          <div className="font-semibold capitalize">{t.vehicle_type || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        // **ADDED: Check seat availability**
                        if (!isLoading && !seatError && availableSeats === 0) {
                          alert("Sorry, no seats available for this vehicle!");
                          return;
                        }

                        const token = localStorage.getItem("accessToken");
                        if (!token || token === "null" || token === "undefined" || token.trim() === "") {
                          navigate("/login", {
                            state: { 
                              from: "/book-seat", 
                              transport: t,
                              fromCard: true,
                            },
                          });
                          return;
                        }
                        navigate("/book-seat", {
                          state: { fromCard: true, transport: t }
                        });
                      }}
                      disabled={isLoading}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center ${
                        isLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : !seatError && availableSeats === 0
                          ? 'bg-red-300 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : !seatError && availableSeats === 0 ? (
                        "Sold Out"
                      ) : (
                        "Book Seat"
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate(`/view-seat-offer/${t.id}`, { 
                          state: { 
                            transport: t,
                            vehicleDetails: t
                          } 
                        });
                      }}
                      className="px-4 border-2 border-indigo-200 text-indigo-600 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 flex items-center justify-center"
                    >
                      <span className="mr-2">Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================== */}
      {/* UPDATED COMPANY DETAILS MODAL */}
      {/* =========================== */}
      {showDetail && company && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl transform transition-all duration-300">
            <h2 className="text-3xl font-extrabold text-indigo-700 mb-4 text-center">
              {company.company_name} Details
            </h2>

            <div className="space-y-3 text-gray-700">
              <p className="flex items-center text-lg font-semibold border-b pb-2">
                <MapPin className="w-5 h-5 mr-3 text-red-500" />
                Office Location: <span className="ml-2 font-normal">{company.main_office_city || "N/A"}</span>
              </p>
              <p className="flex items-start">
                <Briefcase className="w-5 h-5 mr-3 mt-1 text-green-600" />
                Services Offered: <span className="ml-2 font-normal flex-1">{company.services_offered || "N/A"}</span>
              </p>
              <p className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-blue-500" />
                Email: <span className="ml-2 font-normal">{company.company_email || "N/A"}</span>
              </p>
              <p className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-orange-500" />
                Contact 1: <span className="ml-2 font-normal">{company.contact_number_1 || "N/A"}</span>
              </p>
              <p className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-orange-500" />
                Contact 2: <span className="ml-2 font-normal">{company.contact_number_2 || "N/A"}</span>
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="flex items-center text-lg font-bold text-indigo-800 mb-2">
                    <Info className="w-5 h-5 mr-2" /> Passenger Instructions
                </h3>
                <p className="text-gray-700 text-sm">
                    {company.passenger_instruction || "No specific instructions provided by the company."}
                </p>
            </div>

            <button
              className="mt-6 w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
              onClick={() => setShowDetail(false)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyTransportsList;