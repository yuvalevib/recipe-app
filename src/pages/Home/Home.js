import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Link } from 'react-router-dom';
import { Typography, Container, Grid, Card, CardActionArea, CardMedia, CardContent } from '@mui/material';
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

    const getCategoryImageUrl = (category) => {
        if (category && category.imageUrl && String(category.imageUrl).trim()) {
            return category.imageUrl;
        }
        const seed = encodeURIComponent((category && category.name) || 'category');
        return `https://picsum.photos/seed/${seed}/400/300`;
    };

    return (
        <Container className="home-container">
            <Typography variant="h3" gutterBottom className="home-title">
                קטגוריות מתכונים
            </Typography>
            <Grid container spacing={3} className="home-grid">
                {categories.map((category) => (
                    <Grid key={category._id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card className="category-card" elevation={3}>
                            <CardActionArea component={Link} to={`/category/${category._id}`}>
                                <CardMedia
                                    className="category-media"
                                    component="img"
                                    image={getCategoryImageUrl(category)}
                                    alt={category.name}
                                />
                                <CardContent>
                                    <Typography variant="h6" className="category-title">
                                        {category.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default Home;
