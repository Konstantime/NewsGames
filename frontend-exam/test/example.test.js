// test/example.test.js
const assert = require("assert");

describe("Unit tests for the NewsGames", () => {
  it("1. Addition of numbers works correctly", () => {
    const sum = 2 + 3;
    assert.strictEqual(sum, 5);
  });

  it("2. String is not empty", () => {
    const title = "Game News";
    assert.ok(title.length > 0);
  });

  it("3. Articles array is initially empty", () => {
    const articles = [];
    assert.deepStrictEqual(articles, []);
  });

  it("4. Article object contains required fields", () => {
    const article = {
      id: 1,
      article_title: "Test",
      views: 10,
    };
    assert.ok("id" in article);
    assert.ok("article_title" in article);
    assert.ok("views" in article);
  });

  it("5. Genre filter keeps only required genre", () => {
    const list = [
      { id: 1, genre: "RPG" },
      { id: 2, genre: "Shooter" },
      { id: 3, genre: "RPG" },
    ];
    const filtered = list.filter((a) => a.genre === "RPG");
    assert.strictEqual(filtered.length, 2);
    assert.ok(filtered.every((a) => a.genre === "RPG"));
  });

  it("6. Search by substring in title works", () => {
    const list = [
      { article_title: "Elden Ring review" },
      { article_title: "Cyberpunk 2077 patch" },
    ];
    const q = "ring".toLowerCase();
    const found = list.filter((a) => a.article_title.toLowerCase().includes(q));
    assert.strictEqual(found.length, 1);
    assert.strictEqual(found[0].article_title, "Elden Ring review");
  });

  it("7. Sorting by date (string) DESC", () => {
    const list = [
      { id: 1, published_at: "2024-01-01" },
      { id: 2, published_at: "2025-05-10" },
      { id: 3, published_at: "2023-12-31" },
    ];
    const sorted = [...list].sort((a, b) =>
      b.published_at.localeCompare(a.published_at)
    );
    assert.strictEqual(sorted[0].id, 2);
    assert.strictEqual(sorted[1].id, 1);
    assert.strictEqual(sorted[2].id, 3);
  });

  it("8. Sorting by views count DESC", () => {
    const list = [
      { id: 1, views: 10 },
      { id: 2, views: 50 },
      { id: 3, views: 30 },
    ];
    const sorted = [...list].sort((a, b) => b.views - a.views);
    assert.strictEqual(sorted[0].views, 50);
    assert.strictEqual(sorted[2].views, 10);
  });

  it("9. Default value for views = 0", () => {
    const articleFromDb = { id: 4, article_title: "No views yet" };
    const views = articleFromDb.views ?? 0;
    assert.strictEqual(views, 0);
  });

  it("10. Error is thrown on invalid login", () => {
    function fakeLogin(login, password) {
      if (login !== "admin" || password !== "admin_pass") {
        throw new Error("Invalid login or password");
      }
      return { role: "admin" };
    }

    assert.throws(
      () => fakeLogin("user", "wrong"),
      /Invalid login or password/
    );
  });
});
