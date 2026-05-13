require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET_KEY = process.env.JWT_SECRET || "dev_secret_key";
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// test DB connection
app.get("/test-db", (req, res) => {
  db.query("SELECT 1", (err, result) => {
    if (err) return res.send(err);
    res.send("Database connected successfully ✅");
  });
});

app.get("/users", (req, res) => {
  const query = "SELECT user_id, name, username, role FROM users";

  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching users");
    } else {
      res.json(result);
    }
  });
});

app.post("/add-user", async (req, res) => {
  const { name, username, password, role } = req.body;

  if (!name || !username || !password || !role) {
    return res.status(400).send("All fields are required");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)";

    db.query(query, [name, username, hashedPassword, role], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error adding user");
      }

      res.send("User added successfully");
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding user");
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";

  db.query(query, [username], async (err, result) => {
    if (err) return res.status(500).send("Server error");

    if (result.length === 0) {
      return res.status(401).send("User not found");
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Invalid password");
    }

    // create token
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});