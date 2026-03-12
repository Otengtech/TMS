import { useState, useEffect } from "react";
import {
  FiTruck,
  FiUserCheck,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
  FiActivity,
  FiPieChart,
  FiBarChart2,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { WaveLoader } from "../components/Common/Loader";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [terminalCount, setTerminalCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [activeDriverCount, setActiveDriverCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [recentRecords, setRecentRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const terminalsRes = await api.get("/terminals");
      const terminals = terminalsRes.data.terminals || [];
      setTerminalCount(terminals.length);

      const vehiclesRes = await api.get("/vehicles");
      const vehicles = vehiclesRes.data.vehicles || [];
      setVehicleCount(vehicles.length);

      const driversRes = await api.get("/drivers");
      const drivers = driversRes.data.drivers || [];
      setDriverCount(drivers.length);

      const activeDrivers = drivers.filter((d) => d.isActive).length;
      setActiveDriverCount(activeDrivers);

      const today = new Date().toISOString().split("T")[0];
      const recordsRes = await api.get(`/records?startDate=${today}`);
      const records = recordsRes.data.records || [];
      setCheckedInCount(records.length);

      const recentRes = await api.get("/records?limit=5");
      setRecentRecords(recentRes.data.records || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  /* -------------------- Charts -------------------- */

  const weeklyData = [
    { day: "Mon", checkIns: 4, checkOuts: 3 },
    { day: "Tue", checkIns: 6, checkOuts: 5 },
    { day: "Wed", checkIns: 8, checkOuts: 7 },
    { day: "Thu", checkIns: 5, checkOuts: 6 },
    { day: "Fri", checkIns: 7, checkOuts: 8 },
    { day: "Sat", checkIns: 3, checkOuts: 4 },
    { day: "Sun", checkIns: 2, checkOuts: 2 },
  ];

  const chartData = weeklyData;

  const pieData = [
    { name: "Buses", value: 45, color: "#f59e0b" },
    { name: "Taxis", value: 30, color: "#000000" },
    { name: "Trucks", value: 15, color: "#6b7280" },
    { name: "Private", value: 10, color: "#9ca3af" },
  ];

  /* -------------------- Stats Cards -------------------- */

  const statsCards = [
    {
      title: "Total Terminals",
      value: terminalCount,
      icon: FiTruck,
      trend: "+2",
      trendUp: true,
      gradient: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      progressValue: terminalCount,
    },
    {
      title: "Total Vehicles",
      value: vehicleCount,
      icon: FiTruck,
      trend: "+5",
      trendUp: true,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      progressValue: vehicleCount,
    },
    {
      title: "Active Drivers",
      value: activeDriverCount,
      icon: FiUserCheck,
      trend: `${activeDriverCount}`,
      trendUp: true,
      gradient: "from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      progressValue: activeDriverCount,
    },
  ];

  /* -------------------- Loading -------------------- */

  if (loading) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-gray-900">
        <WaveLoader />
      </div>
    );
  }

  /* -------------------- Error -------------------- */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <FiAlertCircle className="text-red-500 text-5xl mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  /* -------------------- Dashboard -------------------- */

  return (
    <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        {/* Left Section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400">
            Dashboard
          </h1>

          <p className="text-gray-400 text-sm sm:text-base">
            Welcome back, {user?.name || "Admin"}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          {/* Logout */}
          <button
            onClick={logout}
            className="text-xs cursor-pointer hover:scale-105 transition-all duration-200 text-white bgColor px-4 sm:px-6 py-2 rounded-full"
          >
            LOGOUT
          </button>

          {/* Date */}
          <div className="text-xs text-gray-900 bg-amber-400 px-4 sm:px-6 py-2 rounded-full whitespace-nowrap">
            {formatDate(currentTime)}
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 text-amber-400 hover:bg-amber-400 hover:text-black rounded-lg transition-colors"
          >
            <FiRefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white/10 cursor-pointer hover:scale-105 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm flex flex-row-reverse items-center gap-4 rounded-2xl shadow p-6 hover:shadow-lg"          >
            {/* Icon */}
            <div className="p-5 rounded-full bg-amber-400">
              <stat.icon className={`text-2xl text-gray-900`} />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-gray-200 text-lg">{stat.title}</h3>
              <h1></h1>
              <p className="text-3xl text-amber-400 font-bold">{stat.value}</p>
              {/* <div className="flex items-center text-amber-400 text-sm gap-1">
                {stat.trendUp ? <FiArrowUp /> : <FiArrowDown />}
                {stat.trend}
              </div> */}



              {/* <div className="mt-3 h-2 bg-gray-900 rounded-full">
                <div
                  className={`h-full bg-gradient-to-r ${stat.gradient}`}
                  style={{ width: `${stat.progressValue}%` }}
                />
              </div> */}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity */}

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
          <div className="flex items-center mb-4">
            <FiActivity className="mr-2 text-amber-500" />
            <h2 className="font-semibold">Activity Overview</h2>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />

                <Area
                  dataKey="checkIns"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                />

                <Area
                  dataKey="checkOuts"
                  stroke="#000"
                  fill="#000"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie */}

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center mb-4">
            <FiPieChart className="mr-2 text-purple-500" />
            <h2 className="font-semibold">Vehicle Distribution</h2>
          </div>

          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={80}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold flex items-center">
            <FiClock className="mr-2 text-green-500" />
            Recent Activity
          </h2>
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Vehicle</th>
              <th className="p-4 text-left">Driver</th>
              <th className="p-4 text-left">Action</th>
              <th className="p-4 text-left">Time</th>
            </tr>
          </thead>

          <tbody>
            {recentRecords.map((record) => (
              <tr key={record._id} className="border-t">
                <td className="p-4">
                  {record.vehicleId?.plateNumber || "N/A"}
                </td>

                <td className="p-4">
                  {record.driverId?.name || "N/A"}
                </td>

                <td className="p-4">
                  {record.action === "check-in"
                    ? "Check In"
                    : "Check Out"}
                </td>

                <td className="p-4">
                  {new Date(record.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {recentRecords.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;