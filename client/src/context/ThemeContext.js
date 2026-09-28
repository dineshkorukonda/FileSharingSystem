import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    const applyTheme = (targetTheme) => {
        setTheme(targetTheme);
        localStorage.setItem('theme', targetTheme);
        document.documentElement.setAttribute('data-theme', targetTheme);
        if (targetTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Initialize theme from localStorage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);
    }, []);

    // Function to toggle theme
    const toggleTheme = (newTheme) => {
        if (!newTheme) {
            const nextTheme = theme === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
        } else {
            applyTheme(newTheme);
        }
    };

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the theme context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};