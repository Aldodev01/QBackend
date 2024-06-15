import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import locationController from '../controllers/LocationController.js';


const router = express.Router();
router.use(AuthMiddleware.authMiddleware); 
router.post('/api/locations', AuthMiddleware.requireSigner, locationController.createLocation);
router.get('/api/locations', AuthMiddleware.requireSigner, locationController.getAllLocations);
router.put('/api/locations/:id', AuthMiddleware.requireSigner, locationController.updateLocation);
router.delete('/api/locations/:id', AuthMiddleware.requireSigner, locationController.deleteLocation);

export default router;