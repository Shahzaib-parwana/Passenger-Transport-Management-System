// components/Shared/CompanyCard.jsx
import React from "react";

const CompanyCard = ({ company, onSelect }) => {
  const logo =
    company.company_logo_url ||
    "https://via.placeholder.com/400x192?text=Company+Logo";

  return (
    <div
      className="
        bg-white rounded-3xl shadow-xl overflow-hidden
        transform transition duration-500 hover:shadow-2xl 
        hover:scale-[1.03] cursor-pointer
      "
      onClick={() => onSelect(company)}
    >
      {/* Top Logo Image (fully wide, same as main card) */}
      <div className="w-full h-48 bg-gray-200 border-b-2 border-indigo-100">
        <img
          src={logo}
          alt={company.company_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/400x192/6366f1/ffffff?text=LOGO";
          }}
        />
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col justify-between h-auto">
        <h3
          className="text-2xl font-bold text-indigo-700 mb-2 truncate"
          title={company.company_name}
        >
          {company.company_name}
        </h3>

        <div className="space-y-2 text-sm">
          {/* Services */}
          <div className="flex items-center text-gray-700">
            <span className="text-green-500 text-lg mr-2">🚐</span>
            <span className="font-semibold">Services:</span>{" "}
            <span className="ml-1">
              {company.offer_type || "Vehicle Rental"}
            </span>
          </div>

          {/* Main Office City */}
          <div className="flex items-center text-gray-500">
            <span className="text-gray-400 text-lg mr-2">🏘️</span>
            City: <strong className="ml-1">{company.main_office_city || "Unknown"}</strong>
          </div>
        </div>

        {/* Button */}
        <button
          className="
            mt-4 w-full bg-indigo-600 text-white py-2 
            rounded-xl font-semibold hover:bg-indigo-700 
            transition duration-300
          "
        >
          View Options
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
