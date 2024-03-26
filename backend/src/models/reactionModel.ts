export interface Reaction {
    id?: number;
    publication_id: number;
    user_id: number;
    reaction_type: "me_gusta" | "me_encanta" | "me_interesa" | "me_entristece";
    created_at?: Date;
    programa_id?: number;
}