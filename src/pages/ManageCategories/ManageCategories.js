import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Container, Typography, TextField, Button, List, ListItem, ListItemText, Stack } from '@mui/material';
import './ManageCategories.scss';

function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [editCategory, setEditCategory] = useState({ id: '', name: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await API.get('/categories');
        setCategories(res.data);
    };

    const handleAdd = async () => {
        if (!newCategory.trim()) return;
        await API.post('/categories', { name: newCategory });
        setNewCategory('');
        fetchCategories();
    };

    const handleUpdate = async () => {
        if (!editCategory.name.trim()) return;
        await API.put(`/categories/${editCategory.id}`, { name: editCategory.name });
        setEditCategory({ id: '', name: '' });
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
                            <Button size="small" variant="outlined" color="primary" onClick={() => setEditCategory({ id: cat._id, name: cat.name })}>
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
                    <Button variant="contained" color="secondary" size="medium" onClick={handleUpdate}>
                        עדכן
                    </Button>
                </Stack>
            )}
        </Container>
    );
}

export default ManageCategories;
