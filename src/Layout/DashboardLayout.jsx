import React from 'react';
import { 
  FaHome, 
  FaUser, 
  FaRegCreditCard, 
  FaTasks, 
  FaUsers, 
  FaCog,
  FaChartLine,
  FaBell,
  FaSignOutAlt
} from 'react-icons/fa';
import { 
  MdOutlineReport,
  MdOutlineAssignment,
  MdOutlineAdminPanelSettings,
  MdOutlinePayments,
  MdOutlineNotifications
} from 'react-icons/md';
import { 
  RiEBikeFill,
  RiUserSettingsLine
} from 'react-icons/ri';
import { SiGoogletasks } from 'react-icons/si';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import useRole from '../Hooks/useRole';
import useAuth from '../Hooks/useAuth';
import logoImg from '../assets/urban-logo.png';

const DashboardLayout = () => {
  
  const { role } = useRole();
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut()
      .then(() => {
        navigate('/');
      })
      .catch(error => console.log(error));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <div className="navbar bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900 border-b dark:border-gray-700 px-6 transition-colors duration-200">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <label htmlFor="dashboard-drawer" className="btn btn-ghost drawer-button lg:hidden dark:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </label>
            <Link to="/" className="flex items-center gap-3">
              <img src={logoImg} alt="Urban Insight" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Urban Insight</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Issue Management System</p>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-circle dark:text-gray-300">
              <div className="indicator">
                <MdOutlineNotifications className="h-5 w-5" />
                <span className="badge badge-xs badge-primary indicator-item">3</span>
              </div>
            </button>
            <div className="dropdown-content  menu p-2 shadow bg-base-100 dark:bg-gray-800 rounded-box w-80">
              <h3 className="font-bold text-lg mb-3 px-4 dark:text-white">Notifications</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                  <p className="font-medium dark:text-gray-200">New issue reported in your area</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Just now</p>
                </div>
                <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                  <p className="font-medium dark:text-gray-200">Staff assignment completed</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
              {user?.photoURL ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow">
                  <img 
                    src={user.photoURL} 
                    alt={user?.displayName || 'User'} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-amber-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            
            <ul tabIndex={0} className="dropdown-content   menu p-2 shadow bg-base-100 dark:bg-gray-800 rounded-box w-52 mt-4">
              <li className="px-4 py-3 border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow">
                  <img 
                    src={user.photoURL} 
                    alt={user?.displayName || 'User'} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                  </div>
                  <div>
                    <p className="font-bold dark:text-white">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">{role?.toUpperCase()}</p>
                  </div>
                </div>
              </li>
              <li>
                <Link to="/profile" className="dark:text-gray-300 dark:hover:bg-gray-700">
                  <RiUserSettingsLine /> 
                  <span className="dark:text-gray-300">Profile</span>
                </Link>
              </li>
 
              <li>
                <button onClick={handleLogout} className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700">
                  <FaSignOutAlt /> 
                  <span className="dark:text-red-400">Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="drawer lg:drawer-open">
        <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Outlet />
        </div>
        
        <div className="drawer-side">
          <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
          <div className="menu p-4 w-64 min-h-full bg-base-100 dark:bg-gray-800 text-base-content border-r dark:border-gray-700">
            {/* Sidebar Header */}
            <div className="mb-8 px-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your workspace</p>
            </div>

            {/* Sidebar Navigation */}
            <ul className="space-y-2">
              {/* Dashboard Home */}
              <li>
                <NavLink 
                  to="/dashboard" 
                  end
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                    }`
                  }
                >
                  <FaHome className="text-lg" />
                  <span>Dashboard Home</span>
                </NavLink>
              </li>

              {/* My Issues */}
            <div className="divider my-4 text-gray-400 dark:text-gray-600 text-xs uppercase tracking-wider">User panel</div>
          
              <li>
                <NavLink 
                  to="/dashboard/myIssues"
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                    }`
                  }
                >
                  <MdOutlineReport className="text-lg" />
                  <span>My Issues</span>
                </NavLink>
              </li>

              {/* Payment History */}
              <li>
                <NavLink 
                  to="/dashboard/payment-history"
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                    }`
                  }
                >
                  <MdOutlinePayments className="text-lg" />
                  <span>Payment History</span>
                </NavLink>
              </li>

              {/* Staff (Rider) Links */}
              {role === 'staff' && (
                <>
                  <div className="divider my-4 text-gray-400 dark:text-gray-600 text-xs uppercase tracking-wider">Staff Panel</div>
                  
                  <li>
                    <NavLink 
                      to="/dashboard/manage-issues"
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                        }`
                      }
                    >
                      <FaTasks className="text-lg" />
                      <span>Manage Issues</span>
                    
                    </NavLink>
                  </li>
                  
                  {/* <li>
                    <NavLink 
                      to="/dashboard/completed-issues"
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                        }`
                      }
                    >
                      <SiGoogletasks className="text-lg" />
                      <span>Completed Issues</span>
                    </NavLink>
                  </li> */}
                </>
              )}

              {/* Admin Links */}
              {role === 'admin' && (
                <>
                  <div className="divider my-4 text-gray-400 dark:text-gray-600 text-xs uppercase tracking-wider">Admin Panel</div>
                  
                  {/* Analytics */}
                  {/* <li>
                    <NavLink 
                      to="/dashboard/analytics"
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                        }`
                      }
                    >
                      <FaChartLine className="text-lg" />
                      <span>Analytics</span>
                    </NavLink>
                  </li> */}
                  
                  {/* Users Management */}
                  <li>
                    <NavLink 
                      to="/dashboard/users-management"
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                        }`
                      }
                    >
                      <FaUsers className="text-lg" />
                      <span>Users Management</span>
                      <span className="badge badge-primary badge-sm ml-auto"></span>
                    </NavLink>
                  </li>
                  
                  {/* Assign Staff */}
                  <li>
                    <NavLink 
                      to="/dashboard/assign-staff"
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                        }`
                      }
                    >
                      <MdOutlineAssignment className="text-lg" />
                      <span>Assign Staff</span>

                       
                    </NavLink>
                  </li>
                  
                  {/* Staff Management */}
                  {/* <li>
                    <NavLink 
                      to="/dashboard/staff-management"
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                        }`
                      }
                    >
                      <RiEBikeFill className="text-lg" />
                      <span>Staff Management</span>
                    </NavLink>
                  </li> */}
                  
                  {/* All Issues */}
                  <li>
                    <NavLink 
                      to="/allIssues"
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                        }`
                      }
                    >
                      <MdOutlineReport className="text-lg" />
                      <span>All Issues</span>

               
                    </NavLink>
                  </li>
                  
                  {/* Payments Management */}
                  {/* <li>
                    <NavLink 
                      to="/dashboard/payments-management"
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                        }`
                      }
                    >
                      <FaRegCreditCard className="text-lg" />
                      <span>Payments</span>
                    </NavLink>
                  </li> */}
                  
                  {/* Admin Settings */}
                  {/* <li>
                    <NavLink 
                      to="/dashboard/admin-settings"
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                        }`
                      }
                    >
                      <MdOutlineAdminPanelSettings className="text-lg" />
                      <span>Admin Settings</span>
                    </NavLink>
                  </li> */}
                </>
              )}
            </ul>

            {/* Bottom Links */}
            <div className="mt-auto pt-6 border-t dark:border-gray-700">
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/" 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <FaHome />
                    <span>Back to Home</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/help" 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <span>Help & Support</span>
                  </Link>
                </li>
              </ul>
              
              {/* User Info Footer */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow">
                  <img 
                    src={user.photoURL} 
                    alt={user?.displayName || 'User'} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                  <div>
                    <p className="font-medium text-sm dark:text-white">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{role?.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;