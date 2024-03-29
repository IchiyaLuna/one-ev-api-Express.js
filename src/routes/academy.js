//express module
const express = require("express");
const router = express.Router();

//db module
const dbModule = require("../db");
const pool = dbModule.init();

router.get("/", (req, res) => {
  const api_key = req.query.key;

  dbModule.open(pool, (con) => {
    con.query("SELECT * FROM academy WHERE api_key=?", [api_key], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.status(204).json({ message: "No accademy found" });
      } else {
        res.json({
          ok: true,
          academy_id: result[0].id,
          name: result[0].name,
          tel: result[0].tel,
          address: result[0].address,
        });
      }
    });
  });
});

router.post("/create", (req, res) => {
  const api_key = req.query.key;
  const name = req.query.name;
  const tel = req.query.tel;
  const address = req.query.address;

  dbModule.open(pool, (con) => {
    con.query("SELECT academy_index FROM db_config", function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.status(204).json({ message: "DB not correctly set" });
      } else {
        let id = result[0].academy_index + 1;
        con.query(
          "INSERT INTO academy (id, api_key, name, tel, address) VALUES(?, ?, ?, ?, ?)",
          [id, api_key, name, tel, address],
          function (err, result) {
            if (err) {
              console.log("DB communication failed: ", err);
              res.status(500).json({ message: "DB communication failed" });
            } else {
              con.query("UPDATE db_config SET academy_index=?", id, function (err, result) {
                if (err) {
                  console.log("DB communication failed: ", err);
                  res.status(500).json({ message: "DB communication failed" });
                } else {
                  res.json({
                    ok: true,
                    message: "",
                    data: {
                      api_key: api_key,
                      id: id,
                      name: name,
                      tel: tel,
                      address: address,
                    },
                  });
                }
              });
            }
          }
        );
      }
    });
  });
});

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
  });
});

module.exports = router;
