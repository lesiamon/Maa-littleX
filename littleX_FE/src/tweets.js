// Check if the user is logged in
const user = localStorage.getItem("authToken");
if (!user) {
  window.location.href = "index.html";
}

// Logout functionality
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  window.location.href = "index.html";
});

// Sample tweets
const sampleTweets = [
  {
    user: "Alice",
    content: "This is my first tweet on littleX!",
    tags: ["#welcome"],
    likes: 0,
    comments: [],
  },
  {
    user: "Bob",
    content: "Loving the simplicity of this platform.",
    tags: ["#simple", "#userFriendly"],
    likes: 2,
    comments: [],
  },
];

// Track followed users
const followedUsers = new Set();

// Function to render tweets
const tweetsDiv = document.getElementById("tweets");
function renderTweets() {
  tweetsDiv.innerHTML = ""; // Clear current tweets
  sampleTweets.forEach((tweet, index) => {
    const isFollowing = followedUsers.has(tweet.user);
    const tweetDiv = document.createElement("div");
    tweetDiv.className = "tweet";
    tweetDiv.innerHTML = `
      <span class="user">${tweet.user}
        <button class="follow-btn ${
          isFollowing ? "following" : ""
        }" data-user="${tweet.user}">
          ${isFollowing ? "Following" : "Follow"}
        </button>
      </span>
      <p class="content">${tweet.content}</p>
      <p class="tags">${formatTags(tweet.tags)}</p>
      <div class="tweet-actions">
        <button class="like-btn" data-index="${index}">
          <i class="fas fa-heart"></i> (<span class="like-count">${
            tweet.likes
          }</span>)
        </button>
        <button class="comment-btn" data-index="${index}">Comment</button>
      </div>
      <div class="comments" id="comments-${index}">
        ${tweet.comments
          .map(
            (comment) => `
          <div class="comment">
            <strong>${comment.user}:</strong> ${comment.content}
          </div>
        `
          )
          .join("")}
      </div>
    `;
    tweetsDiv.appendChild(tweetDiv);
  });

  // Add event listeners for like buttons
  document.querySelectorAll(".like-btn").forEach((button) => {
    button.addEventListener("click", handleLike);
  });

  // Add event listeners for follow buttons
  document.querySelectorAll(".follow-btn").forEach((button) => {
    button.addEventListener("click", toggleFollow);
  });
}

// Handle likes
function handleLike(event) {
  const index = event.target.closest(".like-btn").dataset.index;
  sampleTweets[index].likes += 1;
  renderTweets();
}

// Toggle follow/unfollow
function toggleFollow(event) {
  const user = event.target.dataset.user;
  if (followedUsers.has(user)) {
    followedUsers.delete(user);
    event.target.textContent = "Follow";
    event.target.classList.remove("following");
  } else {
    followedUsers.add(user);
    event.target.textContent = "Following";
    event.target.classList.add("following");
  }
}

// Format tags for display
function formatTags(tags) {
  return tags.map((tag) => `<span class="tag">${tag}</span>`).join(", ");
}

// Handle new tweet submission
document.getElementById("tweetForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const tweetContent = document.getElementById("tweetContent").value.trim();
  const tweetTags = document.getElementById("tweetTags").value.trim();

  if (tweetContent) {
    const tagsArray = tweetTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    sampleTweets.unshift({
      user,
      content: tweetContent,
      tags: tagsArray,
      likes: 0,
      comments: [],
    });

    renderTweets();

    // Clear input fields
    document.getElementById("tweetContent").value = "";
    document.getElementById("tweetTags").value = "";
  } else {
    alert("Tweet content cannot be empty");
  }
});

// Render initial sample tweets
renderTweets();
