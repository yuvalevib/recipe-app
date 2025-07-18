import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, Container } from '@mui/material';

function Home() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        API.get('/categories')
            .then(response => {
                console.log('Fetched categories:', response.data);
                setCategories(response.data);
            })
            .catch(err => {
                console.error('Failed to fetch categories:', err);
            });
    }, []);

    return (
        <Container>
        <Typography variant="h4" gutterBottom>קטגוריות מתכונים</Typography>
            <List>
                {categories.map(category => (
                    <ListItem button component={Link} to={`/category/${category._id}`} key={category._id}>
                        <ListItemText primary={category.name} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}

export default Home;
