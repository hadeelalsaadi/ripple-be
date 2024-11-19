const db = require("../db/connection.js");
const format = require("pg-format");

const fetchItems = (sorted = "date_listed", order = "desc", category) => {
  const validSorted = ["date_listed", "item_name", "collection_point"];
  const validOrder = ["asc", "desc"];

  if (!validSorted.includes(sorted) || !validOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "invalid sorting or order query",
    });
  }

  let queryStr = `select items.* from items join categories  on items.category_id = categories.category_id`;
  let queryArray = [];
  if (category) {
    queryArray.push(
      db.query(`select * from categories where category_name = $1`, [category])
    );

    queryStr += ` where categories.category_name = '${category}'`;
  }

  queryStr += ` group by items.item_id order by ${sorted} ${order}`;

  queryArray.push(db.query(queryStr));
  return Promise.all(queryArray).then((data) => {
    if (data.length === 2 && data[0].rows.length === 0) {
      return Promise.reject({ status: 404, msg: "category not exist" });
    }

    return data[data.length - 1].rows;
  });
};

const fetchItemById = (id) => {
  return db
    .query(`select * from items where item_id= $1`, [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "item not found" });
      }
      return rows[0];
    });
};

const postItem = (newItem) => {
  const queryStr = format(
    `insert into items (item_name, category_id, user_id, description, image_url, collection_point, date_of_expire, date_listed, reserved_for_id, reserve_status, collection_state) VALUES %L returning items.*`,
    [Object.values(newItem)]
  );
  return db.query(queryStr).then(({ rows }) => {
    return rows[0];
  });
};

module.exports = { fetchItems, fetchItemById, postItem };
