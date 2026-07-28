import express from 'express';
import {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital
} from '../controllers/hospitalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('super_admin', 'admin', 'staff'), getHospitals)
  .post(authorize('super_admin', 'admin'), createHospital);

router.route('/:id')
  .get(getHospitalById)
  .put(updateHospital)
  .delete(authorize('super_admin'), deleteHospital);

export default router;
