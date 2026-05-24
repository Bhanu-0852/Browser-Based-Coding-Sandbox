import React, { useState, useContext } from 'react';
import Editor from '@monaco-editor/react';
import { 
    Files, Search, Settings, FileCode2, FileType2, 
    FileJson, Play, LayoutDashboard, ChevronDown, Check, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './index.css';

const Sandbox = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeFile, setActiveFile] = useState('html');
    
    const [files, setFiles] = useState({
        html: '<div class="welcome">\n  <h1>Welcome Bhanu</h1>\n  <p>Your True VS Code IDE.</p>\n</div>',
        css: '.welcome {\n  font-family: system-ui, sans-serif;\n  text-align: center;\n  color: #333;\n  margin-top: 3rem;\n}\n\nh1 {\n  color: #007acc;\n}',
        js: 'console.log("VS Code Sandbox Initialized!");'
    });

    const [srcDoc, setSrcDoc] = useState('');

    // ✨ MANUAL RUN FUNCTION
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
            {/* 1. Title Bar */}
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
                    <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
                        <LayoutDashboard size={14} /> Exit to Dashboard
                    </button>
                </div>
            </div>

            <div className="vsc-body">
                {/* 2. Activity Bar (Far Left) */}
                <div className="vsc-activitybar">
                    <div className="activity-top">
                        <div className="activity-icon active"><Files size={24} /></div>
                        <div className="activity-icon"><Search size={24} /></div>
                    </div>
                    <div className="activity-bottom">
                        <div className="activity-icon"><Settings size={24} /></div>
                    </div>
                </div>

                {/* 3. Sidebar (File Explorer) */}
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

                {/* 4. Editor Pane */}
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
                        {/* Editor Action Buttons */}
                        <div className="tab-actions">
                            <button className="vsc-run-button" onClick={handleRun}>
                                <Play size={14} fill="currentColor" /> Run Code
                            </button>
                        </div>
                    </div>
                    <div className="monaco-wrapper">
                        <Editor
                            height="100%"
                            language={getLanguage()}
                            theme="vs-dark"
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

                {/* 5. Preview Pane (Split Right) */}
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
                                <p>Click <strong>Run Code</strong> to view output</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 6. Status Bar (Bottom Blue Strip) */}
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
