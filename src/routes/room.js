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

module.exports = router;
