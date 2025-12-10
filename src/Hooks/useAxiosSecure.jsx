import axios from 'axios';
import React, { useEffect } from 'react';
import useAuth from './useAuth';
import { useNavigate } from 'react-router';

const axiosSecure = axios.create({
    baseURL: 'http://localhost:3000'
});

const useAxiosSecure = () => {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Intercept request
        const requestInterceptor = axiosSecure.interceptors.request.use(config => {
            if (user?.accessToken) {
                config.headers.Authorization = `Bearer ${user.accessToken}`;
            }
            return config;
        });

        // Intercept response
        const responseInterceptor = axiosSecure.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                console.log('Axios error:', error.response?.status, error.message);
                
                if (error.response) {
                    const statusCode = error.response.status;
                    
                    // Handle unauthorized/forbidden errors
                    if (statusCode === 401 || statusCode === 403) {
                        await logOut();
                        navigate('/login');
                    }
                    
                    // Handle network/server errors
                    if (statusCode >= 500) {
                        console.error('Server error:', error.response.data);
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    console.error('Network error:', error.message);
                }
                
                return Promise.reject(error);
            }
        );

        return () => {
            axiosSecure.interceptors.request.eject(requestInterceptor);
            axiosSecure.interceptors.response.eject(responseInterceptor);
        };
    }, [user, logOut, navigate]);

    return axiosSecure;
};

export default useAxiosSecure;