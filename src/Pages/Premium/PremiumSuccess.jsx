import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCrown, FaCheckCircle, FaRocket, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
 
import { toast } from 'react-toastify';
import useAxiosSecure from '../../Hooks/useAxiosSecure';

const PremiumSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [premiumData, setPremiumData] = useState(null);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                toast.error('Invalid session');
                navigate('/premium');
                return;
            }

            try {
                const res = await axiosSecure.get(`/premium-verify?session_id=${sessionId}`);
                
                if (res.data.success) {
                    setSuccess(true);
                    setPremiumData(res.data);
                    
                    toast.success('🎉 Premium activated successfully!', {
                        position: "top-right",
                        autoClose: 5000
                    });

                    // Refresh user data after 2 seconds
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    throw new Error(res.data.error || 'Verification failed');
                }
            } catch (error) {
                console.error('Premium verification error:', error);
                toast.error('Failed to verify premium payment');
                navigate('/premium');
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [sessionId, navigate, axiosSecure]);

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-gray-300 dark:border-gray-600 border-t-amber-500 rounded-full animate-spin mb-6"></div>
                        <FaCrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-500 text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Verifying Premium Payment
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please wait while we verify your premium subscription...
                    </p>
                </div>
            </div>
        );
    }

    if (!success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Payment Verification Failed
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We couldn't verify your premium payment. Please contact support if the issue persists.
                    </p>
                    <button
                        onClick={() => navigate('/premium')}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold"
                    >
                        Back to Premium
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-amber-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-r from-amber-500 to-yellow-500 rounded-full mb-6">
                        <FaCrown className="text-white w-12 h-12" />
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Welcome to Premium! 🎉
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Your premium subscription has been activated successfully
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Left Column - Success Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FaCheckCircle className="text-green-500" />
                            Subscription Details
                        </h2>
                        
                        {premiumData && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Plan Type</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {premiumData.payment?.plan === 'monthly' ? 'Monthly Premium' : 'Yearly Premium'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">
                                        ৳{premiumData.payment?.amount}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                                        {premiumData.payment?.transactionId?.substring(0, 20)}...
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-gray-600 dark:text-gray-400">Activation Date</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Premium Benefits */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FaRocket className="text-amber-500" />
                            Your Premium Benefits
                        </h2>
                        
                        <div className="space-y-4">
                            {[
                                { icon: <FaRocket className="text-amber-500" />, text: "Unlimited issue reporting" },
                                { icon: <FaUsers className="text-blue-500" />, text: "Priority support" },
                                { icon: <FaCalendarAlt className="text-green-500" />, text: "Ad-free experience" },
                                { icon: <FaCrown className="text-purple-500" />, text: "Verified badge on profile" }
                            ].map((benefit, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    {benefit.icon}
                                    <span className="text-gray-700 dark:text-gray-300">{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="text-center">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/addIssues')}
                            className="px-8 py-4 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                            Report Your First Premium Issue
                        </button>
                        
                        <div className="space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/allIssues')}
                                className="px-6 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors"
                            >
                                Browse All Issues
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                        Need help? <a href="/contact" className="text-amber-500 hover:text-amber-600">Contact our support team</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PremiumSuccess;