"use client"

import { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import { 
  Facebook, Instagram, Twitter, Youtube, 
  Mountain, MapPin, Phone, Mail, 
  ArrowRight, Sparkles, Shield, Clock, Users, TrendingUp 
} from "lucide-react"
import { motion } from "framer-motion"
import logo from "./icons/PTMS_GB_LOGO.PNG";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    // Trigger animation when component mounts
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: { duration: 0.3 }
    }
  };

  const linkVariants = {
    hover: {
      x: 5,
      transition: { duration: 0.2 }
    }
  };

  // Stats data

  return (
    <footer className="relative z-10 bg-gradient-to-r from-blue-700">

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20">
        Animated floating elements
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Footer Content */}
      <motion.div
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={containerVariants}
        className="relative bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-700 shadow-2xl backdrop-blur-lg border-t border-white/10"
      >
        {/* Stats Section */}


        {/* Main Footer Grid */}
        <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-600"
              >
                {/* Logo in round shape */}
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src={logo} 
                    alt="PTMS_GB Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent">
                  PTMS GB
                </span>
                <p className="text-sm text-white/70">Gilgit-Baltistan</p>
              </div>
            </div>
            
            <p className="text-white/80 leading-relaxed">
              <Sparkles className="inline h-4 w-4 mr-1 text-yellow-300" />
              Passenger Transport Management System for Gilgit-Baltistan. 
              Seamless booking, reliable providers, and secure travel experiences.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {[
                { icon: MapPin, text: "Gilgit, GB Pakistan" },
                { icon: Phone, text: "+92 123 456789" },
                { icon: Mail, text: "info@ptmsgb.com" }
              ].map((contact, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                    <contact.icon className="h-4 w-4 text-white/80" />
                  </div>
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                    {contact.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-3">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Quick Links
              </span>
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/seat-booking", label: "Seat Booking" },
                { to: "/vehicle-booking", label: "Vehicle Reservation" },
                { to: "/CompanyRegistrationSection", label: "Provide Services" },
                { to: "/weather", label: "Weather Updates" }
              ].map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover="hover"
                  onHoverStart={() => setHoveredLink(index)}
                  onHoverEnd={() => setHoveredLink(null)}
                >
                  <Link 
                    to={link.to}
                    className="flex items-center justify-between group py-2"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        variants={linkVariants}
                        className="flex items-center gap-2"
                      >
                        <ArrowRight className="h-3 w-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-white/80 group-hover:text-white font-medium transition-colors">
                          {link.label}
                        </span>
                      </motion.div>
                    </div>
                    {hoveredLink === index && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 20 }}
                        className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
                      />
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-3">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Company
              </span>
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/AboutUs", label: "About Us" },
                { to: "/blog", label: "Blog" },
                { to: "/ContactPage", label: "Contact Us" },
                { to: "/privacy-policy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms & Conditions" }
              ].map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover="hover"
                  onHoverStart={() => setHoveredLink(index + 10)}
                  onHoverEnd={() => setHoveredLink(null)}
                >
                  <Link 
                    to={link.to}
                    className="flex items-center justify-between group py-2"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        variants={linkVariants}
                        className="flex items-center gap-2"
                      >
                        <ArrowRight className="h-3 w-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-white/80 group-hover:text-white font-medium transition-colors">
                          {link.label}
                        </span>
                      </motion.div>
                    </div>
                    {hoveredLink === index + 10 && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 20 }}
                        className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
                      />
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-3">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Connect With Us
              </span>
            </h4>
            
            <p className="text-white/70 mb-6 text-sm leading-relaxed">
              Follow us on social media for updates, travel tips, and exclusive offers.
            </p>

            <div className="flex gap-4 mb-8">
              {[
                { icon: Instagram, color: "from-pink-500 to-purple-600", label: "Instagram" },
                { icon: Facebook, color: "from-blue-600 to-blue-800", label: "Facebook" },
                { icon: Youtube, color: "from-red-600 to-red-700", label: "YouTube" },
                { icon: Twitter, color: "from-blue-400 to-blue-500", label: "Twitter" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  aria-label={social.label}
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl bg-gradient-to-r ${social.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
                >
                  <social.icon size={22} />
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
              ))}
            </div>

            {/* Download App Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
            >
              <span>Download App</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <motion.div 
          variants={itemVariants}
          className="border-t border-white/10 bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-lg"
        >
          <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/70 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span>
                © {currentYear} <span className="font-semibold text-white">PTMS_GB</span>. All rights reserved.
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating to top button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl z-40 hover:shadow-3xl transition-all duration-300"
      >
        <ArrowRight className="h-5 w-5 rotate-90" />
      </motion.button>
    </footer>
  )
}