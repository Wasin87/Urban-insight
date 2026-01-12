import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaCheck, FaShieldAlt, FaChartLine, FaStar, FaRocket, FaArrowLeft, FaTimes, FaUserFriends, FaLockOpen, FaCreditCard, FaMobileAlt, FaDesktop, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import useAuth from '../../Hooks/useAuth';
import useAxiosSecure from '../../Hooks/useAxiosSecure';

const Premium = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem("theme");
        return storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'winter');
    });
    const axiosSecure = useAxiosSecure();
    const [processing, setProcessing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const [isMobile, setIsMobile] = useState(false);

    // Theme management
    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        
        // Also update body class for dark mode compatibility
        if (theme === 'night') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
    }, [theme]);

    // Get SweetAlert theme configuration
    const getSwalTheme = () => {
        return theme === 'night' 
            ? {
                  background: '#1f2937',
                  color: '#ffffff',
                  confirmButtonColor: '#f59e0b',
                  cancelButtonColor: '#4b5563',
                  backdrop: 'rgba(0, 0, 0, 0.7)'
              }
            : {
                  background: '#ffffff',
                  color: '#111827',
                  confirmButtonColor: '#f59e0b',
                  cancelButtonColor: '#6b7280',
                  backdrop: 'rgba(0, 0, 0, 0.4)'
              };
    };

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // SweetAlert custom styles
    const swalCustomStyles = {
        customClass: {
            popup: theme === 'night' ? 'dark-swal' : 'light-swal',
            title: theme === 'night' ? 'dark-swal-title' : 'light-swal-title',
            htmlContainer: theme === 'night' ? 'dark-swal-html' : 'light-swal-html',
            confirmButton: theme === 'night' ? 'dark-swal-confirm' : 'light-swal-confirm',
            cancelButton: theme === 'night' ? 'dark-swal-cancel' : 'light-swal-cancel',
            validationMessage: theme === 'night' ? 'dark-swal-validation' : 'light-swal-validation'
        }
    };

    const handlePremiumPayment = async (planType = selectedPlan) => {
        const swalTheme = getSwalTheme();
        
        if (!user) {
            Swal.fire({
                title: "Login Required",
                text: "Please login first to purchase premium",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Go to Login",
                cancelButtonText: "Cancel",
                confirmButtonColor: swalTheme.confirmButtonColor,
                cancelButtonColor: swalTheme.cancelButtonColor,
                reverseButtons: true,
                width: isMobile ? '90%' : '500px',
                background: swalTheme.background,
                color: swalTheme.color,
                backdrop: swalTheme.backdrop,
                ...swalCustomStyles
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login', { state: { from: '/premium' } });
                }
            });
            return;
        }

        setProcessing(true);
        const amount = planType === 'monthly' ? 1000 : 10000;
        
        // Show loading state
        toast.info('Initializing payment...', {
            position: "top-right",
            autoClose: 2000,
            theme: theme === 'night' ? 'dark' : 'light'
        });

        const paymentInfo = {
            amount: amount,
            userEmail: user.email,
            userName: user.displayName || user.email,
            userId: user.uid,
            type: 'premium',
            plan: planType,
            currency: 'BDT',
            description: `Urban Insight Premium ${planType === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
            metadata: {
                userId: user.uid,
                plan: planType,
                platform: isMobile ? 'mobile' : 'desktop'
            }
        };

        try {
            const res = await axiosSecure.post('/create-premium-payment', paymentInfo);
            
            if (res.data.success && res.data.url) {
                toast.success('Redirecting to secure payment gateway...', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: theme === 'night' ? 'dark' : 'light'
                });

                // For better mobile experience
                if (isMobile) {
                    // Open in new tab for mobile to avoid navigation issues
                    window.open(res.data.url, '_blank');
                    
                    // Check payment status periodically
                    const checkPaymentStatus = setInterval(async () => {
                        try {
                            const statusRes = await axiosSecure.get(`/payment-status/${user.uid}`);
                            if (statusRes.data.status === 'succeeded') {
                                clearInterval(checkPaymentStatus);
                                toast.success('Payment successful! Redirecting...', {
                                    theme: theme === 'night' ? 'dark' : 'light'
                                });
                                setTimeout(() => {
                                    navigate('/premium-success');
                                }, 1500);
                            }
                        } catch (error) {
                            console.error('Status check error:', error);
                        }
                    }, 3000);

                    // Clear interval after 5 minutes
                    setTimeout(() => {
                        clearInterval(checkPaymentStatus);
                    }, 300000);

                } else {
                    // For desktop, redirect directly
                    setTimeout(() => {
                        window.location.href = res.data.url;
                    }, 500);
                }
            } else {
                throw new Error(res.data.error || 'Payment failed');
            }
        } catch (error) {
            console.error('Premium Payment Error:', error);
            
            // User-friendly error messages
            let errorMessage = 'Failed to initiate payment';
            
            if (error.response?.data?.error?.includes('Network')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.response?.status === 429) {
                errorMessage = 'Too many attempts. Please try again in a few minutes.';
            } else if (error.response?.status === 400) {
                errorMessage = 'Invalid payment details. Please try again.';
            }
            
            Swal.fire({
                title: 'Payment Failed',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: swalTheme.confirmButtonColor,
                confirmButtonText: 'Try Again',
                width: isMobile ? '90%' : '500px',
                background: swalTheme.background,
                color: swalTheme.color,
                backdrop: swalTheme.backdrop,
                ...swalCustomStyles
            });
        } finally {
            setProcessing(false);
        }
    };

    const handlePaymentMethod = (planType) => {
        setSelectedPlan(planType);
        
        // Show payment method selection for mobile
        if (isMobile) {
            const swalTheme = getSwalTheme();
            
            Swal.fire({
                title: 'Choose Payment Method',
                html: `
                    <div style="text-align: left;">
                        <div style="margin-bottom: 16px; padding: 16px; border: 1px solid ${theme === 'night' ? '#4b5563' : '#d1d5db'}; border-radius: 8px; cursor: pointer; background: ${theme === 'night' ? '#374151' : '#ffffff'};" id="card-payment">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; background-color: ${theme === 'night' ? '#92400e30' : '#fef3c7'}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <svg style="width: 20px; height: 20px; color: ${theme === 'night' ? '#fbbf24' : '#92400e'};" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 style="font-weight: 600; margin: 0; color: ${theme === 'night' ? '#ffffff' : '#111827'};">Credit/Debit Card</h4>
                                    <p style="font-size: 14px; margin: 4px 0 0 0; color: ${theme === 'night' ? '#9ca3af' : '#6b7280'};">Pay with Visa, MasterCard, etc.</p>
                                </div>
                            </div>
                        </div>
                        <div style="padding: 16px; border: 1px solid ${theme === 'night' ? '#4b5563' : '#d1d5db'}; border-radius: 8px; cursor: pointer; background: ${theme === 'night' ? '#374151' : '#ffffff'};" id="mobile-payment">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; background-color: ${theme === 'night' ? '#065f4630' : '#d1fae5'}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <svg style="width: 20px; height: 20px; color: ${theme === 'night' ? '#a7f3d0' : '#065f46'};" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 style="font-weight: 600; margin: 0; color: ${theme === 'night' ? '#ffffff' : '#111827'};">Mobile Banking</h4>
                                    <p style="font-size: 14px; margin: 4px 0 0 0; color: ${theme === 'night' ? '#9ca3af' : '#6b7280'};">bKash, Nagad, Rocket, etc.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonText: 'Continue',
                confirmButtonColor: swalTheme.confirmButtonColor,
                cancelButtonColor: swalTheme.cancelButtonColor,
                width: isMobile ? '95%' : '500px',
                showConfirmButton: false,
                background: swalTheme.background,
                color: swalTheme.color,
                backdrop: swalTheme.backdrop,
                ...swalCustomStyles,
                didOpen: () => {
                    document.getElementById('card-payment').addEventListener('click', () => {
                        Swal.close();
                        handlePremiumPayment(planType);
                    });
                    
                    document.getElementById('mobile-payment').addEventListener('click', () => {
                        Swal.close();
                        // For mobile banking, show instructions
                        Swal.fire({
                            title: 'Mobile Banking Payment',
                            html: `
                                <div style="text-align: left; color: ${swalTheme.color};">
                                    <p style="margin-bottom: 12px;">To pay via mobile banking:</p>
                                    <ol style="list-style-type: decimal; padding-left: 20px; margin-bottom: 16px; color: ${theme === 'night' ? '#d1d5db' : '#374151'};">
                                        <li style="margin-bottom: 8px;">Open your mobile banking app</li>
                                        <li style="margin-bottom: 8px;">Send money to: <strong>017XX-XXXXXX</strong></li>
                                        <li style="margin-bottom: 8px;">Reference: <strong>URBAN-PREMIUM-${planType.toUpperCase()}</strong></li>
                                        <li style="margin-bottom: 8px;">Amount: <strong>৳${planType === 'monthly' ? '1,000' : '10,000'}</strong></li>
                                    </ol>
                                    <div style="margin-top: 16px; padding: 12px; background-color: ${theme === 'night' ? '#92400e30' : '#fffbeb'}; border: 1px solid ${theme === 'night' ? '#92400e' : '#fde68a'}; border-radius: 8px;">
                                        <p style="font-size: 14px; color: ${theme === 'night' ? '#fbbf24' : '#92400e'}; margin: 0;">
                                            After payment, your account will be upgraded within 24 hours.
                                        </p>
                                    </div>
                                </div>
                            `,
                            confirmButtonColor: swalTheme.confirmButtonColor,
                            confirmButtonText: 'I Have Paid',
                            background: swalTheme.background,
                            color: swalTheme.color,
                            ...swalCustomStyles
                        });
                    });
                }
            });
        } else {
            // Direct payment for desktop
            handlePremiumPayment(planType);
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
            id: 'free',
            name: "Free",
            price: "৳0",
            period: "forever",
            features: ["Max 3 issues", "Basic support", "Standard features", "With ads"],
            highlight: false,
            buttonText: "Current Plan",
            disabled: true,
            icon: "👤",
            color: "from-gray-400 to-gray-600"
        },
        {
            id: 'monthly',
            name: "Monthly",
            price: "৳1,000",
            period: "per month",
            features: ["Unlimited issues", "Priority support", "Advanced analytics", "No ads"],
            highlight: true,
            buttonText: processing && selectedPlan === 'monthly' ? "Processing..." : "Go Premium",
            saving: "Most Popular",
            icon: "🚀",
            color: "from-amber-500 to-yellow-500"
        },
        {
            id: 'yearly',
            name: "Yearly",
            price: "৳10,000",
            period: "per year",
            originalPrice: "৳12,000",
            features: ["All premium features", "24/7 support", "Early access", "Save 17%"],
            highlight: false,
            buttonText: processing && selectedPlan === 'yearly' ? "Processing..." : "Save 17%",
            saving: "Save ৳2,000",
            icon: "👑",
            color: "from-purple-500 to-pink-500"
        }
    ];

    // Add CSS for SweetAlert theming
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .dark-swal {
                background-color: #1f2937 !important;
                color: #ffffff !important;
            }
            .dark-swal-title {
                color: #ffffff !important;
            }
            .dark-swal-html {
                color: #d1d5db !important;
            }
            .dark-swal-confirm {
                background-color: #f59e0b !important;
                color: #000000 !important;
            }
            .dark-swal-cancel {
                background-color: #4b5563 !important;
                color: #ffffff !important;
            }
            .dark-swal-validation {
                color: #f87171 !important;
            }
            
            .light-swal {
                background-color: #ffffff !important;
                color: #111827 !important;
            }
            .light-swal-title {
                color: #111827 !important;
            }
            .light-swal-html {
                color: #4b5563 !important;
            }
            .light-swal-confirm {
                background-color: #f59e0b !important;
                color: #000000 !important;
            }
            .light-swal-cancel {
                background-color: #6b7280 !important;
                color: #ffffff !important;
            }
            .light-swal-validation {
                color: #dc2626 !important;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="relative inline-block">
                        <FaSpinner className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                        <FaCrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white w-6 h-6" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
                        Loading Premium Plans...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br mt-5 from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-6xl mx-auto">
 

                {/* Header */}
                <div className="text-center mb-12">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center bg-amber-400 p-2 rounded-xl gap-2 text-gray-800 dark:text-gray-900 hover:text-gray-900 dark:hover:text-white mb-6"
                    >
                        <FaArrowLeft />
                        <span>Back</span>
                    </motion.button>
                    
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl mb-6"
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

                {/* Payment Method Notice for Mobile */}
                {isMobile && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl p-4 mb-6"
                    >
                        <div className="flex items-center gap-3">
                            <FaMobileAlt className="text-xl" />
                            <div>
                                <p className="font-semibold">Mobile Payment Ready</p>
                                <p className="text-sm opacity-90">Tap any plan to choose payment method</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 ${
                                plan.highlight 
                                    ? 'border-amber-500 shadow-2xl relative' 
                                    : 'border-gray-200 dark:border-gray-700 shadow-lg'
                            } hover:shadow-xl transition-shadow duration-300`}
                            onClick={() => {
                                if (!plan.disabled && !processing) {
                                    setSelectedPlan(plan.id);
                                }
                            }}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                                    {plan.saving}
                                </div>
                            )}
                            
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-2">{plan.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                
                                {plan.originalPrice && (
                                    <div className="mt-2">
                                        <span className="text-gray-500 dark:text-gray-400 line-through text-sm">
                                            {plan.originalPrice}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex items-baseline justify-center mt-2">
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (plan.id === 'monthly' || plan.id === 'yearly') {
                                        handlePaymentMethod(plan.id);
                                    }
                                }}
                                disabled={plan.disabled || (processing && selectedPlan === plan.id)}
                                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                    plan.highlight
                                        ? `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl`
                                        : plan.name === "Free"
                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-default'
                                        : `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`
                                } ${processing && selectedPlan === plan.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {processing && selectedPlan === plan.id ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        {plan.buttonText}
                                    </>
                                ) : plan.buttonText}
                            </button>
                            
                            {/* Payment Icons */}
                            {!plan.disabled && (
                                <div className="mt-4 flex justify-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Secure payment:</span>
                                    <div className="flex gap-1">
                                        <span className="text-xs">💳</span>
                                        <span className="text-xs">📱</span>
                                        <span className="text-xs">🏦</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Feature Comparison */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-12">
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
                                q: "How do I pay on mobile?",
                                a: "On mobile, tap any premium plan to choose payment method - Credit Card or Mobile Banking. We support bKash, Nagad, Rocket, and all major cards."
                            },
                            {
                                q: "What happens after my 3 free issue reports?",
                                a: "Once you reach the limit of 3 issues, you'll need to upgrade to Premium to report more issues. Your existing issues will remain active and visible."
                            },
                            {
                                q: "Can I cancel my premium subscription?",
                                a: "Yes, you can cancel anytime. Your premium features will remain active until the end of your billing period. No questions asked."
                            },
                            {
                                q: "Is payment secure on mobile?",
                                a: "Absolutely! We use Stripe for card payments and secure payment gateways for mobile banking. Your payment details are never stored on our servers."
                            }
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                            >
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-8 mb-6">
                        <h3 className="text-2xl font-bold text-white mb-4">Ready to Make a Difference?</h3>
                        <p className="text-white/90 mb-6">Join thousands of premium users making their cities better</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => handlePaymentMethod('monthly')}
                                disabled={processing}
                                className="px-8 py-3 bg-white text-amber-700 font-bold rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {processing && selectedPlan === 'monthly' ? <FaSpinner className="animate-spin" /> : null}
                                Get Premium Monthly
                            </button>
                            <button
                                onClick={() => handlePaymentMethod('yearly')}
                                disabled={processing}
                                className="px-8 py-3 bg-black/20 text-white font-bold rounded-xl border border-white/30 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                            >
                                {processing && selectedPlan === 'yearly' ? <FaSpinner className="animate-spin" /> : null}
                                Get Premium Yearly
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Already premium? <button onClick={() => navigate('/dashboard')} className="text-amber-500 hover:text-amber-600">Go to Dashboard</button>
                    </p>
                </motion.div>

                {/* Security Notice */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                        <FaShieldAlt className="text-green-500" />
                        <span>100% Secure Payment • SSL Encrypted • Money-Back Guarantee</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Premium;