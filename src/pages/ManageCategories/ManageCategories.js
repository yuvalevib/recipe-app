import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Container, Typography, TextField, Button, List, ListItem, ListItemText, Stack, InputAdornment, IconButton, Avatar } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import './ManageCategories.scss';

function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [editCategory, setEditCategory] = useState({ id: '', name: '', imageUrl: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await API.get('/categories');
        setCategories(res.data);
    };

    const handleAdd = async () => {
        if (!newCategory.trim()) return;
        await API.post('/categories', { name: newCategory, imageUrl: newImageUrl || undefined });
        setNewCategory('');
        setNewImageUrl('');
        fetchCategories();
    };

    const handleUpdate = async () => {
        if (!editCategory.name.trim()) return;
        await API.put(`/categories/${editCategory.id}`, { name: editCategory.name, imageUrl: editCategory.imageUrl });
        setEditCategory({ id: '', name: '', imageUrl: '' });
        fetchCategories();
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) {
            try {
                await API.delete(`/categories/${categoryId}`);
                fetchCategories();
            } catch (err) {
                console.error('Failed to delete category:', err);
                alert('שגיאה במחיקת הקטגוריה');
            }
        }
    };

    const handleUploadImage = async (categoryId, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await API.post(`/categories/${categoryId}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Update local list quickly
            setCategories(prev => prev.map(c => c._id === categoryId ? res.data : c));
            // Reflect in edit state if editing this item
            setEditCategory(ec => ec.id === categoryId ? { ...ec, imageUrl: res.data.imageUrl || '' } : ec);
        } catch (err) {
            console.error('Failed to upload image:', err);
            alert('שגיאה בהעלאת תמונה');
        }
    };

    return (
        <Container className="manage-categories-container">
            <Typography variant="h4" gutterBottom className="manage-categories-title">
                ניהול קטגוריות
            </Typography>

            <Stack spacing={2} direction="row" className="manage-categories-form">
                <TextField
                    label="קטגוריה חדשה"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    variant="outlined"
                    size="small"
                />
                <TextField
                    label="תמונת קטגוריה (כתובת URL)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    variant="outlined"
                    size="small"
                    placeholder="https://..."
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <ImageIcon fontSize="small" />
                            </InputAdornment>
                        )
                    }}
                />
                <Button variant="contained" color="primary" size="medium" onClick={handleAdd}>
                    הוסף
                </Button>
            </Stack>

            <Typography variant="h6" className="manage-categories-title">
                קטגוריות קיימות:
            </Typography>
            <List className="manage-categories-list">
                {categories.map(cat => (
                    <ListItem key={cat._id} className="manage-categories-list-item" secondaryAction={
                        <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined" color="primary" onClick={() => setEditCategory({ id: cat._id, name: cat.name, imageUrl: cat.imageUrl || '' })}>
                                ערוך
                            </Button>
                            <Button 
                                size="small" 
                                variant="outlined"
                                color="error" 
                                onClick={() => handleDelete(cat._id)}
                            >
                                מחק
                            </Button>
                        </Stack>
                    }>
                        <Avatar src={cat.imageUrl} alt={cat.name} sx={{ mr: 1 }} />
                        <ListItemText primary={cat.name} className="manage-categories-list-text" />
                    </ListItem>
                ))}
            </List>

            {editCategory.id && (
                <Stack spacing={2} direction="row" className="manage-categories-edit-form">
                    <TextField
                        label="ערוך שם קטגוריה"
                        value={editCategory.name}
                        onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                        variant="outlined"
                        size="small"
                    />
                    <TextField
                        label="תמונת קטגוריה (כתובת URL)"
                        value={editCategory.imageUrl}
                        onChange={(e) => setEditCategory({ ...editCategory, imageUrl: e.target.value })}
                        variant="outlined"
                        size="small"
                        placeholder="https://..."
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setEditCategory({ ...editCategory, imageUrl: '' })} size="small" title="נקה תמונה">
                                        <ImageIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        size="small"
                    >
                        העלה תמונה
                        <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={(e) => handleUploadImage(editCategory.id, e.target.files && e.target.files[0])}
                        />
                    </Button>
                    <Button variant="contained" color="secondary" size="medium" onClick={handleUpdate}>
                        עדכן
                    </Button>
                </Stack>
            )}
        </Container>
    );
}

export default ManageCategories;
