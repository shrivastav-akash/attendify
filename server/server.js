const config = require("./config/env");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const pinoHttp = require("pino-http");
const logger = require("./config/logger");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();
const PORT = config.port;

// Render/other PaaS sit behind a reverse proxy; trust the first hop so
// req.ip reflects the real client (needed for correct rate limiting).
app.set("trust proxy", 1);

// Middleware
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.clientOrigins,
    credentials: true,
  }),
);

// Database Connection
mongoose
  .connect(config.mongoUri)
  .then(() => logger.info("MongoDB Connected"))
  .catch((err) => logger.error({ err }, "MongoDB connection error"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => res.send("API Running"));

// 404 + central error handler (must be last)
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
