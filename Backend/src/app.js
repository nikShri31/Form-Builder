import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));   //HTTP request logger middleware for node.js 

//importing routes 
import userRouter from "./routes/user.routes.js";
import formRouter from "./routes/form.routes.js";
import questionRouter from "./routes/question.routes.js";
import responseRouter from "./routes/response.routes.js";

app.use('/api/v1/users',userRouter);
app.use('/api/v1/forms',formRouter);
app.use('/api/v1/questions',questionRouter);
app.use('/api/v1/response',responseRouter);

export { app };