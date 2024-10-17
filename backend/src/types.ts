import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface Publication {
    id?: number;                // Agregar un id para la publicación
    total_reactions: number;
    reactions_count: Record<string, number>;
    user_id: number;
    username: string;           // Nueva propiedad para almacenar el nombre de usuario
    content: string;
    file_paths: string[];
    created_at?: Date;          // Puede ser útil para mantener un registro
    programa_id?: number;       // También es opcional
}


export interface User {
    id?: number;
    username: string;
    password: string;
    email: string;
    isadmin?: boolean;
    reset_token?: string;
    reset_token_expires?: Date;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export interface Reaction {
    id?: number;
    type: string;               // Asegúrate de que esto coincida con los tipos permitidos
    user_id: number;
    username: string;           // Nueva propiedad para almacenar el nombre de usuario
    publication_id: number;
    created_at?: Date;          // Opcional para el seguimiento
}
