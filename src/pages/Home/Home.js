import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Link } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, Container } from '@mui/material';
import './Home.scss';

function Home() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        API.get('/categories')
            .then(response => {
                setCategories(response.data);
            })
            .catch(err => {
                console.error('Failed to fetch categories:', err);
            });
    }, []);

    return (
        <Container className="home-container">
            <Typography variant="h3" gutterBottom className="home-title">
                קטגוריות מתכונים
            </Typography>
            <List className="home-category-list">
                {categories.map(category => (
                    <ListItem
                        button={true}
                        component={Link}
                        to={`/category/${category._id}`}
                        key={category._id}
                        className="home-category-item"
                    >
                        <ListItemText
                            primary={category.name}
                            className="home-category-text"
                        />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}

export default Home;
