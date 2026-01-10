import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { 
  FaUserShield, 
  FaUserTie, 
  FaUser, 
  FaUserSlash, 
  FaBan, 
  FaCheck, 
  FaSearch, 
  FaCrown,
  FaRegUser
} from 'react-icons/fa';
import { FiShieldOff, FiUsers } from 'react-icons/fi';
import { MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md';
import Swal from 'sweetalert2';
import Loading from '../../Auth/SocialLogin/Loading';

const UsersManagement = () => {
    const axiosSecure = useAxiosSecure();
      const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "winter");
    const [searchText, setSearchText] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [selectedRole, setSelectedRole] = useState('all');

      // Theme management
      useEffect(() => {
        const html = document.documentElement;
        html.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
      }, [theme]);

    // Toggle dark mode
    React.useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const { refetch, data: users = [], isLoading } = useQuery({
        queryKey: ['users', searchText, selectedRole],
        queryFn: async () => {
            const res = await axiosSecure.get(`/users?searchText=${searchText}`);
            const allUsers = res.data || [];
            
            // Filter by role
            if (selectedRole !== 'all') {
                return allUsers.filter(user => user?.role === selectedRole);
            }
            return allUsers;
        }
    });

    // Get role statistics
    const getRoleStats = () => {
        const stats = {
            admin: 0,
            staff: 0,
            user: 0,
            rejected: 0,
            blocked: 0,
            premium: 0
        };
        
        users.forEach(user => {
            const role = user?.role || 'user';
            stats[role] = (stats[role] || 0) + 1;
            if (user?.isPremium) stats.premium++;
        });
        
        return stats;
    };

    const roleStats = getRoleStats();

    
    // MAKE ADMIN
    
    const handleMakeAdmin = (user) => {
        Swal.fire({
            title: "Make Admin?",
            text: `Are you sure you want to make ${user.displayName} an admin?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, make admin",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#6b7280",
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
        }).then((result) => {
            if (result.isConfirmed) {
                const roleInfo = { role: 'admin' };
                axiosSecure.patch(`/users/${user._id}/role`, roleInfo)
                    .then(res => {
                        if (res.data.modifiedCount) {
                            refetch();
                            Swal.fire({
                                position: 'top-center',
                                icon: 'success',
                                title: `${user.displayName} is now an Admin`,
                                showConfirmButton: false,
                                timer: 1800,
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
                            });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed',
                            text: error.message,
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
                        });
                    });
            }
        });
    };

     
    // MAKE STAFF
  
    const handleMakeStaff = (user) => {
        Swal.fire({
            title: "Make Staff?",
            text: `Are you sure you want to make ${user.displayName} a staff member?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, make staff",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#6b7280",
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
        }).then((result) => {
            if (result.isConfirmed) {
                const roleInfo = { role: 'staff' };
                axiosSecure.patch(`/users/${user._id}/role`, roleInfo)
                    .then(res => {
                        if (res.data.modifiedCount) {
                            refetch();
                            Swal.fire({
                                position: 'top-center',
                                icon: 'success',
                                title: `${user.displayName} is now a Staff`,
                                showConfirmButton: false,
                                timer: 1800,
                                background: darkMode ? "#1f2937" : "#ffffff",
                                color: darkMode ? "#ffffff" : "#000000"
                            });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed',
                            text: error.message,
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
                        });
                    });
            }
        });
    };

     
    // REMOVE ADMIN/STAFF (SET ROLE USER)
   
    const handleRemoveAdmin = (user) => {
        Swal.fire({
            title: "Remove Admin?",
            text: `${user.displayName} will lose admin privileges.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
        }).then((result) => {
            if (result.isConfirmed) {
                const roleInfo = { role: 'user' };
                axiosSecure.patch(`/users/${user._id}/role`, roleInfo)
                    .then(res => {
                        if (res.data.modifiedCount) {
                            refetch();
                            Swal.fire({
                                icon: 'success',
                                title: "Admin Removed",
                                text: `${user.displayName} is now a regular user`,
                                timer: 1800,
                                showConfirmButton: false,
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
                            });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed',
                            text: error.message,
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
                        });
                    });
            }
        });
    };

    
    // REJECT USER
    
    const handleRejectUser = (user) => {
        Swal.fire({
            title: "Reject User?",
            text: `${user.displayName} will be marked as rejected and restricted from platform access.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, reject",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#f97316",
            cancelButtonColor: "#6b7280",
            background: theme === "night" ? "#1f2937" : "#ffffff",
            color: theme === "night" ? "#ffffff" : "#111827"
        }).then((result) => {
            if (result.isConfirmed) {
                const roleInfo = { role: 'rejected' };
                axiosSecure.patch(`/users/${user._id}/role`, roleInfo)
                    .then(res => {
                        if (res.data.modifiedCount) {
                            refetch();
                            Swal.fire({
                                icon: 'success',
                                title: "User Rejected",
                                text: `${user.displayName} has been rejected`,
                                timer: 1800,
                                showConfirmButton: false,
                                background: theme === "night" ? "#1f2937" : "#ffffff",
                                color: theme === "night" ? "#ffffff" : "#111827"
                            });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed',
                            text: error.message,
                            background: theme === "night" ? "#1f2937" : "#ffffff",
                            color: theme === "night" ? "#ffffff" : "#111827"
                        });
                    });
            }
        });
    };

     
    // BLOCK USER
     
    const handleBlockUser = (user) => {
        Swal.fire({
            title: "Block User?",
            text: `${user.displayName} will be blocked from the platform.`,
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Yes, block",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            background: theme === "night" ? "#1f2937" : "#ffffff",
            color: theme === "night" ? "#ffffff" : "#111827"
        }).then((result) => {
            if (result.isConfirmed) {
                const roleInfo = { role: 'blocked' };
                axiosSecure.patch(`/users/${user._id}/role`, roleInfo)
                    .then(res => {
                        if (res.data.modifiedCount) {
                            refetch();
                            Swal.fire({
                                icon: 'success',
                                title: "User Blocked",
                                text: `${user.displayName} has been blocked`,
                                timer: 1800,
                                showConfirmButton: false,
                                background: theme === "night" ? "#1f2937" : "#ffffff",
                                color: theme === "night" ? "#ffffff" : "#111827"
                            });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed',
                            text: error.message,
                                    background: darkMode ? "#1f2937" : "#ffffff",
                                    color: darkMode ? "#ffffff" : "#000000"
                        });
                    });
            }
        });
    };

   
    // APPROVE USER (Restore to user)
   
    const handleApproveUser = (user) => {
        Swal.fire({
            title: "Approve User?",
            text: `${user.displayName} will be restored as a regular user.`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Yes, approve",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#6b7280",
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
        }).then((result) => {
            if (result.isConfirmed) {
                const roleInfo = { role: 'user' };
                axiosSecure.patch(`/users/${user._id}/role`, roleInfo)
                    .then(res => {
                        if (res.data.modifiedCount) {
                            refetch();
                            Swal.fire({
                                icon: 'success',
                                title: "User Approved",
                                text: `${user.displayName} has been restored`,
                                timer: 1800,
                                showConfirmButton: false,
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
                            });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed',
                            text: error.message,
      background: theme === "night" ? "#1f2937" : "#ffffff",
      color: theme === "night" ? "#ffffff" : "#111827",
                        });
                    });
            }
        });
    };

    // Safe role getter with fallback
    const getSafeRole = (user) => {
        return user?.role || 'user';
    };

    // Role badge styling
    const getRoleBadgeClass = (role) => {
        const safeRole = role || 'user';
        switch (safeRole) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'staff':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'user':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'rejected':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'blocked':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    // Safe date formatting
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString();
        } catch {
            return 'Invalid Date';
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <Loading></Loading>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">Users Management</h2>
                        <p className="text-gray-600 dark:text-gray-400">Total Users: <span className="font-bold text-blue-600 dark:text-blue-400">{users.length}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-all duration-300"
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {darkMode ? (
                                <MdOutlineLightMode className="text-xl text-yellow-500" />
                            ) : (
                                <MdOutlineDarkMode className="text-xl text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                        
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <FiUsers className="text-blue-600 dark:text-blue-400" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Manage</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{roleStats.admin}</p>
                            </div>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                                <FaUserShield className="text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Staff</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{roleStats.staff}</p>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <FaUserTie className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Users</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{roleStats.user}</p>
                            </div>
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                                <FaRegUser className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Premium</p>
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{roleStats.premium}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                                <FaCrown className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{roleStats.rejected}</p>
                            </div>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                                <FaUserSlash className="text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Blocked</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{roleStats.blocked}</p>
                            </div>
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                                <FaBan className="text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-6 border dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Bar */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search Users
                            </label>
                            <div className="relative">
                                <input
                                    type="search"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    placeholder="Search by name or email..."
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <FaSearch className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Filter by Role
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all" className="dark:bg-gray-700">All Roles</option>
                                <option value="admin" className="dark:bg-gray-700">Admin</option>
                                <option value="staff" className="dark:bg-gray-700">Staff</option>
                                <option value="user" className="dark:bg-gray-700">User</option>
                                <option value="rejected" className="dark:bg-gray-700">Rejected</option>
                                <option value="blocked" className="dark:bg-gray-700">Blocked</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">No.</th>
                                <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">User</th>
                                <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">Email</th>
                                <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">Role</th>
                                <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">Premium</th>
                                <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">Admin Actions</th>
                                <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">User Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user, index) => {
                                const safeRole = getSafeRole(user);
                                const displayName = user?.displayName || 'Unknown User';
                                const email = user?.email || 'No email';
                                const photoURL = user?.photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=random`;
                                const isPremium = user?.isPremium || false;
                                const createdAt = user?.createdAt;

                                return (
                                    <tr key={user._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-4 md:px-6 py-4">
                                            <span className="font-medium text-gray-900 dark:text-white">{index + 1}</span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-800">
                                                        <img 
                                                            src={photoURL} 
                                                            alt={displayName} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{displayName}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Joined: {formatDate(createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white break-all">{email}</div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(safeRole)}`}>
                                                {safeRole?.toUpperCase() || 'USER'}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            {isPremium ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-linear-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold">
                                                    <FaCrown className="w-3 h-3" />
                                                    PREMIUM
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">
                                                    BASIC
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {/* Make Admin Button */}
                                                {safeRole !== 'admin' && safeRole !== 'staff' && safeRole !== 'rejected' && safeRole !== 'blocked' && (
                                                    <button
                                                        onClick={() => handleMakeAdmin(user)}
                                                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                                                        title="Make Admin"
                                                    >
                                                        <FaUserShield className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Admin</span>
                                                    </button>
                                                )}

                                                {/* Make Staff Button */}
                                                {safeRole !== 'staff' && safeRole !== 'admin' && safeRole !== 'rejected' && safeRole !== 'blocked' && (
                                                    <button
                                                        onClick={() => handleMakeStaff(user)}
                                                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                                                        title="Make Staff"
                                                    >
                                                        <FaUserTie className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Staff</span>
                                                    </button>
                                                )}

                                                {/* Remove Admin/Staff Button */}
                                                {(safeRole === 'admin' || safeRole === 'staff') && (
                                                    <button
                                                        onClick={() => handleRemoveAdmin(user)}
                                                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                                                        title="Remove Admin/Staff"
                                                    >
                                                        <FiShieldOff className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Remove</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {/* Approve Button (for rejected/blocked users) */}
                                                {(safeRole === 'rejected' || safeRole === 'blocked') && (
                                                    <button
                                                        onClick={() => handleApproveUser(user)}
                                                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                                                        title="Approve User"
                                                    >
                                                        <FaCheck className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Approve</span>
                                                    </button>
                                                )}

                                                {/* Reject Button (for regular users) */}
                                                {safeRole === 'user' && (
                                                    <button
                                                        onClick={() => handleRejectUser(user)}
                                                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                                                        title="Reject User"
                                                    >
                                                        <FaUserSlash className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Reject</span>
                                                    </button>
                                                )}

                                                {/* Block Button (for regular users) */}
                                                {safeRole === 'user' && (
                                                    <button
                                                        onClick={() => handleBlockUser(user)}
                                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                                                        title="Block User"
                                                    >
                                                        <FaBan className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Block</span>
                                                    </button>
                                                )}

                                                {/* Unblock/Unreject Button */}
                                                {safeRole === 'rejected' && (
                                                    <button
                                                        onClick={() => handleApproveUser(user)}
                                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                                                        title="Unreject User"
                                                    >
                                                        <FaUser className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Unreject</span>
                                                    </button>
                                                )}

                                                {safeRole === 'blocked' && (
                                                    <button
                                                        onClick={() => handleApproveUser(user)}
                                                        className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                                                        title="Unblock User"
                                                    >
                                                        <FaUser className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Unblock</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 dark:text-gray-500 mb-4">
                                <FiUsers className="w-16 h-16 mx-auto" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No users found</p>
                            {searchText && (
                                <p className="text-gray-400 dark:text-gray-500">Try a different search term</p>
                            )}
                            {selectedRole !== 'all' && (
                                <p className="text-gray-400 dark:text-gray-500">No users with "{selectedRole}" role</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Role Legend */}
            <div className="mt-8 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow border dark:border-gray-700">
                <h3 className="font-bold text-gray-700 dark:text-white mb-4">Role Legend:</h3>
                <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        ADMIN - Full system access
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        STAFF - Limited administrative access
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        USER - Regular platform user
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        REJECTED - Restricted access
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        BLOCKED - No access
                    </span>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Note:</strong> Premium status is independent of user roles. Premium users get unlimited issue reporting.</p>
                </div>
            </div>
        </div>
    );
};

export default UsersManagement;