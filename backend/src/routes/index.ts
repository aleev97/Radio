import express from 'express';
import userRoutes from './userRoutes';

const router = express.Router();

router.use('/users', userRoutes);

// Manejo de rutas no encontradas
router.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default router; 