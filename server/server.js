const config = require("./config/env");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = config.port;

// Render/other PaaS sit behind a reverse proxy; trust the first hop so
// req.ip reflects the real client (needed for correct rate limiting).
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(
  cors({
    origin: config.clientOrigins,
    credentials: true,
  }),
);

// Database Connection
mongoose
  .connect(config.mongoUri)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => res.send("API Running"));

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
