/*
|--------------------------------------------------------------------------
                    Import packages                                                         
|--------------------------------------------------------------------------
*/
import express from "express";
import dotenv from "dotenv";
import { userRouter } from "./componets/routes/user.routes.js";
import connectDB, { checkConnection } from "./componets/db/db.js";
import { technologyRouter } from "./componets/routes/technology.routes.js";
import { topicRouter } from "./componets/routes/topic.routes.js";
import { tutorialRouter } from "./componets/routes/tutorial.routes.js";

/*
|--------------------------------------------------------------------------
                         Config
|--------------------------------------------------------------------------
*/
dotenv.config();

/*
|--------------------------------------------------------------------------
                        App & Variables
|--------------------------------------------------------------------------
*/
const app = express();
const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
                         Middleware
|--------------------------------------------------------------------------
*/
app.use(express.json()); // handle JSON requests
app.use(express.urlencoded({ extended: true })); // handle form data

/*
|--------------------------------------------------------------------------
                         Database Connection
|--------------------------------------------------------------------------
*/
connectDB();

/*
|--------------------------------------------------------------------------
                            Routes
|--------------------------------------------------------------------------
*/
// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  const dbStatus = checkConnection();
  const healthStatus = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    server: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
    },
  };

  // Return 503 if database is not connected
  const statusCode = dbStatus.isConnected ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

app.use("/api/v1", userRouter);
app.use("/api/v1", technologyRouter);
app.use("/api/v1", topicRouter);

app.use("/api/v1/tutorial", tutorialRouter);
/*
|--------------------------------------------------------------------------
                                Server
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
                                Test 
|--------------------------------------------------------------------------
*/
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});
