import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    withCredentials: true,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const status = error.response?.status;
        
        if (status === 401) {
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);