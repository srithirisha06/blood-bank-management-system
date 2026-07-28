import express from 'express';
import { getBloodTests, recordBloodTest } from '../controllers/bloodTestController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin', 'admin', 'staff'));

router.route('/')
  .get(getBloodTests)
  .post(recordBloodTest);

export default router;
