import axios from 'axios';

const API = axios.create({
    baseURL: 'https://recipe-app-9ijm.onrender.com/api'
});

// Attach token if present
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
}

export function currentUser() {
    try { return JSON.parse(localStorage.getItem('authUser') || 'null'); } catch { return null; }
}

export default API;