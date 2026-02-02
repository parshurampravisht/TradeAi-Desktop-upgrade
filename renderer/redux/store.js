import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice"; // Ensure this path is correct

const store = configureStore({
  reducer: {
    auth: authReducer, // Ensure this matches the slice name
  },
});

export default store;
