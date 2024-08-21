import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface Publication {
    total_reactions: number;
    reactions_count: Record<string, number>;
    user_id: number;
    content: string;
    file_paths: string[];
    programa_id: number;
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
    type: string;
    user_id: number;
    publication_id: number;
}