import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiPrivate from "../api/apiprivate"; // Assuming this path is correct
// Assuming these component paths are correct
import TransportForm from "../components/Company_Side/Seat_Booking_Offer/Seat_Booking_Offer_form"; 
import VehicleHireForm from "../components/Company_Side/Vehicle_Booking_Offer/VehicleHireForm";
import TransportInfo from "../components/Company_Side/Company_Global/TransportInfo";
import TransportList from "../components/Company_Side/Company_Global/TransportList";
import { 
  Settings, LogOut, Bus, Route, Users, Truck, Car, X, Tag,
  DollarSign, MapPinned, ChevronDown, ChevronUp // Naye icons shamil kiye
} from "lucide-react";

// --- Helper Component 1: Stat Card ---
const StatCard = ({ title, count, icon: Icon, color, trend }) => {
  const colorClasses = {
    green: { border: 'border-green-500', text: 'text-green-500' },
    blue: { border: 'border-blue-500', text: 'text-blue-500' },
    orange: { border: 'border-orange-500', text: 'text-orange-500' },
    indigo: { border: 'border-indigo-500', text: 'text-indigo-500' },
    pink: { border: 'border-pink-500', text: 'text-pink-500' },
    teal: { border: 'border-teal-500', text: 'text-teal-500' }
  };
  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <div className={`p-5 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 rounded-xl shadow-lg border-l-4 ${colors.border} transform hover:scale-[1.02] transition duration-300`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-1">{count}</h2>
          {trend && (
            <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <Icon size={32} className={`${colors.text} opacity-70`} />
      </div>
    </div>
  );
};

// --- Main Component: Company Dashboard ---
const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [transports, setTransports] = useState([]);

  // Form states
  const [showSeatBookingForm, setShowSeatBookingForm] = useState(false);
  const [showVehicleHireForm, setShowVehicleHireForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openSettings, setOpenSettings] = useState(false); 
  const [activeFilter, setActiveFilter] = useState("all");
  
  // 💥 Naya state: Mobile par Overview ko collapse karne ke liye
  const [isMobileOverviewExpanded, setIsMobileOverviewExpanded] = useState(false);

  // Authentication and Data Fetching Logic (unchanged)
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("company_status");
    navigate("/");
  };

  const closeAllForms = () => {
    setShowSeatBookingForm(false);
    setShowVehicleHireForm(false);
    setEditingId(null);
  };

useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, routesRes, vehiclesRes, driversRes, transportsRes] = await Promise.all([
          apiPrivate.get("/auth/my-company-detail/"),
          apiPrivate.get("/routes"),
          apiPrivate.get("/vehicles/"),
          apiPrivate.get("/drivers/"),
          apiPrivate.get("/transports/")
        ]);
        
        setCompany(companyRes.data);
        // ✅ Ensure these are always arrays
        setRoutes(Array.isArray(routesRes.data) ? routesRes.data : []);
        setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
        setDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
        setTransports(Array.isArray(transportsRes.data) ? transportsRes.data : []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // ✅ Set to empty arrays on error to prevent crashes
        setRoutes([]);
        setVehicles([]);
        setDrivers([]);
        setTransports([]);
      }
    };
    fetchData();
}, []);

const { seatOffers, hireOffers, activeOffers, revenueStats } = useMemo(() => {
    // ✅ SAFETY CHECK: If transports is not an array, default to empty array []
    const safeTransports = Array.isArray(transports) ? transports : [];

    const seatOffers = safeTransports.filter(t => t.offer_type === 'offer_sets');
    const hireOffers = safeTransports.filter(t => t.offer_type === 'whole_hire');
    const activeOffers = safeTransports.filter(t => t.is_active !== false);
    
    const totalRevenue = safeTransports.reduce((sum, transport) => {
      if (transport.offer_type === 'offer_sets') {
        return sum + (transport.price_per_seat * transport.total_seats || 0);
      } else {
        return sum + (transport.fixed_fare || transport.per_day_rate || transport.rate_per_km || 0);
      }
    }, 0);

    return {
      seatOffers,
      hireOffers,
      activeOffers,
      revenueStats: {
        total: totalRevenue,
        seatRevenue: seatOffers.reduce((sum, t) => sum + (t.price_per_seat * t.total_seats || 0), 0),
        hireRevenue: hireOffers.reduce((sum, t) => sum + (t.fixed_fare || t.per_day_rate || t.rate_per_km || 0), 0)
      }
    };
}, [transports]);

  const filteredTransports = useMemo(() => {
    switch (activeFilter) {
      case "offer_sets":
        return seatOffers;
      case "whole_hire":
        return hireOffers;
      case "active":
        return activeOffers;
      default:
        return transports;
    }
  }, [activeFilter, transports, seatOffers, hireOffers, activeOffers]);

  const handleEditTransport = (transportId) => {
    const transport = transports.find(t => t.id === transportId);
    if (!transport) return;

    setEditingId(transportId);
    
    if (transport.offer_type === 'offer_sets') {
      setShowSeatBookingForm(true);
      setShowVehicleHireForm(false);
    } else if (transport.offer_type === 'whole_hire') {
      setShowVehicleHireForm(true);
      setShowSeatBookingForm(false);
    }
  };

  const activeVehicles = vehicles.filter(v => v.is_active !== false).length;
  const activeDrivers = drivers.filter(d => d.is_active !== false).length;
  const activeRoutes = routes.filter(r => r.is_active !== false).length;

  return (
    // Top-level container
    <div className="bg-gradient-to-br from-gray-100 via-blue-100 to-sky-200"> 
      
      {/* 💥 LAYOUT FIX: Flex container for Sidebar and Content */}
      <div className="lg:flex"> 
        
        {/* 1. Sidebar (Left Column - Sticky) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="w-80 lg:sticky lg:top-0 h-screen p-8 bg-white shadow-xl z-30 flex flex-col justify-between overflow-y-auto">
            
            <div> {/* Top half of the fixed sidebar */}
              <h2 className="text-3xl font-bold text-indigo-600 mb-8 pt-4">Quick Actions</h2>
              
              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={() => { 
                    setEditingId(null); 
                    setShowSeatBookingForm(true); 
                    setShowVehicleHireForm(false); 
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition transform hover:scale-[1.01]"
                >
                  <Tag size={24} /> OfferSeat Booking
                </button>

                <button
                  onClick={() => { 
                    setEditingId(null); 
                    setShowVehicleHireForm(true); 
                    setShowSeatBookingForm(false); 
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-700 transition transform hover:scale-[1.01]"
                >
                  <Car size={24} /> Offer Whole Vehicle
                </button>

                <button
                  onClick={() => navigate("/ServiceProviderDashboard", { state: { openVehicles: true } })}
                  className="w-full flex items-center justify-center gap-3 bg-amber-500 text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:bg-amber-600 transition transform hover:scale-[1.01]"
                >
                  <Bus size={24} />Management & setting
                </button>
              </div>
              
              {/* Company Info */}
              <div className="p-4 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 rounded-xl border border-gray-100 mb-8">
                <h3 className="text-xl font-bold text-indigo-600 mb-3 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Company Details
                </h3>
                <p className="text-sm text-gray-700 font-medium">
                    {company?.company_name || "Company Name"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {company?.company_email || "N/A"}
                </p>
                {/* <p className="text-xs text-gray-500">
                    {company?.location_address || "N/A"}, {company?.country || "N/A"}
                </p> */}
                {/* <button
                  onClick={() => navigate("/CompanyProfileForm")}
                  className="w-full mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition"
                >
                  Details
                </button> */}
              </div>

              {/* Quick Stats */}
              <div className="p-4 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 rounded-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-700 mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-gray-600">Active Vehicles</span>
                    <span className="font-semibold text-blue-600">
                      {activeVehicles}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Active Routes</span>
                    <span className="font-semibold text-purple-600">
                      {activeRoutes}
                    </span>
                  </div>
                </div>
              </div>
            </div> {/* End of Top half */}

            {/* Footer/Settings/Logout section at the bottom */}
            <div className="border-t pt-4">
              <div className="relative">
                
                {openSettings && (
                  <div className="absolute bottom-12 mb-2 w-full bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <button className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 transition">
                      Profile Settings
                    </button>
                    <button
                      onClick={() => navigate("/CompanyProfileForm")}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 transition"
                    >
                      Company Details
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 bg-red-500 text-white mt-3 px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition shadow-md justify-center"
              >
                <LogOut size={20} /> Logout
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">© 2024 TransportApp</p>
            </div>
          </div>
        </div>

        {/* --- Main Content Layout (Right Side) --- */}
        <div className="flex-1 min-w-0"> 
          
          {/* --- Top Bar & Header (Banner) --- */}
          <div
            className="w-full h-[45vh] relative flex items-center justify-center bg-cover bg-center shadow-lg"
            style={{
              backgroundImage: `url(${company?.company_banner || "/default-banner.jpg"})`
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div> 

            {/* Center Logo + Name */}
            <div className="relative z-10 text-center">
              <img
                src={company?.company_logo_url || "/default-logo.png"}
                alt="Company Logo"
                className="w-32 h-32 rounded-full object-cover border-4 border-white mx-auto shadow-xl"
              />
              <h1 className="text-white text-4xl mt-4 font-extrabold drop-shadow-lg">
                {company?.company_name || "Company Name"}
              </h1>
              <p className="text-gray-200 font-medium mt-1">
                Premium Transport Services
              </p>
            </div>
          </div>

          {/* 💥 INTERNAL PADDING WRAPPER */}
          <div className="p-4 md:p-8">

            {/* --- Mobile Collapsible Toggle (Small screen par show hoga) --- */}
            <button
              onClick={() => setIsMobileOverviewExpanded(!isMobileOverviewExpanded)}
              className="lg:hidden w-full flex items-center justify-between p-4 bg-indigo-100 text-indigo-700 font-bold rounded-xl mb-6 shadow-lg transition hover:bg-indigo-200"
            >
              <span>{isMobileOverviewExpanded ? "Overview Aur Revenue Chupayen" : "Overview Aur Revenue Dekhen"}</span>
              {isMobileOverviewExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* --- Overview Content Wrapper (Small screen par hide/show, Large screen par always show) --- */}
            <div className={`${isMobileOverviewExpanded ? 'block' : 'hidden'} lg:block`}>

                {/* --- Stats Summary (Business Overview) --- */}
                <h2 className="text-2xl font-bold text-gray-700 mb-5 mt-4 md:mt-8 lg:mt-0">Business Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-10">
                <StatCard title="Total Routes" count={routes.length} icon={Route} color="green" />
                <StatCard title="Total Vehicles" count={vehicles.length} icon={Bus} color="blue" />
                <StatCard title="Total Drivers" count={drivers.length} icon={Users} color="orange" />
                <StatCard title="Seat Offers" count={seatOffers.length} icon={Tag} color="indigo" />
                <StatCard title="Hire Offers" count={hireOffers.length} icon={Car} color="pink" />
                <StatCard title="Active Offers" count={activeOffers.length} icon={Truck} color="teal" />
                </div>

                
               
            </div> {/* End of Conditional Content Wrapper */}
            
            
            {/* 2. Mobile Quick Actions (for screens smaller than lg) */}
            <div className="lg:hidden space-y-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-700">Quick Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={() => { setEditingId(null); setShowSeatBookingForm(true); setShowVehicleHireForm(false); }}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition"
                >
                  <Tag size={24} /> Seat Booking Offer
                </button>
                <button
                  onClick={() => { setEditingId(null); setShowVehicleHireForm(true); setShowSeatBookingForm(false); }}
                  className="w-full flex items-center justify-center gap-3 bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-700 transition"
                >
                  <Car size={24} /> Full Vehicle Hire Offer
                </button>
                <button
                  onClick={() => navigate("/ServiceProviderDashboard", { state: { openVehicles: true } })}
                  className="w-full flex items-center justify-center gap-3 bg-amber-500 text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:bg-amber-600 transition"
                >
                  <Bus size={24} /> Settings aur Management
                </button>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 mt-6">
                <h3 className="text-xl font-bold text-indigo-600 mb-3 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Company Details
                </h3>
                <TransportInfo company={company} /> 
              </div>
            </div>


            {/* 3. Transport List (Offers Section) */}
            <div className="mb-10"> 
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-4 sm:mb-0">
                  {activeFilter === 'all' ? 'Saare Offers' : 
                    activeFilter === 'offer_sets' ? 'Seat Booking Offers' : 
                    activeFilter === 'whole_hire' ? 'Vehicle Hire Offers' : 
                    'Active Offers'} 
                  <span className="text-indigo-600 ml-2">({filteredTransports.length})</span>
                </h2>
                
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  <FilterButton 
                    label="Saare Offers" 
                    filterKey="all" 
                    currentFilter={activeFilter} 
                    setFilter={setActiveFilter} 
                    Icon={Tag}
                    color="gray"
                  />
                  <FilterButton 
                    label="Seat Booking" 
                    filterKey="offer_sets" 
                    currentFilter={activeFilter} 
                    setFilter={setActiveFilter} 
                    Icon={Users}
                    color="indigo"
                  />
                  <FilterButton 
                    label="Vehicle Hire" 
                    filterKey="whole_hire" 
                    currentFilter={activeFilter} 
                    setFilter={setActiveFilter} 
                    Icon={Car}
                    color="teal"
                  />
                  <FilterButton 
                    label="Active Sirf" 
                    filterKey="active" 
                    currentFilter={activeFilter} 
                    setFilter={setActiveFilter} 
                    Icon={Truck}
                    color="green"
                  />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg min-h-[500px]">
                <TransportList
                  transports={filteredTransports}
                  vehicles={vehicles}
                  drivers={drivers}
                  setTransports={setTransports}
                  onEditTransport={handleEditTransport}
                  fullTransportList={transports}
                />
              </div>
            </div>
          </div>
          {/* ☝️ Closing tag for the internal padding wrapper */}

          {/* Note: The main footer (from App.jsx) will appear below this div and the sidebar will scroll up. */}
        </div>
      </div>
      
      {/* --- Modals for Forms --- */}
      
      {/* 1. Seat Booking Form Modal */}
      {(showSeatBookingForm || (editingId && transports.find(t => t.id === editingId)?.offer_type === 'offer_sets')) && (
        <FormModal 
          closeForm={closeAllForms} 
          title={editingId ? "Seat Booking Offer Edit Karein" : "Seat Booking Offer"}
          size="max-w-4xl"
        >
          <TransportForm 
            closeForm={closeAllForms} 
            editingId={editingId}
            routes={routes}
            vehicles={vehicles}
            drivers={drivers}
            setTransports={setTransports}
            offerType="offer_sets"
            transports={transports}
          />
        </FormModal>
      )}
      
      {/* 2. Vehicle Hire Form Modal */}
      {(showVehicleHireForm || (editingId && transports.find(t => t.id === editingId)?.offer_type === 'whole_hire')) && (
        <FormModal 
          closeForm={closeAllForms} 
          title={editingId ? "Vehicle Hire Offer Edit Karein" : "Full Vehicle Hire Offer"}
          size="max-w-4xl"
        >
          <VehicleHireForm
            closeForm={closeAllForms}
            editingId={editingId}
            vehicles={vehicles}
            drivers={drivers}
            setTransports={setTransports}
            offerType="whole_hire"
            transports={transports}
          />
        </FormModal>
      )}
    </div>
  );
};

export default CompanyDashboard;

// --- Helper Component 2: Filter Button ---
const FilterButton = ({ label, filterKey, currentFilter, setFilter, Icon, color }) => {
  const isActive = currentFilter === filterKey;
  
  const colorClasses = {
    gray: { active: 'bg-gray-600 text-white hover:bg-gray-700', inactive: 'bg-gray-200 text-gray-700 hover:bg-gray-300' },
    indigo: { active: 'bg-indigo-600 text-white hover:bg-indigo-700', inactive: 'bg-gray-200 text-gray-700 hover:bg-gray-300' },
    teal: { active: 'bg-teal-600 text-white hover:bg-teal-700', inactive: 'bg-gray-200 text-gray-700 hover:bg-gray-300' },
    green: { active: 'bg-green-600 text-white hover:bg-green-700', inactive: 'bg-gray-200 text-gray-700 hover:bg-gray-300' }
  };

  const colors = colorClasses[color] || colorClasses.gray;
  
  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition shadow-sm text-sm";
  const activeClasses = colors.active;
  const inactiveClasses = colors.inactive;

  return (
    <button
      onClick={() => setFilter(filterKey)}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon size={16} /> {label}
    </button>
  );
};

// --- Helper Component 3: Modal Wrapper ---
const FormModal = ({ children, closeForm, title, size = "max-w-2xl" }) => (
  <div 
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    onClick={closeForm}
  >
    <div 
      className={`bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 p-6 rounded-xl shadow-2xl w-full ${size} mx-4 relative overflow-y-auto max-h-[90vh]`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h3 className="text-2xl font-bold text-indigo-600">{title}</h3>
        <button
          onClick={closeForm}
          className="text-gray-500 hover:text-red-600 transition p-2 rounded-full hover:bg-gray-100"
          title="Close Form"
        >
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  </div>
);