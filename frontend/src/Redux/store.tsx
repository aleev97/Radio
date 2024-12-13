import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./Reducers/userReducers";
import programReducer from "./Reducers/programsReducers";

const store = configureStore({
  reducer: {
    user: userReducer,
    program: programReducer, // Asegúrate de que `programReducer` esté correctamente tipado
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
