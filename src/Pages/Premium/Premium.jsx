import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaCheck, FaShieldAlt, FaChartLine, FaStar, FaRocket, FaArrowLeft, FaTimes, FaInfinity, FaUserFriends, FaLockOpen, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
 
 
import Swal from 'sweetalert2';
import useAuth from '../../Hooks/useAuth';
import useAxiosSecure from '../../Hooks/useAxiosSecure';

const Premium = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [loading, setLoading] = useState(false);

    const handlePremiumPayment = async (planType = 'monthly') => {
        if (!user) {
            Swal.fire({
                title: "Login Required",
                text: "Please login first to purchase premium",
                icon: "warning",
                confirmButtonText: "Go to Login",
                confirmButtonColor: "#3085d6"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login', { state: { from: '/premium' } });
                }
            });
            return;
        }

        setLoading(true);
        const amount = planType === 'monthly' ? 1000 : 10000; // 1000 monthly, 10000 yearly

        const paymentInfo = {
            amount: amount,
            userEmail: user.email,
            userName: user.displayName || user.email,
            type: 'premium',
            plan: planType,
            description: `Urban Insight Premium ${planType === 'monthly' ? 'Monthly' : 'Yearly'} Plan`
        };

        try {
            const res = await axiosSecure.post('/create-premium-payment', paymentInfo);
            
            if (res.data.success && res.data.url) {
                toast.success('Redirecting to secure payment...', {
                    position: "top-right",
                    autoClose: 2000
                });

                setTimeout(() => {
                    window.location.href = res.data.url;
                }, 500);
            } else {
                throw new Error(res.data.error || 'Payment failed');
            }
        } catch (error) {
            console.error('Premium Payment Error:', error);
            toast.error(error.message || 'Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: <FaRocket className="w-6 h-6" />,
            title: "Unlimited Issue Reporting",
            desc: "Report as many issues as you want without any restrictions",
            free: "Limited to 3 issues",
            premium: "Unlimited issues"
        },
        {
            icon: <FaChartLine className="w-6 h-6" />,
            title: "Priority Support",
            desc: "Get faster responses and priority handling for your reports",
            free: "Standard support",
            premium: "Priority support"
        },
        {
            icon: <FaShieldAlt className="w-6 h-6" />,
            title: "Advanced Analytics",
            desc: "Access detailed reports and insights about reported issues",
            free: "Basic stats",
            premium: "Advanced analytics"
        },
        {
            icon: <FaStar className="w-6 h-6" />,
            title: "Verification Badge",
            desc: "Get a verified badge to build credibility in the community",
            free: "No badge",
            premium: "Verified badge"
        },
        {
            icon: <FaUserFriends className="w-6 h-6" />,
            title: "Community Influence",
            desc: "Your votes and comments have more weight in community decisions",
            free: "Standard influence",
            premium: "Enhanced influence"
        },
        {
            icon: <FaLockOpen className="w-6 h-6" />,
            title: "No Ads Experience",
            desc: "Enjoy an ad-free platform for better focus and experience",
            free: "With ads",
            premium: "Ad-free"
        }
    ];

    const pricingPlans = [
        {
            name: "Free",
            price: "৳0",
            period: "forever",
            features: ["Max 3 issues", "Basic support", "Standard features", "With ads"],
            highlight: false,
            buttonText: "Current Plan",
            disabled: true,
            icon: "👤"
        },
        {
            name: "Monthly",
            price: "৳1,000",
            period: "per month",
            features: ["Unlimited issues", "Priority support", "Advanced analytics", "No ads"],
            highlight: true,
            buttonText: "Go Premium",
            saving: "Most Popular",
            icon: "🚀"
        },
        {
            name: "Yearly",
            price: "৳10,000",
            period: "per year",
            features: ["All premium features", "24/7 support", "Early access", "Save 17%"],
            highlight: false,
            buttonText: "Save 17%",
            saving: "Save ৳2,000",
            icon: "👑"
        }
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-6"
                    >
                        <FaArrowLeft />
                        Back
                    </motion.button>
                    
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-amber-500 to-yellow-500 rounded-2xl mb-6"
                    >
                        <FaCrown className="text-white w-10 h-10" />
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Go <span className="text-amber-500">Premium</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Unlock unlimited issue reporting and premium features to make your city better
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className={`bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 ${
                                plan.highlight 
                                    ? 'border-amber-500 shadow-2xl relative' 
                                    : 'border-gray-200 dark:border-gray-700 shadow-lg'
                            }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                                    {plan.saving}
                                </div>
                            )}
                            
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-2">{plan.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                <div className="flex items-baseline justify-center mt-4">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                                    <span className="text-gray-600 dark:text-gray-400 ml-2">{plan.period}</span>
                                </div>
                            </div>
                            
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <FaCheck className={`w-4 h-4 ${
                                            plan.name === "Free" ? "text-gray-400" : "text-green-500"
                                        }`} />
                                        <span className={`${
                                            plan.name === "Free" ? "text-gray-500" : "text-gray-700 dark:text-gray-300"
                                        }`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            <button
                                onClick={() => {
                                    if (plan.name === "Monthly") handlePremiumPayment('monthly');
                                    if (plan.name === "Yearly") handlePremiumPayment('yearly');
                                    if (plan.name === "Free") navigate('/addIssues');
                                }}
                                disabled={plan.disabled || loading}
                                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                                    plan.highlight
                                        ? 'bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl'
                                        : plan.name === "Free"
                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-default'
                                        : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading && plan.highlight ? 'Processing...' : plan.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Feature Comparison */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        Feature Comparison
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Features</th>
                                    <th className="text-center py-4 px-4 font-semibold text-gray-500 dark:text-gray-400">Free</th>
                                    <th className="text-center py-4 px-4 font-semibold text-amber-600 dark:text-amber-400">Premium</th>
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((feature, index) => (
                                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                                                    {feature.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center py-4 px-4">
                                            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <FaTimes className="w-4 h-4 text-red-500" />
                                                <span>{feature.free}</span>
                                            </div>
                                        </td>
                                        <td className="text-center py-4 px-4">
                                            <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                                                <FaCheck className="w-4 h-4" />
                                                <span>{feature.premium}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                q: "What happens after my 3 free issue reports?",
                                a: "Once you reach the limit of 3 issues, you'll need to upgrade to Premium to report more issues. Your existing issues will remain active and visible."
                            },
                            {
                                q: "Can I cancel my premium subscription?",
                                a: "Yes, you can cancel anytime. Your premium features will remain active until the end of your billing period."
                            },
                            {
                                q: "Will going premium guarantee faster issue resolution?",
                                a: "While premium gives you priority visibility, actual resolution depends on government authorities. We ensure your issues get maximum attention."
                            },
                            {
                                q: "Do I need to login to purchase premium?",
                                a: "Yes, you need to be logged in to purchase premium. Your premium status will be linked to your account."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center">
                    <div className="bg-linear-to-r from-amber-500 to-yellow-500 rounded-2xl p-8 mb-6">
                        <h3 className="text-2xl font-bold text-white mb-4">Ready to Make a Difference?</h3>
                        <p className="text-white/90 mb-6">Join thousands of premium users making their cities better</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => handlePremiumPayment('monthly')}
                                disabled={loading}
                                className="px-8 py-3 bg-white text-amber-700 font-bold rounded-xl hover:bg-white/90 transition-colors"
                            >
                                {loading ? 'Processing...' : 'Get Premium Monthly'}
                            </button>
                            <button
                                onClick={() => handlePremiumPayment('yearly')}
                                disabled={loading}
                                className="px-8 py-3 bg-black/20 text-white font-bold rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
                            >
                                {loading ? 'Processing...' : 'Get Premium Yearly'}
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Already premium? <button onClick={() => navigate('/dashboard')} className="text-amber-500 hover:text-amber-600">Go to Dashboard</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Premium;