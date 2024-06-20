const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

function logger(req, res, next) {
  console.log("middleware executed brooo");
  next();
}

app.use(cors());
app.use(express.json());
app.use(logger);

const Auth = require("./Routes/auth");

app.use("/api/auth", Auth);

module.exports = app;
