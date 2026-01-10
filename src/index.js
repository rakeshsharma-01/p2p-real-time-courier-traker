import dotenv from "dotenv"
dotenv.config()
const PORT = process.env.PORT
import app from "./app.js"
import dbconnection from "./db/dbconnection.js"
dbconnection()


.then(() =>{
    app.listen(PORT || 4000, () =>{
        console.log(`listing on the port http://localhost: ${PORT}`);
        
    })
})
.catch(
    (err) =>{
console.log("mongodb connection failed !!!" , err);

    }
)