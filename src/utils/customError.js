// Custom error class that extends the built-in Error
class CustomError extends Error {
    constructor(statusCode, message) {
        // Call the parent Error constructor and set the message
        super(message);

        // Custom fields
        this.statusCode = statusCode; // HTTP status code (e.g., 404, 500)
        
        // Human-readable status based on the code
        this.status = statusCode >= 400 && statusCode < 500 
            ? "Client Error" 
            : "Server Error";

        this.data = null;              // Extra data if needed
        this.isOperationalError = true; // To distinguish from programming errors

        // Capture the stack trace (optional, better debugging)
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { CustomError };
