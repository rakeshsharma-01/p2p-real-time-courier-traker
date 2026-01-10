class ApiError extends Error {
    constructor(
        statusCode,
        
        message = "something went wrong",
        error = []
    ){
        super(message)
        this.statusCode = statusCode,
        this.message = message,
        this.data = null,
        this.success = false,
        this.error = error
        
    }
}

export {ApiError}