import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import useAuth from '../../Hooks/useAuth';
import axios from 'axios';
import { FaExclamationTriangle, FaCrown } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';

const ReportIssue = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const [userIssueCount, setUserIssueCount] = useState(0);
    const [isPremium, setIsPremium] = useState(false);

    // Fetch user data and issue count
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['user', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const res = await axiosSecure.get(`/users/${user.email}`);
            return res.data;
        },
        enabled: !!user?.email
    });

    // Fetch user's issue count
    const { data: userIssues, isLoading: issuesLoading } = useQuery({
        queryKey: ['userIssues', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/issues?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email
    });

    useEffect(() => {
        if (userData) {
            setIsPremium(userData.isPremium || false);
        }
        if (userIssues) {
            setUserIssueCount(userIssues.length);
        }
    }, [userData, userIssues]);

    // Check if user can report more issues
    const canReportMore = () => {
        if (!user) return false;
        if (isPremium) return true;
        return userIssueCount < 3;
    };

    const handleReportIssue = async (data) => {
        // Check if user is logged in
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please login to report an issue',
                confirmButtonText: 'Go to Login',
                confirmButtonColor: '#3085d6'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login', { state: { from: '/addIssues' } });
                }
            });
            return;
        }

        // Check if user can report more issues
        if (!canReportMore()) {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Reached!',
                html: `
                    <div class="text-left">
                        <p>You have reached the maximum limit of 3 issue reports for free users.</p>
                        <p class="mt-2"><strong>Upgrade to Premium to report unlimited issues!</strong></p>
                        <div class="mt-4 flex items-center gap-2 text-amber-600">
                            <i class="fas fa-crown"></i>
                            <span>Premium users enjoy unlimited issue reporting</span>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Go Premium',
                confirmButtonColor: '#f59e0b',
                cancelButtonText: 'Cancel',
                cancelButtonColor: '#6b7280'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/premium');
                }
            });
            return;
        }

        try {
            let imagesURLs = [];

            // Upload images to imgbb if any
            if (data.images && data.images.length > 0) {
                const imageFiles = Array.from(data.images);

                for (let file of imageFiles) {
                    const formData = new FormData();
                    formData.append('image', file);

                    const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_KEY}`;
                    const res = await axios.post(image_API_URL, formData);
                    imagesURLs.push(res.data.data.url);
                }
            }

            // Prepare issue payload
            const issueData = {
                title: data.title,
                description: data.description,
                category: data.category,
                location: data.location,
                priority: data.priority,
                submittedBy: user.email,
                images: imagesURLs,
                status: 'pending',
                isBoosted: false,
                upvotes: 0,
                upvotedBy: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Confirm submission
            const result = await Swal.fire({
                title: "Submit this issue?",
                html: `
                    <div class="text-left">
                        <p>You are reporting a public infrastructure issue.</p>
                        ${!isPremium ? `
                            <div class="mt-3 p-3 bg-yellow-50 rounded-lg">
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-info-circle text-yellow-600"></i>
                                    <span class="text-sm font-medium text-yellow-800">
                                        Free user: ${userIssueCount + 1}/3 reports used
                                    </span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, submit report",
                cancelButtonText: "Cancel"
            });

            if (result.isConfirmed) {
                const response = await axiosSecure.post('/issues', issueData);

                if (response.data.insertedId) {
                    Swal.fire({
                        position: "top-center",
                        icon: "success",
                        title: "Issue Report Submitted Successfully!",
                        html: `
                            <div class="text-left">
                                <p>Reference ID: <strong>${response.data.insertedId}</strong></p>
                                ${!isPremium ? `
                                    <div class="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <div class="flex items-center gap-2">
                                            <i class="fas fa-crown text-amber-600"></i>
                                            <span class="text-sm">
                                                Reports used: ${userIssueCount + 1}/3. 
                                                <a href="/premium" class="text-blue-600 hover:underline">Go Premium</a> for unlimited reports!
                                            </span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `,
                        showConfirmButton: true,
                        timer: 5000
                    }).then(() => {
                        reset();
                        navigate('/dashboard/myIssues');
                    });
                } else {
                    throw new Error('Failed to submit issue');
                }
            }

        } catch (error) {
            console.error('Error submitting issue:', error);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.message || 'Failed to submit issue report. Please try again.',
                confirmButtonColor: "#d33",
            });
        }
    };

    // If loading user data
    if (user && userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 dark:text-white bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-3xl">
                <div className="text-center mb-8">
                    <h3 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
                        Report an Issue
                    </h3>
                    <p className="text-center font-semibold text-lg md:text-xl text-amber-500 mt-3 dark:text-amber-400">
                        Enter details about the public infrastructure issue
                    </p>

                    {/* User Status Banner */}
                    {user && (
                        <div className="mt-6">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isPremium ? 'bg-linear-to-r from-amber-500 to-yellow-500 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}>
                                {isPremium ? (
                                    <>
                                        <FaCrown />
                                        <span className="font-semibold">Premium User - Unlimited Reports</span>
                                    </>
                                ) : (
                                    <>
                                        <FaExclamationTriangle />
                                        <span className="font-semibold">
                                            Free User: {userIssueCount}/3 reports used
                                        </span>
                                        {userIssueCount >= 3 && (
                                            <a href="/premium" className="ml-2 px-2 py-1 bg-amber-500 text-white text-xs rounded hover:bg-amber-600 transition-colors">
                                                Upgrade
                                            </a>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Warning for non-logged in users */}
                {!user && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 text-xl" />
                            <div>
                                <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Login Required</h4>
                                <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                                    Please login to report issues. Free users can report up to 3 issues.
                                </p>
                                <div className="mt-3 flex gap-3">
                                    <button
                                        onClick={() => navigate('/login', { state: { from: '/addIssues' } })}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => navigate('/premium')}
                                        className="px-4 py-2 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                                    >
                                        <FaCrown className="w-3 h-3" />
                                        Go Premium
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit(handleReportIssue)}
                    className="mt-4 p-6 border bg-white dark:bg-gray-800 dark:border-gray-600 shadow-xl rounded-xl"
                    encType="multipart/form-data"
                >
                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Issue Title *
                        </label>
                        <input
                            type="text"
                            {...register('title', { required: 'Issue title is required', minLength: { value: 5, message: 'Title must be at least 5 characters' } })}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-gray-700 dark:border-gray-500 ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Brief title describing the issue"
                            disabled={isSubmitting || !user}
                        />
                        {errors.title && <span className="text-red-500 text-sm mt-1 block">{errors.title.message}</span>}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Description *
                        </label>
                        <textarea
                            {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Description must be at least 20 characters' } })}
                            className={`w-full px-4 py-3 border rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-gray-700 dark:border-gray-500 ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Describe the issue in detail (location, time, impact, etc.)"
                            disabled={isSubmitting || !user}
                        />
                        {errors.description && <span className="text-red-500 text-sm mt-1 block">{errors.description.message}</span>}
                    </div>

                    {/* Category */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Category *
                        </label>
                        <select
                            {...register('category', { required: 'Category is required' })}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-gray-700 dark:border-gray-500 ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            disabled={isSubmitting || !user}
                        >
                            <option value="">Select Category</option>
                            <option value="Drainage">Drainage</option>
                            <option value="Road Damage">Road Damage</option>
                            <option value="Garbage">Garbage</option>
                            <option value="Street Light">Street Light</option>
                            <option value="Water Logging">Water Logging</option>
                            <option value="Public Safety">Public Safety</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Water Supply">Water Supply</option>
                            <option value="Parks & Recreation">Parks & Recreation</option>
                        </select>
                        {errors.category && <span className="text-red-500 text-sm mt-1 block">{errors.category.message}</span>}
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Location *
                        </label>
                        <input
                            type="text"
                            {...register('location', { required: 'Location is required', minLength: { value: 10, message: 'Please provide detailed location' } })}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-gray-700 dark:border-gray-500 ${errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Example: Uttara Sector 10, Road 5, Near Mosque / 23.8103° N, 90.4125° E"
                            disabled={isSubmitting || !user}
                        />
                        {errors.location && <span className="text-red-500 text-sm mt-1 block">{errors.location.message}</span>}
                    </div>

                    {/* Priority */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Priority Level *
                        </label>
                        <select
                            {...register('priority', { required: 'Priority is required' })}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-gray-700 dark:border-gray-500 ${errors.priority ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            disabled={isSubmitting || !user}
                        >
                            <option value="">Choose Priority</option>
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                        {errors.priority && <span className="text-red-500 text-sm mt-1 block">{errors.priority.message}</span>}
                    </div>

                    {/* Image Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Upload Issue Images (Optional)
                        </label>
                        <input
                            type="file"
                            {...register('images')}
                            multiple
                            accept="image/*"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-gray-700 dark:border-gray-500"
                            disabled={isSubmitting || !user}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !user || (!isPremium && userIssueCount >= 3)}
                        className={`w-full py-3 px-4 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 ${
                            isSubmitting || !user || (!isPremium && userIssueCount >= 3)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                    >
                        {!user ? (
                            'Login to Report'
                        ) : !isPremium && userIssueCount >= 3 ? (
                            <>
                                <FaCrown />
                                Upgrade to Premium
                            </>
                        ) : isSubmitting ? (
                            'Submitting...'
                        ) : (
                            `Submit Issue Report ${!isPremium ? `(${userIssueCount}/3)` : ''}`
                        )}
                    </button>

                    {/* Help text */}
                    {user && !isPremium && userIssueCount < 3 && (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                            You have {3 - userIssueCount} free reports remaining
                        </p>
                    )}
                </form>

                {/* Premium CTA */}
                {user && !isPremium && (
                    <div className="mt-6 p-6 bg-linear-to-r from-amber-500 to-yellow-500 rounded-xl text-white">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-xl mb-1">Unlock Unlimited Reports!</h4>
                                <p className="opacity-90">Upgrade to Premium and report unlimited issues</p>
                            </div>
                            <button
                                onClick={() => navigate('/premium')}
                                className="px-6 py-3 bg-white text-amber-700 font-bold rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2"
                            >
                                <FaCrown />
                                Go Premium - ৳1,000/month
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportIssue;