const express = require("express");
const cors = require("cors");
const getEndPoints = require("./controllers/getEndPoints.controller");
const {
  getItems,
  getItemById,
  addItem,
  deleteItemById,
} = require("./controllers/items.controller");
const {
  customErrorHandler,
  psqlErrorHandler,
  serverErrorHandler,
} = require("./controllers/errorHandles");
const getCategories = require("./controllers/categories.controller");
const app = express();

app.use(cors());

app.use(express.json());

app.get("/api", getEndPoints);
app.get("/api/items", getItems);
app.post("/api/items", addItem);
app.get("/api/items/:item_id", getItemById);
app.delete("/api/items/:item_id", deleteItemById);
app.get("/api/categories", getCategories);
app.get("*", (request, response) => {
  response.status(404).send({ msg: "Endpoint does not exist!" });
});

app.use(psqlErrorHandler);
app.use(customErrorHandler);

app.use(serverErrorHandler);
module.exports = app;
