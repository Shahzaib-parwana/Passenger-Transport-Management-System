import { useState } from "react";
import VehicleSearch from "./VehicleSearch"; 
import { Search, Car, ArrowLeft, X } from "lucide-react"; 

const CustomerDashboard = () => {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showBookingForm, setShowBookingForm] = useState(false);

    // --- Handlers ---
    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowBookingForm(true);
    };

    const handleBookingComplete = (bookingData) => {
        console.log("Booking completed:", bookingData);
        setShowBookingForm(false);
        setSelectedVehicle(null);
    };

    const handleBookingCancel = () => {
        setShowBookingForm(false);
        setSelectedVehicle(null);
    };

    if (showBookingForm && selectedVehicle) {
        return (
            // Fixed position for the overlay
            <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center p-2 sm:p-4">
                {/* Modal Container: Adjusted max-width and height */}
                <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[98vh] sm:max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-95 sm:scale-100">
                    
                    {/* Close Button: Always on top */}
                    <button 
                        onClick={handleBookingCancel}
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 z-10 transition shadow-lg"
                        title="Close Booking Form"
                    >
                        <X size={20} />
                    </button>
                    
                    {/* Content Area: Responsive padding */}
                    <div className="p-4 sm:p-6 md:p-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-indigo-600 mb-4 sm:mb-6 border-b pb-2 sm:pb-3">
                            Complete Vehicle Hire Booking
                        </h2>
                        <BookingForm 
                            vehicle={selectedVehicle} 
                            onBookingComplete={handleBookingComplete} 
                            onCancel={handleBookingCancel} 
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* 2. Content Area (Responsive Padding) */}
            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto"> 
                    <VehicleSearch onVehicleSelect={handleVehicleSelect} />
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;