//mysql module
const mysql = require("mysql");

//dot-env
require("dotenv").config();

const connection = {
  init: function () {
    return mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      connectionLimit: process.env.DB_LIMIT,
    });
  },

  open: function (pool, callback) {
    pool.getConnection(function (err, con) {
      if (!err) {
        console.log("Connected to DB pool");
        callback(con);
      } else console.log("DB connection failed: ", err);
    });
  },

  close: function (con) {
    con.end((err) => {
      if (err) console.log("DB termination failed: ", err);
      else console.log("Connection terminated");
    });
  },
};

module.exports = connection;
