import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useAuth from '../../../Hooks/useAuth';
import { 
  FaTasks, 
  FaCheckCircle, 
  FaClock, 
  FaUserFriends,
  FaChartLine,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaList,
  FaChartPie,
  FaHistory
} from 'react-icons/fa';
import { 
  MdDashboard, 
  MdAssignment, 
  MdLocationOn,
  MdTimeline,
  MdBarChart
} from 'react-icons/md';
import { motion } from 'framer-motion';

const StaffDashboardHome = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

   
    const { data: staffIssues = [], isLoading: issuesLoading } = useQuery({
        queryKey: ['staffIssues', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            
            
            const staffRes = await axiosSecure.get(`/users/${user.email}`);
            const staff = staffRes.data;
            
            if (!staff?._id) return [];
            
             
            const issuesRes = await axiosSecure.get(`/staff/${staff._id}/issues`);
            return issuesRes.data?.issues || [];
        },
        enabled: !!user?.email
    });

    
    const { data: allIssues = [], isLoading: allIssuesLoading } = useQuery({
        queryKey: ['allIssues'],
        queryFn: async () => {
            const res = await axiosSecure.get('/issues');
            return res.data || [];
        }
    });

     
    const { data: allUsers = [], isLoading: usersLoading } = useQuery({
        queryKey: ['allUsers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data || [];
        }
    });

     
    const calculateStats = () => {
        const totalAssigned = staffIssues.length;
        const resolvedIssues = staffIssues.filter(issue => issue.status === 'resolved').length;
        const pendingIssues = staffIssues.filter(issue => issue.status === 'assigned' || issue.status === 'in-progress').length;
        
      
        const uniqueSubmitters = [...new Set(staffIssues.map(issue => issue.submittedBy))];
        
        
        const successRate = totalAssigned > 0 ? Math.round((resolvedIssues / totalAssigned) * 100) : 0;
        
        
        const recentActivities = staffIssues
            .slice(0, 5)
            .map(issue => ({
                id: issue._id,
                title: issue.issueTitle,
                status: issue.status,
                date: new Date(issue.assignedAt || issue.createdAt),
                user: issue.submittedBy
            }));

        return {
            totalAssigned,
            resolvedIssues,
            pendingIssues,
            uniqueSubmitters: uniqueSubmitters.length,
            successRate,
            recentActivities,
            avgResolutionTime: '2.5 days'  
        };
    };

    const stats = calculateStats();

    // Prepare data for charts
    const prepareChartData = () => {
         
        const statusDistribution = {
            assigned: staffIssues.filter(i => i.status === 'assigned').length,
            'in-progress': staffIssues.filter(i => i.status === 'in-progress').length,
            resolved: staffIssues.filter(i => i.status === 'resolved').length,
            rejected: staffIssues.filter(i => i.status === 'rejected').length
        };

         
        const districtData = {};
        staffIssues.forEach(issue => {
            const district = issue.district || 'Unknown';
            districtData[district] = (districtData[district] || 0) + 1;
        });

        // Issues by type
        const typeData = {};
        staffIssues.forEach(issue => {
            const type = issue.issueType || 'General';
            typeData[type] = (typeData[type] || 0) + 1;
        });

        return {
            statusDistribution,
            districtData,
            typeData
        };
    };

    const chartData = prepareChartData();

    // Loading state
    if (issuesLoading || allIssuesLoading || usersLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <MdDashboard className="text-blue-600 dark:text-blue-400" />
                            Staff Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.displayName || 'Staff Member'}</span>
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Staff ID</p>
                        <p className="font-mono text-gray-900 dark:text-white font-bold">
                            {user?.email?.split('@')[0] || 'STAFF001'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border-l-4 border-blue-500"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Assigned</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalAssigned}</h3>
                            <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center gap-1">
                                <FaArrowUp className="w-3 h-3" />
                                Active assignments
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <FaTasks className="text-2xl text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </motion.div>

                 
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border-l-4 border-green-500"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Resolved Issues</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.resolvedIssues}</h3>
                            <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center gap-1">
                                <FaCheckCircle className="w-3 h-3" />
                                {stats.successRate}% success rate
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <FaCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </motion.div>

               
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border-l-4 border-amber-500"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending Issues</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.pendingIssues}</h3>
                            <p className="text-amber-600 dark:text-amber-400 text-sm mt-1 flex items-center gap-1">
                                <FaClock className="w-3 h-3" />
                                Need attention
                            </p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <FaClock className="text-2xl text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </motion.div>

                {/* Unique Users Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border-l-4 border-purple-500"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Unique Users</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.uniqueSubmitters}</h3>
                            <p className="text-purple-600 dark:text-purple-400 text-sm mt-1 flex items-center gap-1">
                                <FaUserFriends className="w-3 h-3" />
                                People you've helped
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <FaUserFriends className="text-2xl text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts and Detailed Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                 
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaChartPie className="text-blue-600 dark:text-blue-400" />
                            Issue Status Distribution
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(chartData.statusDistribution).map(([status, count], index) => {
                            const colors = {
                                'assigned': 'bg-blue-500',
                                'in-progress': 'bg-amber-500',
                                'resolved': 'bg-green-500',
                                'rejected': 'bg-red-500'
                            };
                            
                            const percentage = stats.totalAssigned > 0 
                                ? Math.round((count / stats.totalAssigned) * 100) 
                                : 0;
                            
                            return (
                                <div key={status} className="text-center">
                                    <div className="relative w-20 h-20 mx-auto mb-2">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                {percentage}%
                                            </span>
                                        </div>
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle 
                                                cx="40" 
                                                cy="40" 
                                                r="35" 
                                                stroke="currentColor" 
                                                strokeWidth="10" 
                                                fill="transparent" 
                                                className="text-gray-200 dark:text-gray-700"
                                            />
                                            <circle 
                                                cx="40" 
                                                cy="40" 
                                                r="35" 
                                                stroke="currentColor" 
                                                strokeWidth="10" 
                                                fill="transparent" 
                                                strokeDasharray={`${percentage * 2.199} 219.9`}
                                                className={colors[status]}
                                            />
                                        </svg>
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                                        {status.replace('-', ' ')}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {count} issues
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                        <MdBarChart className="text-green-600 dark:text-green-400" />
                        Performance Metrics
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                    <FaChartLine className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Success Rate</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Issue resolution</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {stats.successRate}%
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                                    <FaCalendarAlt className="text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Avg. Resolution</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Time per issue</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {stats.avgResolutionTime}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                                    <MdLocationOn className="text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Districts Covered</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Areas of operation</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {Object.keys(chartData.districtData).length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities and Issue Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Activities */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaHistory className="text-blue-600 dark:text-blue-400" />
                            Recent Activities
                        </h2>
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            View All
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {stats.recentActivities.length > 0 ? (
                            stats.recentActivities.map((activity, index) => (
                                <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                    <div className={`p-2 rounded-full ${
                                        activity.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30' :
                                        activity.status === 'in-progress' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                        'bg-blue-100 dark:bg-blue-900/30'
                                    }`}>
                                        {activity.status === 'resolved' ? (
                                            <FaCheckCircle className="text-green-600 dark:text-green-400" />
                                        ) : activity.status === 'in-progress' ? (
                                            <FaClock className="text-amber-600 dark:text-amber-400" />
                                        ) : (
                                            <MdAssignment className="text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {activity.title}
                                        </p>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <FaUsers className="w-3 h-3" />
                                                {activity.user}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaCalendarAlt className="w-3 h-3" />
                                                {activity.date.toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                        activity.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        activity.status === 'in-progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                        {activity.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                    <FaList className="text-2xl text-gray-400 dark:text-gray-500" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Start working on assigned issues to see activities here
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Issue Types Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                        <FaExclamationTriangle className="text-amber-600 dark:text-amber-400" />
                        Issue Types Distribution
                    </h2>
                    
                    <div className="space-y-4">
                        {Object.entries(chartData.typeData)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([type, count]) => {
                                const percentage = stats.totalAssigned > 0 
                                    ? Math.round((count / stats.totalAssigned) * 100) 
                                    : 0;
                                
                                return (
                                    <div key={type} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                                                {type}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {count} ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                                className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                                Total issue types handled
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {Object.keys(chartData.typeData).length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Stats Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Platform Users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {allUsers.length}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Platform Issues</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {allIssues.length}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your Contribution</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.resolvedIssues}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            {allIssues.length > 0 ? Math.round((stats.resolvedIssues / allIssues.length) * 100) : 0}% of total
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Staff</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {allUsers.filter(u => u.role === 'staff' && u.status === 'active').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeline Visualization (Optional Enhancement) */}
            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MdTimeline className="text-blue-600 dark:text-blue-400" />
                    Assignment Timeline
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-center h-40">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                                <FaChartLine className="text-2xl text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">
                                Timeline visualization shows your assignment history
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                More data needed for detailed timeline
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboardHome;