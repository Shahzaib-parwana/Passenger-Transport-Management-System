"use client"

import { useState } from "react"

const SystemSettings = () => {
  const [activeSection, setActiveSection] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      siteName: "GB Transport Management",
      siteDescription: "Professional vehicle booking and management system",
      contactEmail: "admin@gbtransport.com",
      contactPhone: "+92-300-1234567",
      timezone: "Asia/Karachi",
      currency: "PKR",
      language: "en",
    },
    booking: {
      cancellationWindow: 24,
      maxAdvanceBooking: 30,
      minBookingTime: 2,
      autoConfirmBookings: true,
      requirePaymentUpfront: false,
      allowCashPayments: true,
    },
    payment: {
      paymentGateway: "stripe",
      commissionRate: 10,
      payoutSchedule: "weekly",
      minimumPayout: 5000,
      processingFee: 2.5,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      bookingConfirmations: true,
      paymentAlerts: true,
      systemAlerts: true,
    },
  })

  const handleSettingChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const saveSettings = () => {
    console.log("Saving settings:", settings)
    // Handle settings save
  }

  const sections = [
    { key: "general", label: "General Settings", icon: "⚙️" },
    { key: "booking", label: "Booking Rules", icon: "📋" },
    { key: "payment", label: "Payment Settings", icon: "💳" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <button onClick={saveSettings} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === section.key
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* General Settings */}
            {activeSection === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => handleSettingChange("general", "contactEmail", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={settings.general.contactPhone}
                      onChange={(e) => handleSettingChange("general", "contactPhone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => handleSettingChange("general", "timezone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Karachi">Asia/Karachi</option>
                      <option value="UTC">UTC</option>
                      <option value="Asia/Dubai">Asia/Dubai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => handleSettingChange("general", "currency", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PKR">Pakistani Rupee (PKR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => handleSettingChange("general", "language", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="ur">Urdu</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingChange("general", "siteDescription", e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Booking Settings */}
            {activeSection === "booking" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Booking Rules</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Window (hours)</label>
                    <input
                      type="number"
                      value={settings.booking.cancellationWindow}
                      onChange={(e) =>
                        handleSettingChange("booking", "cancellationWindow", Number.parseInt(e.target.value))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Advance Booking (days)</label>
                    <input
                      type="number"
                      value={settings.booking.maxAdvanceBooking}
                      onChange={(e) =>
                        handleSettingChange("booking", "maxAdvanceBooking", Number.parseInt(e.target.value))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Booking Time (hours)</label>
                    <input
                      type="number"
                      value={settings.booking.minBookingTime}
                      onChange={(e) =>
                        handleSettingChange("booking", "minBookingTime", Number.parseInt(e.target.value))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.booking.autoConfirmBookings}
                      onChange={(e) => handleSettingChange("booking", "autoConfirmBookings", e.target.checked)}
                      className="mr-3"
                    />
                    Auto-confirm bookings
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.booking.requirePaymentUpfront}
                      onChange={(e) => handleSettingChange("booking", "requirePaymentUpfront", e.target.checked)}
                      className="mr-3"
                    />
                    Require payment upfront
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.booking.allowCashPayments}
                      onChange={(e) => handleSettingChange("booking", "allowCashPayments", e.target.checked)}
                      className="mr-3"
                    />
                    Allow cash payments
                  </label>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeSection === "payment" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
                    <select
                      value={settings.payment.paymentGateway}
                      onChange={(e) => handleSettingChange("payment", "paymentGateway", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                      <option value="razorpay">Razorpay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.payment.commissionRate}
                      onChange={(e) =>
                        handleSettingChange("payment", "commissionRate", Number.parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payout Schedule</label>
                    <select
                      value={settings.payment.payoutSchedule}
                      onChange={(e) => handleSettingChange("payment", "payoutSchedule", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payout (Rs.)</label>
                    <input
                      type="number"
                      value={settings.payment.minimumPayout}
                      onChange={(e) => handleSettingChange("payment", "minimumPayout", Number.parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.payment.processingFee}
                      onChange={(e) =>
                        handleSettingChange("payment", "processingFee", Number.parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>

                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Notification Channels</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => handleSettingChange("notifications", "emailNotifications", e.target.checked)}
                          className="mr-3"
                        />
                        Email Notifications
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.smsNotifications}
                          onChange={(e) => handleSettingChange("notifications", "smsNotifications", e.target.checked)}
                          className="mr-3"
                        />
                        SMS Notifications
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.pushNotifications}
                          onChange={(e) => handleSettingChange("notifications", "pushNotifications", e.target.checked)}
                          className="mr-3"
                        />
                        Push Notifications
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notification Types</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.bookingConfirmations}
                          onChange={(e) =>
                            handleSettingChange("notifications", "bookingConfirmations", e.target.checked)
                          }
                          className="mr-3"
                        />
                        Booking Confirmations
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.paymentAlerts}
                          onChange={(e) => handleSettingChange("notifications", "paymentAlerts", e.target.checked)}
                          className="mr-3"
                        />
                        Payment Alerts
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.systemAlerts}
                          onChange={(e) => handleSettingChange("notifications", "systemAlerts", e.target.checked)}
                          className="mr-3"
                        />
                        System Alerts
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings
