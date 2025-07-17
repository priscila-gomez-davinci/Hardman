import express from 'express';
import { createRepairRequest, getAllRepairRequests, updateRepairRequestStatus, deleteRepairRequest  } from '../controllers/repairRequestController.js';

const router = express.Router();

router.post('/', createRepairRequest);

router.get('/', getAllRepairRequests);
router.put('/:id', updateRepairRequestStatus); 
router.delete('/:id', deleteRepairRequest); 

export default router;