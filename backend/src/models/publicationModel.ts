export interface Publication {
    id?: number;
    content: string;
    user_id: number;
    file_paths: string[];
    created_at?: Date;
}