import React, { useState, useEffect } from "react";
import apiPrivate from "../../../api/apiprivate";
import { Bus, User, Tag, Calendar, Clock, DollarSign, MapPin, Truck } from "lucide-react";

const TransportForm = ({
  closeForm,
  editingId,
  routes,
  vehicles,
  drivers,
  setTransports,
  offerType = "offer_sets",
  transports
}) => {
  
  const todayDate = new Date().toISOString().split("T")[0]; 
  const maxDay = new Date();
  maxDay.setDate(maxDay.getDate() + 30); 
  const maxDate = maxDay.toISOString().split("T")[0]; 
  const currentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  // -------------------------------------------------------------

  const [reserveSeats, setReserveSeats] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const [formData, setFormData] = useState({
    route: "",
    vehicle: "",
    driver: "",
    price_per_seat: "",
    arrival_date: todayDate, // Defaulting to today's date
    arrival_time: currentTime, // Defaulting to current time
    reserve_seats_str: "",
    offer_type: offerType, 
  });
  useEffect(() => {
    setError(null); 
    
    if (editingId) {
      const t = transports.find(x => x.id === editingId);
      if (t) {
        setReserveSeats(t.reserve_seats?.length > 0);
        setFormData({
            route: String(t.route || ""), 
            vehicle: String(t.vehicle || ""),
            driver: String(t.driver || ""),
            price_per_seat: String(t.price_per_seat || ''), 
            arrival_date: t.arrival_date || todayDate,
            arrival_time: t.arrival_time || currentTime,
            reserve_seats_str: Array.isArray(t.reserve_seats) ? t.reserve_seats.join(",") : "",
            offer_type: t.offer_type || offerType,
        });

        setSelectedVehicle(vehicles.find((v) => v.id === Number(t.vehicle)) || null);
        setSelectedDriver(drivers.find((d) => d.id === Number(t.driver)) || null);
      }
    } else {
        setFormData(prev => ({
            ...prev,
            route: "",
            vehicle: "",
            driver: "",
            price_per_seat: "",
            arrival_date: todayDate,
            arrival_time: currentTime,
            reserve_seats_str: "",
            offer_type: offerType,
        }));
        setSelectedVehicle(null);
        setSelectedDriver(null);
        setReserveSeats(false);
    }
    setLoading(false);
  }, [editingId, transports, offerType, vehicles, drivers, todayDate, currentTime]);


  // --- Helper to handle field change ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const isNumberField = name === "route" || name === "vehicle" || name === "driver" || name === "price_per_seat";
    
    const processedValue = isNumberField && value !== ""
        ? Number(value) 
        : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // --- Form Submission Handler ---
 const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  setIsSubmitting(true);
  setError(null);

  try {
    const fd = new FormData();

    fd.append("route", formData.route);
    fd.append("vehicle", formData.vehicle);
    fd.append("driver", formData.driver);
    fd.append("price_per_seat", formData.price_per_seat);
    fd.append("arrival_date", formData.arrival_date);
    fd.append("arrival_time", formData.arrival_time);
    fd.append("offer_type", formData.offer_type);

    fd.append(
      "reserve_seats",
      JSON.stringify(
        reserveSeats
          ? formData.reserve_seats_str
              .split(",")
              .map((s) => parseInt(s.trim()))
              .filter((n) => !isNaN(n))
          : []
      )
    );

    let res;

    // ✅ ONLY UPDATE WHEN USER IS EXPLICITLY EDITING
    if (editingId !== null && editingId !== undefined) {
      res = await apiPrivate.put(`/transports/${editingId}/`, fd);
    } else {
      res = await apiPrivate.post("/transports/", fd);
    }

    setTransports((prev) =>
      editingId
        ? prev.map((t) => (t.id === editingId ? res.data : t))
        : [...prev, res.data]
    );

    closeForm();
  } catch (err) {
    setError("Save failed");
    console.error(err);
  } finally {
    setIsSubmitting(false);
  }
};

  
  const isSeatBooking = formData.offer_type === 'offer_sets' || formData.offer_type === 'seat_booking';
  
  const formTitle = editingId 
    ? `Edit ${isSeatBooking ? 'Seat Offer' : 'Hire Offer'}` 
    : `New ${isSeatBooking ? 'Seat Booking Offer' : 'Vehicle Hire Offer'}`;
    
  if (loading) return <div className="text-center p-8 text-indigo-600">Loading Offer Details...</div>;


  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      
        {/* Error Message Display */}
        {error && (
            <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-inner font-medium">
                Error: {error}
            </div>
        )}

        {/* --- Primary Details Group --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white border border-gray-200 rounded-xl shadow-md">
            <h3 className="md:col-span-2 text-lg font-bold text-indigo-700 flex items-center mb-2 border-b pb-2">
                <Truck className="w-5 h-5 mr-2" /> Offer Specifications
            </h3>
            
            {/* Route */}
            <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center"><MapPin className="w-4 h-4 mr-1 text-blue-500" /> Route <span className="text-red-500 ml-1">*</span></label>
                <select
                    name="route"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    value={formData.route}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Route (From → To)</option>
                    {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.from_location} → {r.to_location}
                        </option>
                    ))}
                </select>
            </div>

            {/* Offer Type Display */}
            <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center"><Tag className="w-4 h-4 mr-1 text-purple-500" /> Offer Type</label>
                <div className="w-full border border-gray-300 p-3 rounded-lg bg-indigo-50 text-indigo-700 font-medium cursor-default shadow-sm">
                    {isSeatBooking ? 'Seat Booking (By Seat)' : 'Vehicle Hire (Whole Vehicle)'}
                </div>
            </div>

            {/* Price */}
            <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center"><DollarSign className="w-4 h-4 mr-1 text-red-500" /> {isSeatBooking ? 'Price per Seat' : 'Total Hire Price'} <span className="text-red-500 ml-1">*</span></label>
                <input
                    type="number"
                    name="price_per_seat"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm"
                    placeholder={isSeatBooking ? "Price per seat (Rs)" : "Total Hire Price (Rs)"}
                    value={formData.price_per_seat}
                    onChange={handleChange}
                    min="1"
                    required
                />
            </div>
            
            {/* Date - Min/Max applied */}
            <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center"><Calendar className="w-4 h-4 mr-1 text-indigo-500" /> Arrival Date <span className="text-red-500 ml-1">*</span></label>
                <input
                    type="date"
                    name="arrival_date"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                    value={formData.arrival_date}
                    onChange={handleChange}
                    min={todayDate} // <-- Fixed: Removed the **
                    max={maxDate} // <-- Fixed: Removed the **
                    required
                />
            </div>

            {/* Time - Conditional Min Time applied */}
            <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center"><Clock className="w-4 h-4 mr-1 text-orange-500" /> Arrival Time <span className="text-red-500 ml-1">*</span></label>
                <input
                    type="time"
                    name="arrival_time"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition shadow-sm"
                    value={formData.arrival_time}
                    onChange={handleChange}
                    min={formData.arrival_date === todayDate ? currentTime : "00:00"} // <-- Fixed: Removed the **
                    required
                />
            </div>
        </div>

        {/* --- Vehicle and Driver Group --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white border border-gray-200 rounded-xl shadow-md">
            <h3 className="md:col-span-2 text-lg font-bold text-indigo-700 flex items-center mb-2 border-b pb-2">
                <Truck className="w-5 h-5 mr-2" /> Vehicle & Driver Assignment
            </h3>
            
            {/* Vehicle Selection */}
            <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center"><Bus className="w-4 h-4 mr-1 text-green-500" /> Vehicle <span className="text-red-500 ml-1">*</span></label>
                <select
                    name="vehicle"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                    value={formData.vehicle}
                    onChange={(e) => {
                        handleChange(e);
                        const id = Number(e.target.value);
                        setSelectedVehicle(vehicles.find((v) => v.id === id) || null);
                    }}
                    required
                >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.vehicle_number} ({v.vehicle_type} - {v.number_of_seats} Seats)
                        </option>
                    ))}
                </select>

                {/* Vehicle Display (With Image Fix) */}
                {selectedVehicle && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm flex items-center gap-3">
                        {selectedVehicle.image_url ? (
                             <img src={selectedVehicle.image_url} alt="Vehicle" className="w-12 h-12 object-cover rounded-md" />
                        ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-md border text-green-500 shadow-sm">
                                <Bus size={20} />
                            </div>
                        )}
                        <div>
                            <div className="font-bold text-gray-800">{selectedVehicle.vehicle_number}</div>
                            <div className="text-gray-600">{selectedVehicle.vehicle_type} | Seats: {selectedVehicle.number_of_seats}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Driver Selection */}
            <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center"><User className="w-4 h-4 mr-1 text-yellow-500" /> Driver <span className="text-red-500 ml-1">*</span></label>
                <select
                    name="driver"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition shadow-sm"
                    value={formData.driver}
                    onChange={(e) => {
                        handleChange(e);
                        const id = Number(e.target.value);
                        setSelectedDriver(drivers.find((d) => d.id === id) || null);
                    }}
                    required
                >
                    <option value="">Select Driver</option>
                    {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.driver_name} (License: {d.driving_license_no})
                        </option>
                    ))}
                </select>
                {/* Driver Display (With Image Fix) */}
                {selectedDriver && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm flex items-center gap-3">
                        {selectedDriver.image_url ? (
                             <img src={selectedDriver.image_url} alt="Driver" className="w-12 h-12 object-cover rounded-full" />
                        ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full border text-yellow-500 shadow-sm">
                                <User size={20} />
                            </div>
                        )}
                        <div>
                            <div className="font-bold text-gray-800">{selectedDriver.driver_name}</div>
                            <div className="text-gray-600">License: {selectedDriver.driving_license_no}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>


      {/* Reserve Seats (Conditional, only for seat_booking) */}
      {isSeatBooking && (
        <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-indigo-700 flex items-center mb-3">
                <Tag className="w-5 h-5 mr-2" /> Seat Reservations
            </h3>
            
          <label className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={reserveSeats}
              onChange={(e) => setReserveSeats(e.target.checked)}
              className="accent-blue-600 w-4 h-4"
            />
            Reserve specific seats for this trip?
          </label>

          {reserveSeats && (
            <input
              type="text"
              name="reserve_seats_str"
              className="w-full border border-gray-300 p-3 rounded-lg mt-3 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
              placeholder={`Enter seat numbers separated by commas (e.g. 2,4,5,8). Max seats: ${selectedVehicle?.number_of_seats || 'N/A'}`}
              value={formData.reserve_seats_str}
              onChange={handleChange}
            />
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t mt-4">
        <button
          type="button"
          onClick={closeForm}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-400 transition"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-2 rounded-full font-bold shadow-lg transition transform ${
                isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]'
            }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : editingId ? "Update Offer" : "Save New Offer"}
        </button>
      </div>
    </form>
  );
};

export default TransportForm;