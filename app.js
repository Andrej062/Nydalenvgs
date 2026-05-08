const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

const db = new Database("nydalenvgs.db");

// Enkel innlogging til brukersystemet
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare(`
    SELECT 
      users.id,
      users.first_name,
      users.last_name,
      users.email,
      users.password,
      users.access_to_brukersystem,
      roles.role_name AS role
    FROM users
    LEFT JOIN roles ON users.role_id = roles.id
    WHERE users.email = ?
  `).get(email);

  if (!user) {
    return res.status(401).json({
      message: "Feil e-post eller passord"
    });
  }

  if (user.password !== password) {
    return res.status(401).json({
      message: "Feil e-post eller passord"
    });
  }

  if (user.access_to_brukersystem !== 1) {
    return res.status(403).json({
      message: "Du har ikke tilgang til brukersystemet"
    });
  }

  res.json({
    message: "Innlogging vellykket",
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    }
  });
});

// Henter alle brukere med rolle og klasse
app.get("/api/users", (req, res) => {
  const users = db.prepare(`
    SELECT 
      users.id,
      users.first_name,
      users.last_name,
      users.email,
      users.role_id,
      users.class_id,
      roles.role_name AS role,
      classes.class_name AS class_name,
      users.created_at
    FROM users
    LEFT JOIN roles ON users.role_id = roles.id
    LEFT JOIN classes ON users.class_id = classes.id
    ORDER BY users.id
  `).all();

  res.json(users);
});

// Henter alle roller
app.get("/api/roles", (req, res) => {
  const roles = db.prepare("SELECT * FROM roles ORDER BY id").all();
  res.json(roles);
});

// Henter alle klasser
app.get("/api/classes", (req, res) => {
  const classes = db.prepare("SELECT * FROM classes ORDER BY id").all();
  res.json(classes);
});

// Legger til ny bruker
app.post("/api/users", (req, res) => {
  const { first_name, last_name, email, role_id, class_id } = req.body;

  const insert = db.prepare(`
    INSERT INTO users (first_name, last_name, email, role_id, class_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    first_name,
    last_name,
    email,
    role_id,
    class_id || null
  );

  res.json({
    message: "Bruker lagt til",
    id: result.lastInsertRowid
  });
});

// Endrer en bruker
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, role_id, class_id } = req.body;

  const update = db.prepare(`
    UPDATE users
    SET first_name = ?, last_name = ?, email = ?, role_id = ?, class_id = ?
    WHERE id = ?
  `);

  update.run(
    first_name,
    last_name,
    email,
    role_id,
    class_id || null,
    id
  );

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

app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});