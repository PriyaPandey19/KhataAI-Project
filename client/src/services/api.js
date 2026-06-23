//ye file sabhi API calls handle karti hai
//axios instance ek baar

import axios from 'axios';

//base url sab routes yahan se shuru hote hain
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://khataai-project.onrender.com/api'
});

//request interceptor - har API call mein automatically JWT token lagao
//shopkeeper login ke baad token localstorage mein save karta hai
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


//responce interceptor - 401 aaya mtlb token expire
//automatically logout karo aur login page pe bhejo
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status === 401){
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login'


        }
        return Promise.reject(error);
    }
);

//AUTH route
export const authAPI = {
    register: (data) => api.post('/auth/register',data),
    login: (data) => api.post('/auth/login',data),
    getMe: () => api.get('/auth/me')
};


//CUSTOMER route
export const customerAPI = {
    getAll: (params) => api.get('/customers', {params}),
    getOne: (id) => api.get(`/customers/${id}`),
    add: (data) => api.post('/customers',data),
    update: (id, data) => api.put(`/customers/${id}`,data),
    delete: (id) => api.delete(`/customers/${id}`)
};


//TRANSACTION route
export const transactionAPI = {
    getAll: (params) => api.get('/transactions',{params}),
    add: (data) => api.post('/transactions', data),
    delete: (id) => api.delete(`/transactions/${id}`)
}

//ANALYTICS route
export const analyticsAPI = {
    getSummary: () => api.get('/analytics/summary'),
    getWeekly: () => api.get('/analytics/weekly'),
    getMonthly: () => api.get('/analytics/monthly'),
    getTopCustomers:() => api.get('/analytics/top-customers'),
    getRiskReport:() => api.get('/analytics/risk-report'),
    getSmartInsight:() => api.get('/analytics/smart-insight')
};

export const voiceAPI = {
    process: (text) => api.post('/voice/process',{text})
}

export default api;