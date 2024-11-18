const express = require("express");
const getEndPoints = require("./controllers/getEndPoints.controller");
const app = express();

app.use(express.json());

app.get("/api", getEndPoints);

module.exports = app;
