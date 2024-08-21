import { Request, Response } from "express";
import pool from '../db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Publication } from "../types";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PublicationController = {
    createPublication: async (req: Request, res: Response) => {
        try {
            const { user_id, content, programa_id } = req.body;
            const file = req.file;

            // Validación de campos obligatorios (User ID, Contenido y Program ID)
            if (!user_id || !content || !programa_id) {
                return res.status(400).json({ error: 'User ID, content, and program ID are required' });
            }

            // Verificar si el usuario es un administrador
            const isAdminQuery = await pool.query('SELECT isadmin FROM users WHERE id = $1', [user_id]);
            const isAdmin = isAdminQuery.rows[0].isadmin;

            if (!isAdmin) {
                return res.status(403).json({ error: 'Only administrators can create publications' });
            }

            // Verificar si el programa existe
            const programResult = await pool.query('SELECT * FROM programas WHERE id = $1', [programa_id]);
            if (programResult.rows.length === 0) {
                return res.status(404).json({ error: 'Program not found' });
            }

            const newPublication: Publication = {
                user_id,
                content,
                file_paths: [],
                total_reactions: 0,
                reactions_count: {},
                programa_id
            };

            // Si se proporciona un archivo, manejarlo

            if (file) {
                const fileBuffer = file.buffer;
                const media_url = `/uploads/${file.originalname}`;
                newPublication.file_paths.push(media_url);

                // Guardar la imagen en el sistema de archivos
                const uploadPath = path.join(__dirname, '../uploads', file.originalname);
                fs.writeFileSync(uploadPath, fileBuffer);
            }

            const result = await pool.query(
                'INSERT INTO publications(user_id, content, file_paths, programa_id) VALUES($1, $2, $3, $4) RETURNING *',
                [newPublication.user_id, newPublication.content, newPublication.file_paths, newPublication.programa_id]
            );

            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    PublicationsByProgramId: async (req: Request, res: Response) => {
        try {
            const programId = parseInt(req.params.programId, 10);
            const result = await pool.query('SELECT * FROM publications WHERE programa_id = $1', [programId]);

            // Mapear cada publicación y cargar las reacciones y comentarios correspondientes
            const publicationsWithDetails = await Promise.all(result.rows.map(async (publication) => {
                const reactionsResult = await pool.query('SELECT * FROM reactions WHERE publication_id = $1', [publication.id]);
                const commentsResult = await pool.query('SELECT * FROM comments WHERE publication_id = $1', [publication.id]);

                publication.reactions = reactionsResult.rows;
                publication.total_reactions = reactionsResult.rows.length;

                publication.comments = commentsResult.rows;
                publication.total_comments = commentsResult.rows.length;

                return publication;
            }));

            res.json(publicationsWithDetails);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }, 

    PublicationsByProgram: async (req: Request, res: Response) => {
        try {
            const { programId } = req.params;

            // Obtener publicaciones por programa_id
            const result = await pool.query(
                'SELECT * FROM publications WHERE programa_id = $1',
                [programId]
            );

            // Mapear cada publicación y cargar las reacciones y comentarios correspondientes
            const publicationsWithDetails = await Promise.all(result.rows.map(async (publication) => {
                const reactionsResult = await pool.query('SELECT * FROM reactions WHERE publication_id = $1', [publication.id]);
                const commentsResult = await pool.query('SELECT * FROM comments WHERE publication_id = $1', [publication.id]);

                publication.reactions = reactionsResult.rows;
                publication.total_reactions = reactionsResult.rows.length;

                publication.comments = commentsResult.rows;
                publication.total_comments = commentsResult.rows.length;

                return publication;
            }));

            res.json(publicationsWithDetails);
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

            const updatePublication: Publication = {
                content,
                file_paths: existingPublication.rows[0].file_paths as string[],
                user_id: 0,
                total_reactions: 0,
                reactions_count: {},
                programa_id: 0
            };

            let originalMediaUrls: string[] = [];
            if (file) {
                originalMediaUrls = [...updatePublication.file_paths];
                const fileBuffer = file.buffer;
                const newMediaUrl = `/uploads/${file.originalname}`;
                updatePublication.file_paths = [newMediaUrl];

                const uploadPath = path.join(__dirname, '../uploads', file.originalname);
                fs.writeFileSync(uploadPath, fileBuffer);
            }

            const result = await pool.query(
                'UPDATE publications SET content = $1, file_paths = $2 WHERE id = $3 RETURNING *',
                [updatePublication.content, updatePublication.file_paths, publicationId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Publication not found' });
            } else {
                originalMediaUrls.forEach((originalMediaUrl) => {
                    if (!updatePublication.file_paths.includes(originalMediaUrl)) {
                        const fullPath = path.join(__dirname, '../uploads', path.basename(originalMediaUrl));
                        fs.existsSync(fullPath) && fs.unlinkSync(fullPath);
                    }
                });

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
                const mediaUrls = result.rows[0].file_paths as string[];

                mediaUrls.forEach((mediaUrl) => {
                    const fullPath = path.join(__dirname, '../uploads', path.basename(mediaUrl));
                    fs.existsSync(fullPath) && fs.unlinkSync(fullPath);
                });

                res.json({ message: 'Publication deleted successfully', deletePublication: result.rows[0] });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    PublicationById: async (req: Request, res: Response) => {
        try {
            const publicationId = parseInt(req.params.id, 10);

            const publicationResult = await pool.query('SELECT * FROM publications WHERE id = $1', [publicationId]);

            if (publicationResult.rows.length === 0) {
                res.status(404).json({ error: 'Publication not found' });
                return;
            }

            const publication = publicationResult.rows[0];

            // Obtener las reacciones asociadas a la publicación
            const reactionsResult = await pool.query('SELECT * FROM reactions WHERE publication_id = $1', [publicationId]);
            publication.reactions = reactionsResult.rows;
            publication.total_reactions = reactionsResult.rows.length;

            // Obtener los comentarios asociados a la publicación
            const commentsResult = await pool.query('SELECT * FROM comments WHERE publication_id = $1', [publicationId]);
            publication.comments = commentsResult.rows;
            publication.total_comments = commentsResult.rows.length;

            res.json(publication);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    AllPublications: async (req: Request, res: Response) => {
        try {
            const result = await pool.query('SELECT * FROM publications');

            // Mapear cada publicación y cargar las reacciones y comentarios correspondientes
            const publicationsWithDetails = await Promise.all(result.rows.map(async (publication) => {
                const reactionsResult = await pool.query('SELECT * FROM reactions WHERE publication_id = $1', [publication.id]);
                const commentsResult = await pool.query('SELECT * FROM comments WHERE publication_id = $1', [publication.id]);

                publication.reactions = reactionsResult.rows;
                publication.total_reactions = reactionsResult.rows.length;

                publication.comments = commentsResult.rows;
                publication.total_comments = commentsResult.rows.length;

                return publication;
            }));

            res.json(publicationsWithDetails);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

export default PublicationController;