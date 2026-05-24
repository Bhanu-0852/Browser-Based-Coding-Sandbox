import React, { useState, useEffect, useContext } from 'react';
import Editor from '@monaco-editor/react';
import { 
    Files, Search, Settings, FileCode2, FileType2, 
    FileJson, Play, LayoutDashboard, ChevronDown, Save, X, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle'; 
import api from '../../services/api';
import './index.css';

const Sandbox = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeFile, setActiveFile] = useState('html');
    const [monacoTheme, setMonacoTheme] = useState('vs-dark'); 
    const [isSaving, setIsSaving] = useState(false);
    
    // ✨ COOL PREFILLED DEFAULT CODE
    const defaultCode = {
        html: `<div class="card">\n  <div class="avatar-container">\n    <img src="https://avatars.githubusercontent.com/u/9919?v=4" alt="Avatar" class="avatar" />\n  </div>\n  <h2>Bhanu Prakash Reddy</h2>\n  <p>MERN STACK DEVELOPER</p>\n  <div class="tech-stack">\n    <span>React</span>\n    <span>Node.js</span>\n    <span>MongoDB</span>\n  </div>\n  <button id="connectBtn">Connect with me</button>\n</div>`,
        css: `body {\n  background: #0f172a;\n  color: white;\n  font-family: 'Inter', system-ui, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n\n.card {\n  background: #1e293b;\n  padding: 2.5rem 2rem;\n  border-radius: 1rem;\n  text-align: center;\n  border: 1px solid #334155;\n  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);\n  transition: transform 0.3s ease;\n  width: 300px;\n}\n\n.card:hover {\n  transform: translateY(-5px);\n  border-color: #3b82f6;\n}\n\n.avatar {\n  width: 90px;\n  border-radius: 50%;\n  border: 3px solid #3b82f6;\n  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);\n}\n\nh2 {\n  margin: 1rem 0 0.25rem;\n  font-size: 1.25rem;\n}\n\np {\n  color: #94a3b8;\n  margin: 0 0 1.5rem;\n  font-size: 0.9rem;\n}\n\n.tech-stack {\n  display: flex;\n  gap: 0.5rem;\n  justify-content: center;\n  margin-bottom: 1.5rem;\n}\n\n.tech-stack span {\n  background: #334155;\n  padding: 0.25rem 0.75rem;\n  border-radius: 99px;\n  font-size: 0.75rem;\n  font-weight: 600;\n}\n\nbutton {\n  background: #3b82f6;\n  color: white;\n  border: none;\n  padding: 0.75rem 1.5rem;\n  border-radius: 0.5rem;\n  cursor: pointer;\n  font-weight: 600;\n  width: 100%;\n  transition: background 0.2s;\n}\n\nbutton:hover {\n  background: #2563eb;\n}`,
        js: `const btn = document.getElementById('connectBtn');\n\nbtn.addEventListener('click', () => {\n  btn.innerText = 'Connected!';\n  btn.style.background = '#10b981';\n  console.log('Connection established successfully.');\n});`
    };

    // The initial state uses a loading message, but the prefilled code is added on boot
    const [files, setFiles] = useState({
        html: '<div class="loading">Loading your workspace...</div>',
        css: '.loading { color: #888; text-align: center; margin-top: 2rem; font-family: sans-serif; }',
        js: ''
    });

    const [srcDoc, setSrcDoc] = useState('');

    // Fetch the project from MongoDB on load
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get('/projects');
                setFiles({
                    html: res.data.html || defaultCode.html,
                    css: res.data.css || defaultCode.css,
                    js: res.data.js || defaultCode.js
                });
                console.log("Project loaded securely from database!");
            } catch (error) {
                // If 404 (no project yet) or any other error, load the premium prefilled code
                if (error.response?.status === 404) {
                    setFiles(defaultCode);
                }
            }
        };
        fetchProject();
    }, []);

    // Save project to MongoDB
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/projects/save', files);
            // Quick delay for visual feedback, then reset saving state
            setTimeout(() => setIsSaving(false), 800); 
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
                        
                        {/* ✨ FIXED ALIGNMENT: Action Buttons (Run & Save) */}
                        <div className="tab-actions">
                            <button className="vsc-action-btn run-btn" onClick={handleRun}>
                                <Play size={12} fill="currentColor" /> Run
                            </button>
                            
                            <button className="vsc-action-btn save-btn" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? (
                                    <><Loader2 size={12} className="animate-spin" /> Saving</>
                                ) : (
                                    <><Save size={12} /> Save</>
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
                                padding: { top: 16 },
                                scrollBeyondLastLine: false
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
