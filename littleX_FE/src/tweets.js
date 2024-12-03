const token = localStorage.getItem("authToken");
if (!token) {
  window.location.href = "index.html";
}

const BASE_URL = `${Constants.API_URL}/walker`;

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
      if (!followListElement) return;

      followListElement.innerHTML = "";

      const profilesToShow = profiles.filter((profile) => {
        // Don't show current user
        if (currentUserProfile && profile.id === currentUserProfile.id) {
          return false;
        }
        return true;
      });

      if (profilesToShow.length === 0) {
        followListElement.innerHTML =
          '<div class="md-list-item">No new profiles to follow</div>';
        return;
      }

      profilesToShow.forEach((profile) => {
        const template = document.getElementById("profile-template");
        const profileElement = template.content.cloneNode(true);

        profileElement.querySelector(".profile-name").textContent =
          profile.name;

        const followBtn = profileElement.querySelector(".follow-btn");
        const isFollowing = currentUserProfile?.context?.followees?.includes(
          profile.id
        );

        if (isFollowing) {
          followBtn.textContent = "Following";
          followBtn.classList.add("following");
        } else {
          followBtn.textContent = "Follow";
        }

        followBtn.addEventListener("click", async () => {
          await handleFollow(profile.id, followBtn);
        });

        followListElement.appendChild(profileElement);
      });
    }
  } catch (error) {
    console.error("Error:", error);
    const followListElement = document.getElementById("followList");
    if (followListElement) {
      followListElement.innerHTML =
        '<div class="md-list-item">Error loading profiles</div>';
    }
  }
}

async function handleFollow(profileId, button) {
  try {
    const isFollowing = button.classList.contains("following");
    const endpoint = isFollowing ? "/un_follow_request" : "/follow_request";

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ profile_id: profileId }),
    });

    if (!response.ok)
      throw new Error(`Failed to ${isFollowing ? "unfollow" : "follow"} user`);

    if (isFollowing) {
      button.textContent = "Follow";
      button.classList.remove("following");
    } else {
      button.textContent = "Following";
      button.classList.add("following");
    }

    await loadCurrentUserProfile();

    if (isProfilePage) {
      await loadUserTweets();
    } else {
      await loadTweets();
    }

    await loadProfilesToFollow();
  } catch (error) {
    console.error("Error:", error);
  }
}

function renderComment(commentData) {
  const template = document.getElementById("comment-template");
  const commentElement = template.content.cloneNode(true);

  commentElement.querySelector(".username").textContent = commentData.commenter;
  commentElement.querySelector(".content").textContent =
    commentData.comment.context.content;

  return commentElement;
}
function renderComment(commentData) {
  const template = document.getElementById("comment-template");
  const commentElement = template.content.cloneNode(true);

  commentElement.querySelector(".username").textContent = commentData.commenter;
  commentElement.querySelector(".content").textContent =
    commentData.comment.context.content;

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

  tweetElement.querySelector(".username").textContent = tweet.username;
  tweetElement.querySelector(".content").textContent =
    tweet.content.context.content;

  // Handle delete button for profile page
  if (isProfilePage) {
    const deleteBtn = tweetElement.querySelector(".delete-btn");
    if (deleteBtn) {
      if (tweet.username === currentUserProfile?.context?.username) {
        deleteBtn.style.display = "inline-flex";
        deleteBtn.addEventListener("click", async () => {
          if (confirm("Are you sure you want to delete this tweet?")) {
            try {
              const response = await fetch(`${BASE_URL}/remove_tweet`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ tweet_id: tweet.content.id }),
              });
              if (!response.ok) throw new Error("Failed to delete tweet");
              loadUserTweets();
            } catch (error) {
              console.error("Error deleting tweet:", error);
            }
          }
        });
      } else {
        deleteBtn.style.display = "none";
      }
    }
  }

  // Like button setup
  const likeBtn = tweetElement.querySelector(".like-btn");
  const likeIcon = likeBtn.querySelector(".material-icons");
  const countSpan = likeBtn.querySelector(".count");

  if (likes.length > 0) {
    const tooltip = document.createElement("div");
    tooltip.className = "like-tooltip";
    const likesList = likes.map((like) => like.username).join(", ");
    tooltip.textContent = `Liked by ${likesList}`;
    likeBtn.appendChild(tooltip);
  }

  if (likeCount > 0) {
    countSpan.textContent = likeCount;
    likeIcon.textContent = isLiked ? "favorite" : "favorite_border";
    likeIcon.style.color = isLiked ? "red" : "";
  } else {
    countSpan.textContent = "";
    likeIcon.textContent = "favorite_border";
    likeIcon.style.color = "";
  }

  // Comments section setup
  const commentBtn = tweetElement.querySelector(".comment-btn");
  const commentsSection = tweetElement.querySelector(".comments-section");
  const commentForm = commentsSection.querySelector(".comment-form");
  commentBtn.querySelector(".count").textContent = comments.length;

  // Create comments container if it doesn't exist
  let allCommentsContainer = commentsSection.querySelector(
    ".comments-container"
  );
  if (!allCommentsContainer) {
    allCommentsContainer = document.createElement("div");
    allCommentsContainer.className = "comments-container";
    commentsSection.insertBefore(allCommentsContainer, commentForm);
  }

  if (comments.length > 0) {
    // Show first comment by default
    const firstComment = renderComment(comments[0]);
    allCommentsContainer.appendChild(firstComment);

    if (comments.length > 1) {
      const remainingComments = document.createElement("div");
      remainingComments.className = "remaining-comments";
      remainingComments.style.display = "none";

      comments.slice(1).forEach((comment) => {
        remainingComments.appendChild(renderComment(comment));
      });
      allCommentsContainer.appendChild(remainingComments);

      const showMoreBtn = document.createElement("button");
      showMoreBtn.className = "md-button md-button-text show-more-comments";
      showMoreBtn.textContent = `Show ${comments.length - 1} more comments`;
      allCommentsContainer.insertBefore(showMoreBtn, remainingComments);

      showMoreBtn.addEventListener("click", () => {
        const isShowing = remainingComments.style.display === "none";
        remainingComments.style.display = isShowing ? "block" : "none";
        showMoreBtn.textContent = isShowing
          ? "Hide comments"
          : `Show ${comments.length - 1} more comments`;
      });
    }
  }

  // Comment button toggles comment form and full comments section
  commentBtn.addEventListener("click", () => {
    if (
      commentsSection.style.display === "none" ||
      !commentsSection.style.display
    ) {
      commentsSection.style.display = "block";
    } else {
      commentsSection.style.display = "none";
    }
  });

  // Comment form submission handler
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = e.target.querySelector("input").value;
    await handleComment(tweet.content.id, content);
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
    if (tweetData.tweet && tweetData.tweet.username) {
      tweetsDiv.appendChild(renderTweet(tweetData));
    }
  });
}
function handleSearch(searchQuery) {
  return fetch(`${BASE_URL}/load_feed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ search_query: searchQuery }),
  });
}

async function processSearchResponse(response) {
  if (!response.ok) throw new Error("Failed to search tweets");
  const data = await response.json();
  if (data.reports && data.reports.length > 0) {
    const summaryElement = document.getElementById("feed-summary");
    if (summaryElement) {
      summaryElement.textContent = data.reports[0].summary;
    }
    renderTweets(data.reports[0].feeds);
  }
}

const navSearchForm = document.getElementById("navSearchForm");
const contentSearchForm = document.getElementById("searchForm");

if (navSearchForm) {
  navSearchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searchQuery = document.getElementById("navSearchQuery").value.trim();
    if (!searchQuery) return;

    try {
      const response = await handleSearch(searchQuery);
      await processSearchResponse(response);
      document.getElementById("navSearchQuery").value = "";
      document.getElementById("searchQuery").value = "";
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

if (contentSearchForm) {
  contentSearchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searchQuery = document.getElementById("searchQuery").value.trim();
    if (!searchQuery) return;

    try {
      const response = await handleSearch(searchQuery);
      await processSearchResponse(response);
      document.getElementById("navSearchQuery").value = "";
      document.getElementById("searchQuery").value = "";
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

const navSearchInput = document.getElementById("navSearchQuery");
const contentSearchInput = document.getElementById("searchQuery");

if (navSearchInput && contentSearchInput) {
  navSearchInput.addEventListener("input", (e) => {
    contentSearchInput.value = e.target.value;
  });

  contentSearchInput.addEventListener("input", (e) => {
    navSearchInput.value = e.target.value;
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
      const summaryElement = document.getElementById("feed-summary");
      if (summaryElement) {
        summaryElement.textContent = data.reports[0].summary;
      }
      renderTweets(data.reports[0].feeds);
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
      body: JSON.stringify({
        if_report: true,
        tweets: ["string"],
      }),
    });
    if (!response.ok) throw new Error("Failed to load tweets");
    const data = await response.json();
    if (data.reports && data.reports.length > 0) {
      const tweets = data.reports.flatMap((report) => report.slice(1));
      renderTweets(tweets);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function handleDelete(tweetId) {
  try {
    const response = await fetch(`${BASE_URL}/remove_tweet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tweet_id: tweetId }),
    });

    if (!response.ok) throw new Error("Failed to delete tweet");
    return true;
  } catch (error) {
    console.error("Error deleting tweet:", error);
    return false;
  }
}

async function loadFollowingUsers() {
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
      const followingListElement = document.getElementById("followingList");
      if (!followingListElement) return;

      followingListElement.innerHTML = "";

      const followingUsers = profiles.filter((profile) =>
        currentUserProfile?.context.followees?.includes(profile.id)
      );

      if (followingUsers.length === 0) {
        const noFollowingMsg = document.createElement("div");
        noFollowingMsg.className = "md-list-item";
        noFollowingMsg.textContent = "You're not following anyone yet";
        followingListElement.appendChild(noFollowingMsg);
        return;
      }

      followingUsers.forEach((profile) => {
        const template = document.getElementById("following-template");
        if (!template) return;

        const profileElement = template.content.cloneNode(true);
        profileElement.querySelector(".profile-name").textContent =
          profile.name;
        followingListElement.appendChild(profileElement);
      });
    }
  } catch (error) {
    console.error("Error loading following users:", error);
    const followingListElement = document.getElementById("followingList");
    if (followingListElement) {
      followingListElement.innerHTML =
        '<div class="md-list-item">Error loading following users</div>';
    }
  }
}

let lastScrollPosition = 0;

function saveScrollPosition() {
  const tweetsContainer = document.querySelector(".scrollable-tweets");
  if (tweetsContainer) {
    lastScrollPosition = tweetsContainer.scrollTop;
  }
}

function restoreScrollPosition() {
  const tweetsContainer = document.querySelector(".scrollable-tweets");
  if (tweetsContainer) {
    tweetsContainer.scrollTop = lastScrollPosition;
  }
}

document.querySelector(".scrollable-tweets")?.addEventListener("scroll", () => {
  saveScrollPosition();
});

async function initializePage() {
  try {
    await loadCurrentUserProfile();
    if (isProfilePage) {
      await loadUserTweets();
      await loadFollowingUsers();
    } else {
      await loadTweets();
      await loadProfilesToFollow();
    }
    restoreScrollPosition();
  } catch (error) {
    console.error("Page initialization error:", error);
  }
}

function handleResize() {
  const searchFormCard = document.querySelector(".search-form-card");
  const navSearchForm = document.querySelector(".nav-search-form");

  if (window.innerWidth <= 960) {
    searchFormCard?.style.setProperty("display", "block", "important");
    navSearchForm?.style.setProperty("display", "none", "important");
  } else {
    searchFormCard?.style.setProperty("display", "none", "important");
    navSearchForm?.style.setProperty("display", "flex", "important");
  }
}

window.addEventListener("resize", handleResize);

handleResize();

initializePage();
