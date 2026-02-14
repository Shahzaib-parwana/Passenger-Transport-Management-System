"use client"

import { useState } from "react"

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7d")

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalBookings: 1247,
      totalRevenue: 2840000,
      activeVehicles: 89,
      registeredUsers: 3456,
      bookingGrowth: 12.5,
      revenueGrowth: 18.3,
      vehicleGrowth: 8.7,
      userGrowth: 15.2,
    },
    bookingsByStatus: [
      { status: "Completed", count: 856, percentage: 68.6 },
      { status: "Confirmed", count: 234, percentage: 18.8 },
      { status: "Pending", count: 98, percentage: 7.9 },
      { status: "Cancelled", count: 59, percentage: 4.7 },
    ],
    revenueByMonth: [
      { month: "Jan", revenue: 180000 },
      { month: "Feb", revenue: 220000 },
      { month: "Mar", revenue: 280000 },
      { month: "Apr", revenue: 320000 },
      { month: "May", revenue: 380000 },
      { month: "Jun", revenue: 420000 },
    ],
    topRoutes: [
      { route: "Islamabad → Gilgit", bookings: 234, revenue: 1872000 },
      { route: "Rawalpindi → Skardu", bookings: 189, revenue: 1134000 },
      { route: "Lahore → Hunza", bookings: 156, revenue: 1872000 },
      { route: "Karachi → Gilgit", bookings: 98, revenue: 1176000 },
    ],
    vehicleTypes: [
      { type: "Van", count: 34, bookings: 456 },
      { type: "Bus", count: 28, bookings: 389 },
      { type: "Car", count: 18, bookings: 267 },
      { type: "Coaster", count: 9, bookings: 135 },
    ],
  }

  const StatCard = ({ title, value, growth, icon, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {growth && (
            <p className={`text-sm ${growth > 0 ? "text-green-600" : "text-red-600"}`}>
              {growth > 0 ? "↗" : "↘"} {Math.abs(growth)}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={analyticsData.overview.totalBookings.toLocaleString()}
          growth={analyticsData.overview.bookingGrowth}
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`Rs. ${(analyticsData.overview.totalRevenue / 1000000).toFixed(1)}M`}
          growth={analyticsData.overview.revenueGrowth}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Active Vehicles"
          value={analyticsData.overview.activeVehicles}
          growth={analyticsData.overview.vehicleGrowth}
          icon="🚐"
          color="orange"
        />
        <StatCard
          title="Registered Users"
          value={analyticsData.overview.registeredUsers.toLocaleString()}
          growth={analyticsData.overview.userGrowth}
          icon="👥"
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="space-y-3">
            {analyticsData.revenueByMonth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(item.revenue / 420000) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">Rs. {(item.revenue / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
          <div className="space-y-4">
            {analyticsData.bookingsByStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.status === "Completed"
                        ? "bg-green-500"
                        : item.status === "Confirmed"
                          ? "bg-blue-500"
                          : item.status === "Pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600">{item.status}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{item.count}</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Routes</h3>
          <div className="space-y-3">
            {analyticsData.topRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{route.route}</div>
                  <div className="text-sm text-gray-600">{route.bookings} bookings</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">Rs. {(route.revenue / 1000).toFixed(0)}K</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Types */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Performance</h3>
          <div className="space-y-3">
            {analyticsData.vehicleTypes.map((vehicle, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{vehicle.type}</div>
                  <div className="text-sm text-gray-600">{vehicle.count} vehicles</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-blue-600">{vehicle.bookings} bookings</div>
                  <div className="text-sm text-gray-500">
                    {(vehicle.bookings / vehicle.count).toFixed(1)} avg/vehicle
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
