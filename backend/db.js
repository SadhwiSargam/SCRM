const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",   // 👈 put your MySQL password
  database: "secure_criminal_db"
});

db.connect((err) => {
  if (err) {
    console.log("DB connection failed ❌", err);
  } else {
    console.log("DB Connected ✅");
  }
});

module.exports = db;