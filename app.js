const express = require("express");
const getEndPoints = require("./controllers/getEndPoints.controller");
const { getItems } = require("./controllers/items.controller");
const app = express();

app.use(express.json());

app.get("/api", getEndPoints);
app.get("/api/items", getItems);

module.exports = app;
