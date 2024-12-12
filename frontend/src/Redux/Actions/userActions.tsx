import { createAsyncThunk } from '@reduxjs/toolkit';
import { RegisterForm, LoginForm } from "../../types";
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Acción asincrónica para el registro del usuario
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (registerForm: RegisterForm, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/register`, registerForm);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error desconocido');
      }
      return rejectWithValue('Error desconocido');
    }
  }
);

// Acción asincrónica para el inicio de sesión
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (loginForm: LoginForm, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, loginForm);
      const token = response.data.token;
      localStorage.setItem('token', token)
      return { ...response.data, token }; // Devuelve el token junto con otros datos
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error desconocido');
      }
      return rejectWithValue('Error desconocido');
    }
  }
);

// Acción para manejar los datos del formulario de registro
export const setRegisterForm = (form: RegisterForm) => ({
  type: 'user/setRegisterForm',
  payload: form,
});

// Acción para manejar los datos del formulario de inicio de sesión
export const setLoginForm = (form: LoginForm) => ({
  type: 'user/setLoginForm',
  payload: form,
});

// Acción para establecer un mensaje en el estado (por ejemplo, mensajes de error)
export const setMessage = (message: string) => ({
    type: "SET_MESSAGE",
    payload: message
  });

// Acción para limpiar los formularios (login o registro)
export const clearForm = (formType: "login" | "register") => ({
  type: 'user/clearForm',
  payload: formType,
});

// Acción para establecer el estado de autenticación
export const setAuthenticated = (isAuthenticated: boolean) => ({
  type: "SET_AUTHENTICATED",
  payload: isAuthenticated,
});

// Acción para establecer el token en el estado
export const setToken = (token: string) => ({
  type: "SET_TOKEN",
  payload: token,
});

// Acción para manejar el cierre de sesión
export const setLogout = () => ({
  type: "SET_LOGOUT",
});

// Acción para manejar errores de autenticación
export const setAuthError = (error: string) => ({
  type: "SET_AUTH_ERROR",
  payload: error,
});
