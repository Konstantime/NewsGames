const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Открываем именно new_games.db
const db = new sqlite3.Database(path.join(__dirname, "new_games.db"));

app.use(express.static(__dirname));
app.use(express.json()); // для чтения JSON тела

const session = require("express-session");

app.use(
  session({
    secret: "game-news-secret", // в реальном проекте вынести в переменные окружения
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/articles", (req, res) => {
  const sql = "SELECT * FROM articles ORDER BY published_at DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});

// (Не обязательно, но можно явный / на index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/articles/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM articles WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    if (!row) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(row);
  });
});

app.post("/login", (req, res) => {
  const { login, password } = req.body || {};

  if (!login || !password) {
    return res.status(400).json({ error: "Введите логин и пароль" });
  }

  const sql =
    "SELECT id, login, role FROM users WHERE login = ? AND password = ?";
  db.get(sql, [login, password], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    if (!row) {
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    // сохраняем в сессии
    req.session.user = {
      id: row.id,
      login: row.login,
      role: row.role,
    };

    res.json({ id: row.id, login: row.login, role: row.role });
  });
});

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Доступ запрещен" });
  }
  next();
}

app.get("/admin/articles", requireAdmin, (req, res) => {
  const sql =
    "SELECT id, article_title, published_at, genre FROM articles ORDER BY published_at DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});

app.post("/admin/articles", requireAdmin, (req, res) => {
  const {
    game_name,
    article_title,
    genre,
    image_url,
    content,
    author,
    published_at,
  } = req.body || {};

  if (
    !game_name ||
    !article_title ||
    !genre ||
    !content ||
    !author ||
    !published_at
  ) {
    return res.status(400).json({ error: "Заполните все обязательные поля" });
  }

  const sql = `
    INSERT INTO articles
      (game_name, article_title, likes, image_url, content, published_at, author, views, genre)
    VALUES (?, ?, 0, ?, ?, ?, ?, 0, ?)
  `;

  db.run(
    sql,
    [
      game_name,
      article_title,
      image_url || "",
      content,
      published_at,
      author,
      genre,
    ],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error" });
      }
      // this.lastID — id созданной статьи
      res.json({ id: this.lastID });
    }
  );
});

app.delete("/admin/articles/:id", requireAdmin, (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM articles WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Статья не найдена" });
    }

    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
