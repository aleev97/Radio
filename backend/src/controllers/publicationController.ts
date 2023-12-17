import { Request, Response } from "express";
import pool from '../db';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PublicationController = {
    createPublication: async (req: Request, res: Response) => {
        try {
            const { user_id, content } = req.body;
            const file = req.file;

            const newPublication = {
                user_id,
                content,
                media_url: [] as string[],
            };

            if (file) {
                const fileBuffer = file.buffer;
                const media_url = `/uploads/${file.originalname}`;
                newPublication.media_url.push(media_url);
            }

            const result = await pool.query(
                'INSERT INTO publications(user_id, content, media_url) VALUES($1, $2, $3) RETURNING *',
                [newPublication.user_id, newPublication.content, newPublication.media_url]
            );

            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updatePublication: async (req: Request, res: Response) => {
        try {
            const publicationId = parseInt(req.params.id, 10);
            const { content } = req.body;
            const file = req.file;

            const existingPublication = await pool.query(
                'SELECT * FROM publications WHERE id = $1',
                [publicationId]
            );

            if (existingPublication.rows.length === 0) {
                return res.status(404).json({ error: 'Publication not found' });
            }

            const updatePublication = {
                content,
                media_url: existingPublication.rows[0].media_url as string[],
            };

            if (file) {
                const fileBuffer = file.buffer;
                const newMediaUrl = `/uploads/${file.originalname}`;
                updatePublication.media_url = [newMediaUrl];
            }

            const result = await pool.query(
                'UPDATE publications SET content = $1, media_url = $2 WHERE id = $3 RETURNING *',
                [updatePublication.content, updatePublication.media_url, publicationId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Publication not found' });
            } else {
                res.json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    deletePublication: async (req: Request, res: Response) => {
        try {
            const publicationId = parseInt(req.params.id, 10);

            const result = await pool.query(
                'DELETE FROM publications WHERE id = $1 RETURNING *',
                [publicationId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Publication not found' });
            } else {
                res.json({ message: 'Publication deleted successfully', deletePublication: result.rows[0] });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

export default PublicationController;