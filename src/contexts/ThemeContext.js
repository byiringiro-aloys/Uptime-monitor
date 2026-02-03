import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
            // Check system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Keyboard shortcut for theme toggle
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check if user is typing in an input field
            const isTyping = event.target.tagName === 'INPUT' || 
                           event.target.tagName === 'TEXTAREA' || 
                           event.target.contentEditable === 'true' ||
                           event.target.isContentEditable;

            // Handle 'M' key for theme toggle (when not typing)
            if (event.key === 'm' && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                toggleTheme();
                
                // Show a brief notification
                const notification = document.createElement('div');
                notification.textContent = `Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`;
                notification.className = `
                    fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium
                    ${theme === 'dark' 
                        ? 'bg-white text-gray-900' 
                        : 'bg-gray-900 text-white'
                    }
                    transition-all duration-300 transform translate-x-0
                `;
                
                document.body.appendChild(notification);
                
                // Remove notification after 2 seconds
                setTimeout(() => {
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        if (document.body.contains(notification)) {
                            document.body.removeChild(notification);
                        }
                    }, 300);
                }, 2000);
                return;
            }

            // Check for Ctrl+Shift+D (Windows/Linux) or Cmd+Shift+D (Mac) - keeping the old shortcut too
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                toggleTheme();
                
                // Show a brief notification
                const notification = document.createElement('div');
                notification.textContent = `Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`;
                notification.className = `
                    fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium
                    ${theme === 'dark' 
                        ? 'bg-white text-gray-900' 
                        : 'bg-gray-900 text-white'
                    }
                    transition-all duration-300 transform translate-x-0
                `;
                
                document.body.appendChild(notification);
                
                // Remove notification after 2 seconds
                setTimeout(() => {
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        if (document.body.contains(notification)) {
                            document.body.removeChild(notification);
                        }
                    }, 300);
                }, 2000);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [theme, toggleTheme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
