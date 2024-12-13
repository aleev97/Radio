import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProgramData, ProgramState } from "../../types";
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Estado inicial
const initialState: ProgramState = {
  loading: false,
  programs: [],
  error: null,
};

// Acción asincrónica para obtener los programas
export const fetchPrograms = createAsyncThunk(
  'program/fetchPrograms',
  async (_, { rejectWithValue }) => {
    try {
      // Obtener el token desde localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró un token.');
      }

      // Realizar la solicitud con axios, incluyendo el token en los encabezados
      const response = await axios.get<ProgramData[]>(`${API_BASE_URL}/programs`, {
        headers: {
          Authorization: `Bearer ${token}`, // Se añade el token en los encabezados
        },
      });
      return response.data;

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error desconocido');
      }
      return rejectWithValue('Error desconocido');
    }
  }
);

const programSlice = createSlice({
  name: 'program',
  initialState,
  reducers: {
    setPrograms: (state, action: PayloadAction<ProgramData[]>) => {
      state.programs = action.payload;
    },
    clearPrograms: (state) => {
      state.programs = [];
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrograms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.loading = false;
        state.programs = action.payload; // Almacenar los programas obtenidos
        state.error = null;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Guardar el error si la petición falla
      });
  }
});

// Exportar las acciones generadas
export const { setPrograms, clearPrograms, setError } = programSlice.actions;

// Reducer por defecto
export default programSlice.reducer;
