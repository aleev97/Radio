import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./Reducers/userReducers"; // Assuming this is the correct file for the user reducer

const store = configureStore({
  reducer: {
    user: userReducer,  // Use the default export as the reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;