require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT;

// Render/other PaaS sit behind a reverse proxy; trust the first hop so
// req.ip reflects the real client (needed for correct rate limiting).
app.set("trust proxy", 1);

// Allowed origins (comma-separated in CLIENT_ORIGINS, else the deployed frontend)
const allowedOrigins = (process.env.CLIENT_ORIGINS ||
  "https://attendify-1-w2mu.onrender.com")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Middleware
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => res.send("API Running"));

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
