// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiPublic from "../../../../api/axiosConfig";
import { Mail, ArrowLeft, CheckCircle, X, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    const response = await apiPublic.post("auth/forgot-password/", { email });

    // If backend returns user_id then email exists and OTP sent
    if (response.data.user_id) {
      setUserId(response.data.user_id);
      setSuccess("Reset code has been sent to your email!");

      // Redirect to OTP page
      setTimeout(() => {
        navigate("/verify-otp", {
          state: {
            email,
            userId: response.data.user_id
          }
        });
      }, 2000);

    } else {
      // If backend returns but no user_id → email does not exist
      setError("Email not found. Please enter a registered email.");
    }

  } catch (err) {
    console.error("Forgot password error:", err);

    // If backend returns 404 → email not found
    if (err.response?.status === 404) {
      setError("Email not found. Please enter a registered email.");
    } 
    else {
      setError("Failed to send reset code. Please try again.");
    }

  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      <div className="bg-white p-8 w-full max-w-md shadow-2xl rounded-3xl border-t-8 border-indigo-500 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-gray-500 hover:text-indigo-600 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Close Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 shadow-xl">
            <Mail size={34} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
          <p className="text-sm text-gray-600 mt-2">
            Enter your email address and we'll send you a code to reset your password.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={20} />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
            {userId && (
              <div className="mt-3 flex items-center gap-2">
                <Loader2 className="animate-spin text-indigo-500" size={16} />
                <p className="text-xs text-indigo-600">Redirecting to verification...</p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400"
            />
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Sending Code...
              </>
            ) : (
              "Send Reset Code"
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Back to Login
            </Link>
          </p>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> The reset code will expire in 10 minutes. 
            Check your spam folder if you don't see the email.
          </p>
        </div>
      </div>
    </div>
  );
}