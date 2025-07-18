import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
    Container,
    Typography,
    TextField,
    MenuItem,
    Button,
    Stack,
    Paper
} from '@mui/material';

function Upload() {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [file, setFile] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        API.get('/categories').then(res => setCategories(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('categoryId', categoryId);
        formData.append('file', file);

        await API.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert('Recipe uploaded successfully!');
        setName('');
        setCategoryId('');
        setFile(null);
    };

    return (
        <Container>
            <Paper elevation={3} sx={{ padding: 4 }}>
                <Typography variant="h5" gutterBottom>Upload New Recipe</Typography>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="Recipe Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <TextField
                            select
                            label="Select Category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            {categories.map(cat => (
                                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                            ))}
                        </TextField>
                        <Button
                            variant="contained"
                            component="label"
                        >
                            Upload PDF
                            <input
                                type="file"
                                hidden
                                accept="application/pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                required
                            />
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Submit
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}

export default Upload;
