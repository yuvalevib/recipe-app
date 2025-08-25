import React, { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert, Stack } from '@mui/material';
import API from '../../services/api';
import './Login.scss';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Registration removed; only login with predefined dummy credentials
  const DUMMY_USERNAME = 'איילת';
  const DUMMY_PASSWORD = '1234';

  // Pre-fill fields for convenience
  useEffect(() => {
    setUsername(DUMMY_USERNAME);
    setPassword(DUMMY_PASSWORD);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { username, password });
      const { token, user } = res.data;
      if (token && user) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-changed'));
        onLogin && onLogin(user);
        return;
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      // If user not found on server (e.g., remote environment not seeded), try to register then login
      if (msg && /invalid credentials|username already exists|missing/i.test(msg) === false) {
        // other error types
        setError(msg || 'Login failed');
      } else {
        try {
          const reg = await API.post('/auth/register', { username: DUMMY_USERNAME, password: DUMMY_PASSWORD });
          const { token: rToken, user: rUser } = reg.data;
          if (rToken && rUser) {
            localStorage.setItem('authToken', rToken);
            localStorage.setItem('authUser', JSON.stringify(rUser));
            window.dispatchEvent(new Event('auth-changed'));
            onLogin && onLogin(rUser);
            return;
          }
          // If backend returns without token, attempt login again
          const retry = await API.post('/auth/login', { username: DUMMY_USERNAME, password: DUMMY_PASSWORD });
          const { token: l2, user: u2 } = retry.data;
          if (l2 && u2) {
            localStorage.setItem('authToken', l2);
            localStorage.setItem('authUser', JSON.stringify(u2));
            window.dispatchEvent(new Event('auth-changed'));
            onLogin && onLogin(u2);
            return;
          }
          setError('Login failed');
        } catch (e2) {
          setError(e2.response?.data?.message || 'Login failed');
        }
      }
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
