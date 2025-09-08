// Send detailed error response in development
const developerError = (error, res) => {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        message: error.message,              // Error message
        statusCode: statusCode,              // HTTP status code
        status: error.status,                // Client Error / Server Error
        stack: error.stack,                  // Full stack trace for debugging
        data: error.data,                    // Extra data if available
        isOperationalError: error.isOperationalError // Custom flag
    });
};

// Send simplified error response in production
const productionError = (error, res) => {
    const statusCode = error.statusCode || 500;

    // Only show details if error is "operational" (known/expected error)
    if (error.isOperationalError) {
        return res.status(statusCode).json({
            message: error.message,          // Custom error message
            statusCode: statusCode
        });
    } else {
        // Unknown/Programming error → Hide details from users
        return res.status(statusCode).json({
            message: "Something went wrong, please try again",
            statusCode: statusCode
        });
    }
};

// Global Express error handler middleware
exports.globalErrorHandler = (error, req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        // Show full error details in development
        developerError(error, res);
    } else {
        // Show only safe error messages in production
        productionError(error, res);
    }
};
