import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
    Container,
    Typography,
    TextField,
    MenuItem,
    Button,
    Stack,
    Paper
} from '@mui/material';
import './Upload.scss';

function Upload() {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [file, setFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
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
        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (imageUrl) {
            formData.append('imageUrl', imageUrl);
        }

        await API.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert('Recipe uploaded successfully!');
        setName('');
        setCategoryId('');
        setFile(null);
        setImageFile(null);
        setImageUrl('');
    };

    return (
        <Container className="upload-container">
            <Paper elevation={6} className="upload-paper">
                <Typography variant="h4" gutterBottom className="upload-title">
                    העלאת מתכון חדש
                </Typography>
                <form onSubmit={handleSubmit} className="upload-form">
                    <TextField
                        label="שם המתכון"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        variant="outlined"
                        size="medium"
                    />
                    <TextField
                        select
                        label="בחר קטגוריה"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        variant="outlined"
                        size="medium"
                    >
                        {categories.map(cat => (
                            <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                        ))}
                    </TextField>
                    <Button
                        variant="contained"
                        component="label"
                        color="primary"
                        size="large"
                    >
                        העלה קובץ מתכון (PDF/Word)
                        <input
                            type="file"
                            hidden
                            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                    </Button>

                    <Button
                        variant="outlined"
                        component="label"
                        color="secondary"
                        size="large"
                    >
                        העלה תמונת מתכון (אופציונלי)
                        <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/jpg,image/webp,image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                    </Button>

                    <TextField
                        label="תמונת מתכון (כתובת URL, אופציונלי)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        variant="outlined"
                        size="medium"
                        placeholder="https://..."
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        size="large"
                    >
                        שלח
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default Upload;
