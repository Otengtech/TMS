import { useState, useEffect } from 'react';
import {
  FiFilter,
  FiCalendar,
  FiDownload,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiUser,
  FiClipboard,
  FiTruck,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { WaveLoader } from '../components/Common/Loader';

const Records = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 20
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, [filters.page, filters.action, filters.startDate, filters.endDate, filters.search]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let query = `?page=${filters.page}&limit=20`;
      if (filters.startDate) query += `&startDate=${filters.startDate}`;
      if (filters.endDate) query += `&endDate=${filters.endDate}`;
      if (filters.action) query += `&action=${filters.action}`;
      if (filters.search) query += `&search=${filters.search}`;

      const response = await api.get(`/records${query}`);
      setRecords(response.data.records || []);
      setPagination({
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1,
        limit: response.data.limit || 20
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
    toast.success('Records refreshed');
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1
    });
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      action: '',
      search: '',
      page: 1
    });
    toast.success('Filters cleared');
  };

  const exportToCSV = () => {
    try {
      const headers = ['Date', 'Time', 'Vehicle', 'Driver', 'Action', 'Notes', 'Recorded By', 'Terminal'];
      const csvData = records.map(record => [
        new Date(record.createdAt).toLocaleDateString(),
        new Date(record.createdAt).toLocaleTimeString(),
        record.vehicleId?.plateNumber || 'N/A',
        record.driverId?.name || 'N/A',
        record.action === 'check-in' ? 'Check In' : 'Check Out',
        record.notes || '-',
        record.createdBy?.name || 'System',
        record.terminalId?.name || 'N/A'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `records_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${records.length} records`);
    } catch (error) {
      toast.error('Failed to export records');
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.action) count++;
    if (filters.search) count++;
    return count;
  };

  const getActionBadge = (action) => {
    if (action === 'check-in') {
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        icon: FiCheckCircle,
        label: 'Check In'
      };
    }
    return {
      bg: 'bg-orange-500/20',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      icon: FiAlertCircle,
      label: 'Check Out'
    };
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

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center text-amber-400">
                <FiClipboard className="mr-3 text-xl sm:text-2xl lg:text-3xl" />
                Activity Records
              </h1>

              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Track and monitor all vehicle activities in real-time
              </p>
            </div>


            {/* Right Section */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">

              {/* Stats Summary */}
              <div className="flex justify-between sm:justify-center items-center gap-4 sm:gap-6 bg-gray-800/50 rounded-2xl px-4 py-3 border border-gray-700 w-full sm:w-auto">

                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-amber-400">
                    {pagination.total}
                  </p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>

                <div className="w-px h-8 bg-gray-700 hidden sm:block"></div>

                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-green-400">
                    {records.filter(r => r.action === "check-in").length}
                  </p>
                  <p className="text-xs text-gray-400">Check-ins</p>
                </div>

                <div className="w-px h-8 bg-gray-700 hidden sm:block"></div>

                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-orange-400">
                    {records.filter(r => r.action === "check-out").length}
                  </p>
                  <p className="text-xs text-gray-400">Check-outs</p>
                </div>

              </div>


              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2">

                {/* Refresh */}
                <button
                  onClick={refreshData}
                  disabled={refreshing}
                  className="p-3 bg-gray-800/50 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 border border-gray-700"
                >
                  <FiRefreshCw
                    className={`text-amber-400 ${refreshing ? "animate-spin" : ""
                      }`}
                  />
                </button>


                {/* Filters */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 sm:px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-xs sm:text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <FiFilter className="mr-1 sm:mr-2 h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline">Filters</span>

                  {getActiveFiltersCount() > 0 && (
                    <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>


                {/* Export */}
                <button
                  onClick={exportToCSV}
                  disabled={records.length === 0}
                  className="flex items-center px-3 sm:px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-xs sm:text-sm text-white hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <FiDownload className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </button>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-gray-800/50 rounded-2xl border border-gray-700 p-6 animate-slideDown backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <FiFilter className="mr-2 text-amber-400" />
                Filter Records
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Search
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Vehicle or driver..."
                    className="pl-10 w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Start Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="pl-10 w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  End Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="pl-10 w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Action Type
                </label>
                <select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                >
                  <option value="">All Actions</option>
                  <option value="check-in">Check In</option>
                  <option value="check-out">Check Out</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2.5 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors border border-gray-600"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Records Table */}
        <div className="bg-gray-800/50 border border-gray-700 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Terminal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Recorded By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {records.map((record, index) => {
                  const actionBadge = getActionBadge(record.action);
                  const ActionIcon = actionBadge.icon;

                  return (
                    <tr
                      key={record._id}
                      onClick={() => setSelectedRecord(selectedRecord === record._id ? null : record._id)}
                      className={`hover:bg-gray-700/50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/50'
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiClock className="h-4 w-4 text-gray-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {new Date(record.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(record.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiTruck className="h-4 w-4 text-amber-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {record.vehicleId?.plateNumber || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400 capitalize">
                              {record.vehicleId?.type || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiUser className="h-4 w-4 text-amber-400 mr-2" />
                          <div>
                            <div className="text-sm text-white">
                              {record.driverId?.name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {record.driverId?.phone || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium border ${actionBadge.bg} ${actionBadge.text} ${actionBadge.border}`}>
                          <ActionIcon className="mr-1.5" size={12} />
                          {actionBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {record.terminalId?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {record.terminalId?.location || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 max-w-xs truncate" title={record.notes}>
                          {record.notes || (
                            <span className="text-gray-500 italic">No notes</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {record.createdBy?.name || 'System'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {record.createdBy?.role || ''}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {records.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiClipboard className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No records found</h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                {getActiveFiltersCount() > 0
                  ? 'Try adjusting your filters to see more results'
                  : 'Records will appear here once vehicle activities are logged'}
              </p>
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/30 transition-colors border border-amber-500/30"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing page <span className="font-medium text-white">{pagination.page}</span> of{' '}
                <span className="font-medium text-white">{pagination.pages}</span>
                {' '}·{' '}
                <span className="text-gray-400">Total {pagination.total} records</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="inline-flex items-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.pages}
                  className="inline-flex items-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <FiChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Record Details Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-2xl transform transition-all animate-slideUp border border-gray-700">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FiInfo className="mr-2" /> Record Details
                  </h2>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {(() => {
                const record = records.find(r => r._id === selectedRecord);
                if (!record) return null;

                return (
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-400 uppercase tracking-wider">Vehicle Information</label>
                          <div className="mt-2 bg-gray-700/50 rounded-xl p-4">
                            <p className="text-white font-medium">{record.vehicleId?.plateNumber || 'N/A'}</p>
                            <p className="text-sm text-gray-400 capitalize">Type: {record.vehicleId?.type || 'Unknown'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-400 uppercase tracking-wider">Driver Information</label>
                          <div className="mt-2 bg-gray-700/50 rounded-xl p-4">
                            <p className="text-white font-medium">{record.driverId?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-400">Phone: {record.driverId?.phone || 'N/A'}</p>
                            <p className="text-sm text-gray-400">License: {record.driverId?.licenseNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-400 uppercase tracking-wider">Action Details</label>
                          <div className="mt-2 bg-gray-700/50 rounded-xl p-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium border ${record.action === 'check-in'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                              }`}>
                              {record.action === 'check-in' ? '✓ Check In' : '↗ Check Out'}
                            </span>
                            <p className="text-sm text-gray-400 mt-2">
                              <FiClock className="inline mr-1" />
                              {new Date(record.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-400 uppercase tracking-wider">Terminal</label>
                          <div className="mt-2 bg-gray-700/50 rounded-xl p-4">
                            <p className="text-white font-medium">{record.terminalId?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-400">{record.terminalId?.location || ''}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="text-xs text-gray-400 uppercase tracking-wider">Notes</label>
                      <div className="mt-2 bg-gray-700/50 rounded-xl p-4">
                        <p className="text-gray-300">{record.notes || 'No notes provided'}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-400">
                        Recorded by: <span className="text-white">{record.createdBy?.name || 'System'}</span>
                        {record.createdBy?.role && (
                          <span className="text-gray-400 ml-1">({record.createdBy.role})</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
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
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Records;