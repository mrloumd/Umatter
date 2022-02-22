import { createSlice } from "@reduxjs/toolkit";

export const facilitatorSlice = createSlice({
    name: "facilitator",
    initialState: {
        isLoggedIn: localStorage.getItem("token") ? true : false,
        user: JSON.parse(localStorage.getItem("user")),
        error: null,
    },
    reducers: {
        facilitatorLoginAction: (state, action) => {
            state.isLoggedIn = true;
            state.user = action.payload;
        },
        facilitatorLogoutAction: (state, action) => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            state.isLoggedIn = false;
            state.user = {};
        }
    }
});

export const { facilitatorLoginAction,facilitatorLogoutAction } = facilitatorSlice.actions;
export default facilitatorSlice.reducer;