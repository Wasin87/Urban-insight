import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { FaRocket, FaLock, FaShieldAlt, FaBolt, FaArrowLeft, FaCheckCircle, FaCreditCard } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Payment = () => {
    const { issueId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const [isProcessing, setIsProcessing] = useState(false);
    const { issueTitle } = location.state || {};

    const { isLoading, data: issue } = useQuery({
        queryKey: ['issue', issueId],
        queryFn: async () => {
            console.log("Hello",issueId);
            const res = await axiosSecure.get(`/issues/${issueId}`);
            return res.data;
        },
        enabled: !!issueId
    });

    const handlePayment = async () => {
        

        if (!issue || !issueId) {
            toast.error('Issue information not found');
           return;
        }
       

        setIsProcessing(true);

        const paymentInfo = {
            amount: 100,  
            issueId: issue._id,
            userEmail: issue.submittedBy || localStorage.getItem('userEmail'),
            issueTitle: issue.title,
            type: 'boost',
            currency: 'BDT'
        };

        try {
            const res = await axiosSecure.post('/create-boost-payment', paymentInfo);
            console.log(res)
            if (res.data.url) {
                toast.success('Redirecting to secure payment gateway...', {
                    position: "top-right",
                    autoClose: 2000
                });

                setTimeout(() => {
                    window.location.href = res.data.url; // Redirect to Stripe Checkout
                }, 500);
            } else {
                throw new Error('No payment URL received');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            toast.error('Failed to initiate payment. Please try again.');
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-gray-300 dark:border-gray-600 border-t-amber-500 rounded-full animate-spin mb-6"></div>
                        <FaRocket className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-500 text-2xl" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
                        Loading Boost Details...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        Boost Your Issue
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Get priority attention and faster resolution
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column - Issue Details */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Issue Details</h2>
                                <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-amber-100 px-2 py-2 rounded-2xl  text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                                    <FaArrowLeft /> Back
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Issue Title</label>
                                    <div className="text-lg font-semibold text-gray-800 dark:text-white">{issue?.title || issueTitle}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
                                        <div className="font-medium text-gray-800 dark:text-white">{issue?.category}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                            issue?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            issue?.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {issue?.status?.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {issue?.description && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                                        <p className="text-gray-700 dark:text-gray-300">{issue.description}</p>
                                    </div>
                                )}
                                {issue?.location && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</label>
                                        <p className="text-gray-700 dark:text-gray-300">{issue.location}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Benefits Section */}
                        <div className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <FaBolt className="text-purple-500" /> Boost Benefits
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { icon: <FaRocket />, title: 'Priority Listing', desc: 'Appears at the top of all issues' },
                                    { icon: <FaCheckCircle />, title: 'Faster Resolution', desc: 'Higher priority for authorities' },
                                    { icon: <FaShieldAlt />, title: 'Increased Visibility', desc: 'Special badge and styling' },
                                    { icon: <FaCreditCard />, title: 'Community Support', desc: 'Shows commitment to resolution' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">{item.icon}</div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 dark:text-white">{item.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Payment Summary */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="md:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaRocket className="text-white text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Boost Summary</h3>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Boost Fee</span>
                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">৳100</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Service Charge</span>
                                    <span className="font-medium text-gray-800 dark:text-white">৳0</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-lg font-semibold text-gray-800 dark:text-white">Total Amount</span>
                                    <span className="text-3xl font-bold text-gray-800 dark:text-white">৳100</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {isProcessing && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-blue-600 dark:text-blue-400 font-medium">Processing payment...</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Pay button */}
                                <button onClick={handlePayment} disabled={isProcessing} className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'}`}>
                                    <FaLock className="text-white" />
                                    <span className="text-white">{isProcessing ? 'Processing...' : 'Pay Securely'}</span>
                                </button>

                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                                    <FaShieldAlt />
                                    <span>Secure payment by Stripe</span>
                                </div>

                                <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6">
                                    <p>By proceeding, you agree to our Terms of Service</p>
                                    <p>and Privacy Policy</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
