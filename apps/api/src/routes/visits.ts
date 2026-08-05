import { Router } from 'express';
import { getVisits, createVisit, updateVisit, deleteVisit } from '../controllers/visits.controller.js';

const router = Router();

router.post('/list', getVisits);
router.post('/', createVisit);
router.put('/:id', updateVisit);
router.delete('/:id', deleteVisit);

export default router;
