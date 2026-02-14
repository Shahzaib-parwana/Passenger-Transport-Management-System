import { useState } from "react";
import api from "../api/axiosConfig";
import apiPublic from "../api/axiosConfig";
import LoginPage from "../components/Global_Component/login/LoginPage";

export default function PassengerRegistration() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    cnic_or_passport: "",
    address: "",
    password: "",
    password_confirmation: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await apiPublic.post("/auth/register/passenger/", formData);
      setMessage("✅ Registration successful!");
      console.log("Response:", res.data);
      // clear fields
      setFormData({
        username: "",
        email: "",
        phone_number: "",
        cnic_or_passport: "",
        address: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      // show backend message if available
      const backendMsg =
        err.response?.data ||
        (err.response?.data && JSON.stringify(err.response.data)) ||
        err.message;
      setMessage("❌ Registration failed! " + (backendMsg || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 md:p-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-indigo-600">Create Passenger Account</h1>
          <p className="text-sm text-gray-500">Secure & quick — PTMS_GB</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              message.startsWith("✅")
                ? "bg-green-50 text-green-800 border border-green-100"
                : "bg-red-50 text-red-800 border border-red-100"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="e.g. aziz123"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="you@example.com"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="+92 3xx xxxxxxx"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">CNIC / Passport</label>
            <input
              name="cnic_or_passport"
              value={formData.cnic_or_passport}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="XXXXX-XXXXXXX-X or Passport #"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Your full address (optional)"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Choose a strong password"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              name="password_confirmation"
              type="password"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Repeat your password"
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex items-center justify-between mt-2">
            <small className="text-xs text-gray-500">
              By creating an account you agree to our <span className="text-indigo-600">terms</span>.
            </small>

            <button
              type="submit"
              disabled={loading}
              className="ml-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-lg shadow-sm transition"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 font-medium hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
