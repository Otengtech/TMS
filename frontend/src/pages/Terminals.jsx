import { useState, useEffect } from 'react';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMapPin,
  FiTruck,
  FiUsers,
  FiGrid,
  FiList,
  FiSearch,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiMoreVertical,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Loader, { WaveLoader } from '../components/Common/Loader';

const Terminals = () => {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerminals, setFilteredTerminals] = useState([]);
  const [showStats, setShowStats] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: ''
  });

  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    fetchTerminals();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = terminals.filter(terminal =>
        terminal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        terminal.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTerminals(filtered);
    } else {
      setFilteredTerminals(terminals);
    }
  }, [searchTerm, terminals]);

  const fetchTerminals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/terminals');
      setTerminals(response.data.terminals);
    } catch (error) {
      toast.error('Failed to fetch terminals');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTerminal) {
        await api.put(`/terminals/${editingTerminal._id}`, formData);
        toast.success('Terminal updated successfully');
      } else {
        await api.post('/terminals', formData);
        toast.success('Terminal created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchTerminals();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this terminal?')) return;

    try {
      await api.delete(`/terminals/${id}`);
      toast.success('Terminal deleted successfully');
      fetchTerminals();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', capacity: '' });
    setEditingTerminal(null);
  };

  const openEditModal = (terminal) => {
    setEditingTerminal(terminal);
    setFormData({
      name: terminal.name,
      location: terminal.location,
      capacity: terminal.capacity
    });
    setShowModal(true);
  };

  const toggleStats = (id) => {
    setShowStats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getOccupancyColor = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (percentage >= 70) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    if (percentage >= 50) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-green-500 to-green-600';
  };

  const getStatusBadge = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) {
      return {
        text: 'Critical',
        color: 'bg-red-100 text-red-800 border border-red-200',
        icon: FiAlertCircle
      };
    }
    if (percentage >= 70) {
      return {
        text: 'Warning',
        color: 'bg-orange-100 text-orange-800 border border-orange-200',
        icon: FiAlertCircle
      };
    }
    if (percentage >= 50) {
      return {
        text: 'Moderate',
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        icon: FiAlertCircle
      };
    }
    return {
      text: 'Good',
      color: 'bg-green-100 text-green-800 border border-green-200',
      icon: FiCheckCircle
    };
  };

  const calculateStats = () => {
    const totalCapacity = terminals.reduce((sum, t) => sum + t.capacity, 0);
    const totalVehicles = terminals.reduce((sum, t) => sum + (t.currentVehicles || 0), 0);
    const totalDrivers = terminals.reduce((sum, t) => sum + (t.drivers?.length || 0), 0);
    const avgOccupancy = totalCapacity ? Math.round((totalVehicles / totalCapacity) * 100) : 0;

    return { totalCapacity, totalVehicles, totalDrivers, avgOccupancy };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 rounded-full"></div>
          <WaveLoader />
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full filter blur-3xl opacity-20 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600 rounded-full filter blur-3xl opacity-10 transform -translate-x-48 translate-y-48"></div>

        <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              {/* Title Section */}
              <div className="animate-fadeIn">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300 flex items-center">
                  <FiMapPin className="mr-3 text-amber-400 text-xl sm:text-2xl lg:text-3xl" />
                  Terminals Management
                </h1>

                <p className="mt-2 text-gray-400 text-sm sm:text-md">
                  Monitor and manage all your terminals in one place
                </p>
              </div>

              {/* Right Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

                {/* Stats Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-4 sm:px-6 py-3 border border-white/20 w-full sm:w-auto">

                  <div className="flex justify-between sm:justify-center items-center gap-4 sm:gap-6">

                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold text-amber-400">
                        {terminals.length}
                      </p>
                      <p className="text-xs text-gray-400">Total Terminals</p>
                    </div>

                    <div className="w-px h-8 bg-white/20 hidden sm:block"></div>

                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold text-amber-400">
                        {stats.avgOccupancy}%
                      </p>
                      <p className="text-xs text-gray-400">Avg Occupancy</p>
                    </div>

                  </div>

                </div>

                {/* Add Terminal Button */}
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
                    className="group bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 sm:px-6 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25 flex items-center justify-center text-sm sm:text-base"
                  >
                    <FiPlus className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="hidden sm:inline">Add Terminal</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                )}

              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Controls */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              placeholder="Search terminals by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 text-white bg-transparent border border-white rounded-full focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent shadow-sm hover:shadow-md transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all"
              >
                <FiX size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 bg-white p-1 rounded-full shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-full transition-all ${viewMode === 'grid'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-full transition-all ${viewMode === 'list'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <FiList size={20} />
            </button>
          </div>
        </div>

        {/* Terminals Display */}
        {filteredTerminals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMapPin className="h-12 w-12 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No terminals found</h3>
            <p className="text-gray-500 mb-8">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first terminal'}
            </p>
            {isSuperAdmin && !searchTerm && (
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <FiPlus className="mr-2" /> Add Your First Terminal
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View with Enhanced Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTerminals.map((terminal) => {
              const status = getStatusBadge(terminal.currentVehicles || 0, terminal.capacity);
              const StatusIcon = status.icon;
              const occupancyPercentage = Math.round(((terminal.currentVehicles || 0) / terminal.capacity) * 100);
              const showExtraStats = showStats[terminal._id];

              return (
                <div
                  key={terminal._id}
                  className="group bg-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-amber-200 animate-fadeInUp"
                >
                  {/* Card Header with Gradient */}
                  <div className="bg-gray-200 px-6 py-4 border-b border-gray-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <FiTruck className="h-4 w-4 text-black" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-md">{terminal.name}</h3>
                          <div className="flex items-center text-gray-500 text-sm">
                            <FiMapPin className="mr-1" size={12} />
                            {terminal.location}
                          </div>
                        </div>
                      </div>

                      {isSuperAdmin && (
                        <div className="relative">
                          <button
                            onClick={() => toggleStats(terminal._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FiMoreVertical className="text-gray-500" />
                          </button>

                          {showExtraStats && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-100 rounded-lg z-10 animate-fadeIn">
                              <button
                                onClick={() => openEditModal(terminal)}
                                className="w-full px-4 py-2 text-sm text-left text-gray-100 hover:bg-gray-800 flex items-center transition-colors"
                              >
                                <FiEdit2 className="mr-2" size={16} />
                                Edit Terminal
                              </button>
                              <button
                                onClick={() => handleDelete(terminal._id)}
                                className="w-full px-4 py-2 text-sm text-left text-amber-500 hover:bg-gray-800 flex items-center transition-colors"
                              >
                                <FiTrash2 className="mr-2" size={16} />
                                Delete Terminal
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className=" rounded-xl">
                        <div className="flex items-center text-gray-800 mb-2">
                          <FiTruck className="mr-2 text-amber-500" />
                          <span className="text-sm">Vehicles</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {terminal.currentVehicles || 0}
                          <span className="text-sm font-normal text-gray-800 ml-1">/{terminal.capacity}</span>
                        </p>
                      </div>

                      <div className="">
                        <div className="flex items-center text-gray-800 mb-2">
                          <FiUsers className="mr-2 text-amber-500" />
                          <span className="text-sm">Drivers</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {terminal.drivers?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center bg-amber-400`}>
                        <StatusIcon className="mr-2" size={16} />
                        {status.text}
                      </span>
                      <span className="text-sm text-gray-800">
                        {occupancyPercentage}% Occupied
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-gray-800">
                            Occupancy Rate
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-gray-600">
                            {occupancyPercentage}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-3 bg-gray-300 rounded-xl">
                        <div
                          style={{ width: `${occupancyPercentage}%` }}
                          className={`h-3 rounded-xl transition-all duration-1000 ease-out ${getOccupancyColor(
                            terminal.currentVehicles || 0,
                            terminal.capacity
                          )}`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Enhanced List View */
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-white">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Terminal
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Occupancy
                  </th>
                  {isSuperAdmin && (
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTerminals.map((terminal, index) => {
                  const occupancyPercentage = Math.round(((terminal.currentVehicles || 0) / terminal.capacity) * 100);
                  const status = getStatusBadge(terminal.currentVehicles || 0, terminal.capacity);
                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={terminal._id}
                      className="hover:bg-amber-50/50 transition-colors group animate-fadeInUp"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                            <FiTruck className="h-4 w-4 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{terminal.name}</div>
                            <div className="text-xs text-gray-500">ID: {terminal._id.slice(-8).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMapPin className="mr-2 text-amber-500" size={14} />
                          {terminal.location}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{terminal.capacity} vehicles</div>
                        <div className="text-xs text-gray-500">Current: {terminal.currentVehicles || 0}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-4 py-2 rounded-full text-xs font-medium inline-flex items-center text-white bg-amber-500`}>
                          <StatusIcon className="mr-2" size={14} />
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-3">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${getOccupancyColor(
                                terminal.currentVehicles || 0,
                                terminal.capacity
                              )}`}
                              style={{ width: `${occupancyPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{occupancyPercentage}%</span>
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="pl-1 md:pl-3 py-5">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(terminal)}
                              className="p-2 text-white hover:text-white bg-amber-400 hover:bg-amber-500 rounded-full transition-all"
                              title="Edit terminal"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(terminal._id)}
                              className="p-2 text-white hover:text-white bg-amber-400 hover:bg-amber-500 rounded-full transition-all"
                              title="Delete terminal"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md transform transition-all animate-slideUp">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center">
                {editingTerminal ? (
                  <>
                    <FiEdit2 className="mr-2" /> Edit Terminal
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2" /> Add New Terminal
                  </>
                )}
              </h2>
              <p className="text-amber-100 text-sm mt-1">
                {editingTerminal ? 'Update the terminal details below' : 'Fill in the information for the new terminal'}
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terminal Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300"
                    placeholder="e.g., Accra Central Terminal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300"
                    placeholder="e.g., Accra, Ghana"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (Number of Vehicles)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300"
                    placeholder="e.g., 100"
                    min="1"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Maximum number of vehicles that can be parked at this terminal
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all hover:border-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
                >
                  {editingTerminal ? 'Update Terminal' : 'Create Terminal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add these styles to your global CSS or create a style tag */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Terminals;