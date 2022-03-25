//express module
const express = require("express");
const app = express();

//express-router
const indexRouter = require("./routes/index");
const accountRouter = require("./routes/account");
const academyRouter = require("./routes/academy");
const hallRouter = require("./routes/hall");

//cors
const cors = require("cors");

//morgan-logger
const logger = require("morgan");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(logger("dev"));

app.use("/", indexRouter);
app.use("/account", accountRouter);
app.use("/academy", academyRouter);
app.use("/hall", hallRouter);

app.listen(3000, () => console.log("IL!"));
