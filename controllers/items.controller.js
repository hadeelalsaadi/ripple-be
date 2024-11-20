const { request, response } = require("../app");
const {
  fetchItems,
  fetchItemById,
  postItem,
  removeItemById,
  patchItem,
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
      response.status(201).send({ item: item });
    })
    .catch((err) => {
      next(err);
    });
};

const deleteItemById = (request, response, next) => {
  const { item_id } = request.params;
  removeItemById(item_id)
    .then(() => {
      response.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};
const updateItem = (request, response, next) => {
  const updateditem = request.body;
  const { item_id } = request.params;
  patchItem(item_id, updateditem)
    .then((body) => {
      response.status(200).send({ item: body });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getItems, getItemById, addItem, deleteItemById, updateItem };
