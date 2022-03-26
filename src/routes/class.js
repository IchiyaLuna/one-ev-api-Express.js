//express module
const express = require("express");
const router = express.Router();

//node module
const crypto = require("crypto");

//db module
const dbModule = require("../db");
const pool = dbModule.init();

router.get("/subject", (req, res) => {
  const api_key = req.query.key;
  const subject_id = req.query.subject_id;

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
        con.query("SELECT * FROM class WHERE academy_id=? AND subject_id=?", [academy_id, subject_id], function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
            return;
          } else if (!result.length) {
            res.status(404).json({ message: "No class found" });
            return;
          } else {
            const data = [];

            for (const classData of result) {
              data.push({
                id: classData.id,
                hall_id: classData.hall_id,
                name: classData.name,
                subject_id: classData.subject_id,
                teacher_id: classData.teacher_id,
                time: classData.time,
              });
            }

            res.json({
              ok: true,
              class: data,
            });
          }
        });
      }
    });
  });
});

module.exports = router;
