import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Helper to fetch user profile from backend
    const fetchUserProfile = useCallback(async (token) => {
        try {
            const res = await fetch('http://localhost:8080/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                setIsAuthenticated(true);
                return userData;
            } else {
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                return null;
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return null;
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile(token).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [fetchUserProfile]);

    const login = async (userDataOrToken, tokenMaybe) => {
        let token;
        if (tokenMaybe) {
            token = tokenMaybe;
        } else {
            token = userDataOrToken;
        }
        localStorage.setItem('token', token);
        await fetchUserProfile(token);
        navigate('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/');
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            return await fetchUserProfile(token);
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-base-200">
                <div className="flex flex-col items-center gap-3">
                    <span className="loading loading-spinner loading-md" />
                    <p className="text-sm text-base-content/70">Loading</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};