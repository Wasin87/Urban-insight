import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { FaUserCheck, FaTrashCan, FaEye } from 'react-icons/fa6';
import { IoPersonRemoveSharp } from 'react-icons/io5';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';

const ApproveRiders = () => {
    const axiosSecure = useAxiosSecure();

    const { refetch, data: riders = [] } = useQuery({
        queryKey: ['riders'],
        queryFn: async () => {
            const res = await axiosSecure.get('/riders');
            return res.data;
        }
    });

    // ✅ Update Rider Status (approved / rejected)
    const updateRiderStatus = async (rider, status) => {
        try {
            const res = await axiosSecure.patch(`/riders/${rider._id}`,{ status });
            if (res.data.success) {
                refetch();
                Swal.fire({
                    position: 'top-center',
                    icon: 'success',
                    title: `Rider ${status === 'approved' ? 'Approved' : 'Rejected'}!`,
                    text: `${rider.name || rider.Name} has been ${status === 'approved' ? 'approved as rider' : 'rejected'}`,
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                position: 'top-center',
                icon: 'error',
                title: 'Failed to update rider status',
                text: error.response?.data?.message || error.message,
                showConfirmButton: true
            });
        }
    };

    const handleApproval = (rider) => {
        Swal.fire({
            title: 'Approve Rider?',
            text: `Do you want to approve ${rider.name || rider.Name} as a rider? This will change their role from user to rider.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Approve!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                updateRiderStatus(rider, 'approved');
            }
        });
    };

    const handleRejection = (rider) => {
        Swal.fire({
            title: 'Reject Rider?',
            text: `Do you want to reject ${rider.name || rider.Name}'s rider application?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Reject!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                updateRiderStatus(rider, 'rejected');
            }
        });
    };

    // ✅ Delete Rider
    const handleDelete = async (riderId, riderName) => {
        Swal.fire({
            title: 'Delete Rider Application?',
            text: `Do you want to delete ${riderName}'s application? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axiosSecure.delete(`/riders/${riderId}`);
                    if (res.data.success) {
                        refetch();
                        Swal.fire({
                            position: 'top-center',
                            icon: 'success',
                            title: 'Rider Application Deleted!',
                            text: `${riderName}'s application has been deleted successfully`,
                            showConfirmButton: false,
                            timer: 2000
                        });
                    } else {
                        throw new Error(res.data.message || 'Failed to delete rider');
                    }
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        position: 'top-center',
                        icon: 'error',
                        title: 'Failed to delete rider',
                        text: error.response?.data?.message || error.message,
                        showConfirmButton: true
                    });
                }
            }
        });
    };

    // Filter pending riders for the count
    const pendingRiders = riders.filter(rider => rider.status === 'pending');

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <h2 className="text-4xl font-bold text-center mb-6">
                Riders Pending Approval:
                <span className="text-lime-600"> {pendingRiders.length}</span>
            </h2>

            {/* Table */}
            <div className="overflow-x-auto shadow-lg rounded-lg border border-lime-300">
                <table className="min-w-full table-auto border-collapse">
                    <thead className="bg-lime-600 text-white">
                        <tr>
                            <th className="px-4 py-2">No.</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">District</th>
                            <th className="px-4 py-2">Application Status</th>
                            <th className="px-4 py-2">Worker Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riders.map((rider, index) => (
                            <tr
                                key={rider._id}
                                className={index % 2 === 0 ? 'bg-lime-50' : 'bg-lime-100'}
                            >
                                <td className="px-4 py-2 text-center font-bold">{index + 1}</td>
                                <td className="px-4 py-2">{rider.name || rider.Name}</td>
                                <td className="px-4 py-2">{rider.email || rider.Email}</td>
                                <td className="px-4 py-2">{rider.warehouse || rider.district}</td>
                                <td className={`px-4 py-2 font-semibold text-center ${
                                    rider.status === 'approved'
                                        ? 'text-green-600'
                                        : rider.status === 'rejected'
                                        ? 'text-red-600'
                                        : 'text-yellow-600'
                                }`}>
                                    {rider.status.charAt(0).toUpperCase() + rider.status.slice(1)}
                                </td>
                                 <td className="px-4 py-2">{rider.workerStatus}</td>
                                <td className="px-4 py-2 flex gap-2 justify-center">
                                    <button
                                         className='btn bg-amber-200'>
                                        <FaEye/>
                                    </button>


                                    <button
                                        onClick={() => handleApproval(rider)}
                                        disabled={rider.status === 'approved'}
                                        className={`${
                                            rider.status === 'approved' 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-green-500 hover:bg-green-600'
                                        } text-white px-3 py-1 rounded-md transition`}
                                        title={rider.status === 'approved' ? 'Already Approved' : 'Approve Rider'}
                                    >
                                        <FaUserCheck />
                                    </button>
                                    <button
                                        onClick={() => handleRejection(rider)}
                                        disabled={rider.status === 'rejected'}
                                        className={`${
                                            rider.status === 'rejected' 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white px-3 py-1 rounded-md transition`}
                                        title={rider.status === 'rejected' ? 'Already Rejected' : 'Reject Rider'}
                                    >
                                        <IoPersonRemoveSharp />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rider._id, rider.name || rider.Name)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
                                        title="Delete Rider Application"
                                    >
                                        <FaTrashCan />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {riders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No rider applications found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApproveRiders;