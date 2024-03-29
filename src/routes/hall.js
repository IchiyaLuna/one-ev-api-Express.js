//express module
const express = require("express");
const router = express.Router();

//db module
const dbModule = require("../db");
const pool = dbModule.init();

router.get("/", (req, res) => {
  const api_key = req.query.key;

  dbModule.open(pool, (con) => {
    con.query("SELECT id FROM academy WHERE api_key=?", [api_key], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.status(204).json({ message: "No accademy found" });
      } else {
        let academy_id = result[0].id;
        dbModule.open(pool, (con) => {
          con.query("SELECT id, name FROM hall WHERE academy_id=?", [academy_id], function (err, result) {
            if (err) {
              console.log("DB communication failed: ", err);
              res.status(500).json({ message: "DB communication failed" });
            } else if (!result.length) {
              res.status(204).json({ message: "No hall data found" });
            } else {
              const data = [];

              for (const hall of result) {
                data.push({
                  id: hall.id,
                  name: hall.name,
                });
              }

              res.json({
                ok: true,
                hall: data,
              });
            }
          });
        });
      }
    });
  });
});

router.post("/", (req, res) => {
  const api_key = req.query.key;
  const name = req.query.name;

  console.log(api_key);
  dbModule.open(pool, (con) => {
    // Get aca id
    con.query("SELECT id FROM academy WHERE api_key=?", [api_key], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.status(204).json({ message: "No accademy found" });
      } else {
        let academy_id = result[0].id;
        // Get cur stu_index
        con.query("SELECT hall_index FROM db_config", function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
          } else if (!result.length) {
            res.status(204).json({ message: "DB not correctly set" });
          } else {
            let id = result[0].hall_index + 1;
            // Insert stu
            con.query("INSERT INTO hall (id, academy_id, name) VALUES(?, ?, ?)", [id, academy_id, name], function (err, result) {
              if (err) {
                console.log("DB communication failed: ", err);
                res.status(500).json({ message: "DB communication failed" });
              } else {
                // Update stu_index
                con.query("UPDATE db_config SET hall_index=?", id, function (err, result) {
                  if (err) {
                    console.log("DB communication failed: ", err);
                    res.status(500).json({ message: "DB communication failed" });
                  } else {
                    res.json({
                      ok: true,
                      message: "",
                      hall: {
                        id: id,
                        academy_id: academy_id,
                        name: name,
                      },
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
});

router.get("/id", (req, res) => {
  const api_key = req.query.key;
  const hall_id = req.query.hall_id;

  dbModule.open(pool, (con) => {
    con.query("SELECT id FROM academy WHERE api_key=?", [api_key], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.status(204).json({ message: "No accademy found" });
      } else {
        let academy_id = result[0].id;
        dbModule.open(pool, (con) => {
          con.query("SELECT * FROM hall WHERE academy_id=? AND id=?", [academy_id, hall_id], function (err, result) {
            if (err) {
              console.log("DB communication failed: ", err);
              res.status(500).json({ message: "DB communication failed" });
            } else if (!result.length) {
              res.status(204).json({ message: "No hall data found" });
            } else {
              const data = [];

              for (const hall of result) {
                data.push({
                  id: hall.id,
                  name: hall.name,
                });
              }

              res.json({
                ok: true,
                hall: data,
              });
            }
          });
        });
      }
    });
  });
});

router.get("/check", (req, res) => {});

module.exports = router;
