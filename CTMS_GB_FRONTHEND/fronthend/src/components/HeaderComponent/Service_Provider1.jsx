// src/components/CompanyRegistrationSection.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, 
  TrendingUp, 
  Shield, 
  Users, 
  Smartphone, 
  MessageSquare,
  Calendar,
  DollarSign,
  Headphones,
  Zap
} from 'lucide-react';

export default function CompanyRegistrationSection() {
  const [activeTab, setActiveTab] = useState('benefits');

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-gray-200 via-blue-200 to-sky-200">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Heading */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Grow Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">Transport Business</span> With Us
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Join Pakistan's leading transport platform to expand your reach, increase revenue, 
            and streamline operations with powerful tools designed for service providers.
          </p>
        </div>

        {/* Modern Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { key: 'benefits', label: 'Key Benefits', icon: TrendingUp },
            { key: 'services', label: 'Services Offered', icon: Users },
            { key: 'how-to', label: 'How to Register', icon: Zap },
            { key: 'support', label: 'Support & Contact', icon: Headphones },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-2xl'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 shadow-xl hover:shadow-2xl'
              }`}
            >
              <Icon className={`h-6 w-6 transition-colors ${activeTab === key ? 'text-white' : 'text-blue-600 group-hover:text-indigo-700'}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Main Content Card with Glassmorphism Effect */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-12">
          <div className="p-10 lg:p-16">

            {/* Benefits Tab */}
            {activeTab === 'benefits' && (
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <h3 className="text-3xl font-extrabold text-gray-900 flex items-center gap-4">
                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                    Why Register With Us?
                  </h3>
                  {[
                    { icon: DollarSign, color: 'blue', title: 'Increase Revenue', desc: 'Access thousands of customers actively looking for transport services across GB. Our platform helps you fill empty seats and optimize vehicle utilization.' },
                    { icon: Shield, color: 'amber', title: 'Secure & Reliable', desc: 'Verified customers and secure payment processing. We handle transactions so you can focus on providing excellent service.' },
                    { icon: TrendingUp, color: 'blue', title: 'Business Analytics', desc: 'Get detailed insights into your bookings, customer preferences, and revenue trends to make informed business decisions.' },
                  ].map(({ icon: Icon, color, title, desc }) => (
                    <div key={title} className="flex gap-5 group">
                      <div className={`h-12 w-12 rounded-2xl bg-${color}-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-7 w-7 text-${color}-600`} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
                        <p className="text-gray-600 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-10">
                  <h3 className="text-3xl font-extrabold text-gray-900 flex items-center gap-4">
                    <Smartphone className="h-10 w-10 text-indigo-600" />
                    Platform Features
                  </h3>
                  {[
                    { icon: Calendar, color: 'amber', title: 'Flexible Scheduling', desc: 'Post availability up to 30 days in advance. Set your own schedules, routes, and pricing for maximum flexibility.' },
                    { icon: Users, color: 'blue', title: 'Team Management', desc: 'Easily manage multiple vehicles and drivers from a single dashboard. Assign bookings and track performance.' },
                    { icon: MessageSquare, color: 'amber', title: 'Direct Communication', desc: 'Integrated messaging system to communicate with customers about bookings, schedules, and special requests.' },
                  ].map(({ icon: Icon, color, title, desc }) => (
                    <div key={title} className="flex gap-5 group">
                      <div className={`h-12 w-12 rounded-2xl bg-${color}-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-7 w-7 text-${color}-600`} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
                        <p className="text-gray-600 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                <h3 className="text-4xl font-extrabold text-center text-gray-900 mb-12">Services You Can Offer</h3>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-100/60 p-8 rounded-2xl border border-blue-200/50 backdrop-blur-sm hover:shadow-2xl transition-shadow">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">Seat-Based Services</h4>
                    </div>
                    <p className="text-gray-700 mb-6 text-lg">Perfect for buses, minivans, and shared transport services. Sell individual seats on your scheduled routes.</p>
                    <ul className="space-y-3">
                      {['Set different fare classes (economy, premium)', 'Manage seat availability in real-time', 'Receive group booking requests', 'Ideal for inter-city and tourist routes'].map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50/80 to-orange-100/60 p-8 rounded-2xl border border-amber-200/50 backdrop-blur-sm hover:shadow-2xl transition-shadow">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">Full Vehicle Rental</h4>
                    </div>
                    <p className="text-gray-700 mb-6 text-lg">For private cars, SUVs, vans, and buses. Rent your entire vehicle for private trips, tours, or corporate travel.</p>
                    <ul className="space-y-3">
                      {['Set hourly, daily, or weekly rental rates', 'Offer chauffeur services or self-drive options', 'Perfect for weddings, events, and tourism', 'Corporate contracts and long-term rentals'].map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* How to Register Tab */}
            {activeTab === 'how-to' && (
              <div>
                <h3 className="text-4xl font-extrabold text-center text-gray-900 mb-12">Simple Registration Process</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                  {[
                    { step: 1, title: 'Create Account', desc: 'Sign up with your business email and contact information' },
                    { step: 2, title: 'Add Vehicle Details', desc: 'Provide information about your vehicles, capacity, and amenities' },
                    { step: 3, title: 'Set Services & Pricing', desc: 'Define your services, routes, schedules, and pricing structure' },
                    { step: 4, title: 'Start Accepting Bookings', desc: 'Go live and start receiving booking requests immediately' },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="text-center group">
                      <div className={`h-20 w-20 rounded-3xl ${step % 2 === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'} 
                        flex items-center justify-center mx-auto mb-5 shadow-2xl group-hover:scale-110 transition-transform`}>
                        <span className="text-4xl font-bold text-white">{step}</span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">{title}</h4>
                      <p className="text-gray-600">{desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-blue-50/70 to-amber-50/70 p-10 rounded-3xl border border-blue-200/30 backdrop-blur-sm">
                  <h4 className="text-2xl font-bold text-gray-900 mb-8 text-center">Required Documents</h4>
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { title: 'For All Providers', items: ['Business Registration Certificate', 'CNIC of Owner/Manager', 'Valid Mobile Number', 'Bank Account Details'] },
                      { title: 'For Vehicle Owners', items: ['Vehicle Registration Certificate', 'Fitness Certificate', 'Route Permit (if applicable)', 'Insurance Documents'] },
                      { title: 'For Drivers', items: ['Valid Driving License', 'CNIC Copy', 'Recent Medical Certificate', 'Police Clearance Certificate'] },
                    ].map(({ title, items }) => (
                      <div key={title} className="bg-white/70 p-6 rounded-2xl shadow-xl border border-gray-100">
                        <h5 className="font-bold text-gray-900 mb-4 text-lg">{title}</h5>
                        <ul className="space-y-2">
                          {items.map((item) => (
                            <li key={item} className="text-gray-700 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div>
                <h3 className="text-4xl font-extrabold text-center text-gray-900 mb-12 " >We're Here to Help You</h3>
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Headphones className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">Support Channels</h4>
                        <p className="text-gray-600">Multiple ways to get assistance</p>
                      </div>
                    </div>
                    {[
                      { icon: MessageSquare, color: 'amber', title: 'Live Chat', desc: 'Available 9 AM - 10 PM, 7 days a week' },
                      { icon: Smartphone, color: 'blue', title: 'Phone Support', desc: 'Call us at 0800-78672 (TOLL-FREE)' },
                      { icon: Users, color: 'amber', title: 'Dedicated Account Manager', desc: 'For registered companies with 5+ vehicles' },
                    ].map(({ icon: Icon, color, title, desc }) => (
                      <div key={title} className="flex gap-5 p-5 bg-gray-50/70 rounded-2xl backdrop-blur-sm hover:shadow-lg transition-shadow">
                        <div className={`h-14 w-14 rounded-2xl bg-${color}-100 flex items-center justify-center`}>
                          <Icon className={`h-7 w-7 text-${color}-600`} />
                        </div>
                        <div>
                          <h5 className="text-xl font-bold text-gray-900">{title}</h5>
                          <p className="text-gray-600">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">Quick Assistance</h4>
                        <p className="text-gray-600">Common questions & solutions</p>
                      </div>
                    </div>
                    {[
                      { q: 'How long does verification take?', a: 'Typically 24-48 hours after submitting all required documents.' },
                      { q: 'What commission do you charge?', a: 'Only 10-15% per booking, with no hidden fees or monthly charges.' },
                      { q: 'Can I manage multiple vehicles?', a: 'Yes, our dashboard allows you to manage unlimited vehicles and drivers.' },
                    ].map(({ q, a }) => (
                      <div key={q} className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-200/30">
                        <h5 className="text-xl font-bold text-gray-900 mb-3">{q}</h5>
                        <p className="text-gray-700">{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Ready to Grow Your Business?
            </h3>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Join over 500 transport service providers already expanding their reach across Gilgit-Baltistan.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a 
                href="/CompanyRegistration" 
                className="inline-flex items-center justify-center bg-white text-indigo-700 font-bold py-5 px-12 rounded-2xl text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500"
              >
                <TrendingUp className="mr-3 h-7 w-7" />
                Register Your Company Now
              </a>
              <a 
                href="/ContactUs" 
                className="inline-flex items-center justify-center bg-transparent border-4 border-white text-white font-bold py-5 px-12 rounded-2xl text-xl hover:bg-white hover:text-indigo-700 transition-all duration-500"
              >
                <Headphones className="mr-3 h-7 w-7" />
                Schedule a Demo
              </a>
            </div>
            <p className="text-blue-200 mt-8 text-lg">
              Have questions? Call our business support team at <span className="font-bold">0800-78672</span> • Email: partners@transportplatform.com
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}