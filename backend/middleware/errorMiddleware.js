const notFound = (req, res, next) => {
    const error = new Error(
        `Route Not Found - ${req.originalUrl}`
    );

    res.status(404);

    next(error);
};

const errorHandler = (err, req, res, next) => {

    let statusCode =
        res.statusCode === 200
            ? 500
            : res.statusCode;

    let message = err.message;

    // MongoDB invalid ObjectId
    if (err.name === "CastError") {
        statusCode = 404;
        message = "Resource not found";
    }

    // Multer file upload errors
    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 400;
        message = "File size exceeded 5MB limit";
    }

    console.error("ERROR:", err);

    res.status(statusCode).json({
        success: false,
        message,
        stack:
            process.env.NODE_ENV === "production"
                ? null
                : err.stack,
    });
};

export {
    notFound,
    errorHandler
};