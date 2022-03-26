//express module
const express = require("express");
const router = express.Router();

//node module
const crypto = require("crypto");

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
        res.status(404).json({ message: "No accademy found" });
      } else {
        let academy_id = result[0].id;
        con.query("SELECT * FROM teacher WHERE academy_id=?", [academy_id], function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
          } else if (!result.length) {
            res.status(404).json({ message: "No student found" });
          } else {
            const data = [];

            for (const teacher of result) {
              data.push({
                id: teacher.id,
                name: teacher.name,
              });
            }

            res.json({
              ok: true,
              teacher: data,
            });
          }
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
        res.status(404).json({ message: "No accademy found" });
      } else {
        let academy_id = result[0].id;
        // Get cur stu_index
        con.query("SELECT teacher_index FROM db_config", function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
          } else if (!result.length) {
            res.status(404).json({ message: "DB not correctly set" });
          } else {
            let id = result[0].teacher_index + 1;
            // Insert stu
            con.query("INSERT INTO teacher (id, academy_id, name) VALUES(?, ?, ?)", [id, academy_id, name], function (err, result) {
              if (err) {
                console.log("DB communication failed: ", err);
                res.status(500).json({ message: "DB communication failed" });
              } else {
                // Update stu_index
                con.query("UPDATE db_config SET teacher_index=?", id, function (err, result) {
                  if (err) {
                    console.log("DB communication failed: ", err);
                    res.status(500).json({ message: "DB communication failed" });
                  } else {
                    res.json({
                      ok: true,
                      message: "",
                      teacher: {
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

router.get("/search", (req, res) => {
  const api_key = req.query.key;
  const id = req.query.id;

  dbModule.open(pool, (con) => {
    con.query("SELECT id FROM academy WHERE api_key=?", [api_key], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.status(404).json({ message: "No accademy found" });
      } else {
        let academy_id = result[0].id;
        con.query("SELECT * FROM teacher WHERE academy_id=? AND id=?", [academy_id, id], function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
          } else if (!result.length) {
            res.status(404).json({ message: "No student found" });
          } else {
            const data = [];

            for (const teacher of result) {
              data.push({
                id: teacher.id,
                name: teacher.name,
              });
            }

            res.json({
              ok: true,
              teacher: data,
            });
          }
        });
      }
    });
  });
});

module.exports = router;
