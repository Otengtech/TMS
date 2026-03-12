import { useState, useEffect } from 'react';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiPhone,
  FiUserCheck,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiSearch,
  FiUser,
  FiX
} from 'react-icons/fi';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Loader, { WaveLoader } from '../components/Common/Loader';

const Drivers = () => {

  const [drivers, setDrivers] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { isSuperAdmin, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    licenseExpiry: '',
    terminalId: '',
    isActive: true
  });

  useEffect(() => {
    fetchDrivers();
    fetchTerminals();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/drivers');
      setDrivers(res.data.drivers);
    } catch {
      toast.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchTerminals = async () => {
    try {
      const res = await api.get('/terminals');
      setTerminals(res.data.terminals);
    } catch {
      toast.error('Failed to fetch terminals');
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      licenseNumber: '',
      licenseExpiry: '',
      terminalId: '',
      isActive: true
    });

    setEditingDriver(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver._id}`, formData);
        toast.success('Driver updated');
      } else {
        await api.post('/drivers', formData);
        toast.success('Driver created');
      }

      setShowModal(false);
      resetForm();
      fetchDrivers();

    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return;

    try {
      await api.delete(`/drivers/${id}`);
      toast.success('Driver deleted');
      fetchDrivers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/drivers/${id}/toggle-status`);
      toast.success('Driver status updated');
      fetchDrivers();
    } catch {
      toast.error('Status change failed');
    }
  };

  const openEditModal = (driver) => {

    setEditingDriver(driver);

    setFormData({
      ...driver,
      terminalId: driver.terminalId?._id || driver.terminalId,
      licenseExpiry: driver.licenseExpiry.split('T')[0]
    });

    setShowModal(true);
  };

  const isLicenseExpired = (date) =>
    new Date(date) < new Date();

  const isLicenseExpiring = (date) => {

    const today = new Date();
    const expiry = new Date(date);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    return days <= 30 && days > 0;
  };

  const getLicenseStatus = (date) => {

    if (isLicenseExpired(date))
      return {
        label: 'Expired',
        color: 'bg-red-100 text-red-800',
        icon: FiAlertCircle
      };

    if (isLicenseExpiring(date))
      return {
        label: 'Expiring Soon',
        color: 'bg-yellow-100 text-yellow-800',
        icon: FiClock
      };

    return {
      label: 'Valid',
      color: 'bg-green-100 text-green-800',
      icon: FiCheckCircle
    };
  };

  const filteredDrivers = drivers.filter((d) => {

    const searchMatch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
          ? d.isActive
          : filterStatus === 'inactive'
            ? !d.isActive
            : filterStatus === 'expired'
              ? isLicenseExpired(d.licenseExpiry)
              : filterStatus === 'expiring'
                ? isLicenseExpiring(d.licenseExpiry)
                : true;

    return searchMatch && statusMatch;
  });

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

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">

        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center text-amber-400">
                <FiUser className="mr-3 text-xl sm:text-2xl lg:text-3xl" />
                Drivers Management
              </h1>

              <p className="text-gray-400 text-sm sm:text-base">
                Manage and monitor all drivers
              </p>
            </div>

            {/* Button */}
            {(isSuperAdmin || isAdmin) && (
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center hover:scale-105 transition text-sm sm:text-base"
              >
                <FiPlus className="mr-2" />
                <span className="hidden sm:inline">Add Driver</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}

          </div>

        </div>
      </div>


      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Search */}
        <div className="relative mb-6 sm:mb-8">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-transparent border border-white text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
          />
        </div>


        {/* Driver Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

          {filteredDrivers.map((driver) => {

            const status = getLicenseStatus(driver.licenseExpiry);
            const StatusIcon = status.icon;

            return (

              <div
                key={driver._id}
                className="bg-gray-200 rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition flex flex-col justify-between"
              >

                {/* Header */}
                <div className="flex justify-between items-start gap-3 mb-4">

                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate">
                      {driver.name}
                    </h3>

                    <p className="text-gray-600 text-sm truncate">
                      {driver.phone}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${driver.isActive
                        ? "bg-amber-400 text-white"
                        : "bg-gray-300 text-gray-700"
                      }`}
                  >
                    {driver.isActive ? "Active" : "Inactive"}
                  </span>

                </div>


                {/* Driver Info */}
                <div className="space-y-1 text-sm">

                  <p>
                    Terminal:
                    <span className="font-medium ml-1">
                      {driver.terminalId?.name || "N/A"}
                    </span>
                  </p>

                  <p>
                    License:
                    <span className="font-medium ml-1">
                      {driver.licenseNumber}
                    </span>
                  </p>

                  <span className={`inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs ${status.color}`}>
                    <StatusIcon className="mr-1" /> {status.label}
                  </span>

                  <p className="text-gray-600 text-sm mt-2">
                    Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
                  </p>

                </div>


                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">

                  <button
                    onClick={() => openEditModal(driver)}
                    className="p-2 bg-amber-400 rounded-full text-white hover:scale-105 transition"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => toggleStatus(driver._id)}
                    className="p-2 bg-amber-400 rounded-full text-white hover:scale-105 transition"
                  >
                    <FiUserCheck />
                  </button>

                  <button
                    onClick={() => handleDelete(driver._id)}
                    className="p-2 bg-amber-400 rounded-full text-white hover:scale-105 transition"
                  >
                    <FiTrash2 />
                  </button>

                </div>

              </div>

            );

          })}

        </div>

      </div>

      {/* Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl">

            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 rounded-t-2xl flex justify-between">

              <h2 className="text-white font-bold">
                {editingDriver ? 'Edit Driver' : 'Add Driver'}
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <FiX className="text-white" />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 grid grid-cols-2 gap-4"
            >

              <input name="name" placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="border p-2 rounded" />

              <input name="phone" placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="border p-2 rounded" />

              <input name="email" placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="border p-2 rounded" />

              <input name="address" placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                className="border p-2 rounded" />

              <input name="licenseNumber" placeholder="License Number"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="border p-2 rounded" />

              <input type="date" name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleInputChange}
                className="border p-2 rounded" />

              {/* Terminal Select */}

              <select
                name="terminalId"
                value={formData.terminalId}
                onChange={handleInputChange}
                className="border p-2 rounded col-span-2"
                required
              >

                <option value="">Select Terminal</option>

                {terminals.map((terminal) => (
                  <option key={terminal._id} value={terminal._id}>
                    {terminal.name} - {terminal.location}
                  </option>
                ))}

              </select>

              <div className="col-span-2 flex justify-end gap-2 mt-4">

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded"
                >
                  {editingDriver ? 'Update' : 'Create'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Drivers;