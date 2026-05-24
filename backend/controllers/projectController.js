// backend/controllers/projectController.js
import Project from '../models/Project.js';

// ==========================================
// 💾 SAVE PROJECT
// ==========================================
export const saveProject = async (req, res) => {
    try {
        const { html, css, js } = req.body;
        
        // Check how your auth middleware attaches the user ID
        const userId = req.userId || (req.user && req.user._id);

        if (!userId) {
            return res.status(401).json({ error: "User ID not found in request" });
        }

        let project = await Project.findOne({ userId });
        
        if (project) {
            // Update existing project
            project.html = html; 
            project.css = css; 
            project.js = js;
            await project.save();
        } else {
            // Create new project for first-time save
            await Project.create({ userId, html, css, js });
        }
        
        res.status(200).json({ message: 'Project saved successfully!' });
    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ error: 'Failed to save project' });
    }
};

// ==========================================
// 📂 LOAD PROJECT
// ==========================================
export const loadProject = async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user._id);

        const project = await Project.findOne({ userId });
        
        if (project) {
            res.status(200).json(project);
        } else {
            // 404 is expected for brand new users, frontend will handle this gracefully
            res.status(404).json({ message: 'No project found' });
        }
    } catch (error) {
        console.error("Load Error:", error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
};
