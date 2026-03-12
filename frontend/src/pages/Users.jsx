import { useState, useEffect } from 'react';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiUser,
  FiMail,
  FiKey,
  FiMapPin,
  FiSearch,
  FiX,
  FiRefreshCw,
  FiShield,
  FiUserCheck,
  FiCalendar,
  FiMoreVertical,
  FiAlertCircle
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { WaveLoader } from '../components/Common/Loader';

/* ---------- Main Component ---------- */

const Users = () => {
  const [users, setUsers] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(null);
  const [filterRole, setFilterRole] = useState('all');

  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    terminalId: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchTerminals();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTerminals = async () => {
    try {
      const response = await api.get('/terminals');
      setTerminals(response.data.terminals || []);
    } catch (error) {
      console.error('Failed to fetch terminals:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchTerminals()]);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.name?.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!editingUser && !formData.password?.trim()) {
      toast.error('Password is required for new users');
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.put(`/users/${editingUser._id}`, updateData);
        toast.success('User updated successfully');
      } else {
        await api.post('/auth/register', formData);
        toast.success('User created successfully');
      }

      closeModal();
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id, role, email) => {
    if (role === 'superadmin') {
      toast.error('Super Admin cannot be deleted');
      return;
    }

    if (email === currentUser?.email) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'admin',
      terminalId: user.terminalId?._id || user.terminalId || ''
    });
    setShowModal(true);
    setShowUserMenu(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'admin', terminalId: '' });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return {
          bg: 'bg-purple-500/20',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          icon: FiShield,
          label: 'Super Admin'
        };
      case 'admin':
        return {
          bg: 'bg-amber-500/20',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          icon: FiUserCheck,
          label: 'Admin'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          border: 'border-gray-500/30',
          icon: FiUser,
          label: role
        };
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterRole === 'all') return matchesSearch;
    return matchesSearch && user.role === filterRole;
  });

  const stats = {
    total: users.length,
    superAdmins: users.filter(u => u.role === 'superadmin').length,
    admins: users.filter(u => u.role === 'admin').length
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
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            {/* Title Section */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center text-amber-400 truncate">
                <FiUser className="mr-2 sm:mr-3 flex-shrink-0" />
                <span className="truncate">User Management</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-1 truncate">
                Manage system users and their permissions
              </p>
            </div>

            {/* Actions Section - Stack on mobile, wrap on tablet */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Stats - Full width on mobile, inline on larger screens */}
              <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3 bg-gray-800/50 rounded-2xl px-3 sm:px-4 py-2 border border-gray-700 w-full sm:w-auto">
                <div className="text-center sm:px-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-400">{stats.total}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">Total</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-700"></div>
                <div className="text-center sm:px-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400">{stats.superAdmins}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate leading-tight">
                    <span className="hidden sm:inline">Super </span>Admins
                  </p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-700"></div>
                <div className="text-center sm:px-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-400">{stats.admins}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">Admins</p>
                </div>
              </div>

              {/* Action Buttons - Horizontal scroll on mobile if needed */}
              <div className="flex items-center gap-2 sm:gap-3 pb-1 sm:pb-0">
                <button
                  onClick={refreshData}
                  disabled={refreshing}
                  className="flex-shrink-0 p-2.5 sm:p-3 bg-gray-800/50 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 border border-gray-700"
                  aria-label="Refresh data"
                >
                  <FiRefreshCw className={`text-amber-400 w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? "animate-spin" : ""}`} />
                </button>

                <button
                  onClick={() => { closeModal(); setShowModal(true); }}
                  className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center hover:scale-105 transition-transform hover:shadow-lg hover:shadow-amber-500/25 text-sm sm:text-base whitespace-nowrap"
                >
                  <FiPlus className="mr-1.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Add User</span>
                  <span className="xs:hidden">Add</span>
                </button>
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
              placeholder="Search users by name, email or role..."
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
              onClick={() => setFilterRole("all")}
              className={`px-4 py-2 rounded-xl transition-colors ${filterRole === "all"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700"
                }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilterRole("superadmin")}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${filterRole === "superadmin"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700"
                }`}
            >
              <FiShield /> Super Admins
            </button>
            <button
              onClick={() => setFilterRole("admin")}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${filterRole === "admin"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700"
                }`}
            >
              <FiUserCheck /> Admins
            </button>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-gray-700">
            <FiUser className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-300">No users found</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm ? "Try adjusting your search" : "Get started by adding your first user"}
            </p>
            <button
              onClick={() => { closeModal(); setShowModal(true); }}
              className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 rounded-xl inline-flex items-center hover:scale-105 transition-transform"
            >
              <FiPlus className="mr-2" /> Add User
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const roleBadge = getRoleBadge(user.role);
              const RoleIcon = roleBadge.icon;
              const isCurrentUser = user.email === currentUser?.email;

              return (
                <div
                  key={user._id}
                  className="bg-gray-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border border-gray-700 relative"
                >
                  {/* User Menu */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setShowUserMenu(showUserMenu === user._id ? null : user._id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <FiMoreVertical className="text-gray-400" />
                    </button>

                    {showUserMenu === user._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-2 z-10">
                        <button
                          onClick={() => openEditModal(user)}
                          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-amber-400 flex items-center transition-colors"
                        >
                          <FiEdit2 className="mr-2" size={16} />
                          Edit User
                        </button>
                        {user.role !== 'superadmin' && !isCurrentUser && (
                          <button
                            onClick={() => handleDelete(user._id, user.role, user.email)}
                            className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center transition-colors"
                          >
                            <FiTrash2 className="mr-2" size={16} />
                            Delete User
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* User Icon and Role */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <FiUser className="h-8 w-8 text-white" />
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                        <RoleIcon size={14} />
                        {roleBadge.label}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                        <div className="flex items-center text-gray-400 text-sm">
                          <FiMail className="mr-2 text-amber-400" size={14} />
                          {user.email}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-400">
                        <FiMapPin className="mr-2 text-amber-400" size={14} />
                        {user.terminalId?.name || 'All Terminals'}
                        {user.terminalId && (
                          <span className="ml-1 text-gray-500">
                            ({user.terminalId.location})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-400">
                        <FiCalendar className="mr-2 text-amber-400" size={14} />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Current User Indicator */}
                    {isCurrentUser && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <span className="text-xs text-amber-400 flex items-center">
                          <FiUserCheck className="mr-1" /> Current User
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md transform transition-all animate-slideUp border border-gray-700">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center">
                {editingUser ? <FiEdit2 className="mr-2" /> : <FiPlus className="mr-2" />}
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <p className="text-amber-100 text-sm mt-1">
                {editingUser ? 'Update user information below' : 'Enter the details for the new user'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </label>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                      placeholder="••••••••"
                      minLength="6"
                      required={!editingUser}
                    />
                  </div>
                  {formData.password && formData.password.length < 6 && (
                    <p className="mt-1 text-xs text-orange-400 flex items-center">
                      <FiAlertCircle className="mr-1" /> Minimum 6 characters
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                {formData.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assigned Terminal
                    </label>
                    <select
                      name="terminalId"
                      value={formData.terminalId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    >
                      <option value="">All Terminals (Full Access)</option>
                      {terminals.map((terminal) => (
                        <option key={terminal._id} value={terminal._id}>
                          {terminal.name} - {terminal.location}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Select a terminal to restrict access, or leave empty for full access
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-600 rounded-xl text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105"
                >
                  {editingUser ? 'Update User' : 'Create User'}
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

export default Users;