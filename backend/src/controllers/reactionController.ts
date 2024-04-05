import { Request, Response } from "express";
import pool from '../db';

const validReactionTypes = ['Me gusta', 'Me encanta', 'Me interesa', 'Me entristece'];

const ReactionController = {
    addReaction: async (req: Request, res: Response) => {
        try {
            const { publication_id, user_id, reaction_type, programa_id } = req.body;

            // Validar datos
            if (!publication_id || !user_id || !reaction_type || !programa_id || !validReactionTypes.includes(reaction_type)) {
                return res.status(400).json({ error: 'Invalid data. Make sure publication_id, user_id, and a valid reaction_type are provided.' });
            }

            // Verificar si la reacción ya existe
            const existingReaction = await pool.query(
                'SELECT * FROM reactions WHERE publication_id = $1 AND user_id = $2 AND reaction_type = $3 AND programa_id =$4',
                [publication_id, user_id, reaction_type, programa_id]
            );

            if (existingReaction.rows.length > 0) {
                return res.status(400).json({ error: 'This reaction already exists.' });
            }

            // Agregar la nueva reacción
            const result = await pool.query(
                'INSERT INTO reactions(publication_id, user_id, reaction_type, programa_id) VALUES($1, $2, $3, $4) RETURNING *',
                [publication_id, user_id, reaction_type, programa_id]
            );

            // Actualizar la publicación con las nuevas estadísticas de reacciones
            await ReactionController.updatePublicationReactions(publication_id);

            res.json(result.rows[0]);

        } catch (error) {
            ReactionController.handleServerError(res, error);
        }
    },

    removeReaction: async (req: Request, res: Response) => {
        try {
            const { publication_id, user_id, reaction_type, programa_id } = req.body;

            // Validar datos
            if (!publication_id || !user_id || !reaction_type || !programa_id || !validReactionTypes.includes(reaction_type)) {
                return res.status(400).json({ error: 'Invalid data. Make sure publication_id, user_id, and a valid reaction_type are provided.' });
            }

            // Eliminar la reacción
            const result = await pool.query(
                'DELETE FROM reactions WHERE publication_id = $1 AND user_id = $2 AND reaction_type = $3 AND programa_id = $4 RETURNING *',
                [publication_id, user_id, reaction_type, programa_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Reaction not found.' });
            }

            // Actualizar la publicación con las nuevas estadísticas de reacciones
            await ReactionController.updatePublicationReactions(publication_id);

            res.json(result.rows[0]);

        } catch (error) {
            ReactionController.handleServerError(res, error);
        }
    },

    updatePublicationReactions: async (publication_id: number) => {
        try {
            // Obtener la cantidad total de reacciones y el desglose por tipo de reacción
            const [totalReactionsResult, reactionsCountResult] = await Promise.all([
                pool.query('SELECT COUNT(*) as total_reactions FROM reactions WHERE publication_id = $1', [publication_id]),
                pool.query('SELECT reaction_type, COUNT(*) as count FROM reactions WHERE publication_id = $1 GROUP BY reaction_type', [publication_id]),
            ]);

            const totalReactions = parseInt(totalReactionsResult.rows[0].total_reactions);
            const reactionsCount = reactionsCountResult.rows.reduce((acc: { [key: string]: number }, row) => {
                acc[row.reaction_type] = parseInt(row.count);
                return acc;
            }, {});

            // Actualizar la publicación con las nuevas estadísticas de reacciones
            await pool.query(
                'UPDATE publications SET total_reactions = $1, reactions_count = $2 WHERE id = $3',
                [totalReactions, reactionsCount, publication_id]
            );
        } catch (error) {
            console.error(error);
        }
    },

    handleServerError: (res: Response, error: any) => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default ReactionController;