const db = require("../db/connection.js");

const fetchItems = (sorted = "date_listed", order = "DESC", category) => {
  let queryStr = `select items.* from items join categories  on items.category_id = categories.category_id`;

  if (category) {
    queryStr += ` where categories.category_name = '${category}'`;
  }

  queryStr += ` group by items.item_id order by ${sorted} ${order}`;

  return db.query(queryStr).then(({ rows }) => {
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
