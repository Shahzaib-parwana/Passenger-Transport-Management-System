// src/pages/VerifyOTPPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import apiPublic from "../../../../api/axiosConfig";
import { Shield, ArrowLeft, X, Loader2, Clock } from "lucide-react";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { email, userId } = location.state || {};

  useEffect(() => {
    if (!email || !userId) {
      navigate("/forgot-password");
      return;
    }

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, userId, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      
      // Focus last filled input
      const lastIndex = Math.min(5, pastedOtp.length - 1);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await apiPublic.post("/auth/verify-reset-otp/", {
        user_id: userId,
        otp: otpCode,
      });

      if (response.data.reset_token) {
        // Navigate to reset password page
        navigate("/reset-password", {
          state: {
            email,
            userId,
            resetToken: response.data.reset_token,
          },
        });
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.error || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    
    try {
      await apiPublic.post("/auth/forgot-password/", { email });
      setTimer(600);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !userId) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      <div className="bg-white p-8 w-full max-w-md shadow-2xl rounded-3xl border-t-8 border-indigo-500 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate("/forgot-password")}
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
            <Shield size={34} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Verify OTP</h1>
          <p className="text-sm text-gray-600 mt-2">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-indigo-600">{email}</span>
          </p>
        </div>

        {/* Timer */}
        <div className="mb-6 flex items-center justify-center gap-2 text-sm">
          <Clock size={16} className="text-indigo-500" />
          <span className="font-mono text-gray-700">Code expires in: {formatTime(timer)}</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* OTP Input */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              />
            ))}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || loading}
              className="w-full py-3 border-2 border-indigo-500 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {canResend ? "Resend Code" : `Resend available in ${formatTime(timer)}`}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code? Check your spam folder or{" "}
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              try another email
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}