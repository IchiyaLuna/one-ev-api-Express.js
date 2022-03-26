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
  const hall_id = req.query.hall_id;

  dbModule.open(pool, (con) => {
    con.query("SELECT id FROM academy WHERE api_key=?", [api_key], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
        return;
      } else if (!result.length) {
        res.status(404).json({ message: "No accademy found" });
        return;
      } else {
        let academy_id = result[0].id;
        dbModule.open(pool, (con) => {
          con.query("SELECT id, name FROM room WHERE academy_id=? AND hall_id=?", [academy_id, hall_id], function (err, result) {
            if (err) {
              console.log("DB communication failed: ", err);
              res.status(500).json({ message: "DB communication failed" });
            } else if (!result.length) {
              res.status(404).json({ message: "No room data found" });
            } else {
              const data = [];

              for (const room of result) {
                data.push({
                  id: room.id,
                  name: room.name,
                });
              }

              res.json({
                ok: true,
                room: data,
              });
            }
          });
          dbModule.close(con);
        });
      }
    });
  });
});

router.post("/", (req, res) => {
  const api_key = req.query.key;
  const hall_id = req.query.hall_id;
  const name = req.query.name;

  console.log(api_key);
  dbModule.open(pool, (con) => {
    // Get aca id
    con.query("SELECT id FROM academy WHERE api_key=?", [api_key], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
        return;
      } else if (!result.length) {
        res.status(404).json({ message: "No accademy found" });
        return;
      } else {
        let academy_id = result[0].id;
        // Get cur stu_index
        con.query("SELECT room_index FROM db_config", function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
            return;
          } else if (!result.length) {
            res.status(404).json({ message: "DB not correctly set" });
            return;
          } else {
            let id = result[0].room_index + 1;
            // Insert stu
            con.query(
              "INSERT INTO room (id, academy_id, hall_id, name) VALUES(?, ?, ?, ?)",
              [id, academy_id, hall_id, name],
              function (err, result) {
                if (err) {
                  console.log("DB communication failed: ", err);
                  res.status(500).json({ message: "DB communication failed" });
                  return;
                } else {
                  // Update stu_index
                  con.query("UPDATE db_config SET room_index=?", id, function (err, result) {
                    if (err) {
                      console.log("DB communication failed: ", err);
                      res.status(500).json({ message: "DB communication failed" });
                      return;
                    } else {
                      res.json({
                        ok: true,
                        message: "",
                        room: {
                          id: id,
                          academy_id: academy_id,
                          hall_id: hall_id,
                          name: name,
                        },
                      });
                    }
                  });
                }
              }
            );
          }
        });
      }
    });
  });
});

module.exports = router;
