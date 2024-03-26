import { Reaction } from "./reactionModel";
export interface Publication {
    id?: number;
    content: string;
    user_id: number;
    file_paths: string[];
    created_at?: Date;
    reactions?: Reaction[];
    total_reactions?: number;
    reactions_count?: { [key: string]: number };
    programa_id?: number;
}