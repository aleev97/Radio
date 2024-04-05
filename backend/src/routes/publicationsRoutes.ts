import express from 'express';
import PublicationController from '../controllers/publicationController';
import AuthMiddleware from '../Middleware/AuthMiddleware';
import multer from 'multer';

const upload = multer();

const publicationRoutes = express.Router();

// Rutas protegidas por administradores
publicationRoutes.get('/', PublicationController.AllPublications);
publicationRoutes.get('/:id', PublicationController.PublicationById);
publicationRoutes.post('/', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, upload.single('file'), PublicationController.createPublication);
publicationRoutes.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, upload.single('file'), PublicationController.updatePublication);
publicationRoutes.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, PublicationController.deletePublication);

export default publicationRoutes;