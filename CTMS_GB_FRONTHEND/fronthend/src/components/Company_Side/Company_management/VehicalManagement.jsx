"use client";
import React, { useEffect, useState } from "react";
import apiPrivate from "../../../api/apiprivate";
import { Camera, X, Car, LayoutGrid, CheckCircle, Users, Fuel, Settings, Edit2, Trash2, Eye, Plus, ArrowRight, Check, Clock, Shield, Wifi, Wind, Plug, Droplets } from "lucide-react";

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyForm = {
    vehicle_type: "",
    vehicle_number: "",
    number_of_seats: "",
    details: "",
    image: null,
    features: {
      AC: false,
      WiFi: false,
      RecliningSeats: false,
      ChargingPorts: false,
      FreeWaterBottle: false,
    },
  };

  const [formData, setFormData] = useState(emptyForm);

  const allFeatures = Object.keys(emptyForm.features);

  // Feature icons mapping
  const featureIcons = {
    AC: Wind,
    WiFi: Wifi,
    RecliningSeats: Settings,
    ChargingPorts: Plug,
    FreeWaterBottle: Droplets,
  };

  // -------------------- FETCH VEHICLES --------------------
  const fetchVehicles = async () => {
    try {
      const res = await apiPrivate.get("/auth/vehicles/");
      setVehicles(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // -------------------- HANDLE CHANGE --------------------
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name in formData.features) {
      setFormData((prev) => ({
        ...prev,
        features: { ...prev.features, [name]: checked },
      }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // -------------------- SUBMIT (ADD / UPDATE) --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "features") {
        formDataToSend.append("features", JSON.stringify(value));
      } else if (key === "image" && value !== null) {
        formDataToSend.append("image", value);
      } else if (key !== "image") {
        formDataToSend.append(key, value);
      }
    });

    try {
      if (editingVehicle) {
        await apiPrivate.put(
          `/auth/vehicles/${editingVehicle.id}/`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await apiPrivate.post("/vehicles/", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setShowForm(false);
      setEditingVehicle(null);
      setFormData(emptyForm);
      fetchVehicles();
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------- DELETE --------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await apiPrivate.delete(`/auth/vehicles/${id}/`);
      fetchVehicles();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
    }
  };

  // -------------------- EDIT --------------------
  const handleEdit = (v) => {
    let parsedFeatures = {};

    try {
      parsedFeatures =
        typeof v.features === "string" ? JSON.parse(v.features) : v.features;
    } catch {
      parsedFeatures = emptyForm.features;
    }

    setEditingVehicle(v);
    setShowDetails(null);
    setShowForm(true);

    setFormData({
      vehicle_type: v.vehicle_type,
      vehicle_number: v.vehicle_number,
      number_of_seats: v.number_of_seats,
      details: v.details || "",
      image: null,
      features: { ...emptyForm.features, ...parsedFeatures },
    });
  };

  // Get vehicle type color
  const getVehicleTypeColor = (type) => {
    const colors = {
      bus: "bg-blue-100 text-blue-800",
      coaster: "bg-purple-100 text-purple-800",
      car: "bg-green-100 text-green-800",
      hiace: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Get vehicle type icon
  const getVehicleIcon = (type) => {
    const icons = {
      bus: "🚌",
      coaster: "🚐",
      car: "🚗",
      hiace: "🚙",
    };
    return icons[type] || "🚗";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 transition-all duration-300">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Car className="text-white" size={28} />
              </div>
              Vehicle Fleet Management
            </h1>
            <p className="text-gray-600 mt-2">Manage your entire vehicle fleet in one place</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-md">
              <span className="text-sm text-gray-600">Total Vehicles:</span>
              <span className="ml-2 font-bold text-lg text-gray-900">{vehicles.length}</span>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingVehicle(null);
                setFormData(emptyForm);
                setShowDetails(null);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 ${
                showForm
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-red-200"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-200"
              } flex items-center gap-2`}
            >
              {showForm ? (
                <>
                  <X size={20} /> Cancel
                </>
              ) : (
                <>
                  <Plus size={20} /> Add New Vehicle
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-blue-500 transition-transform duration-300 hover:translate-y-[-2px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Car className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-green-500 transition-transform duration-300 hover:translate-y-[-2px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.reduce((acc, v) => acc + (parseInt(v.number_of_seats) || 0), 0)}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-purple-500 transition-transform duration-300 hover:translate-y-[-2px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With AC</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.filter(v => {
                    const features = typeof v.features === 'string' ? JSON.parse(v.features) : v.features;
                    return features?.AC;
                  }).length}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Wind className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-orange-500 transition-transform duration-300 hover:translate-y-[-2px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With WiFi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.filter(v => {
                    const features = typeof v.features === 'string' ? JSON.parse(v.features) : v.features;
                    return features?.WiFi;
                  }).length}
                </p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Wifi className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- FORM -------------------- */}
      {showForm && (
        <div className="animate-fadeIn mb-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-gray-900">
                {editingVehicle ? "Update Vehicle Details" : "Add New Vehicle"}
              </h4>
              {editingVehicle && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Editing: {editingVehicle.vehicle_number}
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Vehicle Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Car size={16} /> Vehicle Type
                </label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select Type</option>
                  <option value="bus">Bus</option>
                  <option value="coaster">Coaster</option>
                  <option value="car">Car</option>
                  <option value="hiace">Hiace</option>
                </select>
              </div>

              {/* Vehicle Number */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Vehicle Number</label>
                <input
                  type="text"
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                  placeholder="e.g., ABC-1234"
                />
              </div>

              {/* Seats */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Users size={16} /> Number of Seats
                </label>
                <input
                  type="number"
                  name="number_of_seats"
                  value={formData.number_of_seats}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                  min="1"
                />
              </div>

              {/* Details */}
              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Additional Details</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  rows="3"
                  placeholder="Enter any additional information about the vehicle..."
                />
              </div>

              {/* Features Section */}
              <div className="md:col-span-3 space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Settings size={16} /> Vehicle Features
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {allFeatures.map((f) => {
                    const Icon = featureIcons[f];
                    return (
                      <label
                        key={f}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.features[f]
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            name={f}
                            checked={formData.features[f]}
                            onChange={handleChange}
                            className="hidden"
                          />
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center ${
                              formData.features[f]
                                ? "bg-blue-500 border-blue-500"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {formData.features[f] && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{f}</span>
                          {Icon && <Icon size={16} className="text-gray-500 mt-1" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-3">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Vehicle Image
                </label>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <label className="cursor-pointer group">
                    <div className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group-hover:scale-105">
                      <div className="p-4 bg-blue-100 rounded-full mb-3">
                        <Camera className="text-blue-600" size={32} />
                      </div>
                      <span className="text-blue-600 font-medium">Upload Image</span>
                      <span className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </div>
                  </label>

                  <div className="flex-1 space-y-3">
                    {formData.image && (
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-green-600" size={20} />
                          <div>
                            <p className="font-medium text-green-800">Image Selected</p>
                            <p className="text-sm text-green-600">{formData.image.name}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {editingVehicle && !formData.image && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">Note:</span> Current image will remain unchanged unless you upload a new one.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : editingVehicle ? (
                  <>
                    <CheckCircle size={20} /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus size={20} /> Add Vehicle
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingVehicle(null);
                  setFormData(emptyForm);
                }}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -------------------- VEHICLE LIST -------------------- */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                <LayoutGrid className="text-white" size={24} />
              </div>
              Current Vehicle Fleet
            </h3>
            <p className="text-gray-600 mt-1">Click on any vehicle to view details</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {vehicles.length} vehicles
            </span>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="text-gray-400" size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-700 mb-2">No Vehicles Added Yet</h4>
              <p className="text-gray-600 mb-6">Start building your fleet by adding your first vehicle</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                <Plus size={20} className="inline mr-2" />
                Add Your First Vehicle
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((v) => {
              const features = typeof v.features === "string" ? JSON.parse(v.features) : v.features;
              const activeFeatures = Object.entries(features).filter(([_, val]) => val);
              
              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:translate-y-[-4px] group"
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    {v.image ? (
                      <img
                        src={v.image}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        alt={v.vehicle_number}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Car className="text-blue-400" size={64} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getVehicleTypeColor(v.vehicle_type)}`}>
                        {getVehicleIcon(v.vehicle_type)} {v.vehicle_type.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                      {v.number_of_seats} seats
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{v.vehicle_number}</h4>
                        <p className="text-gray-600 text-sm">Vehicle ID: #{v.id.toString().padStart(4, '0')}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-600">
                          <Shield size={14} />
                          <span className="text-xs font-medium">ACTIVE</span>
                        </div>
                      </div>
                    </div>

                    {/* Features Preview */}
                    {activeFeatures.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {activeFeatures.slice(0, 3).map(([key]) => {
                            const Icon = featureIcons[key];
                            return (
                              <span
                                key={key}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs"
                              >
                                {Icon && <Icon size={12} />}
                                {key}
                              </span>
                            );
                          })}
                          {activeFeatures.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                              +{activeFeatures.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Details Preview */}
                    {v.details && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {v.details}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setShowDetails(v)}
                        className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2.5 rounded-xl font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                      >
                        <Eye size={16} />
                        View Details
                        <ArrowRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      </button>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(v)}
                          className="p-2.5 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors duration-300 tooltip"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-300 tooltip"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* -------------------- DETAILS MODAL -------------------- */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {showDetails.vehicle_type.toUpperCase()} - {showDetails.vehicle_number}
                  </h2>
                  <p className="text-blue-100 mt-1">Vehicle Details</p>
                </div>
                <button
                  onClick={() => setShowDetails(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200"
                >
                  <X className="text-white" size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Image */}
              {showDetails.image && (
                <div className="mb-6">
                  <img
                    src={showDetails.image}
                    className="w-full h-64 object-cover rounded-xl shadow-md"
                    alt={showDetails.vehicle_number}
                  />
                </div>
              )}

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Vehicle Type</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {showDetails.vehicle_type}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Registration Number</p>
                    <p className="text-xl font-bold text-gray-900">
                      {showDetails.vehicle_number}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Seating Capacity</p>
                    <div className="flex items-center gap-2">
                      <Users className="text-blue-600" size={20} />
                      <span className="text-2xl font-bold text-gray-900">
                        {showDetails.number_of_seats}
                      </span>
                      <span className="text-gray-600">seats</span>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings size={20} /> Features & Amenities
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(
                      typeof showDetails.features === "string"
                        ? JSON.parse(showDetails.features)
                        : showDetails.features
                    )
                      .filter(([_, val]) => val)
                      .map(([key]) => {
                        const Icon = featureIcons[key];
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
                          >
                            <div className="p-2 bg-green-100 rounded-lg">
                              {Icon ? <Icon className="text-green-700" size={20} /> : <CheckCircle className="text-green-700" size={20} />}
                            </div>
                            <span className="font-medium text-gray-900">{key}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {showDetails.details && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Additional Information</h4>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-700">{showDetails.details}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleEdit(showDetails);
                    setShowDetails(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Edit2 size={20} /> Edit Vehicle
                </button>
                <button
                  onClick={() => setShowDetails(null)}
                  className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .tooltip {
          position: relative;
        }
        .tooltip:hover::after {
          content: attr(title);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

export default VehicleManagement;