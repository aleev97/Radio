export interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  isadmin?: boolean;
  reset_token?: string;
  reset_token_expires?: Date;
} 