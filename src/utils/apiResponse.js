export class apiResponse {
    constructor(statusCode , msg ,data){
        this.status = statusCode >= 200 & statusCode < 300 ? "ok" : "clint error"
        this.statusCode = statusCode || 500
        this.msg = msg || "success"
        this.data = data || null
    }
    static sendSuccess(res , statusCode , msg , data){
        return res.status(statusCode).json(new apiResponse(statusCode , msg , data))
    }
}