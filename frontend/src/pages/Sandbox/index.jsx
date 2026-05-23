// src/pages/Sandbox/index.jsx
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Editor from '@monaco-editor/react';
import { FileType2, FileJson, Play, Save, LogOut, MonitorPlay, Home, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ThemeToggle from '../../components/ThemeToggle';
import Loader from '../../components/Loader'; 
import './index.css';

const Sandbox = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('html');
    const [srcDoc, setSrcDoc] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(true); 
    const [saveError, setSaveError] = useState(''); 
    
    // ✨ NEW: State to track the Monaco Editor theme dynamically
    const [editorTheme, setEditorTheme] = useState('vs-dark');
    
    const [files, setFiles] = useState({
        html: '<div class="welcome">\n  <h1>Secure Sandbox</h1>\n  <p>Start coding...</p>\n</div>',
        css: 'body {\n  margin: 0;\n  padding: 2rem;\n  font-family: system-ui;\n}\n\n.welcome h1 {\n  color: #3b82f6;\n}',
        js: 'console.log("Protected workspace loaded successfully.");'
    });

    // ✨ NEW: The "Theme Watcher"
    // This watches your HTML body. When ThemeToggle clicks, this catches it and updates the editor!
    useEffect(() => {
        const checkTheme = () => {
            // Checks common light-mode classes/attributes
            const isLight = document.body.classList.contains('light') || 
                            document.documentElement.classList.contains('light') ||
                            document.body.classList.contains('light-mode') ||
                            document.documentElement.getAttribute('data-theme') === 'light';
            
            setEditorTheme(isLight ? 'light' : 'vs-dark');
        };

        checkTheme(); // Check on load

        // Set up the observer to watch for changes continuously
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // Load project data
    useEffect(() => {
        const fetchProject = async () => {
            setIsFetching(true); 
            try {
                const res = await api.get('/projects/load');
                if (res.data.files && res.data.files.length > 0) {
                    const loadedFiles = {};
                    res.data.files.forEach(f => {
                        loadedFiles[f.language] = f.value;
                    });
                    setFiles(loadedFiles);
                }
            } catch (err) {
                console.error("Failed to load project", err);
            } finally {
                setIsFetching(false); 
            }
        };
        fetchProject();
    }, []);

    // Compiler Engine
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
                        <script>${files.js}<\/script>
                    </body>
                </html>
            `);
        }, 400); 
        return () => clearTimeout(timeout);
    }, [files]);

    // Save logic
    const handleSave = async () => {
        setIsSaving(true);
        setSaveError('');
        try {
            const payload = [
                { name: 'index.html', language: 'html', value: files.html },
                { name: 'styles.css', language: 'css', value: files.css },
                { name: 'script.js', language: 'js', value: files.js }
            ];
            await api.post('/projects/save', { files: payload });
            setTimeout(() => setIsSaving(false), 1000);
        } catch (err) {
            setSaveError(err.response?.data?.error || err.message || "Network Error");
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            {isFetching && <Loader message="Loading your workspace..." />}

            <div className="sandbox-layout">
                <header className="sandbox-header">
                    <div className="sandbox-header-left">
                        <MonitorPlay size={24} color="var(--accent-color)" />
                        <h2 className="sandbox-title">Developer Workspace</h2>
                    </div>
                    
                    <div className="sandbox-header-right">
                        <ThemeToggle />
                        <span className="user-email-display">{user?.email}</span>
                        
                        <button onClick={() => navigate('/dashboard')} className="btn-icon" title="Dashboard">
                            <Home size={20} />
                        </button>
                        
                        {saveError && (
                            <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fef2f2', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                <AlertCircle size={14} /> {saveError}
                            </span>
                        )}

                        <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.5rem 1rem' }}>
                            <Save size={16} /> {isSaving ? 'Saved!' : 'Save Project'}
                        </button>
                        
                        <button onClick={handleLogout} className="btn-icon" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <main className="sandbox-workspace">
                    <aside className="sandbox-sidebar">
                        <h3 className="sidebar-title">Explorer</h3>
                        <button className={`file-tab ${activeTab === 'html' ? 'active' : ''}`} onClick={() => setActiveTab('html')}>
                            <FileType2 size={16} /> index.html
                        </button>
                        <button className={`file-tab ${activeTab === 'css' ? 'active' : ''}`} onClick={() => setActiveTab('css')}>
                            <FileType2 size={16} /> styles.css
                        </button>
                        <button className={`file-tab ${activeTab === 'js' ? 'active' : ''}`} onClick={() => setActiveTab('js')}>
                            <FileJson size={16} /> script.js
                        </button>
                    </aside>

                    <section className="sandbox-editor">
                        <Editor
                            height="100%"
                            theme={editorTheme} // ✨ THE FIX: Now completely dynamic based on state!
                            language={activeTab === 'js' ? 'javascript' : activeTab}
                            value={files[activeTab]}
                            onChange={(val) => setFiles(prev => ({ ...prev, [activeTab]: val }))}
                            options={{ 
                                minimap: { enabled: false }, 
                                padding: { top: 16 },
                                fontSize: 15,
                                wordWrap: 'on'
                            }}
                        />
                    </section>

                    <section className="sandbox-preview">
                        <div className="preview-header">
                            <Play size={16} color="var(--accent-color)" /> Live Preview
                        </div>
                        <iframe 
                            srcDoc={srcDoc} 
                            title="output"
                            sandbox="allow-scripts" 
                            className="preview-iframe"
                        />
                    </section>
                </main>
            </div>
        </>
    );
};

export default Sandbox;