import dotenv from "dotenv"

dotenv.config();

export const config = {
    JWT: {
        secret: process.env.JWT_Secret_key,
        expiresIn: "1d"
    },
    email:{
        apiKey: process.env.EMAIL_API_KEY
    },
    db: {
        uri: process.env.DB_URI
    }
}