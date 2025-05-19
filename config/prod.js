import dotenv from 'dotenv'
dotenv.config()

export default {
    dbURL: process.env.ATLAS_URL,
    dbName: process.env.ATLAS_DB_NAME,
}