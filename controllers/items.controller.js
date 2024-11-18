const { fetchItems, fetchItemById } = require("../models/items.model");

const getItems = (request, response, next) => {
  fetchItems()
    .then((data) => {
      response.status(200).send({ items: data });
    })
    .catch((err) => {
      next(err);
    });
};
const getItemById = (request, response, next) => {
  const { item_id } = request.params;
  fetchItemById(item_id)
    .then((data) => {
      response.status(200).send({ item: data });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getItems, getItemById };
