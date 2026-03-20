import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares/error.middleware.js"

const app = express()
const corsOrigin = process.env.CORS_ORIGIN?.trim()
const allowedOrigins =
  !corsOrigin || corsOrigin === "*"
    ? true
    : corsOrigin.split(",").map((origin) => origin.trim()).filter(Boolean)

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Mess Management System Backend API",
    status: "running",
    endpoints: {
      health: "/api/health",
      api: "/api/v1"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});


app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import studentRouter from './routes/student.routes.js'
import staffRouter from './routes/staff.routes.js'
import adminRouter from './routes/admin.routes.js'
import attendanceRouter from "./routes/attendance.routes.js"
import complaintRouter from "./routes/complaint.routes.js"
import feedbackRouter from "./routes/feedback.routes.js"
import votingRouter from "./routes/voting.routes.js"
import tokenRouter from "./routes/token.routes.js"


//routes declaration
app.use("/api/v1/attendance", attendanceRouter)
app.use("/api/v1/student", studentRouter)
app.use("/api/v1/staff", staffRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/complaint", complaintRouter)
app.use("/api/v1/feedback", feedbackRouter)
app.use("/api/v1/voting", votingRouter)
app.use("/api/v1/token", tokenRouter)

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

app.use(errorHandler)

export { app }
