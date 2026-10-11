const API_URL = "https://jsonplaceholder.typicode.com/users";

const loadBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const list = document.querySelector("#users-list");

let users = [];

function renderUsers(usersToShow) {
  list.replaceChildren();

  if (usersToShow.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users match your filter.";
    list.appendChild(li);
    return;
  }

  usersToShow.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = `${user.name} | ${user.email} | ${user.address.city} | ${user.company.name}`;
    list.appendChild(li);
  });
}

async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadBtn.disabled = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    users = await response.json();
    renderUsers(users);
    statusText.textContent = `Loaded ${users.length} users.`;
  } catch (error) {
    statusText.textContent = "Could not load users. Please try again.";
    console.error(error);
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  if (users.length === 0) return;
  const term = filterInput.value.trim().toLowerCase();
  const matches = users.filter((user) =>
    user.name.toLowerCase().includes(term)
  );
  renderUsers(matches);
});