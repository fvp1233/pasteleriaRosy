import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import registerUserRoutes from "./src/routes/registerUserRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import recoveryPasswordRoutes from "./src/routes/recoveryPasswordRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import batchRoutes from "./src/routes/batchRoutes.js";
import movementRoutes from "./src/routes/movementRoutes.js";
import alertRoutes from "./src/routes/alertRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";


const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://pasteleria-rosy.vercel.app"],
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json());

app.use("/api/users", registerUserRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users/recovery", recoveryPasswordRoutes);
app.use("/api/products", productRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/movements", movementRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);

export default app