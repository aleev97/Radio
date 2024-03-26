import express from 'express';
import ProgramaController from '../controllers/programsControllers';
import AuthMiddleware from '../Middleware/AuthMiddleware';

const programsRoutes = express.Router();

// Middleware de autenticación para proteger las rutas de creación y eliminación de programas
programsRoutes.use(AuthMiddleware.authenticate);

// Rutas para CRUD de programas
programsRoutes.post('/', AuthMiddleware.isAdmin, ProgramaController.createPrograma);
programsRoutes.delete('/:id', AuthMiddleware.isAdmin, ProgramaController.deletePrograma);
programsRoutes.get('/', ProgramaController.getProgramas);
programsRoutes.get('/:id', ProgramaController.getProgramaById);
programsRoutes.put('/:id', ProgramaController.updatePrograma);

export default programsRoutes;