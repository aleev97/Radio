import { Dispatch } from "redux";
import axios from "axios";
import { FETCH_PROGRAMS_REQUEST, FETCH_PROGRAMS_SUCCESS, FETCH_PROGRAMS_FAILURE } from "../../components/Programs/constants/programConstants";
import { FetchProgramsRequestAction, FetchProgramsSuccessAction, FetchProgramsFailureAction } from "../../types";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || ''; // Asegúrate de que la URL de la API esté correctamente definida

export type ProgramActions =
  | FetchProgramsRequestAction
  | FetchProgramsSuccessAction
  | FetchProgramsFailureAction;

export const fetchPrograms = () => async (dispatch: Dispatch<ProgramActions>) => {
  dispatch({ type: FETCH_PROGRAMS_REQUEST }); // Acción de solicitud para indicar que estamos cargando programas

  try {
    // Obtener el token de localStorage
    const token = localStorage.getItem("token");

    // Verificar si el token existe
    if (!token) {
      throw new Error("No se encontró un token.");
    }

    // Realizar la solicitud usando axios con el token en los encabezados
    const response = await axios.get(`${API_BASE_URL}/programs`, {
      headers: {
        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
      },
    });

    // Disparar la acción de éxito con los datos obtenidos
    dispatch({
      type: FETCH_PROGRAMS_SUCCESS,
      payload: response.data.programs, // Aquí asumimos que response.data tiene un array de programas
    });
  } catch (error) {
    // Si hay un error, disparar la acción de fallo con el mensaje de error
    dispatch({
      type: FETCH_PROGRAMS_FAILURE,
      payload: error instanceof Error ? error.message : "Error desconocido", // Manejo del error como string
    });
  }
};