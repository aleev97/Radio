import { Request, Response } from "express";
import pool from '../db';

const validReactionTypes = ['Me gusta', 'Me encanta', 'Me interesa', 'Me entristece'];

const ReactionController = {
    addReaction: async (req: Request, res: Response) => {
        try {
            const { publication_id, user_id, reaction_type, programa_id } = req.body;

            if (!publication_id || !user_id || !reaction_type || !programa_id || !validReactionTypes.includes(reaction_type)) {
                return res.status(400).json({ error: 'Invalid data. Ensure publication_id, user_id, programa_id, and a valid reaction_type are provided.' });
            }

            const existingReaction = await pool.query(
                'SELECT * FROM reactions WHERE publication_id = $1 AND user_id = $2 AND reaction_type = $3 AND programa_id = $4',
                [publication_id, user_id, reaction_type, programa_id]
            );

            if (existingReaction.rows.length > 0) {
                return res.status(400).json({ error: 'This reaction already exists.' });
            }

            const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [user_id]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const username = userResult.rows[0].username;

            const result = await pool.query(
                `INSERT INTO reactions (publication_id, user_id, reaction_type, programa_id, username) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING id, publication_id, user_id, reaction_type, programa_id, username`,
                [publication_id, user_id, reaction_type, programa_id, username]
            );

            await ReactionController.updatePublicationReactions(publication_id);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            ReactionController.handleServerError(res, error);
        }
    },

    removeReaction: async (req: Request, res: Response) => {
        try {
            const { publication_id, user_id, reaction_type, programa_id } = req.body;

            if (!publication_id || !user_id || !reaction_type || !programa_id || !validReactionTypes.includes(reaction_type)) {
                return res.status(400).json({ error: 'Invalid data. Ensure publication_id, user_id, programa_id, and a valid reaction_type are provided.' });
            }

            const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [user_id]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const username = userResult.rows[0].username;

            const result = await pool.query(
                `DELETE FROM reactions 
                 WHERE publication_id = $1 AND user_id = $2 AND reaction_type = $3 AND programa_id = $4 
                 RETURNING id, publication_id, user_id, reaction_type, programa_id, username`,
                [publication_id, user_id, reaction_type, programa_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Reaction not found.' });
            }

            await ReactionController.updatePublicationReactions(publication_id);

            res.json(result.rows[0]);
        } catch (error) {
            ReactionController.handleServerError(res, error);
        }
    },

    updatePublicationReactions: async (publication_id: number) => {
        try {
            const [totalReactionsResult, reactionsCountResult] = await Promise.all([
                pool.query('SELECT COUNT(*) as total_reactions FROM reactions WHERE publication_id = $1', [publication_id]),
                pool.query('SELECT reaction_type, COUNT(*) as count FROM reactions WHERE publication_id = $1 GROUP BY reaction_type', [publication_id]),
            ]);

            const totalReactions = parseInt(totalReactionsResult.rows[0].total_reactions);
            const reactionsCount = reactionsCountResult.rows.reduce((acc: { [key: string]: number }, row) => {
                acc[row.reaction_type] = parseInt(row.count);
                return acc;
            }, {});

            await pool.query(
                'UPDATE publications SET total_reactions = $1, reactions_count = $2 WHERE id = $3',
                [totalReactions, JSON.stringify(reactionsCount), publication_id]
            );
        } catch (error) {
            console.error('Error updating publication reactions:', error);
        }
    },

    handleServerError: (res: Response, error: any) => {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default ReactionController;
