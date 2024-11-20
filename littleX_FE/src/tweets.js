const token = localStorage.getItem("authToken");
if (!token) {
  window.location.href = "index.html";
}

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  window.location.href = "index.html";
});

const BASE_URL = "http://0.0.0.0:8000/walker";

function renderTweet(tweet) {
  const tweetDiv = document.createElement("div");
  tweetDiv.className = "tweet";
  tweetDiv.innerHTML = `
    <p class="content">${tweet.content}</p>
    <div class="tweet-actions">
      <button class="like-btn" data-id="${tweet.id}">
        <i class="fas fa-heart"></i> Like
      </button>
      <button class="comment-btn" data-id="${tweet.id}">Comment</button>
    </div>
    <div class="comments" id="comments-${tweet.id}"></div>
  `;

  const likeBtn = tweetDiv.querySelector(".like-btn");
  likeBtn.addEventListener("click", () => handleLike(tweet.id));

  const commentBtn = tweetDiv.querySelector(".comment-btn");
  commentBtn.addEventListener("click", () => showCommentForm(tweet.id));

  return tweetDiv;
}

function renderTweets(tweets) {
  const tweetsDiv = document.getElementById("tweets");
  tweetsDiv.innerHTML = "";
  tweets.forEach((tweet) => {
    tweetsDiv.appendChild(renderTweet(tweet));
  });
}

document
  .getElementById("tweetForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const tweetContent = document.getElementById("tweetContent").value.trim();
    if (tweetContent) {
      try {
        const response = await fetch(`${BASE_URL}/create_tweet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: tweetContent }),
        });
        if (!response.ok) throw new Error("Failed to create tweet");
        document.getElementById("tweetContent").value = "";
        loadTweets();
        alert("Tweet created successfully!");
      } catch (error) {
        console.error("Error creating tweet:", error);
        alert("Failed to create tweet. Please try again.");
      }
    } else {
      alert("Tweet content cannot be empty");
    }
  });

async function handleLike(tweetId) {
  try {
    const response = await fetch(`${BASE_URL}/like_tweet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tweet_id: tweetId }),
    });
    if (!response.ok) throw new Error("Failed to like tweet");
    alert("Tweet liked successfully!");
    loadTweets();
  } catch (error) {
    console.error("Error liking tweet:", error);
    alert("Failed to like tweet. Please try again.");
  }
}

function showCommentForm(tweetId) {
  const commentForm = document.createElement("form");
  commentForm.innerHTML = `
    <input type="text" placeholder="Add a comment" required>
    <button type="submit">Submit</button>
  `;
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = e.target.querySelector("input").value;
    handleComment(tweetId, content);
  });
  const commentsDiv = document.getElementById(`comments-${tweetId}`);
  commentsDiv.appendChild(commentForm);
}

async function handleComment(tweetId, content) {
  try {
    const response = await fetch(`${BASE_URL}/comment_tweet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tweet_id: tweetId, content: content }),
    });
    if (!response.ok) throw new Error("Failed to add comment");
    alert("Comment added successfully!");
    loadTweets();
  } catch (error) {
    console.error("Error adding comment:", error);
    alert("Failed to add comment. Please try again.");
  }
}

async function loadTweets() {
  try {
    const response = await fetch(`${BASE_URL}/load_tweets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to load tweets");
    const data = await response.json();
    if (data.reports && data.reports.length > 0) {
      const tweets = data.reports.map((report) => ({
        id: report.id,
        ...report.context,
      }));
      renderTweets(tweets);
    } else {
      document.getElementById("tweets").innerHTML = "<p>No tweets found.</p>";
    }
  } catch (error) {
    console.error("Error loading tweets:", error);
    alert("Failed to load tweets. Please try again.");
  }
}

loadTweets();
