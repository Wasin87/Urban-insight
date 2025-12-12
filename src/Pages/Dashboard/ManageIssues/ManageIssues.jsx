import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
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
  FaEdit
} from 'react-icons/fa';
import { MdPriorityHigh, MdCategory } from 'react-icons/md';
import { MdInfo } from "react-icons/md";

const ManageIssues = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch staff's assigned issues
  const { data: issues = [], refetch, isLoading } = useQuery({
    queryKey: ['staffIssues', user?.email, statusFilter, priorityFilter],
    queryFn: async () => {
      if (!user?.email) return [];
      
      // First get staff user to get their ID
      const staffRes = await axiosSecure.get(`/users/${user.email}`);
      const staff = staffRes.data;
      
      if (!staff?._id) return [];
      
      // Get issues assigned to this staff
      const issuesRes = await axiosSecure.get(`/staff/${staff._id}/issues`);
      const assignedIssues = issuesRes.data?.issues || [];
      
      // Apply filters
      let filteredIssues = assignedIssues;
      
      if (statusFilter !== 'all') {
        filteredIssues = filteredIssues.filter(issue => issue.status === statusFilter);
      }
      
      if (priorityFilter !== 'all') {
        filteredIssues = filteredIssues.filter(issue => issue.priority === priorityFilter);
      }
      
      if (searchTerm) {
        filteredIssues = filteredIssues.filter(issue => 
          issue.issueTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return filteredIssues;
    },
    enabled: !!user?.email
  });

  // Handle status update
  const handleStatusUpdate = async (issueId, newStatus, issueTitle) => {
    try {
      const statusUpdate = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      // Show confirmation dialog
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
        background: '#ffffff',
        color: '#111827'
      });

      if (result.isConfirmed) {
        // Show loading
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
          // Refetch issues to update the list
          refetch();

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
    switch (priority?.toLowerCase()) {
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
    switch (category?.toLowerCase()) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Issues</p>
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
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">High Priority</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {issues.filter(i => i.priority === 'high').length}
              </h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <FaExclamationTriangle className="text-2xl text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          Filter Issues
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <FaSearch className="text-gray-400" />
                <span>Search Issues</span>
              </div>
            </label>
            <input
              type="text"
              placeholder="Search by title, description, or reporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <MdInfo className="text-gray-400" />
                <span>Status</span>
              </div>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <span>Priority</span>
              </div>
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Assigned Issues</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Total: {issues.length} issues found
          </p>
        </div>

        {issues.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <FaCheckCircle className="text-3xl text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Issues Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No issues are currently assigned to you'}
            </p>
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="btn btn-primary mt-4"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="font-semibold text-gray-700 dark:text-gray-300">#</th>
                  <th className="font-semibold text-gray-700 dark:text-gray-300">Issue Details</th>
                  <th className="font-semibold text-gray-700 dark:text-gray-300">Priority</th>
                  <th className="font-semibold text-gray-700 dark:text-gray-300">Category</th>
                  <th className="font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="font-semibold text-gray-700 dark:text-gray-300">Submitted By</th>
                  <th className="font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, index) => (
                  <tr key={issue._id} className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="font-medium">{index + 1}</td>
                    <td>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{issue.issueTitle}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            {new Date(issue.createdAt).toLocaleDateString()}
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
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityBadge(issue.priority)}`}>
                        {issue.priority || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryBadge(issue.issueType)}`}>
                        {issue.issueType || 'General'}
                      </span>
                    </td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(issue.status)}`}>
                        {issue.status?.replace('-', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="text-sm">{issue.submittedBy}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {/* Status Update Buttons */}
                        {issue.status !== 'resolved' && issue.status !== 'rejected' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(issue._id, 'in-progress', issue.issueTitle)}
                              className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white border-0"
                              title="Mark as In Progress"
                            >
                              <FaClock className="w-3 h-3 mr-1" />
                              In Progress
                            </button>
                            
                            <button
                              onClick={() => handleStatusUpdate(issue._id, 'resolved', issue.issueTitle)}
                              className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-0"
                              title="Mark as Resolved"
                            >
                              <FaCheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </button>
                          </>
                        )}
                        
                        {issue.status === 'in-progress' && (
                          <button
                            onClick={() => handleStatusUpdate(issue._id, 'rejected', issue.issueTitle)}
                            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-0"
                            title="Mark as Rejected"
                          >
                            Reject
                          </button>
                        )}
                        
                        {/* View Details Button */}
                        <button
                          className="btn btn-sm btn-outline border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          title="View Details"
                        >
                          <FaEye className="w-3 h-3" />
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
          <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Assigned - Recently assigned</span>
          <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">In Progress - Currently working</span>
          <span className="badge bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Resolved - Successfully completed</span>
          <span className="badge bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejected - Cannot be resolved</span>
        </div>
      </div>
    </div>
  );
};

export default ManageIssues;