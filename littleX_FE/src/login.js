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
    // Register the user
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
    // Send verification code
    await fetch(`${BASE_URL}/send-verification-code`, {
      method: "POST",
      headers: {
        accept: "application/json",
      },
    });

    // Prompt user to enter verification code
    const code = prompt("Enter the verification code sent to your email:");

    if (code) {
      const verifyResponse = await fetch(`${BASE_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        alert(`Verification failed: ${error.message}`);
        return;
      }

      alert("Verification successful! You can now log in.");
    }
  } catch (error) {
    console.error("Error during registration or verification:", error);
    alert("An error occurred. Please try again later.");
  }
});

// Login User
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Please provide both email and password.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(`Login failed: ${error.message}`);
      return;
    }

    const data = await response.json();
    localStorage.setItem("littleXUser", email);
    alert(`Authentication code: ${data.authCode}`);
    window.location.href = "tweets.html";
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred. Please try again later.");
  }
});
