import express from 'express';
import UserController from '../controllers/userController';
import AuthMiddleware from '../Middleware/AuthMiddleware';

const userRoutes = express.Router();

// Rutas públicas
userRoutes.get('/search/:name', UserController.searchUsersByName);
userRoutes.post('/register', UserController.createUser);
userRoutes.post('/login', UserController.loginUser);
userRoutes.put('/:id', UserController.updateUser);
userRoutes.delete('/:id', UserController.deleteUser);

// Middleware de autenticación para las rutas siguientes
userRoutes.use(AuthMiddleware.authenticate);

// Rutas de restablecimiento de contraseña (públicas)
userRoutes.post('/request-reset-password', UserController.requestPasswordReset);
userRoutes.post('/reset-password', UserController.resetPassword);

// Rutas protegidas 
userRoutes.get('/', UserController.getUsers);
userRoutes.get('/:id', UserController.getUserById);

// Ruta de búsqueda (pública o protegida según tus necesidades)

export default userRoutes;