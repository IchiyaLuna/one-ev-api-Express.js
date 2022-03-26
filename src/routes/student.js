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
        return;
      } else if (!result.length) {
        res.status(404).json({ message: "No accademy found" });
        return;
      } else {
        let academy_id = result[0].id;
        con.query("SELECT * FROM student WHERE academy_id=?", [academy_id], function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
            return;
          } else if (!result.length) {
            res.status(404).json({ message: "No student found" });
            return;
          } else {
            const data = [];

            for (const student of result) {
              data.push({
                id: student.id,
                name: student.name,
                gender: student.gender,
                student_phone: student.student_phone,
                parent_phone: student.parent_phone,
                school: student.school,
                last_consult: student.last_consult,
              });
            }

            res.json({
              ok: true,
              student: data,
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
  const gender = req.query.gender;
  const studentPhone = req.query.student_phone;
  const parentPhone = req.query.parent_phone;
  const school = req.query.school;
  const lastConsult = req.query.last_consult;

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
        con.query("SELECT student_index FROM db_config", function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
            return;
          } else if (!result.length) {
            res.status(404).json({ message: "DB not correctly set" });
            return;
          } else {
            let id = result[0].student_index + 1;
            // Insert stu
            con.query(
              "INSERT INTO student (id, academy_id, name, gender, student_phone, parent_phone, school, last_consult) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
              [id, academy_id, name, gender, studentPhone, parentPhone, school, lastConsult],
              function (err, result) {
                if (err) {
                  console.log("DB communication failed: ", err);
                  res.status(500).json({ message: "DB communication failed" });
                  return;
                } else {
                  // Update stu_index
                  con.query("UPDATE db_config SET student_index=?", id, function (err, result) {
                    if (err) {
                      console.log("DB communication failed: ", err);
                      res.status(500).json({ message: "DB communication failed" });
                      return;
                    } else {
                      res.json({
                        ok: true,
                        message: "",
                        student: {
                          id: id,
                          academy_id: academy_id,
                          name: name,
                          gender: gender,
                          student_phone: studentPhone,
                          parent_phone: parentPhone,
                          last_consult: lastConsult,
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
  const name = req.query.name;
  const gender = req.query.gender;
  const studentPhone = req.query.student_phone;
  const parentPhone = req.query.parent_phone;
  const school = req.query.school;
  const lastConsult = req.query.last_consult;

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
        con.query(
          "UPDATE student SET name=?, gender=?, student_phone=?, parent_phone=?, school=?, last_consult=? WHERE academy_id=? AND id=?",
          [name, gender, studentPhone, parentPhone, school, lastConsult, academy_id, id],
          function (err, result) {
            if (err) {
              console.log("DB communication failed: ", err);
              res.status(500).json({ message: "DB communication failed" });
              return;
            } else {
              res.json({
                ok: true,
                message: "Student updated",
                student: {
                  id: id,
                  academy_id: academy_id,
                  name: name,
                  gender: gender,
                  student_phone: studentPhone,
                  parent_phone: parentPhone,
                  last_consult: lastConsult,
                },
              });
            }
          }
        );
      }
    });
  });
});

router.delete("/", (req, res) => {
  const api_key = req.query.key;
  const id = req.query.id;

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
        con.query("DELETE FROM student WHERE academy_id=? AND id=?", [academy_id, id], function (err, result) {
          if (err) {
            console.log("DB communication failed: ", err);
            res.status(500).json({ message: "DB communication failed" });
            return;
          } else {
            res.json({
              ok: true,
              message: "Student deleted",
            });
          }
        });
      }
    });
  });
});

module.exports = router;
