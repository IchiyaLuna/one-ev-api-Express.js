//express module
const express = require("express");
const router = express.Router();

//node module
const crypto = require("crypto");

//db module
const dbModule = require("../db");
const pool = dbModule.init();

router.get("/", (req, res) => {
  const id = req.query.id;
  const pass = req.query.pass;
  let hash;

  dbModule.open(pool, (con) => {
    con.query("SELECT salt FROM token WHERE id=?", [id], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
        return;
      } else if (!result.length) {
        res.status(404).json({ message: "No account found" });
        return;
      } else {
        hash = crypto
          .createHash("sha512")
          .update(pass + result[0].salt)
          .digest("hex");

        con.query("SELECT api_key FROM token WHERE id=? AND hash=?", [id, hash], function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
            return;
          } else if (!result.length) {
            res.status(404).json({ message: "No account found" });
            return;
          } else {
            res.json({
              ok: true,
              api: {
                key: result[0].api_key,
                key_length: result[0].api_key.length.toString(),
              },
            });
            return;
          }
        });
      }
    });
    con.release();
  });
});

router.post("/", (req, res) => {
  const id = req.query.id;
  const pass = req.query.pass;

  dbModule.open(pool, (con) => {
    con.query("SELECT * FROM token WHERE id=?", [id], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
        return;
      } else if (result.length) {
        res.status(409).json({ message: "Already exist" });
        return;
      } else {
        const salt = crypto.createHash("sha512").update(crypto.randomBytes(20).toString("base64")).digest("hex");

        const hash = crypto
          .createHash("sha512")
          .update(pass + salt)
          .digest("hex");

        let api_key = crypto.createHash("sha512").update(crypto.randomBytes(20).toString("base64")).digest("hex").slice(-32);

        con.query("SELECT api_key FROM token WHERE api_key=?", [api_key], function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
            return;
          } else if (result.length) api_key = crypto.createHash("sha512").update(crypto.randomBytes(20).toString("base64")).digest("hex").slice(-32);

          con.query("INSERT INTO token (id, api_key, hash, salt) VALUES (?, ?, ?, ?)", [id, api_key, hash, salt], function (err, result) {
            if (err) {
              console.log("DB communication failed: ", err);
              res.status(500).json({ message: "DB communication failed" });
              return;
            } else {
              res.json({
                ok: true,
                api: {
                  key: api_key,
                  key_length: api_key.length.toString(),
                },
                account: {
                  id: id,
                  pass: hash,
                  salt: salt,
                },
              });
              return;
            }
          });
        });
      }
    });
    con.release();
    console.log("DB pool released");
  });
});

module.exports = router;
