class CustomError extends Error {
    constructor(statusCode, message) {
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.status = statusCode >= 400 && statusCode < 500 ? "clint Error" : "Server Error"
        this.data = null
        this.stack
        this.isOperationalError = true
    }
}

module.exports = { CustomError }