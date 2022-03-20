//express module
const express = require("express");
const router = express.Router();

//db module
const dbModule = require("../db");
const pool = dbModule.init();

router.get("/", (req, res) => {
  const api_key = req.query.key;

  dbModule.open(pool, (con) => {
    con.query("SELECT code FROM academy WHERE api_key=?", [api_key], function (err, result) {});
  });
});

router.post("/", (req, res) => {});

router.get("/code/check", (req, res) => {
  const code = req.query.code;
  dbModule.open(pool, (con) => {
    con.query("SELECT code FROM academy WHERE code=?", [code], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.json({
          ok: true,
          available: true,
          message: "Available code",
        });
      } else {
        res.json({
          ok: true,
          available: false,
          message: "Code already in use",
        });
      }
    });
    dbModule.close(con);
  });
});

module.exports = router;
