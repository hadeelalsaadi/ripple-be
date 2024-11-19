const {
  fetchItems,
  fetchItemById,
  postItem,
} = require("../models/items.model");

const getItems = (request, response, next) => {
  const { sorted, order, category } = request.query;

  fetchItems(sorted, order, category)
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

const addItem = (request, response, next) => {
  const newItem = request.body;
  postItem(newItem)
    .then((item) => {
      console.log(newItem, "oldItem", { item }, "<<newItem");
      response.status(201).send({ item: item });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getItems, getItemById, addItem };
