import express from 'express';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import { checkWorkingHours } from '../middlewares/PresentMiddleware.js';
import PresentController from '../controllers/PresentController.js';

const router = express.Router();


router.post('/api/absences/checkin',authMiddleware.authMiddleware, checkWorkingHours, PresentController.checkIn);
router.post('/api/absences/checkout', authMiddleware.authMiddleware,checkWorkingHours, PresentController.checkOut);
router.get('/api/absences', PresentController.getUserAbsences);
router.post('/api/absences/:id', PresentController.getUserAbsencesId);
router.post('/api/absences/summaries/:id?', PresentController.getSummaries); 
router.get('/api/absences/summaries-user/:id?', PresentController.getSummariesUserAll); 


export default router;