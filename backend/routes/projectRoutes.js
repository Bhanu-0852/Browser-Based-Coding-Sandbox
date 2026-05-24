// backend/routes/projectRoutes.js
import express from 'express';
import { saveProject, loadProject } from '../controllers/projectController.js';
import { protect } from '../middleware/requireAuth.js'; // Ensure you have this middleware!

const router = express.Router();

// 🛡️ SECURITY BARRIER
// By placing this here, EVERY route below it requires a valid HttpOnly JWT cookie.
router.use(protect);

// 📂 GET /api/projects (Loads the project on boot)
router.get('/', loadProject);

// 💾 POST /api/projects/save (Saves the project)
router.post('/save', saveProject);

export default router;
