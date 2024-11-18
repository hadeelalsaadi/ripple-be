const db = require("../db/connection.js");

const fetchItems = () => {
  return db.query("select * from items;").then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "no items in the db" });
    }
    return rows;
  });
};

module.exports = { fetchItems };
