class apiResponse {
    constructor(statusCode , msg ,data){
        this.statusCode = statusCode
        this.msg = msg
        this.data = data
    }
    static sendResponse(res , statusCode , msg , data){
        
    }
}