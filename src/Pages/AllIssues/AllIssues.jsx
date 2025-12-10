import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import useAuth from '../../Hooks/useAuth';
import { FaThumbsUp, FaEye, FaExclamationTriangle, FaClock, FaCheckCircle, FaMapMarkerAlt, FaTag, FaUser, FaCalendarAlt, FaFire, FaBan, FaCrown, FaBolt, FaRocket } from 'react-icons/fa';
import { MdPriorityHigh } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const AllIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('boosted-first');
    const [searchTerm, setSearchTerm] = useState('');
    const [upvotedIssues, setUpvotedIssues] = useState([]);
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch all issues from backend
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                setLoading(true);
                const res = await axiosSecure.get('/issues');
                let issuesData = res.data || [];
                
                // Add upvote count if not present
                const processedIssues = issuesData.map(issue => ({
                    ...issue,
                    upvotes: issue.upvotes || 0,
                    upvotedBy: issue.upvotedBy || [],
                    isBoosted: issue.isBoosted || false,
                    boostedAt: issue.boostedAt || null
                }));
                
                setIssues(processedIssues);
            } catch (error) {
                console.error('Error fetching issues:', error);
                toast.error('Failed to load issues. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();

        // Load previously upvoted issues from localStorage for current user
        if (user?.email) {
            const savedUpvotes = localStorage.getItem(`upvotedIssues_${user.email}`);
            if (savedUpvotes) {
                setUpvotedIssues(JSON.parse(savedUpvotes));
            }
        }
    }, [axiosSecure, user]);

    // Handle Upvote - Only non-owners can upvote
    const handleUpvote = async (issue) => {
        if (!user) {
            toast.warning('Please login to upvote issues!', {
                position: "top-right",
                autoClose: 3000,
                onClick: () => navigate('/login')
            });
            return;
        }

        if (user.email === issue.submittedBy) {
            toast.warning("You can't upvote your own issue!", {
                position: "top-right",
                autoClose: 3000,
                icon: '🚫'
            });
            return;
        }

        const isAlreadyUpvoted = issue.upvotedBy?.includes(user.email) || upvotedIssues.includes(issue._id);
        if (isAlreadyUpvoted) {
            toast.info('You have already upvoted this issue!', {
                position: "top-right",
                autoClose: 3000
            });
            return;
        }

        try {
            const newUpvotedIssues = [...upvotedIssues, issue._id];
            setUpvotedIssues(newUpvotedIssues);
            
            localStorage.setItem(`upvotedIssues_${user.email}`, JSON.stringify(newUpvotedIssues));
            
            setIssues(prevIssues =>
                prevIssues.map(item =>
                    item._id === issue._id
                        ? { 
                            ...item, 
                            upvotes: (item.upvotes || 0) + 1,
                            upvotedBy: [...(item.upvotedBy || []), user.email]
                        }
                        : item
                )
            );

            toast.success('Issue upvoted successfully!', {
                position: "top-right",
                autoClose: 2000,
                icon: '👍'
            });

            await axiosSecure.patch(`/issues/${issue._id}`, {
                upvotes: (issue.upvotes || 0) + 1,
                upvotedBy: [...(issue.upvotedBy || []), user.email],
                updatedAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error upvoting:', error);
            toast.error('Failed to upvote. Please try again.');
        }
    };

    

    // Handle View Details
    const handleViewDetails = (issueId) => {
        if (!user) {
            toast.warning('Please login to view issue details!', {
                position: "top-right",
                autoClose: 3000
            });
            navigate('/login', { state: { from: `/issues/${issueId}` } });
        } else {
            navigate(`/issues/${issueId}`);
        }
    };

    // Handle Boost Issue
    const handleBoostIssue = (issue) => {
        if (!user) {
            toast.warning('Please login to boost issues!', {
                position: "top-right",
                autoClose: 3000,
                onClick: () => navigate('/login')
            });
            return;
        }

        if (issue.isBoosted) {
            toast.info('This issue is already boosted!', {
                position: "top-right",
                autoClose: 3000,
                icon: '🚀'
            });
            return;
        }

        if (user.email !== issue.submittedBy) {
            toast.warning('Only issue owner can boost their own issues!', {
                position: "top-right",
                autoClose: 3000
            });
            return;
        }

        navigate(`/dashboard/payment/${issue._id}`, {
            state: {
                issueTitle: issue.title,
                type: 'boost',
                amount: 100
            }
        });
    };

    // Check if user can upvote a specific issue
    const canUserUpvote = (issue) => {
        if (!user) return false;
        if (user.email === issue.submittedBy) return false;
        if (issue.upvotedBy?.includes(user.email) || upvotedIssues.includes(issue._id)) return false;
        return true;
    };

    // Filter and sort issues
    const filteredAndSortedIssues = React.useMemo(() => {
        let result = [...issues];

        // Apply filter
        if (filter !== 'all') {
            if (filter === 'boosted') {
                result = result.filter(issue => issue.isBoosted);
            } else {
                result = result.filter(issue => issue.status === filter);
            }
        }

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(issue =>
                issue.title.toLowerCase().includes(term) ||
                issue.description.toLowerCase().includes(term) ||
                issue.category.toLowerCase().includes(term) ||
                issue.location.toLowerCase().includes(term) ||
                issue.submittedBy?.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        switch (sortBy) {
            case 'boosted-first':
                result.sort((a, b) => {
                    if (a.isBoosted && !b.isBoosted) return -1;
                    if (!a.isBoosted && b.isBoosted) return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                break;
            case 'latest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'upvotes':
                result.sort((a, b) => {
                    if (a.isBoosted && !b.isBoosted) return -1;
                    if (!a.isBoosted && b.isBoosted) return 1;
                    return (b.upvotes || 0) - (a.upvotes || 0);
                });
                break;
            case 'priority': {
                const priorityOrder = { 'Emergency': 4, 'High': 3, 'Normal': 2, 'Low': 1 };
                result.sort((a, b) => {
                    if (a.isBoosted && !b.isBoosted) return -1;
                    if (!a.isBoosted && b.isBoosted) return 1;
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                });
                break;
            }
            default:
                break;
        }

        return result;
    }, [issues, filter, sortBy, searchTerm]);

    // Get status icon and color with boost styling
    const getStatusInfo = (issue) => {
        const status = issue.status?.toLowerCase();
        const baseStatus = {
            'pending': { 
                icon: <FaClock className="text-sm" />, 
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                label: 'Pending'
            },
            'resolved': { 
                icon: <FaCheckCircle className="text-sm" />, 
                color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                label: 'Resolved'
            },
            'in-progress': { 
                icon: <FaExclamationTriangle className="text-sm" />, 
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                label: 'In Progress'
            }
        }[status] || { 
            icon: <FaClock className="text-sm" />, 
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            label: status || 'Unknown'
        };

        // Add boost styling if issue is boosted
        if (issue.isBoosted) {
            return {
                ...baseStatus,
                color: 'bg-linear-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200',
                label: `${baseStatus.label} • BOOSTED`
            };
        }

        return baseStatus;
    };

    // Get priority icon and color
    const getPriorityInfo = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'emergency':
                return { 
                    icon: <FaFire className="text-sm" />, 
                    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    label: 'Emergency'
                };
            case 'high':
                return { 
                    icon: <MdPriorityHigh className="text-sm" />, 
                    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                    label: 'High'
                };
            case 'normal':
                return { 
                    icon: <MdPriorityHigh className="text-sm" />, 
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    label: 'Normal'
                };
            case 'low':
                return { 
                    icon: <MdPriorityHigh className="text-sm" />, 
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                    label: 'Low'
                };
            default:
                return { 
                    icon: <MdPriorityHigh className="text-sm" />, 
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                    label: priority || 'Unknown'
                };
        }
    };

    // Format date with boost indicator
    const formatDate = (issue) => {
        const date = new Date(issue.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let formattedDate;
        if (diffDays === 0) formattedDate = 'Today';
        else if (diffDays === 1) formattedDate = 'Yesterday';
        else if (diffDays < 7) formattedDate = `${diffDays} days ago`;
        else {
            formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }

        // Add boost indicator
        if (issue.isBoosted && issue.boostedAt) {
            const boostDate = new Date(issue.boostedAt);
            const boostDiffDays = Math.floor((now - boostDate) / (1000 * 60 * 60 * 24));
            
            let boostText = 'Recently boosted';
            if (boostDiffDays === 0) boostText = 'Boosted today';
            else if (boostDiffDays === 1) boostText = 'Boosted yesterday';
            else if (boostDiffDays < 7) boostText = `Boosted ${boostDiffDays} days ago`;
            
            return (
                <div className="flex flex-col">
                    <span>{formattedDate}</span>
                    <span className="text-xs text-purple-600 dark:text-purple-400">{boostText}</span>
                </div>
            );
        }

        return formattedDate;
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="inline-block animate-pulse h-12 w-96 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-6"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div className="h-48 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-4"></div>
                                <div className="h-6 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-3"></div>
                                <div className="flex justify-between mb-4">
                                    <div className="h-4 w-20 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded"></div>
                                    <div className="h-4 w-16 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded"></div>
                                </div>
                                <div className="h-16 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-4">
                        All Community Issues
                    </h1>
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold flex items-center gap-2">
                            <FaBolt />
                            <span>Boosted issues get priority visibility</span>
                        </div>
                        <div className="text-lg text-gray-600 dark:text-gray-300">
                            {issues.filter(i => i.isBoosted).length} boosted issues
                        </div>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                >
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">
                            {issues.length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Issues</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {issues.filter(i => i.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {issues.filter(i => i.status === 'resolved').length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Resolved</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {issues.filter(i => i.isBoosted).length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Boosted</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {issues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Upvotes</div>
                    </div>
                </motion.div>

                {/* Filters and Search */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search issues by title, category, location..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="flex gap-2">
                            <select
                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Issues</option>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="boosted">Boosted</option>
                            </select>

                            <select
                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="boosted-first">Boosted First</option>
                                <option value="latest">Latest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="upvotes">Most Upvotes</option>
                                <option value="priority">Priority</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Issues Grid */}
                {filteredAndSortedIssues.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                    >
                        <FaExclamationTriangle className="text-6xl text-amber-400 dark:text-amber-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            No Issues Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            {searchTerm 
                                ? `No issues match "${searchTerm}". Try a different search term.`
                                : filter !== 'all'
                                ? `No issues with status "${filter}".`
                                : 'No issues have been reported yet.'
                            }
                        </p>
                        {(searchTerm || filter !== 'all') && (
                            <button
                                onClick={() => { setSearchTerm(''); setFilter('all'); }}
                                className="px-6 py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
                            >
                                Clear Filters
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredAndSortedIssues.map((issue, index) => {
                            const statusInfo = getStatusInfo(issue);
                            const priorityInfo = getPriorityInfo(issue.priority);
                            const isOwner = user?.email === issue.submittedBy;
                            const canUpvote = canUserUpvote(issue);
                            const hasUpvoted = !canUpvote && user && !isOwner;

                            return (
                                <motion.div
                                    key={issue._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border ${
                                        issue.isBoosted 
                                            ? 'border-2 border-purple-500 dark:border-purple-400 shadow-lg shadow-purple-500/20' 
                                            : 'border border-gray-100 dark:border-gray-700'
                                    }`}
                                >
                                    {/* Boosted Badge Overlay */}
                                    {issue.isBoosted && (
                                        <div className="absolute top-0 left-0 right-0 z-10">
                                            <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-bold py-2 px-4 transform -skew-x-12 -translate-x-4 w-40 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <FaCrown className="text-yellow-300" />
                                                    <span>FEATURED</span>
                                                    <FaBolt className="text-yellow-300" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Issue Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        {issue.images && issue.images[0] ? (
                                            <img
                                                src={issue.images[0].url || issue.images[0]}
                                                alt={issue.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                                                }}
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${
                                                issue.isBoosted 
                                                    ? 'bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' 
                                                    : 'bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600'
                                            }`}>
                                                <FaExclamationTriangle className={`text-4xl ${
                                                    issue.isBoosted 
                                                        ? 'text-purple-400 dark:text-purple-300' 
                                                        : 'text-gray-400 dark:text-gray-500'
                                                }`} />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                <span>{statusInfo.label}</span>
                                            </span>
                                        </div>
                                        <div className="absolute bottom-3 left-3">
                                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${priorityInfo.color}`}>
                                                {priorityInfo.icon}
                                                <span>{priorityInfo.label}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        {/* Title and Date */}
                                        <div className="mb-4">
                                            <div className='flex justify-between items-start'>
                                                <div className="flex-1">
                                                    <h3 className={`text-xl font-bold mb-2 line-clamp-1 ${
                                                        issue.isBoosted 
                                                            ? 'bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent'
                                                            : 'text-gray-800 dark:text-white'
                                                    }`}>
                                                        {issue.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <FaCalendarAlt className={issue.isBoosted ? "text-purple-500" : "text-amber-500"} />
                                                        <span>{formatDate(issue)}</span>
                                                        {issue.submittedBy && (
                                                            <>
                                                                <span>•</span>
                                                                <FaUser className={issue.isBoosted ? "text-purple-500" : "text-amber-500"} />
                                                                <span className="truncate max-w-[100px]" title={issue.submittedBy}>
                                                                    {issue.submittedBy.split('@')[0]}
                                                                    {isOwner && " (You)"}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Category and Location */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                issue.isBoosted
                                                    ? 'bg-linear-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200'
                                                    : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                                            }`}>
                                                {issue.category}
                                            </span>
                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <FaMapMarkerAlt className={issue.isBoosted ? "text-purple-500" : "text-amber-500"} />
                                                <span className="line-clamp-1 max-w-[150px]" title={issue.location}>
                                                    {issue.location}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 line-clamp-2">
                                            {issue.description}
                                        </p>

                                        {/* Stats and Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    {!user ? (
                                                        <div className="flex items-center gap-1 p-1 rounded-lg text-gray-400" title="Login to upvote">
                                                            <FaThumbsUp className="text-lg" />
                                                        </div>
                                                    ) : isOwner ? (
                                                        <div className="flex items-center gap-1 p-1 rounded-lg text-gray-400 cursor-not-allowed" title="Cannot upvote your own issue">
                                                            <FaBan className="text-lg" />
                                                        </div>
                                                    ) : hasUpvoted ? (
                                                        <div className="flex items-center gap-1 p-1 rounded-lg text-amber-500" title="Already upvoted">
                                                            <FaThumbsUp className="text-lg" />
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUpvote(issue)}
                                                            className="flex items-center gap-1 p-1 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                                                            title="Upvote this issue"
                                                        >
                                                            <FaThumbsUp className="text-lg" />
                                                        </button>
                                                    )}
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        {issue.upvotes || 0}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(issue._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                                >
                                                    <FaEye />
                                                    <span className="hidden sm:inline">View</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Boost Button for Owner */}
                                        {user && user.email === issue.submittedBy && !issue.isBoosted && issue.status === 'pending' && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                                            >
                                                <button
                                                    onClick={() => handleBoostIssue(issue)}
                                                    className="w-full py-2 px-4 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                                                >
                                                    <FaRocket />
                                                    <span>Boost This Issue</span>
                                                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">৳100</span>
                                                </button>
                                                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                                                    Get priority visibility and faster resolution
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Pagination Info */}
                {filteredAndSortedIssues.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-8 text-center text-gray-500 dark:text-gray-400"
                    >
                        Showing {filteredAndSortedIssues.length} of {issues.length} issues
                        {issues.filter(i => i.isBoosted).length > 0 && (
                            <span className="ml-2 text-purple-600 dark:text-purple-400">
                                ({issues.filter(i => i.isBoosted).length} boosted)
                            </span>
                        )}
                    </motion.div>
                )}

                {/* Help Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                <FaBolt className="text-purple-500" />
                                Boost Your Issues
                            </h3>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                                <li className="flex items-start gap-2">
                                    <FaCrown className="text-purple-500 mt-1" />
                                    <span>Pay <strong>৳100</strong> to boost your issue</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-4 h-4 rounded-full bg-linear-to-r from-purple-500 to-pink-500 mt-1"></div>
                                    <span>Boosted issues appear at the top of all lists</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FaRocket className="text-purple-500 mt-1" />
                                    <span>Get special "FEATURED" badge and styling</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FaFire className="text-purple-500 mt-1" />
                                    <span>Increased priority for faster resolution</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Ready to Report an Issue?</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Found an infrastructure problem in your area? Help improve your community by reporting it.
                            </p>
                            <button
                                onClick={() => navigate('/addIssues')}
                                className="px-6 py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                                Report New Issue
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AllIssues;