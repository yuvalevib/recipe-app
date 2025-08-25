import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import PDFViewer from '../../components/PDFViewer/PDFViewer';
import { API_BASE_URL } from '../../services/api';
import './RecipeView.scss';

function RecipeView() {
    const { id } = useParams();
    // Build URL relative to configured API base (works locally, LAN, or hosted)
        // Ensure we remove a trailing /api if present so route /recipe/:id resolves
        const base = API_BASE_URL.replace(/\/api$/,'');
        const pdfUrl = `${base}/api/recipe/${id}`; // keep /api prefix for server route

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
