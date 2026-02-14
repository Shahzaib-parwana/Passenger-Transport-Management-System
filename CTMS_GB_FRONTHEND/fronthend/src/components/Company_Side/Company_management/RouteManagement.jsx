import React, { useState, useEffect } from "react";
import { Plus, Trash2, MapPin } from "lucide-react";
import apiPrivate from "../../../api/apiprivate";

const ROUTE_CHOICES = [
  "Skardu", "Gilgit", "Shigar", "Hunza", "Nagar", "Khaplu",
  "Chilas", "Astor", "Islamabad/Rawalpindi", "Gizer",
];

export default function RouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  // Pre-map options
  const locationOptions = ROUTE_CHOICES.map(loc => (
    <option key={loc} value={loc}>{loc}</option>
  ));

  // Fetch routes
  const fetchRoutes = async () => {
    try {
      setFetching(true);
      const res = await apiPrivate.get("/routes/");
      setRoutes(res.data);
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setError("Failed to load routes.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Add route
  const addRoute = async () => {
    setError("");
    if (!fromLocation || !toLocation) return setError("Select both From & To locations.");
    if (fromLocation === toLocation) return setError("From & To cannot be the same.");

    if (routes.some(r =>
      (r.from_location === fromLocation && r.to_location === toLocation) ||
      (r.from_location === toLocation && r.to_location === fromLocation)
    )) {
      return setError("This route already exists!");
    }

    const newRoute = { from_location: fromLocation, to_location: toLocation };
    setLoading(true);
    try {
      await apiPrivate.post("/routes/", newRoute);
      setFromLocation("");
      setToLocation("");
      fetchRoutes();
    } catch (err) {
      console.error("Add route failed:", err);
      setError(err.response?.data?.detail || "Failed to add route.");
    } finally {
      setLoading(false);
    }
  };

  // Delete route
 const deleteRoute = (route) => {
  if (!window.confirm("Are you sure you want to delete this route?")) return;

  const token = localStorage.getItem("access_token");
  if (!token) return setError("You are not authorized.");

  apiPrivate
    .delete(`/auth/routes/${route.id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => setRoutes(prev => prev.filter(r => r.id !== route.id)))
    .catch((err) => {
      console.error("Failed to delete route:", err.response || err.message);
      setError(err.response?.data?.detail || "Failed to delete route.");
    });
};


  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <MapPin size={20} /> Route Management
      </h2>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="font-medium mb-1">From Location</label>
          <select
            value={fromLocation}
            onChange={e => setFromLocation(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {locationOptions}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1">To Location</label>
          <select
            value={toLocation}
            onChange={e => setToLocation(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {locationOptions}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={addRoute}
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <Plus size={18} /> {loading ? "Adding..." : "Add Route"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {/* Routes List */}
      {fetching ? (
        <p className="text-gray-500">Loading routes...</p>
      ) : routes.length === 0 ? (
        <p className="text-gray-500 text-sm">No routes added yet.</p>
      ) : (
        <ul className="space-y-3">
  {routes.map(route => {
    console.log("Route from backend:", route);   // ← ADD THIS HERE

    return (
      <li
        key={route.id || route.from_location + route.to_location}
        className="border border-gray-300 rounded-lg p-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
      >
        <span className="font-medium">
          {route.from_location} → {route.to_location}
        </span>
        <button
          onClick={() => deleteRoute(route)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      </li>
    );
  })}
</ul>

      )}
    </div>
  );
}
