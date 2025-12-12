import React, { useState } from 'react';
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
  FaShieldAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { registerUser, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [passwordScore, setPasswordScore] = useState(0);

  const password = watch('password', '');

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
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleRegistration = (data) => {
    setIsLoading(true);
    const profileImg = data.photo[0];

    registerUser(data.email, data.password)
      .then(() => {
        const formData = new FormData();
        formData.append('image', profileImg);
        const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_KEY}`;
        
        axios.post(image_API_URL, formData)
          .then(res => {
            const photoURL = res.data.data.url;

            // Create user in the database
            const userInfo = {
              email: data.email,
              displayName: data.name,
              photoURL: photoURL,
              role: 'user',
              createdAt: new Date(),
              isPremium: false,
              status: 'active'
            };

            axiosSecure.post('/users', userInfo)
              .then(res => {
                if (res.data.insertedId) {
                  // Update user profile
                  const userProfile = {
                    displayName: data.name,
                    photoURL: photoURL
                  };

                  updateUserProfile(userProfile)
                    .then(() => {
                      setIsLoading(false);
                      // Success animation
                      setTimeout(() => {
                        navigate(location.state || '/dashboard');
                      }, 1000);
                    })
                    .catch(error => {
                      console.log(error);
                      setIsLoading(false);
                    });
                }
              });
          })
          .catch(error => {
            console.log(error);
            setIsLoading(false);
          });
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
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
                      type="file"
                      {...register('photo', { required: true })}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    Upload Photo
                  </div>
                </div>
                {errors.photo && (
                  <p className="text-red-500 text-sm mt-3">Profile picture is required</p>
                )}
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
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                disabled={isLoading}
                className="w-full py-3.5 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
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