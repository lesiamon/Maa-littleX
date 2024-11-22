const token = localStorage.getItem("authToken");
if (!token) {
  window.location.href = "index.html";
}

const BASE_URL = "http://0.0.0.0:8000/walker";
const isProfilePage = window.location.pathname.includes("profile.html");

let currentUserProfile = null;

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  window.location.href = "index.html";
});

async function loadCurrentUserProfile() {
  try {
    const response = await fetch(`${BASE_URL}/get_profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) throw new Error("Failed to load profile");
    const data = await response.json();
    if (data.reports && data.reports.length > 0) {
      currentUserProfile = data.reports[0];
      const usernameElement = document.getElementById("username");
      if (usernameElement) {
        usernameElement.textContent =
          currentUserProfile.context.username || "Anonymous";
      }
      return currentUserProfile;
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    const usernameElement = document.getElementById("username");
    if (usernameElement) {
      usernameElement.textContent = "Anonymous";
    }
  }
}

async function loadProfilesToFollow() {
  try {
    const response = await fetch(`${BASE_URL}/load_user_profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) throw new Error("Failed to load profiles");
    const data = await response.json();

    if (data.reports && data.reports.length > 0) {
      const profiles = data.reports[0];
      const followListElement = document.getElementById("followList");
      followListElement.innerHTML = "";

      profiles.forEach((profile) => {
        if (
          currentUserProfile &&
          profile.name === currentUserProfile.context.username
        )
          return;

        const template = document.getElementById("profile-template");
        const profileElement = template.content.cloneNode(true);

        profileElement.querySelector(".profile-name").textContent =
          profile.name;
        const followBtn = profileElement.querySelector(".follow-btn");

        const isFollowing = currentUserProfile?.context.followees?.includes(
          profile.id
        );
        if (isFollowing) {
          followBtn.textContent = "Following";
          followBtn.classList.add("following");
        }

        followBtn.addEventListener("click", () =>
          handleFollow(profile.id, followBtn)
        );
        followListElement.appendChild(profileElement);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function handleFollow(profileId, button) {
  try {
    const response = await fetch(`${BASE_URL}/follow_request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ profile_id: profileId }),
    });

    if (!response.ok) throw new Error("Failed to follow user");

    if (button.classList.contains("following")) {
      button.textContent = "Follow";
      button.classList.remove("following");
    } else {
      button.textContent = "Following";
      button.classList.add("following");
    }

    await loadCurrentUserProfile();
  } catch (error) {
    console.error("Error:", error);
  }
}

function renderComment(commentData) {
  const template = document.getElementById("comment-template");
  const commentElement = template.content.cloneNode(true);

  commentElement.querySelector(".username").textContent =
    commentData.commenter || "Anonymous";
  commentElement.querySelector(".content").textContent =
    commentData.commnet.context.content;

  return commentElement;
}

function renderTweet(tweetData) {
  const tweet = tweetData.tweet;
  const comments = tweetData.comments || [];
  const likes = tweetData.likes || [];
  const likeCount = likes.length;
  const isLiked = likes.some(
    (like) => like.username === currentUserProfile?.context?.username
  );

  const template = document.getElementById("tweet-template");
  const tweetElement = template.content.cloneNode(true);

  const tweetHeader = tweetElement.querySelector(".tweet-header");
  if (tweetHeader) {
    tweetHeader.querySelector(".username").textContent = tweet.username;
  } else {
    tweetElement.querySelector(".username").textContent = tweet.username;
  }

  tweetElement.querySelector(".content").textContent =
    tweet.content.context.content;

  const likeBtn = tweetElement.querySelector(".like-btn");
  const likeIcon = likeBtn.querySelector(".material-icons");
  const countSpan = likeBtn.querySelector(".count");

  // Only show count if there are likes
  if (likeCount > 0) {
    countSpan.textContent = likeCount;
    likeIcon.textContent = isLiked ? "favorite" : "favorite_border";
    likeIcon.style.color = isLiked ? "red" : "";
  } else {
    countSpan.textContent = "";
    likeIcon.textContent = "favorite_border";
    likeIcon.style.color = "";
  }

  const commentBtn = tweetElement.querySelector(".comment-btn");
  const commentsSection = tweetElement.querySelector(".comments-section");
  commentBtn.querySelector(".count").textContent = comments.length;

  comments.forEach((comment) => {
    commentsSection.insertBefore(
      renderComment(comment),
      commentsSection.lastElementChild
    );
  });

  commentBtn.addEventListener("click", () => {
    commentsSection.style.display =
      commentsSection.style.display === "none" ? "block" : "none";
  });

  likeBtn.addEventListener("click", async () => {
    const icon = likeBtn.querySelector(".material-icons");
    const currentCount = parseInt(countSpan.textContent) || 0;

    if (icon.textContent === "favorite") {
      icon.textContent = "favorite_border";
      icon.style.color = "";
      countSpan.textContent = currentCount > 1 ? currentCount - 1 : "";
    } else {
      icon.textContent = "favorite";
      icon.style.color = "red";
      countSpan.textContent = currentCount + 1;
    }

    await handleLike(tweet.content.id);
  });

  const commentForm = tweetElement.querySelector(".comment-form");
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = e.target.querySelector("input").value;
    handleComment(tweet.content.id, content);
    e.target.reset();
  });

  return tweetElement;
}
function renderTweets(tweetsData) {
  const tweetsDiv = document.getElementById(
    isProfilePage ? "userTweets" : "tweets"
  );
  tweetsDiv.innerHTML = "";
  tweetsData.forEach((tweetData) => {
    tweetsDiv.appendChild(renderTweet(tweetData));
  });
}

if (!isProfilePage) {
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
}

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
  } catch (error) {
    console.error("Error:", error);
    // Reload tweets to revert UI if error occurs
    isProfilePage ? loadUserTweets() : loadTweets();
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
    isProfilePage ? loadUserTweets() : loadTweets();
  } catch (error) {
    console.error("Error:", error);
  }
}

async function loadTweets() {
  try {
    const response = await fetch(`${BASE_URL}/load_feed`, {
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

async function loadUserTweets() {
  try {
    const response = await fetch(`${BASE_URL}/load_tweets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tweet_info: {} }),
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

async function initializePage() {
  try {
    await loadCurrentUserProfile();
    if (isProfilePage) {
      await loadUserTweets();
    } else {
      await loadTweets();
      await loadProfilesToFollow();
    }
  } catch (error) {
    console.error("Page initialization error:", error);
  }
}

initializePage();
