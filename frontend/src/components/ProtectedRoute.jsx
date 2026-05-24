// Bouncer for routes
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const user = (() => {
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    })();

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    if (!user) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/unauthorized" replace />;
    }

    const allowedRoles = Array.isArray(allowedRole)
        ? allowedRole
        : [allowedRole];

    if (allowedRole && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
