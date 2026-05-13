const mysql = require("mysql2");

const dbPassword =
  process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "root";

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: dbPassword,
  database: process.env.DB_NAME || "secure_criminal_db",
});

db.connect((err) => {
  if (err) {
    console.log("DB connection failed ❌", err);
  } else {
    console.log("DB Connected ✅");
  }
});

module.exports = db;