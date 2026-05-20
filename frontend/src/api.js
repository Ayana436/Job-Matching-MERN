import axios from "axios";
import { isTokenExpired, logoutUser } from "./utils/auth";

const API = axios.create({
    baseURL: "http://localhost:5000",

    headers: {
        "Cache-Control":"no-cache",
        Pragma: "no-cache",
        Expires: "0"
    }
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");

    if (token) {
        if (isTokenExpired(token)){
            logoutUser();
            return Promise.reject("Token expired");
        }
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
}, (error) => Promise.reject(error)
);

API.interceptors.response.use((response) => response,
(error) =>{
    if (error.response?.status === 401) {
        logoutUser();
    }
    return Promise.reject(error);
}
);

// API.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// }, (error) => Promise.reject(error)
// );
// API.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token");

//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
// });

export default API;
