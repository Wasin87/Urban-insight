import React, { useState } from 'react';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../Hooks/useAuth';
import { FiEdit, FiTrash2, FiUpload } from 'react-icons/fi';
import { FaRocket, FaCrown } from 'react-icons/fa';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../Auth/SocialLogin/Loading';
 

const MyIssues = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    const [filter, setFilter] = useState('');
    const [editingIssue, setEditingIssue] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    // Fetch user's issues
    const { data: issues = [], refetch, isLoading, error } = useQuery({
        queryKey: ['myIssues', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/issues?email=${user.email}`);
            const issuesData = res.data || [];
            
            // Sort issues: boosted first, then by date
            return issuesData.sort((a, b) => {
                if (a.isBoosted && !b.isBoosted) return -1;
                if (!a.isBoosted && b.isBoosted) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        },
        enabled: !!user?.email
    });

    // Delete issue
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                const res = await axiosSecure.delete(`/issues/${id}`);
                if (res.data.deletedCount > 0 || res.data.success) {
                    Swal.fire("Deleted!", "Issue has been deleted.", "success");
                    refetch();
                } else {
                    Swal.fire("Failed", "Issue could not be deleted.", "error");
                }
            } catch (error) {
                console.error("Delete error:", error);
                Swal.fire("Error", "Something went wrong.", "error");
            }
        }
    };

    // Handle Boost Issue - Corrected navigation
    const handleBoostIssue = (issue) => {
        if (issue.isBoosted) {
            toast.info('This issue is already boosted!', {
                position: "top-right",
                autoClose: 3000,
                icon: '🚀'
            });
            return;
        }

        if (issue.status !== 'pending') {
            Swal.fire({
                title: "Cannot Boost",
                text: "Only pending issues can be boosted.",
                icon: "info",
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        // Corrected navigation path - use relative path
        navigate(`/dashboard/payment/${issue._id}`, {
            state: {
                issueTitle: issue.title,
                type: 'boost',
                amount: 100
            }
        });
    };

    // Open Edit Modal
    const openEditModal = (issue) => {
        if (issue.status !== 'pending') {
            Swal.fire("Cannot Edit", "Only pending issues can be edited.", "info");
            return;
        }
        setEditingIssue(issue);
        setSelectedImage(null);
        setImagePreview('');
        setIsModalOpen(true);
    };

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                Swal.fire("Invalid File", "Only JPG, PNG, and GIF images are allowed.", "error");
                e.target.value = '';
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire("File Too Large", "Image must be less than 5MB.", "error");
                e.target.value = '';
                return;
            }

            setSelectedImage(file);
            
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    // Upload image to ImgBB
    const uploadToImgBB = async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_KEY || '6c81d6e628113d50023676aab214c5fd'}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                return data.data.url;
            } else {
                throw new Error(data.error?.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('ImgBB upload error:', error);
            throw error;
        }
    };

    // Update Issue with image upload
    const handleUpdateIssue = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = editingIssue.images?.[0] || '';

            // Upload new image if selected
            if (selectedImage) {
                try {
                    imageUrl = await uploadToImgBB(selectedImage);
                    Swal.fire({
                        title: "Image Uploaded!",
                        text: "Image has been successfully uploaded.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (uploadError) {
                    Swal.fire("Upload Failed", "Could not upload image. Please try again.", "error");
                    setUploading(false);
                    return;
                }
            }

            const updatedData = {
                title: e.target.title.value,
                description: e.target.description.value,
                category: e.target.category.value,
                location: e.target.location.value,
                images: imageUrl ? [imageUrl] : []
            };

            const res = await axiosSecure.patch(`/issues/${editingIssue._id}`, updatedData);

            if (res.data.modifiedCount > 0 || res.data.success) {
                Swal.fire("Updated!", "Issue has been updated successfully.", "success");
                setIsModalOpen(false);
                setSelectedImage(null);
                setImagePreview('');
                refetch();
            } else {
                Swal.fire("Failed", "Could not update issue.", "error");
            }
        } catch (error) {
            console.error("Update error:", error);
            Swal.fire("Error", "Something went wrong.", "error");
        } finally {
            setUploading(false);
        }
    };

    // Clean up preview URL when modal closes
    const handleModalClose = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setSelectedImage(null);
        setImagePreview('');
        setIsModalOpen(false);
    };

    const filteredIssues = filter
        ? issues.filter(issue => issue.status.toLowerCase().includes(filter.toLowerCase()))
        : issues;

    if (isLoading) return (
                 <Loading></Loading>
    );
    
    if (error) return (
        <div className="text-center p-6 text-red-500">
            <p className="text-lg font-semibold">Error loading issues</p>
            <p className="text-sm">{error.message}</p>
        </div>
    );

    return (
        <div className="p-4 md:p-6 bg-linear-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 ">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800 dark:text-white"
            >
                My Issues ({issues.length})
            </motion.h2>

            {/* Stats Cards */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            >
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <div className="text-xl font-bold text-gray-800 dark:text-white">{issues.length}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                        {issues.filter(i => i.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {issues.filter(i => i.status === 'resolved').length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Resolved</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {issues.filter(i => i.isBoosted).length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Boosted</div>
                </div>
            </motion.div>

            {/* Filter */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center mb-6 gap-3"
            >
                <input
                    type="text"
                    placeholder="Filter by status (pending/resolved/in progress)"
                    className="px-4 py-2 border rounded-lg w-64 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                {filter && (
                    <button
                        onClick={() => setFilter('')}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Clear
                    </button>
                )}
            </motion.div>

            {/* Issues Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIssues.length === 0 && (
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center col-span-full text-gray-500 dark:text-gray-400 py-8"
                    >
                        {filter ? 'No issues found with that status.' : 'You have not reported any issues yet.'}
                    </motion.p>
                )}

                {filteredIssues.map((issue, index) => (
                    <motion.div
                        key={issue._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border ${
                            issue.isBoosted 
                                ? 'border-2 border-purple-500 dark:border-purple-400 shadow-lg shadow-purple-500/20' 
                                : 'border border-gray-400 dark:border-gray-400'
                        }`}
                    >
                        {/* Boosted Badge */}
                        {issue.isBoosted && (
                            <div className="absolute top-3 left-3 z-10">
                                <div className="flex items-center gap-1 bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-bold py-1 px-3 rounded-full">
                                    <FaCrown className="text-yellow-300" />
                                    <span>BOOSTED</span>
                                </div>
                            </div>
                        )}

                        {issue.images && issue.images[0] ? (
                            <div className="relative h-48 w-full overflow-hidden">
                                <img 
                                    src={issue.images[0]} 
                                    alt={issue.title} 
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                
                                <div className="absolute top-3 right-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                        issue.status === 'pending' ? 'bg-yellow-500 text-white' :
                                        issue.status === 'resolved' ? 'bg-green-500 text-white' :
                                        issue.status === 'in progress' ? 'bg-blue-500 text-white' :
                                        'bg-gray-500 text-white'
                                    }`}>
                                        {issue.status}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className={`h-48 w-full flex flex-col items-center justify-center ${
                                issue.isBoosted 
                                    ? 'bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' 
                                    : 'bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'
                            }`}>
                                <svg className={`w-12 h-12 mb-2 ${
                                    issue.isBoosted ? 'text-purple-400' : 'text-gray-500 dark:text-gray-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className={issue.isBoosted ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}>
                                    No Image
                                </span>
                            </div>
                        )}

                        <div className="p-4">
                            <div className='flex justify-between items-start mb-3'>
                                <h3 className={`text-xl font-semibold line-clamp-1 flex-1 ${
                                    issue.isBoosted 
                                        ? 'bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' 
                                        : 'text-gray-800 dark:text-white'
                                }`}>
                                    {issue.title}
                                </h3>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 text-sm">{issue.description}</p>

                            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                                    issue.isBoosted
                                        ? 'bg-linear-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200'
                                        : 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100'
                                }`}>
                                    {issue.category}
                                </span>
                                
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                                        issue.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                                        issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                        'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                    }`}>
                                        {issue.priority}
                                    </span>
                                    
                                    <span className="text-sm px-3 py-1 bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                                        {issue.location}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <button
                                    onClick={() => openEditModal(issue)}
                                    className="flex items-center gap-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors flex-1 justify-center"
                                    title={issue.status !== 'pending' ? 'Only pending issues can be edited' : 'Edit Issue'}
                                >
                                    <FiEdit /> 
                                </button>
                                <button
                                    onClick={() => handleDelete(issue._id)}
                                    className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex-1 justify-center"
                                    title="Delete Issue"
                                >
                                    <FiTrash2 /> 
                                </button>
                                <button
                                    onClick={() => navigate(`/dashboard/issueDetails/${issue._id}`)}
                                    className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex-1 justify-center"
                                    title="View Details"
                                >
                                    <FaMagnifyingGlass /> 
                                </button>
                            </div>

                            {/* Boost Button Section - Corrected */}
                            <div className=" pt-3 border-t border-gray-100 dark:border-gray-700">
                                {issue.isBoosted ? (
                                    <div className="flex items-center justify-center  text-purple-600 dark:text-purple-400">
                                        <FaCrown />
                                        <span className="text-sm font-semibold">Already Boosted</span>
                                        <span className="text-xs text-gray-400">
                                            {issue.boostedAt ? new Date(issue.boostedAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleBoostIssue(issue)}
                                        disabled={issue.status !== 'pending'}
                                        className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                                            issue.status === 'pending'
                                                ? 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg'
                                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        }`}
                                        title={issue.status !== 'pending' ? 'Only pending issues can be boosted' : 'Boost this issue'}
                                    >
                                        <FaRocket />
                                        Boost Issue
                                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded">৳100</span>
                                    </motion.button>
                                )}
                            </div>

                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                                Updated: {new Date(issue.updatedAt || issue.createdAt).toLocaleDateString()}
                                {issue.isBoosted && (
                                    <span className="ml-2 text-purple-500">
                                        • Boosted
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit Modal */}
            {isModalOpen && editingIssue && (
                <Dialog open={isModalOpen} onClose={handleModalClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <Dialog.Title className="text-2xl font-bold text-gray-800 dark:text-white">Edit Issue</Dialog.Title>
                                <button
                                    onClick={handleModalClose}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleUpdateIssue} className="space-y-4">
                                {/* Current Image Preview */}
                                {(editingIssue.images?.[0] || imagePreview) && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            {selectedImage ? 'New Image Preview' : 'Current Image'}
                                        </label>
                                        <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                                            <img 
                                                src={imagePreview || editingIssue.images[0]} 
                                                alt="Preview" 
                                                className="h-full w-full object-cover"
                                            />
                                            {imagePreview && (
                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                    New
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Image Upload */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Upload New Image (Optional)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-teal-500 transition-colors">
                                        <input
                                            type="file"
                                            id="image-upload"
                                            accept=".jpg,.jpeg,.png,.gif"
                                            className="hidden"
                                            onChange={handleImageSelect}
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                                            <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Click to upload new image
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                JPG, PNG, GIF (Max 5MB)
                                            </span>
                                        </label>
                                        {selectedImage && (
                                            <p className="text-sm text-teal-600 dark:text-teal-400 mt-2">
                                                Selected: {selectedImage.name}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Leave empty to keep current image
                                    </p>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="title"
                                        defaultValue={editingIssue.title}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        defaultValue={editingIssue.description}
                                        className="w-full px-4 py-2 border rounded-lg h-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        defaultValue={editingIssue.category}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Sanitation">Sanitation</option>
                                        <option value="Security">Security</option>
                                        <option value="Transportation">Transportation</option>
                                        <option value="Environment">Environment</option>
                                        <option value="Health">Health</option>
                                        <option value="Education">Education</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="location"
                                        defaultValue={editingIssue.location}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={handleModalClose}
                                        disabled={uploading}
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Dialog.Panel>
                </Dialog>
            )}
        </div>
    );
};

export default MyIssues;