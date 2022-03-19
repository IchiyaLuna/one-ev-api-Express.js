//express module
const express = require("express");
const app = express();

//express-router
const router = express.Router();
const indexRouter = require("./routes/index");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);

app.listen(3000, () => console.log("IL!"));
