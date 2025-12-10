import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router';
import useAxios from '../../Hooks/useAxios';

const ParcelTrack = () => {
    const { trackingId } = useParams();
    const axiosInstance = useAxios();

    const { data: trackings = [], isLoading, error } = useQuery({
        queryKey: ['tracking', trackingId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/trackings/${trackingId}/logs`)
            return res.data;
        }
    })

    // Define status colors and icons
    const getStatusColor = (status) => {
        const statusColors = {
            'pending-payment': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'pending-pickup': 'bg-blue-100 text-blue-800 border-blue-300',
            'driver_assigned': 'bg-purple-100 text-purple-800 border-purple-300',
            'picked_up': 'bg-indigo-100 text-indigo-800 border-indigo-300',
            'in_transit': 'bg-orange-100 text-orange-800 border-orange-300',
            'out_for_delivery': 'bg-red-100 text-red-800 border-red-300',
            'parcel_delivered': 'bg-green-100 text-green-800 border-green-300',
            'cancelled': 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'pending-payment': '⏳',
            'pending-pickup': '📦',
            'driver_assigned': '👤',
            'picked_up': '🚚',
            'in_transit': '✈️',
            'out_for_delivery': '🏍️',
            'parcel_delivered': '✅',
            'cancelled': '❌'
        };

        return icons[status] || '📋';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-700">Loading Tracking Information</h3>
                    <p className="text-gray-500 mt-2">Please wait while we fetch your package details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Tracking Not Found</h3>
                    <p className="text-gray-600 mb-6">We couldn't find any tracking information for this ID.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Track Your Package</h1>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 inline-block">
                        <p className="text-lg text-gray-600">
                            Tracking ID: <span className="font-mono font-bold text-blue-600 text-xl">{trackingId}</span>
                        </p>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600 font-semibold">Total Updates</p>
                            <p className="text-2xl font-bold text-gray-800">{trackings.length}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600 font-semibold">Current Status</p>
                            <p className="text-lg font-bold text-gray-800 capitalize">
                                {trackings[trackings.length - 1]?.details || 'Unknown'}
                            </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-sm text-purple-600 font-semibold">Last Update</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {trackings.length > 0 ? new Date(trackings[trackings.length - 1].createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tracking Timeline */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center mb-8">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Delivery Timeline</h2>
                    </div>

                    {trackings.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tracking Updates Yet</h3>
                            <p className="text-gray-500">Tracking information will appear here once your package starts moving.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-400 to-green-400 transform -translate-x-1/2"></div>
                            
                            {trackings.map((log, index) => (
                                <div key={log._id} className="relative flex items-start mb-8 last:mb-0">
                                    {/* Timeline dot */}
                                    <div className={` w-16 h-16 rounded-full flex items-center justify-center z-10 
                                        ${index === trackings.length - 1 ? 'bg-green-500 ring-4 ring-green-200' : 'bg-blue-500'} 
                                        transition-all duration-300 transform hover:scale-110`}>
                                        <span className="text-white font-bold text-lg">
                                            {getStatusIcon(log.status, index)}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className={`ml-6 flex-1 border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg 
                                        ${getStatusColor(log.status)} 
                                        ${index === trackings.length - 1 ? 'ring-2 ring-green-300' : ''}`}>
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold capitalize mb-2">
                                                    {log.details}
                                                </h3>
                                                <p className="text-gray-600 flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="mt-2 md:mt-0">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold 
                                                    ${index === trackings.length - 1 ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                                                    {index === trackings.length - 1 ? 'Current' : 'Completed'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {log.additionalDetails && (
                                            <div className="mt-3 p-3 bg-green-200 bg-opacity-50 rounded-lg">
                                                <p className="text-sm text-gray-700">{log.additionalDetails.message}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Help Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Need Help With Your Delivery?</h3>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                Contact Support
                            </button>
                            <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                </svg>
                                Live Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParcelTrack;