export interface Errors {
    [key: string]: string;
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