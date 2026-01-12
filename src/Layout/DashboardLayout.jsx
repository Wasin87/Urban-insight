import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaUser, 
  FaTasks, 
  FaUsers, 
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaChevronRight,
  FaChevronLeft,
  FaQuestionCircle,
  FaSun,
  FaMoon,
  FaTimes
} from 'react-icons/fa';
import { 
  MdOutlineReport,
  MdOutlineAssignment,
  MdOutlinePayments,
  MdOutlineNotifications,
  MdKeyboardDoubleArrowDown
} from 'react-icons/md';
import { 
  RiUserSettingsLine,
  RiDashboardFill
} from 'react-icons/ri';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import useRole from '../Hooks/useRole';
import useAuth from '../Hooks/useAuth';
import logoImg from '../assets/urban-logo.png';

const DashboardLayout = () => {
  const { role } = useRole();
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "winter");

  // Theme management
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prev => (prev === "winter" ? "night" : "winter"));
  };

  const handleLogout = () => {
    logOut()
      .then(() => {
        navigate('/');
      })
      .catch(error => console.log(error));
  };

  const toggleDesktopSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  // Navigation items for sidebar
  const navItems = [
    {
      to: "/dashboard",
      icon: <RiDashboardFill className="text-lg " />,
      label: "Dashboard",
      end: true
    },
    {
      to: "/dashboard/myIssues",
      icon: <MdOutlineReport className="text-lg" />,
      label: "My Issues"
    },
    {
      to: "/dashboard/payment-history",
      icon: <MdOutlinePayments className="text-lg" />,
      label: "Payment History"
    }
  ];

  const staffItems = [
    {
      to: "/dashboard/manage-issues",
      icon: <FaTasks className="text-lg" />,
      label: "Manage Issues"
    }
  ];

  const adminItems = [
    {
      to: "/dashboard/users-management",
      icon: <FaUsers className="text-lg" />,
      label: "Users Management",
      badge: "5"
    },
    {
      to: "/dashboard/assign-staff",
      icon: <MdOutlineAssignment className="text-lg" />,
      label: "Assign Staff"
    },
    {
      to: "/allIssues",
      icon: <MdOutlineReport className="text-lg" />,
      label: "All Issues"
    }
  ];

  // Render navigation items
  const renderNavItems = (items, collapsed = false, onClose = null) => (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.to}>
          <NavLink 
            to={item.to} 
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${collapsed ? 'justify-center' : ''} ${
                isActive 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30' 
                  : `${theme === "night" ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-amber-100"}`
              }`
            }
          >
            <span className={`${collapsed ? '' : 'group-hover:scale-110 transition-transform'}`}>
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto badge badge-sm bg-gradient-to-r from-amber-500 to-amber-600 border-0 text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme === "night" ? "from-gray-900 to-gray-800" : "from-gray-50 to-gray-100"} transition-all duration-300`}>
      {/* Top Navigation Bar */}
      <div className={`sticky top-0 z-50 h-16 bg-gradient-to-r ${theme === "night" ? "from-gray-800 to-gray-900" : "from-amber-50 to-amber-100"} ${theme === "night" ? "shadow-gray-900/50" : "shadow-md"} border-b ${theme === "night" ? "border-gray-700" : "border-amber-200"} transition-all duration-300`}>
        <div className="h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileSidebar}
                className={`lg:hidden btn btn-ghost btn-circle ${theme === "night" ? "text-gray-300 hover:text-amber-400" : "text-gray-600 hover:text-amber-600"}`}
                aria-label="Open menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <div className={`w-10 h-10 rounded-3xl p-1.5 flex items-center justify-center shadow-lg border ${theme === "night" ? "border-amber-400" : "border-amber-500"}`}>
                  <img src={logoImg} alt="Urban Insight" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className={`text-sm md:text-xl font-bold ${theme === "night" ? "bg-gradient-to-r from-amber-400 to-amber-300" : "bg-gradient-to-r from-amber-700 to-amber-800"} bg-clip-text text-transparent`}>
                    Urban Insight
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleThemeToggle}
                className={`p-2 rounded-full ${theme === "night" ? "bg-gradient-to-r from-gray-700 to-gray-800" : "bg-gradient-to-r from-amber-100 to-orange-100"} shadow-sm hover:shadow-md transition-all duration-200`}
                aria-label="Toggle theme"
              >
                {theme === "night" ? (
                  <FaSun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                ) : (
                  <FaMoon className="w-5 h-5 text-gray-700" />
                )}
              </motion.button>

 

              {/* User Profile */}
              <div className="dropdown dropdown-end">
                <div className="flex items-center gap-3 cursor-pointer group" tabIndex={0}>
                  <div className="flex flex-col items-end">
                    <span className={`font-medium text-sm group-hover:${theme === "night" ? "text-amber-400" : "text-amber-600"} transition-colors ${theme === "night" ? "text-white" : "text-gray-800"}`}>
                      {user?.displayName?.split(' ')[0] || 'User'}
                    </span>
                    <span className={`text-xs ${theme === "night" ? "text-gray-400" : "text-gray-500"}`}>{role?.toUpperCase()}</span>
                  </div>
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${theme === "night" ? "border-amber-400" : "border-amber-500"} shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user?.displayName || 'User'} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                          {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                </div>
                
                <ul tabIndex={0} className={`dropdown-content menu p-4 shadow-2xl ${theme === "night" ? "bg-gray-800" : "bg-white"} rounded-xl w-64 mt-4 border ${theme === "night" ? "border-gray-700" : "border-gray-200"}`}>
                  <li className="px-4 py-3 mb-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 dark:border-amber-400">
                        {user?.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user?.displayName || 'User'} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl">
                            {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold ${theme === "night" ? "text-white" : "text-gray-900"} truncate`}>{user?.displayName || 'User'}</p>
                        <p className={`text-sm ${theme === "night" ? "text-gray-400" : "text-gray-600"} truncate`}>{user?.email}</p>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full">
                            {role?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <Link to="/profile" className={`py-3 rounded-lg transition-colors ${theme === "night" ? "text-gray-300 hover:text-amber-400 hover:bg-gray-700" : "text-gray-700 hover:text-amber-600 hover:bg-amber-50"}`}>
                      <RiUserSettingsLine className="text-lg" />
                      <span>My Profile</span>
                    </Link>
                  </li>
                  
 
                  
                  <li className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={handleLogout}
                      className={`py-3 rounded-lg transition-colors flex items-center gap-3 ${theme === "night" ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-50"}`}
                    >
                      <FaSignOutAlt className="text-lg" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gradient-to-b ${theme === "night" ? "from-gray-800 to-gray-900" : "from-amber-50 to-white"} border-r ${theme === "night" ? "border-gray-700" : "border-amber-200"} transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Collapse Toggle */}
            <button
              onClick={toggleDesktopSidebar}
              className="absolute -right-3 top-6 w-6 h-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
            >
              {sidebarCollapsed ? <FaChevronRight className="w-3 h-3" /> : <FaChevronLeft className="w-3 h-3" />}
            </button>

            {/* Sidebar Content */}
            <div className="h-full flex flex-col py-6 px-4">
              {/* Sidebar Header */}
              {!sidebarCollapsed && (
                <div className="mb-8 px-2">
                  <h2 className={`text-2xl font-bold bg-gradient-to-r ${theme === "night" ? "from-amber-300 to-amber-200" : "from-amber-700 to-amber-800"} bg-clip-text text-transparent`}>
                    Dashboard
                  </h2>
                  <p className={`text-sm ${theme === "night" ? "text-gray-400" : "text-gray-600"}`}>Manage your workspace <span className='text-amber-800 text-2xl dark:text-amber-500 hover:scale-105 transition-transform duration-300 animate-bounce'><MdKeyboardDoubleArrowDown /></span></p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* User Panel */}
                {!sidebarCollapsed && (
                  <div className="my-4 px-2">
                    <div className={`text-xs font-semibold uppercase tracking-wider ${theme === "night" ? "text-gray-400" : "text-gray-500"}`}>
                      User Panel 
                    </div>
                  </div>
                )}
                {renderNavItems(navItems, sidebarCollapsed)}

                {/* Staff Panel */}
                {role === 'staff' && (
                  <>
                    {!sidebarCollapsed && (
                      <div className="my-4 px-2">
                        <div className={`text-xs font-semibold uppercase tracking-wider ${theme === "night" ? "text-gray-400" : "text-gray-500"}`}>
                          Staff Panel
                        </div>
                      </div>
                    )}
                    {renderNavItems(staffItems, sidebarCollapsed)}
                  </>
                )}

                {/* Admin Panel */}
                {role === 'admin' && (
                  <>
                    {!sidebarCollapsed && (
                      <div className="my-4 px-2">
                        <div className={`text-xs font-semibold uppercase tracking-wider ${theme === "night" ? "text-gray-400" : "text-gray-500"}`}>
                          Admin Panel
                        </div>
                      </div>
                    )}
                    {renderNavItems(adminItems, sidebarCollapsed)}
                  </>
                )}
              </div>

              {/* Bottom Links */}
              <div className={`mt-6 pt-6 border-t ${theme === "night" ? "border-gray-700" : "border-amber-200"}`}>
                {!sidebarCollapsed && (
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        to="/" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${theme === "night" ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-amber-100"}`}
                      >
                        <FaHome className="group-hover:scale-110 transition-transform" />
                        <span>Back to Home</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/contact" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${theme === "night" ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-amber-100"}`}
                      >
                        <FaQuestionCircle className="group-hover:scale-110 transition-transform" />
                        <span>Contact Us</span>
                      </Link>
                    </li>
                  </ul>
                )}

                {/* User Info */}
                <div className={`mt-6 p-4 rounded-xl border ${theme === "night" ? "bg-gradient-to-r from-gray-700 to-gray-800 border-gray-700" : "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"} ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                  <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow ${theme === "night" ? "border-amber-400" : "border-amber-500"}`}>
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user?.displayName || 'User'} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                          {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${theme === "night" ? "text-white" : "text-gray-900"} truncate`}>{user?.displayName || 'User'}</p>
                        <p className={`text-xs ${theme === "night" ? "text-gray-400" : "text-gray-600"}`}>{role?.toUpperCase()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? '' : ''}`}>
          <div className="p-4 sm:p-6 lg:p-2">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${mobileSidebarOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${mobileSidebarOpen ? 'opacity-50' : 'opacity-0'}`}
          onClick={closeMobileSidebar}
        />
        
        {/* Sidebar */}
        <div className={`absolute left-0 top-0 h-full w-80 bg-gradient-to-b ${theme === "night" ? "from-gray-800 to-gray-900" : "from-amber-50 to-white"} transform transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-3xl p-1.5 flex items-center justify-center shadow-lg border ${theme === "night" ? "border-amber-400" : "border-amber-500"}`}>
                <img src={logoImg} alt="Urban Insight" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${theme === "night" ? "text-amber-400" : "text-amber-700"}`}>
                  Dashboard
                </h2>
                <p className={`text-sm ${theme === "night" ? "text-gray-400" : "text-gray-600"}`}>Manage your workspace</p>
              </div>
            </div>
            <button
              onClick={closeMobileSidebar}
              className={`p-2 rounded-full ${theme === "night" ? "hover:bg-gray-700" : "hover:bg-amber-100"}`}
            >
              <FaTimes className={`w-5 h-5 ${theme === "night" ? "text-gray-300" : "text-gray-600"}`} />
            </button>
          </div>

          {/* Mobile Sidebar Content */}
          <div className="h-[calc(100%-80px)] overflow-y-auto p-4">
            {/* User Panel */}
            <div className="mb-6">
              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 px-2 ${theme === "night" ? "text-gray-400" : "text-gray-500"}`}>
                User Panel
              </h3>
              {renderNavItems(navItems, false, closeMobileSidebar)}
            </div>

            {/* Staff Panel */}
            {role === 'staff' && (
              <div className="mb-6">
                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 px-2 ${theme === "night" ? "text-gray-400" : "text-gray-500"}`}>
                  Staff Panel
                </h3>
                {renderNavItems(staffItems, false, closeMobileSidebar)}
              </div>
            )}

            {/* Admin Panel */}
            {role === 'admin' && (
              <div className="mb-6">
                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 px-2 ${theme === "night" ? "text-gray-400" : "text-gray-500"}`}>
                  Admin Panel
                </h3>
                {renderNavItems(adminItems, false, closeMobileSidebar)}
              </div>
            )}

            {/* Bottom Links */}
            <div className={`mt-8 pt-8 border-t ${theme === "night" ? "border-gray-700" : "border-amber-200"}`}>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/" 
                    onClick={closeMobileSidebar}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${theme === "night" ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-amber-100"}`}
                  >
                    <FaHome className="group-hover:scale-110 transition-transform" />
                    <span>Back to Home</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    onClick={closeMobileSidebar}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${theme === "night" ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-amber-100"}`}
                  >
                    <FaQuestionCircle className="group-hover:scale-110 transition-transform" />
                    <span>Contact us</span>
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      handleLogout();
                      closeMobileSidebar();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${theme === "night" ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-50"}`}
                  >
                    <FaSignOutAlt className="group-hover:scale-110 transition-transform" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>

              {/* User Info */}
              <div className={`mt-6 p-4 rounded-xl border ${theme === "night" ? "bg-gradient-to-r from-gray-700 to-gray-800 border-gray-700" : "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow ${theme === "night" ? "border-amber-400" : "border-amber-500"}`}>
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user?.displayName || 'User'} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                        {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${theme === "night" ? "text-white" : "text-gray-900"} truncate`}>{user?.displayName || 'User'}</p>
                    <p className={`text-xs ${theme === "night" ? "text-gray-400" : "text-gray-600"}`}>{role?.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(251, 191, 36, 0.3) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(251, 191, 36, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(251, 191, 36, 0.5);
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;