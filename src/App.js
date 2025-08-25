import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

import Home from './pages/Home/Home';
import Category from './pages/Category/Category';
import RecipeView from './pages/RecipeView/RecipeView';
import Upload from './pages/Upload/Upload';
import ManageCategories from './pages/ManageCategories/ManageCategories';
import Login from './pages/Login/Login';
import { currentUser } from './services/api';
import Header from './components/Header/Header';
import './App.css';

// יצירת קונפיגורציה ל-RTL
const theme = createTheme({
    direction: 'rtl',
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

// קאש ל-Emotion עם פלגין RTL
const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

function AppShell() {
    const [user, setUser] = useState(currentUser());
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Listen for storage changes (multi-tab logout/login)
        const onStorage = (e) => {
            if (e.key === 'authUser' || e.key === 'authToken') {
                setUser(currentUser());
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const handleLogin = (u) => {
        setUser(u);
        navigate('/');
    };

    if (!user) {
        return (
            <div className="app-container">
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/category/:id" element={<Category />} />
                    <Route path="/recipe/:id" element={<RecipeView />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/manage-categories" element={<ManageCategories />} />
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <AppShell />
                </Router>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default App;
