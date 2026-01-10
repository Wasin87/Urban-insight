import React, { useState } from 'react';
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
    FaCheck
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Contact = () => {
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copyStatus, setCopyStatus] = useState({});

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
        'Potholes and Road Damage',
        'Water Leakage',
        'Power Outage',
        'Flooding Issues',
        'Broken Street Lights',
        'Garbage Collection',
        'Traffic Signal Issues',
        'Bridge Maintenance',
        'Public Toilet Issues',
        'Playground Equipment'
    ];

    const priorities = [
        { value: 'low', label: 'Low Priority', color: 'text-green-600' },
        { value: 'medium', label: 'Medium Priority', color: 'text-amber-600' },
        { value: 'high', label: 'High Priority', color: 'text-yellow-600' },
        { value: 'emergency', label: 'Emergency', color: 'text-amber-500' }
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

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            Swal.fire({
                title: 'Report Submitted Successfully!',
                html: `
                    <div class="text-left space-y-3">
                        <p><strong>Reference ID:</strong> INF-${Date.now().toString().slice(-8)}</p>
                        <p><strong>Issue Type:</strong> ${formData.issueType}</p>
                        <p><strong>Priority:</strong> ${formData.priority.toUpperCase()}</p>
                        <p class="text-amber-600">You will receive a confirmation email within 24 hours.</p>
                        <div class="bg-amber-50 p-3 rounded-lg">
                            <p class="text-sm">Track your report status using the reference ID.</p>
                        </div>
                    </div>
                `,
                icon: 'success',
                confirmButtonColor: '#f59e0b',
                confirmButtonText: 'Download Report Copy'
            }).then(() => {
                // Reset form
                setFormData({
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
                
                // Show success message
                toast.success('Infrastructure issue reported successfully!');
            });
            
            setIsSubmitting(false);
        }, 1500);
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
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `tel:${phone}`;
            }
        });
    };

    const quickIssueButtons = [
        { label: 'Report Pothole', icon: '🕳️', type: 'Potholes and Road Damage' },
        { label: 'Power Outage', icon: '💡', type: 'Power Outage' },
        { label: 'Water Leak', icon: '💧', type: 'Water Leakage' },
        { label: 'Street Light', icon: '🚦', type: 'Broken Street Lights' },
        { label: 'Garbage Issue', icon: '🗑️', type: 'Garbage Collection' },
        { label: 'Flooding', icon: '🌊', type: 'Flooding Issues' }
    ];

    const handleQuickIssue = (issueType) => {
        setFormData(prev => ({
            ...prev,
            issueType: issueType,
            priority: issueType === 'Power Outage' ? 'high' : 'medium'
        }));
        
        // Scroll to form
        document.getElementById('report-form').scrollIntoView({ behavior: 'smooth' });
        
        toast.info(`Quick report: ${issueType} selected`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
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
                        <h2 className="text-3xl font-bold  mb-4">Quick Report Common Issues</h2>
                        <p className="text-gray-600 dark:text-gray-300">Select an issue to quickly fill the report form</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                        {quickIssueButtons.map((button, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuickIssue(button.type)}
                                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white hover:border-amber-300 group"
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
                            className="bg-white dark:bg-gray-800 dark:text-gray-50 rounded-2xl shadow-lg p-6 border border-white hover:border-amber-300"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FaHeadset className="text-amber-600" />
                                Contact Information
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50  dark:bg-gray-700 rounded-lg">
                                        <FaPhone className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold ">Helpline</h4>
                                        <p className="text-gray-400">+880 1774178772</p>
                                        <p className="text-sm text-gray-400">24/7 available</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50  dark:bg-gray-700 rounded-lg">
                                        <FaEnvelope className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold ">Email</h4>
                                        <p className="text-gray-400">infrastructure@urbaninsight.gov</p>
                                        <p className="text-sm text-gray-400">Response within 24 hours</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 dark:bg-gray-700 rounded-lg">
                                        <FaMapMarkerAlt className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold ">Office Address</h4>
                                        <p className=" text-gray-400">
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
                            className="bg-white dark:bg-gray-800  dark:text-gray-50 rounded-2xl shadow-lg p-6 border border-white hover:border-amber-300"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FaClock className="text-amber-600" />
                                Working Hours
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-gray-700 rounded-lg">
                                    <span className="font-medium ">Sunday - Thursday</span>
                                    <span className="text-amber-700 dark:text-amber-200 font-semibold">9:00 AM - 5:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-gray-700 rounded-lg">
                                    <span className="font-medium">Friday - Saturday</span>
                                    <span className="text-amber-700 dark:text-amber-200 font-semibold">Emergency Only</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-gray-700 rounded-lg">
                                    <span className="font-medium ">Online Support</span>
                                    <span className="text-amber-700 dark:text-amber-200 font-semibold">24/7 Available</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Emergency Contacts */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="c  rounded-2xl shadow-lg p-6 border border-white hover:border-amber-300"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FaExclamationCircle className="text-amber-600" />
                                Emergency Contacts
                            </h3>
                            
                            <div className="space-y-3">
                                {emergencyContacts.map((contact, index) => (
                                    <div 
                                        key={index}
                                        className="p-3 rounded-lg border border-amber-100 hover:border-amber-300 transition-colors cursor-pointer"
                                        onClick={() => handleEmergencyCall(contact.phone)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{contact.department}</h4>
                                                <p className="text-sm text-gray-400">{contact.description}</p>
                                            </div>
                                            <button 
                                                className="text-amber-600 hover:text-amber-700 font-semibold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(contact.phone, `emergency-${index}`);
                                                }}
                                            >
                                                {copyStatus[`emergency-${index}`] ? <FaCheck /> : <FaRegCopy />}
                                            </button>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-lg font-bold text-amber-600">{contact.phone}</span>
                                            <button className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-lg hover:bg-amber-200 transition-colors">
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
                            className="bg-white dark:bg-gray-800  dark:text-gray-50  rounded-2xl shadow-lg p-6 border border-white  hover:border-amber-300"
                        >
                            <h3 className="text-xl font-bold   mb-6">Connect With Us</h3>
                            
                            <div className="grid grid-cols-4 gap-3">
                                <a 
                                    href="https://www.facebook.com/wasin.ahmed.79/" 
                                    className="flex flex-col items-center px-3 py-2   transition-colors group"
                                >
                                    <FaFacebook className="text-blue-600 text-3xl mb-1" />
                                    <span className="text-xs text-gray-600 px-3 py-2 dark:text-gray-50 group-hover:text-blue-600">Facebook</span>
                                </a>
 
                  
                                <a 
                                    href="https://www.whatsapp.com/" 
                                    className="flex flex-col items-center px-3 py-2   transition-colors group"
                                >
                                    <FaWhatsapp className="text-green-400 text-3xl mb-1" />
                                    <span className="text-xs text-gray-600 px-3 py-2 dark:text-gray-50 group-hover:text-green-400">WhatsApp</span>
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
                            className="bg-white dark:bg-gray-800  dark:text-gray-50 rounded-2xl shadow-xl p-6 md:p-8 border border-white hover:border-amber-300"
                            id="report-form"
                        >
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Infrastructure Issue</h2>
                                <p className="">Fill out the form below to report infrastructure issues. All fields marked with * are required.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Information */}
                                <div className="bg-white dark:bg-gray-800  dark:text-gray-50 p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 *: mb-4 flex items-center gap-2">
                                        <FaUser className="text-amber-600 dark:text-amber-200" />
                                        Personal Information
                                    </h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium  mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium   mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                placeholder="your.email@example.com"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium   mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                placeholder="+880 1XXX XXXXXX"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium   mb-2">
                                                Department (Optional)
                                            </label>
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map((dept, index) => (
                                                    <option key={index} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Issue Details */}
                                <div className="bg-white dark:bg-gray-800  dark:text-gray-50 p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                                        <FaExclamationCircle className="text-amber-600 dark:text-amber-200" />
                                        Issue Details
                                    </h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium   mb-2">
                                                Issue Type *
                                            </label>
                                            <select
                                                name="issueType"
                                                value={formData.issueType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                required
                                            >
                                                <option value="">Select Issue Type</option>
                                                {issueTypes.map((type, index) => (
                                                    <option key={index} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium   mb-2">
                                                Location *
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                placeholder="Street name, area, or landmark"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium  mb-2">
                                                Priority Level
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {priorities.map((priority) => (
                                                    <label 
                                                        key={priority.value}
                                                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                                                            formData.priority === priority.value 
                                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-100' 
                                                                : 'border-gray-300 hover:border-amber-300 dark:border-gray-400'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="priority"
                                                            value={priority.value}
                                                            checked={formData.priority === priority.value}
                                                            onChange={handleChange}
                                                            className="hidden"
                                                        />
                                                        <span className={`font-medium ${priority.color}`}>
                                                            {priority.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium   mb-2">
                                                Detailed Description *
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="4"
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                placeholder="Please describe the issue in detail..."
                                                required
                                            />
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium  mb-2">
                                                Attach Photos (Optional)
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-100 rounded-lg p-6 text-center hover:border-amber-400 transition-colors">
                                                <input
                                                    type="file"
                                                    name="attachments"
                                                    onChange={handleChange}
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="file-upload"
                                                />
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    <div className="text-amber-500 mb-2">
                                                        <FaFileAlt className="text-3xl mx-auto" />
                                                    </div>
                                                    <p className="">Click to upload photos of the issue</p>
                                                    <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG up to 5MB each</p>
                                                </label>
                                                {formData.attachments.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-sm text-amber-600">
                                                            {formData.attachments.length} file(s) selected
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="p-4 border border-amber-200 rounded-lg">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onChange={handleChange}
                                            className="mt-1 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                        />
                                        <div>
                                            <span className="text-sm ">
                                                I agree that the information provided is accurate to the best of my knowledge. 
                                                I understand that false reports may lead to legal action.
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                By submitting this form, you consent to the collection and use of your information 
                                                for the purpose of resolving the reported issue.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
                                    <div className="text-sm">
                                        <p className="flex items-center gap-2">
                                            <FaShieldAlt className="text-amber-500" />
                                            Your information is secure and protected
                                        </p>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane />
                                                Submit Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>

                        {/* Additional Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 grid md:grid-cols-3 gap-6 "
                        >
                            <div className="bg-white dark:bg-gray-800  dark:text-gray-50 p-5 rounded-xl shadow-lg border border-white hover:border-amber-300 transition-colors">
                                <div className="text-amber-600 text-2xl mb-3">⏱️</div>
                                <h4 className="font-bold mb-2">Response Time</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">We aim to respond within 24 hours and resolve issues within 3-7 working days.</p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800  dark:text-gray-50 p-5 rounded-xl shadow-lg border border-amber-100">
                                <div className="text-amber-600 text-2xl mb-3">📱</div>
                                <h4 className="font-bold  mb-2">Mobile App</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Download our mobile app for faster reporting and real-time updates.</p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800  dark:text-gray-50 p-5 rounded-xl shadow-lg border border-amber-100">
                                <div className="text-amber-600 text-2xl mb-3">🏆</div>
                                <h4 className="font-bold  mb-2">Community Impact</h4>
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