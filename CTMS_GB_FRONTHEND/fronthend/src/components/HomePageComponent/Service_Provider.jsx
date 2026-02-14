// src/components/CompanyRegistrationSection.jsx
import React from 'react';
import img5 from '../../Home/GB_picture/bus.jpeg';
export default function CompanyRegistrationSection() {
    return (
        <section className="bg-gray-200 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                <div className="flex flex-col lg:flex-row bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-8 lg:p-10 lg:w-1/2 flex flex-col justify-center min-h-[280px] lg:min-h-0">
                        
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5">
                            Register Your Company
                        </h2>
                        
                        <p className="text-base text-gray-600 mb-5">
                            Offer seat-based services or full-vehicle rentals across GB. Grow revenue with streamlined tools, analytics, and booking notifications.
                        </p>
                        
                        <ul className="list-disc space-y-2 text-gray-700 ml-5 mb-6">
                            <li className="font-medium">Post availability up to 10 days</li>
                            <li className="font-medium">Manage vehicles and drivers</li>
                            <li className="font-medium">Track bookings and revenue</li>
                        </ul>
                        
                        <a 
                            href="/CompanyRegistration" 
                            className="w-48 text-center py-3 px-6 rounded-lg text-white font-semibold shadow-lg transition duration-300 ease-in-out"
                            style={{ 
                                backgroundColor: '#8b5cf6',
                            }}
                        >
                            Register now
                        </a>
                    </div>
                    <div className="lg:w-1/2 flex items-center justify-center p-4 bg-gray-900">
                        
                        <img 
                            src={img5} 
                            alt="A bus or transport vehicle" 
                            className="max-w-full h-auto object-contain rounded-lg shadow-xl lg:max-w-[85%]"
                        />
                        
                    </div>
                    
                </div>
            </div>
        </section>
    );
}
