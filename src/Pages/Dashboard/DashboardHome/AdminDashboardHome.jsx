import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { 
  FaUsers, 
  FaUserTie, 
  FaExclamationCircle, 
  FaStar, 
  FaChartLine, 
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaBox,
  FaUserCheck,
  FaUserTimes,
  FaHourglassHalf,
  FaTachometerAlt,
  FaRegMoneyBillAlt,
  FaChevronRight,
  FaExclamationTriangle
} from 'react-icons/fa';
import { 
  MdOutlinePayments, 
  MdOutlineTrendingUp,
  MdOutlineVerifiedUser,
  MdOutlinePendingActions,
  MdOutlineAssignment
} from 'react-icons/md';
import { 
  Legend, 
  Pie, 
  PieChart, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import Loading from '../../Auth/SocialLogin/Loading';

const AdminDashboardHome = () => {
    const axiosSecure = useAxiosSecure();
    
    // Fetch All Data
    const { data: usersData = [], isLoading: usersLoading } = useQuery({
        queryKey: ['users-data'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data || [];
        }
    });

    const { data: issuesData = [], isLoading: issuesLoading } = useQuery({
        queryKey: ['issues-data'],
        queryFn: async () => {
            const res = await axiosSecure.get('/issues');
            return res.data || [];
        }
    });

    const { data: paymentsData = [], isLoading: paymentsLoading } = useQuery({
        queryKey: ['payments-data'],
        queryFn: async () => {
            const res = await axiosSecure.get('/payments');
            return res.data?.payments || res.data || [];
        }
    });

    const { data: staffStatsData = [], isLoading: staffStatsLoading } = useQuery({
        queryKey: ['staff-stats'],
        queryFn: async () => {
            const res = await axiosSecure.get('/staff-stats');
            return res.data?.staffStats || [];
        }
    });

    // Calculate statistics dynamically from database
    const calculateStats = () => {
        // User statistics
        const totalUsers = usersData.length;
        const totalAdmins = usersData.filter(user => user.role === 'admin').length;
        const totalStaff = usersData.filter(user => user.role === 'staff').length;
        const premiumUsers = usersData.filter(user => user.isPremium).length;
        const blockedUsers = usersData.filter(user => user.role === 'blocked' || user.status === 'blocked').length;
        const activeUsers = usersData.filter(user => user.status === 'active').length;

        // Issue statistics
        const totalIssues = issuesData.length;
        const pendingIssues = issuesData.filter(issue => issue.status === 'pending').length;
        const assignedIssues = issuesData.filter(issue => issue.status === 'assigned').length;
        const inProgressIssues = issuesData.filter(issue => issue.status === 'in-progress').length;
        const resolvedIssues = issuesData.filter(issue => issue.status === 'resolved').length;
        const rejectedIssues = issuesData.filter(issue => issue.status === 'rejected').length;
        const boostedIssues = issuesData.filter(issue => issue.isBoosted).length;

        // Payment statistics
        const totalRevenue = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const premiumPayments = paymentsData.filter(p => p.type === 'premium').length;
        const boostPayments = paymentsData.filter(p => p.type === 'boost').length;
        const recentPayments = paymentsData.slice(0, 5).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

        // Staff performance
        const avgStaffPerformance = staffStatsData.length > 0 
            ? staffStatsData.reduce((sum, staff) => sum + (staff.successRate || 0), 0) / staffStatsData.length
            : 0;

        // Recent activity
        const recentIssues = issuesData
            .slice(0, 5)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
            totalUsers,
            totalAdmins,
            totalStaff,
            premiumUsers,
            blockedUsers,
            activeUsers,
            totalIssues,
            pendingIssues,
            assignedIssues,
            inProgressIssues,
            resolvedIssues,
            rejectedIssues,
            boostedIssues,
            totalRevenue,
            premiumPayments,
            boostPayments,
            recentPayments,
            avgStaffPerformance,
            recentIssues,
            totalPayments: paymentsData.length
        };
    };

    const stats = calculateStats();

    // Prepare chart data from real data
    const prepareChartData = () => {
        
        const pieChartData = [
            { name: 'Pending', value: stats.pendingIssues, color: '#FF6B6B' },
            { name: 'Assigned', value: stats.assignedIssues, color: '#4ECDC4' },
            { name: 'In Progress', value: stats.inProgressIssues, color: '#FFD166' },
            { name: 'Resolved', value: stats.resolvedIssues, color: '#06D6A0' },
            { name: 'Rejected', value: stats.rejectedIssues, color: '#EF476F' },
        ];

       
        const userRoleData = [
            { role: 'Users', count: stats.totalUsers - stats.totalAdmins - stats.totalStaff - stats.blockedUsers },
            { role: 'Admins', count: stats.totalAdmins },
            { role: 'Staff', count: stats.totalStaff },
            { role: 'Premium', count: stats.premiumUsers },
            { role: 'Blocked', count: stats.blockedUsers },
        ];

         
        const revenueTrendData = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
             
            const dayPayments = paymentsData.filter(p => {
                const paymentDate = new Date(p.paidAt);
                return paymentDate.toDateString() === date.toDateString();
            });
            
            revenueTrendData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
                payments: dayPayments.length
            });
        }

        return { pieChartData, userRoleData, revenueTrendData };
    };

    const { pieChartData, userRoleData, revenueTrendData } = prepareChartData();

    // Loading state
    if (usersLoading || issuesLoading || paymentsLoading) {
        return (
            <Loading></Loading>
        );
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="p-6 space-y-8 bg-linear-to-br  from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-200">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                        Admin Dashboard
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 w-70 md:w-full">
                        Real-time system statistics and performance overview
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full">
                        Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-2 rounded-full">
                        Total Data: {stats.totalUsers + stats.totalIssues + stats.totalPayments} records
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-70 md:w-full">
                {/* Total Users */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</p>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.totalUsers}</h3>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                            <FaUsers className="text-2xl text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                        <MdOutlineTrendingUp className="mr-1" />
                        <span>{stats.activeUsers} Active • {stats.blockedUsers} Blocked</span>
                    </div>
                </div>

                {/* Total Issues */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Issues</p>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.totalIssues}</h3>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                            <FaExclamationCircle className="text-2xl text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                        <span className="text-red-600 dark:text-red-400">{stats.pendingIssues} Pending</span>
                        <span className="text-blue-600 dark:text-blue-400">{stats.assignedIssues} Assigned</span>
                        <span className="text-green-600 dark:text-green-400">{stats.resolvedIssues} Resolved</span>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{formatCurrency(stats.totalRevenue)}</h3>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                            <FaMoneyBillWave className="text-2xl text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        From {stats.totalPayments} payments ({stats.premiumPayments} premium, {stats.boostPayments} boost)
                    </div>
                </div>

                {/* Premium Users */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Premium Users</p>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.premiumUsers}</h3>
                        </div>
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
                            <FaStar className="text-2xl text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {((stats.premiumUsers / stats.totalUsers) * 100 || 0).toFixed(1)}% of total users • {stats.boostedIssues} boosted issues
                    </div>
                </div>
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-70 md:w-full">
                {/* Staff Members */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                            <FaUserTie className="text-2xl text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Staff Members</p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalStaff}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {staffStatsData.length > 0 ? `Avg. ${stats.avgStaffPerformance.toFixed(1)}% success rate` : 'No performance data'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Admins */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
                            <FaUsers className="text-2xl text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Administrators</p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalAdmins}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                System administrators
                            </p>
                        </div>
                    </div>
                </div>

                {/* Blocked Users */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700/40 rounded-full">
                            <FaUserTimes className="text-2xl text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Blocked/Rejected</p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.blockedUsers}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Restricted accounts
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-70 md:w-full">
                 
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <FaChartLine />
                        Issues Status Distribution
                    </h3>
                    <div className=" h-[350px] md:h-[300px]">
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
                    <div className="mt-4 grid grid-cols-5 gap-2">
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

                {/* User Distribution Bar Chart */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 w-70 md:w-full">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <FaUsers />
                        User Distribution by Role
                    </h3>
                    <div className="h-[350px] md:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userRoleData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                                <XAxis 
                                    dataKey="role" 
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280' }}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280' }}
                                />
                                <Tooltip 
                                    formatter={(value) => [`${value} users`, 'Count']}
                                    contentStyle={{ 
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        color: '#374151'
                                    }}
                                />
                                <Bar 
                                    dataKey="count" 
                                    radius={[4, 4, 0, 0]}
                                    name="Users"
                                >
                                    {userRoleData.map((entry, index) => {
                                        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#6B7280'];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Revenue Trend Area Chart */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 w-70 md:w-full">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <FaRegMoneyBillAlt />
                    30-Day Revenue Trend
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueTrendData}>
                            <defs>
                                <linearlinear id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearlinear>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#6b7280"
                                tick={{ fill: '#6b7280' }}
                            />
                            <YAxis 
                                stroke="#6b7280"
                                tick={{ fill: '#6b7280' }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                                formatter={(value) => [`$${value}`, 'Revenue']}
                                contentStyle={{ 
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    color: '#374151'
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10B981" 
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                name="Daily Revenue"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-70 md:w-full">
                {/* Recent Payments */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <MdOutlinePayments />
                        Recent Payments
                    </h3>
                    <div className="space-y-4">
                        {stats.recentPayments.length > 0 ? (
                            stats.recentPayments.map((payment, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${payment.type === 'premium' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                                            {payment.type === 'premium' ? (
                                                <FaStar className="text-amber-600 dark:text-amber-400" />
                                            ) : (
                                                <MdOutlineVerifiedUser className="text-purple-600 dark:text-purple-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">
                                                {payment.userName || payment.userEmail}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {payment.type === 'premium' ? 'Premium Subscription' : 'Issue Boost'}
                                                {payment.issueTitle ? `: ${payment.issueTitle}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 dark:text-white">{formatCurrency(payment.amount)}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(payment.paidAt)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent payments</p>
                        )}
                    </div>
                </div>

{/* Recent Issues */}
<div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 md:p-6 w-full">
    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
        <FaExclamationCircle />
        Recent Issues
    </h3>
    <div className="space-y-3 md:space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {stats.recentIssues.length > 0 ? (
            stats.recentIssues.map((issue, index) => (
                <div 
                    key={index} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors gap-3 md:gap-4"
                >
                    {/* Left Section - Issue Details */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                            issue.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            issue.status === 'assigned' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            issue.status === 'in-progress' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                            issue.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30' :
                            'bg-red-100 dark:bg-red-900/30'
                        }`}>
                            {issue.status === 'pending' ? (
                                <MdOutlinePendingActions className="text-yellow-600 dark:text-yellow-400 w-4 h-4 md:w-5 md:h-5" />
                            ) : issue.status === 'assigned' ? (
                                <MdOutlineAssignment className="text-blue-600 dark:text-blue-400 w-4 h-4 md:w-5 md:h-5" />
                            ) : issue.status === 'in-progress' ? (
                                <FaHourglassHalf className="text-indigo-600 dark:text-indigo-400 w-4 h-4 md:w-5 md:h-5" />
                            ) : issue.status === 'resolved' ? (
                                <FaCheckCircle className="text-green-600 dark:text-green-400 w-4 h-4 md:w-5 md:h-5" />
                            ) : (
                                <FaUserTimes className="text-red-600 dark:text-red-400 w-4 h-4 md:w-5 md:h-5" />
                            )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-800 dark:text-white truncate text-sm md:text-base">
                                {issue.issueTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {issue.submittedBy}
                                </p>
                                {issue.isBoosted && (
                                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs">
                                        ⚡Boosted
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Status and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                            issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            issue.status === 'assigned' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            issue.status === 'in-progress' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                            issue.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                            {issue.status}
                        </span>
                        
     
                        
       
                    </div>
                </div>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4">
                <FaExclamationTriangle className="text-gray-400 dark:text-gray-500 text-3xl mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-center">No recent issues to display</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-1">Issues will appear here once reported</p>
            </div>
        )}
    </div>
    
     
</div>

<style jsx>{`
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(251, 191, 36, 0.3) transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(251, 191, 36, 0.3);
        border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(251, 191, 36, 0.5);
    }
    
    /* Mobile-specific styles */
    @media (max-width: 640px) {
        .custom-scrollbar {
            scrollbar-width: none; /* Hide scrollbar on mobile */
        }
        
        .custom-scrollbar::-webkit-scrollbar {
            display: none; /* Hide scrollbar on mobile */
        }
        
        .issue-card {
            padding: 12px;
        }
        
        .status-badge {
            font-size: 11px;
            padding: 2px 8px;
        }
    }
`}</style>
            </div>

            {/* System Summary */}
            <div className="bg-linear-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white w-70 md:w-full">
                <h3 className="text-xl font-semibold mb-4">System Performance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-sm opacity-90">Resolution Rate</p>
                        <p className="text-2xl font-bold">
                            {stats.totalIssues > 0 ? ((stats.resolvedIssues / stats.totalIssues) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm opacity-90">Avg. Staff Performance</p>
                        <p className="text-2xl font-bold">{stats.avgStaffPerformance.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm opacity-90">Premium Conversion</p>
                        <p className="text-2xl font-bold">
                            {stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm opacity-90">Boosted Issues</p>
                        <p className="text-2xl font-bold">
                            {stats.totalIssues > 0 ? ((stats.boostedIssues / stats.totalIssues) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Staff Performance Section */}
            {staffStatsData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 w-70 md:w-full">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <FaTachometerAlt />
                        Staff Performance Overview
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <th className="text-left p-4">Staff Member</th>
                                    <th className="text-left p-4">Assigned Issues</th>
                                    <th className="text-left p-4">Resolved</th>
                                    <th className="text-left p-4">Rejected</th>
                                    <th className="text-left p-4">Success Rate</th>
                                    <th className="text-left p-4">Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffStatsData.map((staff, index) => (
                                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="w-10 h-10 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                        {staff.displayName?.charAt(0) || staff.email?.charAt(0) || 'S'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{staff.displayName || 'Staff Member'}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{staff.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold">{staff.assignedIssues || 0}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-green-600 dark:text-green-400 font-bold">{staff.resolvedIssues || 0}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-red-600 dark:text-red-400 font-bold">{staff.rejectedIssues || 0}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-500 h-2 rounded-full" 
                                                        style={{ width: `${staff.successRate || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="font-bold">{staff.successRate || 0}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-500 h-2 rounded-full" 
                                                        style={{ width: `${staff.completionRate || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="font-bold">{staff.completionRate || 0}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardHome;