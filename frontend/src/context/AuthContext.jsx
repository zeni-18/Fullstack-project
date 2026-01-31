import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    axios.defaults.baseURL = '/api';

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
                setLoading(false);
            }
        };

        initAuth();
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
                message: err.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post('/auth/register', userData);
            const { token, ...user } = res.data;

            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        setUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
