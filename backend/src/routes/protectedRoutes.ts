// En el archivo protectedRoutes.ts
import express, { Request } from 'express'; // Importamos la interfaz Request
import AuthMiddleware from '../Middleware/AuthMiddleware';

const router = express.Router();

// Ruta protegida que solo los usuarios autenticados pueden acceder
router.get('/resource', (req: Request, res, next) => { // Usamos la interfaz Request estándar
  // Llamamos al middleware de autenticación antes de manejar la solicitud
  AuthMiddleware.authenticate(req as any, res, next);
}, (req, res) => {
  try {
    // Acceso autorizado
    res.status(200).json({ message: 'Access granted to protected resource', user: (req as any).user });
  } catch (error) {
    console.error('Error accessing protected resource:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;