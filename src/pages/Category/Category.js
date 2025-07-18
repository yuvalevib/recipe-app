import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../services/api';
import RecipeList from '../../components/RecipeList/RecipeList';
import { Typography, Container } from '@mui/material';
import './Category.scss';

function Category() {
    const { id } = useParams();
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        API.get(`/recipes/${id}`).then(res => setRecipes(res.data));
    }, [id]);

    return (
        <Container className="category-container">
            <Typography variant="h4" gutterBottom className="category-title">
                מתכונים
            </Typography>
            <RecipeList recipes={recipes} sx={{ mt: 2 }} />
        </Container>
    );
}

export default Category;
