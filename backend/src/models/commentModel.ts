export interface Comment {
    id?: number;
    publication_id: number;
    user_id: number;
    parent_comment_id?: number,
    content: string;
    created_at?: Date;
}