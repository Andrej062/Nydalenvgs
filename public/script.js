const userForm = document.getElementById("userForm");
const usersTable = document.getElementById("usersTable");
const roleFilter = document.getElementById("roleFilter");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const roleInput = document.getElementById("role");
const classNameInput = document.getElementById("className");

const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");

let editUserId = null;

// Henter brukere fra serveren
async function loadUsers() {
  const response = await fetch("/api/users");
  let users = await response.json();

  const selectedRole = roleFilter.value;

  // Filtrerer brukere etter rolle
  if (selectedRole !== "alle") {
    users = users.filter(user => user.role === selectedRole);
  }

  usersTable.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.full_name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.class_name || ""}</td>
      <td>
        <button onclick="startEditUser(${user.id}, '${user.full_name}', '${user.email}', '${user.role}', '${user.class_name || ""}')">Endre</button>
        <button onclick="deleteUser(${user.id})">Slett</button>
      </td>
    `;

    usersTable.appendChild(row);
  });
}

// Når man endrer filteret, lastes tabellen på nytt
roleFilter.addEventListener("change", loadUsers);

// Legger til ny bruker eller lagrer endringer
userForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userData = {
    full_name: fullNameInput.value,
    email: emailInput.value,
    role: roleInput.value,
    class_name: classNameInput.value
  };

  // Hvis editUserId har verdi, oppdaterer vi en eksisterende bruker
  if (editUserId) {
    await fetch(`/api/users/${editUserId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    editUserId = null;
    submitButton.textContent = "Legg til";
    cancelEditButton.style.display = "none";
  } else {
    // Hvis editUserId er null, legger vi til ny bruker
    await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });
  }

  userForm.reset();
  loadUsers();
});

// Starter redigering av en bruker
function startEditUser(id, fullName, email, role, className) {
  editUserId = id;

  fullNameInput.value = fullName;
  emailInput.value = email;
  roleInput.value = role;
  classNameInput.value = className;

  submitButton.textContent = "Lagre endringer";
  cancelEditButton.style.display = "inline-block";
}

// Avbryter redigering
cancelEditButton.addEventListener("click", () => {
  editUserId = null;

  userForm.reset();

  submitButton.textContent = "Legg til";
  cancelEditButton.style.display = "none";
});

// Sletter bruker
async function deleteUser(id) {
  await fetch(`/api/users/${id}`, {
    method: "DELETE"
  });

  loadUsers();
}

// Laster brukere når siden åpnes
loadUsers();