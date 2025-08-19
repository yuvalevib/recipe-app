import React from 'react';
import { Link } from 'react-router-dom';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    CardMedia
} from '@mui/material';
import './RecipeList.scss';

function RecipeList({ recipes, sx, onDelete }) {
    return (
        <div className="recipe-list-grid">
            <Grid container spacing={4} sx={sx}>
                {recipes.map(recipe => (
                    <Grid key={recipe._id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card className="recipe-card">
                            {(
                                recipe.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(recipe.name || 'recipe')}/600/400`
                            ) && (
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={recipe.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(recipe.name || 'recipe')}/600/400`}
                                    alt={recipe.name}
                                />
                            )}
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
                                {onDelete && (
                                    <Button
                                        size="medium"
                                        onClick={() => onDelete(recipe)}
                                        variant="outlined"
                                        color="error"
                                    >
                                        מחק
                                    </Button>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default RecipeList;
