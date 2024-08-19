import express from 'express';
import UserController from '../controllers/userController';
import AuthMiddleware from '../Middleware/AuthMiddleware';

const userRoutes = express.Router();

// Rutas públicas
userRoutes.post('/register', UserController.createUser);
userRoutes.post('/login', UserController.loginUser);
userRoutes.post('/request-reset-password', UserController.requestPasswordReset);
userRoutes.post('/reset-password', UserController.resetPassword);

// Middleware de autenticación para las rutas siguientes
userRoutes.use(AuthMiddleware.authenticate);

// Rutas protegidas
userRoutes.get('/', UserController.getUsers);
userRoutes.get('/:id', UserController.getUserById);
userRoutes.put('/:id', UserController.updateUser);
userRoutes.delete('/:id', UserController.deleteUser);

// Ruta de búsqueda (pública o protegida según tus necesidades)
userRoutes.get('/search/:name', UserController.searchUsersByName);

export default userRoutes;