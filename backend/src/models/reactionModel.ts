export interface Reaction {
    id?: number;
    publication_id: number;
    user_id: number;
    reaction_type: "me_gusta" | "me_encanta" | "me_interesa" | "me_entristece";
    programa_id?: number;
    created_at?: Date;
}