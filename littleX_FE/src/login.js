// Dummy Data
const users = [];

// Tab Switching Logic
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all tabs
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    // Add active class to the selected tab and its content
    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
  });
});

// Register User
document.getElementById("register-btn").addEventListener("click", () => {
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  if (!email || !password) {
    alert("Please provide both email and password.");
    return;
  }

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    alert("User already registered!");
    return;
  }

  users.push({ email, password });
  alert("Successfully registered");
});

// Login User
document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    alert("Invalid email or password!");
    return;
  }

  localStorage.setItem("littleXUser", email);
  alert("Authentication code: ABC123");
  window.location.href = "tweets.html";
});
