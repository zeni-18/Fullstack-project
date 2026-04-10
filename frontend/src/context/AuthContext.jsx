import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Set baseURL once at module level — stable, never reset on re-render
// In production: VITE_API_URL=https://your-render-app.onrender.com/api
// In local dev: falls back to /api (Vite proxy handles it)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Track initialization to prevent the 401 interceptor from firing logout
    // before we've even had a chance to load the stored token
    const isInitialized = useRef(false);

    useEffect(() => {
        const initAuth = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const token = localStorage.getItem('token');

                if (storedUser && token && storedUser !== 'undefined' && storedUser !== 'null') {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } finally {
                isInitialized.current = true;
                setLoading(false);
            }
        };

        initAuth();

        // Register 401 interceptor AFTER initAuth so it doesn't
        // fire logout during the initialization window
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && isInitialized.current) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };

    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            const { token, ...user } = res.data;

            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Login failed',
                unverified: err.response?.data?.unverified
            };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post('/auth/register', userData);
            return { 
                success: true, 
                message: res.data.message,
                email: res.data.email
            };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Registration failed'
            };
        }
    };

    const verifyEmail = async (email, code) => {
        try {
            const res = await axios.post('/auth/verify-email', { email, code });
            const { token, ...user } = res.data;

            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Verification failed'
            };
        }
    };

    const resendCode = async (email) => {
        try {
            const res = await axios.post('/auth/resend-code', { email });
            return { success: true, message: res.data.message };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Failed to resend code'
            };
        }
    };

    const googleLogin = async (googleData) => {
        try {
            // googleData will now contain { credential } from the GoogleLogin component
            const res = await axios.post('/auth/google-login', googleData);
            const { token, ...user } = res.data;

            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Google Login failed'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUser = (newUser) => {
        if (newUser) {
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        verifyEmail,
        resendCode,
        googleLogin,
        logout,
        setUser: updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
