import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGION,
    methods: ["get", "post"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded());
app.use("/temp", express.static("temp"));
app.use(cookieParser());

//import routes

import userRouter from "./routes/user.route.js";

// routes decleretion

app.use("/api/v1/users", userRouter);

export default app;
