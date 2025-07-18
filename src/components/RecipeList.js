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

function RecipeList({ recipes }) {
    return (
        <div>
            <Typography variant="h5" gutterBottom>Recipes</Typography>
            <Grid container spacing={2}>
                {recipes.map(recipe => (
                    <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{recipe.name}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    component={Link}
                                    to={`/recipe/${recipe._id}`}
                                    variant="outlined"
                                >
                                    View Recipe
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
