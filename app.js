const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const port = 3000;

// Gjør at serveren kan lese JSON fra frontend
app.use(express.json());
app.use(express.static("public"));

// Kobler til databasen
const db = new Database("nydalenvgs.db");

// Henter alle brukere
app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.json(users);
});

// Legger til ny bruker
app.post("/api/users", (req, res) => {
  const { full_name, email, role, class_name } = req.body;

  const insert = db.prepare(`
    INSERT INTO users (full_name, email, role, class_name)
    VALUES (?, ?, ?, ?)
  `);

  const result = insert.run(full_name, email, role, class_name);

  res.json({
    message: "Bruker lagt til",
    id: result.lastInsertRowid
  });
});

// Endrer en bruker
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { full_name, email, role, class_name } = req.body;

  const update = db.prepare(`
    UPDATE users
    SET full_name = ?, email = ?, role = ?, class_name = ?
    WHERE id = ?
  `);

  update.run(full_name, email, role, class_name, id);

  res.json({
    message: "Bruker oppdatert"
  });
});

// Sletter en bruker
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;

  const remove = db.prepare("DELETE FROM users WHERE id = ?");
  remove.run(id);

  res.json({
    message: "Bruker slettet"
  });
});

// Starter serveren
app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});