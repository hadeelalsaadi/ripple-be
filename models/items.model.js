const db = require("../db/connection.js");

const fetchItems = (
  sorted = "date_listed",
  order = "desc",
  category,
  long,
  lat
) => {
  const validSorted = [
    "date_listed",
    "item_name",
    "collection_point",
    "distance",
  ];

  const validOrder = ["asc", "desc"];
  let queryStr = "";

  if (!validSorted.includes(sorted) || !validOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "invalid sorting or order query",
    });
  }
  if (long && lat) {
    queryStr = `select  items.*, st_distance(
                                      st_transform(location::geometry, 3857),
                                      st_transform(st_setsrid(st_makepoint(${long},${lat}), 4326), 3857) ) as distance 
                                      from  items join categories  on  items.category_id = categories.category_id`;
  } else {
    queryStr = `select  items.* from  items join categories  on  items.category_id = categories.category_id`;
  }
  let queryArray = [];
  if (category) {
    queryArray.push(
      db.query(`select * from categories where category_name = $1`, [category])
    );

    queryStr += ` where categories.category_name = '${category}'`;
  }
  if (long && lat) {
    queryStr += ` group by items.item_id order by distance ASC`;

    queryArray.push(db.query(queryStr));
  } else {
    queryStr += ` group by items.item_id order by ${sorted} ${order}`;
    queryArray.push(db.query(queryStr));
  }

  return Promise.all(queryArray).then((data) => {
    if (data.length === 2 && data[0].rows.length === 0) {
      return Promise.reject({ status: 404, msg: "category not exist" });
    }

    return data[data.length - 1].rows;
  });
};

const fetchItemById = (id) => {
  return db
    .query(`select * from  public.items where item_id= $1`, [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "item not found" });
      }
      return rows[0];
    });
};

const postItem = ({
  item_name,
  category_id,
  user_id,
  description,
  image_url,
  collection_point,
  date_of_expire,
  date_listed,
  reserved_for_id,
  reserve_status,
  collection_state,
  location,
}) => {
  return db
    .query(
      "insert into  public.items (item_name, category_id, user_id, description, image_url, collection_point, date_of_expire, date_listed, reserved_for_id, reserve_status, collection_state,location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12) returning *;",
      [
        item_name,
        category_id,
        user_id,
        description,
        image_url,
        collection_point,
        date_of_expire,
        date_listed,
        reserved_for_id,
        reserve_status,
        collection_state,
        location,
      ]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

const removeItemById = (item_id) => {
  return db
    .query(`SELECT * FROM  public.items WHERE item_id = $1`, [item_id])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "item not found" });
      }
      return db.query(`DELETE FROM  public.items WHERE item_id = $1`, [
        item_id,
      ]);
    });
};

const patchItem = (
  item_id,
  {
    item_name,
    category_id,
    description,
    image_url,
    collection_point,
    date_of_expire,
    date_listed,
    reserved_for_id,
    reserve_status,
    collection_state,
    location,
  }
) => {
  return db
    .query(
      `UPDATE  public.items
    SET item_name = $1, 
    category_id= $2, description =$3, image_url= $4, collection_point= $5, date_of_expire =$6, date_listed= $7, reserved_for_id= $8, reserve_status =$9, collection_state =$10 , location=$11
    WHERE item_id = $12 RETURNING *;`,
      [
        item_name,
        category_id,
        description,
        image_url,
        collection_point,
        date_of_expire,
        date_listed,
        reserved_for_id,
        reserve_status,
        collection_state,
        location,
        item_id,
      ]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "item not found" });
      }
      return rows[0];
    });
};

const selectNearItems = (lng, lat) => {
  return db
    .query(
      `SELECT location, item_name, t_distance(
    st_transform(location::geometry, 3857),
    st_transform(st_setsrid(st_makepoint($1, $2), 4326), 3857) ) as dist from items order by dist`,
      [lng, lat]
    )
    .then(({ rows }) => {
      console.log(rows);
    });
};

module.exports = {
  fetchItems,
  fetchItemById,
  postItem,
  removeItemById,
  patchItem,
  selectNearItems,
};
