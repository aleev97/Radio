import express from 'express';
import ReactionController from '../controllers/reactionController';

const reactionRoutes = express.Router();

reactionRoutes.post('/', ReactionController.addReaction);
reactionRoutes.delete('/:id', ReactionController.removeReaction);

export default reactionRoutes;