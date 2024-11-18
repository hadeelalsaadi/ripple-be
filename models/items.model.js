const db = require("../db/connection.js");

const fetchItems = () => {
  return db.query("select * from items;").then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "no items in the db" });
    }
    return rows;
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

module.exports = { fetchItems, fetchItemById };
