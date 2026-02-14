"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiPrivate from "../../../api/apiprivate";

import VehicleManagement from "./VehicalManagement";
import DriverManagement from "./Driver_Management/Driver_Management";
import RouteManagement from "./RouteManagement";
import CompanyProfilePage from "./Company_profile_detail";
import BookingManagement from "./BookingManagement";
import CashTransection from "./Transaction_List_Management/CashTransectionList"
import OnlinePayment from "./Transaction_List_Management/ManualTransactionList";

// Import icons
import { 
  Menu, X, LogOut, LayoutDashboard, Bus, Calendar, Route, Users, 
  BarChart, Settings, ArrowLeft, DollarSign, CreditCard, Home,
  Truck, MapPin, Tag, Car, Building, ChevronDown, ChevronUp
} from "lucide-react";

// --- Helper Component: Stat Card ---
const StatCard = ({ title, count, icon: Icon, color }) => {
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
    <div className={`p-5 bg-white rounded-xl shadow-lg border-l-4 ${colors.border} transform hover:scale-[1.02] transition duration-300`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-1">{count}</h2>
        </div>
        <Icon size={32} className={`${colors.text} opacity-70`} />
      </div>
    </div>
  );
};

const ServiceProviderDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); 
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileOverviewExpanded, setIsMobileOverviewExpanded] = useState(false);

    // --- API & DATA FETCHING ---
    const fetchUser = async () => {
        try {
            const res = await apiPrivate.get("/auth/my-company-detail/");
            setUser(res.data);
        } catch (err) {
            console.error("❌ Fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.state?.openVehicles) {
            setActiveTab("vehicles");
        }
        fetchUser();
    }, [location.state?.openVehicles]);

    const COMPANY_LOGO_URL =
        user?.company_logo_url ||
        user?.company_logo ||
        "https://placehold.co/96x96/FFFFFF/4F46E5?text=LOGO";

    const DASHBOARD_BANNER_URL =
        user?.company_banner_url ||
        user?.company_banner ||
        "https://placehold.co/1920x400/31333B/C7C7C7?text=Background";

    // 🟢 Handle Add / Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url =
                activeTab === "vehicles"
                    ? "/company/vehicles/"
                    : activeTab === "drivers"
                        ? "/company/drivers/"
                        : "/company/routes/";

            if (editId) {
                await apiPrivate.put(`${url}${editId}/`, formData);
            } else {
                await apiPrivate.post(url, formData);
            }

            await fetchUser();
            setShowForm(false);
            setEditId(null);
            setFormData({});
        } catch (err) {
            console.error("❌ Save failed:", err);
        }
    };

    // 🔴 Delete Item
    const handleDelete = async (id) => {
        try {
            const url =
                activeTab === "vehicles"
                    ? "/company/vehicles/"
                    : activeTab === "drivers"
                        ? "/company/drivers/"
                        : "/company/routes/";
            await apiPrivate.delete(`${url}${id}/`);
            await fetchUser();
        } catch (err) {
            console.error("❌ Delete failed:", err);
        }
    };

    // Helper functions
    const handleEdit = (item) => {
        setEditId(item.id);
        setFormData(item);
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditId(null);
        setFormData({});
        setShowForm(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("company_status");
        navigate("/");
    };

    // Tabs for Sidebar
    const tabs = [
        
        { id: "vehicles", name: "Vehicles", icon: Bus },
        { id: "bookings", name: "Bookings", icon: Calendar },
        { id: "cash-tx", name: "Cash Transactions", icon: DollarSign },         
        { id: "online-pay", name: "Menual Payment", icon: CreditCard },
        { id: "routes", name: "Routes & Fares", icon: Route },
        { id: "drivers", name: "Drivers", icon: Users },
        { id: "settings", name: "Settings", icon: Settings },
    ];

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setIsSidebarOpen(false);
        setShowForm(false);
        setEditId(null);
        setFormData({});
    };

    const CompanyName = user?.company_name || user?.username || "Transport Company";

    if (loading) return <div className="p-10 text-center text-xl">Loading...</div>;

    return (
        <div className="bg-gray-50">
            {/* 💥 LAYOUT FIX: Flex container for Sidebar and Content */}
            <div className="lg:flex">
                {/* 1. Sidebar (Left Column - Sticky) */}
                                {/* 1. Sidebar (Left Column - Sticky) */}
                <div className="hidden lg:block w-80 flex-shrink-0">
                    <div className="w-80 lg:sticky lg:top-0 h-screen p-8 bg-white shadow-xl z-30 flex flex-col justify-between overflow-y-auto">
                        <div>

                            {/* Navigation Buttons - All same style */}
                            <div className="space-y-2 mb-8">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    const isLogout = tab.id === 'logout';
                                    
                                    // Skip logout from main navigation (it will be at bottom)
                                    if (isLogout) return null;
                                    
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabClick(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                                                isActive
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                            }`}
                                        >
                                            <Icon size={20} />
                                            <span>{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Quick Stats */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-700 mb-3">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-1 border-b">
                                        <span className="text-gray-600">Total Vehicles</span>
                                        <span className="font-semibold text-blue-600">
                                            {user?.vehicles?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b">
                                        <span className="text-gray-600">Total Drivers</span>
                                        <span className="font-semibold text-green-600">
                                            {user?.drivers?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-600">Total Routes</span>
                                        <span className="font-semibold text-purple-600">
                                            {user?.routes?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Main Content Layout (Right Side) --- */}
                <div className="flex-1 min-w-0">
                {/* Mobile Menu Button - Fixed 2.5 inches from top */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden fixed left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all"
                        style={{ top: '4rem' }}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="w-5 h-5"
                        >
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </button>

    {/* --- Top Bar & Header (Banner) --- */}
    <div
        className="w-full h-[45vh] relative flex items-center justify-center bg-cover bg-center shadow-lg"
        style={{
            backgroundImage: `url(${DASHBOARD_BANNER_URL})`
        }}
    >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

        {/* Center Logo + Name */}
        <div className="relative z-10 text-center">
            <img
                src={COMPANY_LOGO_URL}
                alt="Company Logo"
                className="w-32 h-32 rounded-full object-cover border-4 border-white mx-auto shadow-xl"
                onError={(e) => e.target.src = "https://placehold.co/96x96/FFFFFF/4F46E5?text=LOGO"}
            />
            <h1 className="text-white text-4xl mt-4 font-extrabold drop-shadow-lg">
                {CompanyName}
            </h1>
            <p className="text-gray-200 font-medium mt-1">
                Premium Transport Services
            </p>
        </div>
    </div>

    {/* 💥 INTERNAL PADDING WRAPPER */}
    <div className="p-4 md:p-8">
        {/* --- Mobile Collapsible Toggle --- */}
        <button
            onClick={() => setIsMobileOverviewExpanded(!isMobileOverviewExpanded)}
            className="lg:hidden w-full flex items-center justify-between p-4 bg-indigo-100 text-indigo-700 font-bold rounded-xl mb-6 shadow-lg transition hover:bg-indigo-200"
        >
            <span>{isMobileOverviewExpanded ? "Hide Overview" : "Show Overview"}</span>
            {isMobileOverviewExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {/* --- Overview Content Wrapper --- */}
        <div className={`${isMobileOverviewExpanded ? 'block' : 'hidden'} lg:block`}>
            {/* --- Stats Summary (Business Overview) --- */}
            {activeTab === "overview" && (
                <>
                    <h2 className="text-2xl font-bold text-gray-700 mb-5 mt-4 md:mt-8 lg:mt-0">Business Overview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard title="Total Routes" count={user?.routes?.length || 0} icon={Route} color="green" />
                        <StatCard title="Total Vehicles" count={user?.vehicles?.length || 0} icon={Bus} color="blue" />
                        <StatCard title="Total Drivers" count={user?.drivers?.length || 0} icon={Users} color="orange" />
                        <StatCard title="Active Bookings" count={user?.bookings?.length || 0} icon={Calendar} color="indigo" />
                    </div>
                </>
            )}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 bg-gray-50">
            <div className="w-full">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
                       

                        {/* --- VEHICLES COMPONENT --- */}
                        {activeTab === "vehicles" && (
                            <VehicleManagement
                                vehicles={user?.vehicles}
                                onAdd={handleAdd}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}

                        {/* --- DRIVERS COMPONENT --- */}
                        {activeTab === "drivers" && (
                            <DriverManagement
                                drivers={user?.drivers}
                                onAdd={handleAdd}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}

                        {/* --- ROUTES COMPONENT --- */}
                        {activeTab === "routes" && (
                            <RouteManagement
                                routes={user?.routes}
                                onAdd={handleAdd}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}

                        {/* Placeholder for other tabs */}
                       

                        {activeTab === "bookings" && <BookingManagement />}

                        {/* 🆕 NEW TAB 1: CASH TRANSACTIONS & APPROVAL */}
                        {activeTab === "cash-tx" && <CashTransection user={user} />}

                        {/* 🆕 NEW TAB 2: ONLINE PAYMENT RESERVES */}
                        {activeTab === "online-pay" && <OnlinePayment user={user} />}

                        {/* --- SETTINGS TAB --- */}
                        {activeTab === "settings" && (
                            <CompanyProfilePage user={user} fetchUser={fetchUser} />
                        )}
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50">
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                    
                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col">
                        {/* Close button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        {/* Logo Section */}
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700">
                            <h1 className="text-xl font-extrabold text-white tracking-widest flex items-center">
                                <LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard
                            </h1>
                        </div>
                        
                        {/* Navigation */}
                        <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            handleTabClick(tab.id);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 ${
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-xl"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        <span className="font-medium">{tab.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                        
                        {/* User Section */}
                        <div className="px-3 py-4 border-t border-gray-200 bg-white">
                            <div className="flex items-center p-3 rounded-lg mb-2">
                                <Building className="w-5 h-5 mr-3 text-indigo-400" />
                                <span className="font-semibold truncate">{CompanyName}</span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition"
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Add/Edit Form Modal (Unified Modal for all 3 entities) */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4" onClick={() => setShowForm(false)}>
                    <form
                        onSubmit={handleSubmit}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full space-y-4 relative"
                    >
                        <h2 className="text-xl font-bold text-center border-b pb-2 mb-4">
                            {editId ? "Edit" : "Add"}{" "}
                            {activeTab === "vehicles"
                                ? "Vehicle"
                                : activeTab === "drivers"
                                    ? "Driver"
                                    : "Route"}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition p-1 rounded-full"
                            title="Close Form"
                        >
                            <X size={24} />
                        </button>

                        {/* RENDER FORM FIELDS BASED ON ACTIVE TAB */}
                        {activeTab === "vehicles" && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Vehicle Type"
                                    value={formData.vehicle_type || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, vehicle_type: e.target.value })
                                    }
                                    className="border p-3 w-full rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Vehicle Number"
                                    value={formData.vehicle_number || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, vehicle_number: e.target.value })
                                    }
                                    className="border p-3 w-full rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Number of Seats"
                                    value={formData.number_of_seats || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            number_of_seats: e.target.value,
                                        })
                                    }
                                    className="border p-3 w-full rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </>
                        )}

                        {activeTab === "drivers" && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Driver Name"
                                    value={formData.driver_name || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, driver_name: e.target.value })
                                    }
                                    className="border p-3 w-full rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Driving License No"
                                    value={formData.driving_license_no || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            driving_license_no: e.target.value,
                                        })
                                    }
                                    className="border p-3 w-full rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </>
                        )}

                        {activeTab === "routes" && (
                            <>
                                <input
                                    type="text"
                                    placeholder="From Location"
                                    value={formData.from_location || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, from_location: e.target.value })
                                    }
                                    className="border p-3 w-full rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="To Location"
                                    value={formData.to_location || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, to_location: e.target.value })
                                    }
                                    className="border p-3 w-full rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Fare"
                                    value={formData.fare || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fare: e.target.value })
                                    }
                                    className="border p-3 w-full rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-full font-semibold hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ServiceProviderDashboard;