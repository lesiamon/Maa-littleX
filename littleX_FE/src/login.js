// Base URL for API
const BASE_URL = "http://0.0.0.0:8000/user";

// Tab Switching Logic
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
  });
});

// Register User
document.getElementById("register-btn").addEventListener("click", async () => {
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  if (!email || !password) {
    alert("Please provide both email and password.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(`Error: ${error.message}`);
      return;
    }

    alert(
      "Registration successful. A verification code has been sent to your email."
    );
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred. Please try again later.");
  }
});

// Login User and Start Walker
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Please provide both email and password.");
    return;
  }

  try {
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      alert(`Login failed: ${error.message}`);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Save token in localStorage
    localStorage.setItem("authToken", token);

    alert("Login successful!");

    // Automatically call walker/Start
    const walkerResponse = await fetch("http://0.0.0.0:8000/walker/Start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}), // Add request body if required
    });

    if (!walkerResponse.ok) {
      const walkerError = await walkerResponse.json();
      alert(`Failed to start walker: ${walkerError.message}`);
      return;
    }

    const walkerData = await walkerResponse.json();
    alert("Walker started successfully!");
    console.log("Walker response:", walkerData);

    // Redirect if needed
    window.location.href = "tweets.html";
  } catch (error) {
    console.error("Error during login or starting walker:", error);
    alert("An error occurred. Please try again later.");
  }
});
