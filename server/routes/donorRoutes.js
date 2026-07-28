import express from 'express';
import {
  getDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor
} from '../controllers/donorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('super_admin', 'admin', 'staff'), getDonors)
  .post(authorize('super_admin', 'admin', 'staff'), createDonor);

router.route('/:id')
  .get(getDonorById)
  .put(upload.single('profileImage'), updateDonor)
  .delete(authorize('super_admin', 'admin'), deleteDonor);

export default router;
