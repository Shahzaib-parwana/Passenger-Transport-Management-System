// src/pages/ResetPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import apiPublic from "../../../../api/axiosConfig";
import { Lock, Check, ArrowLeft, X, Loader2, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { email, userId, resetToken } = location.state || {};

  // Password validation rules
  const passwordRules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allRulesPassed = Object.values(passwordRules).every(Boolean);

  const validatePassword = () => {
    if (!allRulesPassed) {
      return "Password must meet all requirements";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!userId || !resetToken) {
      setError("Invalid reset session. Please start over.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await apiPublic.post("/auth/reset-password/", {
        user_id: userId,
        reset_token: resetToken,
        new_password: password,
      });

      setSuccess(true);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Password reset successful! Please login with your new password." 
          } 
        });
      }, 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.error || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !userId || !resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
        <div className="bg-white p-8 w-full max-w-md shadow-2xl rounded-3xl border-t-8 border-red-500 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Invalid Reset Session</h2>
          <p className="text-gray-600 mb-6">Your password reset session has expired or is invalid.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      <div className="bg-white p-8 w-full max-w-md shadow-2xl rounded-3xl border-t-8 border-green-500 relative">
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
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 shadow-xl">
            <Lock size={34} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-sm text-gray-600 mt-2">
            Create a new password for{" "}
            <span className="font-semibold text-indigo-600">{email}</span>
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Check className="text-green-500" size={20} />
              <div>
                <p className="text-green-700 font-semibold">Password Reset Successful!</p>
                <p className="text-green-600 text-sm mt-1">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Password must contain:
              </p>
              <ul className="space-y-1 text-sm">
                <li className={`flex items-center gap-2 ${passwordRules.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordRules.minLength ? 'bg-green-500' : 'bg-gray-300'}`} />
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${passwordRules.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordRules.hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`} />
                  One uppercase letter
                </li>
                <li className={`flex items-center gap-2 ${passwordRules.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordRules.hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`} />
                  One lowercase letter
                </li>
                <li className={`flex items-center gap-2 ${passwordRules.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordRules.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} />
                  One number
                </li>
                <li className={`flex items-center gap-2 ${passwordRules.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordRules.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`} />
                  One special character
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !allRulesPassed || password !== confirmPassword}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}