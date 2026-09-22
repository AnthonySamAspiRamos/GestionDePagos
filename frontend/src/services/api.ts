import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {

        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {

        return response;
    },
    (error: AxiosError) => {

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("La sesión ha expirado o es inválida (Interceptado por api.ts)");

            localStorage.removeItem('token');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;