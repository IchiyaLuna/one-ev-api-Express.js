//express module
const express = require("express");
const app = express();

//express-router
const accountRouter = require("./routes/account");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use("/account", accountRouter);

app.listen(3000, () => console.log("IL!"));
