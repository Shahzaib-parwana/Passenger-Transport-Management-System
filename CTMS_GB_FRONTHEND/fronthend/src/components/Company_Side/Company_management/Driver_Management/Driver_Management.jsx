// DriverManagement.jsx

import React, { useState, useEffect } from "react";
import apiPrivate from "../../../../api/apiprivate";
import { 
  Plus, 
  X, 
  Loader2, 
  Info, 
  Phone, 
  IdCard, 
  Car, 
  User,
  Edit
} from "lucide-react";
import DriverDetailModal from "./DriverDetailModel";

const DriverManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [newDriver, setNewDriver] = useState({
        driver_name: "",
        driver_contact_number: "",
        driver_cnic: "",
        driving_license_no: "",
        image: null,
    });

    // ✅ Fetch Drivers Function
    const fetchDrivers = async () => {
        setFetching(true);
        setMsg("");
        setError("");
        try {
            const response = await apiPrivate.get("/auth/my-drivers/");
            setDrivers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("❌ Error fetching drivers:", err);
            setError("Failed to load drivers. Please try again.");
        } finally {
            setFetching(false);
        }
    };

    // ✅ Fetch Drivers on Mount
    useEffect(() => {
        fetchDrivers();
    }, []);

    // 🔄 Functions for Detail Modal
    const handleUpdateSuccess = (updatedDriver) => {
        setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
        setSelectedDriver(updatedDriver);
        setMsg(`✅ Driver ${updatedDriver.driver_name} updated successfully!`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setMsg(""), 3000);
    };

    const handleDeleteSuccess = (deletedId) => {
        setDrivers(prev => prev.filter(d => d.id !== deletedId));
        setSelectedDriver(null);
        setMsg("🗑️ Driver deleted successfully!");
        
        // Clear success message after 3 seconds
        setTimeout(() => setMsg(""), 3000);
    };

    // ✅ Handle Input Changes (for Add Form)
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setNewDriver((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    // ✅ Submit Form (for Add Form)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        setError("");

        try {
            const formData = new FormData();
            Object.keys(newDriver).forEach((key) => {
                if (newDriver[key]) formData.append(key, newDriver[key]);
            });

            const response = await apiPrivate.post("/drivers/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setDrivers((prev) => [...prev, response.data]);
            setMsg("✅ Driver added successfully!");
            setNewDriver({
                driver_name: "",
                driver_contact_number: "",
                driver_cnic: "",
                driving_license_no: "",
                image: null,
            });
            setShowAddForm(false);
            
            // Clear success message after 3 seconds
            setTimeout(() => setMsg(""), 3000);
        } catch (err) {
            console.error(err);
            setError("Failed to add driver. Please check the information.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
            
            {/* Header Section */}
            <div className="max-w-7xl mx-auto">
                {/* Title and Stats */}
                <div className="mb-8 md:mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Driver Management
                            </h1>
                            <p className="text-gray-600">
                                Manage your drivers, view details, and track their status
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                                <div className="text-sm text-gray-500">Total Drivers</div>
                                <div className="text-2xl font-bold text-gray-900">{drivers.length}</div>
                            </div>
                            
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                <span className="font-semibold">Add Driver</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="mb-6 space-y-3">
                    {msg && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-sm animate-fadeIn">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                {msg}
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm animate-fadeIn">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                {error}
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-16 md:py-20">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                            <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <p className="mt-4 text-gray-600 text-lg">Loading drivers...</p>
                    </div>
                ) : drivers.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No drivers yet</h3>
                            <p className="text-gray-600 mb-6">
                                Add your first driver to get started managing your fleet
                            </p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                            >
                                <Plus size={18} />
                                Add First Driver
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Driver Cards Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                        {drivers.map((driver) => (
                            <div
                                key={driver.id}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group hover:border-emerald-200"
                            >
                                {/* Driver Image */}
                                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                    {driver.image ? (
                                        <img
                                            src={driver.image}
                                            alt={driver.driver_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-20 h-20 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>

                                {/* Driver Details */}
                                <div className="p-5">
                                    {/* Name and Action Button */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {driver.driver_name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                                                <span className="text-sm text-gray-500">Professional Driver</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedDriver(driver)}
                                            className="bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-700 p-2 rounded-lg transition-all duration-300 group/btn"
                                        >
                                            <Edit size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                        </button>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="space-y-3 mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">Contact Number</p>
                                                <p className="font-medium text-gray-900">
                                                    {driver.driver_contact_number || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                <IdCard className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">CNIC Number</p>
                                                <p className="font-medium text-gray-900">
                                                    {driver.driver_cnic || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                                                <Car className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">License Number</p>
                                                <p className="font-medium text-gray-900">
                                                    {driver.driving_license_no || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => setSelectedDriver(driver)}
                                        className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 group/action"
                                    >
                                        <span>View Full Details</span>
                                        <Info size={18} className="group-hover/action:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Driver Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div 
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold">Add New Driver</h3>
                                        <p className="text-emerald-100 mt-1">Fill in the driver details below</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="hover:bg-white/20 p-2 rounded-full transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Driver Name */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <User size={16} />
                                                Driver Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="driver_name"
                                                placeholder="John Doe"
                                                value={newDriver.driver_name}
                                                onChange={handleChange}
                                                required
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        {/* Contact Number */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <Phone size={16} />
                                                Contact Number *
                                            </label>
                                            <input
                                                type="text"
                                                name="driver_contact_number"
                                                placeholder="+1 (555) 123-4567"
                                                value={newDriver.driver_contact_number}
                                                onChange={handleChange}
                                                required
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        {/* CNIC */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <IdCard size={16} />
                                                CNIC *
                                            </label>
                                            <input
                                                type="text"
                                                name="driver_cnic"
                                                placeholder="12345-6789012-3"
                                                value={newDriver.driver_cnic}
                                                onChange={handleChange}
                                                required
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        {/* License Number */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <Car size={16} />
                                                License Number *
                                            </label>
                                            <input
                                                type="text"
                                                name="driving_license_no"
                                                placeholder="DL-2024-ABC123"
                                                value={newDriver.driving_license_no}
                                                onChange={handleChange}
                                                required
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Driver Photo
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                                            <input
                                                type="file"
                                                name="image"
                                                accept="image/*"
                                                onChange={handleChange}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label htmlFor="image-upload" className="cursor-pointer">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <User className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-600 mb-2">
                                                    {newDriver.image ? newDriver.image.name : "Click to upload driver photo"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    PNG, JPG up to 5MB
                                                </p>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Adding Driver...
                                            </div>
                                        ) : (
                                            "Add Driver to Fleet"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Driver Detail Modal */}
                {selectedDriver && (
                    <DriverDetailModal
                        driver={selectedDriver}
                        onClose={() => setSelectedDriver(null)}
                        onUpdateSuccess={handleUpdateSuccess}
                        onDeleteSuccess={handleDeleteSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default DriverManagement;