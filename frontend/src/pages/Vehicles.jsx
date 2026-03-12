import { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiSearch,
  FiUser,
  FiX,
  FiAlertCircle,
  FiFilter,
  FiRefreshCw,
  FiMapPin // Add this import
} from "react-icons/fi";

import { FaBus, FaTaxi, FaTruck as FaTruckIcon, FaCar } from "react-icons/fa";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { WaveLoader } from "../components/Common/Loader";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [terminals, setTerminals] = useState([]); // Add terminals state
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkAction, setCheckAction] = useState("check-in");
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const { isSuperAdmin, isAdmin } = useAuth();
  const canManage = isSuperAdmin || isAdmin;

  const [formData, setFormData] = useState({
    plateNumber: "",
    type: "bus",
    driverId: "",
    vehicleId: "",
    terminalId: "", // Keep this
    notes: ""
  });

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    fetchTerminals(); // Add this
  }, []);

  const fetchTerminals = async () => {
    try {
      const res = await api.get("/terminals");
      setTerminals(res.data.terminals || []);
    } catch (error) {
      toast.error("Failed to fetch terminals");
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles");
      setVehicles(res.data.vehicles || []);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get("/drivers?isActive=true");
      setDrivers(res.data.drivers || []);
    } catch (error) {
      toast.error("Failed to fetch drivers");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      plateNumber: "",
      type: "bus",
      driverId: "",
      vehicleId: "",
      terminalId: "", // Keep this
      notes: ""
    });
    setEditingVehicle(null);
  };

  const validateForm = () => {
    if (!formData.plateNumber?.trim()) {
      toast.error("Plate number is required");
      return false;
    }
    if (!formData.type) {
      toast.error("Vehicle type is required");
      return false;
    }
    // Add terminal validation for new vehicles
    if (!editingVehicle && !formData.terminalId) {
      toast.error("Terminal assignment is required");
      return false;
    }
    return true;
  };

  const validateCheckForm = () => {
    if (!formData.vehicleId) {
      toast.error("Please select a vehicle");
      return false;
    }
    if (checkAction === "check-in" && !formData.driverId) {
      toast.error("Please select a driver for check-in");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingVehicle) {
        // For edits, only send the fields that can be updated
        const updateData = {
          plateNumber: formData.plateNumber,
          type: formData.type,
          driverId: formData.driverId || null,
          // terminalId might not be editable after creation, check your backend
        };
        await api.put(`/vehicles/${editingVehicle._id}`, updateData);
        toast.success("Vehicle updated successfully");
      } else {
        // For new vehicles, send all required fields including terminalId
        await api.post("/vehicles", formData);
        toast.success("Vehicle created successfully");
      }

      setShowModal(false);
      resetForm();
      await fetchVehicles();
      await fetchDrivers();

    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  const handleCheck = async (e) => {
    e.preventDefault();

    if (!validateCheckForm()) return;

    try {
      const endpoint = checkAction === "check-in"
        ? "/vehicles/check-in"
        : "/vehicles/check-out";

      const payload = {
        vehicleId: formData.vehicleId,
        ...(checkAction === "check-in" && { driverId: formData.driverId }),
        ...(formData.notes && { notes: formData.notes })
      };

      await api.post(endpoint, payload);

      toast.success(`Vehicle ${checkAction === "check-in" ? "checked in" : "checked out"} successfully`);

      setShowCheckModal(false);
      resetForm();
      await fetchVehicles();
      await fetchDrivers();

    } catch (error) {
      toast.error(error.response?.data?.error || `Vehicle ${checkAction} failed`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await api.delete(`/vehicles/${id}`);
      toast.success("Vehicle deleted successfully");
      await fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.error || "Delete failed");
    }
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plateNumber: vehicle.plateNumber || "",
      type: vehicle.type || "bus",
      driverId: vehicle.driverId?._id || "",
      vehicleId: vehicle._id,
      terminalId: vehicle.terminalId?._id || vehicle.terminalId || "", // Handle terminal for edits
      notes: ""
    });
    setShowModal(true);
  };

  const openCheckModal = (action, vehicle = null) => {
    if (action === "check-in" && vehicle?.status === "checked-in") {
      toast.error("Vehicle is already checked in");
      return;
    }
    if (action === "check-out" && vehicle?.status === "checked-out") {
      toast.error("Vehicle is already checked out");
      return;
    }

    setCheckAction(action);
    setFormData({
      vehicleId: vehicle?._id || "",
      driverId: vehicle?.driverId?._id || "",
      notes: ""
    });
    setShowCheckModal(true);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchVehicles(), fetchDrivers(), fetchTerminals()]);
    setRefreshing(false);
    toast.success("Data refreshed");
  };

  const getVehicleIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "bus":
        return <FaBus className="text-amber-500" />;
      case "taxi":
        return <FaTaxi className="text-amber-500" />;
      case "truck":
        return <FaTruckIcon className="text-amber-500" />;
      default:
        return <FaCar className="text-amber-500" />;
    }
  };

  const getAvailableDrivers = () => {
    return drivers.filter(driver => {
      const isDriverInUse = vehicles.some(v =>
        v.driverId?._id === driver._id && v.status === "checked-in"
      );
      return !isDriverInUse;
    });
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && v.status === filterStatus;
  });

  const stats = {
    total: vehicles.length,
    checkedIn: vehicles.filter(v => v.status === "checked-in").length,
    checkedOut: vehicles.filter(v => v.status === "checked-out").length
  };

  if (loading) {
    return (
      <div className="flex h-[90vh] items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <WaveLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center text-amber-400">
                <FiTruck className="mr-3 text-xl sm:text-2xl lg:text-3xl" />
                Vehicles Management
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Manage and monitor all vehicles in the fleet
              </p>
            </div>

            {/* Right Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Stats */}
              <div className="flex justify-between sm:justify-center items-center gap-4 sm:gap-6 bg-gray-800/50 rounded-2xl px-4 py-3 w-full sm:w-auto">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-amber-400">{stats.total}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
                <div className="w-px h-8 bg-gray-700 hidden sm:block"></div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.checkedIn}</p>
                  <p className="text-xs text-gray-400">Checked In</p>
                </div>
                <div className="w-px h-8 bg-gray-700 hidden sm:block"></div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-400">{stats.checkedOut}</p>
                  <p className="text-xs text-gray-400">Checked Out</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshData}
                  disabled={refreshing}
                  className="p-3 bg-gray-800/50 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw className={`text-amber-400 ${refreshing ? "animate-spin" : ""}`} />
                </button>

                {canManage && (
                  <button
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center hover:scale-105 transition-transform hover:shadow-lg hover:shadow-amber-500/25 text-sm sm:text-base"
                  >
                    <FiPlus className="mr-2" />
                    <span className="hidden sm:inline">Add Vehicle</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plate number or driver name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-xl transition-colors ${filterStatus === "all"
                ? "bg-amber-500 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("checked-in")}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${filterStatus === "checked-in"
                ? "bg-green-500 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700"
                }`}
            >
              <FiCheckCircle /> Checked In
            </button>
            <button
              onClick={() => setFilterStatus("checked-out")}
              className={`px-4 py-2 rounded-xl transition-colors ${filterStatus === "checked-out"
                ? "bg-gray-600 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700"
                }`}
            >
              Checked Out
            </button>
          </div>
        </div>

        {/* Vehicle Cards */}
        {filteredVehicles.length === 0 ? (
          <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-gray-700">
            <FiTruck className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-300">No vehicles found</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm ? "Try adjusting your search" : "Get started by adding your first vehicle"}
            </p>
            {canManage && !searchTerm && (
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 rounded-xl inline-flex items-center hover:scale-105 transition-transform"
              >
                <FiPlus className="mr-2" /> Add Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-gray-800/50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-[1.02] border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getVehicleIcon(vehicle.type)}
                      <h3 className="font-bold text-lg text-white">
                        {vehicle.plateNumber || "N/A"}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm capitalize">
                      Type: {vehicle.type || "Unknown"}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1.5 text-xs rounded-full font-medium flex items-center gap-1 ${vehicle.status === "checked-in"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-gray-600/20 text-gray-400 border border-gray-500/30"
                      }`}
                  >
                    {vehicle.status === "checked-in" ? (
                      <>
                        <FiCheckCircle className="text-green-400" /> Checked In
                      </>
                    ) : (
                      <>
                        <FiClock className="text-gray-400" /> Checked Out
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-300 flex items-center">
                    <FiUser className="mr-2 text-amber-400" />
                    Driver:
                    <span className="font-medium ml-1 text-white">
                      {vehicle.driverId?.name || "Not Assigned"}
                    </span>
                  </p>

                  {/* Display Terminal Information */}
                  <p className="text-sm text-gray-300 flex items-center">
                    <FiMapPin className="mr-2 text-amber-400" />
                    Terminal:
                    <span className="font-medium ml-1 text-white">
                      {vehicle.terminalId?.name || "Not Assigned"}
                    </span>
                  </p>

                  {vehicle.checkInTime && (
                    <p className="text-sm text-gray-400">
                      Check-in: {new Date(vehicle.checkInTime).toLocaleString()}
                    </p>
                  )}

                  {vehicle.checkOutTime && (
                    <p className="text-sm text-gray-400">
                      Check-out: {new Date(vehicle.checkOutTime).toLocaleString()}
                    </p>
                  )}
                </div>

                {canManage && (
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700">
                    {vehicle.status !== "checked-in" && (
                      <button
                        onClick={() => openCheckModal("check-in", vehicle)}
                        className="p-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors"
                        title="Check In"
                      >
                        <FiCheckCircle size={18} />
                      </button>
                    )}

                    {vehicle.status === "checked-in" && (
                      <button
                        onClick={() => openCheckModal("check-out", vehicle)}
                        className="p-2 bg-orange-500/20 text-orange-400 rounded-xl hover:bg-orange-500/30 transition-colors"
                        title="Check Out"
                      >
                        <FiClock size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(vehicle)}
                      className="p-2 bg-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/30 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(vehicle._id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Vehicle Modal */}
      {/* Add/Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md transform transition-all animate-slideUp border border-gray-700">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center">
                {editingVehicle ? <FiEdit2 className="mr-2" /> : <FiPlus className="mr-2" />}
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
              <p className="text-amber-100 text-sm mt-1">
                {editingVehicle ? "Update the vehicle details below" : "Enter the vehicle information"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    placeholder="e.g., GT-1234-20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    required
                  >
                    <option value="bus">Bus</option>
                    <option value="taxi">Taxi</option>
                    <option value="truck">Truck</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                {/* Terminal Selection - Required for new vehicles */}
                {!editingVehicle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assigned Terminal <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="terminalId"
                      value={formData.terminalId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                      required
                    >
                      <option value="">Select a Terminal</option>
                      {terminals.map((terminal) => (
                        <option key={terminal._id} value={terminal._id}>
                          {terminal.name} - {terminal.location}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Show terminal for editing but make it read-only */}
                {editingVehicle && editingVehicle.terminalId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Terminal
                    </label>
                    <input
                      type="text"
                      value={editingVehicle.terminalId?.name || "Not available"}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white opacity-75 cursor-not-allowed"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Terminal cannot be changed after creation</p>
                  </div>
                )}

                {/* Driver Selection - Optional */}
                {!editingVehicle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assign Driver (Optional)
                    </label>
                    <select
                      name="driverId"
                      value={formData.driverId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    >
                      <option value="">Select a driver</option>
                      {drivers.map((driver) => (
                        <option key={driver._id} value={driver._id}>
                          {driver.name} - {driver.licenseNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-600 rounded-xl text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105"
                >
                  {editingVehicle ? "Update Vehicle" : "Create Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check In/Out Modal - Keep as is */}
      {showCheckModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Check modal content - unchanged */}
          <div className="bg-gray-800 rounded-2xl w-full max-w-md transform transition-all animate-slideUp border border-gray-700">
            <div className={`px-6 py-5 rounded-t-2xl ${checkAction === "check-in"
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : "bg-gradient-to-r from-orange-500 to-orange-600"
              }`}>
              <h2 className="text-xl font-bold text-white flex items-center">
                {checkAction === "check-in" ? <FiCheckCircle className="mr-2" /> : <FiClock className="mr-2" />}
                Vehicle {checkAction === "check-in" ? "Check In" : "Check Out"}
              </h2>
            </div>

            <form onSubmit={handleCheck} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Vehicle *
                  </label>
                  <select
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    required
                  >
                    <option value="">Choose a vehicle</option>
                    {vehicles
                      .filter(v => checkAction === "check-in"
                        ? v.status === "checked-out"
                        : v.status === "checked-in"
                      )
                      .map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.plateNumber} - {vehicle.type} ({vehicle.terminalId?.name || "No Terminal"})
                        </option>
                      ))}
                  </select>
                </div>

                {checkAction === "check-in" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assign Driver *
                    </label>
                    <select
                      name="driverId"
                      value={formData.driverId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                      required
                    >
                      <option value="">Select a driver</option>
                      {getAvailableDrivers().map((driver) => (
                        <option key={driver._id} value={driver._id}>
                          {driver.name} - {driver.licenseNumber} ({driver.terminalId?.name || "No Terminal"})
                        </option>
                      ))}
                    </select>
                    {getAvailableDrivers().length === 0 && (
                      <p className="mt-2 text-sm text-orange-400 flex items-center">
                        <FiAlertCircle className="mr-1" /> No available drivers
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    placeholder="Add any notes..."
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-600 rounded-xl text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-xl text-white font-medium transition-all transform hover:scale-105 ${checkAction === "check-in"
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    }`}
                >
                  Confirm {checkAction === "check-in" ? "Check In" : "Check Out"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Vehicles;