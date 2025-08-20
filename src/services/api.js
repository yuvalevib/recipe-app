import axios from 'axios';

const API = axios.create({
    baseURL: 'https://recipe-app-9ijm.onrender.com/api'
});

export default API;