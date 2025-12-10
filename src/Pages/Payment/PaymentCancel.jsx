import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft, FaRedo, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const PaymentCancel = () => {
    const navigate = useNavigate();

    const handleRetry = () => {
        toast.info('Please try the payment again', {
            position: "top-right",
            autoClose: 3000
        });
        navigate(-1); // Go back to payment page
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                    {/* Icon */}
                    <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="relative inline-block mb-6"
                    >
                        <div className="w-24 h-24 bg-linear-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center">
                            <FaExclamationTriangle className="text-red-500 text-4xl" />
                        </div>
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 2 
                            }}
                            className="absolute inset-0 rounded-full border-4 border-red-200 dark:border-red-800"
                        />
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                        Payment Cancelled
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Your boost payment was not completed.
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-8">
                        Don't worry, no charges were made to your account.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRetry}
                            className="w-full py-3 px-4 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300"
                        >
                            <FaRedo />
                            Try Payment Again
                        </motion.button>

                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                to="/allIssues"
                                className="py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors duration-300"
                            >
                                <FaArrowLeft />
                                Back to Issues
                            </Link>

                            <Link
                                to="/"
                                className="py-3 px-4 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-800 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors duration-300"
                            >
                                <FaHome />
                                Go Home
                            </Link>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Payment Tips:
                        </h3>
                        <ul className="text-xs text-gray-500 dark:text-gray-400 text-left space-y-1">
                            <li>• Ensure you have sufficient balance</li>
                            <li>• Check your internet connection</li>
                            <li>• Try a different payment method if available</li>
                            <li>• Contact support if issues persist</li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                        <p>Need help? Contact: support@urbaninsight.com</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentCancel;