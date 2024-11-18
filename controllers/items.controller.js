const { fetchItems } = require("../models/items.model");

const getItems = (request, response, next) => {
  fetchItems()
    .then((data) => {
      response.status(200).send({ items: data });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getItems };