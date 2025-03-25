import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
    // Check if localStorage is available (to avoid SSR issues)
    const isLocalStorageAvailable = typeof window !== 'undefined';
    
    // Get initial theme preference
    const getInitialTheme = (): Theme => {
        if (isLocalStorageAvailable) {
            // Check localStorage first
            const savedTheme = localStorage.getItem('theme') as Theme | null;
            if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
                return savedTheme;
            }
            
            // Check user system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light'; // Default theme
    };

    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    // Update theme and save to localStorage
    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            if (isLocalStorageAvailable) {
                localStorage.setItem('theme', newTheme);
            }
            return newTheme;
        });
    };

    // Apply theme to document
    useEffect(() => {
        if (!isLocalStorageAvailable) return;
        
        // Add/remove dark class on document
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
    }, [theme, isLocalStorageAvailable]);

    return { theme, toggleTheme };
};