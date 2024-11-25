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
            image_url:
              "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
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
    test.only("GET:200 response with all items sorted by distance", () => {
      return request(app)
        .get("/api/items")
        .query({
          sorted: "distance",
          order: "desc",
          userLocation: { lat: 51.4893335, long: -0.1440551 },
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.items).toHaveLength(10);
          expect(body.items).toBeSortedBy("distance");
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
        location: "POINT(-118.1508947 34.0935259)",
      };
      const postedItem = {
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
        location: "0101000020E6100000F1683E42A8895DC01CEA1CA8F80B4140",
      };
      return request(app)
        .post("/api/items")
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          expect(body.item).toMatchObject(postedItem);
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
          expect(Object.keys(body.item).length).toBe(13);
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
  describe("DELETE-item-request", () => {
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
  describe("PATCH-item-request", () => {
    test("PATCH- 200 response ok when user update an item details", () => {
      return request(app)
        .patch("/api/items/3")
        .send({
          item_name: "mixer",
          category_id: 5,
          user_id: 5,
          description: "New description",
          image_url:
            "https://www.thespruceeats.com/thmb/PAk0iawhBcizsaBasNSPE0-j_lM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/best-blenders-to-buy-4062976-SpruceEats-Primary-DD-10126ed0790b47388c59ed3c082852d7.png",
          collection_point: "ashford,uk",
          date_of_expire: "2024-12-05T15:00:00Z",
          date_listed: "2024-11-16T12:45:00Z",
          reserved_for_id: null,
          reserve_status: true,
          collection_state: true,
          location: "POINT(-118.1508947 34.0935259)",
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.item.item_name).toBe("mixer");
          expect(body.item.category_id).toBe(5);
          expect(body.item.description).toBe("New description");
          expect(body.item.image_url).toBe(
            "https://www.thespruceeats.com/thmb/PAk0iawhBcizsaBasNSPE0-j_lM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/best-blenders-to-buy-4062976-SpruceEats-Primary-DD-10126ed0790b47388c59ed3c082852d7.png"
          );
          expect(body.item.collection_point).toBe("ashford,uk");
        });
    });
    test("PATCH-404 response with not found when passed invalid item_id ", () => {
      return request(app)
        .patch("/api/items/9999")
        .send({
          item_name: "mixer",
          category_id: 5,
          user_id: 5,
          description: "New description",
          image_url:
            "https://www.thespruceeats.com/thmb/PAk0iawhBcizsaBasNSPE0-j_lM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/best-blenders-to-buy-4062976-SpruceEats-Primary-DD-10126ed0790b47388c59ed3c082852d7.png",
          collection_point: "ashford,uk",
          date_of_expire: "2024-12-05T15:00:00Z",
          date_listed: "2024-11-16T12:45:00Z",
          reserved_for_id: null,
          reserve_status: true,
          collection_state: true,
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("item not found");
        });
    });
    test("PATCH-400 response with Bad request when passed invalid data type", () => {
      return request(app)
        .patch("/api/items/3")
        .send({
          item_name: "mixer",
          category_id: 5,
          user_id: 5,
          description: "New description",
          image_url:
            "https://www.thespruceeats.com/thmb/PAk0iawhBcizsaBasNSPE0-j_lM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/best-blenders-to-buy-4062976-SpruceEats-Primary-DD-10126ed0790b47388c59ed3c082852d7.png",
          collection_point: "ashford,uk",
          date_of_expire: "2024-12-05T15:00:00Z",
          date_listed: "2024-11-16T12:45:00Z",
          reserved_for_id: null,
          reserve_status: "rrrr",
          collection_state: true,
        })
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

describe("/api/users", () => {
  describe("GET users from db", () => {
    test("GET:200 response with all users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(body.users).toHaveLength(10);
          body.users.forEach((user) => {
            expect(user).toHaveProperty("user_id");
            expect(user).toHaveProperty("username");
            expect(user).toHaveProperty("name");
            expect(user).toHaveProperty("email");
            expect(user).toHaveProperty("rating");
            expect(user).toHaveProperty("avatar_url");
          });
        });
    });
  });
  describe("POST user object", () => {
    test("POST:201 response with added user object", () => {
      const user = {
        username: "techguru123",
        name: "Alice Johnson",
        area: "New York, USA",
        email: "alice.johnson@example.com",
        avatar_url: "https://i.pravatar.cc/150?img=5",
      };
      return request(app)
        .post("/api/users")
        .send(user)
        .expect(201)
        .then(({ body }) => {
          expect(body.user).toHaveProperty("user_id");
          expect(body.user).toHaveProperty("username");
          expect(body.user).toHaveProperty("name");
          expect(body.user).toHaveProperty("email");
          expect(body.user).toHaveProperty("rating");
          expect(body.user).toHaveProperty("avatar_url");
        });
    });
    test("POST:400 bad request when not null properties are not assinged", () => {
      const user = {
        username: null,
        name: "Alice Johnson",
        area: "New York, USA",
        email: "alice.johnson@example.com",
        rating: 4.8,
        avatar_url: "https://i.pravatar.cc/150?img=5",
      };
      return request(app)
        .post("/api/users")
        .send(user)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("POST:400 bad request when passed invalid data type", () => {
      const user = {
        username: "helloo",
        name: "Alice Johnson",
        area: "New York, USA",
        email: "alice.johnson@example.com",
        rating: "hello",
        avatar_url: "https://i.pravatar.cc/150?img=5",
      };
      return request(app)
        .post("/api/users")
        .send(user)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
  });
});
describe("/api/users/:username", () => {
  describe("GET user by username", () => {
    test("GET:200 response with user object", () => {
      return request(app)
        .get("/api/users/fitness_freak")
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toHaveProperty("username");
          expect(body.user).toHaveProperty("name");
          expect(body.user).toHaveProperty("area");
          expect(body.user).toHaveProperty("email");
          expect(body.user).toHaveProperty("rating");
          expect(body.user).toHaveProperty("avatar_url");
        });
    });
    test("GET:404 response with not found when passed in username not exist", () => {
      return request(app)
        .get("/api/users/hadeel")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("user not found");
        });
    });
    test("GET:404 response with not found when passed in username as a wrong data type", () => {
      return request(app)
        .get("/api/users/999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("user not found");
        });
    });
  });
});
