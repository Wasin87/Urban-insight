import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { FaArrowLeft, FaCalendar, FaMapMarkerAlt, FaUser, FaTag, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';
import Loading from '../Auth/SocialLogin/Loading';

const IssueDetails = () => {
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    // Fetch single issue by ID
    const { data: issue, isLoading, error } = useQuery({
        queryKey: ['issueDetails', id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/issues/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
           <Loading></Loading>
        );
    }

    if (error) {
        console.error(error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Issue</h2>
                    <p className="text-red-600 mb-4">Unable to load issue details. Please try again.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 max-w-md">
                    <div className="text-gray-500 text-5xl mb-4">🔍</div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Issue Not Found</h2>
                    <p className="text-gray-600 mb-4">The requested issue could not be found.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Status configuration
    const statusConfig = {
        pending: {
            icon: <FaClock className="text-lg" />,
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            darkColor: 'dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
            label: 'Pending'
        },
        in_progress: {
            icon: <FaExclamationTriangle className="text-lg" />,
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            darkColor: 'dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
            label: 'In Progress'
        },
        resolved: {
            icon: <FaCheckCircle className="text-lg" />,
            color: 'bg-green-100 text-green-800 border-green-200',
            darkColor: 'dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
            label: 'Resolved'
        },
        closed: {
            icon: <FaCheckCircle className="text-lg" />,
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            darkColor: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
            label: 'Closed'
        }
    };

    // Priority configuration
    const priorityConfig = {
        high: {
            color: 'bg-red-100 text-red-800 border-red-200',
            darkColor: 'dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
        },
        medium: {
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            darkColor: 'dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700'
        },
        low: {
            color: 'bg-green-100 text-green-800 border-green-200',
            darkColor: 'dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
        }
    };

    const status = statusConfig[issue.status] || statusConfig.pending;
    const priority = priorityConfig[issue.priority?.toLowerCase()] || priorityConfig.medium;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-gray-800 rounded-lg border border-gray-500 dark:border-gray-700 hover:bg-amber-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                    >
                        <FaArrowLeft className="text-gray-600 dark:text-gray-400 group-hover:text-black-600 dark:group-hover:text-amber-400 transition" />
                        <span className="font-medium text-black dark:text-amber-300 group-hover:text-black dark:group-hover:text-amber-400 transition">
                            Back
                        </span>
                    </button>
                    
                    <div className="flex gap-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.color} ${status.darkColor} font-medium`}>
                            {status.icon}
                            {status.label}
                        </span>
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${priority.color} ${priority.darkColor} font-medium`}>
                            <FaExclamationTriangle />
                            {issue.priority} Priority
                        </span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Image Section */}
                    {issue.images && issue.images.length > 0 ? (
                        <div className="relative h-80 sm:h-96 overflow-hidden">
                            <img
                                src={issue.images[0]}
                                alt={issue.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1.5 bg-black/70 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                                    {issue.images.length} {issue.images.length === 1 ? 'Photo' : 'Photos'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center">
                            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📷</div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No Image Available</p>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="p-6 sm:p-8">
                        {/* Title Section */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                {issue.title}
                            </h1>
                            <div className="h-1 w-16 bg-amber-500 rounded-full"></div>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                Description
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {issue.description}
                                </p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Category */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <FaTag className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h4>
                                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{issue.category}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <FaMapMarkerAlt className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h4>
                                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{issue.location}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submitted By */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <FaUser className="text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted By</h4>
                                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{issue.submittedBy || 'Anonymous'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Date Submitted */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <FaCalendar className="text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Submitted</h4>
                                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                            {issue.createdAt ? formatDate(issue.createdAt) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Images */}
                        {issue.images && issue.images.length > 1 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Additional Images
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {issue.images.slice(1).map((img, index) => (
                                        <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                                            <img
                                                src={img}
                                                alt={`Issue ${index + 2}`}
                                                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ID Reference */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Issue ID: <span className="font-mono text-gray-700 dark:text-gray-300">{id}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetails;