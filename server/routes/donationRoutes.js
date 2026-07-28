import express from 'express';
import {
  getDonations,
  createDonation,
  updateDonationStatus
} from '../controllers/donationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDonations)
  .post(createDonation);

router.put('/:id/status', authorize('super_admin', 'admin', 'staff'), updateDonationStatus);

export default router;
