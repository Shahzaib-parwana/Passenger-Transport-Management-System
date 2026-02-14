// components/Payment/ManualPaymentPage.jsx
import React, { useState } from "react";
import { X, Upload, CheckCircle, Banknote, ShieldCheck } from "lucide-react";

export default function ManualPaymentModal({ onClose, paymentData, onSuccess }) {
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);

  // --- Handlers (Logic Unchanged) ---

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScreenshot(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result); // preview ke liye
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!screenshot) {
      alert("Please upload screenshot!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result; // data:image/jpeg;base64,...
      onSuccess(base64String); // Yeh base64 string parent ko jaayegi → summary mein dikhegi
      onClose();
    };
    reader.readAsDataURL(screenshot);
  };

  // Helper component for account display
  const AccountCard = ({ icon: Icon, title, name, number, details, bgColor, borderColor }) => (
    <div className={`p-5 ${bgColor} border-l-4 ${borderColor} rounded-xl shadow-md transition duration-300 hover:shadow-lg`}>
      <div className="flex items-center mb-2">
        <Icon className={`w-6 h-6 mr-3 ${borderColor.replace('border-', 'text-')}`} />
        <h4 className="text-xl font-semibold text-gray-800">{title}</h4>
      </div>
      <div className="space-y-1 text-base text-gray-700">
        <p><strong>Account Name:</strong> <span className="font-medium">{name}</span></p>
        <p><strong>Account Number:</strong> <span className="font-medium">{number}</span></p>
        {details && details.map((detail, index) => (
          <p key={index}><strong>{detail.label}:</strong> <span className="font-medium">{detail.value}</span></p>
        ))}
      </div>
    </div>
  );

  // --- JSX (Height Optimized UI) ---

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      {/* Outer Modal Container: Added `flex flex-col` for vertical layout */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative transform transition-all duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header Section (Fixed) */}
        <div className="p-6 md:p-10 pb-4 md:pb-6 border-b sticky top-0 bg-white z-10 rounded-t-3xl">
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 hover:text-red-600" />
          </button>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900">
            💳 Complete Manual Payment
          </h2>
          <p className="text-center text-lg text-gray-600 mt-2">
            Transfer <strong className="text-green-700"> {paymentData?.total_amount} Rs</strong> and upload proof.
          </p>
        </div>

        {/* Main Content Area (Scrollable) */}
        {/* Added `overflow-y-auto` and `p-6 md:p-10` for padding and scrolling */}
        <div className="flex-grow overflow-y-auto p-6 md:p-10 py-6"> 
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            
            {/* Left: Payment Details */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <Banknote className="w-6 h-6 mr-2 text-indigo-600" />
                1. Transfer to Account
              </h3>
              
              <div className="space-y-4">
                {/* ... Account Cards ... */}
                {paymentData.easypaisa_number && (
                  <AccountCard 
                    icon={ShieldCheck}
                    title="Easypaisa Account"
                    name={paymentData.easypaisa_name}
                    number={paymentData.easypaisa_number}
                    bgColor="bg-green-50"
                    borderColor="border-green-600"
                  />
                )}
                {paymentData.jazzcash_number && (
                  <AccountCard 
                    icon={ShieldCheck}
                    title="JazzCash Account"
                    name={paymentData.jazzcash_name}
                    number={paymentData.jazzcash_number}
                    bgColor="bg-red-50"
                    borderColor="border-red-600"
                  />
                )}
                {paymentData.bank_account_number && (
                  <AccountCard 
                    icon={ShieldCheck}
                    title={paymentData.bank_name || "Bank Account"}
                    name={paymentData.bank_account_title}
                    number={paymentData.bank_account_number}
                    details={[
                      { label: "Bank Name", value: paymentData.bank_name },
                      paymentData.bank_iban && { label: "IBAN", value: paymentData.bank_iban }
                    ].filter(Boolean)}
                    bgColor="bg-blue-50"
                    borderColor="border-blue-600"
                  />
                )}
              </div>
              {(!paymentData.easypaisa_number && !paymentData.jazzcash_number && !paymentData.bank_account_number) && (
                  <p className="text-orange-500 font-medium p-4 bg-orange-100 rounded-lg">
                      No payment accounts are currently available. Please contact support.
                  </p>
              )}
            </div>

            {/* Right: Upload Screenshot */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-purple-600" />
                2. Upload Payment Proof
              </h3>

              {/* File Upload Area */}
              <label className="block cursor-pointer">
                <div className="border-4 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50 hover:border-indigo-500 transition-all duration-300 shadow-inner">
                  <Upload className="w-16 h-16 mx-auto text-indigo-400" />
                  <p className="mt-4 text-xl font-medium text-gray-700">Click to upload screenshot</p>
                  <p className="text-sm text-gray-500 mt-1">Accepted formats: JPG, PNG (Max 5MB)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
              </label>

              {/* Preview Area */}
              {preview && (
                <div className="mt-4 p-4 border rounded-xl bg-white shadow-lg">
                  <p className="text-lg font-bold text-gray-800 flex items-center mb-3">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Proof Preview
                  </p>
                  <img 
                    src={preview} 
                    alt="Payment proof screenshot" 
                    className="w-full max-h-80 object-contain rounded-xl border border-gray-200" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer Section (Fixed) */}
        <div className="p-6 md:p-10 pt-4 md:pt-6 border-t sticky bottom-0 bg-white z-10 rounded-b-3xl">
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!screenshot}
            className={`w-full font-bold text-xl py-4 rounded-xl shadow-2xl transition duration-300 ease-in-out transform hover:scale-[1.01] ${
              screenshot
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
          >
            {screenshot ? "✅ Submit Payment Proof" : "Please Upload Screenshot to Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}