import axios from 'axios';

// Determine API base URL: allow .env override, prefer same-origin or localhost during local dev
const envBase = process.env.REACT_APP_API_BASE;
let baseURL = envBase || 'https://recipe-app-9ijm.onrender.com/api';
try {
    if (typeof window !== 'undefined') {
        const isLocalhost = /localhost|127\.0\.0\.1/.test(window.location.hostname);
        if (isLocalhost) {
            baseURL = envBase || 'http://localhost:4000/api';
        }
    }
} catch {}

const API = axios.create({ baseURL });

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