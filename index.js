require('dotenv').config();
const {connectDatabase} = require('./src/database/Db.config');
const {app} = require('./app')
const port = process.env.PORT




connectDatabase().then(() => {
    app.listen(port || 5000 , () => {
        console.log(`server running on http://localhost:${port}`)
    })
}).catch((error) => {
    console.log("error from index.js / error from database connection" , error)
})