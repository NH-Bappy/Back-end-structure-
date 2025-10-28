require('dotenv').config();
const {connectDatabase} = require('./src/database/Db.config');
const { httpServer } = require('./app')
const port = process.env.PORT




connectDatabase().then(() => {
    httpServer.listen(port || 5000 , () => {
        console.log(`server running on http://localhost:${port}`)
    })
}).catch((error) => {
    console.log("error from index.js / error from database connection" , error)
})