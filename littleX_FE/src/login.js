// Base URL for API
const BASE_URL = `${Constants.API_URL}/user`;
// Tab Switching Logic
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// Register User
document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

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

// Login User
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

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
    localStorage.setItem("authToken", token);

    alert("Login successful!");

    // Check user profile
    const profileResponse = await fetch(
      `${Constants.API_URL}/walker/get_profile`,
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
        const newUsername = prompt("Please enter a username:");
        if (newUsername) {
          const updateProfileResponse = await fetch(
            `${Constants.API_URL}/walker/update_profile`,
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
