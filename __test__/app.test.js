const endpoints = require("../endpoints.json");
const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seed/seed.js");
const data = require("../db/data/test-data/index.js");
require("jest-sorted");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("/api", () => {
  test("GET:200 status - return all endpoints description", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});
describe("/any", () => {
  test("GET:404 -return msg endpoint does not exist", () => {
    return request(app)
      .get("/hello")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Endpoint does not exist!");
      });
  });
});
describe("/api/items", () => {
  describe("GET -Requests-items", () => {
    test("GET:200 response with an array of all items", () => {
      return request(app)
        .get("/api/items")
        .expect(200)
        .then(({ body }) => {
          expect(body.items).toHaveLength(10);
          expect(body.items).toBeSortedBy("date_listed", { descending: true });
          body.items.forEach((item) => {
            expect(item).toHaveProperty("item_id");
            expect(item).toHaveProperty("item_name");
            expect(item).toHaveProperty("category_id");
            expect(item).toHaveProperty("description");
            expect(item).toHaveProperty("image_url");
            expect(item).toHaveProperty("date_listed");
            expect(item).toHaveProperty("date_of_expire");
            expect(item).toHaveProperty("reserved_for_id");
            expect(item).toHaveProperty("reserve_status");
            expect(item).toHaveProperty("collection_state");
            expect(item).toHaveProperty("collection_point");
          });
        });
    });
    test("GET:200 response with arrays of items that belong to given category", () => {
      return request(app)
        .get("/api/items?category=home")
        .expect(200)
        .then(({ body }) => {
          expect(body.items).toHaveLength(1);
          expect(body.items[0]).toMatchObject({
            item_id: 2,
            item_name: "Bookshelf",
            category_id: 2,
            user_id: 3,
            description:
              "A sturdy wooden bookshelf, has minor scratches but fully functional.",
            image_url: "https://i.pravatar.cc/150?img=61",
            collection_point: "456 Oak Avenue, London, UK",
            date_of_expire: "2024-11-30T18:00:00.000Z",
            date_listed: "2024-11-17T09:30:00.000Z",
            reserved_for_id: null,
            reserve_status: false,
            collection_state: false,
          });
        });
    });
    test("GET:200 response with all items sorted when passed valid sorted and order query", () => {
      return request(app)
        .get("/api/items?sorted=item_name&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.items).toBeSortedBy("item_name");
        });
    });
    test("GET-404 response with category does not exist when passed invalid category", () => {
      return request(app)
        .get("/api/items?category=hello")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual("category not exist");
        });
    });
    test("GET-200 response with empty array when passed category that exist with no items", () => {
      return request(app)
        .get("/api/items?category=shoes")
        .expect(200)
        .then(({ body }) => {
          expect(body.items).toEqual([]);
        });
    });
    test("GET-400 response with an error when invalid sorted or order passed in", () => {
      return request(app)
        .get("/api/items?sorted=hello&order=ascc")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("invalid sorting or order query");
        });
    });
  });
  describe("POST - request-item", () => {
    test("POST: 201 - adds a new item to the list", () => {
      const newArticle = {
        item_name: "Funny Mug",
        category_id: 2,
        user_id: 2,
        description: "Mug with the very funny quote on it.",
        image_url: "https://i.pravatar.cc/150?img=60",
        collection_point: "123 Elm Street, Los Angeles, CA",
        date_of_expire: "2024-12-01T00:12:00.000Z",
        date_listed: "2024-11-18T00:08:00.000Z",
        reserved_for_id: null,
        reserve_status: false,
        collection_state: false,
      };
      return request(app)
        .post("/api/items")
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          expect(body.item).toMatchObject(newArticle);
          expect(typeof body.item.item_id).toBe("number");
        });
    });
    test("POST: 400 - responds with the correct status when provided with the object with missing keys", () => {
      const newArticle = {
        item_name: "Funny Mug",
        user_id: 2,
        description: "Mug with the very funny quote on it.",
        image_url: "https://i.pravatar.cc/150?img=60",
        collection_point: "123 Elm Street, Los Angeles, CA",
        date_of_expire: "2024-12-01T00:12:00.000Z",
        date_listed: "2024-11-18T00:08:00.000Z",
        reserved_for_id: null,
        reserve_status: false,
        collection_state: false,
      };
      return request(app)
        .post("/api/items")
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("POST: 400 - responds with the correct status when provided with the object with wrong keys", () => {
      const newArticle = {
        item_name: "Funny Mug",
        category_id: "two",
        user_id: 2,
        description: "Mug with the very funny quote on it.",
        image_url: "https://i.pravatar.cc/150?img=60",
        collection_point: "123 Elm Street, Los Angeles, CA",
        date_of_expire: "2024-12-01T00:12:00.000Z",
        date_listed: "2024-11-18T00:08:00.000Z",
        reserved_for_id: null,
        reserve_status: false,
        collection_state: false,
      };
      return request(app)
        .post("/api/items")
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
  });
});

describe("/api/items/:item_id", () => {
  describe("GET-Requests-item-by-id", () => {
    test("GET:200 response with an item object", () => {
      return request(app)
        .get("/api/items/1")
        .expect(200)
        .then(({ body }) => {
          expect(Object.keys(body.item).length).toBe(12);
          expect(body.item.item_id).toBe(1);
        });
    });
    test("GET-400 response with bad request when passed with item_id that is not a number", () => {
      return request(app)
        .get("/api/items/id")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("GET-404 response with not found when passed item not exist in items table", () => {
      return request(app)
        .get("/api/items/999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("item not found");
        });
    });
  });
  describe("DELETE item request", () => {
    test("DELETE: 204, delets item and responds with the correct status when given the delete query", () => {
      return request(app).delete("/api/items/5").expect(204);
    });
    test("DELETE: 404, responds with appropriate status and message when provided with the item_id which does not exist ", () => {
      return request(app)
        .delete("/api/items/555")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("item not found");
        });
    });
    test("DELETE: 400, responds with appropriate status and message when provided with the invalid item_id", () => {
      return request(app)
        .delete("/api/items/not-a-number")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
  });
});

describe("/api/categories", () => {
  test("GET:200 response with an array of all categories", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body }) => {
        expect(body.categories).toHaveLength(11);
        body.categories.forEach((category) => {
          expect(category).toHaveProperty("category_id");
          expect(category).toHaveProperty("category_name");
          expect(category).toHaveProperty("description");
          expect(category).toHaveProperty("image_url");
        });
      });
  });
});
