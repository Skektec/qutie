const { Pool } = require("pg");
const { db_password } = require("../data/config.json");

const pool = new Pool({
  user: "bot",
  host: "skeksite.ddns.net",
  database: "qutie_db",
  password: db_password,
  port: 5432,
});

pool
  .connect()
  .then((client) => {
    console.log("Postgres connection successful!");
    client.release();
  })
  .catch((err) => {
    console.error("Postgres connection failed:", err.message);
    process.exit(1);
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
