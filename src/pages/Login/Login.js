import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert, Stack } from '@mui/material';
import API from '../../services/api';
import './Login.scss';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { username, password });
      const { token, user } = res.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      onLogin && onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <Paper elevation={6} className="login-paper">
        <Typography variant="h4" gutterBottom>כניסה</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit} className="login-form">
          <Stack spacing={2}>
            <TextField label="שם משתמש" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
            <TextField label="סיסמה" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? 'מתחבר...' : 'התחבר'}</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;
