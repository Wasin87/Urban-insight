import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const IssueDetails = () => {
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    // Fetch single issue by ID
    const { data: issue, isLoading, error } = useQuery({
        queryKey: ['issueDetails', id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/issues/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    if (isLoading) {
        return (
            <div className="p-6 text-center text-lg text-gray-700 dark:text-gray-300">
                Loading issue details...
            </div>
        );
    }

    if (error) {
        console.error(error);
        return (
            <div className="p-6 text-center text-red-500">
                Error loading issue details.
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="p-6 text-center text-gray-500">
                Issue not found.
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 px-8 py-2 bg-amber-300 hover:bg-amber-400 rounded-md dark:bg-amber-500 dark:text-black"
            >
                Back
            </button>

            {/* Issue Card */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-900 dark:border-gray-100">
                {/* Image */}
                {issue.images && issue.images.length > 0 ? (
                    <img
                        src={issue.images[0]}
                        alt={issue.title}
                        className="h-64 w-full object-cover"
                    />
                ) : (
                    <div className="h-64 w-full bg-gray-200 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        No Image
                    </div>
                )}

                <div className="p-6 space-y-4">
                    {/* Title & Description */}
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {issue.title}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">{issue.description}</p>

                    {/* Issue Details */}
                    <div className="flex flex-wrap gap-4">
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full dark:bg-teal-800 dark:text-teal-100">
                            Category: {issue.category}
                        </span>
                        <span
                            className={`px-3 py-1 rounded-full ${
                                issue.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                    : issue.status === 'resolved'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                        >
                            Status: {issue.status}
                        </span>
                        <span
                            className={`px-3 py-1 rounded-full ${
                                issue.priority === 'High'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                            }`}
                        >
                            Priority: {issue.priority}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-200">
                            Location: {issue.location}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full dark:bg-purple-800 dark:text-purple-100">
                            Submitted By: {issue.submittedBy || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetails;
