import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const decoded = jwtDecode(token);

        if (!decoded.exp) return true;

        return decoded.exp * 1000 < Date.now();
    } catch (err) {
        return true;
    }
};

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
};