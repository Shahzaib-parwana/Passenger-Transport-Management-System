import React, { useState, useEffect } from "react";
import apiPublic from "../../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";

import VehicleCard from "./Card/card_for_companies_vehical";
import CompanyCard from "./Card/card_of_vehical_companies";
import Banner from "../icons/Banner_1.PNG"

const VehicleBookingCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [companyVehicles, setCompanyVehicles] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const response = await apiPublic.get("/companies/vehicle-booking/");
        const companiesList = response.data || [];

        // 🔥 Random Shuffle
        const shuffledCompanies = companiesList
          .map((company) => ({ company, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ company }) => company);

        setCompanies(shuffledCompanies);

        const vehiclesMap = {};

        for (const company of shuffledCompanies) {
          try {
            const res = await apiPublic.get(`/company/${company.id}/vehicles/`);
            const wholeHireOnly = (res.data || []).filter(
              (v) => v.offer_type === "whole_hire"
            );
            vehiclesMap[company.id] = wholeHireOnly;
          } catch (err) {
            vehiclesMap[company.id] = [];
          }
        }

        setCompanyVehicles(vehiclesMap);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const handleBookNow = (vehicle) => {
    navigate(`/book-vehicle/${vehicle.id}`, {
      state: { vehicle },
    });
  };

  const handleViewDetails = (vehicle) => {
    navigate(`/book-vehicle-details/${vehicle.id}`, {
      state: { vehicleDetails: vehicle },
    });
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-green-600 font-bold">
        Loading vehicle partners...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 pb-20">

      {/* 🔥 Dynamic Top Banner */}
      <div className="relative w-full h-64 overflow-hidden shadow-lg">
        <img
        style={
          {
                  backgroundImage: `url(${Banner})`,
                  backgroundPosition: 'center',
          }
        }
          src={
            selectedCompany
              ? selectedCompany.company_banner_url ||
                selectedCompany.company_logo_url
              : Banner
          }
          alt=" khan"
          className="w-full h-full object-cover bg-contain "
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">

          {/* Circular Logo when company is selected */}
          {selectedCompany && (
            <img
              src={selectedCompany.company_logo_url}
              alt="Logo"
              className="w-28 h-28 rounded-full border-4 border-white shadow-lg mb-3 object-cover"
            />
          )}

          <h1 className="text-3xl md:text-5xl text-white font-extrabold text-center">
            {selectedCompany
              ? selectedCompany.company_name
              : "Vehicle Rental Partners"}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        {/* 🔥 Company Cards */}
        {!selectedCompany ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onSelect={setSelectedCompany}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={() => setSelectedCompany(null)}
              className="mb-6 px-5 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
            >
              ← Back to Companies
            </button>

            {/* Company Name */}
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {selectedCompany.company_name}
            </h2>

            {/* Vehicles */}
            {companyVehicles[selectedCompany.id]?.length === 0 ? (
              <p className="text-gray-500">No vehicles available.</p>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {companyVehicles[selectedCompany.id].map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onBook={handleBookNow}
                    onDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleBookingCompanies;
