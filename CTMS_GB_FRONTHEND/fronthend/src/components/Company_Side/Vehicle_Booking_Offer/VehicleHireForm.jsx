import React, { useState, useEffect } from "react";
import apiPrivate from "../../../api/apiprivate";
import { 
  Bus, User, Tag, Calendar, Clock, DollarSign, MapPin, Truck, Route,
  Package, Clock4, CalendarDays, MapPinned
} from "lucide-react";

// Pricing Configuration Component
const PricingSection = ({ pricingData, onPricingChange, selectedOptions }) => {
  const [activeTab, setActiveTab] = useState('specific_route');

  const handlePricingChange = (field, value) => {
    onPricingChange({
      ...pricingData,
      [field]: value
    });
  };

  return (
    <div className="space-y-4 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
      {/* Pricing Type Tabs */}
      <div className="flex border-b border-gray-200">
        {selectedOptions.is_specific_route && (
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
              activeTab === 'specific_route' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('specific_route')}
          >
            <Route className="w-4 h-4 inline mr-1" />
            Specific Route
          </button>
        )}
        {selectedOptions.is_long_drive && (
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
              activeTab === 'long_drive' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('long_drive')}
          >
            <CalendarDays className="w-4 h-4 inline mr-1" />
            Long Drive
          </button>
        )}
      </div>

      {/* Specific Route Pricing */}
      {activeTab === 'specific_route' && selectedOptions.is_specific_route && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 flex items-center">
            <Route className="w-4 h-4 mr-2" />
            Fixed Route Pricing
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Fare (Rs) *
              </label>
              <input
                type="number"
                value={pricingData.fixed_fare || ''}
                onChange={(e) => handlePricingChange('fixed_fare', e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 15000"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Total fare for the complete route</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Distance (km)
              </label>
              <input
                type="number"
                value={pricingData.distance || ''}
                onChange={(e) => handlePricingChange('distance', e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 350"
                min="1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Long Drive Pricing */}
      {activeTab === 'long_drive' && selectedOptions.is_long_drive && (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Time-Based Pricing
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Hour Rate (Rs)
              </label>
              <input
                type="number"
                value={pricingData.per_hour_rate || ''}
                onChange={(e) => handlePricingChange('per_hour_rate', e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 1000"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Day Rate (Rs) *
              </label>
              <input
                type="number"
                value={pricingData.per_day_rate || ''}
                onChange={(e) => handlePricingChange('per_day_rate', e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 8000"
                min="1"
                required={selectedOptions.is_long_drive}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekly Package (Rs)
              </label>
              <input
                type="number"
                value={pricingData.weekly_rate || ''}
                onChange={(e) => handlePricingChange('weekly_rate', e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 45000"
                min="1"
              />
            </div>
          </div>
          
          {/* Additional Charges */}
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <h5 className="font-medium text-gray-700 mb-2">Additional Charges (Optional)</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Night Charge (per night)</label>
                <input
                  type="number"
                  value={pricingData.night_charge || ''}
                  onChange={(e) => handlePricingChange('night_charge', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-sm"
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mountain Area Surcharge</label>
                <input
                  type="number"
                  value={pricingData.mountain_surcharge || ''}
                  onChange={(e) => handlePricingChange('mountain_surcharge', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-sm"
                  placeholder="e.g., 1000"
                />
              </div>
            </div>
          </div>
          
          {/* Custom Quote Option */}
          <div className="flex items-center mt-3">
            <input
              type="checkbox"
              id="custom_quote"
              checked={pricingData.allow_custom_quote || false}
              onChange={(e) => handlePricingChange('allow_custom_quote', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="custom_quote" className="text-sm text-gray-700">
              Allow custom quotes for special requirements
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// Checkbox Option Component (Improved)
const CheckboxOption = ({ label, name, checked, onChange, icon: Icon, color, description }) => (
  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
    checked 
      ? `border-${color}-500 bg-${color}-50 shadow-sm` 
      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
  }`}>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className={`mt-1 mr-3 w-4 h-4 text-${color}-600 focus:ring-${color}-500`}
    />
    <div className="flex-1">
      <div className="flex items-center">
        <Icon className={`w-5 h-5 mr-2 text-${color}-500`} />
        <span className="font-medium text-gray-800">{label}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-600 mt-1 ml-7">{description}</p>
      )}
    </div>
  </label>
);

const TransportForm = ({
  closeForm,
  editingId,
  routes,
  vehicles,
  drivers,
  setTransports,
  offerType = "whole_hire",
  transports
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced state for hire options
  const [hireOptions, setHireOptions] = useState({
    is_long_drive: false,
    is_specific_route: false,
    from_location: "",
    to_location: "",
  });

  // Enhanced pricing state
  const [pricingData, setPricingData] = useState({
    // Specific Route Pricing
    fixed_fare: "",
    distance: "",
    
    // Long Drive Pricing
    per_hour_rate: "",
    per_day_rate: "",
    weekly_rate: "",
    night_charge: "",
    mountain_surcharge: "",
    allow_custom_quote: false,
  });

  const [formData, setFormData] = useState({
    vehicle: "",
    driver: "",
    location_address: "",
    offer_type: offerType,
  });

  // Load data for editing
  useEffect(() => {
    setError(null);
    
    if (editingId) {
      const transport = transports.find(t => t.id === editingId);
      if (transport) {
        // Load main form data
        setFormData({
          vehicle: String(transport.vehicle || ""),
          driver: String(transport.driver || ""),
          location_address: transport.location_address || "",
          offer_type: transport.offer_type || offerType,
        });

        // Load hire options
        setHireOptions({
          is_long_drive: transport.is_long_drive || false,
          is_specific_route: transport.is_specific_route || false,
          from_location: transport.from_location || "",
          to_location: transport.to_location || "",
        });

        // Load pricing data
        setPricingData({
          fixed_fare: transport.fixed_fare || "",
          distance: transport.distance || "",
          per_hour_rate: transport.per_hour_rate || "",
          per_day_rate: transport.per_day_rate || "",
          weekly_rate: transport.weekly_rate || "",
          night_charge: transport.night_charge || "",
          mountain_surcharge: transport.mountain_surcharge || "",
          allow_custom_quote: transport.allow_custom_quote || false,
        });
        
        setSelectedVehicle(vehicles.find(v => v.id === Number(transport.vehicle)) || null);
        setSelectedDriver(drivers.find(d => d.id === Number(transport.driver)) || null);
      }
    } else {
      // Reset for new offer
      resetForm();
    }
    setLoading(false);
  }, [editingId, transports, offerType, vehicles, drivers]);

  const resetForm = () => {
    setFormData({
      vehicle: "",
      driver: "",
      location_address: "",
      offer_type: offerType,
    });
    setHireOptions({
      is_long_drive: false,
      is_specific_route: false,
      from_location: "",
      to_location: "",
    });
    setPricingData({
      fixed_fare: "",
      distance: "",
      per_hour_rate: "",
      per_day_rate: "",
      weekly_rate: "",
      night_charge: "",
      mountain_surcharge: "",
      allow_custom_quote: false,
    });
    setSelectedVehicle(null);
    setSelectedDriver(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isNumberField = name === "vehicle" || name === "driver";
    
    const processedValue = isNumberField && value !== "" ? Number(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleHireOptionsChange = (e) => {
    const { name, type, checked, value } = e.target;
    setHireOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Enhanced validation
  const validateForm = () => {
    if (!formData.vehicle || !formData.driver) {
      return "Please select both vehicle and driver.";
    }

    // At least one service type must be selected
    if (!hireOptions.is_long_drive && !hireOptions.is_specific_route) {
      return "Please select at least one Vehicle Booking Offer Type.";
    }

    // Specific Route validation
    if (hireOptions.is_specific_route) {
      if (!hireOptions.from_location || !hireOptions.to_location) {
        return "Please provide both From and To locations for Specific Route offers.";
      }
      if (!pricingData.fixed_fare) {
        return "Please set a Fixed Fare for Specific Route offers.";
      }
    }

    // Long Drive validation
    if (hireOptions.is_long_drive) {
      if (!pricingData.per_day_rate && !pricingData.allow_custom_quote) {
        return "Please set at least Per Day Rate or enable Custom Quotes for Long Drive offers.";
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    // Prepare form data
    const fd = new FormData();
    
    // Basic fields
    fd.append("vehicle", String(formData.vehicle));
    fd.append("driver", String(formData.driver));
    fd.append("offer_type", 'whole_hire');
    fd.append("location_address", formData.location_address || "");
    
    // Hire options
    fd.append("is_long_drive", hireOptions.is_long_drive);
    fd.append("is_specific_route", hireOptions.is_specific_route);
    
    // Conditional locations
    if (hireOptions.is_specific_route) {
      fd.append("from_location", hireOptions.from_location);
      fd.append("to_location", hireOptions.to_location);
    }

    // Pricing data
    if (hireOptions.is_specific_route) {
      fd.append("fixed_fare", pricingData.fixed_fare);
      fd.append("distance", pricingData.distance || "");
    }
    
    if (hireOptions.is_long_drive) {
      fd.append("per_hour_rate", pricingData.per_hour_rate || "");
      fd.append("per_day_rate", pricingData.per_day_rate || "");
      fd.append("weekly_rate", pricingData.weekly_rate || "");
      fd.append("night_charge", pricingData.night_charge || "");
      fd.append("mountain_surcharge", pricingData.mountain_surcharge || "");
      fd.append("allow_custom_quote", pricingData.allow_custom_quote);
    }

    try {
      const req = editingId
        ? apiPrivate.put(`/transports/${editingId}/`, fd)
        : apiPrivate.post("/transports/", fd);

      const res = await req;

      // Update local state
      const vehicleDetail = vehicles.find(v => v.id === Number(formData.vehicle));
      const driverDetail = drivers.find(d => d.id === Number(formData.driver));

      const updatedTransport = {
        ...res.data,
        route_from: hireOptions.is_specific_route ? res.data.from_location : formData.location_address,
        route_to: hireOptions.is_specific_route ? res.data.to_location : 'Flexible Route',
        vehicle_number: vehicleDetail?.vehicle_number,
        driver_name: driverDetail?.driver_name,
        vehicle_image: vehicleDetail?.image_url,
        driver_image: driverDetail?.image_url,
      };

      setTransports(prev =>
        editingId ? prev.map(x => x.id === editingId ? updatedTransport : x) : [...prev, updatedTransport]
      );

      closeForm();

    } catch (err) {
      console.error("❌ Transport save error:", err.response?.data || err.message);
      const apiError = err.response?.data?.detail || 
        Object.values(err.response?.data || {}).flat().join(" ") || 
        "An unexpected error occurred.";
      setError(`Save Failed: ${apiError}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Loading Offer Details...</span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">!</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Service Type Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
          <Tag className="w-5 h-5 mr-2 text-blue-500" />
          Service Type Selection
          <span className="text-red-500 ml-1">*</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CheckboxOption 
            label="Vehicle Rentals Service" 
            name="is_long_drive" 
            checked={hireOptions.is_long_drive} 
            onChange={handleHireOptionsChange} 
            icon={CalendarDays} 
            color="green"
            description="Hourly, daily, or weekly rentals for flexible routes"
          />
          <CheckboxOption 
            label="Specific Route Service" 
            name="is_specific_route" 
            checked={hireOptions.is_specific_route} 
            onChange={handleHireOptionsChange} 
            icon={Route} 
            color="blue"
            description="Fixed routes with predetermined pricing"
          />
        </div>
      </div>

      {/* Pricing Configuration */}
      {(hireOptions.is_specific_route || hireOptions.is_long_drive) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
            <DollarSign className="w-5 h-5 mr-2 text-green-500" />
            Pricing Configuration
            <span className="text-red-500 ml-1">*</span>
          </h3>
          
          <PricingSection 
            pricingData={pricingData}
            onPricingChange={setPricingData}
            selectedOptions={hireOptions}
          />
        </div>
      )}

      {/* Route Information */}
      {hireOptions.is_specific_route && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
            <MapPinned className="w-5 h-5 mr-2 text-purple-500" />
            Route Information
            <span className="text-red-500 ml-1">*</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Location
              </label>
              <input
                type="text"
                name="from_location"
                value={hireOptions.from_location}
                onChange={handleHireOptionsChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., Gilgit"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Location
              </label>
              <input
                type="text"
                name="to_location"
                value={hireOptions.to_location}
                onChange={handleHireOptionsChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., Islamabad"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Vehicle & Driver Assignment */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
          <Truck className="w-5 h-5 mr-2 text-indigo-500" />
          Vehicle & Driver Assignment
          <span className="text-red-500 ml-1">*</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Vehicle
            </label>
            <select
              name="vehicle"
              value={formData.vehicle}
              onChange={(e) => {
                handleChange(e);
                const id = Number(e.target.value);
                setSelectedVehicle(vehicles.find(v => v.id === id) || null);
              }}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Choose a vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_number} ({vehicle.vehicle_type} - {vehicle.number_of_seats} seats)
                </option>
              ))}
            </select>
            
            {selectedVehicle && (
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center space-x-3">
                  {selectedVehicle.image_url ? (
                    <img 
                      src={selectedVehicle.image_url} 
                      alt="Vehicle" 
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center text-indigo-500">
                      <Bus size={24} />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{selectedVehicle.vehicle_number}</div>
                    <div className="text-sm text-gray-600">
                      {selectedVehicle.vehicle_type} • {selectedVehicle.number_of_seats} seats
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Driver Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Driver
            </label>
            <select
              name="driver"
              value={formData.driver}
              onChange={(e) => {
                handleChange(e);
                const id = Number(e.target.value);
                setSelectedDriver(drivers.find(d => d.id === id) || null);
              }}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Choose a driver</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.driver_name} (License: {driver.driving_license_no})
                </option>
              ))}
            </select>
            
            {selectedDriver && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-3">
                  {selectedDriver.image_url ? (
                    <img 
                      src={selectedDriver.image_url} 
                      alt="Driver" 
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-white rounded-full border flex items-center justify-center text-amber-500">
                      <User size={24} />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{selectedDriver.driver_name}</div>
                    <div className="text-sm text-gray-600">
                      License: {selectedDriver.driving_license_no}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Base Location */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
          <MapPin className="w-5 h-5 mr-2 text-red-500" />
          Base Location Information
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup/Base Address
          </label>
          <input
            type="text"
            name="location_address"
            value={formData.location_address}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-red-500 focus:border-red-500"
            placeholder="e.g., Company office location or preferred pickup point"
          />
          <p className="text-sm text-gray-500 mt-2">
            This address will be shown to customers for pickup coordination.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={closeForm}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            isSubmitting
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </span>
          ) : (
            editingId ? 'Update Vehicle Offer' : 'Create Vehicle Offer'
          )}
        </button>
      </div>
    </form>
  );
};

export default TransportForm;