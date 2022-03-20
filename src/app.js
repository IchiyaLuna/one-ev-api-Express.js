//express module
const express = require("express");
const app = express();

//express-router
const indexRouter = require("./routes/index");
const accountRouter = require("./routes/account");
const academyRouter = require("./routes/academy");

//morgan-logger
const logger = require("morgan");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger("dev"));

app.use("/", indexRouter);
app.use("/account", accountRouter);
app.use("/academy", academyRouter);

app.listen(3000, () => console.log("IL!"));
