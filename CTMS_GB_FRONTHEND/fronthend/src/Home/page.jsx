// src/pages/HomePage.js

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ExplorationSection from "./ExplorationSection";
import { 
  BusFront, Users, Building, Route, Car, UserPlus, 
  LogOut, User, Shield, Clock, MapPin, CreditCard,
  Cloud, CheckCircle, Star, ArrowRight, Phone, Mail, Map
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import CompanyRegistrationSection from "../components/HomePageComponent/Service_Provider";
import SeatBookingOffers from "../components/HomePageComponent/SeatBookingOffers";
import VehicleBookingOffers from "../components/HomePageComponent/VehicleBookingOffer";
import LoginModal from "../components/Global_Component/login/LoginModal";
import LoginPage from "../components/Global_Component/login/LoginPage";

// Images
import img1 from "./GB_picture/gb1.jpg";
import img2 from "./GB_picture/gb2.jpeg";
import img3 from "./GB_picture/gb3.jpeg";
import img4 from "./GB_picture/gb4.jpeg";
import img5 from "./GB_picture/bus.jpeg";

export default function HomePage() {
  const images = [img1, img2, img3, img4, img5];
  const [index, setIndex] = useState(0);
  const [showJoinOptions, setShowJoinOptions] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Stats data
  const stats = [
    { value: "10,000+", label: "Happy Passengers", icon: Users, color: "from-blue-500 to-cyan-400" },
    { value: "500+", label: "Verified Companies", icon: Shield, color: "from-emerald-500 to-teal-400" },
    { value: "50+", label: "Destinations", icon: MapPin, color: "from-purple-500 to-pink-400" },
    { value: "99.8%", label: "Safety Record", icon: CheckCircle, color: "from-amber-500 to-orange-400" },
  ];

  // Features data
  const features = [
    {
      title: "Real-Time Weather Updates",
      description: "Get live weather and road condition alerts for safe travel planning across mountainous terrains",
      icon: Cloud
    },
    {
      title: "Verified Transport Companies",
      description: "Book with confidence from our network of government-verified and trusted transport providers",
      icon: Shield
    },
    {
      title: "Secure Digital Payments",
      description: "Multiple payment options with instant confirmation and encrypted transaction security",
      icon: CreditCard
    },
    {
      title: "Live Seat Tracking",
      description: "Real-time seat availability and booking status with instant confirmation",
      icon: Clock
    },
    {
      title: "Route Optimization",
      description: "Smart route suggestions based on weather, traffic, and road conditions",
      icon: Map
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your travel queries and assistance",
      icon: Phone
    }
  ];

  // How it works steps
  const steps = [
    {
      step: "01",
      title: "Select Your Route",
      description: "Choose from hundreds of verified routes across Gilgit-Baltistan",
      icon: MapPin,
      color: "from-blue-500 to-cyan-400"
    },
    {
      step: "02",
      title: "Book & Pay Securely",
      description: "Select seats or entire vehicle and pay with multiple secure options",
      icon: CreditCard,
      color: "from-emerald-500 to-teal-400"
    },
    {
      step: "03",
      title: "Travel Confidently",
      description: "Receive instant confirmation and real-time journey updates",
      icon: CheckCircle,
      color: "from-purple-500 to-pink-400"
    }
  ];

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Auto slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Function to check if user is already logged in
const checkAuthStatus = () => {
  // Check multiple possible token storage keys for compatibility
  const token = localStorage.getItem("token") || 
                localStorage.getItem("accessToken") || 
                localStorage.getItem("access_token");
  const role = localStorage.getItem("role") || 
               localStorage.getItem("user_role");
  
  // Try multiple sources for username
  let name = "";
  
  // First try direct username storage
  name = localStorage.getItem("userName") || "";
  
  // If not found, try to extract from passenger data
  if (!name) {
    const passengerData = localStorage.getItem("passenger_data");
    const passengerProfileData = localStorage.getItem("passenger_profile_data");
    
    if (passengerData) {
      try {
        const passenger = JSON.parse(passengerData);
        name = passenger.name || passenger.username || "";
      } catch (e) {
        console.error("Error parsing passenger data:", e);
      }
    } else if (passengerProfileData) {
      try {
        const profile = JSON.parse(passengerProfileData);
        name = profile.name || profile.username || "";
      } catch (e) {
        console.error("Error parsing passenger profile data:", e);
      }
    }
  }
  
  // Finally, use role as fallback
  if (!name) {
    name = role === "passenger" ? "Passenger" : 
           role === "company" ? "Company" : 
           role === "admin" ? "Admin" : "User";
  }

  if (token && role) {
    setUserRole(role);
    setUserName(name);
    return { token, role, name };
  } else {
    setUserRole(null);
    setUserName("");
    return null;
  }
};

  // Handle Book Ticket button click
  const handleBookTicketClick = () => {
    const auth = checkAuthStatus();
    
    if (auth) {
      const role = auth.role;
      
      if (role === "passenger") {
        navigate("/PassengerDashboard");
      } else if (role === "company") {
        alert("Passenger profile is essential for booking. Please logout and login as passenger to book tickets.");
      } else if (role === "admin") {
        alert("Admin users cannot book tickets. Please login as a passenger.");
      } else {
        setShowLoginModal(true);
      }
    } else {
      setShowLoginModal(true);
    }
  };

  // Handle successful login from modal
  const handleSuccessfulLogin = (userData) => {
    setShowLoginModal(false);
    
    if (userData?.token) {
      localStorage.setItem("token", userData.token);
      localStorage.setItem("accessToken", userData.token);
    }
    
    if (userData?.role) {
      localStorage.setItem("role", userData.role);
      localStorage.setItem("user_role", userData.role);
      setUserRole(userData.role);
    }
    
    if (userData?.name) {
      localStorage.setItem("userName", userData.name);
      setUserName(userData.name);
    }
    
    const finalRole = userData?.role || localStorage.getItem("role");
    
    if (finalRole === "passenger") {
      navigate("/PassengerDashboard");
    } else if (finalRole === "company") {
      alert("Passenger profile must be essential for booking");
      navigate("/CompanyDashboard");
    } else if (finalRole === "admin") {
      alert("Admin users cannot book tickets. Please login as a passenger.");
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  // ActionButton Component
  const ActionButton = ({ href, onClick, icon: Icon, text, colorClass, sizeClass = "py-3 px-6" }) => (
    <motion.a
      href={href || "#"}
      onClick={onClick}
      className={`flex items-center justify-center gap-3 ${colorClass} text-white ${sizeClass} rounded-xl font-bold shadow-lg transition-all duration-300 group relative overflow-hidden`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
      {Icon && <Icon className="w-5 h-5 relative z-10" />} 
      <span className="relative z-10">{text}</span>
    </motion.a>
  );

  // FeatureCard Component
  const FeatureCard = ({ title, description, icon: Icon, index }) => (
    <motion.div
      className="group p-6 bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-xl text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );

  // StatCard Component
  const StatCard = ({ value, label, icon: Icon, color }) => (
    <motion.div
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      whileHover={{ scale: 1.05 }}
    >
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} w-fit mb-4 shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-extrabold text-gray-800 mb-2">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 font-sans overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 flex items-center justify-center overflow-hidden">
        {/* Image Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={index}
              src={images[index]}
              alt="Gilgit Baltistan"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 1.5 }}
            />
          </AnimatePresence>
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">#1 Transport Platform in GB</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                Passenger Transport
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300 mt-2">
                  Management System
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
                Experience seamless, safe, and reliable travel across the majestic landscapes of Gilgit-Baltistan with our trusted platform
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.button
                onClick={handleBookTicketClick}
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <BusFront className="w-6 h-6 relative z-10" />
                <span className="relative z-10">
                  {userRole ? (
                    userRole === "passenger" ? "Book Your Journey" : 
                    userRole === "company" ? "Book Ticket (Passenger Only)" : 
                    "Book Ticket"
                  ) : "Book Your Ticket Now"}
                </span>
                <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                onClick={() => setShowJoinOptions(!showJoinOptions)}
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-3 overflow-hidden hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserPlus className="w-6 h-6" />
                <span>{userRole ? "Switch Account" : "Join Our Community"}</span>
              </motion.button>
            </motion.div>

            {/* Join Options */}
            <AnimatePresence>
              {showJoinOptions && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -20 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-12"
                >
                  <ActionButton
                    href="/CompanyRegistration"
                    icon={Building}
                    text="Register as Company"
                    colorClass="bg-gradient-to-r from-emerald-500 to-teal-600"
                    sizeClass="py-3 px-6 text-sm"
                  />
                  <ActionButton
                    href="/PassengerRegistration"
                    icon={Users}
                    text="Register as Passenger"
                    colorClass="bg-gradient-to-r from-pink-500 to-rose-600"
                    sizeClass="py-3 px-6 text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Status Message */}
            {userRole && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md mx-auto"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/20">
                    <User className="w-6 h-6 text-white" />
                  </div>

                    <div>
                      <p className="text-white font-medium">
                        Welcome back, <span className="font-bold">
                          {userName || (userRole === "passenger" ? "Passenger" : 
                                        userRole === "company" ? "Company" : 
                                        userRole === "admin" ? "Admin" : "User")}
                        </span>!
                      </p>
                      <p className="text-blue-100 text-sm mt-1">
                        {userRole === "passenger" 
                          ? "Ready for your next adventure?" 
                          : "Switch to passenger account for booking."}
                      </p>
                    </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>    

      {/* Deals Sections */}
      <div className="bg-gradient-to-bbg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Exclusive Travel <span className="text-blue-600">Deals</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover amazing offers for both seat booking and full vehicle reservations
            </p>
          </motion.div>
          
          <SeatBookingOffers />
          <VehicleBookingOffers />
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-4">
                <span className="text-sm font-semibold">WHY CHOOSE PTMS GB</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Your Complete Travel <span className="text-blue-600">Solution</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the future of travel with our integrated platform designed specifically for Gilgit-Baltistan's unique needs
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} index={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Company Registration Section */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-800">
        <CompanyRegistrationSection />
      </div>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Simple <span className="text-blue-600">3-Step</span> Booking
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Book your journey in minutes with our streamlined process
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white text-2xl font-bold mb-6 shadow-lg`}>
                    {step.step}
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-10 w-fit mb-4`}>
                    <step.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
<section className="py-20 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 relative overflow-hidden">
  {/* Subtle geometric pattern */}
  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtMi4yIDAtNCAxLjgtNCA0czEuOCA0IDQgNCA0LTEuOCA0LTRzLTEuOC00LTQtNHoiIGZpbGw9IiNmMGY3ZmYiLz48L2c+PC9zdmc+')] opacity-40"></div>
  
  <div className="container mx-auto px-4 lg:px-8 relative z-10">
    <div className="max-w-4xl mx-auto text-center">
      {/* Main heading with soft colors */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold mb-6"
      >
        <span className="text-gray-800">Ready to Explore </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-500">
          Gilgit-Baltistan?
        </span>
      </motion.h2>
      
      {/* Subheading with soft gray */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
      >
        Join thousands of travelers who trust <span className="font-semibold text-blue-500">PTMS GB</span> for their safe and memorable journeys through the majestic mountains
      </motion.p>

      {/* Buttons with soft styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
      >
        <button
          onClick={handleBookTicketClick}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
        >
          {/* Button background animation */}
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <BusFront className="w-6 h-6 relative z-10" />
          <span className="relative z-10">
            {userRole ? "Continue to Dashboard" : "Start Your Journey"}
          </span>
          <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-2 transition-transform" />
        </button>
        
        <button
          onClick={() => navigate("/ContactPage")}
          className="group relative px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-3"
        >
          <span className="relative">Need Help? Contact Us</span>
          <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Features card with light styling */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm"
      >
        <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-400 to-sky-400 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">100% Secure</div>
              <div className="text-sm text-gray-600">Payments</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Instant</div>
              <div className="text-sm text-gray-600">Confirmation</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Verified</div>
              <div className="text-sm text-gray-600">Companies</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="mt-12 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-200"></div>
          <Star className="w-5 h-5 text-blue-400" />
          <div className="h-px w-12 bg-gradient-to-r from-blue-200 to-transparent"></div>
        </div>
        <p className="text-sm text-gray-500">
          Trusted by over 10,000+ travelers across Gilgit-Baltistan
        </p>
      </div>
    </div>
  </div>

  {/* Floating decorative elements - very subtle */}
  <div className="absolute top-10 left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
  <div className="absolute bottom-10 right-10 w-40 h-40 bg-sky-100 rounded-full blur-3xl opacity-30"></div>
</section>

      <ExplorationSection/>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)}>
          <LoginPage
            isModal={true}
            onSuccessfulLogin={handleSuccessfulLogin}
          />
        </LoginModal>
      )}
    </div>
  );
}