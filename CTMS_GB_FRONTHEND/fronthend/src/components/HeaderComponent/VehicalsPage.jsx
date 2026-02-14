import React, { useEffect, useState } from "react";
import apiPublic from "../../api/axiosConfig";
import SeatBookingCard from "../Direct_Card_Booking/SeatBooking/Seats_Booking_Card";
import VehicalBookingCard from "../Direct_Card_Booking/VehicleBooking/Vehical_Booking_Card";
import { Factory, Bus, Car, Search, PanelLeft, Tag, X, Filter } from "lucide-react";
import defaultVehicleImage from "../../icons/Banner_3.PNG";
import { useLocation } from "react-router-dom";

const AllVehiclesPage = () => {
  const location = useLocation();
  const onlyVehicles = location.state?.onlyVehicles || false;
  const onlySeatOffers = location.state?.onlySeatOffers || false;

  const [allTransports, setAllTransports] = useState([]);
  const [filteredTransports, setFilteredTransports] = useState([]);
  const [filterType, setFilterType] = useState(
    onlySeatOffers ? "offer_sets" : onlyVehicles ? "whole_hire" : "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [hireTypeFilter, setHireTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const vehicleTypes = ["all", "Car", "Hiace", "Coaster", "Bus"];

  // Fetch detailed whole hire offers
  const fetchWholeHireOffers = async () => {
    try {
      setLoading(true);
      const response = await apiPublic.get("/search/?offer_type=whole_hire");
      
      const processedData = response.data.map(offer => ({
        ...offer,
        company_name: offer.company_name || offer.name || "Unknown Company",
        vehicle_type_snapshot: offer.vehicle_type_snapshot || offer.vehicle_type || "Unknown Vehicle",
        vehicle_image: offer.vehicle_image || null,
        location_address: offer.location_address || offer.location || "Location not specified",
        is_long_drive: offer.is_long_drive || false,
        is_specific_route: offer.is_specific_route || false,
        rate_per_km: offer.rate_per_km || offer.fare || 0,
        per_hour_rate: offer.per_hour_rate || 0,
        per_day_rate: offer.per_day_rate || 0,
        weekly_rate: offer.weekly_rate || 0,
        fixed_fare: offer.fixed_fare || 0,
        vehicle_seats: offer.vehicle_seats || offer.vehicle_seats_snapshot || "N/A",
        vehicle_number: offer.vehicle_number || offer.vehicle_number_snapshot || "N/A",
      }));
      
      setAllTransports(processedData);
      setFilteredTransports(processedData);
    } catch (err) {
      console.error("Error fetching whole hire offers:", err);
      setError("Failed to load vehicle offers.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch seat offers
  const fetchSeatOffers = async () => {
    try {
      setLoading(true);
      const response = await apiPublic.get("/search/?offer_type=offer_sets");
      setAllTransports(response.data);
      setFilteredTransports(response.data);
    } catch (err) {
      console.error("Error fetching seat offers:", err);
      setError("Failed to load seat offers.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all offers
  const fetchAllOffers = async () => {
    try {
      setLoading(true);
      const response = await apiPublic.get("/search/");
      setAllTransports(response.data);
      setFilteredTransports(response.data);
    } catch (err) {
      console.error("Error fetching all offers:", err);
      setError("Failed to load offers.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (onlySeatOffers) {
      fetchSeatOffers();
    } else if (onlyVehicles) {
      fetchWholeHireOffers();
    } else {
      fetchAllOffers();
    }
    setInitialLoadDone(true);
  }, [onlySeatOffers, onlyVehicles]);

  // Fetch when filterType changes
  useEffect(() => {
    if (!initialLoadDone) return;
    
    if (filterType === "offer_sets") {
      fetchSeatOffers();
    } else if (filterType === "whole_hire") {
      fetchWholeHireOffers();
    } else {
      fetchAllOffers();
    }
  }, [filterType, initialLoadDone]);

  // Apply frontend filters
  useEffect(() => {
    let current = allTransports;

    if (vehicleTypeFilter !== "all") {
      current = current.filter((t) =>
        (t.vehicle_type_snapshot || t.vehicle_type || "")
          .toLowerCase()
          .includes(vehicleTypeFilter.toLowerCase())
      );
    }

    if (filterType === "whole_hire" && hireTypeFilter !== "all") {
      current = current.filter((t) => {
        if (hireTypeFilter === "long_drive") return t.is_long_drive;
        if (hireTypeFilter === "specific_route") return t.is_specific_route;
        return true;
      });
    }

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      current = current.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.company_name?.toLowerCase().includes(q) ||
          (t.vehicle_type_snapshot || t.vehicle_type)?.toLowerCase().includes(q) ||
          t.location_address?.toLowerCase().includes(q) ||
          t.route_from?.toLowerCase().includes(q) ||
          t.route_to?.toLowerCase().includes(q)
      );
    }

    setFilteredTransports(current);
  }, [vehicleTypeFilter, hireTypeFilter, searchTerm, allTransports, filterType]);

  if (loading)
    return <div className="p-10 text-center text-xl font-bold">Loading...</div>;
  if (error)
    return <div className="p-10 text-center text-xl text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
      {/* Banner */}
      <div
        className="w-full bg-cover bg-center flex items-center justify-center"
        style={{ height: "50vh", backgroundImage: `url(${defaultVehicleImage})` }}
      >
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white p-4 bg-black bg-opacity-30 rounded-lg text-center">
          Find Your Perfect Ride
        </h1>
      </div>

      <div className="max-w-[96rem] mx-auto py-6 md:py-12 px-3 sm:px-4 lg:px-6">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-5 h-5" /> Show Filters
            </span>
            <span>▼</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 relative">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-[280px] xl:w-[300px] flex-shrink-0">
            <div className="sticky top-6 space-y-5 max-h-[calc(100vh-120px)] overflow-y-auto pr-3">
              {/* Search */}
              <div className="bg-white p-4 rounded-xl shadow-lg border">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Search className="w-5 h-5 mr-2 text-indigo-500" /> Search Offers
                </h3>
                <input
                  type="text"
                  placeholder="Search by name, route, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm"
                />
              </div>

              {/* Offer Type */}
              <div className="bg-white p-4 rounded-xl shadow-lg border">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <PanelLeft className="w-5 h-5 mr-2 text-indigo-500" /> Service Type
                </h3>
                {[{ key: "all", icon: Factory, label: "All Offers" },
                  { key: "offer_sets", icon: Bus, label: "Seat Booking" },
                  { key: "whole_hire", icon: Car, label: "Vehicle Hire" }
                ].map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setFilterType(btn.key)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg mb-2 transition-colors duration-200 ${
                      filterType === btn.key 
                        ? "bg-indigo-600 text-white" 
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    <btn.icon className="inline w-4 h-4 mr-2" /> {btn.label}
                  </button>
                ))}
              </div>

              {/* Vehicle Type */}
              <div className="bg-white p-4 rounded-xl shadow-lg border">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Bus className="w-5 h-5 mr-2 text-indigo-500" /> Vehicle Type
                </h3>
                {vehicleTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setVehicleTypeFilter(type)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg capitalize mb-1.5 transition-colors duration-200 ${
                      vehicleTypeFilter === type 
                        ? "bg-blue-600 text-white" 
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Adjusted for 4 cards per row */}
          <div className="flex-1">
            {filterType === "whole_hire" && (
              <div className="bg-white p-4 mb-6 md:mb-8 rounded-xl shadow-lg border">
                <h3 className="text-lg md:text-xl font-semibold mb-3 flex items-center">
                  <Tag className="w-4 h-4 md:w-5 md:h-5 mr-2 text-pink-600" /> Hire Tag
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["all", "long_drive", "specific_route"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setHireTypeFilter(type)}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full capitalize text-xs md:text-sm transition-colors duration-200 ${
                        hireTypeFilter === type 
                          ? "bg-pink-600 text-white" 
                          : "border hover:bg-gray-50"
                      }`}
                    >
                      {type.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold">
                Available Offers ({filteredTransports.length})
              </h2>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-gray-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                <Tag className="w-3 h-3 md:w-4 md:h-4" />
                <span>Click on offers for details</span>
              </div>
            </div>

            {/* Grid - Changed to 4 columns on xl screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filteredTransports.length ? (
                filteredTransports.map((transport) => {
                  if (transport.offer_type === "offer_sets") {
                    return <SeatBookingCard key={transport.id} transport={transport} />;
                  } else {
                    return (
                      <VehicalBookingCard
                        key={transport.id}
                        id={transport.id}
                        complete_offer={transport}
                        company_name={transport.company_name}
                        route={transport.vehicle_type_snapshot || transport.vehicle_type}
                        fare={transport.rate_per_km || transport.price_per_seat}
                        rating={transport.rating || 0}
                        image={
                          transport.vehicle_image?.startsWith("http")
                            ? transport.vehicle_image
                            : transport.vehicle_image
                            ? `${process.env.REACT_APP_BASE_URL || ""}${transport.vehicle_image}`
                            : null
                        }
                        is_long_drive={transport.is_long_drive}
                        is_specific_route={transport.is_specific_route}
                        location_address={transport.location_address}
                        vehicle_details={transport.vehicle_details}
                      />
                    );
                  }
                })
              ) : (
                <div className="p-8 md:p-10 text-center text-base md:text-xl text-gray-500 col-span-full">
                  😔 No active offers found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden transition-all duration-300"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-50 overflow-y-auto lg:hidden animate-slideIn">
            <div className="p-4 h-full">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pt-4 pb-4 border-b">
                <h3 className="text-xl font-bold text-indigo-700 flex items-center">
                  <Filter className="w-5 h-5 mr-2" /> Filters
                </h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search */}
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Search className="w-5 h-5 mr-2 text-indigo-500" /> Search Offers
                </h3>
                <input
                  type="text"
                  placeholder="Search by name, route, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              {/* Offer Type */}
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <PanelLeft className="w-5 h-5 mr-2 text-indigo-500" /> Service Type
                </h3>
                {[{ key: "all", icon: Factory, label: "All Offers" },
                  { key: "offer_sets", icon: Bus, label: "Seat Booking" },
                  { key: "whole_hire", icon: Car, label: "Vehicle Hire" }
                ].map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => {
                      setFilterType(btn.key);
                      setIsMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg mb-2 ${
                      filterType === btn.key 
                        ? "bg-indigo-600 text-white" 
                        : "border bg-white"
                    }`}
                  >
                    <btn.icon className="inline w-5 h-5 mr-2" /> {btn.label}
                  </button>
                ))}
              </div>

              {/* Vehicle Type */}
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Bus className="w-5 h-5 mr-2 text-indigo-500" /> Vehicle Type
                </h3>
                {vehicleTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setVehicleTypeFilter(type);
                      setIsMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg capitalize mb-1 ${
                      vehicleTypeFilter === type 
                        ? "bg-blue-600 text-white" 
                        : "border bg-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Apply Button */}
              <div className="sticky bottom-0 bg-white pt-4 border-t mt-4">
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AllVehiclesPage;