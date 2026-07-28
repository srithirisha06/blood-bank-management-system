import express from 'express';
import {
  getRequests,
  createRequest,
  updateRequestStatus
} from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';
import { requestValidator } from '../validators/requestValidator.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRequests)
  .post(requestValidator, validate, createRequest);

router.put('/:id/status', authorize('super_admin', 'admin'), updateRequestStatus);

export default router;
