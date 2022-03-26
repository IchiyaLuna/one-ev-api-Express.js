//express module
const express = require("express");
const app = express();

//express-router
const indexRouter = require("./routes/index");
const accountRouter = require("./routes/account");
const academyRouter = require("./routes/academy");
const classRouter = require("./routes/class");
const hallRouter = require("./routes/hall");
const studentRouter = require("./routes/student");
const subjectRouter = require("./routes/subject");

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
app.use("/class", classRouter);
app.use("/hall", hallRouter);
app.use("/student", studentRouter);
app.use("/subject", subjectRouter);

app.listen(3000, () => console.log("IL!"));
