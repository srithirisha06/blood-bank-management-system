import express from 'express';
import {
  getInventory,
  addInventoryBatch,
  updateInventoryItem,
  deleteInventoryItem
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInventory)
  .post(authorize('super_admin', 'admin', 'staff'), addInventoryBatch);

router.route('/:id')
  .put(authorize('super_admin', 'admin', 'staff'), updateInventoryItem)
  .delete(authorize('super_admin', 'admin'), deleteInventoryItem);

export default router;
