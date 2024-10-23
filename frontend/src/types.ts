export interface Errors {
  [key: string]: string;
}

export interface Reaction {
  id?: number;
  reaction_type: string;
  user_id: number;
  publication_id: number;
  username: string;
}

export interface Comment {
  id?: number;
  publication_id: number;
  user_id: number;
  username?: string; // Nueva propiedad para almacenar el nombre de usuario
  parent_comment_id?: number;
  content: string;
  created_at?: Date;
  programa_id?: number;
}

export interface Publication {
  comments?: Comment[];
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

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  isadmin: boolean;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface UserData {
  username: string;
  email: string;
  isadmin: boolean;
}

export interface NavBarProps {
  isLoggedIn: boolean;
}

export interface ProgramData {
  id: number;
  titulo: string;
  descripcion: string;
  image: string;
  schedule: string;
}

export interface ProgramListProps {
  programs: ProgramData[];
}

export interface ProgramDetailsProps {
  program: ProgramData;
}

export interface ValidateParams {
  username: string;
  email?: string;
  password: string;
}