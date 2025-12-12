import axios from 'axios';
import React from 'react';


const axiosInstance = axios.create({
    baseURL: 'https://urban-insight-server-side-api.vercel.app/'
})

const useAxios = () => {
    return axiosInstance;
};

export default useAxios;