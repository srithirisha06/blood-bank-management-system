import express from 'express';
import { getReports } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('super_admin', 'admin'), getReports);

export default router;
