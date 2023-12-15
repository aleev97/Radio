import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcrypt';
import AuthMiddleware from '../Middleware/AuthMiddleware';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  isadmin?: boolean;
  reset_token?: string;
  reset_token_expires?: Date;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const generateResetToken = (user: User): string =>
  jwt.sign({ userId: user.id }, process.env.SECRET_KEY as Secret, { expiresIn: '1h' });

const verifyResetToken = (resetToken: string): { userId: number } | null => {
  try {
    return jwt.verify(resetToken, process.env.SECRET_KEY as Secret) as { userId: number };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, 
      subject: 'Restablecimiento de contraseña',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: http://radio.com/reset-password?token=${resetToken}`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Correo electrónico de restablecimiento enviado:', info.response);
  } catch (error) {
    console.error('Error al enviar el correo electrónico de restablecimiento:', error);
  }
};

const handleServerError = (res: Response, error: any) => {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
};

const UserController = {
  createUser: async (req: Request, res: Response) => {
    try {
      const { username, password, email, isadmin } = req.body;

      if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password, and email are required' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: User = {
        username,
        password: hashedPassword,
        email,
        isadmin: isadmin || false,
      };

      const result = await pool.query(
        'INSERT INTO users(username, password, email, isadmin) VALUES($1, $2, $3, $4) RETURNING *',
        [newUser.username, newUser.password, newUser.email, newUser.isadmin]
      );

      res.json(result.rows[0]);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  loginUser: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user: User = result.rows[0];
      const passwordMatch = await AuthMiddleware.comparePasswords(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = AuthMiddleware.generateToken({ id: user.id, username: user.username, isadmin: user.isadmin });
      res.json({ token });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  getUsers: async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.json(result.rows);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  getUserById: async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      handleServerError(res, error);
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const username = req.params.username || req.body.username;
      const { password, email, isadmin } = req.body;

      const hashedPassword = password ? await bcrypt.hash(password, 10) : '';

      const updatedUser: User = {
        username,
        password: hashedPassword,
        email,
        isadmin: isadmin || false,
      };

      const result = await pool.query(
        'UPDATE users SET username = $1, password = $2, email = $3, isadmin = $4 WHERE id = $5 OR username = $6 RETURNING *',
        [updatedUser.username, updatedUser.password, updatedUser.email, updatedUser.isadmin, userId, username]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      handleServerError(res, error);
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const username = req.params.username;

      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 OR username = $2 RETURNING *',
        [userId, username]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json({ message: 'User deleted successfully', deletedUser: result.rows[0] });
      }
    } catch (error) {
      handleServerError(res, error);
    }
  },

  searchUsersByName: async (req: Request, res: Response) => {
    try {
      const searchName = req.params.name.toLowerCase();
      const result = await pool.query('SELECT * FROM users WHERE LOWER(username) LIKE $1', [`%${searchName}%`]);
      res.json(result.rows);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  requestPasswordReset: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if (user.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const resetToken = generateResetToken(user.rows[0]);
      const resetTokenExpires = new Date(Date.now() + 3600000); // Token expira en 1 hora

      await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
        [resetToken, resetTokenExpires, user.rows[0].id]
      );

      sendPasswordResetEmail(user.rows[0].email, resetToken);

      res.json({ message: 'Password reset token sent successfully' });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
      const { resetToken, newPassword } = req.body;
      const decodedToken = verifyResetToken(resetToken);

      if (!decodedToken) {
        return res.status(401).json({ error: 'Invalid reset token' });
      }

      const userId = decodedToken.userId;

      const user = await pool.query('SELECT * FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expires > NOW()', [userId, resetToken]);

      if (user.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid or expired reset token' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query(
        'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
        [hashedPassword, userId]
      );

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

export default UserController;