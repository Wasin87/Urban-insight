import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../Hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SocialLogin from './SocialLogin/SocialLogin';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaChevronDown, FaCrown, FaArrowRight, FaUsers, FaUserShield, FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
    const { signInUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [tempAdminEmail, setTempAdminEmail] = useState('');
    const [tempAdminPassword, setTempAdminPassword] = useState('');

    // Predefined user credentials
    const userCredentials = {
        admin: {
            email: "admin@admin.com",
            password: "Admin@123",
            role: "Admin",
            description: "Full system access with admin privileges"
        },
        staff: {
            email: "rasel@ahmed.com",
            password: "1234A@g5678",
            role: "Staff",
            description: "Staff account for managing issues"
        },
        citizen: {
            email: "mamun@ahmed.com",
            password: "1234A@g5678",
            role: "Citizen",
            description: "Citizen account for reporting issues"
        }
    };

    const handleLogin = (data) => {
        setLoading(true);
        signInUser(data.email, data.password)
            .then(result => {
                console.log(result.user);
                navigate(location?.state || '/');
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    };

    const handleUserSelect = (role) => {
        if (role === 'admin') {
            setShowAdminModal(true);
            return;
        }

        const credentials = userCredentials[role];
        setValue('email', credentials.email);
        setValue('password', credentials.password);
        setShowUserDropdown(false);
        
        // Show success message
        const roleName = role.charAt(0).toUpperCase() + role.slice(1);
        alert(`${roleName} credentials filled successfully!`);
    };

    const handleAdminLogin = () => {
        if (tempAdminEmail && tempAdminPassword) {
            setValue('email', tempAdminEmail);
            setValue('password', tempAdminPassword);
            setShowAdminModal(false);
            setTempAdminEmail('');
            setTempAdminPassword('');
            alert('Admin credentials set!');
        } else {
            alert('Please fill in both email and password for admin access');
        }
    };

    const handleClearCredentials = () => {
        reset({
            email: '',
            password: ''
        });
        alert('Credentials cleared!');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* User Credentials Dropdown Button */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative mb-6"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FaUsers className="text-white w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Demo Accounts</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">Quick login with test credentials</p>
                                </div>
                            </div>
                            <FaChevronDown className={`text-gray-500 dark:text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                        </div>
                    </motion.button>

                    {/* User Credentials Dropdown */}
                    <AnimatePresence>
                        {showUserDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                {/* Admin Credential */}
                                <motion.button
                                    whileHover={{ scale: 1.01, backgroundColor: '' }}
                                    onClick={() => handleUserSelect('admin')}
                                    className="w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                        <FaUserShield className="text-white w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Admin Account</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Full system access</p>
                                    </div>
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                                        Admin
                                    </span>
                                </motion.button>

                                {/* Staff Credential */}
                                <motion.button
                                    whileHover={{ scale: 1.01, backgroundColor: '' }}
                                    onClick={() => handleUserSelect('staff')}
                                    className="w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <FaUser className="text-white w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Staff Account</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Issue management access</p>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                        Staff
                                    </span>
                                </motion.button>

                                {/* Citizen Credential */}
                                <motion.button
                                    whileHover={{ scale: 1.01, backgroundColor: '' }}
                                    onClick={() => handleUserSelect('citizen')}
                                    className="w-full p-4 text-left flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <FaUserCircle className="text-white w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Citizen Account</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Issue reporting access</p>
                                    </div>
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                                        Citizen
                                    </span>
                                </motion.button>

                                {/* Clear Button */}
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    onClick={handleClearCredentials}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
                                >
                                    Clear Credentials
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Urban Insight</h1>
                        </div>
                        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                            Login to manage infrastructure issues
                        </p>
                    </div>

                    <form className="p-6" onSubmit={handleSubmit(handleLogin)}>
                        {/* Email Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <FaUser className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all ${
                                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <FaLock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters'
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
                                            message: 'Must include uppercase, lowercase, number & special character'
                                        }
                                    })}
                                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all ${
                                        errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Login Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                                loading
                                    ? 'bg-amber-400 cursor-not-allowed'
                                    : 'bg-linear-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="px-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="p-6">
                        <SocialLogin />
                    </div>

                    {/* Sign Up Link */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-center text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                state={location.state}
                                to="/register"
                                className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                            >
                                Create account
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        By continuing, you agree to our{' '}
                        <Link to="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">
                            Privacy Policy
                        </Link>
                    </p>
                </div>

                {/* Admin Credential Modal */}
                <AnimatePresence>
                    {showAdminModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700"
                            >
                                {/* Modal Header */}
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                                            <FaUserShield className="text-white w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Admin Access Required</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                For security purposes, please enter admin credentials manually
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Admin Email
                                        </label>
                                        <input
                                            type="email"
                                            value={tempAdminEmail}
                                            onChange={(e) => setTempAdminEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                                            placeholder="Enter admin email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Admin Password
                                        </label>
                                        <input
                                            type="password"
                                            value={tempAdminPassword}
                                            onChange={(e) => setTempAdminPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                                            placeholder="Enter admin password"
                                        />
                                    </div>
                                    
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                            ⚠️ <span className="font-semibold">Security Notice:</span> Admin credentials are not stored for demo purposes. Enter your admin email and password to continue.
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowAdminModal(false);
                                            setTempAdminEmail('');
                                            setTempAdminPassword('');
                                        }}
                                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAdminLogin}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                                    >
                                        Set Admin Credentials
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Login;