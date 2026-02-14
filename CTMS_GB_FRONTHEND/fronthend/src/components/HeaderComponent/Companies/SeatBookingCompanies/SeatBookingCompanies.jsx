import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, Phone, MapPin } from "lucide-react"; 
import apiPublic from "../../../../api/axiosConfig"; 
import Banner from "../icons/Banner_1.PNG"

// --- Constants ---
const HEADER_TEXTS = [
  "اپنی سیٹ ابھی بُک کریں اور سفر کا آغاز کریں!", // Book your seat now and start your journey!
  "Travel with Pakistan’s trusted travel partners.",
  "آرام دہ اور سستی سیٹ بُکنگ صرف ایک کلک کی دوری پر", // Comfortable and affordable seat booking is just a click away
];

/**
 * @typedef {object} Company
 * @property {number} id
 * @property {string} company_name
 * @property {string} company_banner_url
 * @property {string} company_logo_url
 * @property {string} services_offered
 * @property {string} main_office_city
 * @property {string} passenger_instruction
 * @property {string} company_email
 * @property {string} contact_number_1
 * @property {string} contact_number_2
 */

/**
 * @returns {JSX.Element}
 */
const SeatBookingCompanies = () => {
  /** @type {[Company[], React.Dispatch<React.SetStateAction<Company[]>>]} */
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const navigate = useNavigate();

  // --- Effect to Fetch Companies ---
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiPublic.get("/companies/seat-booking/");
        
        // Shuffle the companies list randomly for varied display
        const shuffledCompanies = response.data
          .map((company) => ({ company, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ company }) => company);

        setCompanies(shuffledCompanies);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching seat booking companies:", err);
        setError("Failed to load companies. Please try again.");
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []); // Empty dependency array means this runs once on mount

  // --- Effect for Rotating Header Text ---
  useEffect(() => {
    const textInterval = setInterval(() => {
      // Cycles through the HEADER_TEXTS array every 3000ms (3 seconds)
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % HEADER_TEXTS.length);
    }, 3000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(textInterval);
  }, []);

  // --- Render based on State ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-medium text-indigo-600">
        Loading amazing travel partners...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-medium text-red-600">
        ⚠️ {error}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-medium text-gray-500">
        😔 No companies currently offering seat booking services.
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 min-h-screen">
      
      {/* Banner Section */}
<div 
  className="relative min-h-[50vh] flex items-center justify-center overflow-hidden transition-all duration-500"
>
  {/* Background Image */}
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat object-cover  "
    style={{ 
      backgroundImage: `url(${Banner})`,
      backgroundPosition: 'center',
    

    }}
  >
    {/* Overlay for better text readability */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/60"></div>
  </div>
  
  {/* Text Content */}
  <div className="relative z-10 text-white text-center px-4 max-w-4xl mx-auto">
    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
      {HEADER_TEXTS[currentTextIndex]}
    </h1>
    <p className="text-lg md:text-xl text-blue-100/90 drop-shadow-md">
      Your additional text here (optional)
    </p>
  </div>
</div>

      {/* Companies Grid */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company) => {
              // console.log("Company Data:", company); // Kept the original console log for full payload

              return (
                <div
                  key={company.id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden transform transition duration-500 hover:shadow-2xl hover:scale-[1.03] cursor-pointer"
                  onClick={() =>
                    // Navigate to a specific company's transports page, passing company data
                    navigate(`/company/${company.id}/transports`, { state: { company } })
                  }
                >
                  
                  {/* Logo (Now placed at the top instead of a banner) */}
                  <div className="w-full bg-indigo-50 p-6 flex justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg">
                      <img
                        src={company.company_logo_url || "https://via.placeholder.com/200?text=No+Logo"}
                        alt={company.company_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex flex-col justify-between h-auto">
                    <h3
                      className="text-2xl font-bold text-indigo-700 mb-3 text-center truncate"
                      title={company.company_name}
                    >
                      {company.company_name}
                    </h3>

                    {/* Service and Location Details with Icons */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 flex items-center">
                        <strong>Services:</strong> 
                        <span className="ml-2 truncate">{company.services_offered}</span>
                      </p>
                      
                      <p className="text-sm text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                        <strong>City:</strong> 
                        <span className="ml-2">{company.main_office_city}</span>
                      </p>

                      {/* Clickable Contact Number */}
                      <p className="text-sm text-gray-700 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                        <strong>Call Service:</strong> 
                        {company.contact_number_1 ? (
                            <a 
                                href={`tel:${company.contact_number_1}`} 
                                className="ml-2 font-semibold text-green-600 hover:text-green-700"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card navigation when clicking call link
                                    console.log(`Calling ${company.contact_number_1}`);
                                }}
                            >
                                {company.contact_number_1}
                            </a>
                        ) : (
                            <span className="ml-2 text-gray-500">N/A</span>
                        )}
                      </p>
                    </div>

                    <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition duration-300 shadow-md">
                      View Options
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBookingCompanies;