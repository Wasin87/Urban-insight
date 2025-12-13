import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../Hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SocialLogin from './SocialLogin/SocialLogin';
import axios from 'axios';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaImage,
  FaCheck,
  FaTimes,
  FaArrowRight,
  FaUserPlus,
  FaShieldAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors }, setValue, trigger } = useForm();
  const { registerUser, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const fileInputRef = useRef(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [passwordScore, setPasswordScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState(null);

  const password = watch('password', '');
  const photo = watch('photo');

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    setPasswordScore(score);
  };

  const handlePasswordChange = (e) => {
    calculatePasswordStrength(e.target.value);
  };

  const getPasswordStrengthColor = () => {
    if (passwordScore >= 75) return 'bg-green-500';
    if (passwordScore >= 50) return 'bg-yellow-500';
    if (passwordScore >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Invalid image format. Please upload JPEG, PNG, GIF, or WebP.');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrorMessage('Image size is too large. Maximum size is 5MB.');
        return;
      }

      setErrorMessage('');
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file);
      
      // Manually set the value for react-hook-form
      setValue('photo', file, { shouldValidate: true });
      
      // Trigger validation for the photo field
      trigger('photo');
    }
  };

  const uploadImageToImgBB = async (imageFile) => {
    if (!imageFile) {
      throw new Error('No image file provided');
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_KEY}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
          timeout: 30000, // 30 seconds timeout
        }
      );
      
      if (response.data.success) {
        return response.data.data.url;
      } else {
        throw new Error(response.data.error?.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('ImgBB Upload Error:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        switch (error.response.status) {
          case 400:
            throw new Error('Bad request. Please check your image file.');
          case 401:
            throw new Error('Invalid API key. Please contact support.');
          case 403:
            throw new Error('Upload forbidden. Please try again.');
          case 413:
            throw new Error('Image file is too large. Maximum size is 32MB.');
          case 429:
            throw new Error('Too many uploads. Please try again later.');
          default:
            throw new Error(`Upload failed: ${error.response.data?.error?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message);
      }
    }
  };

  const handleRegistration = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    setUploadProgress(0);

    try {
      // Use the imageFile state instead of data.photo
      if (!imageFile) {
        throw new Error('Please select a profile picture');
      }

      // Upload image to ImgBB first
      const photoURL = await uploadImageToImgBB(imageFile);
      
      // Register user with Firebase
      const userCredential = await registerUser(data.email, data.password);
      
      if (!userCredential?.user) {
        throw new Error('User registration failed');
      }

      // Create user in the database
      const userInfo = {
        email: data.email,
        displayName: data.name,
        photoURL: photoURL,
        role: 'user',
        createdAt: new Date().toISOString(),
        isPremium: false,
        status: 'active',
        uid: userCredential.user.uid
      };

      // Save user to database
      const dbResponse = await axiosSecure.post('/users', userInfo);
      
      if (dbResponse.data.insertedId || dbResponse.data.success) {
        // Update user profile in Firebase
        await updateUserProfile({
          displayName: data.name,
          photoURL: photoURL
        });

        // Show success message
        toast.success('Account created successfully!');
        
        // Success animation
        setIsLoading(false);
        
        // Navigate after a delay
        setTimeout(() => {
          navigate(location.state?.from || '/dashboard');
        }, 1500);
      } else {
        throw new Error('Failed to save user to database');
      }

    } catch (error) {
      console.error('Registration Error:', error);
      setIsLoading(false);
      
      // Set user-friendly error message
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email is already registered. Please try logging in.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMessage('Network error. Please check your internet connection.');
      } else {
        setErrorMessage(error.message || 'Registration failed. Please try again.');
      }
      
      // Show error toast
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm"
            >
              <FaUserPlus className="text-xl" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Join Our Community</h1>
            <p className="text-blue-100 opacity-90">Create your account in seconds</p>
          </div>

          <div className="p-8">
            {/* Error Message Display */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
              >
                <FaExclamationTriangle className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
              </motion.div>
            )}

            {/* Upload Progress Bar */}
            {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Uploading Image...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(handleRegistration)} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="text-center">
                <div className="relative inline-block group">
                  <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden group-hover:shadow-xl transition-all duration-300">
                    {selectedImage ? (
                      <img 
                        src={selectedImage} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <FaUser className="text-gray-400 dark:text-gray-500 text-3xl" />
                      </div>
                    )}
                  </div>
                  <label 
                    htmlFor="photo" 
                    className="absolute bottom-1 right-1 w-10 h-10 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300 shadow-lg"
                  >
                    <FaImage className="text-white text-sm" />
                    <input
                      id="photo"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                      onChange={handleImageChange}
                    />
                  </label>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    Upload Photo
                  </div>
                </div>
                {!selectedImage && (
                  <p className="text-red-500 text-sm mt-3">Profile picture is required</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Supports: JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register('name', { 
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                      maxLength: { value: 50, message: 'Name cannot exceed 50 characters' }
                    })}
                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors ${
                      errors.name ? 'border-red-500 ring-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors ${
                      errors.email ? 'border-red-500 ring-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        message: 'Must contain uppercase, lowercase, number, and special character'
                      }
                    })}
                    onChange={handlePasswordChange}
                    className={`w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors ${
                      errors.password ? 'border-red-500 ring-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <FaShieldAlt className="text-sm" />
                        Password Strength
                      </span>
                      <span className={`font-semibold ${
                        passwordScore >= 75 ? 'text-green-600' :
                        passwordScore >= 50 ? 'text-yellow-600' :
                        passwordScore >= 25 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {passwordScore >= 75 ? 'Strong' :
                         passwordScore >= 50 ? 'Good' :
                         passwordScore >= 25 ? 'Weak' : 'Very Weak'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${passwordScore}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <div className="flex items-center gap-1">
                        {password.length >= 8 ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                        <span>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[A-Z]/.test(password) ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                        <span>Uppercase</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/\d/.test(password) ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                        <span>Number</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[^A-Za-z0-9]/.test(password) ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                        <span>Special</span>
                      </div>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="terms"
                  {...register('terms', { required: 'You must accept the terms' })}
                  className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm -mt-3">{errors.terms.message}</p>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !selectedImage}
                className="w-full py-3.5 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    Create Account
                    <FaArrowRight />
                  </>
                )}
              </motion.button>

              {/* Social Login Section */}
              <div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Or sign up with
                    </span>
                  </div>
                </div>
                <SocialLogin />
              </div>

              {/* Login Link */}
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  state={location.state}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;