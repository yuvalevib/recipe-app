import axios from 'axios';

const API = axios.create({
    baseURL: 'https://recipe-app-9ijm.onrender.com'  // Replace with your actual Render URL
});

export default API;