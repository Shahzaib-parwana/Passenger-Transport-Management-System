// components/AboutUs.jsx
import React, { useState, useEffect } from 'react';
import {
  Truck, Users, MapPin, Shield, Globe, Cloud, Navigation,
  CheckCircle, Phone, Mail, Map, Award, Star, Calendar, Clock, Linkedin
} from 'lucide-react';

// Icon mapping for dynamic icons
const iconComponents = {
  truck: Truck,
  users: Users,
  'map-pin': MapPin,
  shield: Shield,
  globe: Globe,
  cloud: Cloud,
  navigation: Navigation,
  'check-circle': CheckCircle,
  phone: Phone,
  mail: Mail,
  map: Map,
  award: Award,
  star: Star,
  calendar: Calendar,
  clock: Clock
};
// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000' 
  : '';

const AboutUs = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        // http://localhost:8000/api/about/active/'
        const response = await fetch('/api/about/active/', {
          headers: {
            'ngrok-skip-browser-warning': 'true', // Bypasses ngrok warning page
            'Accept': 'application/json'
          }
        });
          
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setAboutData(data);
        console.log("Images to find", data.hero_images);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching about data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  // Static fallback data in case API fails
  const staticData = {
    hero_title: "Revolutionizing Transport in Gilgit-Baltistan",
    hero_subtitle: "Connecting verified transport companies with passengers through a seamless, technology-driven platform featuring real-time weather updates and priority-based booking.",
    mission_statement: "To transform transportation in Gilgit-Baltistan by creating a unified platform that brings transparency, reliability, and convenience to both transport providers and passengers, while addressing the unique challenges of mountainous terrain through technology and innovation.",
    statistics: [
      { title: "Verified Companies", value: 78, suffix: "+", description: "Registered & Operating", icon: "shield", color: "blue" },
      { title: "Successful Bookings", value: 12540, suffix: "+", description: "Since 2023", icon: "calendar", color: "green" },
      { title: "Cities Covered", value: 15, suffix: "+", description: "Across Gilgit-Baltistan", icon: "map-pin", color: "purple" },
      { title: "Happy Passengers", value: 8500, suffix: "+", description: "Trust Our Platform", icon: "users", color: "orange" }
    ],
    features: [
      { title: "Complete Vehicle Booking", description: "Book entire vehicles for groups, families, or cargo transport across Gilgit-Baltistan", icon: "truck" },
      { title: "Individual Seat Reservation", description: "Book single seats on shared vehicles with transparent pricing", icon: "users" },
      { title: "Real-time Weather Updates", description: "Live weather conditions and forecasts for 15+ cities in the region", icon: "cloud" },
      { title: "Verified Transport Companies", description: "All registered companies are verified, licensed, and rated by passengers", icon: "shield" },
      { title: "Priority-based Booking", description: "Book according to your priority - speed, cost, comfort, or safety", icon: "navigation" },
      { title: "Multi-City Coverage", description: "Services connecting Gilgit with Skardu, Hunza, Chilas, and beyond", icon: "globe" }
    ],
    team_members: [
      { name: "Ahmed Khan", role: "Founder & CEO", bio: "10+ years in transportation logistics", email: "ahmed.khan@gilgittms.com" },
      { name: "Fatima Shah", role: "Operations Director", bio: "Tourism & hospitality expert", email: "fatima.shah@gilgittms.com" },
      { name: "Bilal Hassan", role: "Tech Lead", bio: "Full-stack developer specializing in travel tech", email: "bilal.hassan@gilgittms.com" },
      { name: "Sara Ali", role: "Customer Success", bio: "Ensuring smooth passenger experiences", email: "sara.ali@gilgittms.com" }
    ],
    values: [
      { title: "Safety First", description: "All vehicles and drivers undergo strict safety checks", icon: "check-circle" },
      { title: "Transparent Pricing", description: "No hidden charges, clear breakdown of all costs", icon: "check-circle" },
      { title: "Regional Expertise", description: "Deep understanding of Gilgit-Baltistan's unique transportation needs", icon: "check-circle" },
      { title: "Technology Driven", description: "Modern solutions for traditional transportation challenges", icon: "check-circle" }
    ],
    process_steps: [
      {
        step_number: "01",
        title: "For Passengers",
        subtitle: "Easy Booking Process",
        color: "blue",
        items: [
          { text: "Select route and travel date" },
          { text: "Choose booking type (vehicle/seat)" },
          { text: "Filter by priority (cost, comfort, etc.)" },
          { text: "Check real-time weather updates" },
          { text: "Book & pay securely online" },
          { text: "Receive instant confirmation" }
        ]
      },
      {
        step_number: "02",
        title: "For Companies",
        subtitle: "Business Management",
        color: "green",
        items: [
          { text: "Register & verify your company" },
          { text: "List vehicles and set schedules" },
          { text: "Update real-time availability" },
          { text: "Manage bookings & payments" },
          { text: "Receive passenger ratings" },
          { text: "Access analytics dashboard" }
        ]
      },
      {
        step_number: "03",
        title: "Platform Services",
        subtitle: "Value Added Features",
        color: "purple",
        items: [
          { text: "24/7 customer support" },
          { text: "Weather advisory alerts" },
          { text: "Route optimization" },
          { text: "Safety compliance checks" },
          { text: "Multi-language support" },
          { text: "Mobile app accessibility" }
        ]
      }
    ],
    contact_info: [
      { title: "Call Us", description: "Available 24/7 for support", detail: "+92 123 4567890", icon: "phone" },
      { title: "Email Us", description: "Quick response guaranteed", detail: "contact@gilgittms.com", icon: "mail" },
      { title: "Visit Us", description: "Our headquarters", detail: "Gilgit City Center, GB", icon: "map" }
    ],
    hero_images: []
  };

  // Use fetched data or fallback to static data
  const data = aboutData || staticData;

  // Icon renderer function
  const renderIcon = (iconName) => {
    const IconComponent = iconComponents[iconName] || Truck;
    return <IconComponent className="w-8 h-8" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !aboutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">Error loading content</div>
          <div className="text-gray-600">Using static content</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-blue-25 to-yellow-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-400 via-blue-300 to-yellow-100 text-gray-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 via-transparent to-yellow-200/30" />
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-center"
            style={{
              backgroundImage: data.hero_images && data.hero_images.length > 0
                ? `url(${API_BASE_URL}${data.hero_images[0].image})`
                : `url('https://images.unsplash.com/photo-1548013146-72479768bada?w=1800&q=80')`
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 pt-16 pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center bg-blue-100/50 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-blue-300/50">
              <span className="text-blue-700 text-sm font-medium">Gilgit Transport Management System</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {data.hero_title || "Revolutionizing Transport in "}
              <span className="text-blue-600">Gilgit-Baltistan</span>
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-gray-700 leading-relaxed">
              {data.hero_subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:shadow-xl shadow-lg">
                <span className="flex items-center justify-center gap-2">
                  <Truck className="w-5 h-5" />
                  Explore Services
                </span>
              </button>

              <button className="bg-transparent border-2 border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300">
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Watch Demo
                </span>
              </button>
            </div>

            {/* Dynamic Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-blue-300/50">
              {data.statistics?.slice(0, 3).map((stat, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100/60 rounded-xl flex items-center justify-center">
                    {renderIcon(stat.icon)}
                  </div>
                  <div>
                    <div className="font-bold text-xl text-gray-800">{stat.value}{stat.suffix || "+"}</div>
                    <div className="text-gray-700">{stat.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="white" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="white" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Dynamic Stats Section */}
      <section className="py-16 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200 -mt-1 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.statistics?.map((stat, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-100/50 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-500">
                    {renderIcon(stat.icon)}
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {stat.value}{stat.suffix || "+"}
                  </div>
                </div>
                <div className="text-gray-700 font-semibold">{stat.title}</div>
                <div className="text-gray-600 text-sm mt-1">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Our Mission & Vision
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {data.mission_statement}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Why Choose GilgitTMS?</h3>
              <ul className="space-y-5">
                {data.values?.map((value, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 bg-blue-100/70 rounded-xl flex items-center justify-center group-hover:bg-yellow-100/70 transition-colors">
                        {renderIcon(value.icon)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg mb-1">{value.title}</h4>
                      <p className="text-gray-700">{value.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100/50">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">Regional Expertise</h4>
                    <p className="text-gray-700">Specialized for Gilgit-Baltistan</p>
                  </div>
                </div>
                {/* Mission section mein image display ka portion */}
                <div className="relative h-64 rounded-lg overflow-hidden mb-6">
                  <img
                    src={
                      data.hero_images && data.hero_images.length > 0
                        ? `${API_BASE_URL}${data.hero_images[0].image}`  // First image from array
                        : `https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80`
                    }
                    alt="Gilgit Landscape"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback agar image load na ho
                      e.target.src = 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-sm font-semibold">Gilgit-Baltistan Region</div>
                    <div className="text-xs">Transportation Hub</div>
                  </div>
                </div>
                <p className="text-gray-700">
                  Our platform is specifically designed for mountain transportation challenges -
                  from weather-dependent routes to seasonal variations. We understand the terrain
                  and provide solutions that work in real-world conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Comprehensive solutions designed for modern transportation needs in Gilgit-Baltistan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.features?.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100/50 hover:border-blue-200 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100/50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>

                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {renderIcon(feature.icon)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic How It Works */}
      <section className="py-20  from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-700">Three simple processes for different stakeholders</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {data.process_steps?.map((section, index) => (
              <div
                key={index}
                className={`relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden border-t-4 border-${section.color}-400`}
              >
                <div className={`absolute top-0 right-0 bg-gradient-to-r from-blue-400 to-blue-500 text-white px-4 py-2 rounded-bl-lg font-bold`}>
                  Step {section.step_number}
                </div>

                <div className="mb-6">
                  <div className="text-blue-600 font-semibold mb-2">{section.subtitle}</div>
                  <h3 className="text-2xl font-bold text-gray-800">{section.title}</h3>
                </div>

                <ul className="space-y-4">
                  {section.items?.map((item, idx) => (
                    <li key={idx} className="flex items-start group">
                      <div className="w-6 h-6 bg-blue-100/70 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover:bg-yellow-100/70 transition-colors">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-800 transition-colors">{item.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="absolute bottom-0 right-0 w-20 h-20 bg-yellow-100/30 rounded-tl-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Team Section */}
      <section className="py-20 bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Leadership Team
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Dedicated professionals working to transform transportation in Gilgit-Baltistan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.team_members?.map((member, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-b from-white/80 to-blue-50/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image_url || member.image || `https://images.unsplash.com/photo-${index === 0 ? '1507003211169-0a1dd7228f2d' : index === 1 ? '1494790108755-2616b612b786' : index === 2 ? '1507591064344-4c6ce005-128' : '1534528741775-53994a69daeb'}?w=400&h=400&fit=crop&crop=face`}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <div className="text-blue-600 font-medium mb-3">{member.role}</div>
                  <p className="text-gray-700 text-sm">{member.bio}</p>

                  <div className="mt-4 pt-4 border-t border-blue-100/50">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Mail className="w-4 h-4 mr-2" />
                      {member.email}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Linkedin className="w-4 h-4 mr-2" />
                      {member.linkedin_url}
                    </div>
                  </div>
                </div>

                <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-transparent rounded-br-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Contact Section */}
      <section className="py-20  from-gray-200 via-blue-200 to-sky-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Get In Touch With Us
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Have questions about our platform, services, or partnership opportunities?
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {data.contact_info?.map((contact, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                    {renderIcon(contact.icon)}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{contact.title}</h3>
                  <p className="text-gray-700 mb-4">{contact.description}</p>
                  <div className="text-lg font-semibold text-blue-600">{contact.detail}</div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="inline-flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl active:scale-95">
                  <span className="flex items-center justify-center gap-3">
                    <Users className="w-5 h-5" />
                    Become a Partner Company
                  </span>
                </button>

                <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 hover:from-yellow-500 hover:to-yellow-600 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl active:scale-95">
                  <span className="flex items-center justify-center gap-3">
                    <Truck className="w-5 h-5" />
                    Start Booking Journey
                  </span>
                </button>
              </div>

              <p className="mt-8 text-gray-700 text-sm">
                Looking for weather updates? Visit our <a href="/weather" className="underline hover:text-blue-600 font-medium">Weather Center</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;