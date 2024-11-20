export interface Comment {
    id?: number;
    publication_id: number;
    user_id: number;
    username?: string;
    parent_comment_id?: number;
    content: string;
    created_at?: Date;
    programa_id?: number;
}