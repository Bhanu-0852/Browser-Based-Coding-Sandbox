import React, { useState, useEffect, useContext } from 'react';
import Editor from '@monaco-editor/react';
import { 
    Files, Search, Settings, FileCode2, FileType2, 
    FileJson, Play, LayoutDashboard, ChevronDown, Save, X, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle'; 
import api from '../../services/api'; // ✨ Import your API service
import './index.css';

const Sandbox = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeFile, setActiveFile] = useState('html');
    const [monacoTheme, setMonacoTheme] = useState('vs-dark'); 
    
    // ✨ Track saving status for a premium button animation
    const [isSaving, setIsSaving] = useState(false);
    
    const [files, setFiles] = useState({
        html: '<div class="welcome">\n  <h1>Welcome Bhanu</h1>\n  <p>Loading your project...</p>\n</div>',
        css: '',
        js: ''
    });

    const [srcDoc, setSrcDoc] = useState('');

    // ✨ FETCH SAVED PROJECT ON LOAD
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get('/projects');
                setFiles({
                    html: res.data.html || '',
                    css: res.data.css || '',
                    js: res.data.js || ''
                });
                console.log("Project loaded securely from database!");
            } catch (error) {
                // If 404 (no project yet), set default premium text
                if (error.response?.status === 404) {
                    setFiles({
                        html: '<div class="welcome">\n  <h1>Welcome Bhanu</h1>\n  <p>Your True VS Code IDE.</p>\n</div>',
                        css: '.welcome {\n  font-family: system-ui, sans-serif;\n  text-align: center;\n  color: #333;\n  margin-top: 3rem;\n}\n\nh1 {\n  color: #007acc;\n}',
                        js: 'console.log("VS Code Sandbox Initialized!");'
                    });
                }
            }
        };
        fetchProject();
    }, []);

    // ✨ SAVE PROJECT TO DATABASE
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/projects/save', files);
            // Visual feedback that it saved
            setTimeout(() => setIsSaving(false), 1000); 
        } catch (error) {
            console.error("Save failed", error);
            setIsSaving(false);
            alert("Failed to save project. Make sure you are logged in.");
        }
    };

    // Theme Sync
    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.body.classList.contains('dark') || 
                           document.body.classList.contains('dark-mode') || 
                           document.documentElement.getAttribute('data-theme') === 'dark';
            setMonacoTheme(isDark ? 'vs-dark' : 'light');
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
        return () => observer.disconnect();
    }, []);

    const handleRun = () => {
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
    };

    const handleEditorChange = (value) => {
        setFiles(prev => ({ ...prev, [activeFile]: value }));
    };

    const getLanguage = () => {
        if (activeFile === 'js') return 'javascript';
        return activeFile;
    };

    return (
        <div className="vsc-root">
            {/* Title Bar */}
            <div className="vsc-titlebar">
                <div className="titlebar-menu">
                    <span>File</span>
                    <span>Edit</span>
                    <span>Selection</span>
                    <span>View</span>
                    <span>Go</span>
                    <span>Run</span>
                </div>
                <div className="titlebar-center">
                    Bhanu-0852 / Browser-Based-Coding-Sandbox - Visual Studio Code
                </div>
                <div className="titlebar-window-controls">
                    <ThemeToggle /> 
                    <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
                        <LayoutDashboard size={14} /> Dashboard
                    </button>
                </div>
            </div>

            <div className="vsc-body">
                {/* Activity Bar */}
                <div className="vsc-activitybar">
                    <div className="activity-top">
                        <div className="activity-icon active"><Files size={24} /></div>
                        <div className="activity-icon"><Search size={24} /></div>
                    </div>
                    <div className="activity-bottom">
                        <div className="activity-icon"><Settings size={24} /></div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="vsc-sidebar">
                    <div className="sidebar-title">EXPLORER</div>
                    <div className="sidebar-section">
                        <div className="section-header">
                            <ChevronDown size={16} />
                            <span>BROWSER-BASED-CODING-SANDBOX</span>
                        </div>
                        <div className="file-list">
                            <div className={`file-row ${activeFile === 'html' ? 'active' : ''}`} onClick={() => setActiveFile('html')}>
                                <FileCode2 size={16} color="#e34c26" /> index.html
                            </div>
                            <div className={`file-row ${activeFile === 'css' ? 'active' : ''}`} onClick={() => setActiveFile('css')}>
                                <FileType2 size={16} color="#264de4" /> styles.css
                            </div>
                            <div className={`file-row ${activeFile === 'js' ? 'active' : ''}`} onClick={() => setActiveFile('js')}>
                                <FileJson size={16} color="#f7df1e" /> script.js
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Pane */}
                <div className="vsc-editor-pane">
                    <div className="vsc-tabs">
                        <div className="tabs-container">
                            <div className={`vsc-tab ${activeFile === 'html' ? 'active' : ''}`} onClick={() => setActiveFile('html')}>
                                <FileCode2 size={14} color="#e34c26" /> index.html
                            </div>
                            <div className={`vsc-tab ${activeFile === 'css' ? 'active' : ''}`} onClick={() => setActiveFile('css')}>
                                <FileType2 size={14} color="#264de4" /> styles.css
                            </div>
                            <div className={`vsc-tab ${activeFile === 'js' ? 'active' : ''}`} onClick={() => setActiveFile('js')}>
                                <FileJson size={14} color="#f7df1e" /> script.js
                            </div>
                        </div>
                        
                        {/* ✨ Action Buttons (Run & Save) */}
                        <div className="tab-actions" style={{ gap: '8px' }}>
                            <button className="vsc-run-button" onClick={handleRun}>
                                <Play size={14} fill="currentColor" /> Run
                            </button>
                            
                            {/* ✨ The Working Save Button */}
                            <button 
                                className="vsc-run-button" 
                                onClick={handleSave} 
                                disabled={isSaving}
                                style={{ backgroundColor: isSaving ? '#007acc' : 'var(--vsc-run-btn)' }}
                            >
                                {isSaving ? (
                                    <><Loader2 size={14} className="animate-spin" /> Saving...</>
                                ) : (
                                    <><Save size={14} /> Save</>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="monaco-wrapper">
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
                                padding: { top: 16 }
                            }}
                        />
                    </div>
                </div>

                {/* Preview Pane */}
                <div className="vsc-preview-pane">
                    <div className="vsc-tabs">
                        <div className="tabs-container">
                            <div className="vsc-tab active">
                                Simple Browser
                            </div>
                        </div>
                        <div className="tab-actions">
                            <span className="url-bar">localhost:3000</span>
                        </div>
                    </div>
                    <div className="preview-wrapper">
                        {srcDoc ? (
                            <iframe
                                srcDoc={srcDoc}
                                title="output"
                                sandbox="allow-scripts"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                            />
                        ) : (
                            <div className="empty-preview">
                                <Play size={48} className="empty-icon" />
                                <p>Click <strong>Run</strong> to view output</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="vsc-statusbar">
                <div className="status-left">
                    <span className="status-item"><X size={14} /> 0</span>
                    <span className="status-item">User: {user?.email || 'Guest'}</span>
                </div>
                <div className="status-right">
                    <span className="status-item">UTF-8</span>
                    <span className="status-item">HTML</span>
                    <span className="status-item">Prettier</span>
                </div>
            </div>
        </div>
    );
};

export default Sandbox;
