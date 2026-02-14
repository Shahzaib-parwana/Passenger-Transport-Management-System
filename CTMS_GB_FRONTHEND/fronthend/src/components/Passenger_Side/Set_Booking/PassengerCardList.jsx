import React, { useState } from "react";
import PassengerCard from "./PassengerCard"; // Assuming this component is styled nicely

export default function PassengerCardList({
  setStep,
  selectedService,
  transports,
  setSelectedTransport,
}) {
  const [search, setSearch] = useState("");

  // ✅ Filter transports based on search (Logic remains the same)
  const filteredTransports = transports.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.company_name?.toLowerCase().includes(q) ||
      t.vehicle_type_snapshot?.toLowerCase().includes(q) ||
      t.route_from?.toLowerCase().includes(q) ||
      t.route_to?.toLowerCase().includes(q) ||
      t.arrival_date?.toLowerCase().includes(q) ||
      t.arrival_time?.toLowerCase().includes(q)
    );
  });

  return (
    // Main container: Light gray background for a clean look, with padding
    <div className="relative p-4 md:p-8 bg-gray-50 min-h-screen">
      
      {/* Back Button: Fixed position, primary blue color, subtle shadow */}
      <button
        onClick={() => setStep("services")}
        className="absolute top-4 left-4 flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-blue-700 transition duration-200 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back</span>
      </button>

      {/* Header: Centered, bold text, elevated appearance */}
      <div className="bg-white p-4 rounded-xl shadow-md max-w-4xl mx-auto mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 text-center">
          Available {selectedService} Services
        </h2>
      </div>

      {/* ✅ Search Bar: Centered, wider, clearer focus state */}
      <div className="flex justify-center mb-8 max-w-4xl mx-auto">
        <div className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, route, type, date, or time..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150 text-gray-700"
          />
          {/* Search Icon */}
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* List of Transports */}
      <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto">
        {filteredTransports.length > 0 ? (
          filteredTransports.map((t, idx) => (
            <div className="w-full" key={idx}>
                <PassengerCard
                  transport={t}
                  onSelect={(transport) => {
                    setSelectedTransport(transport); // ✅ save selected transport
                    setStep("seatSelection"); // ✅ jump to seatSelection step
                  }}
                  // You might want to pass some styling props to PassengerCard here if needed
                />
            </div>
          ))
        ) : (
          // No Results Message: More prominent and friendly
          <div className="text-center p-10 bg-white rounded-xl shadow-lg border border-gray-100 mt-10 w-full max-w-md">
            <p className="text-xl font-semibold text-red-500 mb-2">
              No Results Found 😔
            </p>
            <p className="text-gray-500">
              There are no **{selectedService}** services matching your search: **"{search}"**.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}