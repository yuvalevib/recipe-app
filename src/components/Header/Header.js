import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Box,
    Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { currentUser, logout } from '../../services/api';
import './Header.scss';

const baseNavItems = [
    { label: 'בית', path: '/' }
];
const protectedNavItems = [
    { label: 'העלאת מתכון', path: '/upload' },
    { label: 'ניהול קטגוריות', path: '/manage-categories' }
];

function Header() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [user, setUser] = useState(currentUser());
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setUser(currentUser());
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        setUser(null);
        navigate('/');
    };

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    const drawerContent = (
        <Box
            sx={{ width: 270, height: '100%' }}
            role="presentation"
            onClick={toggleDrawer(false)}
            className="header-drawer"
        >
            <List>
                {[...baseNavItems, ...(user ? protectedNavItems : [])].map((item) => (
                    <ListItem
                        button
                        key={item.label}
                        component={Link}
                        to={item.path}
                        selected={location.pathname === item.path}
                        className="header-drawer-list-item"
                    >
                        <ListItemText primary={item.label} className="header-drawer-list-text" />
                    </ListItem>
                ))}
                <ListItem
                    button
                    component={Link}
                    to={user ? '/' : '/login'}
                    onClick={user ? handleLogout : undefined}
                    className="header-drawer-list-item"
                >
                    <ListItemText primary={user ? 'התנתק' : 'התחבר'} className="header-drawer-list-text" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static" className="header-appbar">
                <Toolbar className="header-toolbar">
                    {/* אייקון תפריט במסכים קטנים */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        className="header-menu-btn"
                        sx={{ display: { md: 'none' } }}
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h5" className="header-title">
                        מנהל מתכונים
                    </Typography>

                    {/* כפתורים במסכים גדולים */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                        {[...baseNavItems, ...(user ? protectedNavItems : [])].map((item) => (
                            <Button
                                key={item.label}
                                color="inherit"
                                component={Link}
                                to={item.path}
                                className={`header-nav-btn${location.pathname === item.path ? ' active' : ''}`}
                            >
                                {item.label}
                            </Button>
                        ))}
                        <Button
                            color="inherit"
                            component={Link}
                            to={user ? '/' : '/login'}
                            onClick={user ? handleLogout : undefined}
                            className="header-nav-btn"
                        >
                            {user ? 'התנתק' : 'התחבר'}
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                PaperProps={{ className: 'header-drawer' }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
}

export default Header;
