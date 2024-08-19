import express from 'express';
import PublicationController from '../controllers/publicationController';
import AuthMiddleware from '../Middleware/AuthMiddleware';
import multer from 'multer';

const upload = multer(); // Configuración de multer para manejar archivos

const publicationRoutes = express.Router();

// Obtener todas las publicaciones - Público
publicationRoutes.get('/', PublicationController.AllPublications);

// Obtener una publicación por ID - Público (considerar protección si es necesario)
publicationRoutes.get('/:id', PublicationController.PublicationById);

// Crear una publicación - Protegido (autenticación y administrador)
publicationRoutes.post('/', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, upload.single('file'), PublicationController.createPublication);

// Actualizar una publicación - Protegido (autenticación y administrador)
publicationRoutes.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, upload.single('file'), PublicationController.updatePublication);

// Eliminar una publicación - Protegido (autenticación y administrador)
publicationRoutes.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, PublicationController.deletePublication);

export default publicationRoutes;