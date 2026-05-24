import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {

    try {

        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {

            token =
                req.headers.authorization.split(" ")[1];

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

            console.log("DECODED:", decoded);

            const user =
                await User.findById(decoded.id)
                .select("-password");

            if (!user) {

                return res.status(401).json({
                    error: "User not found"
                });
            }

            req.user = {
                id: user._id.toString(),
                role: user.role,
                name: user.name,
                email: user.email
            };

            console.log("REQ.USER:", req.user);

            return next();
        }

        return res.status(401).json({
            error: "No token"
        });

    } catch (err) {

        console.error(
            "AUTH ERROR:",
            err
        );

        return res.status(401).json({
            error: "Token failed"
        });
    }
};

export const authorize = (...roles) => {

    return (req, res, next) => {

        console.log("AUTHORIZE ROLE:", req.user?.role);
        console.log("ALLOWED:", roles);

        if (
            !roles.includes(req.user.role)
        ) {

            return res.status(403).json({
                error: "User role not authorized"
            });
        }

        next();
    };
};