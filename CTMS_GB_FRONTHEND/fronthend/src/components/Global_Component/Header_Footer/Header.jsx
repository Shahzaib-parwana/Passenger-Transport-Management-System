"use client";
import React, { useState, useEffect, useRef } from "react";
import { Mountain, Bell, User, Menu, X, ChevronDown, ChevronUp } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "./icons/PTMS_GB_LOGO.PNG";

const getNavLinkClass = (currentPath, targetPath, baseClass) => {
    if (targetPath === "/") {
        return currentPath === "/"
            ? "text-white font-bold bg-white/20 px-4 py-2 rounded-full border-2 border-white"
            : baseClass;
    }
    if (targetPath === "/seat-booking" || targetPath === "/vehicle-booking") {
        return currentPath.startsWith(targetPath) || currentPath.includes("/company/")
            ? "text-white font-bold bg-white/20 px-4 py-2 rounded-full border-2 border-white"
            : baseClass;
    }
    
    return currentPath.startsWith(targetPath)
        ? "text-white font-bold bg-white/20 px-4 py-2 rounded-full border-2 border-white"
        : baseClass;
};

const menuVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
    exit: { x: "100%", transition: { duration: 0.2 } },
};

export default function Header({ isLoggedIn, onOpenLoginModal }) {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showCompanies, setShowCompanies] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [companyStatus, setCompanyStatus] = useState(null);

    // Refs for detecting clicks outside
    const profileMenuRef = useRef(null);
    const companiesDropdownRef = useRef(null);
    const mobileMenuRef = useRef(null); // New ref for mobile menu
    const hamburgerButtonRef = useRef(null); // New ref for hamburger button

    // Sync role and company status from localStorage
    useEffect(() => {
        const roleFromStorage = localStorage.getItem("user_role");
        const statusFromStorage = localStorage.getItem("company_status");
        setUserRole(roleFromStorage || null);
        setCompanyStatus(statusFromStorage || null);
    }, [isLoggedIn]);

    // Close mobile menu when navigating
    useEffect(() => {
        setIsMenuOpen(false);
        setShowProfileMenu(false);
        setShowCompanies(false);
    }, [location.pathname]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close profile menu if clicked outside
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            
            // Close companies dropdown if clicked outside (only for desktop)
            if (companiesDropdownRef.current && !companiesDropdownRef.current.contains(event.target)) {
                setShowCompanies(false);
            }
            
            // Close mobile menu if clicked outside (only for mobile)
            if (isMenuOpen && 
                mobileMenuRef.current && 
                !mobileMenuRef.current.contains(event.target) &&
                hamburgerButtonRef.current && 
                !hamburgerButtonRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        // Add event listener
        document.addEventListener("mousedown", handleClickOutside);
        
        // Cleanup
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]); // Added isMenuOpen dependency

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_id");
        localStorage.removeItem("company_status");
        navigate("/login");
        window.location.reload();
    };

    const handleDashboardNavigation = () => {
        setShowProfileMenu(false);
        switch (userRole) {
            case "company":
                if (companyStatus === "approved") {
                    navigate("/CompanyDashboard");
                } else {
                    navigate("/CompanyProfileForm");
                }
                break;
            case "passenger":
                navigate("/PassengerDashboard");
                break;
            case "admin":
                navigate("/admin/dashboard");
                break;
            default:
                navigate("/");
        }
    };

    // Base class for desktop navigation links
    const baseClass =
        "text-white font-semibold hover:text-white hover:bg-white/10 px-4 py-2 rounded-full transition duration-300";

    // Base class for mobile navigation links
    const mobileLinkClass = "block w-full text-left px-6 py-3 text-lg font-semibold text-white hover:bg-white/20 transition";
    const activeMobileLinkClass = "block w-full text-left px-6 py-3 text-lg font-bold text-white bg-white/30 border-l-4 border-white transition";

    // Function to render profile menu based on user role and status
    const renderProfileMenu = () => {
        if (userRole === "company" && companyStatus !== "approved") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 bg-white border shadow-xl rounded-lg w-48 z-50 overflow-hidden"
                >
                    <div className="px-4 py-3 border-b bg-yellow-50">
                        <p className="text-sm text-yellow-700 font-medium">
                            <span className="font-bold">Status:</span> {companyStatus || "pending"}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                            Your application is under review
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setShowProfileMenu(false);
                            navigate("/CompanyProfileForm");
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 border-b"
                    >
                        Update Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-500"
                    >
                        Logout
                    </button>
                </motion.div>
            );
        }

        // For approved company, passenger, admin, or other roles
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 bg-white border shadow-xl rounded-lg w-40 z-50 overflow-hidden"
            >
                {userRole === "company" && companyStatus === "approved" && (
                    <button
                        onClick={handleDashboardNavigation}
                        className="block w-full text-left px-4 py-2 font-bold hover:bg-indigo-50 text-indigo-600 border-b"
                    >
                        Dashboard
                    </button>
                )}
                {userRole === "passenger" && (
                    <button
                        onClick={handleDashboardNavigation}
                        className="block w-full text-left px-4 py-2 font-bold hover:bg-indigo-50 text-indigo-600 border-b"
                    >
                        Dashboard
                    </button>
                )}
                {userRole === "admin" && (
                    <button
                        onClick={handleDashboardNavigation}
                        className="block w-full text-left px-4 py-2 font-bold hover:bg-indigo-50 text-indigo-600 border-b"
                    >
                        Admin Dashboard
                    </button>
                )}
                
                <button
                    onClick={() => {
                        setShowProfileMenu(false);
                        if (userRole === "company") {
                            navigate("/Company_profile");
                        } else {
                            navigate("/Passenger_profile");
                        }
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 border-b"
                >
                    My Profile
                </button>

                <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-500"
                >
                    Logout
                </button>
            </motion.div>
        );
    };

    return (
        <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 backdrop-blur-sm shadow-2xl border-b border-white/20">
            <div className="py-3 px-4 sm:px-6 flex justify-between items-center max-w-7xl mx-auto">
                {/* Logo - Updated with round image */}
                <div
                    onClick={() => navigate("/")}
                    className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
                >
                    {/* Logo image in round shape */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white">
                        <img 
                            src={logo} 
                            alt="PTMS_GB Logo" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    PTMS_GB
                </div>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex flex-wrap justify-center gap-4 relative">
                    <button
                        onClick={() => navigate("/")}
                        className={getNavLinkClass(currentPath, "/", baseClass)}
                    >
                        Home
                    </button>

                    <div
                        className="relative"
                        ref={companiesDropdownRef}
                        onMouseEnter={() => setShowCompanies(true)}
                        onMouseLeave={() => setShowCompanies(false)}
                    >
                        <button
                            className={`${baseClass} ${currentPath.startsWith("/seat-booking") ||
                                currentPath.startsWith("/vehicle-booking") ||
                                currentPath.includes("/company/")
                                    ? "bg-white/20 border-2 border-white" : ""}`}
                        >
                            Companies
                        </button>

                        <AnimatePresence>
                            {showCompanies && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-12 left-0 bg-white shadow-xl rounded-lg border w-48 overflow-hidden z-50"
                                >
                                    <button
                                        onClick={() => {
                                            navigate("/seat-booking");
                                            setShowCompanies(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 hover:bg-indigo-50 ${
                                            currentPath.startsWith("/seat-booking")
                                                ? "text-indigo-600 font-semibold bg-indigo-50"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        Seat Booking
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate("/vehicle-booking");
                                            setShowCompanies(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 hover:bg-indigo-50 ${
                                            currentPath.startsWith("/vehicle-booking")
                                                ? "text-indigo-600 font-semibold bg-indigo-50"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        Vehicle Booking
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => navigate("/AllVehiclesPage")}
                        className={getNavLinkClass(currentPath, "/AllVehiclesPage", baseClass)}
                    >
                        Vehicles
                    </button>

                    <button
                        onClick={() => navigate("/CompanyRegistrationSection")}
                        className={getNavLinkClass(currentPath, "/CompanyRegistrationSection", baseClass)}
                    >
                        Add Service
                    </button>

                    <button
                        onClick={() => navigate("/weather")}
                        className={getNavLinkClass(currentPath, "/weather", baseClass)}
                    >
                        Weather
                    </button>

                    <button
                        onClick={() => navigate("/AboutUs")}
                        className={getNavLinkClass(currentPath, "/AboutUs", baseClass)}
                    >
                        About Us
                    </button>

                    <button
                        onClick={() => navigate("/ContactPage")}
                        className={getNavLinkClass(currentPath, "ContactPage", baseClass)}
                    >
                        Contact Us
                    </button>
                </nav>

                {/* Auth & Mobile Button Icons */}
                <div className="flex items-center gap-3 sm:gap-4 relative">
                    {isLoggedIn ? (
                        <>
                            {/* Show status indicator for pending companies */}
                            {userRole === "company" && companyStatus !== "approved" && (
                                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded-full">
                                    <span className="text-xs font-semibold text-yellow-200">
                                        Status: {companyStatus || "pending"}
                                    </span>
                                </div>
                            )}

                            {/* Profile Menu Icon */}
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setShowProfileMenu((prev) => !prev)}
                                    className="p-1 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 relative"
                                >
                                    <User className="w-5 h-5 text-white" />
                                    {userRole === "company" && companyStatus !== "approved" && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-purple-700"></span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showProfileMenu && renderProfileMenu()}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <div className="hidden md:flex gap-3">
                            <button
                                onClick={onOpenLoginModal}
                                className="bg-white text-indigo-700 px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-gray-100 hover:text-indigo-800 transition"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate("/PassengerRegistration")}
                                className="border-2 border-white text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-indigo-700 transition"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                    
                    {/* Hamburger Button (Mobile Only) */}
                    <button
                        ref={hamburgerButtonRef}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1 sm:p-2 md:hidden rounded-full bg-white/20 hover:bg-white/30"
                    >
                        {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        ref={mobileMenuRef}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={menuVariants}
                        className="fixed top-16 right-0 w-64 bg-gradient-to-b from-blue-800 to-purple-800 shadow-2xl border-l border-white/20 md:hidden z-50 overflow-y-auto h-auto max-h-[calc(100vh-64px)]" 
                    >
                        <nav className="flex flex-col p-4 space-y-1">
                            {/* Home */}
                            <button
                                onClick={() => navigate("/")}
                                className={currentPath === "/" ? activeMobileLinkClass : mobileLinkClass}
                            >
                                Home
                            </button>

                            {/* Companies Dropdown for Mobile */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowCompanies(!showCompanies)}
                                    className={`w-full text-left px-6 py-3 text-lg font-semibold text-white hover:bg-white/20 transition flex justify-between items-center ${
                                        currentPath.startsWith("/seat-booking") ||
                                        currentPath.startsWith("/vehicle-booking") ||
                                        currentPath.includes("/company/")
                                            ? "font-bold text-white bg-white/30" : ""
                                    }`}
                                >
                                    Companies {showCompanies ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                                </button>
                                <AnimatePresence>
                                    {showCompanies && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden bg-white/10 border-l-4 border-white/30"
                                        >
                                            <button
                                                onClick={() => {
                                                    navigate("/seat-booking");
                                                    setShowCompanies(false);
                                                }}
                                                className={`block w-full text-left pl-10 py-2 text-base ${
                                                    currentPath.startsWith("/seat-booking") ? "text-white font-semibold bg-white/20" : "text-white/90 hover:text-white hover:bg-white/10"
                                                }`}
                                            >
                                                - Seat Booking
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate("/vehicle-booking");
                                                    setShowCompanies(false);
                                                }}
                                                className={`block w-full text-left pl-10 py-2 text-base ${
                                                    currentPath.startsWith("/vehicle-booking") ? "text-white font-semibold bg-white/20" : "text-white/90 hover:text-white hover:bg-white/10"
                                                }`}
                                            >
                                                - Vehicle Booking
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            {/* Other Links */}
                            <button
                                onClick={() => navigate("/AllVehiclesPage")}
                                className={currentPath.startsWith("/AllVehiclesPage") ? activeMobileLinkClass : mobileLinkClass}
                            >
                                Vehicles
                            </button>

                            <button
                                onClick={() => navigate("/CompanyRegistrationSection")}
                                className={currentPath.startsWith("/CompanyRegistrationSection") ? activeMobileLinkClass : mobileLinkClass}
                            >
                                Add Service
                            </button>

                            <button
                                onClick={() => navigate("/weather")}
                                className={currentPath.startsWith("/weather") ? activeMobileLinkClass : mobileLinkClass}
                            >
                                Weather
                            </button>

                            <button
                                onClick={() => navigate("/AboutUs")}
                                className={currentPath.startsWith("/AboutUs") ? activeMobileLinkClass : mobileLinkClass}
                            >
                                About Us
                            </button>

                            <button
                                onClick={() => navigate("/ContactPage")}
                                className={currentPath.startsWith("/ContactPage") ? activeMobileLinkClass : mobileLinkClass}
                            >
                                Contact Us
                            </button>
                        </nav>
                        
                        {/* Mobile Auth Buttons and Status */}
                        {isLoggedIn ? (
                            <div className="p-4 border-t border-white/30 mt-4">
                                {userRole === "company" && companyStatus !== "approved" && (
                                    <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                                        <p className="text-sm font-semibold text-yellow-200">
                                            Status: {companyStatus || "pending"}
                                        </p>
                                        <p className="text-xs text-yellow-100 mt-1">
                                            Your application is under review
                                        </p>
                                    </div>
                                )}
                                
                                <div className="flex flex-col gap-2">
                                    {userRole === "company" && companyStatus === "approved" && (
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate("/CompanyDashboard");
                                            }}
                                            className="w-full bg-white/30 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/40 transition"
                                        >
                                            Dashboard
                                        </button>
                                    )}
                                    {userRole === "passenger" && (
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate("/PassengerDashboard");
                                            }}
                                            className="w-full bg-white/30 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/40 transition"
                                        >
                                            Dashboard
                                        </button>
                                    )}
                                    {userRole === "admin" && (
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate("/admin/dashboard");
                                            }}
                                            className="w-full bg-white/30 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/40 transition"
                                        >
                                            Admin Dashboard
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            if (userRole === "company") {
                                                navigate("/Company_profile");
                                            } else {
                                                navigate("/Passenger_profile");
                                            }
                                        }}
                                        className="w-full border border-white/30 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/10 transition"
                                    >
                                        My Profile
                                    </button>
                                    
                                    <button
                                        onClick={handleLogout}
                                        className="w-full border border-red-400/30 text-red-300 px-4 py-2 rounded-lg font-bold hover:bg-red-500/20 transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border-t border-white/30 mt-4 flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        if (onOpenLoginModal) onOpenLoginModal();
                                    }}
                                    className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-gray-100 hover:text-indigo-800 transition"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate("/PassengerRegistration");
                                    }}
                                    className="border-2 border-white text-white px-4 py-2 rounded-lg font-bold hover:bg-white hover:text-indigo-700 transition"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}