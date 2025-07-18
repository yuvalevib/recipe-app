import React from 'react';
import { Link } from 'react-router-dom';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button
} from '@mui/material';
import './RecipeList.scss';

function RecipeList({ recipes, sx }) {
    return (
        <div className="recipe-list-grid">
            <Grid container spacing={4} sx={sx}>
                {recipes.map(recipe => (
                    <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                        <Card className="recipe-card">
                            <CardContent className="recipe-card-content">
                                <Typography variant="h6" className="recipe-card-title">
                                    {recipe.name}
                                </Typography>
                            </CardContent>
                            <CardActions className="recipe-card-actions">
                                <Button
                                    size="medium"
                                    component={Link}
                                    to={`/recipe/${recipe._id}`}
                                    variant="contained"
                                    color="primary"
                                    className="recipe-card-btn"
                                >
                                  פתיחת מתכון
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default RecipeList;
