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
        con.query("SELECT * FROM class WHERE academy_id=?", [academy_id], function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
          } else if (!result.length) {
            res.status(404).json({ message: "No class found" });
          } else {
            const data = [];

            for (const classData of result) {
              data.push({
                id: classData.id,
                room_id: classData.room_id,
                name: classData.name,
                subject_id: classData.subject_id,
                teacher_id: classData.teacher_id,
                full_student: classData.full_student,
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

router.post("/", (req, res) => {
  const api_key = req.query.key;
  const room_id = req.query.room_id;
  const name = req.query.name;
  const subject_id = req.query.subject_id;
  const teacher_id = req.query.teacher_id;
  const full_student = req.query.full_student;
  const time = req.query.time;

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
        con.query("SELECT class_index FROM db_config", function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
          } else if (!result.length) {
            res.status(404).json({ message: "DB not correctly set" });
          } else {
            let id = result[0].class_index + 1;
            // Insert stu
            con.query(
              "INSERT INTO class (id, academy_id, room_id, name, subject_id, teacher_id, full_student, time) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
              [id, academy_id, room_id, name, subject_id, teacher_id, full_student, time],
              function (err, result) {
                if (err) {
                  console.log("DB communication failed: ", err);
                  res.status(500).json({ message: "DB communication failed" });
                } else {
                  // Update stu_index
                  con.query("UPDATE db_config SET class_index=?", id, function (err, result) {
                    if (err) {
                      console.log("DB communication failed: ", err);
                      res.status(500).json({ message: "DB communication failed" });
                    } else {
                      res.json({
                        ok: true,
                        message: "",
                        class: {
                          id: id,
                          academy_id: academy_id,
                          room_id: room_id,
                          name: name,
                          subject_id: subject_id,
                          teacher_id: teacher_id,
                          full_student: full_student,
                          time: time,
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

router.get("/subject", (req, res) => {
  const api_key = req.query.key;
  const subject_id = req.query.subject_id;

  dbModule.open(pool, (con) => {
    con.query("SELECT id FROM academy WHERE api_key=?", [api_key], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.status(404).json({ message: "No accademy found" });
      } else {
        let academy_id = result[0].id;
        con.query("SELECT * FROM class WHERE academy_id=? AND subject_id=?", [academy_id, subject_id], function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
          } else if (!result.length) {
            res.status(404).json({ message: "No class found" });
          } else {
            const data = [];

            for (const classData of result) {
              data.push({
                id: classData.id,
                room_id: classData.room_id,
                name: classData.name,
                subject_id: classData.subject_id,
                teacher_id: classData.teacher_id,
                full_student: classData.full_student,
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

router.get("/teacher", (req, res) => {
  const api_key = req.query.key;
  const teacher_id = req.query.teacher_id;

  dbModule.open(pool, (con) => {
    con.query("SELECT id FROM academy WHERE api_key=?", [api_key], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.status(404).json({ message: "No accademy found" });
      } else {
        let academy_id = result[0].id;
        con.query("SELECT * FROM class WHERE academy_id=? AND teacher_id=?", [academy_id, teacher_id], function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
          } else if (!result.length) {
            res.status(404).json({ message: "No class found" });
          } else {
            const data = [];

            for (const classData of result) {
              data.push({
                id: classData.id,
                room_id: classData.room_id,
                name: classData.name,
                subject_id: classData.subject_id,
                teacher_id: classData.teacher_id,
                full_student: classData.full_student,
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
