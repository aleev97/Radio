import express, { Request, Response } from 'express';
import AuthMiddleware from '../Middleware/AuthMiddleware';

const router = express.Router();

// Ruta protegida que solo los usuarios autenticados pueden acceder
router.get('/resource', AuthMiddleware.authenticate, (req: Request, res: Response) => {
  try {
    // Acceso autorizado, el usuario está autenticado
    res.status(200).json({ message: 'Access granted to protected resource', user: (req as any).user });
  } catch (error) {
    console.error('Error accessing protected resource:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ruta que solo los administradores pueden acceder
router.get('/admin/resource', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, (req: Request, res: Response) => {
  try {
    // Acceso autorizado solo para administradores
    res.status(200).json({ message: 'Access granted to admin resource', user: (req as any).user });
  } catch (error) {
    console.error('Error accessing admin resource:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;