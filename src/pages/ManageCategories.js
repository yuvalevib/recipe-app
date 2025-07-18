import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Container, Typography, TextField, Button, List, ListItem, ListItemText, Stack } from '@mui/material';

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

    return (
        <Container>
            <Typography variant="h5" gutterBottom>ניהול קטגוריות</Typography>

            <Stack spacing={2} direction="row">
                <TextField
                    label="קטגוריה חדשה"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button variant="contained" onClick={handleAdd}>הוסף</Button>
            </Stack>

            <Typography variant="h6" sx={{ mt: 4 }}>קטגוריות קיימות:</Typography>
            <List>
                {categories.map(cat => (
                    <ListItem key={cat._id}>
                        <ListItemText primary={cat.name} />
                        <Button size="small" onClick={() => setEditCategory({ id: cat._id, name: cat.name })}>
                            ערוך
                        </Button>
                    </ListItem>
                ))}
            </List>

            {editCategory.id && (
                <Stack spacing={2} direction="row" sx={{ mt: 3 }}>
                    <TextField
                        label="ערוך שם קטגוריה"
                        value={editCategory.name}
                        onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                    />
                    <Button variant="contained" color="secondary" onClick={handleUpdate}>עדכן</Button>
                </Stack>
            )}
        </Container>
    );
}

export default ManageCategories;
