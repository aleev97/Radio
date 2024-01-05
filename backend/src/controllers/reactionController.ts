import { Request, Response } from "express";
import pool from '../db';

const validReactionTypes = ['Me gusta', 'Me encanta', 'Me interesa', 'Me entristece'];

const ReactionController = {
    addReaction: async (req: Request, res: Response) => {
        try {
            const { publication_id, user_id, reaction_type } = req.body;

            // Validar datos
            if (!publication_id || !user_id || !reaction_type || !validReactionTypes.includes(reaction_type)) {
                return res.status(400).json({ error: 'Invalid data. Make sure publication_id, user_id, and a valid reaction_type are provided.' });
            }

            // Verificar si la reacción ya existe
            const existingReaction = await pool.query(
                'SELECT * FROM reactions WHERE publication_id = $1 AND user_id = $2 AND reaction_type = $3',
                [publication_id, user_id, reaction_type]
            );

            if (existingReaction.rows.length > 0) {
                return res.status(400).json({ error: 'This reaction already exists.' });
            }

            // Agregar la nueva reacción
            const result = await pool.query(
                'INSERT INTO reactions(publication_id, user_id, reaction_type) VALUES($1, $2, $3) RETURNING *',
                [publication_id, user_id, reaction_type]
            );

            res.json(result.rows[0]);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    removeReaction: async (req: Request, res: Response) => {
        try {
            const { publication_id, user_id, reaction_type } = req.body;

            // Validar datos
            if (!publication_id || !user_id || !reaction_type || !validReactionTypes.includes(reaction_type)) {
                return res.status(400).json({ error: 'Invalid data. Make sure publication_id, user_id, and a valid reaction_type are provided.' });
            }

            // Eliminar la reacción
            const result = await pool.query(
                'DELETE FROM reactions WHERE publication_id = $1 AND user_id = $2 AND reaction_type = $3 RETURNING *',
                [publication_id, user_id, reaction_type]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Reaction not found.' });
            }

            res.json(result.rows[0]);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export default ReactionController;
