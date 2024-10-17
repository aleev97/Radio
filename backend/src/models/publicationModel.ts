import { Reaction } from "./reactionModel";

export interface Publication {
    id?: number;
    content: string;
    user_id: number;
    username: string; // Nueva propiedad para almacenar el nombre de usuario
    file_paths: string[];
    created_at?: Date;
    reactions?: Reaction[];
    total_reactions?: number;
    reactions_count?: { [key: string]: number };
    programa_id?: number;
}