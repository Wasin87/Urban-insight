import { useQuery } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { 
  FaSearch, 
  FaFilter, 
  FaUserTie, 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { MdAssignment, MdLocationOn, MdWork, MdEmail, MdPerson, MdDarkMode, MdLightMode } from 'react-icons/md';
import { BiCategory } from 'react-icons/bi';
import Loading from '../../Auth/SocialLogin/Loading';

const AssignStaffs = () => {
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [localIssues, setLocalIssues] = useState([]); 
    const [localStaff, setLocalStaff] = useState([]);  
    const [searchTerm, setSearchTerm] = useState('');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [issueTypeFilter, setIssueTypeFilter] = useState('all');
    const [darkMode, setDarkMode] = useState(false);
    const [showDetails, setShowDetails] = useState({});

    const axiosSecure = useAxiosSecure();
    const staffModalRef = useRef();

    // Toggle dark mode
    React.useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Load Pending Issues
    const { data: issues = [], refetch: refetchIssues, isLoading: issuesLoading } = useQuery({
        queryKey: ['issues', 'pending'],
        queryFn: async () => {
            try {
                const res = await axiosSecure.get('/issues?status=pending');
                const issuesData = res.data || [];
                setLocalIssues(issuesData);
                return issuesData;
            } catch (error) {
                console.error('Error loading issues:', error);
                return [];
            }
        }
    });

    // Load Available Staff (with role='staff')
    const { data: staff = [], refetch: refetchStaff, isLoading: staffLoading } = useQuery({
        queryKey: ['staff', 'available'],
        enabled: !!selectedIssue,
        queryFn: async () => {
            try {
                const res = await axiosSecure.get('/users?role=staff');
                const staffData = res.data || [];
                
                 
                const availableStaff = staffData.filter(staffMember => 
                    staffMember.status !== 'inactive' && 
                    (!selectedIssue?.district || staffMember.district === selectedIssue.district)
                );
                
                setLocalStaff(availableStaff);
                return availableStaff;
            } catch (error) {
                console.error('Error loading staff:', error);
                return [];
            }
        }
    });

    // Filter issues based on search
    const filteredIssues = localIssues.filter(issue => {
        const matchesSearch = !searchTerm || 
            issue.issueTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDistrict = districtFilter === 'all' || 
            issue.district?.toLowerCase() === districtFilter.toLowerCase();
        
        const matchesType = issueTypeFilter === 'all' || 
            issue.issueType?.toLowerCase() === issueTypeFilter.toLowerCase();
        
        return matchesSearch && matchesDistrict && matchesType;
    });

    
    const uniqueDistricts = [...new Set(localIssues
        .map(issue => issue.district)
        .filter(Boolean)
        .sort())];

    
    const uniqueIssueTypes = [...new Set(localIssues
        .map(issue => issue.issueType)
        .filter(Boolean)
        .sort())];

    // Open Modal
    const openAssignStaffModal = (issue) => {
        setSelectedIssue(issue);
        refetchStaff();
        staffModalRef.current.showModal();
    };

    // Close Modal
    const closeModal = () => {
        staffModalRef.current.close();
        setSelectedIssue(null);
    };

    
    const toggleDetails = (issueId) => {
        setShowDetails(prev => ({
            ...prev,
            [issueId]: !prev[issueId]
        }));
    };

     
    const handleAssignStaff = async (staffMember) => {
        try {
            const staffAssignInfo = {
                assignedStaffId: staffMember._id,
                assignedStaffEmail: staffMember.email,
                assignedStaffName: staffMember.displayName || staffMember.name,
                assignedAt: new Date().toISOString(),
                status: 'assigned'
            };

            Swal.fire({
                title: 'Assigning Staff...',
                text: 'Please wait while we assign the staff member',
                allowOutsideClick: false,
                background: darkMode ? '#1f2937' : '#ffffff',
                color: darkMode ? '#ffffff' : '#111827',
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const result = await axiosSecure.patch(`/issues/${selectedIssue._id}/assign-staff`, staffAssignInfo);

            if (result.data.success) {
                
                setLocalStaff(prev => prev.filter(staff => staff._id !== staffMember._id));
                
                 
                setLocalIssues(prev => prev.filter(issue => issue._id !== selectedIssue._id));
                
                 
                setTimeout(() => {
                    closeModal();
                }, 1000);

                Swal.fire({
                    icon: 'success',
                    title: 'Staff Assigned Successfully!',
                    html: `
                        <div class="text-center">
                            <div class="inline-flex items-center justify-center w-16 h-16 ${darkMode ? 'bg-green-900' : 'bg-green-100'} rounded-full mb-4">
                                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2">${staffMember.displayName || staffMember.name}</h3>
                            <p class="${darkMode ? 'text-gray-300' : 'text-gray-600'}">has been assigned to</p>
                            <p class="font-bold text-lg mt-2 ${darkMode ? 'text-blue-400' : 'text-primary'}">"${selectedIssue.issueTitle}"</p>
                            <div class="mt-4 p-3 ${darkMode ? 'bg-green-900' : 'bg-green-50'} rounded-lg">
                                <p class="text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}">
                                    <strong>Status:</strong> Issue is now <span class="font-bold">ASSIGNED</span>
                                </p>
                                <p class="text-sm ${darkMode ? 'text-green-300' : 'text-green-700'} mt-1">
                                    Staff can now access and resolve this issue
                                </p>
                            </div>
                        </div>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: 'Continue',
                    confirmButtonColor: '#10B981',
                    background: darkMode ? '#1f2937' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#111827',
                    timer: 5000
                });

                
                refetchIssues();
            }
        } catch (error) {
            console.error('Error assigning staff:', error);
            Swal.fire({
                icon: 'error',
                title: 'Assignment Failed',
                html: `
                    <div class="text-left">
                        <p class="mb-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}">Could not assign staff to issue.</p>
                        <p class="text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3">${error.response?.data?.error || error.message || 'Unknown error occurred'}</p>
                        <div class="mt-3 p-3 ${darkMode ? 'bg-red-900' : 'bg-red-50'} rounded">
                            <p class="text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}">Please try again or contact support.</p>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#EF4444',
                background: darkMode ? '#1f2937' : '#ffffff',
                color: darkMode ? '#ffffff' : '#111827'
            });
        }
    };

    // Get priority badge color
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-500 text-white dark:bg-red-700 dark:text-red-100';
            case 'medium': return 'bg-yellow-500 text-white dark:bg-yellow-700 dark:text-yellow-100';
            case 'low': return 'bg-green-500 text-white dark:bg-green-700 dark:text-green-100';
            default: return 'bg-blue-500 text-white dark:bg-blue-700 dark:text-blue-100';
        }
    };

    // Get issue type badge
    const getIssueTypeBadge = (type) => {
        switch (type?.toLowerCase()) {
            case 'infrastructure': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'environment': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'safety': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'health': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    // Loading state
    if (issuesLoading) {
        return (
            <Loading></Loading>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-300 ">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 w-70 md:w-full">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Assign Staff to Issues</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Assign available staff members to pending issues</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
 
                        
                        <div className="stats shadow bg-white dark:bg-gray-800 border dark:border-gray-700">
                            <div className="stat">
                                <div className="stat-figure text-primary dark:text-blue-400">
                                    <FaExclamationCircle className="text-2xl" />
                                </div>
                                <div className="stat-title text-gray-600 dark:text-gray-400">Pending Issues</div>
                                <div className="stat-value text-primary dark:text-blue-400">{filteredIssues.length}</div>
                                <div className="stat-desc text-gray-500 dark:text-gray-400">Need staff assignment</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-6 transition-colors duration-300 border dark:border-gray-700 w-70 md:w-full">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Filter Issues</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <FaSearch className="text-gray-400 dark:text-gray-500" />
                                    <span>Search Issues</span>
                                </div>
                            </label>
                            <input
                                type="text"
                                placeholder="Search by title, description, or reporter..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>

                        {/* District Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <MdLocationOn className="text-gray-400 dark:text-gray-500" />
                                    <span>District</span>
                                </div>
                            </label>
                            <select
                                value={districtFilter}
                                onChange={(e) => setDistrictFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all" className="dark:bg-gray-700">All Districts</option>
                                {uniqueDistricts.map(district => (
                                    <option key={district} value={district} className="dark:bg-gray-700">{district}</option>
                                ))}
                            </select>
                        </div>

                        {/* Issue Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <BiCategory className="text-gray-400 dark:text-gray-500" />
                                    <span>Issue Type</span>
                                </div>
                            </label>
                            <select
                                value={issueTypeFilter}
                                onChange={(e) => setIssueTypeFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all" className="dark:bg-gray-700">All Types</option>
                                {uniqueIssueTypes.map(type => (
                                    <option key={type} value={type} className="dark:bg-gray-700">
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Issues Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 transition-colors duration-300 border dark:border-gray-700 w-70 md:w-full">
                <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Pending Issues for Assignment</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total: {filteredIssues.length} issues found</p>
                </div>

                {filteredIssues.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                            <FaCheckCircle className="text-2xl md:text-3xl text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Pending Issues</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">All issues have been assigned or there are no pending issues.</p>
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setDistrictFilter('all');
                                setIssueTypeFilter('all');
                            }}
                            className="btn btn-primary bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="font-semibold text-gray-700 dark:text-gray-300">#</th>
                                    <th className="font-semibold text-gray-700 dark:text-gray-300">Issue Details</th>
                                    <th className="font-semibold text-gray-700 dark:text-gray-300">Priority</th>
                                    <th className="font-semibold text-gray-700 dark:text-gray-300">Location</th>
                                    <th className="font-semibold text-gray-700 dark:text-gray-300">Reported</th>
                                    <th className="font-semibold text-gray-700 dark:text-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIssues.map((issue, index) => (
                                    <tr key={issue._id} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b dark:border-gray-700">
                                        <td className="font-medium text-gray-900 dark:text-white">
                                            {index + 1}
                                        </td>
                                        <td>
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-gray-900 dark:text-white mb-1">{issue.issueTitle}</p>
                                                    <button
                                                        onClick={() => toggleDetails(issue._id)}
                                                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                                        title={showDetails[issue._id] ? "Hide details" : "Show details"}
                                                    >
                                                        {showDetails[issue._id] ? <FaEyeSlash /> : <FaEye />}
                                                    </button>
                                                </div>
                                                {showDetails[issue._id] && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                        {issue.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIssueTypeBadge(issue.issueType)}`}>
                                                        {issue.issueType || 'General'}
                                                    </span>
                                                    {issue.isBoosted && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
                                                            ⚡ Boosted
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                                                {issue.priority ? issue.priority.toUpperCase() : 'MEDIUM'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <MdLocationOn className="text-gray-400 dark:text-gray-500" />
                                                <span className="text-gray-900 dark:text-white">{issue.district || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {issue.createdAt ? new Date(issue.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => openAssignStaffModal(issue)}
                                                className="btn bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white border-none flex items-center gap-2"
                                            >
                                                <FaUserTie />
                                                <span className="hidden md:inline">Assign Staff</span>
                                                <span className="md:hidden">Assign</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Staff Assignment Modal */}
            <dialog ref={staffModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white dark:bg-gray-800 transition-colors duration-300">
                    {/* Modal Header */}
                    <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white mb-3">
                                    Assign Staff to Issue
                                </h3>
                                <div className="bg-white dark:bg-gray-700 p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                                    <p className="font-semibold text-lg text-blue-600 dark:text-blue-400 mb-2">{selectedIssue?.issueTitle}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <MdLocationOn className="text-gray-500 dark:text-gray-400" /> 
                                            District: <span className="font-medium">{selectedIssue?.district || 'N/A'}</span>
                                        </span>
                                        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <FaCalendarAlt className="text-gray-500 dark:text-gray-400" /> 
                                            Reported: <span className="font-medium">{selectedIssue?.createdAt ? new Date(selectedIssue.createdAt).toLocaleDateString() : 'N/A'}</span>
                                        </span>
                                        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <FaUser className="text-gray-500 dark:text-gray-400" /> 
                                            Reporter: <span className="font-medium">{selectedIssue?.submittedBy || 'Unknown'}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="stat p-0">
                                    <div className="stat-title text-gray-600 dark:text-gray-400">Available Staff</div>
                                    <div className="stat-value text-primary dark:text-blue-400 text-2xl md:text-3xl">{localStaff.length}</div>
                                    <div className="stat-desc text-gray-500 dark:text-gray-400">can be assigned</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        {staffLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">Loading staff members...</p>
                                </div>
                            </div>
                        ) : localStaff.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                                    <FaUserTie className="text-3xl text-gray-400 dark:text-gray-500" />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Staff Available</h4>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    There are no available staff members {selectedIssue?.district ? `in ${selectedIssue.district}` : 'currently'}.
                                </p>
                                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 max-w-md mx-auto">
                                    <p className="text-yellow-800 dark:text-yellow-300 font-medium mb-2">Suggested Actions:</p>
                                    <ul className="text-sm text-yellow-700 dark:text-yellow-400 list-disc pl-5 space-y-1">
                                        <li>Check if staff members are set to "staff" role</li>
                                        <li>Wait for staff to become available</li>
                                        <li>Contact staff management for assistance</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                        <FaUserTie />
                                        Available Staff Members
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Select a staff member to assign to this issue. The staff member will receive notification and can start working immediately.
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="font-semibold text-gray-700 dark:text-gray-300">Staff Details</th>
                                                <th className="font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                                                <th className="font-semibold text-gray-700 dark:text-gray-300">Experience</th>
                                                <th className="font-semibold text-gray-700 dark:text-gray-300">Specialization</th>
                                                <th className="font-semibold text-gray-700 dark:text-gray-300">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {localStaff.map((staffMember) => (
                                                <tr key={staffMember._id} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b dark:border-gray-700">
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <div className="avatar">
                                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-800">
                                                                    <img 
                                                                        src={staffMember.photoURL || `https://ui-avatars.com/api/?name=${staffMember.displayName || staffMember.name}&background=random&color=fff`}
                                                                        alt={staffMember.displayName || staffMember.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 dark:text-white">
                                                                    {staffMember.displayName || staffMember.name || 'Unknown Staff'}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Staff ID: {staffMember._id?.slice(-6) || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <MdEmail className="text-gray-400 dark:text-gray-500" />
                                                                <span className="font-medium text-gray-900 dark:text-white">{staffMember.email || 'N/A'}</span>
                                                            </div>
                                                            {staffMember.phone && (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <FaPhone className="text-gray-400 dark:text-gray-500" />
                                                                    <span className="font-medium text-gray-900 dark:text-white">{staffMember.phone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <FaClock className="text-gray-400 dark:text-gray-500" />
                                                            <span className="text-gray-900 dark:text-white">{staffMember.experience || '0'} years</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {staffMember.specialization || 'General'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleAssignStaff(staffMember)}
                                                            className="btn bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white border-none flex items-center gap-2"
                                                        >
                                                            <MdAssignment />
                                                            Assign
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-action p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Note:</span> Staff can be assigned to multiple issues simultaneously.
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 border-none"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6 hover:shadow-lg transition-all duration-300 border dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <FaExclamationCircle className="text-2xl text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Total Pending Issues</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{filteredIssues.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6 hover:shadow-lg transition-all duration-300 border dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                            <FaUserCheck className="text-2xl text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Available Staff</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{localStaff.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6 hover:shadow-lg transition-all duration-300 border dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                            <FaCalendarAlt className="text-2xl text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Today's Issues</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {filteredIssues.filter(issue => {
                                    const issueDate = new Date(issue.createdAt);
                                    const today = new Date();
                                    return issueDate.toDateString() === today.toDateString();
                                }).length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignStaffs;