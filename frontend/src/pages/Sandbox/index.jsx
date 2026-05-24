import React, { useState, useEffect, useContext } from 'react';
import Editor from '@monaco-editor/react';
import { FileCode2, FileJson, FileType2, Play, Save, LayoutDashboard, MonitorPlay } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle'; // Brings in your theme switcher
import './index.css';

const Workspace = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeFile, setActiveFile] = useState('html');
    const [monacoTheme, setMonacoTheme] = useState('vs-dark');
    
    const [files, setFiles] = useState({
        html: '<div class="welcome">\n  <h1>Welcome Bhanu</h1>\n  <p>Start coding your premium app.</p>\n</div>',
        css: '.welcome {\n  font-family: system-ui, sans-serif;\n  text-align: center;\n  color: #333;\n  margin-top: 3rem;\n}\n\nh1 {\n  color: #4f46e5;\n}',
        js: 'console.log("Premium Workspace Initialized!");'
    });

    const [srcDoc, setSrcDoc] = useState('');

    // ✨ THEME SYNC: Watches your global app theme and updates Monaco Editor
    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.body.classList.contains('dark') || 
                           document.body.classList.contains('dark-mode') || 
                           document.documentElement.getAttribute('data-theme') === 'dark';
            setMonacoTheme(isDark ? 'vs-dark' : 'light');
        };
        
        checkTheme(); // Run on mount

        // Listen for class changes on the body/html tags when ThemeToggle is clicked
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
        
        return () => observer.disconnect();
    }, []);

    // Live preview debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <style>${files.css}</style>
                    </head>
                    <body>
                        ${files.html}
                        <script>${files.js}</script>
                    </body>
                </html>
            `);
        }, 300);
        return () => clearTimeout(timeout);
    }, [files]);

    const handleEditorChange = (value) => {
        setFiles(prev => ({ ...prev, [activeFile]: value }));
    };

    const getLanguage = () => {
        if (activeFile === 'js') return 'javascript';
        return activeFile;
    };

    return (
        <div className="premium-ide-wrapper">
            {/* Top Navigation Bar */}
            <nav className="ide-topbar">
                <div className="topbar-left">
                    <MonitorPlay size={18} className="brand-icon" />
                    <span className="brand-text">Developer Workspace</span>
                </div>
                <div className="topbar-center">
                    <div className="search-bar">Bhanu-0852 / Browser-Based-Coding-Sandbox</div>
                </div>
                <div className="topbar-right">
                    <span className="user-email">{user?.email || 'Guest'}</span>
                    <ThemeToggle /> {/* Added Theme Switcher */}
                    <button className="btn-ide btn-save">
                        <Save size={14} /> Save Project
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="btn-ide btn-dashboard">
                        <LayoutDashboard size={14} /> Dashboard
                    </button>
                </div>
            </nav>

            <div className="ide-main">
                {/* Left Sidebar (Explorer) */}
                <aside className="ide-sidebar">
                    <div className="sidebar-header">EXPLORER</div>
                    <div className="file-tree">
                        <div 
                            className={`file-item ${activeFile === 'html' ? 'active' : ''}`}
                            onClick={() => setActiveFile('html')}
                        >
                            <FileCode2 size={16} color="#e34c26" /> index.html
                        </div>
                        <div 
                            className={`file-item ${activeFile === 'css' ? 'active' : ''}`}
                            onClick={() => setActiveFile('css')}
                        >
                            <FileType2 size={16} color="#264de4" /> styles.css
                        </div>
                        <div 
                            className={`file-item ${activeFile === 'js' ? 'active' : ''}`}
                            onClick={() => setActiveFile('js')}
                        >
                            <FileJson size={16} color="#f7df1e" /> script.js
                        </div>
                    </div>
                </aside>

                {/* Center Editor Area */}
                <section className="ide-editor-section">
                    <div className="editor-tabs">
                        <div className={`tab ${activeFile === 'html' ? 'active' : ''}`} onClick={() => setActiveFile('html')}>
                            <FileCode2 size={14} color="#e34c26" /> index.html
                        </div>
                        <div className={`tab ${activeFile === 'css' ? 'active' : ''}`} onClick={() => setActiveFile('css')}>
                            <FileType2 size={14} color="#264de4" /> styles.css
                        </div>
                        <div className={`tab ${activeFile === 'js' ? 'active' : ''}`} onClick={() => setActiveFile('js')}>
                            <FileJson size={14} color="#f7df1e" /> script.js
                        </div>
                    </div>
                    
                    <div className="editor-container">
                        <Editor
                            height="100%"
                            language={getLanguage()}
                            theme={monacoTheme}
                            value={files[activeFile]}
                            onChange={handleEditorChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on',
                                automaticLayout: true,
                                padding: { top: 16 }
                            }}
                        />
                    </div>
                </section>

                {/* Right Live Preview Area */}
                <section className="ide-preview-section">
                    <div className="preview-header">
                        <div className="browser-dots">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <div className="browser-url">localhost:3000</div>
                        <div className="preview-title">
                            <Play size={14} className="play-icon" /> LIVE PREVIEW
                        </div>
                    </div>
                    <div className="iframe-container">
                        <iframe
                            srcDoc={srcDoc}
                            title="output"
                            sandbox="allow-scripts"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Workspace;
