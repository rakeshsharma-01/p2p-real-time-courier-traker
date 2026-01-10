import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const DB_NAME = process.env.DB_NAME

const URI =  `mongodb://127.0.0.1:27017/${DB_NAME}`

const dbconnection = async () => {
    try {
        mongoose.connect(URI)
        console.log(`Mongodb connected successfully ${DB_NAME}`);
        
    } catch (error) {
        console.log("mongodb connection failed", error);
        process.exit(1)
        
    }
}
export default dbconnection