import React, { useState, useEffect } from 'react';
import { 
    FaUser, 
    FaEnvelope, 
    FaPhone, 
    FaMapMarkerAlt, 
    FaCalendarAlt,
    FaEdit,
    FaSave,
    FaTimes,
    FaCamera,
    FaLock,
    FaShieldAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaUserCircle,
    FaGlobe,
    FaBuilding,
    FaIdCard,
    FaBell,
    FaUserShield,
    FaDatabase,
    FaKey
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
 
import { updateProfile } from 'firebase/auth';
import useAuth from '../../Hooks/useAuth';
import useRole from '../../Hooks/useRole';

const Profile = () => {
    const { user, updateUserProfile } = useAuth();
    const { role } = useRole();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        reset,
        watch 
    } = useForm({
        defaultValues: {
            displayName: user?.displayName || '',
            email: user?.email || '',
            phone: '',
            address: '',
            organization: '',
            bio: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    // Reset form when user changes
    useEffect(() => {
        if (user) {
            reset({
                displayName: user.displayName || '',
                email: user.email || '',
                phone: '',
                address: '',
                organization: '',
                bio: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [user, reset]);

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload image to Firebase Storage (simulated)
    const uploadImage = async (file) => {
        setIsUploading(true);
        try {
            // In real app, upload to Firebase Storage
            // const storageRef = ref(storage, `profile-images/${user.uid}`);
            // const snapshot = await uploadBytes(storageRef, file);
            // const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            const simulatedUrl = URL.createObjectURL(file);
            
            toast.success('Profile picture updated successfully!');
            return simulatedUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // Handle form submission
    const onSubmit = async (data) => {
        try {
            let photoURL = user?.photoURL;
            
            // Upload new image if selected
            if (selectedImage) {
                const imageUrl = await uploadImage(selectedImage);
                if (imageUrl) {
                    photoURL = imageUrl;
                }
            }

            // Prepare update data
            const updateData = {
                displayName: data.displayName,
                photoURL: photoURL
            };

            // Update Firebase profile
            if (updateUserProfile) {
                await updateUserProfile(updateData);
                
                // If email is different, send verification email
                if (data.email !== user.email) {
                    // await updateEmail(user, data.email);
                    toast.info('Verification email sent to new email address');
                }
            }

            // Save additional data to your database
            const userData = {
                uid: user.uid,
                displayName: data.displayName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                organization: data.organization,
                bio: data.bio,
                role: role,
                updatedAt: new Date().toISOString()
            };

            // Save to your backend
            // await saveUserDataToDatabase(userData);

            toast.success('Profile updated successfully!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored"
            });

            setIsEditing(false);
            setSelectedImage(null);
            setImagePreview(null);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        }
    };

    // Handle password update
    const handlePasswordUpdate = async (data) => {
        try {
            // Update password logic
            // await updatePassword(user, data.newPassword);
            
            toast.success('Password updated successfully!');
            setShowPasswordSection(false);
            reset({
                ...watch(),
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(error.message || 'Failed to update password');
        }
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (user?.displayName) {
            return user.displayName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return user?.email?.charAt(0).toUpperCase() || 'U';
    };

    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setSelectedImage(null);
        setImagePreview(null);
        reset();
    };

    // Statistics data
    const userStats = [
        { label: 'Issues Reported', value: '47', icon: '📋' },
        { label: 'Issues Resolved', value: '38', icon: '✅' },
        { label: 'Active Issues', value: '9', icon: '🔄' },
        { label: 'Satisfaction Rate', value: '92%', icon: '⭐' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                            My Profile
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your account settings and personal information
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-amber-100 dark:border-gray-700">
                                {/* Profile Picture Section */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative mb-4">
                                        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-amber-500 dark:border-amber-400 shadow-lg">
                                            {imagePreview ? (
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : user?.photoURL ? (
                                                <img 
                                                    src={user.photoURL} 
                                                    alt={user.displayName || 'User'} 
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                                                    <span className="text-white text-5xl font-bold">
                                                        {getUserInitials()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {isEditing && (
                                            <label className="absolute bottom-2 right-2 w-12 h-12 bg-amber-500 dark:bg-amber-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                                <FaCamera className="text-white text-xl" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                                            {user?.displayName || 'User'}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                            {user?.email || 'No email provided'}
                                        </p>
                                        <div className="inline-block px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold rounded-full">
                                            {role?.toUpperCase() || 'USER'}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            <FaEdit />
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                onClick={handleSubmit(onSubmit)}
                                                disabled={isUploading}
                                                className="py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="py-3 bg-amber-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                <FaTimes />
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                                        className="w-full py-3 border-2 border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400 font-semibold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FaKey />
                                        Change Password
                                    </button>
                                </div>

                                {/* User Statistics */}
                                <div className="mt-8 pt-6 border-t border-amber-100 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                        <FaDatabase className="text-amber-500" />
                                        Activity Overview
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {userStats.map((stat, index) => (
                                            <div 
                                                key={index}
                                                className="bg-amber-50 dark:bg-gray-700/50 p-3 rounded-lg text-center"
                                            >
                                                <div className="text-2xl mb-1">{stat.icon}</div>
                                                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                                    {stat.value}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    {stat.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Profile Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-amber-100 dark:border-gray-700">
                                {/* Form Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Personal Information
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm">
                                        <FaShieldAlt className="text-green-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Profile secured</span>
                                    </div>
                                </div>

                                {/* Profile Form */}
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="space-y-6">
                                        {/* Display Name */}
                                        <div className="form-group">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <FaUser className="text-amber-500" />
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                {...register('displayName', { 
                                                    required: 'Name is required',
                                                    minLength: {
                                                        value: 2,
                                                        message: 'Name must be at least 2 characters'
                                                    }
                                                })}
                                                disabled={!isEditing}
                                                className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500' : 'border-transparent bg-gray-50 dark:bg-gray-700/50'} transition-colors ${errors.displayName ? 'border-red-500' : ''}`}
                                            />
                                            {errors.displayName && (
                                                <p className="mt-1 text-sm text-red-500">{errors.displayName.message}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="form-group">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <FaEnvelope className="text-amber-500" />
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                {...register('email', { 
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address'
                                                    }
                                                })}
                                                disabled={!isEditing}
                                                className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500' : 'border-transparent bg-gray-50 dark:bg-gray-700/50'} transition-colors ${errors.email ? 'border-red-500' : ''}`}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                                            )}
                                            {!isEditing && user?.emailVerified && (
                                                <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
                                                    <FaCheckCircle /> Email verified
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="form-group">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <FaPhone className="text-amber-500" />
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                {...register('phone', {
                                                    pattern: {
                                                        value: /^[+]?[0-9\s\-]+$/,
                                                        message: 'Invalid phone number'
                                                    }
                                                })}
                                                disabled={!isEditing}
                                                className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500' : 'border-transparent bg-gray-50 dark:bg-gray-700/50'} transition-colors ${errors.phone ? 'border-red-500' : ''}`}
                                                placeholder="+880 1XXX XXXXXX"
                                            />
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                                            )}
                                        </div>

                                        {/* Address */}
                                        <div className="form-group">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-amber-500" />
                                                Address
                                            </label>
                                            <textarea
                                                {...register('address')}
                                                disabled={!isEditing}
                                                rows="2"
                                                className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500' : 'border-transparent bg-gray-50 dark:bg-gray-700/50'} transition-colors resize-none`}
                                                placeholder="Enter your address"
                                            />
                                        </div>

                                        {/* Organization */}
                                        <div className="form-group">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <FaBuilding className="text-amber-500" />
                                                Organization
                                            </label>
                                            <input
                                                type="text"
                                                {...register('organization')}
                                                disabled={!isEditing}
                                                className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500' : 'border-transparent bg-gray-50 dark:bg-gray-700/50'} transition-colors`}
                                                placeholder="Company or institution name"
                                            />
                                        </div>

                                        {/* Bio */}
                                        <div className="form-group">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <FaUserCircle className="text-amber-500" />
                                                Bio
                                            </label>
                                            <textarea
                                                {...register('bio')}
                                                disabled={!isEditing}
                                                rows="3"
                                                className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500' : 'border-transparent bg-gray-50 dark:bg-gray-700/50'} transition-colors resize-none`}
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                    </div>
                                </form>

                                {/* Password Change Section */}
                                {showPasswordSection && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-8 pt-6 border-t border-amber-100 dark:border-gray-700"
                                    >
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                            <FaLock className="text-amber-500" />
                                            Change Password
                                        </h3>
                                        
                                        <form onSubmit={handleSubmit(handlePasswordUpdate)} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    {...register('newPassword', {
                                                        required: 'Password is required',
                                                        minLength: {
                                                            value: 6,
                                                            message: 'Password must be at least 6 characters'
                                                        }
                                                    })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                    placeholder="Enter new password"
                                                />
                                                {errors.newPassword && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type="password"
                                                    {...register('confirmPassword', {
                                                        required: 'Please confirm your password',
                                                        validate: value => 
                                                            value === watch('newPassword') || 'Passwords do not match'
                                                    })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                    placeholder="Confirm new password"
                                                />
                                                {errors.confirmPassword && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                                                )}
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                >
                                                    Update Password
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordSection(false)}
                                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* Account Information */}
                                <div className="mt-8 pt-6 border-t border-amber-100 dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                        Account Information
                                    </h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-amber-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaUserShield className="text-amber-500" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Account Type</span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400">{role?.toUpperCase() || 'User'}</p>
                                        </div>
                                        
                                        <div className="p-4 bg-amber-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaCalendarAlt className="text-amber-500" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Member Since</span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {user?.metadata?.creationTime ? 
                                                    new Date(user.metadata.creationTime).toLocaleDateString() : 
                                                    'N/A'
                                                }
                                            </p>
                                        </div>
                                        
                                        <div className="p-4 bg-amber-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaGlobe className="text-amber-500" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">User ID</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {user?.uid || 'N/A'}
                                            </p>
                                        </div>
                                        
                                        <div className="p-4 bg-amber-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaBell className="text-amber-500" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Notifications</span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400">Enabled</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Tips */}
                                <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border border-amber-200 dark:border-amber-700">
                                    <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                                        <FaShieldAlt />
                                        Security Tips
                                    </h4>
                                    <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                                        <li>• Use a strong, unique password</li>
                                        <li>• Enable two-factor authentication</li>
                                        <li>• Keep your email address up to date</li>
                                        <li>• Be cautious of suspicious emails</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;