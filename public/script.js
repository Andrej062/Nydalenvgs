const userForm = document.getElementById("userForm");
const usersTable = document.getElementById("usersTable");
const roleFilter = document.getElementById("roleFilter");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const roleInput = document.getElementById("role");
const addressInput = document.getElementById("address");
const classNameInput = document.getElementById("className");

const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const loginForm = document.getElementById("loginForm");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const loginData = {
    email: loginEmailInput.value,
    password: loginPasswordInput.value
  };

  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(loginData)
  });

  const result = await response.json();

  if (!response.ok) {
    loginMessage.textContent = result.message;
    loginMessage.style.color = "red";
    return;
  }

  loginMessage.textContent = "";
  loginSection.style.display = "none";
  appSection.style.display = "block";

  localStorage.setItem("userRole", result.user.role);

  await startApp();});

let editUserId = null;

// Henter roller fra databasen
async function loadRoles() {
  const response = await fetch("/api/roles");
  const roles = await response.json();

  roleInput.innerHTML = `<option value="">Velg rolle</option>`;

  roles.forEach(role => {
    const option = document.createElement("option");
    option.value = role.id;
    option.textContent = role.role_name;
    roleInput.appendChild(option);
  });
}

// Henter klasser fra databasen
async function loadClasses() {
  const response = await fetch("/api/classes");
  const classes = await response.json();

  classNameInput.innerHTML = `<option value="">Ingen klasse</option>`;

  classes.forEach(schoolClass => {
    const option = document.createElement("option");
    option.value = schoolClass.id;
    option.textContent = schoolClass.class_name;
    classNameInput.appendChild(option);
  });
}

// Henter brukere fra serveren
// Henter brukere fra serveren
async function loadUsers() {
  const loggedInRole = localStorage.getItem("userRole");
  const canEdit = loggedInRole === "admin";

  const response = await fetch(`/api/users?role=${loggedInRole}`);
  let users = await response.json();

  const selectedRole = roleFilter.value;

  if (selectedRole !== "alle") {
    users = users.filter(user => user.role === selectedRole);
  }

  usersTable.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.first_name}</td>
      <td>${user.last_name}</td>
      <td>${user.email || ""}</td>
      <td>${user.phone || ""}</td>
      <td>${user.address || ""}</td>
      <td>${user.role}</td>
      <td>${user.class_name || ""}</td>
      <td>
        ${canEdit ? `
          <button class="edit-btn" onclick="startEditUser(${user.id}, '${user.first_name}', '${user.last_name}', '${user.email || ""}', '${user.phone || ""}', '${user.address || ""}', ${user.role_id || "null"}, ${user.class_id || "null"})">Endre</button>
          <button class="delete-btn" onclick="deleteUser(${user.id})">Slett</button>
        ` : "Ingen tilgang"}
      </td>
    `;

    usersTable.appendChild(row);
  });
}

roleFilter.addEventListener("change", loadUsers);

// Legger til ny bruker eller lagrer endringer
userForm.addEventListener("submit", async (event) => {
  event.preventDefault();

const userData = {
  first_name: firstNameInput.value,
  last_name: lastNameInput.value,
  email: emailInput.value,
  phone: phoneInput.value,
  address: addressInput.value,
  role_id: Number(roleInput.value),
  class_id: classNameInput.value ? Number(classNameInput.value) : null
};

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

// Starter redigering
function startEditUser(id, firstName, lastName, email, phone, address, roleId, classId) {
  editUserId = id;

  firstNameInput.value = firstName;
  lastNameInput.value = lastName;
  emailInput.value = email;
  phoneInput.value = phone;
  addressInput.value = address;
  roleInput.value = roleId;
  classNameInput.value = classId || "";

  submitButton.textContent = "Lagre endringer";
  cancelEditButton.style.display = "inline-block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
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

// Starter applikasjonen
async function startApp() {
  await loadRoles();
  await loadClasses();
  await loadUsers();
}

// startApp();