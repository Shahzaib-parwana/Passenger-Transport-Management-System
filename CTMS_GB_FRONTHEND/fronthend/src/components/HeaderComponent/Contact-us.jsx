// src/pages/ContactPage.jsx

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  MapPin, Phone, Mail, Clock, MessageSquare, Send, 
  CheckCircle, Shield, Users, Building, Headphones,
  Facebook, Twitter, Instagram, Youtube, Linkedin,
  AlertCircle, Loader
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContactPage() {
  const navigate = useNavigate();
  
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general"
  });
  
  // State for backend data
  const [backendData, setBackendData] = useState({
    settings: [],
    departments: [],
    faqs: [],
    categories: []
  });
  
  // State for UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // CORRECTED: API base URL based on your URL structure
  // Your main project URL: path("api/contact", include("Contact.urls"))
  // Your contact app URLs are at: api/contact/
  const API_BASE_URL = "/api/contact";

  // Fetch contact data from backend on component mount
  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      // CORRECTED: Fetch contact page data from the correct endpoint
      const response = await axios.get(`${API_BASE_URL}/contact-data/`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.success) {
        setBackendData({
          settings: response.data.settings,
          departments: response.data.departments,
          faqs: response.data.faqs,
          categories: response.data.categories || getDefaultCategories()
        });
      } else {
        setApiError("Failed to load contact data");
      }
    } catch (error) {
      console.error("Error fetching contact data:", error);
      setApiError(error.response?.data?.error || "Failed to connect to server");
      
      // Fallback to mock data if API fails
      setBackendData({
        settings: getDefaultSettings(),
        departments: getDefaultDepartments(),
        faqs: getDefaultFAQs(),
        categories: getDefaultCategories()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for fallback data
  const getDefaultSettings = () => ({
    site_name: "PTMS Gilgit-Baltistan",
    office_address: "PTMS GB Headquarters, Jutial Road, Gilgit, Gilgit-Baltistan",
    primary_email: "support@ptmsgb.pk",
    secondary_email: "info@ptmsgb.pk",
    primary_phone: "+92 5811 123456",
    secondary_phone: "+92 5811 123457",
    emergency_phone: "+92 300 1234567",
    working_hours: "Mon - Sat: 8:00 AM - 8:00 PM\nSunday: 9:00 AM - 6:00 PM",
    facebook_url: "#",
    twitter_url: "#",
    instagram_url: "#",
    youtube_url: "#",
    linkedin_url: "#"
  });

  const getDefaultDepartments = () => [
    {
      id: 1,
      department_name: "passenger_support",
      department_display: "Passenger Support",
      contact_person: "Passenger Support Team",
      email: "passenger@ptmsgb.pk",
      phone: "+92 5811 234567",
      description: "For ticket booking, cancellations, and passenger queries"
    },
    {
      id: 2,
      department_name: "company_registration",
      department_display: "Company Registration",
      contact_person: "Company Relations Team",
      email: "companies@ptmsgb.pk",
      phone: "+92 5811 234568",
      description: "For transport companies and service provider inquiries"
    },
    {
      id: 3,
      department_name: "technical_support",
      department_display: "Technical Support",
      contact_person: "Technical Support Team",
      email: "tech@ptmsgb.pk",
      phone: "+92 5811 234569",
      description: "For website/app issues and technical assistance"
    },
    {
      id: 4,
      department_name: "customer_care",
      department_display: "Customer Care",
      contact_person: "Customer Care Team",
      email: "care@ptmsgb.pk",
      phone: "+92 300 1234567",
      description: "General inquiries, feedback, and complaints"
    }
  ];

  const getDefaultFAQs = () => [
    {
      id: 1,
      question: "How can I book a ticket as a passenger?",
      answer: "Simply register as a passenger, log in to your account, select your route and date, choose your seat, and complete the secure payment process."
    },
    {
      id: 2,
      question: "How do transport companies register on PTMS GB?",
      answer: "Transport companies can register by clicking 'Join as Company' on our homepage. You'll need to provide company documents, vehicle details, and complete the verification process."
    },
    {
      id: 3,
      question: "What payment methods do you accept?",
      answer: "We accept multiple secure payment methods including JazzCash, EasyPaisa, bank transfers, and credit/debit cards for ticket bookings."
    },
    {
      id: 4,
      question: "How can I track my booked vehicle?",
      answer: "Once booked, you'll receive a confirmation email with tracking details. You can also track your vehicle in real-time through your passenger dashboard."
    },
    {
      id: 5,
      question: "What should I do in case of travel delays?",
      answer: "We provide real-time updates on delays through SMS and app notifications. For extended delays, our support team will assist with rescheduling or refunds."
    }
  ];

  const getDefaultCategories = () => [
    { value: 'general', label: 'General Inquiry' },
    { value: 'passenger', label: 'Passenger Support' },
    { value: 'company', label: 'Company Registration' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'emergency', label: 'Emergency Assistance' },
  ];

  // Generate contact info from settings
  const generateContactInfo = () => {
    if (!backendData.settings) return [];
    
    return [
      {
        icon: MapPin,
        title: "Our Office",
        details: backendData.settings.office_address,
        description: "Visit us at our main office for in-person assistance",
        color: "from-blue-500 to-cyan-400"
      },
      {
        icon: Phone,
        title: "Phone Numbers",
        details: `${backendData.settings.primary_phone} (Office)\n${backendData.settings.emergency_phone} (24/7 Support)`,
        description: "Available 24/7 for emergency travel assistance",
        color: "from-emerald-500 to-teal-400"
      },
      {
        icon: Mail,
        title: "Email Address",
        details: `${backendData.settings.primary_email}\n${backendData.settings.secondary_email}`,
        description: "We respond within 2 hours during business days",
        color: "from-purple-500 to-pink-400"
      },
      {
        icon: Clock,
        title: "Working Hours",
        details: backendData.settings.working_hours,
        description: "Ramadan Timings: 9:00 AM - 5:00 PM",
        color: "from-amber-500 to-orange-400"
      }
    ];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.length > 5000) {
      newErrors.message = "Message cannot exceed 5000 characters";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // CORRECTED: Submit to the correct endpoint
      const response = await axios.post(`${API_BASE_URL}/submit/`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Add withCredentials if you're using session authentication
        // withCredentials: true
      });
      
      if (response.data.success) {
        setIsSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
            category: "general"
          });
          setIsSubmitted(false);
        }, 3000);
      } else {
        setErrors(response.data.errors || { general: 'Submission failed' });
      }
    } catch (error) {
      console.error("Submission error:", error);
      
      if (error.response) {
        // Server responded with error
        const serverErrors = error.response.data;
        if (typeof serverErrors === 'object') {
          // Handle Django REST Framework validation errors format
          if (serverErrors.detail) {
            setErrors({ general: serverErrors.detail });
          } else {
            setErrors(serverErrors);
          }
        } else {
          setErrors({ general: serverErrors.error || 'Submission failed' });
        }
      } else if (error.request) {
        // No response received
        setErrors({ general: 'Network error. Please check your connection.' });
      } else {
        // Request setup error
        setErrors({ general: 'Error submitting form. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for department icons and colors
  const getDepartmentIcon = (departmentName) => {
    const iconMap = {
      'passenger_support': <Users className="w-5 h-5 text-white" />,
      'company_registration': <Building className="w-5 h-5 text-white" />,
      'technical_support': <Shield className="w-5 h-5 text-white" />,
      'customer_care': <Headphones className="w-5 h-5 text-white" />,
      'emergency': <Phone className="w-5 h-5 text-white" />
    };
    return iconMap[departmentName] || <Users className="w-5 h-5 text-white" />;
  };

  const getDepartmentColor = (departmentName) => {
    const colorMap = {
      'passenger_support': 'from-blue-500 to-indigo-500',
      'company_registration': 'from-emerald-500 to-teal-500',
      'technical_support': 'from-purple-500 to-pink-500',
      'customer_care': 'from-amber-500 to-orange-500',
      'emergency': 'from-red-500 to-rose-500'
    };
    return colorMap[departmentName] || 'from-blue-500 to-indigo-500';
  };

  // Get social media links from backend settings
  const getSocialMediaLinks = () => {
    if (!backendData.settings) return [];
    
    return [
      { icon: Facebook, label: "Facebook", color: "from-blue-600 to-blue-700", url: backendData.settings.facebook_url || "#" },
      { icon: Twitter, label: "Twitter", color: "from-cyan-500 to-blue-500", url: backendData.settings.twitter_url || "#" },
      { icon: Instagram, label: "Instagram", color: "from-pink-500 to-rose-600", url: backendData.settings.instagram_url || "#" },
      { icon: Youtube, label: "YouTube", color: "from-red-600 to-red-700", url: backendData.settings.youtube_url || "#" },
      { icon: Linkedin, label: "LinkedIn", color: "from-blue-700 to-blue-800", url: backendData.settings.linkedin_url || "#" }
    ].filter(social => social.url !== "");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-sans flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-sans overflow-x-hidden">
      
      {/* Error Banner */}
      {apiError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
              <p className="text-yellow-700">
                {apiError}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10"></div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <MessageSquare className="w-4 h-4 text-cyan-300" />
              <span className="text-white/90 text-sm font-medium">WE'RE HERE TO HELP</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Touch</span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              Have questions about our transport services? Our dedicated team is here to assist you 24/7 with all your travel needs across Gilgit-Baltistan.
            </p>
          </motion.div>
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

      {/* Contact Information Cards */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Contact <span className="text-blue-600">Information</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Multiple ways to reach us for any assistance regarding your travel needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {generateContactInfo().map((info, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${info.color} mb-6`}>
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{info.title}</h3>
                  <div className="text-gray-600 whitespace-pre-line mb-4">{info.details}</div>
                  <p className="text-sm text-gray-500">{info.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:pr-8"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Send Us a Message</h2>
                  <p className="text-gray-600">
                    Fill out the form below and our team will get back to you within 24 hours.
                  </p>
                </div>

                {/* Form Errors */}
                {errors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {errors.general}
                    </p>
                  </div>
                )}

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-200 text-center"
                  >
                    <div className="inline-flex p-3 rounded-full bg-emerald-100 mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent Successfully!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for contacting PTMS GB. We've received your message and will respond within 24 hours.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors duration-300"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-300`}
                          placeholder="Enter your full name"
                          disabled={isSubmitting}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-300`}
                          placeholder="Enter your email"
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.subject ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-300`}
                        placeholder="What is this regarding?"
                        disabled={isSubmitting}
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-300 bg-white disabled:bg-gray-100"
                        disabled={isSubmitting}
                      >
                        {backendData.categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-300 resize-none disabled:bg-gray-100`}
                        placeholder="Please describe your inquiry in detail..."
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full group relative px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin relative z-10" />
                          <span className="relative z-10">Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
                          <span className="relative z-10">Send Message</span>
                          <Send className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <p className="text-sm text-gray-500 text-center">
                      By submitting this form, you agree to our privacy policy. We never share your information with third parties.
                    </p>
                  </form>
                )}
              </motion.div>

              {/* Department Contacts & FAQ */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-12"
              >
                {/* Department Contacts */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Department Contacts</h3>
                  <div className="space-y-4">
                    {backendData.departments.length > 0 ? (
                      backendData.departments.map((dept) => (
                        <motion.div
                          key={dept.id || dept.department_name}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 }}
                          className="group bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${getDepartmentColor(dept.department_name)} flex-shrink-0`}>
                              {getDepartmentIcon(dept.department_name)}
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-bold text-gray-800 mb-1">
                                {dept.department_display || dept.department_name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-3">{dept.description}</p>
                              <div className="flex flex-wrap gap-4">
                                <a 
                                  href={`mailto:${dept.email}`}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                                >
                                  <Mail className="w-4 h-4" />
                                  {dept.email}
                                </a>
                                <a 
                                  href={`tel:${dept.phone.replace(/\D/g, '')}`}
                                  className="text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-2"
                                >
                                  <Phone className="w-4 h-4" />
                                  {dept.phone}
                                </a>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-yellow-800">
                          Department contacts are currently being updated. Please use the contact form for assistance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {backendData.faqs.length > 0 ? (
                      backendData.faqs.map((faq, idx) => (
                        <motion.div
                          key={faq.id || idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-blue-600">Q:</span> {faq.question}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium text-emerald-600">A:</span> {faq.answer}
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-blue-800">
                          FAQs are being updated. Please check back soon or use the contact form for immediate assistance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Find Our <span className="text-blue-600">Location</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visit us at our headquarters in Gilgit for in-person assistance
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Map */}
                <div className="lg:col-span-2 h-[400px] lg:h-[500px] relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <MapPin className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <h3 className="text-2xl font-bold mb-2">
                        {backendData.settings?.site_name || "PTMS GB Headquarters"}
                      </h3>
                      <p className="text-blue-100">
                        {backendData.settings?.office_address || "Jutial Road, Gilgit, Gilgit-Baltistan"}
                      </p>
                      <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Open: Mon-Sat 8:00 AM - 8:00 PM</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Interactive Map Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-3xl border-2 border-white/30 animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-white mx-auto mb-4" />
                          <p className="text-white font-medium">Interactive Map</p>
                          <p className="text-blue-100 text-sm mt-1">(Would display Google Maps)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="bg-gradient-to-b from-blue-50 to-white p-8 lg:p-10">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Location Details</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Getting Here</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{backendData.settings.google_maps_embed}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>10-minute drive from Gilgit Airport</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Parking available for visitors</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Best Time to Visit</h4>
                      <p className="text-gray-600">
                        For faster service, visit between 10:00 AM - 12:00 PM or 2:00 PM - 4:00 PM on weekdays.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">What to Bring</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>CNIC/Passport for identification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>Relevant documents for your inquiry</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>Booking reference if applicable</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(backendData.settings?.google_maps_embed || 'Gilgit Gilgit-Baltistan')}`, '_blank')}
                      className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-5 h-5" />
                      Get Directions on Google Maps
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media & Newsletter */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Stay <span className="text-cyan-300">Connected</span>
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Follow us on social media for the latest updates on routes, weather alerts, and special offers
              </p>
            </motion.div>

            {/* Social Media Links */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {getSocialMediaLinks().map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${social.color} shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1`}>
                    <social.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-blue-200 mt-2 block">{social.label}</span>
                </motion.a>
              ))}
            </div>

            {/* Quick Links */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 text-sm font-medium"
                >
                  Book Tickets
                </button>
    
                <button
                  onClick={() => navigate("/weather")}
                  className="px-4 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 text-sm font-medium"
                >
                  Weather Updates
                </button>
                <button
                  onClick={() => navigate("/CompanyDashboard")}
                  className="px-4 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 text-sm font-medium"
                >
                  Company Portal
                </button>
              </div>
            </div>

            {/* Emergency Contact Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 border border-red-300 shadow-xl"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-white mb-2">24/7 Emergency Support</h4>
                  <p className="text-red-100">
                    For emergency travel assistance or safety concerns, call our dedicated helpline
                  </p>
                </div>
                <a
                  href={`tel:${backendData.settings?.emergency_phone?.replace(/\D/g, '') || '+923001234567'}`}
                  className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors duration-300 flex items-center gap-2 whitespace-nowrap"
                >
                  <Phone className="w-5 h-5" />
                  {backendData.settings?.emergency_phone || "+92 300 1234567"}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}