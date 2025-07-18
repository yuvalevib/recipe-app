import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import RecipeList from '../components/RecipeList';
import { Typography, Container } from '@mui/material';

function Category() {
    const { id } = useParams();
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        API.get(`/recipes/${id}`).then(res => setRecipes(res.data));
    }, [id]);

    return (
        <Container>
            <Typography variant="h5" gutterBottom>Recipes in this Category</Typography>
            <RecipeList recipes={recipes} />
        </Container>
    );
}

export default Category;
