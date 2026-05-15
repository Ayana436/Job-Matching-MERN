// Bouncer for routes
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem("token");

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (err) {
        console.error("Invalid user in localStorage");
    }

    // no token
    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    // invalid user object
    if (!user) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/auth" replace />;
    }

    // wrong role
    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;
