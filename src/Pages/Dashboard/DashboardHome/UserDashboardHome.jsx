import React, { useState, useEffect } from 'react';
import { 
    FaUser, 
    FaEnvelope, 
    FaCalendarAlt, 
    FaThumbsUp, 
    FaExclamationTriangle, 
    FaEdit, 
    FaEye, 
    FaTrash,
    FaCheckCircle,
    FaClock,
    FaChartLine,
    FaHistory,
    FaStar,
    FaAward,
    FaFire,
    FaUsers,
    FaRegChartBar,
    FaPercentage
} from 'react-icons/fa';
import { MdLocationOn, MdCategory, MdPriorityHigh } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    LineChart,
    Line
} from 'recharts';
import Loading from '../../Auth/SocialLogin/Loading';

const UserDashboardHome = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    const [userStats, setUserStats] = useState({
        totalIssues: 0,
        pendingIssues: 0,
        resolvedIssues: 0,
        inProgressIssues: 0,
        totalUpvotesReceived: 0,
        totalUpvotesGiven: 0,
        issuesEdited: 0,
        issuesViewed: 0,
        avgResponseTime: 0,
        totalComments: 0,
        issueCategories: {}
    });

    const [userIssues, setUserIssues] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('all'); // all, week, month

    useEffect(() => {
        const fetchUserDashboardData = async () => {
            if (!user?.email) return;

            try {
                setLoading(true);

                // Fetch user's issues
                const issuesRes = await axiosSecure.get(`/issues?email=${user.email}`);
                const issues = issuesRes.data?.issues || issuesRes.data || [];

                // Fetch all issues to calculate upvotes given
                const allIssuesRes = await axiosSecure.get('/issues');
                const allIssues = allIssuesRes.data?.issues || allIssuesRes.data || [];

                // Calculate statistics
                const stats = calculateUserStats(issues, allIssues);
                setUserStats(stats);
                setUserIssues(issues);

                // Generate recent activity timeline
                const activities = generateRecentActivity(issues);
                setRecentActivity(activities);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDashboardData();
    }, [user, axiosSecure, timeframe]);

    const calculateUserStats = (userIssues, allIssues) => {
        // Calculate category distribution
        const categoryCount = {};
        userIssues.forEach(issue => {
            const category = issue.category || 'Uncategorized';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const stats = {
            totalIssues: userIssues.length,
            pendingIssues: userIssues.filter(issue => issue.status === 'pending').length,
            resolvedIssues: userIssues.filter(issue => issue.status === 'resolved').length,
            inProgressIssues: userIssues.filter(issue => issue.status === 'in-progress' || issue.status === 'assigned').length,
            totalUpvotesReceived: userIssues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0),
            totalUpvotesGiven: calculateUpvotesGiven(allIssues),
            issuesEdited: userIssues.filter(issue => issue.updatedAt !== issue.createdAt).length,
            issuesViewed: userIssues.filter(issue => issue.views && issue.views > 0).length,
            avgResponseTime: calculateAvgResponseTime(userIssues),
            totalComments: userIssues.reduce((sum, issue) => sum + (issue.commentsCount || 0), 0),
            issueCategories: categoryCount
        };

        return stats;
    };

    const calculateUpvotesGiven = (allIssues) => {
        let upvotesGiven = 0;
        allIssues.forEach(issue => {
            if (issue.upvotedBy && issue.upvotedBy.includes(user?.email)) {
                upvotesGiven++;
            }
        });
        return upvotesGiven;
    };

    const calculateAvgResponseTime = (issues) => {
        const resolvedIssues = issues.filter(issue => issue.status === 'resolved' && issue.resolvedAt);
        if (resolvedIssues.length === 0) return 0;

        const totalResponseTime = resolvedIssues.reduce((sum, issue) => {
            const created = new Date(issue.createdAt);
            const resolved = new Date(issue.resolvedAt);
            return sum + (resolved - created);
        }, 0);

        return Math.round(totalResponseTime / resolvedIssues.length / (1000 * 60 * 60 * 24)); // Days
    };

    const generateRecentActivity = (issues) => {
        const activities = [];

        // Add issue creation activities
        issues.forEach(issue => {
            activities.push({
                id: `create-${issue._id}`,
                type: 'issue_created',
                title: `Reported: "${issue.issueTitle || issue.title}"`,
                description: (issue.description || '').substring(0, 100) + '...',
                icon: <FaExclamationTriangle className="text-blue-500" />,
                timestamp: new Date(issue.createdAt),
                category: issue.category,
                priority: issue.priority,
                status: issue.status,
                upvotes: issue.upvotes || 0
            });

            // Add edit activities if issue was updated
            if (issue.updatedAt && issue.updatedAt !== issue.createdAt) {
                activities.push({
                    id: `edit-${issue._id}`,
                    type: 'issue_edited',
                    title: `Edited: "${issue.issueTitle || issue.title}"`,
                    description: 'Updated issue details',
                    icon: <FaEdit className="text-yellow-500" />,
                    timestamp: new Date(issue.updatedAt),
                    category: issue.category,
                    priority: issue.priority,
                    status: issue.status,
                    upvotes: issue.upvotes || 0
                });
            }

            // Add resolution activity
            if (issue.status === 'resolved' && issue.resolvedAt) {
                activities.push({
                    id: `resolve-${issue._id}`,
                    type: 'issue_resolved',
                    title: `Resolved: "${issue.issueTitle || issue.title}"`,
                    description: 'Issue has been resolved',
                    icon: <FaCheckCircle className="text-green-500" />,
                    timestamp: new Date(issue.resolvedAt),
                    category: issue.category,
                    priority: issue.priority,
                    status: issue.status,
                    upvotes: issue.upvotes || 0
                });
            }
        });

        // Sort by timestamp (newest first)
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    };

    // Prepare data for charts
    const getPieChartData = () => {
        return [
            { name: 'Pending', value: userStats.pendingIssues, color: '#FF6B6B' },
            { name: 'In Progress', value: userStats.inProgressIssues, color: '#4ECDC4' },
            { name: 'Resolved', value: userStats.resolvedIssues, color: '#45B7D1' },
        ];
    };

    const getCategoryChartData = () => {
        return Object.entries(userStats.issueCategories).map(([category, count], index) => ({
            name: category,
            value: count,
            color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index % 6]
        }));
    };

    const getMonthlyActivityData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map((month, index) => ({
            month,
            issues: Math.floor(Math.random() * 5) + userStats.totalIssues * 0.1, // Simulated data
            upvotes: Math.floor(Math.random() * 10) + userStats.totalUpvotesReceived * 0.2,
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffDays === 0) {
            if (diffHours === 0) return 'Just now';
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        }
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'in-progress': 
            case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'emergency': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
        }
    };

    if (loading) {
        return (
            
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <Loading></Loading>
                    <div className="animate-pulse">
                        <div className="h-12 w-64 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl"></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 h-96 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl"></div>
                            <div className="h-96 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const pieChartData = getPieChartData();
    const categoryData = getCategoryChartData();
    const monthlyData = getMonthlyActivityData();

    return (
        <div className="min-h-screen bg-linear-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                                Welcome back, {user?.displayName || 'User'}!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Track your contributions and community impact
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-gradient-to-br from-amber-50 to-amber-200 dark:from-gray-800 dark:to-gray-600 p-3 rounded-xl shadow-lg border border-amber-300 dark:border-gray-700">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 dark:border-gray-700 shadow">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <FaUser className="text-xl text-white" />
                                    </div>
                                )}
                            </div>
                            <div >
                                <h3 className="font-semibold text-gray-800 dark:text-white">{user?.displayName}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                    <FaEnvelope className="text-xs" /> {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Timeframe Filter */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="flex gap-2">
                        {['all', 'week', 'month'].map((time) => (
                            <button
                                key={time}
                                onClick={() => setTimeframe(time)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${timeframe === time 
                                    ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                {time.charAt(0).toUpperCase() + time.slice(1)}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {/* Total Issues */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Issues</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                                    {userStats.totalIssues}
                                </p>
                            </div>
                            <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl">
                                <FaExclamationTriangle className="text-2xl text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <div className={`px-2 py-1 rounded-full ${getStatusColor('pending')}`}>
                                {userStats.pendingIssues} Pending
                            </div>
                            <div className={`px-2 py-1 rounded-full ${getStatusColor('resolved')}`}>
                                {userStats.resolvedIssues} Resolved
                            </div>
                        </div>
                    </div>

                    {/* Upvotes Received */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Upvotes Received</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                                    {userStats.totalUpvotesReceived}
                                </p>
                            </div>
                            <div className="p-3 bg-linear-to-br from-green-500 to-emerald-500 rounded-xl">
                                <FaThumbsUp className="text-2xl text-white" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Community appreciation score
                        </p>
                    </div>

                    {/* Upvotes Given */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Upvotes Given</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                                    {userStats.totalUpvotesGiven}
                                </p>
                            </div>
                            <div className="p-3 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl">
                                <FaStar className="text-2xl text-white" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Supporting other issues
                        </p>
                    </div>

                    {/* Response Time */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Response</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                                    {userStats.avgResponseTime}d
                                </p>
                            </div>
                            <div className="p-3 bg-linear-to-br from-amber-500 to-orange-500 rounded-xl">
                                <FaClock className="text-2xl text-white" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Average resolution time
                        </p>
                    </div>
                </motion.div>

                {/* Charts Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                    {/* Issue Status Pie Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaChartLine className="text-blue-500" />
                                Issue Status Distribution
                            </h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {pieChartData.reduce((sum, item) => sum + item.value, 0)} Total
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [`${value} issues`, 'Count']}
                                        contentStyle={{ 
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            color: '#374151'
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {pieChartData.map((item, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-lg font-bold" style={{ color: item.color }}>
                                        {item.value}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Activity Line Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaRegChartBar className="text-green-500" />
                                Monthly Activity Trend
                            </h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Last 6 months
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                                    <XAxis 
                                        dataKey="month" 
                                        stroke="#6b7280"
                                        tick={{ fill: '#6b7280' }}
                                    />
                                    <YAxis 
                                        stroke="#6b7280"
                                        tick={{ fill: '#6b7280' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            color: '#374151'
                                        }}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="issues" 
                                        stroke="#3B82F6" 
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="Issues"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="upvotes" 
                                        stroke="#10B981" 
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="Upvotes"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* Recent Activity Timeline */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaHistory className="text-amber-500" />
                                    Recent Activity Timeline
                                </h2>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {recentActivity.length} activities
                                </span>
                            </div>

                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {recentActivity.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaHistory className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                                        <button 
                                            onClick={() => navigate('/dashboard/myIssues')}
                                            className="mt-4 px-4 py-2 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all"
                                        >
                                            Report Your First Issue
                                        </button>
                                    </div>
                                ) : (
                                    recentActivity.map((activity, index) => (
                                        <motion.div 
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="relative pl-10 pb-4 border-l-2 border-gray-200 dark:border-gray-700 last:border-l-0 last:pb-0"
                                        >
                                            {/* Timeline dot */}
                                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-linear-to-r from-amber-500 to-orange-500 border-4 border-white dark:border-gray-800 shadow"></div>
                                            
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                                                            {activity.icon}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800 dark:text-white">
                                                                {activity.title}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {activity.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                        {formatDate(activity.timestamp)}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {activity.category && (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getPriorityColor(activity.priority)}`}>
                                                            <MdCategory className="text-xs" />
                                                            {activity.category}
                                                        </span>
                                                    )}
                                                    {activity.priority && (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getPriorityColor(activity.priority)}`}>
                                                            <MdPriorityHigh className="text-xs" />
                                                            {activity.priority}
                                                        </span>
                                                    )}
                                                    {activity.status && (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(activity.status)}`}>
                                                            {activity.status === 'resolved' ? <FaCheckCircle /> : <FaClock />}
                                                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                                        </span>
                                                    )}
                                                    {activity.upvotes > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs">
                                                            <FaThumbsUp className="text-xs" />
                                                            {activity.upvotes} upvotes
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats & Actions */}
                    <div className="space-y-6">
                        {/* Additional Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <FaPercentage className="text-purple-500" />
                                Additional Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FaEdit className="text-blue-500" />
                                        <span className="text-gray-700 dark:text-gray-300">Issues Edited</span>
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white">{userStats.issuesEdited}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FaEye className="text-green-500" />
                                        <span className="text-gray-700 dark:text-gray-300">Issues Viewed</span>
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white">{userStats.issuesViewed}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FaUsers className="text-orange-500" />
                                        <span className="text-gray-700 dark:text-gray-300">Total Comments</span>
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white">{userStats.totalComments}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <FaFire className="text-amber-500" />
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/dashboard/myIssues')}
                                    className="w-full flex items-center justify-between p-3 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all group"
                                >
                                    <span className="font-semibold">Report New Issue</span>
                                    <FaExclamationTriangle className="group-hover:scale-110 transition-transform" />
                                </button>
                                
                                <button
                                    onClick={() => navigate('/allIssues')}
                                    className="w-full flex items-center justify-between p-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all group"
                                >
                                    <span className="font-semibold">Browse All Issues</span>
                                    <FaEye className="group-hover:scale-110 transition-transform" />
                                </button>
                                
                                <button
                                    onClick={() => navigate('/dashboard/myIssues')}
                                    className="w-full flex items-center justify-between p-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all group"
                                >
                                    <span className="font-semibold">My Issues</span>
                                    <FaEdit className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Category Distribution */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <FaChartLine className="text-indigo-500" />
                                Issue Categories
                            </h3>
                            <div className="space-y-2">
                                {categoryData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: item.color }}
                                            ></div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-800 dark:text-white">{item.value}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                ({((item.value / userStats.totalIssues) * 100 || 0).toFixed(0)}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserDashboardHome;