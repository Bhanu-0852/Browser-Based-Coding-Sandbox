// src/components/ThemeToggle/index.jsx
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, setTheme } = useContext(ThemeContext);

    const cycleTheme = () => {
        if (theme === 'system') setTheme('light');
        else if (theme === 'light') setTheme('dark');
        else setTheme('system');
    };

    return (
        <button 
            onClick={cycleTheme}
            title={`Current theme: ${theme}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease',
            }}
        >
            {theme === 'light' && <Sun size={20} />}
            {theme === 'dark' && <Moon size={20} />}
            {theme === 'system' && <Monitor size={20} />}
        </button>
    );
};

export default ThemeToggle;