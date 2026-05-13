require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const SECRET_KEY = process.env.JWT_SECRET || "dev_secret_key";

app.use(cors());
app.use(express.json());

// ─── Test Routes ───────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/test-db", (req, res) => {
  db.query("SELECT 1", (err, result) => {
    if (err) return res.send(err);
    res.send("Database connected successfully ✅");
  });
});

// ─── Middleware ─────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).send("Access denied");
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send("Forbidden: Access denied");
    }
    next();
  };
};

const logAction = (user_id, action) => {
  const query = "INSERT INTO access_logs (user_id, action) VALUES (?, ?)";
  db.query(query, [user_id, action]);
};

// ─── Routes ─────────────────────────────────────────────
app.get("/users", verifyToken, authorizeRole(["admin"]), (req, res) => {
  const query = "SELECT user_id, name, username, role, created_at FROM users";
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching users");
    }
    res.json(result);
  });
});

app.post("/add-user", async (req, res) => {
  const { name, username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)";
    db.query(query, [name, username, hashedPassword, role], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error adding user");
      }
      res.send("User added securely 🔐");
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Hashing error");
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], async (err, result) => {
    if (err) return res.status(500).send("Server error");
    if (result.length === 0) return res.status(401).send("User not found");

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid password");

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, role: user.role });
  });
});

app.get("/victims", verifyToken, (req, res) => {
  if (req.user.role === "public") {
    return res.status(403).send("Access restricted ❌");
  }
  const query = "SELECT * FROM victims";
  db.query(query, (err, result) => {
    if (err) return res.status(500).send("Error");
    res.json(result);
  });
});

// ─── Start Server ────────────────────────────────────────
app.listen(5000, () => {
  console.log("Server running on port 5000");
});