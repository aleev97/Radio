import { Request, Response } from 'express';
import pool from '../db';

const ProgramaController = {
    createPrograma: async (req: Request, res: Response) => {
        try {
            const { titulo, descripcion, administrador_id } = req.body;

            // Validar que los campos requeridos estén presentes
            if (!titulo || !administrador_id) {
                return res.status(400).json({ error: 'Title and administrator ID are required' });
            }

            const newPrograma = {
                titulo,
                descripcion,
                administrador_id
            };

            const result = await pool.query(
                'INSERT INTO programas(titulo, descripcion, administrador_id) VALUES($1, $2, $3) RETURNING *',
                [newPrograma.titulo, newPrograma.descripcion, newPrograma.administrador_id]
            );

            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getProgramas: async (req: Request, res: Response) => {
        try {
            const result = await pool.query('SELECT * FROM programas');
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getProgramaById: async (req: Request, res: Response) => {
        try {
            const programaId = parseInt(req.params.id, 10);
            const result = await pool.query('SELECT * FROM programas WHERE id = $1', [programaId]);

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Programa not found' });
            } else {
                res.json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updatePrograma: async (req: Request, res: Response) => {
        try {
            const programaId = parseInt(req.params.id, 10);
            const { titulo, descripcion } = req.body;

            const updatedPrograma = {
                titulo,
                descripcion
            };

            const result = await pool.query(
                'UPDATE programas SET titulo = $1, descripcion = $2 WHERE id = $3 RETURNING *',
                [updatedPrograma.titulo, updatedPrograma.descripcion, programaId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Programa not found' });
            } else {
                res.json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    deletePrograma: async (req: Request, res: Response) => {
        try {
            const programaId = parseInt(req.params.id, 10);
            const result = await pool.query('DELETE FROM programas WHERE id = $1 RETURNING *', [programaId]);

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Programa not found' });
            } else {
                res.json({ message: 'Programa deleted successfully', deletedPrograma: result.rows[0] });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export default ProgramaController;