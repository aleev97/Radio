import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, JsonWebTokenError, TokenExpiredError, JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

interface AuthMiddleware {
  authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
  comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
  generateToken(payload: any): string;
  isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
}

const AuthMiddleware: AuthMiddleware = {
  async authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Missing Token' });
    }

    try {
      const decodedToken: JwtPayload = jwt.verify(token, process.env.SECRET_KEY as Secret) as JwtPayload;

      req.user = decodedToken;
      
      // Añadir la verificación de si el usuario es administrador
      AuthMiddleware.isAdmin(req, res, next);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return res.status(401).json({ error: 'Unauthorized - Token Expired' });
      } else if (error instanceof JsonWebTokenError) {
        return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
      }

      console.error(error);
      res.status(401).json({ error: 'Unauthorized' });
    }
  },

  async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainTextPassword, hashedPassword);
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  generateToken(payload: any): string {
    const secretKey = process.env.SECRET_KEY as Secret;

    if (!secretKey) {
      throw new Error('Secret key is not defined');
    }

    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
  },

  isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Lógica para verificar si el usuario es administrador
    if (!req.user?.isadmin) {
      return res.status(403).json({ error: 'Forbidden - User is not an administrator' });
    }

    next();
  },
};

export default AuthMiddleware;