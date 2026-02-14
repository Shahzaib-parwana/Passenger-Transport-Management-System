// src/pages/CompanyRegister.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiPublic from "../api/axiosConfig";
import LoginPage from "../components/Global_Component/login/LoginPage";

export default function CompanyRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: "",
    registration_id: "",
    contact_no: "",
    password: "",
    password_confirmation: "",
    user_email: "",
    user_username: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiPublic.post("/auth/register/company/", formData);
      setMessage("✅ Company registration successful!");
      console.log("Response:", res.data);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setMessage("❌ Company registration failed! Check console.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 border border-gray-300">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">
          Company Registration
        </h2>

        {message && (
          <p
            className={`mb-4 text-center p-2 rounded-lg text-sm ${
              message.startsWith("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Registration ID
            </label>
            <input
              type="text"
              name="registration_id"
              value={formData.registration_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter registration ID"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contact_no"
              value={formData.contact_no}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter contact number"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="user_email"
              value={formData.user_email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              name="user_username"
              value={formData.user_username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter password"
              required
            />
          </div>

          {/* Confirm password same size + centered */}
          <div className="md:col-span-2 flex flex-col items-center">
            <label className="block text-gray-700 font-medium mb-1 self-start md:self-center">
              Confirm Password
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Confirm password"
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
            >
              Register Company
            </button>
          </div>
        </form>

        {/* Login link */}
        <p className="text-center mt-4 text-sm text-gray-600">
          Already registered?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
