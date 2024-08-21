export interface Errors {
  [key: string]: string;
}

export interface Reaction {
  id?: number;
  type: string;
  user_id: number;
  publication_id: number;
}

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