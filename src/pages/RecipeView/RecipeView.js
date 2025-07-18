import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import PDFViewer from '../../components/PDFViewer/PDFViewer';
import './RecipeView.scss';

function RecipeView() {
    const { id } = useParams();
    const pdfUrl = `http://localhost:4000/api/recipe/${id}`;

    return (
        <Container className="recipe-view-container">
            <Typography variant="h4" gutterBottom className="recipe-view-title">
                מתכון
            </Typography>
            <PDFViewer pdfUrl={pdfUrl} />
        </Container>
    );
}

export default RecipeView;
