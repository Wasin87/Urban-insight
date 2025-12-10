import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaRocket, FaDownload, FaShareAlt, FaCopy, FaHome, FaList } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [issueData, setIssueData] = useState(null);

    useEffect(() => {
        const sessionId = new URLSearchParams(location.search).get('session_id');
        
        if (!sessionId) {
            navigate('/allIssues');
            return;
        }

        const verifyPayment = async () => {
            try {
                setLoading(true);
                const response = await axiosSecure.get(`/payment-verify?session_id=${sessionId}`);
                
                if (response.data.success) {
                    setPaymentData(response.data.payment);
                    
                    // Fetch issue details
                    if (response.data.payment.issueId) {
                        const issueRes = await axiosSecure.get(`/issues/${response.data.payment.issueId}`);
                        setIssueData(issueRes.data);
                    }
                    
                    // Show success toast
                    toast.success('Boost payment successful! Your issue is now prioritized.', {
                        position: "top-right",
                        autoClose: 5000,
                    });
                } else {
                    toast.error('Payment verification failed');
                    navigate('/payment-cancel');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                toast.error('Failed to verify payment');
                navigate('/payment-cancel');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [location.search, navigate, axiosSecure]);

    const handleCopyTransactionId = () => {
        if (paymentData?.transactionId) {
            navigator.clipboard.writeText(paymentData.transactionId);
            toast.success('Transaction ID copied to clipboard!');
        }
    };

 

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-green-200 dark:border-green-800 border-t-green-500 rounded-full animate-spin mb-6"></div>
                        <FaCheckCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 text-3xl" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
                        Verifying your payment...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Success Animation */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="text-center mb-8"
                >
                    <div className="relative inline-block mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-32 h-32 bg-linear-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                        >
                            <FaCheckCircle className="text-white text-5xl" />
                        </motion.div>
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="absolute -top-4 -right-4"
                        >
                            <div className="w-16 h-16 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <FaRocket className="text-white text-2xl" />
                            </div>
                        </motion.div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
                        Boost Successful! 🎉
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Your issue is now prioritized and will get attention faster
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Payment Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-2"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                                Payment Details
                            </h2>
                            
                            <div className="space-y-4">
                                {issueData && (
                                    <div className="p-4 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl mb-6">
                                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                                            Boosted Issue
                                        </h3>
                                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                                            {issueData.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-3 py-1 bg-linear-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200 rounded-full text-sm font-medium">
                                                {issueData.category}
                                            </span>
                                            <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                                                BOOSTED
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Transaction ID
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <code className="font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg flex-1">
                                                {paymentData?.transactionId || 'N/A'}
                                            </code>
                                            <button
                                                onClick={handleCopyTransactionId}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Copy Transaction ID"
                                            >
                                                <FaCopy className="text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Amount Paid
                                        </label>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            ৳{paymentData?.amount || 100}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Payment Date
                                        </label>
                                        <div className="text-gray-800 dark:text-white">
                                            {paymentData?.paidAt ? new Date(paymentData.paidAt).toLocaleString() : new Date().toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Status
                                        </label>
                                        <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                            <FaCheckCircle className="mr-2" />
                                            Completed
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What's Next */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                What Happens Next?
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center  ">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">1</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">Issue Priority Increased</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Your issue now appears at the top of all lists</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center  ">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">2</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">Special Boost Badge</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Your issue now has a "BOOSTED" badge for visibility</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center  ">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">3</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">Faster Response</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Authorities will prioritize your issue for resolution</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-1"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                                Next Steps
                            </h3>

                            <div className="space-y-4">
 

 

                                <Link
                                    to="/allIssues"
                                    className=" w-full py-3 px-4 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300"
                                >
                                    <FaList />
                                    View All Issues
                                </Link>

                                <Link
                                    to="/"
                                    className="  w-full py-3 px-4 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-800 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors duration-300"
                                >
                                    <FaHome />
                                    Go Home
                                </Link>
                            </div>

                            {/* Receipt Download */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                                    Receipt
                                </h4>
                                <button
                                    onClick={() => {
                                        // Generate and download receipt
                                        toast.info('Receipt download feature coming soon!');
                                    }}
                                    className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <FaDownload />
                                    Download Receipt
                                </button>
                            </div>

                            {/* Help Section */}
                            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                                <p className="mb-2">Need help with your boost?</p>
                                <p>Contact support: support@urbaninsight.com</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;