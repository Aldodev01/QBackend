import express from 'express';
import userController from '../controllers/UserController.js'
import AuthMiddleware from '../middlewares/AuthMiddleware.js';
import upload from '../middlewares/FileMiddleware.js';

const router = express.Router();

// CRUD operations
router.post('/api/users',AuthMiddleware.authMiddleware ,userController.createUser);
router.get('/api/users',AuthMiddleware.authMiddleware,userController.getAllUsers);
router.get('/api/users/:id', AuthMiddleware.authMiddleware, userController.getUserById);
router.put('/api/users/:id', AuthMiddleware.authMiddleware, userController.updateUser);
router.delete('/api/users/:id', AuthMiddleware.authMiddleware, userController.deleteUser);
router.patch('/api/users/:id', AuthMiddleware.authMiddleware, upload.single('profile_pic'), userController.updateProfilePic);


// Authentication
router.get('/api/user-counts', userController.getUserCounts);
router.post('/api/login', userController.login);
router.post('/api/logout/:id', AuthMiddleware.authMiddleware, userController.logout);

export default router;
