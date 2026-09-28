import dotenv from "dotenv"

dotenv.config();

export const config = {
    JWT: {
        secret: process.env.JWT_Secret_key,
        expiresIn: "30d"
    },
    email:{
        apiKey: process.env.EMAIL_API_KEY,
        fromAddress: process.env.EMAIL_FROM
    },
    db: {
        uri: process.env.DB_URI
    }
}