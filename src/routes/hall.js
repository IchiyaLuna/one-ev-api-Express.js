//express module
const express = require("express");
const router = express.Router();

//node module
const crypto = require("crypto");

//db module
const dbModule = require("../db");
const pool = dbModule.init();

router.get("/", (req, res) => {
  const academy_id = req.query.academy_id;

  dbModule.open(pool, (con) => {
    con.query("SELECT id, name FROM hall WHERE academy_id=?", [academy_id], function (err, result) {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else if (!result.length) {
        res.status(404).json({ message: "No hall data found" });
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
          data: data,
        });
      }
    });
    dbModule.close(con);
  });
});

router.get("/check", (req, res) => {
  
})
module.exports = router;
