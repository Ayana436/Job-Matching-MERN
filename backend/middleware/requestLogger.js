export const requestLogger = (req, res, next) => {
    const startedAt = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startedAt;
        const user = req.user?.id ? ` user=${req.user.id}` : '';
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms${user}`);
    });

    next();
};
