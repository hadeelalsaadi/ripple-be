const endpoints = require("../endpoints.json");
const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seed/seed.js");
const data = require("../db/data/test-data/index.js");

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
  });
});
