import Project from '../models/Project.js';

// ✨ SAVE PROJECT
export const saveProject = async (req, res) => {
    try {
        const { files } = req.body;
        const userId = req.user._id;

        // Look for an existing project for this user
        let project = await Project.findOne({ userId });
        
        if (project) {
            // Update the existing code
            project.files = files;
            await project.save();
        } else {
            // First time saving? Create a brand new workspace
            project = await Project.create({ userId, files });
        }

        res.status(200).json({ message: 'Project saved successfully' });
    } catch (error) {
        console.error("🔥 SAVE ERROR:", error);
        res.status(500).json({ error: 'Failed to save project' });
    }
};

// ✨ LOAD PROJECT
export const loadProject = async (req, res) => {
    try {
        const userId = req.user._id;
        const project = await Project.findOne({ userId });
        
        if (!project) {
            return res.status(200).json({ files: [] }); // No project yet, load default UI
        }

        res.status(200).json({ files: project.files });
    } catch (error) {
        console.error("🔥 LOAD ERROR:", error);
        res.status(500).json({ error: 'Failed to load project' });
    }
};