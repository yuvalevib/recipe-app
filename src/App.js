import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
    return (
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Header />
                    <div className="app-container">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/category/:id" element={<Category />} />
                            <Route path="/recipe/:id" element={<RecipeView />} />
                            <Route path="/upload" element={<Upload />} />
                            <Route path="/manage-categories" element={<ManageCategories />} />
                        </Routes>
                    </div>
                </Router>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default App;
