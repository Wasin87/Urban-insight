import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun, FaBars, FaTimes, FaChevronDown, FaUser, FaCog, FaSignOutAlt, FaBell, FaSearch, FaHome, FaInfoCircle, FaMapMarkedAlt, FaClipboardList, FaTachometerAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import Logo from "../../../../components/Logo/Logo";
import useAuth from "../../../../Hooks/useAuth";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { FaBoxTissue, FaCrown } from "react-icons/fa6";
import { FaCheck } from 'react-icons/fa';


const Navbar = () => {
  const { user, logOut } = useAuth();
  const location = useLocation();
  const axiosSecure = useAxiosSecure();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "winter");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Fetch user premium status
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email
  });

  const isPremium = userData?.isPremium || false;

  // Fetch user notifications from backend
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      try {
        // First, get user's assigned issues (if staff)
        let assignedIssues = [];
        let userIssues = [];
        
        if (userData?.role === 'staff') {
          const staffId = userData._id;
          const res = await axiosSecure.get(`/staff/${staffId}/issues`);
          assignedIssues = res.data.issues || [];
        }

        // Get user's own issues
        const userIssuesRes = await axiosSecure.get(`/issues?email=${user.email}`);
        userIssues = userIssuesRes.data || [];

        // Generate notifications based on issues
        const notifications = [];

        // Notifications for staff
        if (userData?.role === 'staff') {
          // New assignments
          const newAssignments = assignedIssues
            .filter(issue => issue.status === 'assigned')
            .map(issue => ({
              id: issue._id,
              type: 'assignment',
              title: "New Issue Assigned",
              message: `You've been assigned to: "${issue.issueTitle}"`,
              time: new Date(issue.assignedAt).toLocaleDateString(),
              read: false,
              link: `/dashboard/staff/issues/${issue._id}`
            }));

          // Issues that need attention
          const pendingIssues = assignedIssues
            .filter(issue => issue.status === 'in-progress')
            .map(issue => ({
              id: issue._id,
              type: 'reminder',
              title: "Issue In Progress",
              message: `"${issue.issueTitle}" is still in progress`,
              time: new Date(issue.updatedAt).toLocaleDateString(),
              read: false,
              link: `/dashboard/staff/issues/${issue._id}`
            }));

          notifications.push(...newAssignments, ...pendingIssues);
        }

        // Notifications for issue owners
        const userIssueNotifications = userIssues.map(issue => {
          let notification = null;
          
          switch(issue.status) {
            case 'assigned':
              notification = {
                id: issue._id,
                type: 'assigned',
                title: "Issue Assigned to Staff",
                message: `Your issue "${issue.issueTitle}" has been assigned to staff`,
                time: new Date(issue.assignedAt || issue.updatedAt).toLocaleDateString(),
                read: false,
                link: `/dashboard/myIssues/${issue._id}`
              };
              break;
              
            case 'in-progress':
              notification = {
                id: issue._id,
                type: 'progress',
                title: "Issue In Progress",
                message: `Staff is working on your issue: "${issue.issueTitle}"`,
                time: new Date(issue.updatedAt).toLocaleDateString(),
                read: false,
                link: `/dashboard/myIssues/${issue._id}`
              };
              break;
              
            case 'resolved':
              notification = {
                id: issue._id,
                type: 'resolved',
                title: "Issue Resolved!",
                message: `Your issue "${issue.issueTitle}" has been resolved`,
                time: new Date(issue.resolvedAt || issue.updatedAt).toLocaleDateString(),
                read: false,
                link: `/dashboard/myIssues/${issue._id}`
              };
              break;
              
            case 'rejected':
              notification = {
                id: issue._id,
                type: 'rejected',
                title: "Issue Rejected",
                message: `Your issue "${issue.issueTitle}" has been rejected by staff`,
                time: new Date(issue.rejectedAt || issue.updatedAt).toLocaleDateString(),
                read: false,
                link: `/dashboard/myIssues/${issue._id}`
              };
              break;
          }
          
          return notification;
        }).filter(n => n !== null);

        notifications.push(...userIssueNotifications);

        // Add welcome notification for new users
        if (userData?.createdAt) {
          const createdAt = new Date(userData.createdAt);
          const daysSinceJoin = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
          
          if (daysSinceJoin < 7) {
            notifications.unshift({
              id: 'welcome',
              type: 'welcome',
              title: "Welcome to Urban Insight",
              message: "Thank you for joining our community! Report issues, track progress, and help improve your city.",
              time: "Just now",
              read: false,
              link: "/"
            });
          }
        }

        // Sort by time (newest first)
        return notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
      } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }
    },
    enabled: !!user?.email && !!userData,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true
  });

  const notifications = notificationsData || [];

  // Theme management
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body overflow management
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
      if (notificationsOpen && !event.target.closest(".notifications-dropdown")) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen, notificationsOpen]);

  const handleThemeToggle = () => {
    setTheme(prev => (prev === "winter" ? "night" : "winter"));
  };

  const handleMarkAsRead = async (notificationId) => {
    // Here you would typically send a request to mark notification as read
    // For now, we'll just refetch notifications
    await refetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    // Here you would typically send a request to mark all notifications as read
    // For now, we'll just refetch notifications
    Swal.fire({
      title: "Mark all as read?",
      text: "Are you sure you want to mark all notifications as read?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, mark all",
      cancelButtonText: "Cancel",
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // API call to mark all as read would go here
        await refetchNotifications();
        Swal.fire({
          title: "Done!",
          text: "All notifications marked as read.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: theme === "night" ? "#1f2937" : "#ffffff",
          color: theme === "night" ? "#ffffff" : "#111827",
        });
      }
    });
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'assignment':
        return <FaUser className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <FaCheck className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <FaTimes className="w-4 h-4 text-red-500" />;
      case 'progress':
        return <FaCog className="w-4 h-4 text-yellow-500" />;
      case 'welcome':
        return <FaInfoCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <FaBell className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleLogOut = () => {
    Swal.fire({
      title: "Sign Out?",
      text: "Are you sure you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Sign Out",
      cancelButtonText: "Cancel",
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
    }).then((result) => {
      if (result.isConfirmed) {
        logOut()
          .then(() => {
            Swal.fire({
              title: "Signed Out!",
              text: "You have successfully signed out.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              background: theme === "night" ? "#ffffff" : "#ffffff",
              color: theme === "night" ? "#ffffff" : "#111827",
            });
          })
          .catch(() => {
            Swal.fire({
              title: "Error!",
              text: "Something went wrong. Please try again.",
              icon: "error",
              background: theme === "night" ? "#1f2937" : "#ffffff",
              color: theme === "night" ? "#ffffff" : "#111827",
            });
          });
      }
    });
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-2 font-medium transition-all duration-300 group ${
      isActive
        ? "text-amber-600 dark:text-amber-400"
        : "text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400"
    }`;

  const links = [
    { to: "/", label: "Home", icon: <FaHome className="" /> },
    { to: "/allIssues", label: "All Issues", icon: <FaClipboardList className="" /> },
    { 
      label: "Services", 
      icon: <FaCog className="w-4 h-4" />,
      submenu: [
        { to: "/addIssues", label: "Add Issues" },
        { to: "/coverage", label: "Coverage Areas" },
        { to: "/aboutUs", label: "About Us" },
      ]
    },
  ];
 
  const userLinks = user ? [
    { to: "/dashboard/myIssues", label: "My Issues", icon: <FaBoxTissue className="w-4 h-4" /> },
    { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt className="w-4 h-4" /> },
  ] : [];

  return (
    <>
      {/* Navbar Container */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed w-full top-0 left-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-xl py-2" 
            : "bg-linear-to-r from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 py-4"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-5">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className=" "
            >
              <Link to="/" className="flex items-center space-x-2">
                <Logo />
              </Link>
            </motion.div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex lg:items-center">
              <ul className="flex items-center">
                {links.map((link) => (
                  <li key={link.label} className="relative">
                    {link.submenu ? (
                      <div 
                        className="relative"
                        onMouseEnter={() => setActiveDropdown(link.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <button className={navLinkClass({ isActive: false })}>
                          <span className="flex items-center ">
                            {link.icon}
                            <span>{link.label}</span>
                            <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                              activeDropdown === link.label ? "rotate-180" : ""
                            }`} />
                          </span>
                        </button>
                        
                        <AnimatePresence>
                          {activeDropdown === link.label && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                            >
                              {link.submenu.map((item) => (
                                <NavLink
                                  key={item.label}
                                  to={item.to}
                                  className={({ isActive }) => `block px-4 py-3 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors ${
                                    isActive 
                                      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-gray-700" 
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {item.label}
                                </NavLink>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <NavLink to={link.to} className={navLinkClass}>
                        <span className="flex items-center space-x-2">
                          {link.icon}
                          <span>{link.label}</span>
                        </span>
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-amber-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      </NavLink>
                    )}
                  </li>
                ))}
                
                {userLinks.map((link) => (
                  <li key={link.label}>
                    <NavLink to={link.to} className={navLinkClass}>
                      <span className="flex items-center space-x-2">
                        {link.icon}
                        <span>{link.label}</span>
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-amber-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right-side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Bar */}
              <div className="relative">
                <motion.div 
                  animate={{ width: searchOpen ? "250px" : "40px" }}
                  className="relative overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300 ${
                      searchOpen ? "opacity-100" : "opacity-0 absolute"
                    }`}
                  />
                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <FaSearch className="w-5 h-5" />
                  </button>
                </motion.div>
              </div>

              {/* Premium Badge (if premium user) */}
              {user && isPremium && (
                <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-linear-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full">
                  <FaCrown className="w-3 h-3" />
                  <span>PREMIUM</span>
                </div>
              )}

              {/* Notifications */}
              {user && (
                <div className="relative notifications-dropdown">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setProfileDropdownOpen(false);
                    }}
                    className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FaBell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
                            </span>
                          </div>
                          {notifications.length > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <Link
                                key={notification.id}
                                to={notification.link || "#"}
                                onClick={() => {
                                  handleMarkAsRead(notification.id);
                                  setNotificationsOpen(false);
                                }}
                                className={`block p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                  !notification.read ? "bg-amber-50/50 dark:bg-amber-900/20" : ""
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="mt-1">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {notification.title}
                                      </h4>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {notification.time}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                      {notification.message}
                                    </p>
                                    <div className="mt-2 flex items-center text-xs">
                                      <span className={`px-2 py-1 rounded-full ${
                                        notification.type === 'resolved' 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                          : notification.type === 'rejected'
                                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                          : notification.type === 'assignment'
                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                          : notification.type === 'progress'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                      }`}>
                                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                      </span>
                                      {!notification.read && (
                                        <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                                          New
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <FaBell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                You'll be notified about issue updates here
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                          <Link
                            to="/dashboard/notifications"
                            className="text-sm text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center justify-center"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            View all notifications
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleThemeToggle}
                className="p-2 rounded-full bg-linear-to-r from-amber-100 to-orange-100 dark:from-gray-800 dark:to-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === "night" ? (
                  <FaSun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                ) : (
                  <FaMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </motion.button>

              {/* User Profile or Auth Buttons */}
              {user ? (
                <div className="relative profile-dropdown">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center space-x-3 focus:outline-none"
                  >
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {userData?.role === 'staff' ? 'Staff Member' : userData?.role === 'admin' ? 'Admin' : 'User'}
                      </p>
                    </div>
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500 shadow-lg"
                      >
                        <img
                          src={user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.displayName || "User") + "&background=amber-500&color=fff"}
                          alt={user.displayName || "User"}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    </div>
                    <FaChevronDown className={`w-3 h-3 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`} />
                  </motion.button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                      >
                        <div className="p-4 bg-linear-to-r from-amber-500 to-orange-500 text-white">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                              <img
                                src={user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.displayName || "User") + "&background=fff&color=000"}
                                alt={user.displayName || "User"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-bold">{user.displayName}</h3>
                              <p className="text-sm opacity-90">{user.email}</p>
                              <div className="flex items-center justify-between mt-1">
                                {isPremium && (
                                  <div className="flex items-center gap-1">
                                    <FaCrown className="w-3 h-3 text-yellow-300" />
                                    <span className="text-xs font-bold">PREMIUM</span>
                                  </div>
                                )}
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  userData?.role === 'staff' 
                                    ? 'bg-blue-500/20 text-blue-200'
                                    : userData?.role === 'admin'
                                    ? 'bg-red-500/20 text-red-200'
                                    : 'bg-white/20 text-white'
                                }`}>
                                  {userData?.role?.toUpperCase() || 'USER'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <NavLink
                            to="/dashboard"
                            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <FaTachometerAlt className="w-4 h-4 mr-3 text-amber-500" />
                            <span>Dashboard</span>
                          </NavLink>

                          {/* Show different links based on user role */}
                          {userData?.role === 'staff' && (
                            <NavLink
                              to="/addIssues"
                              className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors"
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <FaClipboardList className="w-4 h-4 mr-3 text-blue-500" />
                              <span>Assigned Issues</span>
                            </NavLink>
                          )}

                          {/* Premium Button - Only show if not premium */}
                          {!isPremium && (
                            <NavLink
                              to="/premium"
                              className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors"
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <FaCrown className="w-4 h-4 mr-3 text-amber-500" />
                              <span>Go Premium</span>
                            </NavLink>
                          )}

                          <button
                            onClick={handleLogOut}
                            className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                          >
                            <FaSignOutAlt className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm  border rounded-2xl bg-amber-500 dark:bg-amber-200  text-white dark:text-black font-bold hover:text-amber-900 dark:hover:text-amber-800 transition-colors"
                  >
                    Login
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="px-6 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-amber-600 hover:to-orange-600"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <FaTimes className="w-6 h-6 text-gray-900 dark:text-white" />
                ) : (
                  <FaBars className="w-6 h-6 text-gray-900 dark:text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50"
            >
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl"
              >
                <div className="p-6 h-full overflow-y-auto">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <Link to="/" className="flex items-center space-x-3" onClick={() => setMobileMenuOpen(false)}>
                      <Logo />
                    </Link>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <FaTimes className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* User Info */}
                  {user && (
                    <div className="mb-6 p-4 bg-linear-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500">
                          <img
                            src={user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.displayName || "User") + "&background=amber-500&color=fff"}
                            alt={user.displayName || "User"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{user.displayName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {isPremium && (
                              <div className="flex items-center gap-1">
                                <FaCrown className="w-3 h-3 text-amber-500" />
                                <span className="text-xs font-bold text-amber-600">Premium</span>
                              </div>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              userData?.role === 'staff' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : userData?.role === 'admin'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {userData?.role?.toUpperCase() || 'USER'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Links */}
                  <ul className="space-y-1">
                    {links.map((link) => (
                      <li key={link.label}>
                        {link.submenu ? (
                          <>
                            <div className="px-4 py-3 font-medium text-gray-900 dark:text-white flex items-center justify-between">
                              <span className="flex items-center space-x-3">
                                {link.icon}
                                <span>{link.label}</span>
                              </span>
                              <FaChevronDown className="w-3 h-3" />
                            </div>
                            <div className="pl-8 space-y-1">
                              {link.submenu.map((item) => (
                                <NavLink
                                  key={item.label}
                                  to={item.to}
                                  className={({ isActive }) => `block px-4 py-2.5 rounded-lg ${
                                    isActive 
                                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-gray-800' 
                                      : 'text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400'
                                  }`}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.label}
                                </NavLink>
                              ))}
                            </div>
                          </>
                        ) : (
                          <NavLink
                            to={link.to}
                            className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg font-medium ${
                              isActive 
                                ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {link.icon}
                            <span>{link.label}</span>
                          </NavLink>
                        )}
                      </li>
                    ))}
                    
                    {userLinks.map((link) => (
                      <li key={link.label}>
                        <NavLink
                          to={link.to}
                          className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg font-medium ${
                            isActive 
                              ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.icon}
                          <span>{link.label}</span>
                        </NavLink>
                      </li>
                    ))}

                    {/* Staff links for mobile */}
                    {user && userData?.role === 'staff' && (
                      <li>
                        <NavLink
                          to="/addIssues"
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <FaClipboardList className="w-4 h-4" />
                          <span>Assigned Issues</span>
                        </NavLink>
                      </li>
                    )}

                    {/* Premium Link for mobile */}
                    {user && !isPremium && (
                      <li>
                        <NavLink
                          to="/premium"
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium bg-linear-to-r from-amber-500 to-yellow-500 text-white"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <FaCrown className="w-4 h-4" />
                          <span>Go Premium</span>
                        </NavLink>
                      </li>
                    )}
                  </ul>

                  {/* Auth Buttons for Mobile */}
                  {!user && (
                    <div className="mt-8 space-y-3">
                      <Link
                        to="/login"
                        className="block w-full px-4 py-3 text-center font-medium border rounded-2xl bg-amber-500 dark:bg-amber-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800  transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block w-full px-4 py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg text-center hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create Account
                      </Link>
                    </div>
                  )}

                  {/* Logout Button */}
                  {user && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogOut();
                      }}
                      className="w-full mt-8 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;