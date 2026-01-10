import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { 
  FaTasks, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaFilter,
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEye,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaImage,
  FaClipboard,
  FaTag
} from 'react-icons/fa';
import { MdPriorityHigh, MdCategory } from 'react-icons/md';
import { MdInfo } from "react-icons/md";
import Loading from '../../Auth/SocialLogin/Loading';
import { motion, AnimatePresence } from 'framer-motion';

const ManageIssues = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "winter");
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Fetch staff's assigned issues
  const { data: issues = [], refetch, isLoading } = useQuery({
    queryKey: ['staffIssues', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      try {
        const staffRes = await axiosSecure.get(`/users/${user.email}`);
        const staff = staffRes.data;
        
        if (!staff?._id) return [];
        
        const issuesRes = await axiosSecure.get(`/staff/${staff._id}/issues`);
        return issuesRes.data?.issues || [];
      } catch (error) {
        console.error('Error fetching issues:', error);
        return [];
      }
    },
    enabled: !!user?.email
  });

  // Apply filters locally
  const filteredIssues = issues.filter(issue => {
    // Search filter
    const searchMatch = searchTerm === '' || 
      issue.issueTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.issueType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.district?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const statusMatch = statusFilter === 'all' || issue.status === statusFilter;
    
    // Priority filter - handle both 'urgent' and 'high' as high priority
    let priorityMatch = priorityFilter === 'all';
    if (priorityFilter === 'high') {
      priorityMatch = issue.priority === 'high' || issue.priority === 'urgent';
    } else if (priorityFilter !== 'all') {
      priorityMatch = issue.priority === priorityFilter;
    }

    return searchMatch && statusMatch && priorityMatch;
  });

  // Theme management
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleStatusUpdate = async (issueId, newStatus, issueTitle) => {
    try {
      const statusUpdate = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      const result = await Swal.fire({
        title: `Update Status to ${newStatus}?`,
        html: `
          <div class="text-left">
            <p class="mb-2"><strong>Issue:</strong> ${issueTitle}</p>
            <p class="mb-3"><strong>New Status:</strong> <span class="capitalize">${newStatus}</span></p>
            <div class="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
              <p class="font-medium mb-1">Note:</p>
              <p>This action will change the issue status in the database.</p>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Update Status',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        background: theme === "night" ? "#1f2937" : "#ffffff",
        color: theme === "night" ? "#ffffff" : "#111827",
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: 'Updating Status...',
          text: 'Please wait while we update the issue status',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await axiosSecure.patch(`/issues/${issueId}/status`, statusUpdate);

        if (response.data.success) {
          await refetch();

          Swal.fire({
            icon: 'success',
            title: 'Status Updated!',
            html: `
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Status Updated Successfully</h3>
                <p class="text-gray-600">Issue: <strong>${issueTitle}</strong></p>
                <p class="text-gray-600">New Status: <span class="font-bold capitalize">${newStatus}</span></p>
              </div>
            `,
            timer: 2500,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.error || 'Failed to update issue status',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // View issue details modal
  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowIssueModal(false);
    setSelectedIssue(null);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get priority badge color
  const getPriorityBadge = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get category badge color
  const getCategoryBadge = (category) => {
    const categoryLower = category?.toLowerCase();
    switch (categoryLower) {
      case 'infrastructure':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'environment':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'safety':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'health':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Manage Assigned Issues
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and update status of issues assigned to you
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 w-80 md:w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Assigned</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{issues.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FaTasks className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">In Progress</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {issues.filter(i => i.status === 'in-progress').length}
              </h3>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <FaClock className="text-2xl text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Resolved</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {issues.filter(i => i.status === 'resolved').length}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FaCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Urgent Priority</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {issues.filter(i => i.priority === 'high' || i.priority === 'urgent').length}
              </h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <FaExclamationTriangle className="text-2xl text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 w-80 md:w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            Filter & Search Issues
          </h3>
          {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <FaTimes className="w-3 h-3" />
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <FaSearch className="text-gray-400" />
                <span>Search Issues</span>
              </div>
            </label>
            <input
              type="text"
              placeholder="Search by title, description, reporter, location, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-400 dark:focus:border-amber-400 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Search across all fields including description, category, and location
            </p>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <MdInfo className="text-gray-400" />
                <span>Filter by Status</span>
              </div>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-400 dark:focus:border-amber-400 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <MdPriorityHigh className="text-gray-400" />
                <span>Filter by Priority</span>
              </div>
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-400 dark:focus:border-amber-400 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="high">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm">
                  Search: "{searchTerm}"
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-sm">
                  Status: {statusFilter}
                </span>
              )}
              {priorityFilter !== 'all' && (
                <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm">
                  Priority: {priorityFilter}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Issues Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden w-80 md:w-full">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Assigned Issues</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Showing {filteredIssues.length} of {issues.length} issues
              {filteredIssues.length !== issues.length && (
                <span className="ml-2 text-amber-600 dark:text-amber-400">
                  (Filtered)
                </span>
              )}
            </p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Updated: Just now
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <FaSearch className="text-3xl text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Issues Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'No issues match your current filters. Try adjusting your search criteria.' 
                : 'No issues are currently assigned to you. Check back later.'}
            </p>
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button 
                onClick={handleClearFilters}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Issue Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Submitted By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredIssues.map((issue, index) => (
                  <tr 
                    key={issue._id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          {issue.title || 'Untitled Issue'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {issue.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            {formatDate(issue.createdAt)}
                          </span>
                          {issue.district && (
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt className="w-3 h-3" />
                              {issue.district}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${getPriorityBadge(issue.priority)}`}>
                        {issue.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${getCategoryBadge(issue.issueType)}`}>
                        {issue.issueType || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(issue.status)}`}>
                        {issue.status?.replace('-', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FaUser className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {issue.submittedBy || 'Anonymous'}
                          </p>
                          {issue.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {issue.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {/* Status Update Buttons */}
                        {issue.status !== 'resolved' && issue.status !== 'rejected' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(issue._id, 'in-progress', issue.issueTitle)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                              title="Mark as In Progress"
                            >
                              <FaClock className="w-3 h-3" />
                              In Progress
                            </button>
                            
                            <button
                              onClick={() => handleStatusUpdate(issue._id, 'resolved', issue.issueTitle)}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                              title="Mark as Resolved"
                            >
                              <FaCheckCircle className="w-3 h-3" />
                              Resolved
                            </button>
                          </>
                        )}
                        
                        {issue.status === 'in-progress' && (
                          <button
                            onClick={() => handleStatusUpdate(issue._id, 'rejected', issue.issueTitle)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                            title="Mark as Rejected"
                          >
                            Reject
                          </button>
                        )}
                        
                        {/* View Details Button */}
                        <button
                          onClick={() => handleViewIssue(issue)}
                          className="px-3 py-1.5 border border-amber-100 dark:border-gray-100 text-gray-50 dark:text-gray-50 text-xs font-medium rounded-lg bg-amber-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                          title="View Full Details"
                        >
                          <FaEye className="w-3 h-3" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Legend */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 dark:text-white mb-4">Status Legend:</h3>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Assigned - Recently assigned
          </span>
          <span className="px-3 py-1.5 rounded-full text-sm bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            In Progress - Currently working
          </span>
          <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Resolved - Successfully completed
          </span>
          <span className="px-3 py-1.5 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Rejected - Cannot be resolved
          </span>
        </div>
      </div>

      {/* Issue Details Modal */}
      <AnimatePresence>
        {showIssueModal && selectedIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Issue Details</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    ID: {selectedIssue._id?.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Issue Title */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedIssue.issueTitle}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedIssue.status)}`}>
                      {selectedIssue.status?.replace('-', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(selectedIssue.priority)}`}>
                      {selectedIssue.priority} Priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryBadge(selectedIssue.issueType)}`}>
                      {selectedIssue.issueType}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaClipboard className="text-gray-400" />
                    Description
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {selectedIssue.description}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Submitted By */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      Submitted By
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <p className="font-medium text-gray-900 dark:text-white">{selectedIssue.submittedBy}</p>
                      {selectedIssue.email && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          <FaEnvelope className="inline w-3 h-3 mr-1" />
                          {selectedIssue.email}
                        </p>
                      )}
                      {selectedIssue.phone && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          <FaPhone className="inline w-3 h-3 mr-1" />
                          {selectedIssue.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location & Date */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      Location & Date
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
                      {selectedIssue.district && (
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>District:</strong> {selectedIssue.district}
                        </p>
                      )}
                      {selectedIssue.thana && (
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>Thana:</strong> {selectedIssue.thana}
                        </p>
                      )}
                      {selectedIssue.address && (
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>Address:</strong> {selectedIssue.address}
                        </p>
                      )}
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Reported:</strong> {formatDate(selectedIssue.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Images */}
                {selectedIssue.images && selectedIssue.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FaImage className="text-gray-400" />
                      Attached Images ({selectedIssue.images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedIssue.images.map((image, index) => (
                        <div key={index} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={image}
                            alt={`Issue image ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {selectedIssue.additionalInfo && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FaTag className="text-gray-400" />
                      Additional Information
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedIssue.additionalInfo}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                  {(selectedIssue.status !== 'resolved' && selectedIssue.status !== 'rejected') && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedIssue._id, 'resolved', selectedIssue.issueTitle);
                        handleCloseModal();
                      }}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageIssues;