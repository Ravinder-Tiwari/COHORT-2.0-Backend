export const handleValidationErrors = (err, req, res, next) => {


    const statusCode = err.status || 500;
    // console.log(err)
    const response = {
        message: err.message || "Internal Server Error"
    };
    if (process.env.NODE_ENVIRONMENT === "development") {
        response.stack = err.stack;
    }
    res.status(statusCode).json(response);
    
};
