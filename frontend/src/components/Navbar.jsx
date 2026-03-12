import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const Navbar = ({ setSidebarOpen }) => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    setGreeting(getGreeting());

    const interval = setInterval(() => {
      setGreeting(getGreeting());
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-20 shadow-lg">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-amber-400 mr-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiMenu size={24} />
            </button>
            
            {/* Greeting with clock and date */}
            <div className="hidden sm:block">
              <div className="flex flex-col items-center justify-start space-x-3">
                <span className="text-lg font-medium bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  {greeting}, {user?.name}
                </span>
                  <div className="flex items-center justify-start w-full">
                    <div className="text-sm font-semibold text-gray-200 border-r pr-3 mr-3 borderr-gray-300">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(currentTime)}
                    </div>
                  </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <div className="flex items-center justify-end space-x-1">
                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
            
            {/* Avatar with gradient */}
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile greeting - visible only on mobile */}
      <div className="sm:hidden px-4 pb-3">
        <div className="flex flex-col space-y-1">
          <span className="text-lg font-medium bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            {greeting}, {user?.name}
          </span>
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-white">
              {formatTime(currentTime)}
            </div>
            <span className="text-gray-600">•</span>
            <div className="text-xs text-gray-400">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 