"use client";
import { useState } from "react";
import VehicleSearch from "../components/CustomerPortal/VehicleSearch";
import BookingForm from "../components/CustomerPortal/BookingForm";
import BookingHistory from "../components/CustomerPortal/BookingHistory";
import TransactionHistory from "../components/Payment/TransactionHistory";

const VehicleBookingSection = () => {
  const [activeTab, setActiveTab] = useState("search");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowBookingForm(true);
  };

  const handleBookingComplete = (bookingData) => {
    console.log("Booking completed:", bookingData);
    setShowBookingForm(false);
    setSelectedVehicle(null);
    setActiveTab("bookings");
  };

  const handleBookingCancel = () => {
    setShowBookingForm(false);
    setSelectedVehicle(null);
  };

  if (showBookingForm && selectedVehicle) {
    return (
      <BookingForm
        vehicle={selectedVehicle}
        onBookingComplete={handleBookingComplete}
        onCancel={handleBookingCancel}
      />
    );
  }

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
      <div className="border-b flex space-x-6 pb-3 mb-4">
        {[
          { key: "search", label: "Search Vehicles", icon: "🔍" },
          { key: "bookings", label: "My Bookings", icon: "📋" },
          { key: "transactions", label: "Transactions", icon: "💳" },
          { key: "profile", label: "Profile", icon: "👤" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium ${
              activeTab === tab.key
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "search" && (
        <VehicleSearch onVehicleSelect={handleVehicleSelect} />
      )}
      {activeTab === "bookings" && <BookingHistory />}
      {activeTab === "transactions" && <TransactionHistory />}
      {activeTab === "profile" && (
        <div className="text-gray-600 text-center py-6">
          <h2 className="text-xl font-bold mb-2">Profile Settings</h2>
          <p>Profile management coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default VehicleBookingSection;
