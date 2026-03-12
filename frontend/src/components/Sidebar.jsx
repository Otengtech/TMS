import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiX,
  FiHome,
  FiTruck,
  FiUsers,
  FiUser,
  FiClipboard,
  FiLogOut
} from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout, isSuperAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Terminals', href: '/terminals', icon: FiTruck },
    { name: 'Drivers', href: '/drivers', icon: FiUser },
    { name: 'Vehicles', href: '/vehicles', icon: FiTruck },
    { name: 'Records', href: '/records', icon: FiClipboard }
  ];

  if (isSuperAdmin) {
    navigation.push({ name: 'Users', href: '/users', icon: FiUsers });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bgColor text-white shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      >

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            TM SYSTEM
          </h1>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-black font-bold">
              {user?.name?.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-amber-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3 text-sm rounded-full transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md'
                    : 'text-gray-300 hover:bg-gray-900/60 hover:text-white'
                }`
              }
            >
              <item.icon
                className="mr-3 transition-transform group-hover:scale-110"
                size={20}
              />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm rounded-full bg-gray-900 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <FiLogOut className="mr-3" size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
