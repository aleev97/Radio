import jwt, { JwtPayload } from 'jsonwebtoken';

export interface Publication {
    total_reactions: number;
    reactions_count: any;
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