import express from 'express';
import {
  getCamps,
  getCampById,
  createCamp,
  updateCamp,
  deleteCamp
} from '../controllers/campController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/', getCamps);
router.get('/:id', getCampById);

router.use(protect);
router.use(authorize('super_admin', 'admin'));

router.post('/', createCamp);
router.put('/:id', updateCamp);
router.delete('/:id', deleteCamp);

export default router;
