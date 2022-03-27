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
                  day: timetable.day,
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

module.exports = router;
