import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import useAuth from '../../Hooks/useAuth';
import { FaThumbsUp, FaEye, FaExclamationTriangle, FaClock, FaCheckCircle, FaMapMarkerAlt, FaTag, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { MdPriorityHigh } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Service = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [upvotedIssues, setUpvotedIssues] = useState([]);
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch latest 6 issues from backend
    useEffect(() => {
        const fetchLatestIssues = async () => {
            try {
                setLoading(true);
                 
                const res = await axiosSecure.get('/issues');
                const allIssues = res.data || [];
                
               
                const activeIssues = allIssues.filter(issue => 
                    issue.status !== 'resolved' && issue.status !== 'rejected'
                );
                
               
                const sortedIssues = activeIssues
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 6);
                
                setIssues(sortedIssues);
            } catch (error) {
                console.error('Error fetching issues:', error);
                toast.error('Failed to load issues. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchLatestIssues();

       
        const savedUpvotes = localStorage.getItem('upvotedIssues');
        if (savedUpvotes) {
            setUpvotedIssues(JSON.parse(savedUpvotes));
        }
    }, [axiosSecure]);

    
    const handleUpvote = async (issue) => {
        // Check if user is logged in
        if (!user) {
            toast.warning('Please login to upvote issues!', {
                autoClose: 3000,
                onClick: () => navigate('/login')
            });
            return;
        }

        
        if (user.email === issue.submittedBy) {
            toast.info("You can't upvote your own issue!");
            return;
        }

        // Check if already upvoted
        if (upvotedIssues.includes(issue._id)) {
            toast.info('You have already upvoted this issue!');
            return;
        }

        try {
            
            const newUpvotedIssues = [...upvotedIssues, issue._id];
            setUpvotedIssues(newUpvotedIssues);
            
           
            localStorage.setItem('upvotedIssues', JSON.stringify(newUpvotedIssues));
            
             
            const updateData = {
                upvotes: (issue.upvotes || 0) + 1,
                upvotedBy: [...(issue.upvotedBy || []), user.email]
            };

            await axiosSecure.patch(`/issues/${issue._id}`, updateData);
            
           
            setIssues(prevIssues =>
                prevIssues.map(item =>
                    item._id === issue._id
                        ? { ...item, upvotes: (item.upvotes || 0) + 1 }
                        : item
                )
            );

            toast.success('Upvoted successfully!', {
                icon: '👍',
                position: "top-right",
                autoClose: 2000,
            });
        } catch (error) {
            console.error('Error upvoting:', error);
            toast.error('Failed to upvote. Please try again.');
        }
    };

     
    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return { 
                    icon: <FaClock />, 
                    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    text: 'Pending'
                };
            case 'resolved':
                return { 
                    icon: <FaCheckCircle />, 
                    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    text: 'Resolved'
                };
            case 'in-progress':
                return { 
                    icon: <FaExclamationTriangle />, 
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    text: 'In Progress'
                };
            case 'assigned':
                return { 
                    icon: <FaUser />, 
                    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                    text: 'Assigned'
                };
            case 'rejected':
                return { 
                    icon: <FaExclamationTriangle />, 
                    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    text: 'Rejected'
                };
            default:
                return { 
                    icon: <FaClock />, 
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                    text: status || 'Unknown'
                };
        }
    };

    // Get priority icon and color
    const getPriorityInfo = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
            case 'emergency':
                return { 
                    icon: <MdPriorityHigh />, 
                    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    text: 'High'
                };
            case 'medium':
            case 'normal':
                return { 
                    icon: <MdPriorityHigh />, 
                    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    text: 'Medium'
                };
            case 'low':
                return { 
                    icon: <MdPriorityHigh />, 
                    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    text: 'Low'
                };
            default:
                return { 
                    icon: <MdPriorityHigh />, 
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                    text: priority || 'Normal'
                };
        }
    };

    // Get issue image or placeholder
    const getIssueImage = (issue) => {
        if (issue.images && issue.images.length > 0) {
            return issue.images[0];
        }
        // Return a placeholder based on issue type
        if (issue.issueType === 'infrastructure') {
            return 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        } else if (issue.issueType === 'environment') {
            return 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        } else if (issue.issueType === 'safety') {
            return 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        } else {
            return 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <section className="px-4 py-16 bg-linear-to-r from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="inline-block animate-pulse h-12 w-64 bg-linear-to-r from-amber-200 to-amber-300 dark:from-amber-600 dark:to-amber-700 rounded-lg mb-4"></div>
                        <div className="inline-block animate-pulse h-4 w-96 bg-linear-to-r from-amber-200 to-amber-300 dark:from-amber-600 dark:to-amber-700 rounded mx-auto"></div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                                <div className="h-40 bg-linear-to-r from-amber-200 to-amber-300 dark:from-gray-700 dark:to-gray-600"></div>
                                <div className="p-6">
                                    <div className="h-6 bg-linear-to-r from-amber-200 to-amber-300 dark:from-gray-700 dark:to-gray-600 rounded mb-4"></div>
                                    <div className="h-4 bg-linear-to-r from-amber-200 to-amber-300 dark:from-gray-700 dark:to-gray-600 rounded mb-2"></div>
                                    <div className="h-4 bg-linear-to-r from-amber-200 to-amber-300 dark:from-gray-700 dark:to-gray-600 rounded mb-2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="px-4 py-16 bg-linear-to-r from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-4">
                        Latest Community Issues
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Stay updated with the most recent infrastructure issues reported by our community.
                        Help prioritize solutions by upvoting important issues.
                    </p>
                </div>

                {/* Issues Grid */}
                {issues.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                        <FaExclamationTriangle className="text-6xl text-amber-400 dark:text-amber-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            No Active Issues Reported
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            All reported issues have been resolved or are currently being addressed.
                        </p>
                        <button
                            onClick={() => navigate('/addIssues')}
                            className="px-6 py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            Report New Issue
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {issues.map((issue) => {
                            const statusInfo = getStatusInfo(issue.status);
                            // const priorityInfo = getPriorityInfo(issue.priority);
                            const isOwner = user?.email === issue.submittedBy;
                            const isUpvoted = upvotedIssues.includes(issue._id);
                            const issueImage = getIssueImage(issue);

                            return (
                                <div
                                    key={issue._id}
                                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-400 dark:border-gray-400 overflow-hidden"
                                >
                                    {/* Issue Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img 
                                            src={issueImage}
                                            alt={issue.issueTitle || 'Issue image'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                {statusInfo.text}
                                            </span>
                                        </div>
                                        {issue.isBoosted && (
                                            <div className="absolute top-3 left-3">
                                                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-amber-800 to-amber-400 text-white">
                                                    ⚡ Boosted
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Issue Content */}
                                    <div className="p-6">
                                        {/* Issue Header */}
                                        <div className="mb-4">
                                            <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                {issue.issueTitle || issue.title || 'Untitled Issue'}
                                            </h3>
                                            {/* <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <FaCalendarAlt className="text-amber-500" />
                                                <span className="font-medium">{formatDate(issue.createdAt)}</span>
                                                <span className="text-xs">• {formatTime(issue.createdAt)}</span>
                                            </div> */}
                                        </div>

                                        {/* Issue Details */}
                                        <div className="space-y-3 mb-4">
                                            {/* Issue Type */}
                                            <div className="flex items-center gap-2">
                                                <FaTag className="text-amber-500 dark:text-amber-400" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
                                                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium capitalize">
                                                    {issue.issueType || issue.category || 'General'}
                                                </span>
                                            </div>

                                            {/* Priority
                                            <div className="flex items-center gap-2">
                                                <MdPriorityHigh className="text-amber-500 dark:text-amber-400" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                                                    {priorityInfo.icon}
                                                    {priorityInfo.text}
                                                </span>
                                            </div> */}

                                            {/* Location */}
                                            <div className="flex items-start gap-2">
                                                <FaMapMarkerAlt className="text-amber-500 dark:text-amber-400 mt-1" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                                    {issue.district || issue.location || 'Location not specified'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Issue Description
                                        <div className="mb-6">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                {issue.description || 'No description provided'}
                                            </p>
                                        </div> */}

                                        {/* Reporter Info */}
                                        {issue.submittedBy && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                                <FaUser className="text-amber-500" />
                                                <span className="font-medium">Reported by:</span>
                                                <span className="truncate">
                                                    {issue.submittedBy.split('@')[0]}
                                                </span>
                                            </div>
                                        )}

                                        {/* Stats and Actions */}
                                        <div className="flex items-center justify-between ">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <FaThumbsUp className={`text-sm ${isUpvoted ? 'text-amber-500' : 'text-gray-400'}`} />
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        {issue.upvotes || 0} 
                                                    </span>
                                                </div>
                                                {issue.comments && (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {issue.comments.length || 0} comments
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                {/* Upvote Button */}
                                                <button
                                                    onClick={() => handleUpvote(issue)}
                                                    disabled={isOwner || isUpvoted}
                                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                        isOwner
                                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                                                            : isUpvoted
                                                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300 cursor-default'
                                                            : 'bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                                                    }`}
                                                    title={isOwner ? "Can't upvote your own issue" : isUpvoted ? "Already upvoted" : "Upvote this issue"}
                                                >
                                                    <FaThumbsUp />
                                                    {isUpvoted ? 'Upvoted' : 'Upvote'}
                                                </button>

                                                {/* View Details Button */}
                                                <button
                                                    onClick={() => navigate(`/dashboard/issueDetails/${issue._id}`)}
                                                    className="flex items-center gap-1 px-3 py-2 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                                >
                                                    <FaEye />
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* View All Button */}
                {issues.length > 0 && (
                    <div className="text-center mt-10">
                        <button
                            onClick={() => navigate('/allIssues')}
                            className="px-8 py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                        >
                            View All Issues →
                        </button>
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-100 dark:border-gray-700">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full mb-3">
                                <FaThumbsUp className="text-amber-600 dark:text-amber-400 text-xl" />
                            </div>
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Community Upvotes</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Help prioritize issues by upvoting. The most upvoted issues get faster attention from authorities.
                            </p>
                        </div>

                        <div className="text-center p-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full mb-3">
                                <FaExclamationTriangle className="text-teal-600 dark:text-teal-400 text-xl" />
                            </div>
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Report Issues</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Found an infrastructure problem? Report it to help improve your community and make a difference.
                            </p>
                        </div>

                        <div className="text-center p-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
                                <FaEye className="text-blue-600 dark:text-blue-400 text-xl" />
                            </div>
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Track Progress</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Monitor the status of reported issues and see how your contributions are making an impact.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Service;