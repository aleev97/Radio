import express from 'express';
import ReactionController from '../controllers/reactionController';

const reactionRoutes = express.Router();

// Agregar una reacción
reactionRoutes.post('/', ReactionController.addReaction);

// Eliminar una reacción
reactionRoutes.delete('/:id', ReactionController.removeReaction);

// Actualizar reacciones de una publicación
reactionRoutes.put('/publications/:id/reactions', ReactionController.updatePublicationReactions);

export default reactionRoutes;