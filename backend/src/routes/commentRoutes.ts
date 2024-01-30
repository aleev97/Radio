import express from 'express';
import CommentController from '../controllers/commentController';

const commentRoutes = express.Router();

commentRoutes.post('/', CommentController.addComment);
commentRoutes.get('/:id', CommentController.getCommentsForPublication);
commentRoutes.put('/:id', CommentController.editComment);
commentRoutes.delete('/:id', CommentController.deleteComment);

export default commentRoutes;