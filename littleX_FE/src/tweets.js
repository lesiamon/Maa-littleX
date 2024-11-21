const token = localStorage.getItem("authToken");
if (!token) {
  window.location.href = "index.html";
}

const BASE_URL = "http://0.0.0.0:8000/walker";

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  window.location.href = "index.html";
});

function renderComment(comment) {
  const template = document.getElementById("comment-template");
  const commentElement = template.content.cloneNode(true);

  commentElement.querySelector(".username").textContent =
    comment.context.username || "Anonymous";
  commentElement.querySelector(".content").textContent =
    comment.context.content;

  return commentElement;
}

function renderTweet(tweetData) {
  const tweet = tweetData.tweet;
  const comments = tweetData.comments;
  const likes = tweetData.likes.context.likes;
  const likeCount = likes ? likes.length : 0;

  const template = document.getElementById("tweet-template");
  const tweetElement = template.content.cloneNode(true);

  tweetElement.querySelector(".username").textContent =
    tweet.context.username || "Anonymous";
  tweetElement.querySelector(".content").textContent = tweet.context.content;
  tweetElement.querySelector(".like-btn .count").textContent = likeCount;
  tweetElement.querySelector(".comment-btn .count").textContent =
    comments.length;

  const commentsSection = tweetElement.querySelector(".comments-section");
  comments.forEach((comment) => {
    commentsSection.insertBefore(
      renderComment(comment),
      commentsSection.lastElementChild
    );
  });

  const commentBtn = tweetElement.querySelector(".comment-btn");
  commentBtn.addEventListener("click", () => {
    commentsSection.style.display =
      commentsSection.style.display === "none" ? "block" : "none";
  });

  const likeBtn = tweetElement.querySelector(".like-btn");
  likeBtn.addEventListener("click", () => handleLike(tweet.id));

  const commentForm = tweetElement.querySelector(".comment-form");
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = e.target.querySelector("input").value;
    handleComment(tweet.id, content);
    e.target.reset();
  });

  return tweetElement;
}

function renderTweets(tweetsData) {
  const tweetsDiv = document.getElementById("tweets");
  tweetsDiv.innerHTML = "";
  tweetsData.forEach((tweetData) => {
    tweetsDiv.appendChild(renderTweet(tweetData));
  });
}

document
  .getElementById("tweetForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const content = document.getElementById("tweetContent").value.trim();
    if (!content) return;

    try {
      const response = await fetch(`${BASE_URL}/create_tweet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to create tweet");
      document.getElementById("tweetContent").value = "";
      loadTweets();
    } catch (error) {
      console.error("Error:", error);
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
    loadTweets();
  } catch (error) {
    console.error("Error:", error);
  }
}

async function handleComment(tweetId, content) {
  try {
    const response = await fetch(`${BASE_URL}/comment_tweet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tweet_id: tweetId, content }),
    });
    if (!response.ok) throw new Error("Failed to add comment");
    loadTweets();
  } catch (error) {
    console.error("Error:", error);
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
      body: JSON.stringify({}),
    });
    if (!response.ok) throw new Error("Failed to load tweets");
    const data = await response.json();
    if (data.reports && data.reports.length > 0) {
      renderTweets(data.reports);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

loadTweets();
