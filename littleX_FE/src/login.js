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

    alert("Registration successful.");
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred. Please try again later.");
  }
});

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

    // Check user profile
    const profileResponse = await fetch(
      "http://0.0.0.0:8000/walker/get_profile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!profileResponse.ok) {
      console.error("Failed to fetch user profile");
    } else {
      const profileData = await profileResponse.json();
      const username = profileData.reports[0].context.username;

      if (!username) {
        // Prompt user for a new username
        const newUsername = prompt("Please enter a username:");
        if (newUsername) {
          const updateProfileResponse = await fetch(
            "http://0.0.0.0:8000/walker/update_profile",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ new_username: newUsername }),
            }
          );

          if (!updateProfileResponse.ok) {
            console.error("Failed to update username");
          } else {
            console.log("Username updated successfully");
          }
        }
      }
    }
    window.location.href = "tweets.html";
  } catch (error) {
    console.error("Error during login or starting walker:", error);
    alert("An error occurred. Please try again later.");
  }
});

// Logout User
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  alert("Logged out successfully!");
});
