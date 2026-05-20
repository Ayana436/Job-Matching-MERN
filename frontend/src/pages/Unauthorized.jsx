const Unauthorized = () => {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#0f172a",
                color: "white",
                flexDirection: "column",
                gap: "15px",
            }}
        >
            <h1>403 - Unauthorized</h1>

            <p>
                You do not have permission to access this page.
            </p>
        </div>
    );
};

export default Unauthorized;