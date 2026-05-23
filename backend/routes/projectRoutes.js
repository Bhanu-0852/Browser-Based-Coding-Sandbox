import express from 'express';
import { saveProject, loadProject } from '../controllers/projectController.js';
// ✨ THE FIX: Import the exact middleware we built earlier
import { protect } from '../middleware/requireAuth.js';

const router = express.Router();

// 🛡️ SECURITY BARRIER
// By placing this here, EVERY route below it requires a valid HttpOnly JWT cookie.
router.use(protect);

// GET /api/projects/load
router.get('/load', loadProject);

// POST /api/projects/save
router.post('/save', saveProject);

export default router;