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
          con.query("SELECT * FROM timetable WHERE academy_id=?", [academy_id], function (err, result) {
            if (err) {
              console.log("DB communication failed: ", err);
              res.status(500).json({ message: "DB communication failed" });
            } else if (!result.length) {
              res.status(204).json({ message: "No timetable data found" });
            } else {
              const data = [];

              for (const timetable of result) {
                data.push({
                  id: timetable.id,
                  weekday: timetable.weekday,
                  time: timetable.time,
                  room_id: timetable.room_id,
                  class_id: timetable.class_id,
                });
              }

              res.json({
                ok: true,
                timetable: data,
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
  const weekday = req.query.weekday;
  const time = req.query.time;
  const room_id = req.query.room_id;
  const class_id = req.query.class_id;

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

        con.query("SELECT timetable_index FROM db_config", function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
          } else if (!result.length) {
            res.status(204).json({ message: "DB not correctly set" });
          } else {
            let id = result[0].timetable_index + 1;

            con.query(
              "INSERT INTO timetable (id, academy_id, weekday, time, room_id, class_id) VALUES(?, ?, ?, ?, ?, ?)",
              [id, academy_id, weekday, time, room_id, class_id],
              function (err, result) {
                if (err) {
                  console.log("DB communication failed: ", err);
                  res.status(500).json({ message: "DB communication failed" });
                } else {
                  con.query("UPDATE db_config SET timetable_index=?", id, function (err, result) {
                    if (err) {
                      console.log("DB communication failed: ", err);
                      res.status(500).json({ message: "DB communication failed" });
                    } else {
                      res.json({
                        ok: true,
                        timetable: {
                          id: id,
                          weekday: weekday,
                          time: time,
                          room_id: room_id,
                          class_id: class_id,
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

router.put("/", (req, res) => {
  const api_key = req.query.key;
  const id = req.query.id;
  const weekday = req.query.weekday;
  const time = req.query.time;
  const room_id = req.query.room_id;

  dbModule.open(pool, (con) => {
    con.query("SELECT id FROM academy WHERE api_key=?", [api_key], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.status(204).json({ message: "No accademy found" });
      } else {
        let academy_id = result[0].id;
        con.query(
          "UPDATE timetable SET weekday=?, time=?, room_id=? WHERE academy_id=? AND id=?",
          [weekday, time, room_id, academy_id, id],
          function (err, result) {
            if (err) {
              console.log("DB communication failed: ", err);
              res.status(500).json({ message: "DB communication failed" });
            } else {
              res.json({
                ok: true,
                message: "Timetable updated",
                timetable: {
                  id: id,
                  weekday: weekday,
                  time: time,
                  room_id: room_id,
                },
              });
            }
          }
        );
      }
    });
  });
});

module.exports = router;
