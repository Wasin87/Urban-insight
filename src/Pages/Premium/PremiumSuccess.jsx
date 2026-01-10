import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCrown, FaCheckCircle, FaRocket, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import Loading from '../Auth/SocialLogin/Loading';

const PremiumSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [premiumData, setPremiumData] = useState(null);
    const [verificationAttempted, setVerificationAttempted] = useState(false);
    const verificationCompleted = useRef(false);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        // Prevent multiple verification attempts
        if (verificationCompleted.current) {
            return;
        }

        const verifyPayment = async () => {
            if (!sessionId) {
                toast.error('Invalid session');
                navigate('/premium');
                return;
            }

            if (verificationAttempted) {
                return;
            }

            setVerificationAttempted(true);

            try {
                // Add timestamp to prevent caching
                const timestamp = new Date().getTime();
                const res = await axiosSecure.get(`/premium-verify?session_id=${sessionId}&t=${timestamp}`, {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                
                if (res.data.success) {
                    setSuccess(true);
                    setPremiumData(res.data);
                    
                    toast.success('🎉 Premium activated successfully!', {
                        position: "top-right",
                        autoClose: 5000
                    });

                    // Mark verification as completed
                    verificationCompleted.current = true;

                    // Update localStorage to trigger user data refresh in other components
                    localStorage.setItem('premium_activation_time', new Date().getTime().toString());

                    // Instead of reloading the page, show a success message
                    // and let the user navigate manually
                } else {
                    throw new Error(res.data.error || 'Verification failed');
                }
            } catch (error) {
                console.error('Premium verification error:', error);
                toast.error('Failed to verify premium payment. Please try again.');
                setTimeout(() => {
                    navigate('/premium');
                }, 2000);
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
        
        // Cleanup function
        return () => {
            // Cleanup if needed
        };
    }, [sessionId, navigate, axiosSecure, verificationAttempted]);

    // If no session ID, redirect immediately
    if (!sessionId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
                <div className="text-center max-w-md">
                    <div className="text-amber-500 text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                        Session Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Unable to find payment session. Please return to the premium page.
                    </p>
                    <button
                        onClick={() => navigate('/premium')}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors"
                    >
                        Back to Premium
                    </button>
                </div>
            </div>
        );
    }

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
                <div className="text-center max-w-md w-full">
                    <div className="relative mx-auto mb-6">
                        <Loading />
                        <FaCrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-500 text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                        Verifying Premium Payment
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please wait while we verify your premium subscription...
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!success && !verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                        Payment Verification Failed
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We couldn't verify your premium payment. Please try again or contact support.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/premium')}
                            className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors"
                        >
                            Back to Premium
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Retry Verification
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mb-6">
                        <FaCrown className="text-white w-12 h-12" />
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Welcome to Premium! 🎉
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Your premium subscription has been activated successfully
                    </p>
                    
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl inline-block">
                        <p className="text-green-700 dark:text-green-300 font-medium">
                            ✅ Your account has been updated. You may need to refresh other pages to see the changes.
                        </p>
                    </div>
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
                                        ৳{premiumData.payment?.amount || '0.00'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                                        {premiumData.payment?.transactionId?.substring(0, 20) || 'N/A'}...
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
                            onClick={() => {
                                // Clear cache and navigate
                                localStorage.setItem('premium_activation_time', new Date().getTime().toString());
                                navigate('/addIssues');
                            }}
                            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300"
                        >
                            Report Your First Premium Issue
                        </button>
                        
                        <div className="space-x-4">
                            <button
                                onClick={() => {
                                    localStorage.setItem('premium_activation_time', new Date().getTime().toString());
                                    navigate('/dashboard');
                                }}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem('premium_activation_time', new Date().getTime().toString());
                                    navigate('/allIssues');
                                }}
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