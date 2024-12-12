import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RegisterForm, LoginForm, UserState } from "../../types";
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Estado inicial
const initialState: UserState = {
  registerForm: { username: "", email: "", password: "", isadmin: false },
  loginForm: { username: "", password: "" },
  message: "",
  isAuthenticated: false,
  token: null,
  authError: null,
  userData: null,
  loading: false,
};

// Crear acción asincrónica para el registro
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (registerForm: RegisterForm, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/register`, registerForm);
      return response.data; // Asegúrate que la respuesta contiene token y userData
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error desconocido');
      }
      return rejectWithValue('Error desconocido');
    }
  }
);

// Crear acción asincrónica para el inicio de sesión
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (loginForm: LoginForm, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, loginForm);
      return response.data; // Asegúrate que la respuesta contiene token y userData
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error desconocido');
      }
      return rejectWithValue('Error desconocido');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setRegisterForm: (state, action: PayloadAction<RegisterForm>) => {
      state.registerForm = action.payload;
    },
    setLoginForm: (state, action: PayloadAction<LoginForm>) => {
      state.loginForm = action.payload;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    clearForm: (state, action: PayloadAction<"login" | "register">) => {
      if (action.payload === "login") {
        state.loginForm = { username: "", password: "" };
      } else {
        state.registerForm = { username: "", email: "", password: "", isadmin: false };
      }
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setLogout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.authError = null;
      state.userData = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.authError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.userData = action.payload.userData;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.authError = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.userData = action.payload.userData;
        localStorage.setItem('authToken', action.payload.token); // Store token on successful login
      })      
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.authError = action.payload as string;
      });
  }
});

export const {
  setRegisterForm,
  setLoginForm,
  setMessage,
  clearForm,
  setAuthenticated,
  setToken,
  setLogout,
  setAuthError
} = userSlice.actions;

export default userSlice.reducer;