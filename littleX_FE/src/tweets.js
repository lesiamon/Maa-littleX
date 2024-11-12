// Check if user is logged in
const user = localStorage.getItem("littleXUser");
if (!user) {
  window.location.href = "index.html";
}

// Logout functionality
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("littleXUser");
  window.location.href = "index.html";
});

// Sample tweets
const sampleTweets = [
  {
    user: "Alice",
    content: "This is my first tweet on littleX!",
    likes: 0,
    comments: [],
  },
  {
    user: "Bob",
    content: "Loving the simplicity of this platform.",
    likes: 2,
    comments: [],
  },
];

// Render tweets
const tweetsDiv = document.getElementById("tweets");
function renderTweets() {
  tweetsDiv.innerHTML = "";
  sampleTweets.forEach((tweet, index) => {
    const tweetDiv = document.createElement("div");
    tweetDiv.className = "tweet";
    tweetDiv.innerHTML = `
      <span class="user">${tweet.user}</span>
      <p class="content">${tweet.content}</p>
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
      <div class="comment-input" id="comment-input-${index}" style="display: none;">
        <input type="text" placeholder="Add a comment" class="comment-field" data-index="${index}" />
        <button class="add-comment-btn" data-index="${index}">Add</button>
      </div>
    `;
    tweetsDiv.appendChild(tweetDiv);
  });

  // Add event listeners for like and comment buttons
  document.querySelectorAll(".like-btn").forEach((button) => {
    button.addEventListener("click", handleLike);
  });

  document.querySelectorAll(".comment-btn").forEach((button) => {
    button.addEventListener("click", toggleCommentInput);
  });

  document.querySelectorAll(".add-comment-btn").forEach((button) => {
    button.addEventListener("click", addComment);
  });
}

// Handle like button
function handleLike(event) {
  const index = event.target.closest(".like-btn").dataset.index;
  sampleTweets[index].likes += 1;
  renderTweets();
}

// Toggle comment input visibility
function toggleCommentInput(event) {
  const index = event.target.dataset.index;
  const commentInput = document.getElementById(`comment-input-${index}`);
  commentInput.style.display =
    commentInput.style.display === "none" ? "block" : "none";
}

// Add comment
function addComment(event) {
  const index = event.target.dataset.index;
  const commentField = document.querySelector(
    `.comment-field[data-index="${index}"]`
  );
  const comment = commentField.value.trim();
  if (comment) {
    sampleTweets[index].comments.push({ user, content: comment });
    commentField.value = "";
    renderTweets();
  } else {
    alert("Comment cannot be empty");
  }
}

// Render initial sample tweets
renderTweets();

// Handle new tweet submission
document.getElementById("tweetForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const tweetContent = document.getElementById("tweetContent").value;
  if (tweetContent.trim()) {
    sampleTweets.unshift({
      user,
      content: tweetContent,
      likes: 0,
      comments: [],
    });
    renderTweets();
    document.getElementById("tweetContent").value = "";
  } else {
    alert("Tweet cannot be empty");
  }
});
