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

    const handleDelete = async (recipe) => {
        const confirmed = window.confirm(`האם למחוק את המתכון "${recipe.name}"?`);
        if (!confirmed) return;
        try {
            await API.delete(`/recipe/${recipe._id}`);
            setRecipes(prev => prev.filter(r => r._id !== recipe._id));
        } catch (err) {
            console.error('Failed to delete recipe:', err);
            alert('מחיקת המתכון נכשלה');
        }
    };

    return (
        <Container className="category-container">
            <Typography variant="h4" gutterBottom className="category-title">
                מתכונים
            </Typography>
            <RecipeList recipes={recipes} sx={{ mt: 2 }} onDelete={handleDelete} />
        </Container>
    );
}

export default Category;
