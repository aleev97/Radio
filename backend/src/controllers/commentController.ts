import { Request, Response } from 'express';
import pool from '../db';

const handleServerError = (res: Response, error: unknown) => {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
};

const CommentController = {
    addComment: async (req: Request, res: Response) => {
        try {
            const { publication_id, user_id, parent_comment_id, content } = req.body;

            if (!publication_id || !user_id || !content) {
                return res.status(400).json({ error: 'Invalid data. Make sure publication_id, user_id, and content are provided.' });
            }

            if (parent_comment_id && isNaN(parent_comment_id)) {
                return res.status(400).json({ error: 'Invalid parent_comment_id' });
            }

            // Obtener el nombre del usuario
            const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [user_id]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            const username = userResult.rows[0].username;

            // Insertar el comentario
            const result = await pool.query(
                `INSERT INTO comments(publication_id, user_id, parent_comment_id, content, username) 
                 VALUES($1, $2, $3, $4, $5) RETURNING *`,
                [publication_id, user_id, parent_comment_id || null, content, username]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            handleServerError(res, error);
        }
    },

    getCommentsForPublication: async (req: Request, res: Response) => {
        try {
            const publicationId = parseInt(req.params.publication_id, 10);

            if (isNaN(publicationId)) {
                return res.status(400).json({ error: 'Invalid publication_id' });
            }

            const result = await pool.query(
                `SELECT c.id, c.publication_id, c.user_id, c.parent_comment_id, c.content, c.created_at, u.username
                 FROM comments c
                 INNER JOIN users u ON c.user_id = u.id
                 WHERE c.publication_id = $1`,
                [publicationId]
            );

            const comments = result.rows;

            // Organizar como árbol
            const commentMap: { [key: number]: any } = {};
            const tree: any[] = [];

            comments.forEach((comment) => {
                commentMap[comment.id] = { ...comment, replies: [] };
            });

            comments.forEach((comment) => {
                if (comment.parent_comment_id) {
                    commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id]);
                } else {
                    tree.push(commentMap[comment.id]);
                }
            });

            res.json(tree);
        } catch (error) {
            handleServerError(res, error);
        }
    },



    editComment: async (req: Request, res: Response) => {
        try {
            const commentId = parseInt(req.params.id, 10);
            const { content } = req.body;

            if (isNaN(commentId)) {
                return res.status(400).json({ error: 'Invalid comment_id' });
            }

            const existingComment = await pool.query(
                'SELECT * FROM comments WHERE id = $1',
                [commentId]
            );

            if (existingComment.rows.length === 0) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            const result = await pool.query(
                'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
                [content, commentId]
            );

            res.json(result.rows[0]);
        } catch (error) {
            handleServerError(res, error);
        }
    },

    deleteComment: async (req: Request, res: Response) => {
        try {
            const commentId = parseInt(req.params.id, 10);

            if (isNaN(commentId)) {
                return res.status(400).json({ error: 'Invalid comment_id' });
            }

            const result = await pool.query(
                'DELETE FROM comments WHERE id = $1 RETURNING *',
                [commentId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Comment not found' });
            } else {
                res.json({ message: 'Comment deleted successfully', deletedComment: result.rows[0] });
            }
        } catch (error) {
            handleServerError(res, error);
        }
    },
};

export default CommentController;