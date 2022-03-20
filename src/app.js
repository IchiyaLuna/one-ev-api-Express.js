//express module
const express = require("express");
const app = express();

//express-router
const accountRouter = require("./routes/account");

//db module
const dbModule = require("./db");
const pool = dbModule.init();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  dbModule.open(pool, (con) => {
    con.query("SHOW TABLE STATUS", (err, result) => {
      if (err) {
        console.log("DB communication failed: ", err);
        res.status(500).json({ message: "DB communication failed" });
      } else {
        res.json({
          ok: true,
          message: "DB connection OK",
        });
      }
    });
    con.release();
  });
});

app.use("/account", accountRouter);

app.listen(3000, () => console.log("IL!"));
