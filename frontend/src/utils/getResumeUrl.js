export const getResumeUrl = (resume) => {
    if (!resume) return "";

    let filePath = resume;

    if (typeof resume === "object") {
        filePath = resume.filePath;
    }

    if (!filePath) return "";

    let cleanedPath = String(filePath)
        .replace(/\\/g, "/")
        .trim()
        .replace(/^\/+/, "");

    return `${
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000"
    }/${cleanedPath}`;
};