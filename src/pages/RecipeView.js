import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import PDFViewer from '../components/PDFViewer';

function RecipeView() {
    const { id } = useParams();
    const pdfUrl = `http://localhost:4000/api/recipe/${id}`;

    return (
        <Container>
            <Typography variant="h5" gutterBottom>View Recipe</Typography>
            <PDFViewer pdfUrl={pdfUrl} />
        </Container>
    );
}

export default RecipeView;
