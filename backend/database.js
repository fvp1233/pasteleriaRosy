import mongoose from "mongoose";
import { config } from "../backend/config.js";

mongoose.connect(config.db.uri);

//Comprobar que todo funciona
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("DB is connected");
});

connection.on("disconnected", () => {
  console.log("DB is disconnected");
});

connection.on("error", (error) => {
  console.log("Error found" + error);
});