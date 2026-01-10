import React, { useEffect, useState, useMemo } from 'react';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import useAuth from '../../Hooks/useAuth';
import { FaThumbsUp, FaEye, FaExclamationTriangle, FaClock, FaCheckCircle, FaMapMarkerAlt, FaTag, FaUser, FaCalendarAlt, FaFire, FaBan, FaCrown, FaBolt, FaRocket, FaArrowLeft, FaArrowRight, FaFilter, FaSort } from 'react-icons/fa';
import { MdPriorityHigh } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../Auth/SocialLogin/Loading';

const AllIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('boosted-first');
    const [searchTerm, setSearchTerm] = useState('');
    const [upvotedIssues, setUpvotedIssues] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12); // 4 cards per row × 3 rows = 12 items per page
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
    const filteredAndSortedIssues = useMemo(() => {
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

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedIssues.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedIssues.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // Reset to first page when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm, sortBy]);

    // Get status icon and color with boost styling
    const getStatusInfo = (issue) => {
        const status = issue.status?.toLowerCase();
        const baseStatus = {
            'pending': { 
                icon: <FaClock className="text-xs" />, 
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                label: 'Pending'
            },
            'resolved': { 
                icon: <FaCheckCircle className="text-xs" />, 
                color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                label: 'Resolved'
            },
            'in-progress': { 
                icon: <FaExclamationTriangle className="text-xs" />, 
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                label: 'In Progress'
            }
        }[status] || { 
            icon: <FaClock className="text-xs" />, 
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            label: status || 'Unknown'
        };

        // Add boost styling if issue is boosted
        if (issue.isBoosted) {
            return {
                ...baseStatus,
                color: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200',
                label: `${baseStatus.label}`
            };
        }

        return baseStatus;
    };

    // Get priority icon and color
    const getPriorityInfo = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'emergency':
                return { 
                    icon: <FaFire className="text-xs" />, 
                    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    label: 'Emergency'
                };
            case 'high':
                return { 
                    icon: <MdPriorityHigh className="text-xs" />, 
                    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                    label: 'High'
                };
            case 'normal':
                return { 
                    icon: <MdPriorityHigh className="text-xs" />, 
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    label: 'Normal'
                };
            case 'low':
                return { 
                    icon: <MdPriorityHigh className="text-xs" />, 
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                    label: 'Low'
                };
            default:
                return { 
                    icon: <MdPriorityHigh className="text-xs" />, 
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
        else if (diffDays < 7) formattedDate = `${diffDays}d ago`;
        else {
            formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }

        // Add boost indicator
        if (issue.isBoosted && issue.boostedAt) {
            const boostDate = new Date(issue.boostedAt);
            const boostDiffDays = Math.floor((now - boostDate) / (1000 * 60 * 60 * 24));
            
            let boostText = 'Boosted';
            if (boostDiffDays === 0) boostText = 'Boosted today';
            else if (boostDiffDays === 1) boostText = 'Boosted yesterday';
            else if (boostDiffDays < 7) boostText = `Boosted ${boostDiffDays}d ago`;
            
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs">{formattedDate}</span>
                    <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">{boostText}</span>
                </div>
            );
        }

        return formattedDate;
    };

    // Loading skeleton for 4 cards per row
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
                <Loading></Loading>
                <div className="max-w-7xl mx-auto">
                    {/* Header Skeleton */}
                    <div className="text-center mb-8">
                        <div className="inline-block animate-pulse h-10 w-80 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-4"></div>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="animate-pulse h-8 w-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full"></div>
                            <div className="animate-pulse h-6 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded"></div>
                        </div>
                    </div>

                    {/* Stats Bar Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-2"></div>
                                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>

                    

                    {/* Filter Bar Skeleton */}
                    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-12 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"></div>
                                <div className="h-12 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"></div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Skeleton - 4 cards per row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                                <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-4"></div>
                                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-3"></div>
                                <div className="flex justify-between mb-3">
                                    <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded"></div>
                                    <div className="h-3 w-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded"></div>
                                </div>
                                <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-4"></div>
                                <div className="flex justify-between">
                                    <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded"></div>
                                    <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-3 mt-8">
                        Community Issues Dashboard
                    </h1>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
                        <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-semibold flex items-center gap-1.5">
                            <FaBolt className="text-xs" />
                            <span>Boosted issues get priority visibility</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            {issues.filter(i => i.isBoosted).length} boosted • {issues.length} total issues
                        </div>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6"
                >
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow hover:shadow-md transition-shadow">
                        <div className="text-xl font-bold text-gray-800 dark:text-white">
                            {issues.length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Issues</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow hover:shadow-md transition-shadow">
                        <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                            {issues.filter(i => i.status === 'pending').length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow hover:shadow-md transition-shadow">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {issues.filter(i => i.status === 'resolved').length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Resolved</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow hover:shadow-md transition-shadow">
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {issues.filter(i => i.isBoosted).length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Boosted</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow hover:shadow-md transition-shadow">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {issues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Upvotes</div>
                    </div>
                </motion.div>

                {/* Filters and Search */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search issues by title, category, location..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                            </div>
                        </div>

                        {/* Filter and Sort */}
                        <div className="flex gap-2">
                            <div className="relative group">
                                <select
                                    className="pl-10 pr-8 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm appearance-none cursor-pointer"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="all">All Issues</option>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="boosted">Boosted</option>
                                </select>
                                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="relative group">
                                <select
                                    className="pl-10 pr-8 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm appearance-none cursor-pointer"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="boosted-first">Boosted First</option>
                                    <option value="latest">Latest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="upvotes">Most Upvotes</option>
                                    <option value="priority">Priority</option>
                                </select>
                                <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Results Info */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row justify-between items-center mb-4"
                >
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                        Showing <span className="font-semibold text-gray-800 dark:text-white">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAndSortedIssues.length)}</span> of{' '}
                        <span className="font-semibold text-gray-800 dark:text-white">{filteredAndSortedIssues.length}</span> issues
                        {issues.filter(i => i.isBoosted).length > 0 && (
                            <span className="ml-2 text-purple-600 dark:text-purple-400">
                                ({issues.filter(i => i.isBoosted).length} boosted)
                            </span>
                        )}
                    </div>
                    
                    {filteredAndSortedIssues.length > itemsPerPage && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Page</span>
                            <span className="font-semibold text-gray-800 dark:text-white">{currentPage} of {totalPages}</span>
                        </div>
                    )}
                </motion.div>

                {/* Issues Grid - 4 cards per row on xl screens */}
                <AnimatePresence mode="wait">
                    {currentItems.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow"
                        >
                            <FaExclamationTriangle className="text-5xl text-amber-400 dark:text-amber-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No Issues Found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
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
                                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all duration-300 text-sm"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
                        >
                            {currentItems.map((issue, index) => {
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
                                        transition={{ duration: 0.3, delay: index * 0.03 }}
                                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                        className={`group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border ${
                                            issue.isBoosted 
                                                ? 'border-2 border-purple-500 dark:border-purple-400 shadow-lg shadow-purple-500/20' 
                                                : 'border border-gray-400 dark:border-gray-700'
                                        }`}
                                    >
                                        {/* Boosted Badge Overlay */}
                                        {issue.isBoosted && (
                                            <div className="absolute top-0 left-0 right-0 z-10">
                                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold py-1.5 px-3 transform -skew-x-12 -translate-x-3 w-32 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <FaCrown className="text-yellow-300 text-xs" />
                                                        <span>Boosted</span>
                                                        <FaBolt className="text-yellow-300 text-xs" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Issue Image */}
                                        <div className="relative h-40 overflow-hidden">
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
                                                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' 
                                                        : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600'
                                                }`}>
                                                    <FaExclamationTriangle className={`text-3xl ${
                                                        issue.isBoosted 
                                                            ? 'text-purple-400 dark:text-purple-300' 
                                                            : 'text-gray-400 dark:text-gray-500'
                                                    }`} />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                                    {statusInfo.icon}
                                                    <span className="text-xs">{statusInfo.label}</span>
                                                </span>
                                            </div>
                                            <div className="absolute bottom-2 left-2">
                                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${priorityInfo.color}`}>
                                                    {priorityInfo.icon}
                                                    <span className="text-xs">{priorityInfo.label}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            {/* Title and Date */}
                                            <div className="mb-3">
                                                <div className='flex justify-between items-start'>
                                                    <div className="flex-1">
                                                        <h3 className={`text-base font-bold mb-1.5 line-clamp-1 ${
                                                            issue.isBoosted 
                                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent'
                                                                : 'text-gray-800 dark:text-white'
                                                        }`}>
                                                            {issue.title}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                            <FaCalendarAlt className={issue.isBoosted ? "text-purple-500 text-xs" : "text-amber-500 text-xs"} />
                                                            <span>{formatDate(issue)}</span>
                                                            {issue.submittedBy && (
                                                                <>
                                                                    <span>•</span>
                                                                    <FaUser className={issue.isBoosted ? "text-purple-500 text-xs" : "text-amber-500 text-xs"} />
                                                                    <span className="truncate max-w-[80px]" title={issue.submittedBy}>
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
                                            <div className="flex flex-col gap-1.5 mb-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    issue.isBoosted
                                                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200'
                                                        : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                                                }`}>
                                                    {issue.category}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <FaMapMarkerAlt className={issue.isBoosted ? "text-purple-500 text-xs" : "text-amber-500 text-xs"} />
                                                    <span className="line-clamp-1" title={issue.location}>
                                                        {issue.location}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-600 dark:text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                                                {issue.description}
                                            </p>

                                            {/* Stats and Actions */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5">
                                                        {!user ? (
                                                            <div className="flex items-center gap-1 p-1 rounded-lg text-gray-400" title="Login to upvote">
                                                                <FaThumbsUp className="text-sm" />
                                                            </div>
                                                        ) : isOwner ? (
                                                            <div className="flex items-center gap-1 p-1 rounded-lg text-gray-400 cursor-not-allowed" title="Cannot upvote your own issue">
                                                                <FaBan className="text-sm" />
                                                            </div>
                                                        ) : hasUpvoted ? (
                                                            <div className="flex items-center gap-1 p-1 rounded-lg text-amber-500" title="Already upvoted">
                                                                <FaThumbsUp className="text-sm" />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleUpvote(issue)}
                                                                className="flex items-center gap-1 p-1 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                                                                title="Upvote this issue"
                                                            >
                                                                <FaThumbsUp className="text-sm" />
                                                            </button>
                                                        )}
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            {issue.upvotes || 0}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/issueDetails/${issue._id}`)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-white rounded-lg font-medium text-xs shadow hover:shadow-md transition-all duration-200"
                                                    >
                                                        <FaEye className="text-xs" />
                                                        <span>View</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Boost Button for Owner */}
                                            {user && user.email === issue.submittedBy && !issue.isBoosted && issue.status === 'pending' && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700"
                                                >
                                                    <button
                                                        onClick={() => handleBoostIssue(issue)}
                                                        className="w-full py-1.5 px-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 text-xs"
                                                    >
                                                        <FaRocket className="text-xs" />
                                                        <span>Boost Issue</span>
                                                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">৳100</span>
                                                    </button>
                                                    <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-1">
                                                        Get priority visibility
                                                    </p>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-8 flex justify-center"
                    >
                        <nav className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg ${
                                    currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-amber-600'
                                }`}
                                aria-label="Previous page"
                            >
                                <FaArrowLeft className="text-sm" />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {/* Always show first page */}
                                <button
                                    onClick={() => paginate(1)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                        currentPage === 1
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    1
                                </button>

                                {/* Show ellipsis if needed */}
                                {currentPage > 3 && (
                                    <span className="px-2 text-gray-500">...</span>
                                )}

                                {/* Show pages around current page */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        if (page === 1 || page === totalPages) return false;
                                        return Math.abs(page - currentPage) <= 1;
                                    })
                                    .map(page => (
                                        <button
                                            key={page}
                                            onClick={() => paginate(page)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                                currentPage === page
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                {/* Show ellipsis if needed */}
                                {currentPage < totalPages - 2 && (
                                    <span className="px-2 text-gray-500">...</span>
                                )}

                                {/* Always show last page if there are more than 1 page */}
                                {totalPages > 1 && (
                                    <button
                                        onClick={() => paginate(totalPages)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                            currentPage === totalPages
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {totalPages}
                                    </button>
                                )}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg ${
                                    currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-amber-600'
                                }`}
                                aria-label="Next page"
                            >
                                <FaArrowRight className="text-sm" />
                            </button>
                        </nav>
                    </motion.div>
                )}

                {/* Help Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                <FaBolt className="text-purple-500 text-sm" />
                                Boost Your Issues
                            </h3>
                            <ul className="space-y-1.5 text-gray-600 dark:text-gray-400 text-sm">
                                <li className="flex items-start gap-2">
                                    <FaCrown className="text-purple-500 mt-0.5 text-xs" />
                                    <span>Pay <strong className="font-semibold">৳100</strong> to boost your issue</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-0.5"></div>
                                    <span>Boosted issues appear at the top of all lists</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FaRocket className="text-purple-500 mt-0.5 text-xs" />
                                    <span>Get special "FEATURED" badge and styling</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FaFire className="text-purple-500 mt-0.5 text-xs" />
                                    <span>Increased priority for faster resolution</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Ready to Report an Issue?</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                Found an infrastructure problem in your area? Help improve your community by reporting it.
                            </p>
                            <button
                                onClick={() => navigate('/addIssues')}
                                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all duration-300 text-sm"
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