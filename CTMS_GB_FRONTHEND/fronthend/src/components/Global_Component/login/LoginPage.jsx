// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiPublic from "../../../api/axiosConfig";
import { LogIn, User, Lock, ArrowRight, X } from "lucide-react";

export default function LoginPage({ isModal = false, onSuccessfulLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";
  const transport = location.state?.transport || null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiPublic.post("/auth/login/", { username, password });
      const data = response.data || {};

      // tokens & basic role/status
      const access = data.access || data.token || data.accessToken;
      const refresh = data.refresh || data.refreshToken;
      const role = data.role || data.user_role || data.account_type;
      const status = data.status || data.company_status;

      localStorage.setItem("accessToken", access || "");
      localStorage.setItem("refreshToken", refresh || "");
      localStorage.setItem("access_token", access || "");
      localStorage.setItem("refresh_token", refresh || "");
      if (role) localStorage.setItem("user_role", role);
      if (status) localStorage.setItem("company_status", status);

      // --- Passenger-specific: build a safe profile object from available fields ---
      if (role === "passenger") {
        const profile = {
          name:
            data.username ||
            data.name ||
            (data.user && (data.user.username || data.user.name)) ||
            "",
          email: data.email || (data.user && data.user.email) || "",
          contact:
            data.phone_number ||
            data.contact ||
            data.phone ||
            (data.user && data.user.phone_number) ||
            "",
          cnic:
            data.cnic_or_passport ||
            data.cnic ||
            data.cnic_no ||
            (data.user && (data.user.cnic_or_passport || data.user.cnic)) ||
            "",
        };

        // Save in recommended key AND keep older key for backward compatibility.
        localStorage.setItem("passenger_data", JSON.stringify(profile));
        localStorage.setItem("passenger_profile_data", JSON.stringify(profile));
      }

      // Modal callback
      if (onSuccessfulLogin) onSuccessfulLogin();

      // Redirect logic (preserve intended booking redirect)
      if (transport) {
        // If a transport object was passed (card booking), go to book-seat and mark fromCard
        navigate("/book-seat", { state: { transport, fromCard: true } });
        return;
      }

      if (location.state?.vehicleDetails) {
        const vehicle = location.state.vehicleDetails;
        navigate(`/book-vehical/${vehicle.id}`, { state: { vehicleDetails: vehicle, fromCard: true } });
        return;
      }

      // Role-based navigation (unchanged behaviour)
      if (role === "passenger") {
        navigate("/PassengerDashboard");
      } else if (role === "company") {
        if (status === "approved") {
          navigate("/CompanyDashboard");
        } else {
          navigate("/CompanyProfileForm");
        }
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("❌ Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  // Styling
  const containerClasses = isModal
    ? "p-2"
    : "min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4";

  const cardClasses = isModal
    ? "w-full"
    : "bg-white p-8 w-full max-w-md shadow-2xl rounded-3xl border-t-8 border-indigo-500 relative";

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        {!isModal && (
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <X size={22} />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-indigo-500 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-3 shadow-xl">
            <LogIn size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isModal ? "Welcome Back!":"Login to Book Tickets"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue your journey.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <User
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400"
            />
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 mt-6 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl transition-all disabled:opacity-60"
          >
            {loading ? "Logging In..." : <>Login <ArrowRight size={18} /></>}
          </button>
        </form>

        {/* Register */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/Registration" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Register Now
          </a>
        </div>
        <div className="mt-4 text-center">
          <a
            href="/forgot-password"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Forgot your password? Click hear
          </a>
        </div>
      </div>
    </div>
  );
}
