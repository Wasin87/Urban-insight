import React, { useState, useEffect } from 'react';
import { 
    FaPhone, 
    FaEnvelope, 
    FaMapMarkerAlt, 
    FaClock, 
    FaCalendarAlt,
    FaUser,
    FaBuilding,
    FaExclamationCircle,
    FaPaperPlane,
    FaCheckCircle,
    FaShieldAlt,
    FaHeadset,
    FaFileAlt,
    FaWhatsapp,
    FaTelegram,
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaRegCopy,
    FaCheck,
    FaCrown
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import axios from 'axios';
 
 
import useAuth from '../../Hooks/useAuth';
import useAxiosSecure from '../../Hooks/useAxiosSecure';

const Contact = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "winter");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copyStatus, setCopyStatus] = useState({});
    const [userIssueCount, setUserIssueCount] = useState(0);
    const [isPremium, setIsPremium] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        department: '',
        issueType: '',
        location: '',
        description: '',
        priority: 'medium',
        attachments: [],
        agreeToTerms: false
    });

    // Theme management
    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.email) {
                try {
                    const res = await axiosSecure.get(`/users/${user.email}`);
                    setIsPremium(res.data?.isPremium || false);
                    
                    // Fetch user's issue count
                    const issuesRes = await axiosSecure.get(`/issues?email=${user.email}`);
                    setUserIssueCount(issuesRes.data?.length || 0);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };
        
        fetchUserData();
    }, [user, axiosSecure]);

    const departments = [
        'Roads and Highways',
        'Water Supply',
        'Electricity',
        'Sewage and Drainage',
        'Public Transport',
        'Public Parks',
        'Street Lighting',
        'Waste Management',
        'Building Construction',
        'Other'
    ];

    const issueTypes = [
        'Road Damage & Potholes',
        'Bridge & Overpass Safety',
        'Water Supply Disruption',
        'Sewage & Drainage Problems',
        'Electricity Power Failure',
        'Street Light Malfunction',
        'Public Building Safety',
        'Traffic Signal Issues',
        'Public Transport Infrastructure',
        'Waste Management Problems',
        'Telecommunication Network',
        'Public Park Maintenance',
        'Sidewalk & Footpath Issues',
        'Flood Control Infrastructure',
        'Construction Site Safety',
        'Other Infrastructure Issues'
    ];

    const priorities = [
        { value: 'low', label: 'Low Priority', color: 'text-green-600' },
        { value: 'medium', label: 'Medium Priority', color: 'text-amber-600' },
        { value: 'high', label: 'High Priority', color: 'text-yellow-600' },
        { value: 'emergency', label: 'Emergency', color: 'text-red-600' }
    ];

    const emergencyContacts = [
        { 
            department: 'Emergency Control Room', 
            phone: '999', 
            description: 'All emergency services'
        },
        { 
            department: 'Fire Service', 
            phone: '101', 
            description: 'Fire and rescue emergencies'
        },
        { 
            department: 'Police', 
            phone: '100', 
            description: 'Police emergencies'
        },
        { 
            department: 'Ambulance', 
            phone: '102', 
            description: 'Medical emergencies'
        },
        { 
            department: 'Power Emergency', 
            phone: '+880 2 1234 5678', 
            description: '24/7 power outage reports'
        },
        { 
            department: 'Water Emergency', 
            phone: '+880 2 9876 5432', 
            description: 'Water supply issues'
        }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                attachments: Array.from(files)
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Check if user can report more issues
    const canReportMore = () => {
        if (!user) return false;
        if (isPremium) return true;
        return userIssueCount < 3;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.agreeToTerms) {
            toast.error('Please agree to the terms and conditions');
            return;
        }

        if (!formData.fullName || !formData.email || !formData.issueType || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Check if user is logged in
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please login to report an issue',
                confirmButtonText: 'Go to Login',
                confirmButtonColor: '#3085d6',
                background: theme === 'night' ? '#1f2937' : '#ffffff',
                color: theme === 'night' ? '#ffffff' : '#111827'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/login';
                }
            });
            return;
        }

        // Check if user can report more issues
        if (!canReportMore()) {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Reached!',
                html: `
                    <div class="text-left">
                        <p>You have reached the maximum limit of 3 issue reports for free users.</p>
                        <p class="mt-2"><strong>Upgrade to Premium to report unlimited issues!</strong></p>
                        <div class="mt-4 flex items-center gap-2 text-amber-600">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            <span>Premium users enjoy unlimited issue reporting</span>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Go Premium',
                confirmButtonColor: '#f59e0b',
                cancelButtonText: 'Cancel',
                cancelButtonColor: '#6b7280',
                background: theme === 'night' ? '#1f2937' : '#ffffff',
                color: theme === 'night' ? '#ffffff' : '#111827'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/premium';
                }
            });
            return;
        }

        setIsSubmitting(true);

        try {
            let imagesURLs = [];

            // Upload images to imgbb if any
            if (formData.attachments && formData.attachments.length > 0) {
                const imageFiles = Array.from(formData.attachments);

                for (let file of imageFiles) {
                    const formData = new FormData();
                    formData.append('image', file);

                    const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_KEY}`;
                    const res = await axios.post(image_API_URL, formData);
                    imagesURLs.push(res.data.data.url);
                }
            }

            // Prepare issue payload
            const issueData = {
                title: formData.issueType,
                description: formData.description,
                category: formData.department || 'General',
                location: formData.location,
                priority: formData.priority,
                submittedBy: user.email,
                images: imagesURLs,
                status: 'pending',
                isBoosted: false,
                upvotes: 0,
                upvotedBy: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                contactEmail: formData.email,
                contactPhone: formData.phone,
                reporterName: formData.fullName
            };

            // Confirm submission
            const result = await Swal.fire({
                title: "Submit this issue?",
                html: `
                    <div class="text-left">
                        <p>You are reporting a public infrastructure issue.</p>
                        <div class="mt-3 p-3 ${theme === 'night' ? 'bg-gray-800' : 'bg-yellow-50'} rounded-lg">
                            <div class="flex items-center gap-2">
                                <svg class="w-5 h-5 ${theme === 'night' ? 'text-yellow-400' : 'text-yellow-600'}" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                                </svg>
                                <span class="text-sm font-medium ${theme === 'night' ? 'text-yellow-300' : 'text-yellow-800'}">
                                    ${!isPremium ? `Free user: ${userIssueCount + 1}/3 reports used` : 'Premium user: Unlimited reports'}
                                </span>
                            </div>
                        </div>
                    </div>
                `,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, submit report",
                cancelButtonText: "Cancel",
                background: theme === 'night' ? '#1f2937' : '#ffffff',
                color: theme === 'night' ? '#ffffff' : '#111827'
            });

            if (result.isConfirmed) {
                const response = await axiosSecure.post('/issues', issueData);

                if (response.data.insertedId) {
                    Swal.fire({
                        position: "top-center",
                        icon: "success",
                        title: "Issue Report Submitted Successfully!",
                        html: `
                            <div class="text-left">
                                <p>Reference ID: <strong>${response.data.insertedId}</strong></p>
                                <div class="mt-3 p-3 ${theme === 'night' ? 'bg-gray-800' : 'bg-blue-50'} rounded-lg">
                                    <div class="flex items-center gap-2">
                                        ${!isPremium ? `
                                            <svg class="w-5 h-5 ${theme === 'night' ? 'text-yellow-400' : 'text-amber-600'}" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                            <span class="text-sm ${theme === 'night' ? 'text-yellow-300' : 'text-blue-800'}">
                                                Reports used: ${userIssueCount + 1}/3. 
                                                <a href="/premium" class="${theme === 'night' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline">Go Premium</a> for unlimited reports!
                                            </span>
                                        ` : `
                                            <svg class="w-5 h-5 ${theme === 'night' ? 'text-green-400' : 'text-green-600'}" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                            </svg>
                                            <span class="text-sm ${theme === 'night' ? 'text-green-300' : 'text-green-800'}">
                                                Premium user: Unlimited reporting enabled
                                            </span>
                                        `}
                                    </div>
                                </div>
                            </div>
                        `,
                        showConfirmButton: true,
                        timer: 5000,
                        background: theme === 'night' ? '#1f2937' : '#ffffff',
                        color: theme === 'night' ? '#ffffff' : '#111827'
                    }).then(() => {
                        // Reset form
                        setFormData({
                            fullName: user?.displayName || '',
                            email: user?.email || '',
                            phone: '',
                            department: '',
                            issueType: '',
                            location: '',
                            description: '',
                            priority: 'medium',
                            attachments: [],
                            agreeToTerms: false
                        });
                        
                        // Update issue count
                        setUserIssueCount(prev => prev + 1);
                        
                        toast.success('Infrastructure issue reported successfully!');
                    });
                } else {
                    throw new Error('Failed to submit issue');
                }
            }

        } catch (error) {
            console.error('Error submitting issue:', error);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.message || 'Failed to submit issue report. Please try again.',
                confirmButtonColor: "#d33",
                background: theme === 'night' ? '#1f2937' : '#ffffff',
                color: theme === 'night' ? '#ffffff' : '#111827'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus(prev => ({ ...prev, [id]: true }));
            toast.success('Copied to clipboard!');
            
            setTimeout(() => {
                setCopyStatus(prev => ({ ...prev, [id]: false }));
            }, 2000);
        });
    };

    const handleEmergencyCall = (phone) => {
        Swal.fire({
            title: 'Emergency Call',
            text: `Call ${phone}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Call Now',
            cancelButtonText: 'Cancel',
            background: theme === 'night' ? '#1f2937' : '#ffffff',
            color: theme === 'night' ? '#ffffff' : '#111827',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `tel:${phone}`;
            }
        });
    };

    const quickIssueButtons = [
        { label: 'Report Pothole', icon: '🕳️', type: 'Road Damage & Potholes' },
        { label: 'Power Outage', icon: '💡', type: 'Electricity Power Failure' },
        { label: 'Water Leak', icon: '💧', type: 'Water Supply Disruption' },
        { label: 'Street Light', icon: '🚦', type: 'Street Light Malfunction' },
        { label: 'Garbage Issue', icon: '🗑️', type: 'Waste Management Problems' },
        { label: 'Flooding', icon: '🌊', type: 'Sewage & Drainage Problems' }
    ];

    const handleQuickIssue = (issueType) => {
        // Auto-fill user data if logged in
        setFormData(prev => ({
            ...prev,
            fullName: user?.displayName || prev.fullName,
            email: user?.email || prev.email,
            issueType: issueType,
            priority: issueType.includes('Emergency') ? 'high' : 'medium'
        }));
        
        // Scroll to form
        document.getElementById('report-form').scrollIntoView({ behavior: 'smooth' });
        
        toast.info(`Quick report: ${issueType} selected`);
    };

    // Pre-fill form with user data if logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.displayName || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-amber-600 to-amber-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                            <FaExclamationCircle className="text-amber-200" />
                            <span className="text-sm font-medium">Infrastructure Issues</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Report Infrastructure Issues
                        </h1>
                        
                        <p className="text-xl text-amber-100 mb-8 max-w-3xl mx-auto">
                            Help us maintain and improve public infrastructure. Your reports make our city better.
                        </p>
                        
                        {/* User Status Banner */}
                        {user && (
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl mb-6">
                                {isPremium ? (
                                    <>
                                        <FaCrown className="text-amber-300" />
                                        <span className="font-semibold">Premium User - Unlimited Reports</span>
                                    </>
                                ) : (
                                    <>
                                        <FaExclamationCircle className="text-amber-300" />
                                        <span className="font-semibold">
                                            Free User: {userIssueCount}/3 reports used
                                        </span>
                                        {userIssueCount >= 3 && (
                                            <a 
                                                href="/premium" 
                                                className="ml-2 px-3 py-1 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
                                            >
                                                Upgrade
                                            </a>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="flex items-center gap-2">
                                <FaClock className="text-amber-200" />
                                <span>24/7 Support</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaShieldAlt className="text-amber-200" />
                                <span>Secure Reporting</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-amber-200" />
                                <span>Guaranteed Response</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Quick Report Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quick Report Common Issues</h2>
                        <p className="text-gray-600 dark:text-gray-300">Select an issue to quickly fill the report form</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                        {quickIssueButtons.map((button, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuickIssue(button.type)}
                                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                            >
                                <span className="text-2xl mb-2">{button.icon}</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                                    {button.label}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Left Column - Contact Information */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Contact Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <FaHeadset className="text-amber-600" />
                                Contact Information
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <FaPhone className="text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Helpline</h4>
                                        <p className="text-gray-600 dark:text-gray-400">+880 1774178772</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">24/7 available</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <FaEnvelope className="text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                                        <p className="text-gray-600 dark:text-gray-400">infrastructure@urbaninsight.gov</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">Response within 24 hours</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <FaMapMarkerAlt className="text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Office Address</h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Infrastructure Department<br />
                                            Urban Insight Building<br />
                                            Dhaka 1212, Bangladesh
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Working Hours */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <FaClock className="text-amber-600 dark:text-amber-400" />
                                Working Hours
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <span className="font-medium text-gray-900 dark:text-white">Sunday - Thursday</span>
                                    <span className="text-amber-700 dark:text-amber-300 font-semibold">9:00 AM - 5:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <span className="font-medium text-gray-900 dark:text-white">Friday - Saturday</span>
                                    <span className="text-amber-700 dark:text-amber-300 font-semibold">Emergency Only</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <span className="font-medium text-gray-900 dark:text-white">Online Support</span>
                                    <span className="text-amber-700 dark:text-amber-300 font-semibold">24/7 Available</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Emergency Contacts */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <FaExclamationCircle className="text-amber-600 dark:text-amber-400" />
                                Emergency Contacts
                            </h3>
                            
                            <div className="space-y-3">
                                {emergencyContacts.map((contact, index) => (
                                    <div 
                                        key={index}
                                        className="p-3 rounded-lg border border-amber-100 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-700 transition-colors cursor-pointer"
                                        onClick={() => handleEmergencyCall(contact.phone)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{contact.department}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{contact.description}</p>
                                            </div>
                                            <button 
                                                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(contact.phone, `emergency-${index}`);
                                                }}
                                            >
                                                {copyStatus[`emergency-${index}`] ? <FaCheck /> : <FaRegCopy />}
                                            </button>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{contact.phone}</span>
                                            <button className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                                                Call Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Social Media */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Connect With Us</h3>
                            
                            <div className="grid grid-cols-4 gap-3">
                                <a 
                                    href="https://www.facebook.com/wasin.ahmed.79/" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center px-3 py-2 transition-colors group"
                                >
                                    <FaFacebook className="text-blue-600 dark:text-blue-400 text-3xl mb-1" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">Facebook</span>
                                </a>
                  
                                <a 
                                    href="https://www.whatsapp.com/" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center px-3 py-2 transition-colors group"
                                >
                                    <FaWhatsapp className="text-green-500 dark:text-green-400 text-3xl mb-1" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-green-500 dark:group-hover:text-green-400">WhatsApp</span>
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Report Form */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
                            id="report-form"
                        >
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Report Infrastructure Issue</h2>
                                <p className="text-gray-600 dark:text-gray-400">Fill out the form below to report infrastructure issues. All fields marked with * are required.</p>
                            </div>

                            {/* Login Warning for non-users */}
                            {!user && (
                                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FaExclamationCircle className="text-yellow-600 dark:text-yellow-400 text-xl" />
                                        <div>
                                            <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Login Required</h4>
                                            <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                                                Please login to report issues. Free users can report up to 3 issues.
                                            </p>
                                            <div className="mt-3 flex gap-3">
                                                <a
                                                    href="/login"
                                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    Login
                                                </a>
                                                <a
                                                    href="/premium"
                                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                                                >
                                                    <FaCrown className="w-3 h-3" />
                                                    Go Premium
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Information */}
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2">
                                        <FaUser className="text-amber-600 dark:text-amber-400" />
                                        Personal Information
                                    </h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors"
                                                placeholder="Enter your full name"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors"
                                                placeholder="your.email@example.com"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors"
                                                placeholder="+880 1XXX XXXXXX"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Department (Optional)
                                            </label>
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                    Select Department
                                                </option>
                                                {departments.map((dept, index) => (
                                                    <option 
                                                        key={index} 
                                                        value={dept}
                                                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    >
                                                        {dept}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Issue Details */}
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2">
                                        <FaExclamationCircle className="text-amber-600 dark:text-amber-400" />
                                        Issue Details
                                    </h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Issue Type *
                                            </label>
                                            <select
                                                name="issueType"
                                                value={formData.issueType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors"
                                                required
                                                disabled={isSubmitting}
                                            >
                                                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                    Select Issue Type
                                                </option>
                                                {issueTypes.map((type, index) => (
                                                    <option 
                                                        key={index} 
                                                        value={type}
                                                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    >
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Location *
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors"
                                                placeholder="Street name, area, or landmark"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Priority Level
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {priorities.map((priority) => (
                                                    <label 
                                                        key={priority.value}
                                                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                                                            formData.priority === priority.value 
                                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' 
                                                                : 'border-gray-300 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="priority"
                                                            value={priority.value}
                                                            checked={formData.priority === priority.value}
                                                            onChange={handleChange}
                                                            className="hidden"
                                                            disabled={isSubmitting}
                                                        />
                                                        <span className={`font-medium ${priority.color}`}>
                                                            {priority.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Detailed Description *
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="4"
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors"
                                                placeholder="Please describe the issue in detail..."
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Attach Photos (Optional)
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-amber-400 dark:hover:border-amber-500 transition-colors">
                                                <input
                                                    type="file"
                                                    name="attachments"
                                                    onChange={handleChange}
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="file-upload"
                                                    disabled={isSubmitting}
                                                />
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    <div className="text-amber-500 dark:text-amber-400 mb-2">
                                                        <FaFileAlt className="text-3xl mx-auto" />
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300">Click to upload photos of the issue</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Supports JPG, PNG up to 5MB each</p>
                                                </label>
                                                {formData.attachments.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                                            {formData.attachments.length} file(s) selected
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="p-4 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onChange={handleChange}
                                            className="mt-1 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                            disabled={isSubmitting}
                                        />
                                        <div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                I agree that the information provided is accurate to the best of my knowledge. 
                                                I understand that false reports may lead to legal action.
                                            </span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                By submitting this form, you consent to the collection and use of your information 
                                                for the purpose of resolving the reported issue.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
                                    <div className="text-sm">
                                        <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <FaShieldAlt className="text-amber-500 dark:text-amber-400" />
                                            Your information is secure and protected
                                        </p>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !user || (!isPremium && userIssueCount >= 3)}
                                        className={`px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 ${
                                            isSubmitting || !user || (!isPremium && userIssueCount >= 3)
                                                ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed text-gray-300 dark:text-gray-500'
                                                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white hover:shadow-xl hover:scale-105 active:scale-95'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Submitting...
                                            </>
                                        ) : !user ? (
                                            'Login to Report'
                                        ) : !isPremium && userIssueCount >= 3 ? (
                                            <>
                                                <FaCrown />
                                                Upgrade to Premium
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane />
                                                Submit Issue Report {!isPremium ? `(${userIssueCount}/3)` : ''}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Help text */}
                                {user && !isPremium && userIssueCount < 3 && (
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        You have {3 - userIssueCount} free reports remaining
                                    </p>
                                )}
                            </form>
                        </motion.div>

                        {/* Additional Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 grid md:grid-cols-3 gap-6"
                        >
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
                                <div className="text-amber-600 dark:text-amber-400 text-2xl mb-3">⏱️</div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Response Time</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">We aim to respond within 24 hours and resolve issues within 3-7 working days.</p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
                                <div className="text-amber-600 dark:text-amber-400 text-2xl mb-3">📱</div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Mobile App</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Download our mobile app for faster reporting and real-time updates.</p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
                                <div className="text-amber-600 dark:text-amber-400 text-2xl mb-3">🏆</div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Community Impact</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Your reports help improve infrastructure for over 1 million citizens.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white py-12 mt-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl font-bold mb-2">15,847</div>
                            <div className="text-amber-200">Issues Reported</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">94%</div>
                            <div className="text-amber-200">Resolution Rate</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">24h</div>
                            <div className="text-amber-200">Avg. Response Time</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">4.8★</div>
                            <div className="text-amber-200">Citizen Satisfaction</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;