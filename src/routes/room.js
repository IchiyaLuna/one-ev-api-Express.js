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
          con.query("SELECT * FROM room WHERE academy_id=?", [academy_id], function (err, result) {
            if (err) {
              console.log("DB communication failed: ", err);
              res.status(500).json({ message: "DB communication failed" });
            } else if (!result.length) {
              res.status(204).json({ message: "No room data found" });
            } else {
              const data = [];

              for (const room of result) {
                data.push({
                  id: room.id,
                  hall_id: room.hall_id,
                  name: room.name,
                });
              }

              res.json({
                ok: true,
                room: data,
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
  const hall_id = req.query.hall_id;
  const name = req.query.name;

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

        con.query("SELECT room_index FROM db_config", function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
          } else if (!result.length) {
            res.status(204).json({ message: "DB not correctly set" });
          } else {
            let id = result[0].room_index + 1;

            con.query(
              "INSERT INTO room (id, academy_id, hall_id, name) VALUES(?, ?, ?, ?)",
              [id, academy_id, hall_id, name],
              function (err, result) {
                if (err) {
                  console.log("DB communication failed: ", err);
                  res.status(500).json({ message: "DB communication failed" });
                } else {
                  // Update stu_index
                  con.query("UPDATE db_config SET room_index=?", id, function (err, result) {
                    if (err) {
                      console.log("DB communication failed: ", err);
                      res.status(500).json({ message: "DB communication failed" });
                    } else {
                      res.json({
                        ok: true,
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

router.get("/hall", (req, res) => {
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
          con.query("SELECT id, name FROM room WHERE academy_id=? AND hall_id=?", [academy_id, hall_id], function (err, result) {
            if (err) {
              console.log("DB communication failed: ", err);
              res.status(500).json({ message: "DB communication failed" });
            } else if (!result.length) {
              res.status(204).json({ message: "No room data found" });
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
        });
      }
    });
  });
});

module.exports = router;
